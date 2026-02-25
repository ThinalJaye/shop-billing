import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';

export default async function LoginPage() {
    const session = await getSession();
    if (session) redirect('/');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center p-4">
            {/* Background decorative blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/30 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 20h16a2 2 0 002-2V8a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0013.172 4H10.83a2 2 0 00-1.414.586L8.293 5.707A1 1 0 017.586 6H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Shop Billing</h1>
                    <p className="text-slate-400 mt-1 text-sm">Sign in to access your POS system</p>
                </div>

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
                    <h2 className="text-xl font-semibold text-white mb-6">Welcome back</h2>
                    <LoginForm />
                </div>

                <p className="text-center text-slate-500 text-xs mt-6">
                    Secure POS System &bull; All rights reserved
                </p>
            </div>
        </div>
    );
}
