'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Menu,
    X,
    Home,
    BookOpen,
    FolderOpen,
    Package,
    User,
    LogOut,
    QrCode,
    Bell,
    Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/store';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { logout, checkAuth } = useAuth();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) {
            checkAuth();
        }
    }, [user, checkAuth]);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Menüler', href: '/dashboard/menus', icon: BookOpen },
        { name: 'Kategoriler', href: '/dashboard/categories', icon: FolderOpen },
        { name: 'Ürünler', href: '/dashboard/products', icon: Package },
    ];

    const handleLogout = () => {
        logout();
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Mobile menu overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 flex z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
                </div>
            )}

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 flex flex-col z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
                    <div className="flex items-center">
                        <QrCode className="h-8 w-8 text-white" />
                        <span className="ml-2 text-white font-bold text-lg">QR Menü</span>
                    </div>
                    <button
                        className="md:hidden text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                  flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200
                  ${isActive
                                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
                `}
                            >
                                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="flex-shrink-0 border-t border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                            <button
                                onClick={handleLogout}
                                className="flex items-center text-xs text-gray-500 hover:text-red-600 transition-colors duration-200"
                            >
                                <LogOut className="h-3 w-3 mr-1" />
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                {/* Top bar */}
                <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
                    <button
                        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex-1 px-4 flex justify-between items-center">
                        <div className="flex-1">
                            <h1 className="text-xl font-semibold text-gray-900">
                                {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                            </h1>
                        </div>

                        <div className="ml-4 flex items-center md:ml-6 space-x-3">
                            <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <Bell className="h-6 w-6" />
                            </button>
                            <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <Settings className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 