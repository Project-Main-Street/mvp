import postgres from 'postgres';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

/**
 * Run database migrations by executing SQL schema files
 */
export async function runMigrations() {
  const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
  
  try {
    console.log('Starting database migrations...');
    
    // Read and execute schema files in order
    const schemaDir = join(process.cwd(), 'lib', 'db', 'schema');
    
    // 1. Create posts table first (no dependencies)
    console.log('Creating posts table...');
    const postsSchema = await readFile(join(schemaDir, 'posts.sql'), 'utf-8');
    await sql.unsafe(postsSchema);
    console.log('✅ Posts table created');
    
    // 2. Create votes table (depends on posts)
    console.log('Creating votes table...');
    const votesSchema = await readFile(join(schemaDir, 'votes.sql'), 'utf-8');
    await sql.unsafe(votesSchema);
    console.log('✅ Votes table created');
    
    // 3. Create employee count ranges table (no dependencies)
    console.log('Creating employee count ranges table...');
    const employeeRangesSchema = await readFile(join(schemaDir, 'employee_count_ranges.sql'), 'utf-8');
    await sql.unsafe(employeeRangesSchema);
    console.log('✅ Employee count ranges table created');
    
    // 4. Create revenue ranges table (no dependencies)
    console.log('Creating revenue ranges table...');
    const revenueRangesSchema = await readFile(join(schemaDir, 'revenue_ranges.sql'), 'utf-8');
    await sql.unsafe(revenueRangesSchema);
    console.log('✅ Revenue ranges table created');
    
    // 5. Create businesses table (depends on employee_count_ranges and revenue_ranges)
    console.log('Creating businesses table...');
    const businessesSchema = await readFile(join(schemaDir, 'businesses.sql'), 'utf-8');
    await sql.unsafe(businessesSchema);
    console.log('✅ Businesses table created');
    
    // 5a. Alter businesses table to use range FKs (if table already exists with old schema)
    console.log('Updating businesses table schema...');
    const alterBusinessesSchema = await readFile(join(schemaDir, 'alter_businesses.sql'), 'utf-8');
    await sql.unsafe(alterBusinessesSchema);
    console.log('✅ Businesses table schema updated');
    
    // 5b. Create product categories table (no dependencies)
    console.log('Creating product categories table...');
    const productCategoriesSchema = await readFile(join(schemaDir, 'product_categories.sql'), 'utf-8');
    await sql.unsafe(productCategoriesSchema);
    console.log('✅ Product categories table created');
    
    // 5c. Create products table (depends on product_categories and businesses)
    console.log('Creating products table...');
    const productsSchema = await readFile(join(schemaDir, 'products.sql'), 'utf-8');
    await sql.unsafe(productsSchema);
    console.log('✅ Products table created');
    
    // 5d. Alter businesses table to remove old products TEXT column
    console.log('Removing old products column from businesses table...');
    const alterBusinessesProductsSchema = await readFile(join(schemaDir, 'alter_businesses_products.sql'), 'utf-8');
    await sql.unsafe(alterBusinessesProductsSchema);
    console.log('✅ Old products column removed');
    
    // 5e. Add slug column to products table
    console.log('Adding slug column to products table...');
    const addProductSlugSchema = await readFile(join(schemaDir, 'add_product_slug.sql'), 'utf-8');
    await sql.unsafe(addProductSlugSchema);
    console.log('✅ Slug column added to products table');
    
    // 5f. Create business_products join table
    console.log('Creating business_products join table...');
    const businessProductsSchema = await readFile(join(schemaDir, 'business_products.sql'), 'utf-8');
    await sql.unsafe(businessProductsSchema);
    console.log('✅ Business_products join table created');
    
    // 6. Create profiles table (depends on neon_auth.users_sync and businesses)
    console.log('Creating profiles table...');
    const profilesSchema = await readFile(join(schemaDir, 'profiles.sql'), 'utf-8');
    await sql.unsafe(profilesSchema);
    console.log('✅ Profiles table created');
    
    console.log('✅ All migrations completed successfully');
    
    await sql.end();
    return { success: true };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await sql.end();
    throw error;
  }
}

// Allow running directly: tsx lib/db/migrate.ts
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
