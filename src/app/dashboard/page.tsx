'use client';

import { useState } from 'react';
import { ChevronRight, Check, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/lib/store';
import { menuService, categoryService, productService, authService } from '@/lib/api';
import { Menu, Category, CreateMenuData, CreateCategoryData, CreateProductData } from '@/lib/types';
import toast from 'react-hot-toast';

export default function DashboardPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [createdMenu, setCreatedMenu] = useState<Menu | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuthStore();

    // Form states
    const [menuForm, setMenuForm] = useState({
        title: '',
        description: '',
        imageUrl: '',
        language: 'tr'
    });

    const [categoryForm, setCategoryForm] = useState({
        name: '',
        description: '',
        imageUrl: ''
    });

    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        imageUrl: '',
        price: 0
    });

    // 1. Menü Oluşturma
    const handleCreateMenu = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!menuForm.title.trim() || !menuForm.description.trim()) {
            toast.error('Menü adı ve açıklama zorunludur');
            return;
        }

        try {
            setLoading(true);
            const menuData: CreateMenuData = {
                title: menuForm.title.trim(),
                description: menuForm.description.trim(),
                imageUrl: menuForm.imageUrl.trim(),
                language: menuForm.language
            };

            const response = await menuService.createMenu(menuData);

            if (response.isSucceed) {
                setCreatedMenu(response.data);
                toast.success('Menü başarıyla oluşturuldu');
                setCurrentStep(2);
            } else {
                toast.error(response.message || 'Menü oluşturulurken hata oluştu');
            }
        } catch (error: unknown) {
            console.error('Menü oluşturma hatası:', error);
            toast.error('Menü oluşturulurken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    // 2. Kategori Oluşturma
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryForm.name.trim() || !categoryForm.description.trim() || !createdMenu) {
            toast.error('Kategori adı ve açıklama zorunludur');
            return;
        }

        try {
            setLoading(true);
            const categoryData: CreateCategoryData = {
                menuId: createdMenu.id,
                name: categoryForm.name.trim(),
                description: categoryForm.description.trim(),
                imageUrl: categoryForm.imageUrl.trim()
            };

            const response = await categoryService.createCategory(categoryData);

            if (response.isSucceed) {
                setCategories([...categories, response.data]);
                setCategoryForm({ name: '', description: '', imageUrl: '' });
                toast.success('Kategori başarıyla eklendi');
            } else {
                toast.error(response.message || 'Kategori oluşturulurken hata oluştu');
            }
        } catch (error: unknown) {
            console.error('Kategori oluşturma hatası:', error);
            toast.error('Kategori oluşturulurken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    // 3. Ürün Oluşturma
    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productForm.name.trim() || !productForm.description.trim() || !selectedCategory || productForm.price <= 0) {
            toast.error('Tüm alanlar zorunludur ve fiyat 0\'dan büyük olmalı');
            return;
        }

        try {
            setLoading(true);
            const productData: CreateProductData = {
                categoryId: selectedCategory.id,
                name: productForm.name.trim(),
                description: productForm.description.trim(),
                imageUrl: productForm.imageUrl.trim(),
                price: productForm.price
            };

            const response = await productService.createProduct(productData);

            if (response.isSucceed) {
                setProductForm({ name: '', description: '', imageUrl: '', price: 0 });
                toast.success('Ürün başarıyla eklendi');
            } else {
                toast.error(response.message || 'Ürün oluşturulurken hata oluştu');
            }
        } catch (error: unknown) {
            console.error('Ürün oluşturma hatası:', error);
            toast.error('Ürün oluşturulurken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Menü Yönetimi</h1>
                    <p className="text-gray-600">Menünüzü 3 adımda oluşturun</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center space-x-4 mb-8">
                    {[
                        { step: 1, title: "Menü" },
                        { step: 2, title: "Kategori" },
                        { step: 3, title: "Ürün" }
                    ].map((item, index) => (
                        <div key={item.step} className="flex items-center">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold
                                ${currentStep >= item.step ? 'bg-blue-500' : 'bg-gray-300'}
                                ${currentStep === item.step ? 'ring-4 ring-blue-200' : ''}
                            `}>
                                {currentStep > item.step ? <Check className="w-5 h-5" /> : item.step}
                            </div>
                            <span className={`ml-2 text-sm font-medium ${currentStep >= item.step ? 'text-blue-600' : 'text-gray-500'
                                }`}>
                                {item.title}
                            </span>
                            {index < 2 && (
                                <ChevronRight className={`w-5 h-5 mx-4 ${currentStep > item.step ? 'text-blue-500' : 'text-gray-300'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ana Menü Oluştur</h2>
                        <p className="text-gray-600 mb-6">Menünüzün temel bilgilerini girin</p>

                        <form onSubmit={handleCreateMenu} className="space-y-4">
                            <div>
                                <label htmlFor="menu-title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Menü Adı *
                                </label>
                                <input
                                    id="menu-title"
                                    type="text"
                                    value={menuForm.title}
                                    onChange={(e) => setMenuForm({ ...menuForm, title: e.target.value })}
                                    placeholder="örn: Kahve Menüsü"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="menu-description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Açıklama *
                                </label>
                                <textarea
                                    id="menu-description"
                                    value={menuForm.description}
                                    onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                                    placeholder="Menünüz hakkında kısa bilgi"
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="menu-image" className="block text-sm font-medium text-gray-700 mb-1">
                                    Görsel URL (opsiyonel)
                                </label>
                                <input
                                    id="menu-image"
                                    type="url"
                                    value={menuForm.imageUrl}
                                    onChange={(e) => setMenuForm({ ...menuForm, imageUrl: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                            >
                                {loading ? 'Oluşturuluyor...' : 'Menü Oluştur'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 2: Kategori Ekleme */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Check className="w-5 h-5 text-green-600 mr-2" />
                                <span className="text-green-800">Menü oluşturuldu: <strong>{createdMenu?.title}</strong></span>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Kategori Ekle</h2>
                            <p className="text-gray-600 mb-6">Menünüze kategoriler ekleyin</p>

                            <form onSubmit={handleCreateCategory} className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kategori Adı *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={categoryForm.name}
                                        onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="örn: Sıcak İçecekler"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Açıklama *
                                    </label>
                                    <textarea
                                        required
                                        value={categoryForm.description}
                                        onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Kategori açıklaması"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Görsel (opsiyonel)
                                    </label>
                                    <input
                                        type="url"
                                        value={categoryForm.imageUrl}
                                        onChange={(e) => setCategoryForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Ekleniyor...' : 'Kategori Ekle'}
                                </button>
                            </form>

                            {categories.length > 0 && (
                                <>
                                    <div className="border-t pt-4">
                                        <h3 className="font-medium mb-3">
                                            Eklenen Kategoriler ({categories.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {categories.map((category) => (
                                                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center">
                                                        <span className="mr-3 text-green-600">🗂️</span>
                                                        <div>
                                                            <h4 className="font-medium">{category.name}</h4>
                                                            <p className="text-sm text-gray-600">{category.description}</p>
                                                        </div>
                                                    </div>
                                                    <Check className="w-5 h-5 text-green-600" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setCurrentStep(3)}
                                        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Ürün Eklemeye Geç
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Ürün Ekleme */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Check className="w-5 h-5 text-green-600 mr-2" />
                                <span className="text-green-800">{categories.length} kategori eklendi</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ürün Ekle</h2>
                            <p className="text-gray-600 mb-6">Kategorilerinize ürün ekleyin</p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kategori Seçin *
                                </label>
                                <select
                                    value={selectedCategory?.id || ''}
                                    onChange={(e) => setSelectedCategory(categories.find(c => c.id === e.target.value) || null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Kategori seçin...</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedCategory && (
                                <form onSubmit={handleCreateProduct} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ürün Adı *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={productForm.name}
                                            onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="örn: Latte"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Açıklama *
                                        </label>
                                        <textarea
                                            required
                                            value={productForm.description}
                                            onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ürün açıklaması"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fiyat (₺) *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={productForm.price || ''}
                                            onChange={(e) => setProductForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="25.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Görsel (opsiyonel)
                                        </label>
                                        <input
                                            type="url"
                                            value={productForm.imageUrl}
                                            onChange={(e) => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Ekleniyor...' : `"${selectedCategory.name}" kategorisine ürün ekle`}
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <h3 className="font-bold text-blue-800 mb-2">Menünüz Hazır! 🎉</h3>
                            <p className="text-blue-700 text-sm">
                                İstediğiniz kadar ürün eklemeye devam edebilirsiniz.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
} 