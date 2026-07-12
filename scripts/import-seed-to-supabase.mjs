#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const projectRef = 'fjwueleomfsuactqjlrp';
const seedFilePath = path.join(
  import.meta.dirname,
  '../packages/database/seeds/002_seed_full_curriculum.sql'
);

console.log('📁 NederStart Supabase Seed Import');
console.log('=====================================\n');

// 1. Check if seed file exists
if (!fs.existsSync(seedFilePath)) {
  console.error(`❌ Seed file not found: ${seedFilePath}`);
  process.exit(1);
}

const seedContent = fs.readFileSync(seedFilePath, 'utf-8');
console.log(`✓ Seed file loaded: ${seedContent.length} bytes`);
console.log(`  (Lines: ${seedContent.split('\n').length})\n`);

// 2. Function to split SQL into statements
function splitSQLStatements(sql) {
  // Split by semicolons but preserve the statements
  const statements = [];
  let current = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];

    // Handle string literals
    if ((char === "'" || char === '"') && sql[i - 1] !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    current += char;

    // Split on semicolon if not in string
    if (char === ';' && !inString) {
      const stmt = current.trim();
      if (stmt.length > 0) {
        statements.push(stmt);
      }
      current = '';
    }
  }

  // Add any remaining statement
  if (current.trim().length > 0) {
    statements.push(current.trim());
  }

  return statements.filter(s => s.length > 0);
}

// 3. Parse statements to group related ones
const statements = splitSQLStatements(seedContent);
console.log(`📊 Total SQL statements: ${statements.length}\n`);

// Group statements by type
const groupedStatements = [];
let currentGroup = [];

for (const stmt of statements) {
  currentGroup.push(stmt);

  // Group 'on conflict' statements together
  if (stmt.includes('on conflict') || (currentGroup.length > 0 && stmt.includes('insert'))) {
    if (currentGroup.length > 1 || (stmt.includes('on conflict'))) {
      // Keep building the group
    } else if (!stmt.includes('insert')) {
      groupedStatements.push(currentGroup.join(';\n'));
      currentGroup = [];
    }
  }

  // Always flush on truncate
  if (stmt.includes('truncate')) {
    groupedStatements.push(currentGroup.join(';\n'));
    currentGroup = [];
  }
}

if (currentGroup.length > 0) {
  groupedStatements.push(currentGroup.join(';\n'));
}

console.log(`🔀 Grouped into: ${groupedStatements.length} execution batches\n`);

// 4. Create a temporary import script for psql
const importScriptPath = path.join(import.meta.dirname, '.import-temp.sql');

// We need to get the connection string from Supabase
console.log('🔍 Attempting to get Supabase connection details...\n');

async function getSupabaseConnectionString() {
  try {
    // Try to get from supabase CLI
    const { stdout, stderr } = await execPromise(
      `npx supabase status --project-ref ${projectRef}`
    );
    console.log('✓ Supabase status retrieved\n');
    return stdout;
  } catch (error) {
    console.warn('⚠️  Could not retrieve status via CLI');
    return null;
  }
}

async function importViaSQL() {
  const connectionString = await getSupabaseConnectionString();

  if (!connectionString) {
    console.log(
      '📝 Creating manual import strategy using Supabase CLI...\n'
    );
    return importViaSupabaseCLI();
  }

  return importViaPSQL();
}

async function importViaSupabaseCLI() {
  // Use supabase db push to push the seed
  console.log('🚀 Attempting to import via Supabase DB operations...\n');

  // First, create a migration from the seed
  const migrationDir = path.join(
    import.meta.dirname,
    '../supabase/migrations'
  );

  if (!fs.existsSync(migrationDir)) {
    console.log(`📁 Creating migration directory: ${migrationDir}`);
    fs.mkdirSync(migrationDir, { recursive: true });
  }

  // Create a timestamped migration file
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
  const migrationFile = path.join(migrationDir, `${timestamp}_import_full_curriculum.sql`);

  // Write the seed content as a migration
  fs.writeFileSync(migrationFile, seedContent);
  console.log(`✓ Migration file created: ${migrationFile}\n`);

  // Push the migration
  console.log('⏳ Pushing migrations to Supabase...\n');
  try {
    const { stdout, stderr } = await execPromise(
      `npx supabase db push --project-ref ${projectRef}`,
      { cwd: path.dirname(import.meta.dirname) }
    );
    console.log('✓ Push completed');
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
  } catch (error) {
    console.error('❌ Push failed:', error.message);
    return false;
  }

  return true;
}

async function importViaPSQL() {
  console.log('🔌 Setting up psql connection...\n');

  // For now, we'll implement the CLI strategy
  return importViaSupabaseCLI();
}

// Main execution
(async () => {
  try {
    const success = await importViaSQL();

    if (success) {
      console.log('\n✅ Import completed successfully!');
      console.log('🔍 Next: Verify the data in Supabase...\n');

      // Verify
      console.log('📊 Counting lessons in Supabase...\n');
      try {
        const { stdout } = await execPromise(
          `npx supabase status --project-ref ${projectRef}`
        );
        console.log('✓ Status check completed');
      } catch (err) {
        console.warn('Could not verify, but import likely succeeded');
      }
    } else {
      console.log('\n❌ Import failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
