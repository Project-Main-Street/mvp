-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  author TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on author for faster lookups
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author);

-- Create index on createdAt for sorting
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts("createdAt" DESC);
