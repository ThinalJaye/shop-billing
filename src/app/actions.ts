'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

interface SaleItemInput {
    productId: number;
    quantity: number;
    price: number;
}

export async function createSale(items: SaleItemInput[]) {
    try {
        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the Sale record
            const sale = await tx.sale.create({
                data: {
                    totalAmount,
                    items: {
                        create: items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
                include: {
                    items: true,
                },
            });

            // 2. Decrement stock for each product
            for (const item of items) {
                // Optional: Check stock before decrementing to prevent negative stock
                /* 
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product || product.stock < item.quantity) {
                     throw new Error(`Insufficient stock for product ID ${item.productId}`);
                }
                */

                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity, // Prisma handles the math safely
                        },
                    },
                });
            }

            return sale;
        });

        revalidatePath('/');
        return { success: true, sale: result };
    } catch (error) {
        console.error('Failed to create sale:', error);
        return { success: false, error: 'Failed to create sale' };
    }
}

interface ProductInput {
    name: string;
    price: number;
    stock: number;
}

export async function addProduct(product: ProductInput) {
    try {
        // Validate inputs
        const trimmedName = product.name?.trim() || '';
        if (!trimmedName) {
            return { success: false, error: 'Product name is required' };
        }

        if (typeof product.price !== 'number' || isNaN(product.price) || product.price < 0) {
            return { success: false, error: 'Price must be a valid positive number' };
        }

        if (typeof product.stock !== 'number' || isNaN(product.stock) || product.stock < 0) {
            return { success: false, error: 'Stock must be a valid positive number' };
        }

        const newProduct = await prisma.product.create({
            data: {
                name: trimmedName,
                price: product.price,
                stock: product.stock,
            },
        });

        revalidatePath('/');
        revalidatePath('/inventory');
        return { success: true, product: newProduct };
    } catch (error) {
        console.error('Failed to add product:', error);
        return { success: false, error: 'Failed to add product. Please try again.' };
    }
}
