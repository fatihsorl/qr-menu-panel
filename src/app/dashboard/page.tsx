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
        language: ''
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

    // Fiyat input'u için ayrı state
    const [productPriceInput, setProductPriceInput] = useState('');

    // Navigasyon fonksiyonları
    const goToStep = (step: number) => {
        setCurrentStep(step);
        // Form temizleme (opsiyonel)
        if (step === 2) {
            setCategoryForm({ name: '', description: '', imageUrl: '' });
        } else if (step === 3) {
            setProductForm({ name: '', description: '', imageUrl: '', price: 0 });
            setProductPriceInput('');
            setSelectedCategory(null);
        }
    };

    const resetAllForms = () => {
        setMenuForm({ title: '', description: '', imageUrl: '', language: '' });
        setCategoryForm({ name: '', description: '', imageUrl: '' });
        setProductForm({ name: '', description: '', imageUrl: '', price: 0 });
        setProductPriceInput('');
        setCreatedMenu(null);
        setCategories([]);
        setSelectedCategory(null);
        setCurrentStep(1);
    };

    // 1. Menü Oluşturma
    const handleCreateMenu = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!menuForm.title.trim()) {
            toast.error('Menü adı zorunludur');
            return;
        }

        if (!menuForm.language) {
            toast.error('Menü dili seçmek zorunludur');
            return;
        }

        try {
            setLoading(true);
            const menuData: CreateMenuData = {
                title: menuForm.title.trim(),
                description: '', // Açıklama otomatik olarak boş gönderiliyor
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
        if (!categoryForm.name.trim() || !createdMenu) {
            toast.error('Kategori adı zorunludur');
            return;
        }

        try {
            setLoading(true);
            const categoryData: CreateCategoryData = {
                menuId: createdMenu.id,
                name: categoryForm.name.trim(),
                description: '', // Açıklama otomatik olarak boş gönderiliyor
                imageUrl: categoryForm.imageUrl.trim()
            };

            // DEBUG: Gönderilen data'yı kontrol et
            console.log('🔍 Kategori oluşturma - Gönderilen data:', categoryData);

            const response = await categoryService.createCategory(categoryData);

            // DEBUG: API'dan dönen response'u kontrol et
            console.log('📡 Kategori oluşturma - API response:', response);

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

        // Fiyat değerini parse et
        const priceValue = parseFloat(productPriceInput) || 0;

        if (!productForm.name.trim() || !productForm.description.trim() || !selectedCategory || priceValue <= 0) {
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
                price: priceValue
            };

            // DEBUG: Gönderilen data'yı kontrol et
            console.log('🔍 Ürün oluşturma - Gönderilen data:', productData);

            const response = await productService.createProduct(productData);

            // DEBUG: API'dan dönen response'u kontrol et
            console.log('📡 Ürün oluşturma - API response:', response);

            if (response.isSucceed) {
                setProductForm({ name: '', description: '', imageUrl: '', price: 0 });
                setProductPriceInput('');
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
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="text-center px-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">QR Menü Yönetimi</h1>
                    <p className="text-gray-600 text-xs sm:text-base">Ana Kategori, Alt Kategori ve Ürünlerinizi 3 adımda oluşturun</p>
                </div>

                {/* Progress Steps - Mobile Responsive */}
                <div className="px-4">
                    {/* Mobile Version - Vertical */}
                    <div className="sm:hidden space-y-4">
                        {[
                            { step: 1, title: "Ana Kategori Oluştur", desc: "Temel bilgiler" },
                            { step: 2, title: "Alt Kategori Ekle", desc: "Ana Kategori alt kategorileri" },
                            { step: 3, title: "Ürün Ekle", desc: "Alt Kategori ürünleri" }
                        ].map((item) => (
                            <div key={item.step} className="flex items-center space-x-3">
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold
                                    ${currentStep >= item.step ? 'bg-blue-500' : 'bg-gray-300'}
                                    ${currentStep === item.step ? 'ring-2 ring-blue-200' : ''}
                                `}>
                                    {currentStep > item.step ? <Check className="w-4 h-4" /> : item.step}
                                </div>
                                <div className="flex-1">
                                    <div className={`text-sm font-medium ${currentStep >= item.step ? 'text-blue-600' : 'text-gray-500'}`}>
                                        {item.title}
                                    </div>
                                    <div className="text-xs text-gray-400">{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Version - Horizontal */}
                    <div className="hidden sm:flex items-center justify-center space-x-4">
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
                                <span className={`ml-2 text-sm font-medium ${currentStep >= item.step ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {item.title}
                                </span>
                                {index < 2 && (
                                    <ChevronRight className={`w-5 h-5 mx-4 ${currentStep > item.step ? 'text-blue-500' : 'text-gray-300'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mx-4 sm:mx-0">


                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Ana Kategori Oluştur</h2>

                        <form onSubmit={handleCreateMenu} className="space-y-4">
                            <div>
                                <label htmlFor="menu-title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Ana Kategori Adı *
                                </label>
                                <input
                                    id="menu-title"
                                    type="text"
                                    value={menuForm.title}
                                    onChange={(e) => setMenuForm({ ...menuForm, title: e.target.value })}
                                    placeholder="örn: Kahve"
                                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="menu-image" className="block text-sm font-medium text-gray-700 mb-1">
                                    Görsel URL
                                </label>
                                <input
                                    id="menu-image"
                                    type="url"
                                    value={menuForm.imageUrl}
                                    onChange={(e) => setMenuForm({ ...menuForm, imageUrl: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900"
                                />
                            </div>

                            <div>
                                <label htmlFor="menu-language" className="block text-sm font-medium text-gray-700 mb-1">
                                    Menü Dili*
                                </label>
                                <select
                                    id="menu-language"
                                    value={menuForm.language}
                                    onChange={(e) => setMenuForm({ ...menuForm, language: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900"
                                    required
                                >
                                    <option value="" disabled>Dil seçiniz...</option>
                                    <option value="tr">TR</option>
                                    <option value="en">EN</option>
                                    <option value="ru">RU</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base"
                            >
                                {loading ? 'Oluşturuluyor...' : 'Menü Oluştur'}
                            </button>
                        </form>

                        {/* Oluşturulan Menü Varsa Diğer Adımlara Geçiş */}
                        {createdMenu && (
                            <div className="mt-6 pt-4 border-t">
                                <div className="flex items-center mb-3">
                                    <Check className="w-4 h-4 text-green-600 mr-2" />
                                    <span className="text-green-800 text-sm">Ana Kategori oluşturuldu: <strong>{createdMenu.title}</strong></span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        onClick={() => goToStep(2)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
                                    >
                                        Alt Kategori Ekle  →
                                    </button>
                                    {categories.length > 0 && (
                                        <button
                                            onClick={() => goToStep(3)}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
                                        >
                                            Ürünler Ekle →
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Kategori Ekleme */}
                {currentStep === 2 && (
                    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                            <div className="flex items-center">
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 flex-shrink-0" />
                                <span className="text-green-800 text-sm sm:text-base">
                                    Menü oluşturuldu: <strong>{createdMenu?.title}</strong>
                                </span>
                            </div>
                        </div>



                        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Alt Kategori Ekle</h2>
                            <p className="text-gray-600 mb-6 text-sm sm:text-base">Menünüze alt kategoriler ekleyin</p>

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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-gray-900"
                                        placeholder="örn: Sıcak İçecekler"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Görsel URL
                                    </label>
                                    <input
                                        type="url"
                                        value={categoryForm.imageUrl}
                                        onChange={(e) => setCategoryForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-gray-900"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                >
                                    {loading ? 'Ekleniyor...' : 'Kategori Ekle'}
                                </button>
                            </form>

                            {categories.length > 0 && (
                                <>
                                    <div className="border-t pt-4">
                                        <h3 className="font-medium mb-3 text-sm sm:text-base">
                                            Eklenen Kategoriler ({categories.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {categories.map((category) => (
                                                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center min-w-0 flex-1">
                                                        <span className="mr-3 text-green-600 flex-shrink-0">🗂️</span>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="font-medium text-sm sm:text-base truncate">{category.name}</h4>
                                                            <p className="text-xs sm:text-sm text-gray-600 truncate">{category.description}</p>
                                                        </div>

                                                    </div>
                                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 ml-2" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                        <button
                                            onClick={() => goToStep(1)}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
                                        >
                                            ← Ana Kategoriyi Düzenle
                                        </button>
                                        <button
                                            onClick={() => goToStep(3)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                                        >
                                            Ürün Eklemeye Geç →
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Ürün Ekleme */}
                {currentStep === 3 && (
                    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                            <div className="flex items-center">
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 flex-shrink-0" />
                                <span className="text-green-800 text-sm sm:text-base">{categories.length} kategori eklendi</span>
                            </div>
                        </div>



                        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Ürün Ekle</h2>
                            <p className="text-gray-600 mb-6 text-sm sm:text-base">Alt Kategorilerinize ürün ekleyin</p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kategori Seçin *
                                </label>
                                <select
                                    value={selectedCategory?.id || ''}
                                    onChange={(e) => setSelectedCategory(categories.find(c => c.id === e.target.value) || null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-gray-900"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-gray-900"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-gray-900"
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
                                            value={productPriceInput}
                                            onChange={(e) => setProductPriceInput(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-gray-900"
                                            placeholder="25.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Görsel URL
                                        </label>
                                        <input
                                            type="url"
                                            value={productForm.imageUrl}
                                            onChange={(e) => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-gray-900"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                    >
                                        {loading ? 'Ekleniyor...' : `"${selectedCategory.name}" kategorisine ürün ekle`}
                                    </button>
                                </form>
                            )}

                            {/* Navigasyon Butonları */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t">
                                <button
                                    onClick={() => goToStep(1)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
                                >
                                    ← Ana Kategori
                                </button>
                                <button
                                    onClick={() => goToStep(2)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
                                >
                                    ← Alt Kategoriler
                                </button>

                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <h3 className="font-bold text-blue-800 mb-2 text-sm sm:text-base">Menünüz Hazır! 🎉</h3>
                            <p className="text-blue-700 text-xs sm:text-sm">
                                İstediğiniz kadar ürün eklemeye devam edebilirsiniz ya da menülerinizi görüntüleyebilirsiniz.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

