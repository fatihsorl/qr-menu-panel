'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Home, Menu, Folder, Package } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();

    const navigation = [
        { name: 'Ana Sayfa', href: '/dashboard', icon: Home },
        { name: 'Menüler', href: '/dashboard/menus', icon: Menu },
        { name: 'Kategoriler', href: '/dashboard/categories', icon: Folder },
        { name: 'Ürünler', href: '/dashboard/products', icon: Package },
    ];

    const handleLogout = () => {
        logout();
        toast.success('Başarıyla çıkış yapıldı');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
                <div className="flex h-16 items-center justify-center border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">QR Menü Admin</h1>
                </div>

                <nav className="mt-8 px-4">
                    <div className="space-y-2">
                        {navigation.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
                                        ${isActive
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    <IconComponent className="mr-3 h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Info & Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <div className="flex items-center mb-4">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                            <p className="text-xs text-gray-500">Yönetici</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Çıkış Yap
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="pl-64">
                <main className="py-8 px-8">
                    {children}
                </main>
            </div>
        </div>
    );
} 