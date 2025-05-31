'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/lib/store';
import { productService, categoryService, menuService } from '@/lib/api';
import { Product, Category, Menu } from '@/lib/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        if (user) {
            loadAllData();
        }
    }, [user]);

    const loadAllData = async () => {
        try {
            setLoading(true);
            if (user) {
                // Önce menüleri al
                const menusResponse = await menuService.getMyMenus();
                if (menusResponse.isSucceed && menusResponse.data.length > 0) {
                    setMenus(menusResponse.data);

                    // Her menü için kategorileri al
                    const allCategories: Category[] = [];
                    const allProducts: Product[] = [];

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

                                // Her kategori için ürünleri al
                                for (const category of categoriesResponse.data) {
                                    try {
                                        const productsResponse = await productService.getProductsByCategoryId(category.id);
                                        if (productsResponse.isSucceed) {
                                            // Her ürüne kategori ve menü bilgisini ekle
                                            const productsWithInfo = productsResponse.data.map(product => ({
                                                ...product,
                                                categoryName: category.name,
                                                menuTitle: menu.title
                                            }));
                                            allProducts.push(...productsWithInfo);
                                        }
                                    } catch (error) {
                                        console.log(`Kategori ${category.name} için ürün bulunamadı`);
                                    }
                                }
                            }
                        } catch (error) {
                            console.log(`Menü ${menu.title} için kategori bulunamadı`);
                        }
                    }
                    setCategories(allCategories);
                    setProducts(allProducts);
                }
            }
        } catch (error: any) {
            console.error('Ürünler yüklenirken hata:', error);
            toast.error('Ürünler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            try {
                const response = await productService.deleteProduct(productId);
                if (response.isSucceed) {
                    toast.success('Ürün başarıyla silindi');
                    loadAllData();
                }
            } catch (error) {
                toast.error('Ürün silinirken hata oluştu');
            }
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(price);
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
                    <h1 className="text-2xl font-bold text-gray-900">Tüm Ürünler</h1>
                </div>

                {/* Products List */}
                <div className="bg-white rounded-lg shadow">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {products.map((product) => (
                                <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">Görsel Yok</span>
                                                </div>
                                            )}

                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                                                <p className="text-gray-600 mt-1">{product.description}</p>
                                                <div className="flex items-center mt-2 space-x-3">
                                                    <span className="text-sm font-bold text-green-600">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                                        {(product as any).categoryName || 'Bilinmeyen Kategori'}
                                                    </span>
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        {(product as any).menuTitle || 'Bilinmeyen Menü'}
                                                    </span>
                                                </div>
                                                <div className="mt-1">
                                                    <span className="text-xs text-gray-500">
                                                        Ürün ID: {product.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Henüz ürün oluşturmadınız
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Ana sayfaya gidip ilk ürününüzü oluşturun
                            </p>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Ürün Oluştur
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
} 