import postgres from 'postgres';

export async function runDropCommentsAndAddParentMigration() {
  // Initialize postgres connection inside function to ensure env vars are loaded
  const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
  
  try {
    console.log('Starting migration: restructuring comments as threaded posts...');
    
    // Drop votes on comments first (foreign key constraint)
    console.log('Dropping votes on comments...');
    await sql`
      DELETE FROM votes WHERE comment IS NOT NULL
    `;
    
    // Drop the comments table
    console.log('Dropping comments table...');
    await sql`
      DROP TABLE IF EXISTS comments
    `;
    
    // Add parent column to posts table
    console.log('Adding parent column to posts table...');
    await sql`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS parent INTEGER REFERENCES posts(id) ON DELETE CASCADE
    `;
    
    // Create index on parent for efficient querying
    console.log('Creating index on parent column...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parent)
    `;
    
    // Update votes table to remove comment column and constraint
    console.log('Removing comment column from votes table...');
    await sql`
      ALTER TABLE votes DROP CONSTRAINT IF EXISTS vote_target_check
    `;
    
    await sql`
      ALTER TABLE votes DROP COLUMN IF EXISTS comment
    `;
    
    // Add back the constraint - now posts must be set (no more comment column)
    console.log('Adding updated constraint to votes table...');
    await sql`
      ALTER TABLE votes 
      ADD CONSTRAINT vote_target_check CHECK (post IS NOT NULL)
    `;
    
    // Remove the unique constraint on comment since column is gone
    await sql`
      ALTER TABLE votes DROP CONSTRAINT IF EXISTS unique_vote_per_comment
    `;

    console.log('✅ Migration completed successfully');
    console.log('   - Comments table dropped');
    console.log('   - Parent column added to posts table');
    console.log('   - Votes table updated to only reference posts');
    
    // Close the connection
    await sql.end();
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error running migration:', error);
    await sql.end();
    throw error;
  }
}
