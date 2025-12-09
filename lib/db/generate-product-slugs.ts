import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

/**
 * Update all existing products to generate slugs
 * The trigger will automatically generate unique slugs for products that don't have them
 */
async function generateProductSlugs() {
  const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
  
  try {
    console.log('Generating slugs for existing products...');

    // Update all products to trigger slug generation
    // Setting updated_at will trigger the auto_generate_product_slug function
    const result = await sql`
      UPDATE products
      SET updated_at = CURRENT_TIMESTAMP
      WHERE slug IS NULL OR slug = ''
      RETURNING id, name, slug
    `;

    console.log(`✅ Generated slugs for ${result.length} products`);
    
    if (result.length > 0) {
      console.log('\nSample slugs generated:');
      result.slice(0, 10).forEach((product: any) => {
        console.log(`  - ${product.name} → ${product.slug}`);
      });
    }

    await sql.end();
    return { success: true, count: result.length };
  } catch (error) {
    console.error('❌ Failed to generate slugs:', error);
    await sql.end();
    throw error;
  }
}

// Allow running directly: tsx lib/db/generate-product-slugs.ts
if (require.main === module) {
  generateProductSlugs()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { generateProductSlugs };
