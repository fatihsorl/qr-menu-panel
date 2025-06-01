'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Plus, X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/lib/store';
import { categoryService, menuService, productService } from '@/lib/api';
import { Category, UpdateCategoryData, CreateProductData } from '@/lib/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface CategoryWithMenu extends Category {
    menuTitle?: string;
}

function CategoriesContent() {
    const [categories, setCategories] = useState<CategoryWithMenu[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuTitle, setMenuTitle] = useState<string>('');
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        imageUrl: ''
    });

    // Accordion state - hangi menüler açık
    const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

    // Ürün ekleme state'leri
    const [showProductForm, setShowProductForm] = useState<string | null>(null); // hangi kategori için form açık
    const [productFormData, setProductFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        price: 0
    });
    const [productPriceInput, setProductPriceInput] = useState('');
    const [productLoading, setProductLoading] = useState(false);

    const { user } = useAuthStore();
    const searchParams = useSearchParams();
    const menuId = searchParams.get('menuId'); // URL'den menuId'yi al

    const loadCategoriesForMenu = useCallback(async () => {
        try {
            setLoading(true);
            if (user && menuId) {
                // Önce menü bilgisini al
                const menusResponse = await menuService.getMyMenus();
                if (menusResponse.isSucceed) {
                    const selectedMenu = menusResponse.data.find(menu => menu.id === menuId);
                    if (selectedMenu) {
                        setMenuTitle(selectedMenu.title);

                        // Sadece seçilen menünün kategorilerini al
                        const categoriesResponse = await categoryService.getCategoriesByMenuId(menuId);
                        if (categoriesResponse.isSucceed) {
                            const categoriesWithMenu = categoriesResponse.data.map(cat => ({
                                ...cat,
                                menuTitle: selectedMenu.title
                            }));
                            setCategories(categoriesWithMenu);
                        } else {
                            setCategories([]);
                        }
                    } else {
                        toast.error('Menü bulunamadı');
                        setCategories([]);
                    }
                }
            } else if (user && !menuId) {
                // Eğer menuId yoksa tüm kategorileri göster (eski davranış)
                const menusResponse = await menuService.getMyMenus();
                if (menusResponse.isSucceed && menusResponse.data.length > 0) {
                    const allCategories: CategoryWithMenu[] = [];
                    for (const menu of menusResponse.data) {
                        try {
                            const categoriesResponse = await categoryService.getCategoriesByMenuId(menu.id);
                            if (categoriesResponse.isSucceed) {
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
    }, [user, menuId]);

    useEffect(() => {
        if (user) {
            loadCategoriesForMenu();
        }
    }, [user, loadCategoriesForMenu]);

    const handleDeleteCategory = async (categoryId: string) => {
        if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
            try {
                const response = await categoryService.deleteCategory(categoryId);
                if (response.isSucceed) {
                    toast.success('Kategori başarıyla silindi');
                    loadCategoriesForMenu();
                }
            } catch {
                toast.error('Kategori silinirken hata oluştu');
            }
        }
    };

    const handleEditCategory = (category: CategoryWithMenu) => {
        setEditingCategory(category.id);
        setEditForm({
            name: category.name,
            description: category.description,
            imageUrl: category.imageUrl
        });
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setEditForm({
            name: '',
            description: '',
            imageUrl: ''
        });
    };

    const handleSaveEdit = async (categoryId: string) => {
        if (!editForm.name.trim()) {
            toast.error('Kategori adı zorunludur');
            return;
        }

        try {
            // Kategoriyi bulup menü ID'sini al
            const category = categories.find(cat => cat.id === categoryId);
            if (!category) {
                toast.error('Kategori bulunamadı');
                return;
            }

            // MenuId'yi bulmak için menüleri çek ve bu kategorinin hangi menüye ait olduğunu bul
            const menusResponse = await menuService.getMyMenus();
            let foundMenuId = '';

            if (menusResponse.isSucceed) {
                for (const menu of menusResponse.data) {
                    const categoriesResponse = await categoryService.getCategoriesByMenuId(menu.id);
                    if (categoriesResponse.isSucceed) {
                        const found = categoriesResponse.data.find(cat => cat.id === categoryId);
                        if (found) {
                            foundMenuId = menu.id;
                            break;
                        }
                    }
                }
            }

            if (!foundMenuId) {
                toast.error('Kategori menüsü bulunamadı');
                return;
            }

            const updateData: UpdateCategoryData = {
                id: categoryId,
                menuId: foundMenuId,
                name: editForm.name.trim(),
                description: editForm.description.trim(),
                imageUrl: editForm.imageUrl.trim()
            };

            const response = await categoryService.updateCategory(updateData);
            if (response.isSucceed) {
                toast.success('Kategori başarıyla güncellendi');
                setEditingCategory(null);
                loadCategoriesForMenu();
            } else {
                toast.error(response.message || 'Kategori güncellenirken hata oluştu');
            }
        } catch (error: unknown) {
            console.error('Kategori güncelleme hatası:', error);
            toast.error('Kategori güncellenirken hata oluştu');
        }
    };

    // Ürün ekleme fonksiyonları
    const handleShowProductForm = (categoryId: string) => {
        setShowProductForm(categoryId);
        setProductFormData({
            name: '',
            description: '',
            imageUrl: '',
            price: 0
        });
        setProductPriceInput('');
    };

    const handleCloseProductForm = () => {
        setShowProductForm(null);
        setProductFormData({
            name: '',
            description: '',
            imageUrl: '',
            price: 0
        });
        setProductPriceInput('');
    };

    const handleCreateProduct = async (e: React.FormEvent, categoryId: string) => {
        e.preventDefault();
        setProductLoading(true);

        try {
            const price = parseFloat(productPriceInput);

            if (!productFormData.name.trim() || !productFormData.description.trim() || isNaN(price) || price <= 0) {
                toast.error('Lütfen tüm zorunlu alanları doldurun ve geçerli bir fiyat girin');
                return;
            }

            const productData: CreateProductData = {
                categoryId,
                name: productFormData.name.trim(),
                description: productFormData.description.trim(),
                imageUrl: productFormData.imageUrl.trim(),
                price
            };

            const response = await productService.createProduct(productData);

            if (response.isSucceed) {
                toast.success('Ürün başarıyla eklendi');
                handleCloseProductForm();
                // Gerekirse kategorileri yeniden yükle
                await loadCategoriesForMenu();
            } else {
                toast.error(response.message || 'Ürün eklenirken hata oluştu');
            }
        } catch (error: unknown) {
            console.error('Ürün ekleme hatası:', error);
            toast.error('Ürün eklenirken hata oluştu');
        } finally {
            setProductLoading(false);
        }
    };

    const toggleMenuExpansion = (menuTitle: string) => {
        setExpandedMenus(prev => {
            const newSet = new Set(prev);
            if (newSet.has(menuTitle)) {
                newSet.delete(menuTitle);
            } else {
                newSet.add(menuTitle);
            }
            return newSet;
        });
    };

    // İlk yüklendiğinde eğer tek menü varsa otomatik aç
    useEffect(() => {
        if (categories.length > 0) {
            const groupedCategories = categories.reduce((groups, category) => {
                const menuTitle = category.menuTitle || 'Bilinmeyen Menü';
                if (!groups[menuTitle]) {
                    groups[menuTitle] = [];
                }
                groups[menuTitle].push(category);
                return groups;
            }, {} as Record<string, CategoryWithMenu[]>);

            const menuTitles = Object.keys(groupedCategories);

            // Eğer tek menü varsa veya URL'de menuId varsa otomatik aç
            if (menuTitles.length === 1 || menuId) {
                setExpandedMenus(new Set(menuTitles));
            }
        }
    }, [categories, menuId]);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <Link
                        href={menuId ? "/dashboard/menus" : "/dashboard"}
                        className="flex items-center text-blue-600 hover:text-blue-700 text-sm w-fit"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {menuId ? "Menülere Dön" : "Ana Sayfaya Dön"}
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {menuId && menuTitle ? `"${menuTitle}" Alt Kategorileri` : 'Tüm Alt Kategoriler'}
                    </h1>
                    {menuId && menuTitle && (
                        <p className="text-sm text-gray-600">
                            Bu sayfada "{menuTitle}" ana menüsüne ait kategorileri görüntüleyebilirsiniz.
                        </p>
                    )}
                </div>
            </div>

            {/* Categories List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center py-8 sm:py-12">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : categories.length > 0 ? (
                    (() => {
                        // Kategorileri ana menülerine göre grupla
                        const groupedCategories = categories.reduce((groups, category) => {
                            const menuTitle = category.menuTitle || 'Bilinmeyen Menü';
                            if (!groups[menuTitle]) {
                                groups[menuTitle] = [];
                            }
                            groups[menuTitle].push(category);
                            return groups;
                        }, {} as Record<string, CategoryWithMenu[]>);

                        return Object.entries(groupedCategories).map(([menuTitle, menuCategories]) => (
                            <div key={menuTitle} className="space-y-4">
                                {/* Ana Menü Başlığı - Clickable */}
                                <div
                                    onClick={() => toggleMenuExpansion(menuTitle)}
                                    className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 border border-green-200 cursor-pointer hover:from-green-200 hover:to-blue-200 transition-all duration-200 hover:shadow-md select-none"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
                                                <span className="text-white font-bold text-lg">🍽️</span>
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-800">{menuTitle}</h2>
                                                <p className="text-sm text-gray-600">
                                                    {menuCategories.length} kategori
                                                    {expandedMenus.has(menuTitle) ? ' gösteriliyor' : ' • Görmek için tıklayın'}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Açılır/Kapanır Icon */}
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600 font-medium hidden sm:block">
                                                {expandedMenus.has(menuTitle) ? 'Kapat' : 'Aç'}
                                            </span>
                                            <div className={`transition-transform duration-200 ${expandedMenus.has(menuTitle) ? 'transform rotate-180' : ''}`}>
                                                <ChevronDown className="w-5 h-5 text-gray-600" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bu ana menüye ait kategoriler - Conditional Rendering */}
                                {expandedMenus.has(menuTitle) && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 animate-fadeIn">
                                        {menuCategories.map((category) => (
                                            <div key={category.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                                {/* Category Content */}
                                                <div className="p-4">
                                                    {editingCategory === category.id ? (
                                                        // Düzenleme formu
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Kategori Adı *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={editForm.name}
                                                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                                                                    placeholder="Kategori adını girin"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Açıklama
                                                                </label>
                                                                <textarea
                                                                    value={editForm.description}
                                                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                                                                    rows={3}
                                                                    placeholder="Kategori açıklaması"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Görsel URL
                                                                </label>
                                                                <input
                                                                    type="url"
                                                                    value={editForm.imageUrl}
                                                                    onChange={(e) => setEditForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                                                                    placeholder="https://example.com/image.jpg"
                                                                />
                                                            </div>
                                                            <div className="flex items-center space-x-2 pt-2">
                                                                <button
                                                                    onClick={() => handleSaveEdit(category.id)}
                                                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                                                >
                                                                    <Save className="w-4 h-4 mr-2" />
                                                                    Kaydet
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEdit}
                                                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                                                                >
                                                                    <X className="w-4 h-4 mr-2" />
                                                                    İptal
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // Normal görünüm
                                                        <div className="space-y-4">
                                                            <div className="flex items-start space-x-4">
                                                                {category.imageUrl ? (
                                                                    <img
                                                                        src={category.imageUrl}
                                                                        alt={category.name}
                                                                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                                                    />
                                                                ) : (
                                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                                                                        <span className="text-gray-400 text-2xl">📁</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{category.name}</h3>
                                                                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                                                        {category.description || 'Açıklama bulunmuyor'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Ürün ekleme formu */}
                                                            {showProductForm === category.id && (
                                                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                                                    <h4 className="text-sm font-medium text-purple-800 mb-3">Ürün Ekle</h4>
                                                                    <form onSubmit={(e) => handleCreateProduct(e, category.id)} className="space-y-3">
                                                                        <div>
                                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                                Ürün Adı *
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                value={productFormData.name}
                                                                                onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                                                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                                                                                placeholder="örn: Latte"
                                                                                required
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                                Açıklama *
                                                                            </label>
                                                                            <textarea
                                                                                value={productFormData.description}
                                                                                onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                                                                                rows={2}
                                                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                                                                                placeholder="Ürün açıklaması"
                                                                                required
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                                Fiyat (₺) *
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                value={productPriceInput}
                                                                                onChange={(e) => setProductPriceInput(e.target.value)}
                                                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                                                                                placeholder="25.00"
                                                                                min="0"
                                                                                step="0.01"
                                                                                required
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                                Görsel URL
                                                                            </label>
                                                                            <input
                                                                                type="url"
                                                                                value={productFormData.imageUrl}
                                                                                onChange={(e) => setProductFormData({ ...productFormData, imageUrl: e.target.value })}
                                                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                                                                                placeholder="https://example.com/image.jpg"
                                                                            />
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                type="submit"
                                                                                disabled={productLoading}
                                                                                className="flex-1 px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                                                                            >
                                                                                {productLoading ? 'Ekleniyor...' : 'Ekle'}
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={handleCloseProductForm}
                                                                                className="flex-1 px-3 py-1.5 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                                                            >
                                                                                İptal
                                                                            </button>
                                                                        </div>
                                                                    </form>
                                                                </div>
                                                            )}

                                                            {/* Action Buttons */}
                                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                                <div className="flex items-center space-x-2">
                                                                    <button
                                                                        onClick={() => handleEditCategory(category)}
                                                                        className="flex items-center px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
                                                                        title="Düzenle"
                                                                    >
                                                                        <Edit className="w-4 h-4 mr-1" />
                                                                        Düzenle
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteCategory(category.id)}
                                                                        className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                                                                        title="Sil"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                                        Sil
                                                                    </button>
                                                                </div>

                                                                {/* Ürün ekleme butonu */}
                                                                {showProductForm === category.id ? null : (
                                                                    <button
                                                                        onClick={() => handleShowProductForm(category.id)}
                                                                        className="flex items-center px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
                                                                        title="Ürün Ekle"
                                                                    >
                                                                        <Plus className="w-4 h-4 mr-1" />
                                                                        Ürün Ekle
                                                                    </button>
                                                                )}
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {menuId && menuTitle ?
                                `"${menuTitle}" menüsünde henüz kategori bulunmuyor` :
                                'Henüz kategori oluşturmadınız'
                            }
                        </h3>
                        <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                            {menuId && menuTitle ?
                                'Bu menüye kategori eklemek için ana sayfaya gidin' :
                                'Ana sayfaya gidip ilk kategorinizi oluşturun'
                            }
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Kategori Oluştur
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CategoriesPage() {
    return (
        <DashboardLayout>
            <Suspense
                fallback={
                    <div className="flex items-center justify-center py-8 sm:py-12">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                }
            >
                <CategoriesContent />
            </Suspense>
        </DashboardLayout>
    );
} 