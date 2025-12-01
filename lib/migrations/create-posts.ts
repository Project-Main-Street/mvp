import postgres from 'postgres';

export async function runPostsMigration() {
  // Initialize postgres connection inside function to ensure env vars are loaded
  const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
  
  try {
    console.log('Creating posts table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        author TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Creating indexes...');
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts("createdAt" DESC)
    `;

    console.log('✅ Posts table created successfully');
    
    // Close the connection
    await sql.end();
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating posts table:', error);
    await sql.end();
    throw error;
  }
}
