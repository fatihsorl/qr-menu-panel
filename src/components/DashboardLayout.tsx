'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Home, Menu, Folder, Package, X, MenuIcon, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);

    useEffect(() => {
        const handleStart = () => setPageLoading(true);

        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 100);

        return () => {
            clearTimeout(timer);
            setPageLoading(false);
        };
    }, [pathname]);

    const navigation = [
        { name: 'Ana Sayfa', href: '/dashboard', icon: Home },
        { name: 'Ana Kategoriler', href: '/dashboard/menus', icon: Menu },
        { name: 'Alt Kategoriler', href: '/dashboard/categories', icon: Folder },
        { name: 'Ürünler', href: '/dashboard/products', icon: Package },
    ];

    const handleLogout = async () => {
        try {
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            logout();
            toast.success('Başarıyla çıkış yapıldı');
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            logout();
            router.push('/login');
        }
    };

    const handleLinkClick = (href: string) => {
        if (href !== pathname) {
            setPageLoading(true);
            setTimeout(() => setPageLoading(false), 500);
        }
        setSidebarOpen(false);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="mb-8">
                        <p className="text-gray-600 text-sm">Giriş kontrol ediliyor...</p>
                    </div>

                    <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        <span className="text-gray-600 text-sm">Lütfen bekleyin</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {pageLoading && (
                <div className="fixed inset-0 bg-white bg-opacity-20 z-[60] flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 shadow-xl">
                        <div className="flex items-center space-x-3">
                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                            <span className="text-gray-700 font-medium">Sayfa yükleniyor...</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 bg-white shadow-md"
                >
                    <MenuIcon className="h-6 w-6" />
                </button>
            </div>

            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40  bg-opacity-25"
                    onClick={closeSidebar}
                />
            )}

            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                <div className="hidden lg:flex h-16 items-center justify-center border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">QR Menü Admin</h1>
                </div>

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
                                    onClick={() => handleLinkClick(item.href)}
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

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user.email?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Çıkış Yap"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:ml-64">
                <main className="min-h-screen p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
                    {children}
                </main>
            </div>
        </div>
    );
} 