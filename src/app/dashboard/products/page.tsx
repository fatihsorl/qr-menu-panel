'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ImageUpload from '@/components/ImageUpload';
import { useAuthStore } from '@/lib/store';
import { productService, categoryService, menuService } from '@/lib/api';
import { Product } from '@/lib/types';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface ProductWithInfo extends Product {
    categoryName?: string;
    menuTitle?: string;
    categoryId?: string;
}

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const urlLanguage = searchParams.get('language');

    const [products, setProducts] = useState<ProductWithInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<ProductWithInfo | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        price: 0,
        imageUrl: ''
    });

    const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
        const initialLanguage = urlLanguage && ['tr', 'en', 'ru'].includes(urlLanguage) ? urlLanguage : 'tr';
        return initialLanguage;
    });

    const [priceInputValue, setPriceInputValue] = useState('');

    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const { user } = useAuthStore();

    useEffect(() => {
        const urlLanguage = searchParams.get('language');
        if (urlLanguage && ['tr', 'en', 'ru'].includes(urlLanguage) && urlLanguage !== selectedLanguage) {
            setSelectedLanguage(urlLanguage);
        }
    }, [searchParams, selectedLanguage]);

    const loadAllData = useCallback(async () => {
        try {
            setLoading(true);
            if (user) {
                const urlLanguage = searchParams.get('language');
                const currentLanguage = urlLanguage && ['tr', 'en', 'ru'].includes(urlLanguage) ? urlLanguage : selectedLanguage;

                const menusResponse = await menuService.getMyMenus(currentLanguage);
                if (menusResponse.isSucceed && menusResponse.data.length > 0) {
                    const filteredMenus = menusResponse.data.filter(menu => menu.language === currentLanguage);
                    const allProducts: ProductWithInfo[] = [];

                    for (const menu of filteredMenus) {
                        try {
                            const categoriesResponse = await categoryService.getCategoriesByMenuId(menu.id, currentLanguage);
                            if (categoriesResponse.isSucceed) {
                                for (const category of categoriesResponse.data) {
                                    try {
                                        const productsResponse = await productService.getProductsByCategoryId(category.id, currentLanguage);
                                        if (productsResponse.isSucceed) {
                                            const productsWithInfo = productsResponse.data.map(product => ({
                                                ...product,
                                                categoryName: category.name,
                                                menuTitle: menu.title,
                                                categoryId: category.id
                                            }));
                                            allProducts.push(...productsWithInfo);
                                        }
                                    } catch {
                                    }
                                }
                            }
                        } catch {
                        }
                    }
                    setProducts(allProducts);
                }
            }
        } catch (error: unknown) {
            console.error('Ürünler yüklenirken hata:', error);
            toast.error('Ürünler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [user, selectedLanguage, searchParams]);

    useEffect(() => {
        if (user) {
            loadAllData();
        }
    }, [user, loadAllData]);

    const handleDeleteProduct = async (productId: string) => {
        if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            try {
                const response = await productService.deleteProduct(productId);
                if (response.isSucceed) {
                    toast.success('Ürün başarıyla silindi');
                    loadAllData();
                }
            } catch {
                toast.error('Ürün silinirken hata oluştu');
            }
        }
    };

    const handleEditProduct = (product: ProductWithInfo) => {
        setEditingProduct(product);
        setEditForm({
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl
        });
        setPriceInputValue(product.price.toString());
    };

    const handleSaveEdit = async () => {
        if (!editingProduct || !editingProduct.categoryId) return;

        const priceValue = parseFloat(priceInputValue) || 0;

        try {
            const response = await productService.updateProduct({
                id: editingProduct.id,
                categoryId: editingProduct.categoryId,
                name: editForm.name,
                description: editForm.description,
                price: priceValue,
                imageUrl: editForm.imageUrl
            });

            if (response.isSucceed) {
                toast.success('Ürün başarıyla güncellendi');
                setEditingProduct(null);
                setEditForm({ name: '', description: '', price: 0, imageUrl: '' });
                setPriceInputValue('');
                loadAllData();
            }
        } catch {
            toast.error('Ürün güncellenirken hata oluştu');
        }
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
        setEditForm({ name: '', description: '', price: 0, imageUrl: '' });
        setPriceInputValue('');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(price);
    };

    const toggleCategoryExpansion = (key: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    useEffect(() => {
        if (products.length > 0) {
            const groupedProducts = products.reduce((groups, product) => {
                const menuTitle = product.menuTitle || 'Bilinmeyen Menü';
                const categoryName = product.categoryName || 'Bilinmeyen Kategori';
                const key = `${menuTitle}|${categoryName}`;

                if (!groups[key]) {
                    groups[key] = {
                        menuTitle,
                        categoryName,
                        products: []
                    };
                }
                groups[key].products.push(product);
                return groups;
            }, {} as Record<string, { menuTitle: string; categoryName: string; products: ProductWithInfo[] }>);

            const categoryKeys = Object.keys(groupedProducts);

            if (categoryKeys.length <= 3) {
                setExpandedCategories(new Set(categoryKeys));
            }
        }
    }, [products]);

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/dashboard"
                            className="flex items-center text-blue-600 hover:text-blue-700 text-sm w-fit"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Ana Sayfaya Dön
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tüm Ürünler</h1>
                        <p className="text-sm text-gray-600">
                            Seçilen dile göre tüm ürünleri kategori bazında görüntüleyebilirsiniz.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            Dil Seçin:
                        </label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white min-w-[120px]"
                        >
                            <option value="tr">TR</option>
                            <option value="en">EN</option>
                            <option value="ru">RU</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-gray-600 text-sm">Ürünler yükleniyor...</p>
                            </div>
                        </div>
                    ) : products.length > 0 ? (
                        (() => {
                            const groupedProducts = products.reduce((groups, product) => {
                                const menuTitle = product.menuTitle || 'Bilinmeyen Menü';
                                const categoryName = product.categoryName || 'Bilinmeyen Kategori';
                                const key = `${menuTitle}|${categoryName}`;

                                if (!groups[key]) {
                                    groups[key] = {
                                        menuTitle,
                                        categoryName,
                                        products: []
                                    };
                                }
                                groups[key].products.push(product);
                                return groups;
                            }, {} as Record<string, { menuTitle: string; categoryName: string; products: ProductWithInfo[] }>);

                            return Object.entries(groupedProducts).map(([key, { menuTitle, categoryName, products: groupProducts }]) => (
                                <div key={key} className="space-y-4">
                                    <div
                                        onClick={() => toggleCategoryExpansion(key)}
                                        className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border border-purple-200 cursor-pointer hover:from-purple-200 hover:to-pink-200 transition-all duration-200 hover:shadow-md select-none"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                                                    <span className="text-white font-bold text-lg">🍽️</span>
                                                </div>
                                                <div>

                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm font-semibold text-gray-700">
                                                            Alt Kategori:
                                                        </span>
                                                        <span className="text-sm font-extrabold text-gray-700">{categoryName}</span>
                                                    </div>

                                                    <p className="text-xs text-gray-600">
                                                        {groupProducts.length} ürün
                                                        {expandedCategories.has(key) ? ' gösteriliyor' : ' • Görmek için tıklayın'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-600 font-medium hidden sm:block">
                                                    {expandedCategories.has(key) ? 'Kapat' : 'Aç'}
                                                </span>
                                                <div className={`transition-transform duration-200 ${expandedCategories.has(key) ? 'transform rotate-180' : ''}`}>
                                                    <ChevronDown className="w-5 h-5 text-gray-600" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {expandedCategories.has(key) && (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fadeIn">
                                            {groupProducts.map((product) => (
                                                <div key={product.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                                    <div className="p-4">
                                                        {editingProduct?.id === product.id ? (
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Ürün Adı
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={editForm.name}
                                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-900"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Açıklama
                                                                    </label>
                                                                    <textarea
                                                                        value={editForm.description}
                                                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                                        rows={2}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-900"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Fiyat (₺)
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        value={priceInputValue}
                                                                        onChange={(e) => {
                                                                            setPriceInputValue(e.target.value);
                                                                            const numValue = parseFloat(e.target.value) || 0;
                                                                            setEditForm({ ...editForm, price: numValue });
                                                                        }}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-900"
                                                                        min="0"
                                                                        step="0.01"
                                                                        placeholder="0.00"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Görsel URL
                                                                    </label>
                                                                    <ImageUpload
                                                                        value={editForm.imageUrl}
                                                                        onChange={(url) => setEditForm({ ...editForm, imageUrl: url })}
                                                                        label="Ürün Görseli"
                                                                        placeholder="Ürün için görsel seçin"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                                                                    <button
                                                                        onClick={handleSaveEdit}
                                                                        className="flex items-center px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
                                                                    >
                                                                        ✓ Kaydet
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancelEdit}
                                                                        className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
                                                                    >
                                                                        ✕ İptal
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <div className="flex items-start space-x-4">
                                                                    {product.imageUrl ? (
                                                                        <img
                                                                            src={optimizeCloudinaryUrl(product.imageUrl, 64, 64)}
                                                                            alt={product.name}
                                                                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                                                                            <span className="text-gray-400 text-2xl">🍽️</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                                                                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                                                            {product.description}
                                                                        </p>
                                                                        <div className="flex items-center justify-between mt-3">
                                                                            <div className="text-xl font-bold text-green-600">
                                                                                {formatPrice(product.price)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                                                                    <button
                                                                        onClick={() => handleEditProduct(product)}
                                                                        className="flex items-center px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
                                                                        title="Düzenle"
                                                                    >
                                                                        <Edit className="w-4 h-4 mr-1" />
                                                                        Düzenle
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteProduct(product.id)}
                                                                        className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                                                                        title="Sil"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                                        Sil
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ));
                        })()
                    ) : (
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 text-center py-12 px-6">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {`${selectedLanguage === 'tr' ? 'Türkçe' : selectedLanguage === 'en' ? 'İngilizce' : 'Rusça'} dilinde henüz ürün bulunmuyor`}
                            </h3>
                            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                                {`${selectedLanguage === 'tr' ? 'Türkçe' : selectedLanguage === 'en' ? 'İngilizce' : 'Rusça'} dilinde ana sayfaya gidip ilk ürününüzü oluşturun`}
                            </p>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Ürün Oluştur
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
} 