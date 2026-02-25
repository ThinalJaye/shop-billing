'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { signSession, getSession, SESSION_COOKIE } from '@/lib/auth';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// AUTH ACTIONS
// ─────────────────────────────────────────────

export async function loginUser(username: string, password: string) {
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return { success: false, error: 'Invalid username or password.' };
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            return { success: false, error: 'Invalid username or password.' };
        }

        const token = await signSession({
            userId: user.id,
            username: user.username,
            role: user.role,
        });

        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24, // 1 day
        });

        return { success: true };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'An error occurred during login.' };
    }
}

export async function logoutUser() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
    redirect('/login');
}

export async function registerUser(username: string, password: string, role: string) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized. Admin access required.' };
        }

        if (!username?.trim()) return { success: false, error: 'Username is required.' };
        if (!password || password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };
        if (!['ADMIN', 'CASHIER'].includes(role)) return { success: false, error: 'Invalid role.' };

        const passwordHash = await bcrypt.hash(password, 12);
        const newUser = await prisma.user.create({
            data: { username: username.trim(), passwordHash, role },
        });

        revalidatePath('/admin/users');
        return { success: true, username: newUser.username };
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
            return { success: false, error: 'That username is already taken.' };
        }
        console.error('Register error:', error);
        return { success: false, error: 'Failed to register user.' };
    }
}

// ─────────────────────────────────────────────
// SALE ACTIONS
// ─────────────────────────────────────────────

interface SaleItemInput {
    productId: number;
    quantity: number;
    price: number;
}

export async function createSale(items: SaleItemInput[]) {
    try {
        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const productIds = items.map((item) => item.productId);
        const productsInDB = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, stock: true },
        });

        const stockMap = new Map(productsInDB.map((p) => [p.id, p]));
        for (const item of items) {
            const product = stockMap.get(item.productId);
            if (!product) {
                return { success: false, error: `Product with ID ${item.productId} not found.` };
            }
            if (item.quantity > product.stock) {
                return {
                    success: false,
                    error: `Insufficient stock for "${product.name}". Requested: ${item.quantity}, Available: ${product.stock}.`,
                };
            }
        }

        const result = await prisma.$transaction(async (tx) => {
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
                include: { items: true },
            });

            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            return sale;
        });

        revalidatePath('/');
        return { success: true, sale: result };
    } catch (error) {
        console.error('Failed to create sale:', error);
        return { success: false, error: 'Failed to create sale. Please try again.' };
    }
}

// ─────────────────────────────────────────────
// PRODUCT ACTIONS
// ─────────────────────────────────────────────

interface ProductInput {
    name: string;
    price: number;
    stock: number;
}

export async function addProduct(product: ProductInput) {
    try {
        const trimmedName = product.name?.trim() || '';
        if (!trimmedName) return { success: false, error: 'Product name is required' };
        if (typeof product.price !== 'number' || isNaN(product.price) || product.price < 0)
            return { success: false, error: 'Price must be a valid positive number' };
        if (typeof product.stock !== 'number' || isNaN(product.stock) || product.stock < 0)
            return { success: false, error: 'Stock must be a valid positive number' };

        const newProduct = await prisma.product.create({
            data: { name: trimmedName, price: product.price, stock: product.stock },
        });

        revalidatePath('/');
        revalidatePath('/inventory');
        return { success: true, product: newProduct };
    } catch (error) {
        console.error('Failed to add product:', error);
        return { success: false, error: 'Failed to add product. Please try again.' };
    }
}
