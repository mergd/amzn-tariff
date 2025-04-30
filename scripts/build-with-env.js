#!/usr/bin/env node
/**
 * Build script for Amazon Tariff Calculator that injects environment variables
 * into the config.ts file before building the extension.
 * 
 * Usage: node scripts/build-with-env.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import dotenv from 'dotenv';

// First try to load from .env.local, then fall back to .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Try to load from .env.local first
let localEnvPath = path.join(rootDir, '.env.local');
let envConfig = {};

if (fs.existsSync(localEnvPath)) {
  console.log('Loading environment variables from .env.local');
  envConfig = dotenv.parse(fs.readFileSync(localEnvPath));
} else {
  // Fall back to .env
  let envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    console.log('Loading environment variables from .env');
    envConfig = dotenv.parse(fs.readFileSync(envPath));
  } else {
    console.error('No .env or .env.local file found. Please create one based on .env.example');
    process.exit(1);
  }
}

// Also load process.env for any environment variables set on the command line
const allEnvVars = { ...process.env, ...envConfig };

// Check for required environment variables
const requiredEnvVars = [
  'OPENROUTER_API_KEY',
  'UPSTASH_REDIS_URL',
  'UPSTASH_REDIS_TOKEN'
];

const missingEnvVars = requiredEnvVars.filter(varName => !allEnvVars[varName]);

if (missingEnvVars.length > 0) {
  console.error('Error: Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  console.error('\nPlease create a .env or .env.local file with your API keys.');
  process.exit(1);
}

const configPath = path.join(rootDir, 'src', 'config.ts');

// Read the config file
let configContent = fs.readFileSync(configPath, 'utf8');

// Replace placeholders with actual environment variables
configContent = configContent.replace(
  /OPENROUTER_API_KEY: ".*?"/,
  `OPENROUTER_API_KEY: "${allEnvVars.OPENROUTER_API_KEY}"`
);

configContent = configContent.replace(
  /UPSTASH_REDIS_URL: ".*?"/,
  `UPSTASH_REDIS_URL: "${allEnvVars.UPSTASH_REDIS_URL}"`
);

configContent = configContent.replace(
  /UPSTASH_REDIS_TOKEN: ".*?"/,
  `UPSTASH_REDIS_TOKEN: "${allEnvVars.UPSTASH_REDIS_TOKEN}"`
);

// Write the updated config file
fs.writeFileSync(configPath, configContent);
console.log('✅ Environment variables injected into config.ts');

// Run the build command
console.log('🏗️ Building extension...');
const buildProcess = spawn('pnpm', ['run', 'build'], { 
  stdio: 'inherit',
  shell: true
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Extension built successfully!');
    console.log('\nTo load the extension in Chrome:');
    console.log('1. Go to chrome://extensions/');
    console.log('2. Enable "Developer mode"');
    console.log('3. Click "Load unpacked" and select the dist/ folder');
  } else {
    console.error(`❌ Build failed with code ${code}`);
  }
});