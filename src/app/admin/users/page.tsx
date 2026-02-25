import { getSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import RegisterForm from './RegisterForm';

const prisma = new PrismaClient();

export default async function AdminUsersPage() {
    const session = await getSession();

    // Role check — only ADMIN can view this page
    if (!session || session.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-10 max-w-md w-full text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
                    <p className="text-gray-500 mb-6">You don't have permission to view this page. This area is restricted to Admins only.</p>
                    <Link href="/" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                        ← Back to POS
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch all users
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'asc' },
        select: { id: true, username: true, role: true, createdAt: true },
    });

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">👥 User Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Add and manage system users</p>
                    </div>
                    <Link href="/" className="text-sm text-blue-600 hover:underline font-medium">
                        ← Back to POS
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* User list — wider card */}
                    <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-base font-semibold text-gray-700">All Users ({users.length})</h2>
                        </div>
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                                    <th className="px-6 py-3 text-left">Username</th>
                                    <th className="px-6 py-3 text-center">Role</th>
                                    <th className="px-6 py-3 text-right">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-gray-900 flex items-center gap-2">
                                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {user.username[0].toUpperCase()}
                                            </span>
                                            {user.username}
                                            {user.username === session.username && (
                                                <span className="text-xs text-gray-400">(you)</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right text-gray-500 text-xs">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Register form */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-base font-semibold text-gray-700">Register New User</h2>
                        </div>
                        <div className="p-6">
                            <RegisterForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
