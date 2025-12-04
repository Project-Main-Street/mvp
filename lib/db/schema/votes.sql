-- Votes table for upvote/downvote functionality
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  voter TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  valence SMALLINT NOT NULL CHECK (valence IN (-1, 1)),
  post INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_vote_per_post UNIQUE (voter, post)
);

-- Indexes for efficient vote queries
CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter);
CREATE INDEX IF NOT EXISTS idx_votes_post ON votes(post);
