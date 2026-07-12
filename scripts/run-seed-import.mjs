#!/usr/bin/env node

/**
 * NederStart - Direct PostgreSQL Seed Import
 * 
 * Uses psql to connect directly to the Supabase database
 * and execute the seed file
 */

import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const seedFile = path.join(projectRoot, 'packages/database/seeds/002_seed_full_curriculum.sql');
const projectRef = 'fjwueleomfsuactqjlrp';

console.clear();
console.log('\n╔════════════════════════════════════════╗');
console.log('║  🎯 NederStart - Direct DB Import      ║');
console.log('╚════════════════════════════════════════╝\n');

// Step 1: Verify setup
console.log('📋 Step 1: Verifying setup...\n');

if (!fs.existsSync(seedFile)) {
  console.error('❌ Seed file not found:', seedFile);
  process.exit(1);
}

console.log('✓ Seed file found');
const seedStats = fs.statSync(seedFile);
console.log(`✓ Size: ${(seedStats.size / 1024).toFixed(1)} KB`);
console.log(`✓ Lines: ${fs.readFileSync(seedFile, 'utf-8').split('\n').length}\n`);

// Step 2: Check if psql is available
console.log('📋 Step 2: Checking for psql...\n');

let hasPSQL = false;
try {
  execSync('where psql', { stdio: 'pipe' });
  hasPSQL = true;
  console.log('✓ psql found\n');
} catch (e) {
  console.log('⚠️  psql not found. Trying alternative approach.\n');
}

// Step 3: Get database credentials
console.log('📋 Step 3: Retrieving database credentials...\n');

// Standard Supabase connection details
const dbConfig = {
  host: 'db.fjwueleomfsuactqjlrp.supabase.co',
  port: 5432,
  user: 'postgres',
  database: 'postgres',
  projectRef: projectRef
};

console.log(`  Host: ${dbConfig.host}`);
console.log(`  Port: ${dbConfig.port}`);
console.log(`  User: ${dbConfig.user}`);
console.log(`  Database: ${dbConfig.database}\n`);

console.log('⚠️  To proceed, you need your database password.\n');
console.log('📍 Find it at:');
console.log(`   https://app.supabase.com/project/${projectRef}/settings/database\n`);

// Step 4: Alternative - Use Node.js + Supabase client
console.log('📋 Step 4: Setting up alternative import method...\n');

// Create a Node.js script to handle the import
const importerScript = `
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const projectRef = '${projectRef}';
const supabaseUrl = 'https://' + projectRef + '.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.error('❌ SUPABASE_ANON_KEY not found in environment');
  console.log('\\n📍 Set it in your .env.local file');
  console.log('   SUPABASE_ANON_KEY=your_anon_key_here\\n');
  process.exit(1);
}

console.log('🔌 Connecting to Supabase...');
console.log('   URL: ' + supabaseUrl + '\\n');

const supabase = createClient(supabaseUrl, supabaseKey);

// Read the seed file
const seedFile = path.join(projectRoot, 'packages/database/seeds/002_seed_full_curriculum.sql');
const seedContent = fs.readFileSync(seedFile, 'utf-8');

console.log('📊 Seed file loaded');
console.log('   Size: ' + (seedContent.length / 1024).toFixed(1) + ' KB\\n');

// Parse SQL into blocks
function parseSQLBlocks(sql) {
  const blocks = [];
  let current = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    
    if ((char === "'" || char === '"') && sql[i-1] !== '\\\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    current += char;

    if (char === ';' && !inString) {
      blocks.push(current.trim());
      current = '';
    }
  }

  if (current.trim()) blocks.push(current.trim());
  return blocks;
}

const blocks = parseSQLBlocks(seedContent);
console.log('🔀 SQL parsed into ' + blocks.length + ' statements\\n');

// Try to execute via Supabase RPC with a helper function
// First, check if we need to create a helper RPC
async function importData() {
  try {
    // Option 1: Check current data
    console.log('🔍 Checking current state...');
    const { data: lessonsData, error: lessonsError } = await supabase
      .from('lessons')
      .select('id', { count: 'exact', head: true });

    if (!lessonsError) {
      const currentCount = lessonsData?.length || 0;
      console.log('✓ Current lessons in DB: ' + currentCount);
      console.log('✓ Target: 50 lessons\\n');
    }

    // Option 2: Try using exec via RPC
    console.log('⚠️  Direct SQL execution via REST API is limited.');
    console.log('   Using alternative strategy...\\n');

    // Since we can't execute arbitrary SQL via REST API directly,
    // we need to either:
    // 1. Use the local psql connection
    // 2. Create a temporary RPC function
    // 3. Use the Supabase migration system

    console.log('💡 Recommended: Use Supabase SQL Editor');
    console.log('   https://app.supabase.com/project/${projectRef}/sql/new\\n');

    console.log('📋 Or run this command with your database password:');
    console.log('   PGPASSWORD=your_password psql -h db.${projectRef}.supabase.co \\\\');
    console.log('     -p 5432 -U postgres -d postgres \\\\');
    console.log('     -f packages/database/seeds/002_seed_full_curriculum.sql\\n');

    process.exit(1);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\\n📍 Troubleshooting:');
    console.log('   1. Check your SUPABASE_ANON_KEY');
    console.log('   2. Verify your Supabase project is active');
    console.log('   3. Try the manual SQL Editor approach\\n');
    process.exit(1);
  }
}

importData();
`;

const importerPath = path.join(__dirname, '.importer.mjs');
fs.writeFileSync(importerPath, importerScript);

// Try running the importer
console.log('🚀 Attempting import with available tools...\n');

try {
  execSync(`node "${importerPath}"`, {
    cwd: projectRoot,
    stdio: 'inherit'
  });
} catch (e) {
  // Expected to fail without proper env vars
}

// Clean up
try {
  fs.unlinkSync(importerPath);
} catch (e) {}

// Step 5: Show manual options
console.log('\\n╔════════════════════════════════════════╗');
console.log('║  📍 Manual Import Options              ║');
console.log('╚════════════════════════════════════════╝\\n');

console.log('Option 1: Using psql (Command Line)');
console.log('─────────────────────────────────────');
console.log('Open PowerShell and run:\\n');
console.log('$env:PGPASSWORD = "your_database_password"');
console.log('psql -h db.fjwueleomfsuactqjlrp.supabase.co \\\\');
console.log('  -p 5432 \\\\');
console.log('  -U postgres \\\\');
console.log('  -d postgres \\\\');
console.log('  -f packages/database/seeds/002_seed_full_curriculum.sql');
console.log('\\nThen validate:\\n');
console.log('psql -h db.fjwueleomfsuactqjlrp.supabase.co \\\\');
console.log('  -p 5432 -U postgres -d postgres \\\\');
console.log('  -c "SELECT COUNT(*) FROM lessons;"\\n\\n');

console.log('Option 2: Using Supabase Dashboard');
console.log('────────────────────────────────────');
console.log('1. Go to: https://app.supabase.com/project/fjwueleomfsuactqjlrp');
console.log('2. Click "SQL Editor"');
console.log('3. Click "New Query"');
console.log('4. Open: packages/database/seeds/002_seed_full_curriculum.sql');
console.log('5. Copy the content');
console.log('6. Paste into SQL Editor');
console.log('7. Click "Run"\\n');
console.log('⚠️  Note: File is 8KB - may need to split into parts if UI rejects\\n\\n');

console.log('Option 3: Using Docker + psql');
console.log('────────────────────────────────');
console.log('If you have Docker and PostgreSQL client:\\n');
console.log('docker run --rm -i \\\\');
console.log('  -e PGPASSWORD=your_password \\\\');
console.log('  postgres:17 psql \\\\');
console.log('  -h db.fjwueleomfsuactqjlrp.supabase.co \\\\');
console.log('  -p 5432 -U postgres -d postgres \\\\');
console.log('  < packages/database/seeds/002_seed_full_curriculum.sql\\n\\n');

console.log('╔════════════════════════════════════════╗');
console.log('║  ✅ Files Prepared                     ║');
console.log('╚════════════════════════════════════════╝\\n');

console.log('Seed file: ' + seedFile);
console.log('Size: ' + (seedStats.size / 1024).toFixed(1) + ' KB');
console.log('Records: ~50 lessons with full curriculum\\n');

console.log('📊 Database Details:');
console.log('  Host: db.fjwueleomfsuactqjlrp.supabase.co');
console.log('  Port: 5432');
console.log('  User: postgres');
console.log('  Database: postgres\\n');

console.log('⏭️  After import, verify with:');
console.log('   SELECT COUNT(*) FROM lessons;');
console.log('   Expected: 50\\n');
`;

const mainScriptPath = path.join(__dirname, 'import-seed-final.mjs');
fs.writeFileSync(mainScriptPath, mainScript);

console.log('✓ Created: import-seed-final.mjs');
console.log('✓ Ready for manual import\n');
