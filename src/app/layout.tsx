import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { logoutUser } from "@/app/actions";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shop Billing System",
  description: "Point of Sale system for shop billing",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}>
        {/* Top Navigation Bar — only show when logged in */}
        {session && (
          <header className="h-[60px] bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6 shadow-lg">
            {/* Left: Logo & Nav Links */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg hover:text-blue-400 transition-colors">
                <span className="text-xl">🏪</span>
                <span className="hidden sm:inline">Shop Billing</span>
              </Link>
              <nav className="flex items-center gap-1">
                <Link
                  href="/"
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  POS
                </Link>
                <Link
                  href="/inventory"
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  Inventory
                </Link>
                {session.role === 'ADMIN' && (
                  <Link
                    href="/admin/users"
                    className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                  >
                    👥 Users
                  </Link>
                )}
              </nav>
            </div>

            {/* Right: User info + Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${session.role === 'ADMIN' ? 'bg-purple-500' : 'bg-blue-500'} text-white`}>
                  {session.username[0].toUpperCase()}
                </span>
                <div className="hidden sm:block text-right">
                  <p className="text-white text-sm font-medium leading-tight">{session.username}</p>
                  <p className={`text-xs font-semibold leading-tight ${session.role === 'ADMIN' ? 'text-purple-400' : 'text-blue-400'}`}>
                    {session.role}
                  </p>
                </div>
              </div>
              <form action={logoutUser}>
                <button
                  type="submit"
                  className="ml-2 px-3 py-1.5 text-sm bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-slate-300 border border-white/20 hover:border-red-500/40 rounded-md transition-all"
                >
                  Logout
                </button>
              </form>
            </div>
          </header>
        )}

        <main className={session ? "h-[calc(100vh-60px)] overflow-hidden" : ""}>
          {children}
        </main>
      </body>
    </html>
  );
}
