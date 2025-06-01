'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Home, Menu, Folder, Package, X, MenuIcon } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Ana Sayfa', href: '/dashboard', icon: Home },
        { name: 'Ana Kategoriler', href: '/dashboard/menus', icon: Menu },
        { name: 'Alt Kategoriler', href: '/dashboard/categories', icon: Folder },
        { name: 'Ürünler', href: '/dashboard/products', icon: Package },
    ];

    const handleLogout = () => {
        logout();
        toast.success('Başarıyla çıkış yapıldı');
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Mobile Header */}
            <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-900">QR Menü Admin</h1>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                    <MenuIcon className="h-6 w-6" />
                </button>
            </div>

            {/* Sidebar - DÜZELTME: Desktop'ta da fixed kalacak */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                {/* Desktop Header */}
                <div className="hidden lg:flex h-16 items-center justify-center border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">QR Menü Admin</h1>
                </div>

                {/* Mobile Header with Close Button */}
                <div className="lg:hidden flex h-16 items-center justify-between px-4 border-b border-gray-200">
                    <h1 className="text-lg font-bold text-gray-900">QR Menü Admin</h1>
                    <button
                        onClick={closeSidebar}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="mt-8 px-4 pb-36 overflow-y-auto">
                    <div className="space-y-2">
                        {navigation.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={closeSidebar}
                                    className={`
                                        flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                                        ${isActive
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Info & Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center mb-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                            <p className="text-xs text-gray-500">Yönetici</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                        Çıkış Yap
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:pl-64">
                <main className="py-4 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
} 