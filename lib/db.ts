import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

interface Post {
  id: number;
  author: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  comments?: Comment[];
  totalVotes?: number;
  voteScore?: number;
  upvotes?: number;
  downvotes?: number;
  userVote?: -1 | 0 | 1;
  commentCount?: number;
}

interface Comment {
  id: number;
  author: string;
  authorName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  voteScore?: number;
  userVote?: -1 | 0 | 1;
}

export async function getPosts(): Promise<Post[]> {
  const posts = await sql`
    SELECT 
      p.id, 
      p.author, 
      u.name as "authorName",
      p.title, 
      p.content, 
      p."createdAt", 
      p."updatedAt",
      COALESCE((SELECT SUM(valence) FROM votes WHERE post = p.id), 0)::int as "voteScore",
      COALESCE((SELECT COUNT(*) FROM comments WHERE post = p.id), 0)::int as "commentCount"
    FROM posts p
    LEFT JOIN neon_auth.users_sync u ON p.author = u.id
    ORDER BY p."createdAt" DESC
  `;
  return posts as unknown as Post[];
}

export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
  const posts = await sql`
    SELECT id, author, title, content, "createdAt", "updatedAt"
    FROM posts
    WHERE author = ${authorId}
    ORDER BY "createdAt" DESC
  `;
  return posts as unknown as Post[];
}

export async function getPostById(id: string, userId?: string): Promise<Post | undefined> {
  const post = await sql`
    SELECT 
      p.id, 
      p.author, 
      u.name as "authorName",
      p.title, 
      p.content, 
      p."createdAt", 
      p."updatedAt",
      COALESCE(COUNT(v.id), 0)::int as "totalVotes",
      COALESCE(SUM(v.valence), 0)::int as "voteScore",
      COALESCE(SUM(CASE WHEN v.valence = 1 THEN 1 ELSE 0 END), 0)::int as upvotes,
      COALESCE(SUM(CASE WHEN v.valence = -1 THEN 1 ELSE 0 END), 0)::int as downvotes
    FROM posts p
    LEFT JOIN neon_auth.users_sync u ON p.author = u.id
    LEFT JOIN votes v ON v.post = p.id
    WHERE p.id = ${id}
    GROUP BY p.id, p.author, u.name, p.title, p.content, p."createdAt", p."updatedAt"
    LIMIT 1
  `;
  
  if (!post[0]) {
    return undefined;
  }
  
  // Get user's vote if userId is provided
  let userVote: -1 | 0 | 1 = 0;
  if (userId) {
    userVote = await getUserVoteOnPost(userId, parseInt(id));
  }
  
  // Fetch comments for this post
  const comments = await sql`
    SELECT 
      c.id,
      c.author,
      u.name as "authorName",
      c.content,
      c."createdAt",
      c."updatedAt",
      COALESCE((SELECT SUM(valence) FROM votes WHERE comment = c.id), 0)::int as "voteScore"
    FROM comments c
    LEFT JOIN neon_auth.users_sync u ON c.author = u.id
    WHERE c.post = ${id}
    ORDER BY c."createdAt" ASC
  `;
  
  // Add user votes for each comment if userId is provided
  const commentsWithUserVotes = userId ? await Promise.all(
    comments.map(async (comment: any) => ({
      ...comment,
      userVote: await getUserVoteOnComment(userId, comment.id)
    }))
  ) : comments;
  
  return {
    ...post[0],
    userVote,
    comments: commentsWithUserVotes as unknown as Comment[]
  } as Post;
}

export async function createPost(authorId: string, title: string, content: string): Promise<Post> {
  const post = await sql`
    INSERT INTO posts (author, title, content)
    VALUES (${authorId}, ${title}, ${content})
    RETURNING id, author, title, content, "createdAt", "updatedAt"
  `;
  return post[0] as Post;
}

export async function createComment(authorId: string, postId: number, content: string): Promise<Comment> {
  const comment = await sql`
    INSERT INTO comments (author, post, content)
    VALUES (${authorId}, ${postId}, ${content})
    RETURNING id, author, post, content, "createdAt", "updatedAt"
  `;
  return comment[0] as Comment;
}

export async function upsertVote(
  voterId: string, 
  valence: -1 | 1, 
  postId?: number, 
  commentId?: number
): Promise<{ success: boolean }> {
  try {
    if (postId) {
      // Check if vote exists for this post
      const existing = await sql`
        SELECT id FROM votes
        WHERE voter = ${voterId} AND post = ${postId}
        LIMIT 1
      `;
      
      if (existing.length > 0) {
        // Update existing vote
        await sql`
          UPDATE votes
          SET valence = ${valence}, "updatedAt" = CURRENT_TIMESTAMP
          WHERE voter = ${voterId} AND post = ${postId}
        `;
      } else {
        // Insert new vote
        await sql`
          INSERT INTO votes (voter, valence, post, comment)
          VALUES (${voterId}, ${valence}, ${postId}, null)
        `;
      }
    } else if (commentId) {
      // Check if vote exists for this comment
      const existing = await sql`
        SELECT id FROM votes
        WHERE voter = ${voterId} AND comment = ${commentId}
        LIMIT 1
      `;
      
      if (existing.length > 0) {
        // Update existing vote
        await sql`
          UPDATE votes
          SET valence = ${valence}, "updatedAt" = CURRENT_TIMESTAMP
          WHERE voter = ${voterId} AND comment = ${commentId}
        `;
      } else {
        // Insert new vote
        await sql`
          INSERT INTO votes (voter, valence, post, comment)
          VALUES (${voterId}, ${valence}, null, ${commentId})
        `;
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error upserting vote:', error);
    throw error;
  }
}

export async function getUserVoteOnPost(voterId: string, postId: number): Promise<-1 | 0 | 1> {
  const result = await sql`
    SELECT valence
    FROM votes
    WHERE voter = ${voterId} AND post = ${postId}
    LIMIT 1
  `;
  
  return result[0]?.valence ?? 0;
}

export async function getUserVoteOnComment(voterId: string, commentId: number): Promise<-1 | 0 | 1> {
  const result = await sql`
    SELECT valence
    FROM votes
    WHERE voter = ${voterId} AND comment = ${commentId}
    LIMIT 1
  `;
  
  return result[0]?.valence ?? 0;
}