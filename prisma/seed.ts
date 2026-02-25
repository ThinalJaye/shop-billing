import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data in correct FK order (SaleItem → Sale → Product)
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  console.log('Cleared existing products and sales');

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

  // Seed default admin user (upsert so re-seeding is safe)
  const passwordHash = await bcrypt.hash('password123', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user ready: "${admin.username}" (role: ${admin.role})`);

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
