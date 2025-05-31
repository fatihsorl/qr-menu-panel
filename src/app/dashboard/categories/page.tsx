'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/lib/store';
import { categoryService, menuService } from '@/lib/api';
import { Category } from '@/lib/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface CategoryWithMenu extends Category {
    menuTitle?: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<CategoryWithMenu[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    const loadMenusAndCategories = useCallback(async () => {
        try {
            setLoading(true);
            if (user) {
                // Önce menüleri al
                const menusResponse = await menuService.getMyMenus();
                if (menusResponse.isSucceed && menusResponse.data.length > 0) {
                    // Her menü için kategorileri al
                    const allCategories: CategoryWithMenu[] = [];
                    for (const menu of menusResponse.data) {
                        try {
                            const categoriesResponse = await categoryService.getCategoriesByMenuId(menu.id);
                            if (categoriesResponse.isSucceed) {
                                // Her kategoriye menü bilgisini ekle
                                const categoriesWithMenu = categoriesResponse.data.map(cat => ({
                                    ...cat,
                                    menuTitle: menu.title
                                }));
                                allCategories.push(...categoriesWithMenu);
                            }
                        } catch {
                            console.log(`Menü ${menu.title} için kategori bulunamadı`);
                        }
                    }
                    setCategories(allCategories);
                }
            }
        } catch (error: unknown) {
            console.error('Kategoriler yüklenirken hata:', error);
            toast.error('Kategoriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadMenusAndCategories();
        }
    }, [user, loadMenusAndCategories]);

    const handleDeleteCategory = async (categoryId: string) => {
        if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
            try {
                const response = await categoryService.deleteCategory(categoryId);
                if (response.isSucceed) {
                    toast.success('Kategori başarıyla silindi');
                    loadMenusAndCategories();
                }
            } catch {
                toast.error('Kategori silinirken hata oluştu');
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Ana Sayfaya Dön
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Tüm Kategoriler</h1>
                </div>

                {/* Categories List */}
                <div className="bg-white rounded-lg shadow">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : categories.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {categories.map((category) => (
                                <div key={category.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            {category.imageUrl ? (
                                                <img
                                                    src={category.imageUrl}
                                                    alt={category.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">Görsel Yok</span>
                                                </div>
                                            )}

                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                                                <p className="text-gray-600 mt-1">{category.description}</p>
                                                <div className="flex items-center mt-2 space-x-3">
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                        {category.menuTitle || 'Bilinmeyen Menü'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Kategori ID: {category.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Henüz kategori oluşturmadınız
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Ana sayfaya gidip ilk kategorinizi oluşturun
                            </p>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Kategori Oluştur
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
} 