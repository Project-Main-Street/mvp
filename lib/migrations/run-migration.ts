#!/usr/bin/env node

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { runPostsMigration } from './create-posts.js';

async function main() {
  try {
    console.log('Running posts table migration...\n');
    await runPostsMigration();
    console.log('\n✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
