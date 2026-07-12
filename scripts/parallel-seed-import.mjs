#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const seedFile = path.join(projectRoot, 'packages/database/seeds/002_seed_full_curriculum.sql');

console.log('\n🚀 NederStart - Parallel Chunked Seed Import\n');

// Read the seed file
const seedContent = fs.readFileSync(seedFile, 'utf-8');
console.log(`📋 Seed file: ${(seedContent.length / 1024).toFixed(1)} KB`);

// Parse SQL statements
function parseSQLStatements(sql) {
  const statements = [];
  let current = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const prevChar = i > 0 ? sql[i - 1] : '';

    if ((char === "'" || char === '"') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    current += char;

    if (char === ';' && !inString) {
      const stmt = current.trim();
      if (stmt && stmt.length > 1) {
        statements.push(stmt);
      }
      current = '';
    }
  }

  return statements;
}

const statements = parseSQLStatements(seedContent);
console.log(`✓ Parsed ${statements.length} SQL statements\n`);

// Create chunks
const MAX_CHUNK_SIZE = 50 * 1024;
const chunks = [];
let currentChunk = '';
let currentSize = 0;

for (const stmt of statements) {
  const stmtSize = stmt.length + 1;

  if (currentSize + stmtSize > MAX_CHUNK_SIZE && currentChunk.length > 0) {
    chunks.push(currentChunk);
    currentChunk = stmt + ';\n';
    currentSize = stmtSize;
  } else {
    currentChunk += stmt + ';\n';
    currentSize += stmtSize;
  }
}

if (currentChunk.length > 0) {
  chunks.push(currentChunk);
}

console.log(`🔀 Split into ${chunks.length} chunks\n`);

// Save chunks to files
const tempDir = path.join(__dirname, '.seed-chunks');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const chunkFiles = chunks.map((chunk, i) => {
  const file = path.join(tempDir, `chunk-${String(i + 1).padStart(3, '0')}.sql`);
  fs.writeFileSync(file, chunk);
  return file;
});

console.log('🚀 Executing chunks (4 at a time)...\n');

// Execute in parallel (4 at a time)
const PARALLEL_LIMIT = 4;
let successCount = 0;
let failCount = 0;

async function executeChunk(file, index) {
  try {
    execSync(`npx supabase db query --linked --file "${file}"`, {
      cwd: projectRoot,
      stdio: 'pipe'
    });
    successCount++;
    const progress = ((successCount + failCount) / chunkFiles.length * 100).toFixed(0);
    console.log(`✓ [${progress}%] Chunk ${index + 1}/${chunkFiles.length}`);
    return true;
  } catch (e) {
    failCount++;
    console.log(`✗ Chunk ${index + 1} failed`);
    return false;
  }
}

async function runParallel() {
  for (let i = 0; i < chunkFiles.length; i += PARALLEL_LIMIT) {
    const batch = chunkFiles.slice(i, i + PARALLEL_LIMIT);
    await Promise.all(
      batch.map((file, idx) => executeChunk(file, i + idx))
    );
  }
}

runParallel().then(() => {
  console.log('\n' + '='.repeat(40));
  console.log(`✓ Complete: ${successCount} chunks`);
  console.log(`✗ Failed: ${failCount} chunks`);
  console.log('='.repeat(40) + '\n');

  // Clean up
  for (const file of chunkFiles) {
    fs.unlinkSync(file);
  }
  fs.rmdirSync(tempDir);

  if (failCount === 0) {
    console.log('✅ All chunks imported!\n');
    
    // Verify
    console.log('🔍 Verifying...\n');
    try {
      const result = execSync(
        `npx supabase db query --linked "SELECT COUNT(*) as count FROM lessons;"`,
        { cwd: projectRoot, encoding: 'utf-8' }
      );
      
      console.log('✓ Query result:');
      console.log(result);
      
      if (result.includes('50')) {
        console.log('\n🎉 SUCCESS! All 50 lessons imported!\n');
      }
    } catch (e) {
      console.log('Check Supabase dashboard for verification\n');
    }
  }
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
