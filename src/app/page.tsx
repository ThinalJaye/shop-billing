import { PrismaClient } from '@prisma/client';
import POSScreen from '@/components/POSScreen';

const prisma = new PrismaClient();

export default async function Home() {
  const products = await prisma.product.findMany();

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Shop Billing System</h1>
      <POSScreen products={products} />
    </main>
  );
}
