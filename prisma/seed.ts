import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing products
  await prisma.product.deleteMany();
  console.log('Cleared existing products');

  // Create dummy products
  const products = await prisma.product.createMany({
    data: [
      { name: 'Rice', price: 150.0, stock: 50 },
      { name: 'Sugar', price: 120.0, stock: 30 },
      { name: 'Dhal', price: 180.0, stock: 45 },
      { name: 'Soap', price: 50.0, stock: 100 },
      { name: 'Panadol', price: 25.0, stock: 200 },
    ],
  });

  console.log(`✅ Created ${products.count} products`);
  
  // Display the created products
  const allProducts = await prisma.product.findMany();
  console.table(allProducts);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
