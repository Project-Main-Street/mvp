import postgres from 'postgres';

export async function runCommentsMigration() {
  // Initialize postgres connection inside function to ensure env vars are loaded
  const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
  
  try {
    console.log('Creating comments table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        author TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
        post INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Creating indexes...');
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments("createdAt" DESC)
    `;

    console.log('✅ Comments table created successfully');
    
    // Close the connection
    await sql.end();
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating comments table:', error);
    await sql.end();
    throw error;
  }
}