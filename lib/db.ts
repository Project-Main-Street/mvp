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
}

interface Comment {
  id: number;
  author: string;
  authorName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
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
      p."updatedAt"
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

export async function getPostById(id: string): Promise<Post | undefined> {
  const post = await sql`
    SELECT 
      p.id, 
      p.author, 
      u.name as "authorName",
      p.title, 
      p.content, 
      p."createdAt", 
      p."updatedAt"
    FROM posts p
    LEFT JOIN neon_auth.users_sync u ON p.author = u.id
    WHERE p.id = ${id}
    LIMIT 1
  `;
  
  if (!post[0]) {
    return undefined;
  }
  
  // Fetch comments for this post
  const comments = await sql`
    SELECT 
      c.id,
      c.author,
      u.name as "authorName",
      c.content,
      c."createdAt",
      c."updatedAt"
    FROM comments c
    LEFT JOIN neon_auth.users_sync u ON c.author = u.id
    WHERE c.post = ${id}
    ORDER BY c."createdAt" ASC
  `;
  
  return {
    ...post[0],
    comments: comments as unknown as Comment[]
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