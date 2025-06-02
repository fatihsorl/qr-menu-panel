'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/store';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const { isLoading } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 sm:space-y-8">
                <div className="text-center">
                    <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
                        QR Menü Admin Paneli
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Hesabınıza giriş yapın
                    </p>
                </div>
                <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                E-posta Adresi
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="E-posta adresinizi girin"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Şifre
                            </label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 pr-10 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Şifrenizi girin"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center disabled:cursor-not-allowed"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-base disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Giriş yapılıyor...
                                </>
                            ) : (
                                'Giriş Yap'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <span className="text-sm text-gray-600">
                            Hesabınız yok mu?{' '}
                            <Link
                                href="/register"
                                className={`font-medium text-blue-600 hover:text-blue-500 ${isLoading ? 'pointer-events-none text-gray-400' : ''}`}
                            >
                                Kayıt Ol
                            </Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
} 