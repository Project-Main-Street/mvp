import postgres from 'postgres'
import { cache } from 'react'

// Database connection singleton with connection pooling optimizations
export const sql = postgres(process.env.POSTGRES_URL!, { 
  ssl: 'require',
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout
  prepare: false, // Disable prepared statements for better compatibility
})

// Type definitions
export interface Post {
  id: number;
  author: string;
  authorName: string;
  authorUsername?: string;
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

// Query functions with React cache for request deduplication
export const getPosts = cache(async (): Promise<Post[]> => {
  const posts = await sql`
    SELECT 
      p.id, 
      p.author, 
      u.name as "authorName",
      pr.username as "authorUsername",
      p.title, 
      p.content, 
      p."createdAt", 
      p."updatedAt",
      COALESCE((SELECT SUM(valence) FROM votes WHERE post = p.id), 0)::int as "voteScore",
      COALESCE((SELECT COUNT(*) FROM posts WHERE parent = p.id), 0)::int as "commentCount"
    FROM posts p
    LEFT JOIN neon_auth.users_sync u ON p.author = u.id
    LEFT JOIN profiles pr ON p.author = pr.user_id
    WHERE p.parent IS NULL
    ORDER BY p."createdAt" DESC
  `;
  return posts as unknown as Post[];
});

export const searchPosts = cache(async (query: string, userId?: string): Promise<Post[]> => {
  // If no query, return empty array (let the component use getPosts instead)
  if (!query.trim()) {
    return [];
  }

  // Use ILIKE for simple pattern matching (works without full-text search index)
  const searchPattern = `%${query}%`;
  
  if (userId) {
    const posts = await sql`
      SELECT 
        p.id, 
        p.author, 
        u.name as "authorName",
        pr.username as "authorUsername",
        p.title, 
        p.content, 
        p."createdAt", 
        p."updatedAt",
        COALESCE((SELECT SUM(valence) FROM votes WHERE post = p.id), 0)::int as "voteScore",
        COALESCE((SELECT COUNT(*) FROM posts WHERE parent = p.id), 0)::int as "commentCount"
      FROM posts p
      LEFT JOIN neon_auth.users_sync u ON p.author = u.id
      LEFT JOIN profiles pr ON p.author = pr.user_id
      WHERE p.author = ${userId}
        AND p.parent IS NULL
        AND (p.title ILIKE ${searchPattern} OR p.content ILIKE ${searchPattern})
      ORDER BY p."createdAt" DESC
      LIMIT 50
    `;
    return posts as unknown as Post[];
  } else {
    const posts = await sql`
      SELECT 
        p.id, 
        p.author, 
        u.name as "authorName",
        pr.username as "authorUsername",
        p.title, 
        p.content, 
        p."createdAt", 
        p."updatedAt",
        COALESCE((SELECT SUM(valence) FROM votes WHERE post = p.id), 0)::int as "voteScore",
        COALESCE((SELECT COUNT(*) FROM posts WHERE parent = p.id), 0)::int as "commentCount"
      FROM posts p
      LEFT JOIN neon_auth.users_sync u ON p.author = u.id
      LEFT JOIN profiles pr ON p.author = pr.user_id
      WHERE p.parent IS NULL
        AND (p.title ILIKE ${searchPattern} OR p.content ILIKE ${searchPattern})
      ORDER BY p."createdAt" DESC
      LIMIT 50
    `;
    return posts as unknown as Post[];
  }
});

export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
  const posts = await sql`
    SELECT 
      p.id, 
      p.author,
      u.name as "authorName",
      pr.username as "authorUsername",
      p.title, 
      p.content, 
      p."createdAt", 
      p."updatedAt",
      COALESCE((SELECT SUM(valence) FROM votes WHERE post = p.id), 0)::int as "voteScore",
      COALESCE((SELECT COUNT(*) FROM posts WHERE parent = p.id), 0)::int as "commentCount"
    FROM posts p
    LEFT JOIN neon_auth.users_sync u ON p.author = u.id
    LEFT JOIN profiles pr ON p.author = pr.user_id
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
      pr.username as "authorUsername",
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
    LEFT JOIN profiles pr ON p.author = pr.user_id
    LEFT JOIN votes v ON v.post = p.id
    WHERE p.id = ${id}
    GROUP BY p.id, p.author, u.name, pr.username, p.title, p.content, p."createdAt", p."updatedAt"
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
        pr.username as "authorUsername",
        p.title,
        p.content,
        p.parent,
        p."createdAt",
        p."updatedAt",
        COALESCE((SELECT SUM(valence) FROM votes WHERE post = p.id), 0)::int as "voteScore",
        1 as depth
      FROM posts p
      LEFT JOIN neon_auth.users_sync u ON p.author = u.id
      LEFT JOIN profiles pr ON p.author = pr.user_id
      WHERE p.parent = ${id}
      
      UNION ALL
      
      -- Recursive case: replies to replies
      SELECT 
        p.id,
        p.author,
        u.name as "authorName",
        pr.username as "authorUsername",
        p.title,
        p.content,
        p.parent,
        p."createdAt",
        p."updatedAt",
        COALESCE((SELECT SUM(valence) FROM votes WHERE post = p.id), 0)::int as "voteScore",
        tt.depth + 1
      FROM posts p
      LEFT JOIN neon_auth.users_sync u ON p.author = u.id
      LEFT JOIN profiles pr ON p.author = pr.user_id
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
      pr.username as "authorUsername",
      p.title, 
      p.content, 
      p.parent,
      p."createdAt", 
      p."updatedAt",
      COALESCE((SELECT SUM(valence) FROM votes WHERE post = p.id), 0)::int as "voteScore"
    FROM posts p
    LEFT JOIN neon_auth.users_sync u ON p.author = u.id
    LEFT JOIN profiles pr ON p.author = pr.user_id
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

export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  const result = await sql`
    SELECT 
      u.id,
      u.name,
      u.raw_json->>'profile_image_url' as "profileImageUrl",
      u.email as "primaryEmail"
    FROM neon_auth.users_sync u
    INNER JOIN profiles p ON u.id = p.user_id
    WHERE p.username = ${username} AND u.deleted_at IS NULL
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

// Business management
export interface EmployeeCountRange {
  id: number;
  label: string;
  minCount: number | null;
  maxCount: number | null;
  displayOrder: number;
}

export interface RevenueRange {
  id: number;
  label: string;
  minRevenue: number | null;
  maxRevenue: number | null;
  displayOrder: number;
}

export interface ProductCategory {
  id: number;
  name: string;
  createdAt: Date;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  categoryId: number | null;
  categoryName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Business {
  id: string;
  name: string;
  location: string | null;
  category: string | null;
  employeeCountRangeId: number | null;
  employeeCountRangeLabel: string | null;
  revenueRangeId: number | null;
  revenueRangeLabel: string | null;
  products: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export async function getBusiness(businessId: string): Promise<Business | null> {
  const result = await sql`
    SELECT 
      b.id,
      b.name,
      b.location,
      b.category,
      b.employee_count_range_id as "employeeCountRangeId",
      ecr.label as "employeeCountRangeLabel",
      b.revenue_range_id as "revenueRangeId",
      rr.label as "revenueRangeLabel",
      b.created_at as "createdAt",
      b.updated_at as "updatedAt"
    FROM businesses b
    LEFT JOIN employee_count_ranges ecr ON b.employee_count_range_id = ecr.id
    LEFT JOIN revenue_ranges rr ON b.revenue_range_id = rr.id
    WHERE b.id = ${businessId}
    LIMIT 1
  `;
  
  if (!result[0]) return null;

  // Fetch products for this business
  const products = await getProductsByBusinessId(businessId);
  
  return {
    ...result[0],
    products
  } as Business;
}

export async function getBusinessByUserId(userId: string): Promise<Business | null> {
  const result = await sql`
    SELECT 
      b.id,
      b.name,
      b.location,
      b.category,
      b.employee_count_range_id as "employeeCountRangeId",
      ecr.label as "employeeCountRangeLabel",
      b.revenue_range_id as "revenueRangeId",
      rr.label as "revenueRangeLabel",
      b.created_at as "createdAt",
      b.updated_at as "updatedAt"
    FROM businesses b
    INNER JOIN profiles p ON b.id = p.business_id
    LEFT JOIN employee_count_ranges ecr ON b.employee_count_range_id = ecr.id
    LEFT JOIN revenue_ranges rr ON b.revenue_range_id = rr.id
    WHERE p.user_id = ${userId}
    LIMIT 1
  `;
  
  if (!result[0]) return null;

  // Fetch products for this business
  const products = await getProductsByBusinessId(result[0].id);
  
  return {
    ...result[0],
    products
  } as Business;
}

export async function createBusiness(data: {
  name: string;
  location?: string;
  category?: string;
  employeeCountRangeId?: number;
  revenueRangeId?: number;
}): Promise<{ success: boolean; error?: string; business?: Business }> {
  try {
    // Insert new business
    const result = await sql`
      INSERT INTO businesses (
        name, 
        location, 
        category, 
        employee_count_range_id,
        revenue_range_id
      )
      VALUES (
        ${data.name}, 
        ${data.location || null}, 
        ${data.category || null},
        ${data.employeeCountRangeId || null},
        ${data.revenueRangeId || null}
      )
      RETURNING id
    `;

    // Fetch the full business with range labels
    const business = await getBusiness(result[0].id);
    return { success: true, business: business! };
  } catch (error: any) {
    console.error('Error creating business:', error);
    return { success: false, error: 'Failed to create business' };
  }
}

export const getEmployeeCountRanges = cache(async (): Promise<EmployeeCountRange[]> => {
  const result = await sql`
    SELECT 
      id,
      label,
      min_count as "minCount",
      max_count as "maxCount",
      display_order as "displayOrder"
    FROM employee_count_ranges
    ORDER BY display_order ASC
  `;
  return result as unknown as EmployeeCountRange[];
});

export const getRevenueRanges = cache(async (): Promise<RevenueRange[]> => {
  const result = await sql`
    SELECT 
      id,
      label,
      min_revenue as "minRevenue",
      max_revenue as "maxRevenue",
      display_order as "displayOrder"
    FROM revenue_ranges
    ORDER BY display_order ASC
  `;
  return result as unknown as RevenueRange[];
});

export async function updateProfileBusinessId(userId: string, businessId: string): Promise<void> {
  await sql`
    UPDATE profiles
    SET business_id = ${businessId}, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ${userId}
  `;
}

// Product management
export const getProductCategories = cache(async (): Promise<ProductCategory[]> => {
  const result = await sql`
    SELECT 
      id,
      name,
      created_at as "createdAt"
    FROM product_categories
    ORDER BY name ASC
  `;
  return result as unknown as ProductCategory[];
});

export const getAllProducts = cache(async (): Promise<Product[]> => {
  const result = await sql`
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.category_id as "categoryId",
      pc.name as "categoryName",
      p.created_at as "createdAt",
      p.updated_at as "updatedAt"
    FROM products p
    LEFT JOIN product_categories pc ON p.category_id = pc.id
    ORDER BY pc.name, p.name
  `;
  return result as unknown as Product[];
});

export async function getAllBusinesses(): Promise<Business[]> {
  const result = await sql`
    SELECT 
      b.id,
      b.name,
      b.location,
      b.category,
      b.employee_count_range_id as "employeeCountRangeId",
      ecr.label as "employeeCountRangeLabel",
      b.revenue_range_id as "revenueRangeId",
      rr.label as "revenueRangeLabel",
      b.created_at as "createdAt",
      b.updated_at as "updatedAt"
    FROM businesses b
    LEFT JOIN employee_count_ranges ecr ON b.employee_count_range_id = ecr.id
    LEFT JOIN revenue_ranges rr ON b.revenue_range_id = rr.id
    ORDER BY b.created_at DESC
  `;

  // Fetch products for each business
  const businesses = result as unknown as Business[];
  await Promise.all(
    businesses.map(async (business) => {
      business.products = await getProductsByBusinessId(business.id);
    })
  );

  return businesses;
}

export async function getProductById(productId: number): Promise<Product | null> {
  const result = await sql`
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.category_id as "categoryId",
      pc.name as "categoryName",
      p.created_at as "createdAt",
      p.updated_at as "updatedAt"
    FROM products p
    LEFT JOIN product_categories pc ON p.category_id = pc.id
    WHERE p.id = ${productId}
  `;
  return result.length > 0 ? (result[0] as unknown as Product) : null;
}

export async function getProductsByBusinessId(businessId: string): Promise<Product[]> {
  const result = await sql`
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.category_id as "categoryId",
      pc.name as "categoryName",
      p.created_at as "createdAt",
      p.updated_at as "updatedAt"
    FROM products p
    LEFT JOIN product_categories pc ON p.category_id = pc.id
    INNER JOIN business_products bp ON p.id = bp.product_id
    WHERE bp.business_id = ${businessId}
    ORDER BY p.name
  `;
  return result as unknown as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const result = await sql`
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.category_id as "categoryId",
      pc.name as "categoryName",
      p.created_at as "createdAt",
      p.updated_at as "updatedAt"
    FROM products p
    LEFT JOIN product_categories pc ON p.category_id = pc.id
    WHERE p.slug = ${slug}
    LIMIT 1
  `;
  return result.length > 0 ? (result[0] as unknown as Product) : null;
}

export async function getProductUsageCount(slug: string): Promise<number> {
  const result = await sql`
    SELECT COUNT(DISTINCT bp.business_id)::int as count
    FROM products p
    INNER JOIN business_products bp ON p.id = bp.product_id
    WHERE p.slug = ${slug}
  `;
  return result[0]?.count || 0;
}

export async function addProductToBusiness(businessId: string, productId: number): Promise<void> {
  await sql`
    INSERT INTO business_products (business_id, product_id)
    VALUES (${businessId}, ${productId})
    ON CONFLICT (business_id, product_id) DO NOTHING
  `;
}

export async function removeProductFromBusiness(businessId: string, productId: number): Promise<void> {
  await sql`
    DELETE FROM business_products
    WHERE business_id = ${businessId}
    AND product_id = ${productId}
  `;
}

export async function setBusinessProducts(businessId: string, productIds: number[]): Promise<void> {
  // Delete all existing products for this business
  await sql`
    DELETE FROM business_products
    WHERE business_id = ${businessId}
  `;
  
  // Add new products
  if (productIds.length > 0) {
    await sql`
      INSERT INTO business_products (business_id, product_id)
      SELECT ${businessId}, unnest(${productIds}::int[])
      ON CONFLICT (business_id, product_id) DO NOTHING
    `;
  }
}

export async function updateBusiness(
  businessId: string,
  data: {
    name?: string;
    location?: string | null;
    category?: string | null;
    employeeCountRangeId?: number | null;
    revenueRangeId?: number | null;
  }
): Promise<{ success: boolean; error?: string; business?: Business }> {
  try {
    await sql`
      UPDATE businesses
      SET
        name = ${data.name !== undefined ? data.name : sql`name`},
        location = ${data.location !== undefined ? data.location : sql`location`},
        category = ${data.category !== undefined ? data.category : sql`category`},
        employee_count_range_id = ${data.employeeCountRangeId !== undefined ? data.employeeCountRangeId : sql`employee_count_range_id`},
        revenue_range_id = ${data.revenueRangeId !== undefined ? data.revenueRangeId : sql`revenue_range_id`},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${businessId}
    `;

    // Fetch the updated business with range labels
    const business = await getBusiness(businessId);
    return { success: true, business: business! };
  } catch (error: any) {
    console.error('Error updating business:', error);
    return { success: false, error: 'Failed to update business' };
  }
}

export async function updateProduct(
  productId: number,
  name: string,
  categoryId: number | null
): Promise<Product> {
  const result = await sql`
    UPDATE products
    SET
      name = ${name},
      category_id = ${categoryId},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${productId}
    RETURNING 
      id,
      name,
      slug,
      category_id as "categoryId",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;
  return result[0] as unknown as Product;
}
