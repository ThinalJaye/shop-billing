'use client';

import { useState, useRef } from 'react';
import { addProduct } from '@/app/actions';
import Link from 'next/link';

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
}

type MessageType = 'success' | 'error' | null;

export default function InventoryManager({ initialProducts }: { initialProducts: Product[] }) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: MessageType; text: string }>({ type: null, text: '' });
    const formRef = useRef<HTMLFormElement>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage({ type: null, text: '' });

        const name = formData.get('name') as string;
        const priceStr = formData.get('price') as string;
        const stockStr = formData.get('stock') as string;

        // Client-side validation
        if (!name?.trim()) {
            setMessage({ type: 'error', text: 'Product name is required' });
            setLoading(false);
            return;
        }

        const price = parseFloat(priceStr);
        const stock = parseFloat(stockStr);

        if (isNaN(price) || price < 0) {
            setMessage({ type: 'error', text: 'Price must be a valid positive number' });
            setLoading(false);
            return;
        }

        if (isNaN(stock) || stock < 0) {
            setMessage({ type: 'error', text: 'Stock must be a valid positive number' });
            setLoading(false);
            return;
        }

        const result = await addProduct({ name: name.trim(), price, stock });

        if (result.success && result.product) {
            setMessage({ type: 'success', text: '✓ Product added successfully!' });
            formRef.current?.reset();
            setProducts(prev => [...prev, result.product as Product]);
            // Clear success message after 3 seconds
            setTimeout(() => setMessage({ type: null, text: '' }), 3000);
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to add product' });
        }
        setLoading(false);
    }

    return (
        <div className="container mx-auto p-4 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900">📦 Inventory Management</h1>
                <Link
                    href="/"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                    ← Back to POS
                </Link>
            </div>

            {/* Message Display */}
            {message.type && (
                <div
                    className={`mb-6 p-4 rounded-lg border ${
                        message.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                >
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            {/* Add Product Form */}
            <div className="bg-white p-8 rounded-lg shadow-md mb-8 border border-gray-200">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                    ➕ Add New Product
                </h2>
                <form ref={formRef} action={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                        <input
                            name="name"
                            type="text"
                            required
                            placeholder="e.g. Rice, Sugar, Flour"
                            className="border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">Price (Rs.) *</label>
                        <input
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            placeholder="0.00"
                            className="border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">Initial Stock (Qty) *</label>
                        <input
                            name="stock"
                            type="number"
                            step="0.001"
                            min="0"
                            required
                            placeholder="0.000"
                            className="border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`font-bold py-3 px-6 rounded-md transition-all h-[44px] flex items-center justify-center gap-2 ${
                            loading
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-md'
                        }`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>💾 Save Product</>
                        )}
                    </button>
                </form>
            </div>

            {/* Current Inventory Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                        📋 Current Inventory
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase tracking-wider border-b border-gray-200">
                                <th className="p-4">ID</th>
                                <th className="p-4">Product Name</th>
                                <th className="p-4 text-right">Price (Rs.)</th>
                                <th className="p-4 text-center">Current Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product, index) => (
                                <tr
                                    key={product.id}
                                    className={`transition-colors hover:bg-blue-50 ${
                                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    }`}
                                >
                                    <td className="p-4 text-gray-500 font-medium">#{product.id}</td>
                                    <td className="p-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="p-4 text-right text-gray-700 font-medium">
                                        Rs. {product.price.toFixed(2)}
                                    </td>
                                    <td
                                        className={`p-4 text-center font-bold text-sm ${
                                            product.stock < 10 ? 'text-red-600 bg-red-50' : 'text-green-600'
                                        }`}
                                    >
                                        {product.stock} {product.stock < 10 && '⚠️'}
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-gray-500 italic">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-12 w-12 opacity-40"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                                />
                                            </svg>
                                            <p className="text-lg font-medium">No products in inventory</p>
                                            <p className="text-sm">Add your first product using the form above!</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
                    <p>
                        <strong>Total Products:</strong> {products.length} |{' '}
                        <strong>Total Value:</strong> Rs.{' '}
                        {products.reduce((sum, p) => sum + p.price * p.stock, 0).toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
}
