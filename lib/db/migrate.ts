import postgres from 'postgres';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

/**
 * Run database migrations by executing SQL schema files
 */
export async function runMigrations() {
  const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
  
  try {
    console.log('Starting database migrations...');
    
    // Read and execute schema files in order
    const schemaDir = join(process.cwd(), 'lib', 'db', 'schema');
    
    // 1. Create posts table first (no dependencies)
    console.log('Creating posts table...');
    const postsSchema = await readFile(join(schemaDir, 'posts.sql'), 'utf-8');
    await sql.unsafe(postsSchema);
    console.log('✅ Posts table created');
    
    // 2. Create votes table (depends on posts)
    console.log('Creating votes table...');
    const votesSchema = await readFile(join(schemaDir, 'votes.sql'), 'utf-8');
    await sql.unsafe(votesSchema);
    console.log('✅ Votes table created');
    
    // 3. Create profiles table (depends on neon_auth.users_sync)
    console.log('Creating profiles table...');
    const profilesSchema = await readFile(join(schemaDir, 'profiles.sql'), 'utf-8');
    await sql.unsafe(profilesSchema);
    console.log('✅ Profiles table created');
    
    console.log('✅ All migrations completed successfully');
    
    await sql.end();
    return { success: true };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await sql.end();
    throw error;
  }
}

// Allow running directly: tsx lib/db/migrate.ts
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
