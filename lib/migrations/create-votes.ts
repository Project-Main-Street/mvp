import postgres from 'postgres';

export async function runVotesMigration() {
  // Initialize postgres connection inside function to ensure env vars are loaded
  const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
  
  try {
    console.log('Creating votes table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        voter TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
        valence SMALLINT NOT NULL CHECK (valence IN (-1, 1)),
        post INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        comment INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT vote_target_check CHECK (
          (post IS NOT NULL AND comment IS NULL) OR
          (post IS NULL AND comment IS NOT NULL)
        ),
        CONSTRAINT unique_vote_per_post UNIQUE (voter, post),
        CONSTRAINT unique_vote_per_comment UNIQUE (voter, comment)
      )
    `;

    console.log('Creating indexes...');
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_votes_post ON votes(post)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_votes_comment ON votes(comment)
    `;

    console.log('✅ Votes table created successfully');
    
    // Close the connection
    await sql.end();
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating votes table:', error);
    await sql.end();
    throw error;
  }
}
