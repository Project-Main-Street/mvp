import { seedProductCategories } from './seed-product-categories';
import { seedProducts } from './seed-products';

async function seedAll() {
  console.log('Starting database seeding...\n');
  
  try {
    // Seed categories first
    await seedProductCategories();
    
    console.log('\n---\n');
    
    // Then seed products
    await seedProducts();
    
    console.log('\n✅ All seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedAll();
}
