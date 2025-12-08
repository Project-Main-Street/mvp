import postgres from 'postgres'

// Database connection singleton
export const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

// Type definitions
export interface Post {
  id: number;
  author: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  parent?: number;
  replies?: Post[];
  totalVotes?: number;
  voteScore?: number;
  upvotes?: number;
  downvotes?: number;
  userVote?: -1 | 0 | 1;
  commentCount?: number;
  depth?: number;
}

// Query functions
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
      COALESCE((SELECT COUNT(*) FROM posts WHERE parent = p.id), 0)::int as "commentCount"
    FROM posts p
    LEFT JOIN neon_auth.users_sync u ON p.author = u.id
    WHERE p.parent IS NULL
    ORDER BY p."createdAt" DESC
  `;
  return posts as unknown as Post[];
}

export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
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
      COALESCE((SELECT COUNT(*) FROM posts WHERE parent = p.id), 0)::int as "commentCount"
    FROM posts p
    LEFT JOIN neon_auth.users_sync u ON p.author = u.id
    WHERE p.author = ${authorId} AND p.parent IS NULL
    ORDER BY p."createdAt" DESC
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
  
  // Fetch entire thread tree using recursive CTE
  const thread = await sql`
    WITH RECURSIVE thread_tree AS (
      -- Base case: direct replies to the post
      SELECT 
        p.id,
        p.author,
        u.name as "authorName",
        p.title,
        p.content,
        p.parent,
        p."createdAt",
        p."updatedAt",
        COALESCE((SELECT SUM(valence) FROM votes WHERE post = p.id), 0)::int as "voteScore",
        1 as depth
      FROM posts p
      LEFT JOIN neon_auth.users_sync u ON p.author = u.id
      WHERE p.parent = ${id}
      
      UNION ALL
      
      -- Recursive case: replies to replies
      SELECT 
        p.id,
        p.author,
        u.name as "authorName",
        p.title,
        p.content,
        p.parent,
        p."createdAt",
        p."updatedAt",
        COALESCE((SELECT SUM(valence) FROM votes WHERE post = p.id), 0)::int as "voteScore",
        tt.depth + 1
      FROM posts p
      LEFT JOIN neon_auth.users_sync u ON p.author = u.id
      INNER JOIN thread_tree tt ON p.parent = tt.id
    )
    SELECT * FROM thread_tree
    ORDER BY "createdAt" ASC
  `;
  
  // Add user votes for each reply if userId is provided
  const repliesWithUserVotes = userId ? await Promise.all(
    thread.map(async (reply: any) => ({
      ...reply,
      userVote: await getUserVoteOnPost(userId, reply.id)
    }))
  ) : thread;
  
  // Build tree structure from flat list
  const repliesMap = new Map<number, Post>();
  const rootReplies: Post[] = [];
  
  // First pass: create all reply objects
  for (const reply of repliesWithUserVotes) {
    repliesMap.set(reply.id, { ...reply, replies: [] } as Post);
  }
  
  // Second pass: build the tree
  for (const reply of repliesWithUserVotes) {
    const replyNode = repliesMap.get(reply.id)!;
    if (reply.parent === parseInt(id)) {
      // Direct child of the post
      rootReplies.push(replyNode);
    } else {
      // Child of another reply
      const parentNode = repliesMap.get(reply.parent);
      if (parentNode) {
        parentNode.replies = parentNode.replies || [];
        parentNode.replies.push(replyNode);
      }
    }
  }
  
  return {
    ...post[0],
    userVote,
    replies: rootReplies
  } as Post;
}

export async function createPost(authorId: string, title: string, content: string, parentId?: number): Promise<Post> {
  const post = await sql`
    INSERT INTO posts (author, title, content, parent)
    VALUES (${authorId}, ${title}, ${content}, ${parentId || null})
    RETURNING id, author, title, content, parent, "createdAt", "updatedAt"
  `;
  return post[0] as Post;
}

export async function upsertVote(
  voterId: string, 
  valence: -1 | 1, 
  postId: number
): Promise<{ success: boolean }> {
  try {
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
        INSERT INTO votes (voter, valence, post)
        VALUES (${voterId}, ${valence}, ${postId})
      `;
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

export async function getCommentsByAuthor(authorId: string): Promise<Post[]> {
  const comments = await sql`
    SELECT 
      p.id, 
      p.author, 
      u.name as "authorName",
      p.title, 
      p.content, 
      p.parent,
      p."createdAt", 
      p."updatedAt",
      COALESCE((SELECT SUM(valence) FROM votes WHERE post = p.id), 0)::int as "voteScore"
    FROM posts p
    LEFT JOIN neon_auth.users_sync u ON p.author = u.id
    WHERE p.author = ${authorId} AND p.parent IS NOT NULL
    ORDER BY p."createdAt" DESC
    LIMIT 10
  `;
  return comments as unknown as Post[];
}

export interface UserProfile {
  id: string;
  name: string | null;
  profileImageUrl: string | null;
  primaryEmail: string | null;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const result = await sql`
    SELECT 
      id,
      name,
      raw_json->>'profile_image_url' as "profileImageUrl",
      email as "primaryEmail"
    FROM neon_auth.users_sync
    WHERE id = ${userId} AND deleted_at IS NULL
    LIMIT 1
  `;
  
  return result[0] ? (result[0] as UserProfile) : null;
}

// Profile management
export interface Profile {
  id: string;
  userId: string;
  username: string;
  location: string | null;
  businessId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const result = await sql`
    SELECT 
      id,
      user_id as "userId",
      username,
      location,
      business_id as "businessId",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM profiles
    WHERE user_id = ${userId}
    LIMIT 1
  `;
  
  return result[0] ? (result[0] as Profile) : null;
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const result = await sql`
    SELECT 1 FROM profiles WHERE username = ${username} LIMIT 1
  `;
  return result.length === 0;
}

export async function createProfile(data: {
  userId: string;
  username: string;
  location?: string;
  businessId?: string;
}): Promise<{ success: boolean; error?: string; profile?: Profile }> {
  try {
    // Check if username is already taken
    const isAvailable = await checkUsernameAvailable(data.username);
    if (!isAvailable) {
      return { success: false, error: 'Username already taken' };
    }

    // Check if user already has a profile
    const existing = await getProfile(data.userId);
    if (existing) {
      return { success: false, error: 'Profile already exists' };
    }

    // Insert new profile
    const result = await sql`
      INSERT INTO profiles (user_id, username, location, business_id)
      VALUES (
        ${data.userId}, 
        ${data.username}, 
        ${data.location || null}, 
        ${data.businessId || null}
      )
      RETURNING 
        id,
        user_id as "userId",
        username,
        location,
        business_id as "businessId",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return { success: true, profile: result[0] as Profile };
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      return { success: false, error: 'Username already taken' };
    }
    console.error('Error creating profile:', error);
    throw error;
  }
}
