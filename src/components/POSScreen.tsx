'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createSale } from '@/app/actions';
import Link from 'next/link';

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
}

interface CartItem {
    product: Product;
    quantity: number; // Can be decimal
}

export default function POSScreen({ products }: { products: Product[] }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus search on load
    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    // Filter products based on search term
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const lowerTerm = searchTerm.toLowerCase();
        return products.filter((p) =>
            p.name.toLowerCase().includes(lowerTerm) ||
            p.id.toString().includes(lowerTerm)
        );
    }, [searchTerm, products]);

    const addToBill = (product: Product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product.id === product.id);
            if (existingItem) {
                // Increment by 1 by default, user can edit later
                return prevCart.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { product, quantity: 1 }];
        });
        // Keep focus on search after adding
        searchInputRef.current?.focus();
    };

    const updateQuantity = (productId: number, newQty: string) => {
        const qty = parseFloat(newQty);
        if (isNaN(qty) || qty < 0) return; // Allow 0 to potentially clear? Or just block invalid.

        setCart((prevCart) =>
            prevCart.map((item) =>
                item.product.id === productId
                    ? { ...item, quantity: qty }
                    : item
            )
        );
    };

    const removeFromBill = (productId: number) => {
        setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    };

    const totalAmount = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        try {
            // Prepare the payload for the new createSale action
            const saleItems = cart.map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: item.product.price,
            }));

            const result = await createSale(saleItems);

            if (result.success) {
                setCart([]);
                setSearchTerm('');
                alert('Sale completed successfully!');
                searchInputRef.current?.focus();
            } else {
                alert('Failed to complete sale: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An expected error occurred during checkout.');
        } finally {
            setLoading(false);
        }
    };

    // Currency formatter
    const formatCurrency = (amount: number) => {
        return `Rs. ${amount.toFixed(2)}`;
    };

    return (
        <div className="flex h-[calc(100vh-80px)] bg-gray-100 gap-4 overflow-hidden">
            {/* Left Side: Product Catalog */}
            <div className="w-[60%] flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 ml-4 mb-4">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex gap-4">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search products by name or ID... (Press '/')"
                        className="flex-1 text-lg px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && filteredProducts.length === 1) {
                                addToBill(filteredProducts[0]);
                                setSearchTerm('');
                            }
                        }}
                    />
                    <Link
                        href="/inventory"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2 text-sm font-semibold whitespace-nowrap"
                    >
                        📦 Manage Inventory
                    </Link>
                </div>

                {/* Product Table */}
                <div className="flex-1 overflow-auto bg-white">
                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                        <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-gray-600 font-bold border-r border-gray-200">Name</th>
                                <th scope="col" className="px-6 py-3 text-gray-600 font-bold border-r border-gray-200 text-center">Stock</th>
                                <th scope="col" className="px-6 py-3 text-gray-600 font-bold border-r border-gray-200 text-right">Price</th>
                                <th scope="col" className="px-4 py-3 text-gray-600 font-bold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map((product, index) => (
                                <tr
                                    key={product.id}
                                    className={`hover:bg-blue-50 transition-colors duration-150 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                    onClick={() => addToBill(product)}
                                >
                                    <td className="px-6 py-3 font-medium text-gray-900 border-r border-gray-100">
                                        {product.name}
                                    </td>
                                    <td className={`px-6 py-3 text-center font-medium border-r border-gray-100 ${product.stock < 10 ? 'text-red-600' : 'text-gray-600'}`}>
                                        {product.stock}
                                    </td>
                                    <td className="px-6 py-3 text-right font-medium text-gray-900 border-r border-gray-100">
                                        {formatCurrency(product.price)}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToBill(product);
                                            }}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-600 hover:text-white text-xs font-bold uppercase tracking-wide transition-all"
                                        >
                                            Add
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                        No products found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Side: The Bill */}
            <div className="w-[40%] flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 mr-4 mb-4">
                <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        🛒 Current Bill
                    </h2>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-400">
                        {cart.length} Items
                    </span>
                </div>

                {/* Bill Table */}
                <div className="flex-1 overflow-auto bg-white">
                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                        <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-gray-600 font-bold border-r border-gray-200">Item</th>
                                <th scope="col" className="px-4 py-3 text-gray-600 font-bold border-r border-gray-200 text-right">Price</th>
                                <th scope="col" className="px-4 py-3 text-gray-600 font-bold border-r border-gray-200 text-center w-24">
                                    Qty
                                </th>
                                <th scope="col" className="px-4 py-3 text-gray-600 font-bold text-right">Total</th>
                                <th scope="col" className="px-2 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {cart.map((item) => (
                                <tr key={item.product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900 border-r border-gray-100">
                                        {item.product.name}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 border-r border-gray-100">
                                        {item.product.price.toFixed(2)}
                                    </td>
                                    <td className="px-2 py-2 text-center border-r border-gray-100">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.001"
                                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-gray-900 bg-gray-50"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.product.id, e.target.value)}
                                            onClick={(e) => (e.target as HTMLInputElement).select()}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                                        {(item.product.price * item.quantity).toFixed(2)}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <button
                                            onClick={() => removeFromBill(item.product.id)}
                                            className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                                            title="Remove Item"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {cart.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <p className="text-lg font-medium">Cart is empty</p>
                                            <p className="text-sm">Select products from the left to start billing</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Total & Checkout Section */}
                <div className="p-6 bg-white border-t border-gray-200 rounded-b-lg shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-end mb-6">
                        <div className="text-sm text-gray-500">
                            <p>Subtotal: {cart.length} items</p>
                            <p>Tax (0%): Rs. 0.00</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-sm text-gray-600 font-medium uppercase tracking-wider mb-1">Total Amount</span>
                            <span className="text-4xl font-extrabold text-blue-600 tracking-tight">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || loading}
                        className={`w-full py-4 px-6 rounded-lg text-white font-bold text-xl uppercase tracking-widest shadow-md transform transition-all duration-200 flex justify-center items-center gap-3 ${cart.length === 0 || loading
                            ? 'bg-gray-300 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md'
                            }`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            <>
                                Confirm Checkout
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
