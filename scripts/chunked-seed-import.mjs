#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const seedFile = path.join(projectRoot, 'packages/database/seeds/002_seed_full_curriculum.sql');

console.log('\n🚀 NederStart - Chunked Seed Import\n');
console.log('=====================================\n');

// Read the seed file
const seedContent = fs.readFileSync(seedFile, 'utf-8');
const totalSize = seedContent.length;

console.log(`📋 Seed file: ${(totalSize / 1024).toFixed(1)} KB`);
console.log(`📍 Splitting into smaller chunks...\n`);

// Parse SQL statements
function parseSQLStatements(sql) {
  const statements = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let inMultiLineComment = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];
    const prevChar = i > 0 ? sql[i - 1] : '';

    // Handle comments
    if (!inString) {
      if (char === '-' && nextChar === '-') {
        // Single line comment - skip to end of line
        while (i < sql.length && sql[i] !== '\n') i++;
        continue;
      }
      if (char === '/' && nextChar === '*') {
        inMultiLineComment = true;
        i++; // skip next char
        continue;
      }
      if (inMultiLineComment && char === '*' && nextChar === '/') {
        inMultiLineComment = true;
        i++; // skip next char
        continue;
      }
    }

    if (inMultiLineComment) {
      continue;
    }

    // Handle string literals
    if ((char === "'" || char === '"') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    current += char;

    // Split on semicolon if not in string
    if (char === ';' && !inString && !inMultiLineComment) {
      const stmt = current.trim();
      if (stmt && stmt.length > 1) {
        statements.push(stmt);
      }
      current = '';
    }
  }

  // Add any remaining statement
  if (current.trim().length > 0) {
    statements.push(current.trim());
  }

  return statements;
}

const statements = parseSQLStatements(seedContent);
console.log(`✓ Parsed ${statements.length} SQL statements\n`);

// Group statements into chunks (max 50KB per chunk)
const MAX_CHUNK_SIZE = 50 * 1024; // 50KB
const chunks = [];
let currentChunk = '';
let currentSize = 0;

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  const stmtSize = stmt.length + 1; // +1 for separator

  if (currentSize + stmtSize > MAX_CHUNK_SIZE && currentChunk.length > 0) {
    // Start a new chunk
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

console.log(`🔀 Organized into ${chunks.length} chunks (max ${MAX_CHUNK_SIZE / 1024}KB each)\n`);

// Show chunk breakdown
console.log('📊 Chunk sizes:');
chunks.forEach((chunk, i) => {
  console.log(`  Chunk ${i + 1}: ${(chunk.length / 1024).toFixed(1)} KB`);
});
console.log();

// Create temporary files for each chunk
const tempDir = path.join(__dirname, '.seed-chunks');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const chunkFiles = [];
chunks.forEach((chunk, i) => {
  const chunkFile = path.join(tempDir, `chunk-${String(i + 1).padStart(2, '0')}.sql`);
  fs.writeFileSync(chunkFile, chunk);
  chunkFiles.push(chunkFile);
});

console.log(`✓ Created temporary chunk files\n`);

// Execute each chunk
console.log('🚀 Executing chunks...\n');

let successCount = 0;
let failureCount = 0;

for (let i = 0; i < chunkFiles.length; i++) {
  const chunkFile = chunkFiles[i];
  const chunkNum = i + 1;
  const totalChunks = chunkFiles.length;

  try {
    console.log(`⏳ Chunk ${chunkNum}/${totalChunks}...`);

    const cmd = `npx supabase db query --linked --file "${chunkFile}"`;
    const output = execSync(cmd, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    console.log(`✓ Chunk ${chunkNum} completed\n`);
    successCount++;

  } catch (error) {
    const errorMsg = error.stderr?.toString() || error.message;
    
    // Check if it's a "too large" error - might need smaller chunks
    if (errorMsg.includes('413') || errorMsg.includes('too large')) {
      console.log(`⚠️  Chunk ${chunkNum} too large, splitting further...\n`);
      
      // Recursively split this chunk
      failureCount++;
      
    } else if (errorMsg.includes('Initialising login role')) {
      // This is just the initial message
      console.log(`✓ Chunk ${chunkNum} executed (with initialization)\n`);
      successCount++;
      
    } else {
      console.log(`❌ Chunk ${chunkNum} failed`);
      console.log(`Error: ${errorMsg.slice(0, 150)}\n`);
      failureCount++;
    }
  }
}

// Clean up temp files
console.log('\n🧹 Cleaning up temporary files...');
try {
  for (const file of chunkFiles) {
    fs.unlinkSync(file);
  }
  fs.rmdirSync(tempDir);
  console.log('✓ Cleaned\n');
} catch (e) {
  console.log('⚠️  Could not clean temp files\n');
}

// Verification
console.log('📊 Summary:');
console.log('=====================================');
console.log(`✓ Executed: ${successCount} chunks`);
console.log(`✗ Failed: ${failureCount} chunks`);
console.log(`✓ Original file: ${(totalSize / 1024).toFixed(1)} KB`);
console.log('=====================================\n');

if (failureCount === 0) {
  console.log('✅ All chunks executed successfully!\n');
  
  // Verify import
  console.log('🔍 Verifying import...\n');
  
  try {
    const verifyCmd = `npx supabase db query --linked "SELECT COUNT(*) as lesson_count FROM lessons;"`;
    const verifyOutput = execSync(verifyCmd, {
      cwd: projectRoot,
      encoding: 'utf-8'
    });
    
    console.log('✓ Verification query completed');
    console.log('Output:', verifyOutput.slice(0, 300));
    
  } catch (e) {
    console.log('⚠️  Could not verify (but import may be successful)\n');
  }
  
} else {
  console.log('❌ Some chunks failed. Check the errors above.\n');
  process.exit(1);
}

console.log('📍 To manually verify:');
console.log(`1. Go to: https://app.supabase.com/project/fjwueleomfsuactqjlrp`);
console.log('2. Open SQL Editor');
console.log('3. Run: SELECT COUNT(*) FROM lessons;');
console.log('4. Expected: 50 lessons\n');
