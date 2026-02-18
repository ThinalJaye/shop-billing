import { PrismaClient } from '@prisma/client';
import InventoryManager from '@/components/InventoryManager';

const prisma = new PrismaClient();

export default async function InventoryPage() {
    const products = await prisma.product.findMany({
        orderBy: { id: 'desc' }
    });

    return (
        <div className="min-h-screen bg-gray-100">
            <InventoryManager initialProducts={products} />
        </div>
    );
}
