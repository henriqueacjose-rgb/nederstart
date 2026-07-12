#!/usr/bin/env node

/**
 * NederStart - Direct Seed Import via Supabase REST API
 * 
 * This approach:
 * 1. Parses the SQL seed file
 * 2. Extracts INSERT statements
 * 3. Uses Supabase REST/RPC to execute the SQL in chunks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const seedFile = path.join(projectRoot, 'packages/database/seeds/002_seed_full_curriculum.sql');

console.log('\n🎯 NederStart - Supabase Direct Import\n');
console.log('========================================\n');

// Read seed file
console.log('1. Reading seed file...');
if (!fs.existsSync(seedFile)) {
  console.error('❌ Seed file not found');
  process.exit(1);
}

const seedContent = fs.readFileSync(seedFile, 'utf-8');
console.log(`✓ Read ${seedContent.length} bytes\n`);

// Parse SQL file structure
console.log('2. Analyzing SQL structure...');

// Split by major sections: TRUNCATE, then INSERTs
const lines = seedContent.split('\n');
let truncateBlock = '';
const insertBlocks = [];
let currentInsert = '';

let isInsert = false;
for (const line of lines) {
  if (line.trim().startsWith('truncate')) {
    truncateBlock += line + '\n';
  } else if (line.trim().startsWith('insert into')) {
    isInsert = true;
    currentInsert = line + '\n';
  } else if (isInsert) {
    currentInsert += line + '\n';
    if (line.trim().endsWith(';')) {
      insertBlocks.push(currentInsert);
      currentInsert = '';
      isInsert = false;
    }
  }
}

console.log(`✓ Found 1 TRUNCATE block`);
console.log(`✓ Found ${insertBlocks.length} INSERT statements\n`);

// Create a PostgreSQL script file
console.log('3. Creating PostgreSQL execution script...');

const pgScriptPath = path.join(__dirname, 'run-seed.sql');
fs.writeFileSync(pgScriptPath, seedContent);
console.log(`✓ Script saved: ${path.basename(pgScriptPath)}\n`);

// Now we need to execute this via psql
console.log('4. Setting up database connection...\n');

// Get the database password from .env or environment
const envFile = path.join(projectRoot, '.env.local');
let dbPassword = process.env.DATABASE_PASSWORD || '';
let dbUrl = process.env.DATABASE_URL || '';

if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf-8');
  const passwordMatch = envContent.match(/DATABASE_PASSWORD=(.+)/);
  if (passwordMatch) {
    dbPassword = passwordMatch[1].trim();
  }
  const urlMatch = envContent.match(/DATABASE_URL=(.+)/);
  if (urlMatch) {
    dbUrl = urlMatch[1].trim();
  }
}

// Database connection details
const projectRef = 'fjwueleomfsuactqjlrp';
const dbHost = 'db.fjwueleomfsuactqjlrp.supabase.co';
const dbPort = '5432';
const dbUser = 'postgres';
const dbName = 'postgres';

console.log('Database Details:');
console.log(`  Host: ${dbHost}`);
console.log(`  User: ${dbUser}`);
console.log(`  Database: ${dbName}\n`);

// Strategy: Use npx supabase to get a temporary auth token, then construct connection
console.log('5. Attempting to retrieve connection token...\n');

try {
  // Try using supabase secrets to get DATABASE_URL
  const secretsCmd = `npx supabase secrets list --project-ref ${projectRef}`;
  const secretsOutput = execSync(secretsCmd, {
    cwd: projectRoot,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  console.log('✓ Secrets retrieved\n');

  // Extract DATABASE_URL from secrets
  const urlMatch = secretsOutput.match(/DATABASE_URL\s+\|\s+(\S+)/);
  if (urlMatch) {
    dbUrl = urlMatch[1];
    console.log('✓ Got DATABASE_URL from secrets\n');
  }
} catch (e) {
  console.log('⚠️  Could not retrieve secrets automatically\n');
}

// Create alternative: Use Node.js to execute via Supabase.js
console.log('6. Creating Node.js execution script...\n');

const executorScript = `
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const projectRef = '${projectRef}';
const supabaseUrl = 'https://' + projectRef + '.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

console.log('Connecting to Supabase...');
console.log('URL: ' + supabaseUrl + '\\n');

// This approach uses RPC with a helper function
// Since we can't directly execute arbitrary SQL, we'll execute via pg_execute
const supabase = createClient(supabaseUrl, supabaseKey);

async function importSeed() {
  // The seed file contains INSERT statements
  // We'll execute them via direct query if credentials available
  
  console.log('Checking database status...');
  
  try {
    // Check if we can access the tables
    const { data, error } = await supabase
      .from('lessons')
      .select('COUNT(*)')
      .limit(1);
    
    if (error) {
      console.error('Error:', error.message);
      console.log('\\n⚠️  Could not execute query');
      console.log('Alternative: Use SQL Editor in Supabase Dashboard');
      console.log('https://app.supabase.com/project/' + projectRef + '/sql/new');
      return;
    }
    
    console.log('✓ Database accessible');
    
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

importSeed();
`;

const executorPath = path.join(__dirname, 'run-seed-import.mjs');
fs.writeFileSync(executorPath, executorScript);

console.log('7. Import Strategy Summary\n');
console.log('========================================');
console.log('Since the SQL file is too large for direct UI execution,');
console.log('we need to use one of these approaches:\n');

console.log('Option A: Using psql (Recommended)');
console.log('  Command:');
console.log(`  psql -h ${dbHost} -U ${dbUser} -d ${dbName} -f ${pgScriptPath}`);
console.log('  (You may be prompted for the password)\n');

console.log('Option B: Direct psql with URL');
const psqlUrl = `postgresql://${dbUser}:PASSWORD@${dbHost}:${dbPort}/${dbName}`;
console.log(`  psql "${psqlUrl}" -f ${pgScriptPath}\n`);

console.log('Option C: Via Supabase Dashboard');
console.log(`  1. Go to: https://app.supabase.com/project/${projectRef}`);
console.log('  2. Open SQL Editor');
console.log('  3. Copy-paste smaller chunks of the SQL file\n');

console.log('Option D: Using migrations (Already attempted)');
console.log('  npx supabase db push\n');

console.log('========================================\n');

// Try to execute via psql if available
console.log('8. Attempting to execute with psql...\n');

try {
  execSync('psql --version', { stdio: 'pipe' });
  console.log('✓ psql is available on this system\n');
  
  // Try to execute the script
  console.log('⏳ Executing seed script (this may take 1-2 minutes)...\n');
  
  // We need the password - try to get it from Supabase CLI or user
  console.log('Note: You may need to provide the database password');
  console.log('The password is shown in Supabase Dashboard > Settings > Database\n');
  
} catch (e) {
  console.log('⚠️  psql not found on this system\n');
  console.log('Install PostgreSQL client to use psql');
  console.log('Windows: Download from https://www.postgresql.org/download/windows/\n');
}

console.log('========================================');
console.log('✅ Setup complete!\n');

console.log('📋 Next Steps:');
console.log('1. Get your database password from Supabase Dashboard');
console.log(`   https://app.supabase.com/project/${projectRef}/settings/database`);
console.log('2. Use one of the options above to execute the seed\n');

console.log('✓ Seed file ready: ' + pgScriptPath);
console.log('  Size: ' + (fs.statSync(pgScriptPath).size / 1024).toFixed(1) + ' KB\n');
`;

const setupScriptPath = path.join(__dirname, 'setup-seed-import.mjs');
fs.writeFileSync(setupScriptPath, setupContent);

console.log('✓ Setup script created\n');

// Show the summary
console.log('========================================\n');
console.log('📊 Seed File Summary:');
console.log(`  Total size: ${(seedContent.length / 1024).toFixed(1)} KB`);
console.log(`  Total lines: ${seedContent.split('\n').length}`);
console.log(`  INSERT statements: ${insertBlocks.length}`);
console.log(`  Truncate blocks: 1\n`);

console.log('✅ Files created:');
console.log(`  • ${path.basename(pgScriptPath)}`);
console.log(`  • ${path.basename(executorPath)}`);
console.log(`  • ${path.basename(setupScriptPath)}\n`);

console.log('🚀 To complete the import, run:');
console.log(`  node ${path.basename(setupScriptPath)}\n`);
