import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const productCategories = [
  'Procurement',
  'Fulfillment',
  'Logistics',
  'Operations',
  'Accounting',
  'CRM',
  'Marketing',
  'Sales',
  'HR & Payroll',
  'Project Management'
];

async function seedProductCategories() {
  try {
    console.log('Seeding product categories...');

    // Clear existing categories first
    await sql`DELETE FROM product_categories`;
    console.log('✅ Cleared existing product categories');

    // Insert new categories
    for (const category of productCategories) {
      await sql`
        INSERT INTO product_categories (name)
        VALUES (${category})
        ON CONFLICT (name) DO NOTHING
      `;
    }

    console.log(`✅ Seeded ${productCategories.length} product categories`);

    // Display the categories
    const result = await sql`
      SELECT id, name FROM product_categories ORDER BY name
    `;
    console.log('\nProduct Categories:');
    result.forEach(cat => {
      console.log(`  ${cat.id}. ${cat.name}`);
    });

    await sql.end();
  } catch (error) {
    console.error('❌ Error seeding product categories:', error);
    await sql.end();
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedProductCategories()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedProductCategories };
