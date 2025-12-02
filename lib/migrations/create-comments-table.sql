-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  author TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  post INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on post for faster lookups
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post);

-- Create index on author for faster lookups
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author);

-- Create index on createdAt for sorting
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments("createdAt" DESC);