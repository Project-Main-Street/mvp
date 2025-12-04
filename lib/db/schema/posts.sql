-- Posts table (supports both top-level posts and threaded replies via parent column)
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  author TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  parent INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parent);
