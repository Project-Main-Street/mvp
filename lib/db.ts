import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

interface Post {
  id: number;
  author: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getPosts(): Promise<Post[]> {
  const posts = await sql`
    SELECT id, author, title, content, "createdAt", "updatedAt"
    FROM posts
    ORDER BY "createdAt" DESC
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
    SELECT id, author, title, content, "createdAt", "updatedAt"
    FROM posts
    WHERE id = ${id}
    LIMIT 1
  `;
  return post[0] as Post | undefined;
}

export async function createPost(authorId: string, title: string, content: string): Promise<Post> {
  const post = await sql`
    INSERT INTO posts (author, title, content)
    VALUES (${authorId}, ${title}, ${content})
    RETURNING id, author, title, content, "createdAt", "updatedAt"
  `;
  return post[0] as Post;
}