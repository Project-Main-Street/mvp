import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Product data: [name, category_name]
const productsData: [string, string][] = [
  // Accounting
  ['QuickBooks', 'Accounting'],
  ['Xero', 'Accounting'],
  ['FreshBooks', 'Accounting'],
  ['Wave', 'Accounting'],
  ['Sage', 'Accounting'],
  
  // CRM
  ['Salesforce', 'CRM'],
  ['HubSpot', 'CRM'],
  ['Zoho CRM', 'CRM'],
  ['Pipedrive', 'CRM'],
  ['Copper', 'CRM'],
  
  // Marketing
  ['Mailchimp', 'Marketing'],
  ['Klaviyo', 'Marketing'],
  ['Marketo', 'Marketing'],
  ['ActiveCampaign', 'Marketing'],
  ['Constant Contact', 'Marketing'],
  
  // Sales
  ['Stripe', 'Sales'],
  ['Square', 'Sales'],
  ['Shopify', 'Sales'],
  ['WooCommerce', 'Sales'],
  ['BigCommerce', 'Sales'],
  
  // HR & Payroll
  ['Gusto', 'HR & Payroll'],
  ['ADP', 'HR & Payroll'],
  ['BambooHR', 'HR & Payroll'],
  ['Zenefits', 'HR & Payroll'],
  ['Paychex', 'HR & Payroll'],
  
  // Project Management
  ['Asana', 'Project Management'],
  ['Trello', 'Project Management'],
  ['Monday.com', 'Project Management'],
  ['Jira', 'Project Management'],
  ['ClickUp', 'Project Management'],
  
  // Operations
  ['Slack', 'Operations'],
  ['Microsoft Teams', 'Operations'],
  ['Zoom', 'Operations'],
  ['Google Workspace', 'Operations'],
  ['Notion', 'Operations'],
  
  // Procurement
  ['Coupa', 'Procurement'],
  ['SAP Ariba', 'Procurement'],
  ['Procurify', 'Procurement'],
  ['Jaggaer', 'Procurement'],
  ['GEP SMART', 'Procurement'],
  
  // Fulfillment
  ['ShipStation', 'Fulfillment'],
  ['ShipBob', 'Fulfillment'],
  ['Deliverr', 'Fulfillment'],
  ['Red Stag', 'Fulfillment'],
  ['Fulfillment by Amazon', 'Fulfillment'],
  
  // Logistics
  ['FreightPOP', 'Logistics'],
  ['ShipHawk', 'Logistics'],
  ['UPS', 'Logistics'],
  ['FedEx', 'Logistics'],
  ['DHL', 'Logistics']
];

async function seedProducts() {
  try {
    console.log('Seeding products...');

    // Get category mapping
    const categories = await sql`
      SELECT id, name FROM product_categories
    `;
    
    const categoryMap = new Map(
      categories.map(cat => [cat.name, cat.id])
    );

    console.log(`Found ${categories.length} product categories`);

    // Note: We won't delete existing products as they might be associated with businesses
    // Instead, we'll insert only if they don't exist
    
    let insertedCount = 0;
    let skippedCount = 0;

    for (const [productName, categoryName] of productsData) {
      const categoryId = categoryMap.get(categoryName);
      
      if (!categoryId) {
        console.log(`⚠️  Category "${categoryName}" not found for product "${productName}"`);
        skippedCount++;
        continue;
      }

      // Check if product already exists (by name and category)
      const existing = await sql`
        SELECT id FROM products 
        WHERE name = ${productName} 
        AND category_id = ${categoryId}
        AND business_id IS NULL
        LIMIT 1
      `;

      if (existing.length > 0) {
        skippedCount++;
        continue;
      }

      // Insert product (no business_id means it's a template/reference product)
      await sql`
        INSERT INTO products (name, category_id, business_id)
        VALUES (${productName}, ${categoryId}, NULL)
      `;
      insertedCount++;
    }

    console.log(`✅ Inserted ${insertedCount} new products`);
    console.log(`⏭️  Skipped ${skippedCount} existing products`);

    // Display summary by category
    const summary = await sql`
      SELECT 
        pc.name as category,
        COUNT(p.id) as product_count
      FROM product_categories pc
      LEFT JOIN products p ON pc.id = p.category_id AND p.business_id IS NULL
      GROUP BY pc.name
      ORDER BY pc.name
    `;

    console.log('\nProducts by Category:');
    summary.forEach(row => {
      console.log(`  ${row.category}: ${row.product_count} products`);
    });

    await sql.end();
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    await sql.end();
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedProducts()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedProducts };
