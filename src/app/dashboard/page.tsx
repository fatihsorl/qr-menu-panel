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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Menü Oluşturma Sihirbazı</h1>
                    <p className="text-gray-600">Hiyerarşik menü yapınızı 3 adımda oluşturun</p>

                    {/* Hierarchy Example */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">📊 Menü Hiyerarşisi</h3>
                        <div className="text-sm text-gray-700 space-y-1">
                            <div className="flex items-center justify-center">
                                <span className="bg-blue-100 px-2 py-1 rounded">📋 Menü: &quot;Sıcak İçecekler&quot;</span>
                            </div>
                            <div className="flex items-center justify-center">
                                <span className="mx-2">├──</span>
                                <span className="bg-green-100 px-2 py-1 rounded">🗂️ Kategori: &quot;Kahveler&quot;</span>
                            </div>
                            <div className="flex items-center justify-center">
                                <span className="mx-8">├──</span>
                                <span className="bg-purple-100 px-2 py-1 rounded">☕ Ürün: &quot;Latte - 25₺&quot;</span>
                            </div>
                            <div className="flex items-center justify-center">
                                <span className="mx-8">└──</span>
                                <span className="bg-purple-100 px-2 py-1 rounded">☕ Ürün: &quot;Cappuccino - 23₺&quot;</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* API Debug Area */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                        <h3 className="font-medium text-yellow-800">API Debug Alanı</h3>
                    </div>

                    {/* User Info */}
                    <div className="bg-white p-3 rounded mb-3 text-sm">
                        <h4 className="font-medium mb-2">👤 Kullanıcı Bilgileri:</h4>
                        <p><strong>User:</strong> {user ? 'Var' : 'YOK!'}</p>
                        {user && (
                            <>
                                <p><strong>ID:</strong> {user.id}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Token:</strong> {user.accessToken ? `${user.accessToken.substring(0, 30)}...` : 'YOK!'}</p>
                            </>
                        )}
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={async () => {
                                console.clear();
                                console.log("🧪 TOKEN TEST:");
                                console.log("User object:", user);

                                const cookieToken = document.cookie
                                    .split('; ')
                                    .find((row: string) => row.startsWith('accessToken='))
                                    ?.split('=')[1];

                                console.log("🍪 Cookie Token:", cookieToken ? `${cookieToken.substring(0, 30)}...` : "YOK!");

                                if (!cookieToken) {
                                    console.error("❌ TOKEN YOK! Login olmanız gerekiyor.");
                                    toast.error("Lütfen önce giriş yapın!");
                                    return;
                                }

                                try {
                                    console.log("🔍 API sunucu testi başlatılıyor...");
                                    await authService.testApiServer();
                                } catch (error) {
                                    console.error("❌ API test hatası:", error);
                                }
                            }}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            🧪 Token ve API Durumunu Test Et
                        </button>

                        <button
                            onClick={async () => {
                                console.clear();
                                console.log("🍔 MENÜ API TEST:");

                                const cookieToken = document.cookie
                                    .split('; ')
                                    .find((row: string) => row.startsWith('accessToken='))
                                    ?.split('=')[1];

                                if (!cookieToken) {
                                    console.error("❌ TOKEN YOK! Login olmanız gerekiyor.");
                                    toast.error("Lütfen önce giriş yapın!");
                                    return;
                                }

                                try {
                                    const response = await menuService.getMyMenus();
                                    console.log("✅ Menü API başarılı:", response);
                                    toast.success(`Menü API çalışıyor! ${response.data.length} menü bulundu.`);
                                } catch (error) {
                                    console.error("❌ Menü API hatası:", error);
                                    toast.error("Menü API hatası! Console'u kontrol edin.");
                                }
                            }}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            🍔 Menü API Test Et
                        </button>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center space-x-4 mb-8">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold
                                ${currentStep >= step ? 'bg-blue-500' : 'bg-gray-300'}
                                ${currentStep === step ? 'ring-4 ring-blue-200' : ''}
                            `}>
                                {currentStep > step ? <Check className="w-5 h-5" /> : step}
                            </div>
                            {step < 3 && (
                                <ChevronRight className={`w-5 h-5 mx-2 ${currentStep > step ? 'text-blue-500' : 'text-gray-300'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1️⃣ Menü Oluştur</h2>
                        <p className="text-gray-600 mb-6">Önce ana menünüzü oluşturun</p>

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
                                {loading ? 'Oluşturuluyor...' : 'Menüyü Oluştur'}
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
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mr-3">
                                    🗂️
                                </div>
                                <h2 className="text-xl font-bold">2. Kategoriler Ekleyin (Alt Gruplar)</h2>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg mb-4">
                                <p className="text-green-800 text-sm">
                                    <strong>Kategoriler:</strong> &quot;{createdMenu?.title}&quot; menüsünün alt kategorileridir. Örn: &quot;Kahveler&quot;, &quot;Çaylar&quot;, &quot;Soğuk İçecekler&quot;
                                </p>
                            </div>
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
                                        placeholder="Örn: Kahveler, Çaylar, Detoks İçecekleri"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kategori Açıklaması *
                                    </label>
                                    <textarea
                                        required
                                        value={categoryForm.description}
                                        onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Örn: Özenle seçilmiş kahve çekirdeklerinden hazırlanan sıcak kahve çeşitleri"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kategori Görseli (İsteğe bağlı)
                                    </label>
                                    <input
                                        type="url"
                                        value={categoryForm.imageUrl}
                                        onChange={(e) => setCategoryForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://example.com/coffee-category.jpg"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Ekleniyor...' : '🗂️ Kategori Ekle'}
                                </button>
                            </form>

                            {categories.length > 0 && (
                                <>
                                    <div className="border-t pt-4">
                                        <h3 className="font-medium mb-3">
                                            🗂️ &quot;{createdMenu?.title}&quot; menüsüne eklenen kategoriler ({categories.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {categories.map((category) => (
                                                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center">
                                                        <span className="mr-3 text-green-600">🗂️</span>
                                                        <div>
                                                            <h4 className="font-medium">{category.name}</h4>
                                                            <p className="text-sm text-gray-600">{category.description}</p>
                                                            <p className="text-xs text-gray-500">
                                                                📋 {createdMenu?.title} → 🗂️ {category.name}
                                                            </p>
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
                                        🍽️ Ürün Eklemeye Geç ({categories.length} kategoriye ürün ekleyebilirsiniz)
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
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3">
                                    🍽️
                                </div>
                                <h2 className="text-xl font-bold">3. Ürünler Ekleyin (En Alt Seviye)</h2>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kategori Seçin *
                                </label>
                                <div className="bg-purple-50 p-3 rounded-lg mb-2">
                                    <p className="text-purple-800 text-sm">
                                        <strong>Ürünler:</strong> Seçili kategorinin içindeki satılacak ürünlerdir. Örn: &quot;Latte&quot;, &quot;Cappuccino&quot;, &quot;Americano&quot;
                                    </p>
                                </div>
                                <select
                                    value={selectedCategory?.id || ''}
                                    onChange={(e) => setSelectedCategory(categories.find(c => c.id === e.target.value) || null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Ürün eklemek için kategori seçin...</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            🗂️ {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedCategory && (
                                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                                    <p className="text-blue-800 text-sm">
                                        <strong>📍 Seçili kategori:</strong> &quot;{selectedCategory.name}&quot; - Bu kategoriye ürün ekliyorsunuz
                                    </p>
                                </div>
                            )}

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
                                            placeholder="Örn: Latte, Cappuccino, Türk Kahvesi"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ürün Açıklaması *
                                        </label>
                                        <textarea
                                            required
                                            value={productForm.description}
                                            onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Örn: Zengin aromalı espresso üzerine kremsi süt köpüğü ile hazırlanan klasik İtalyan kahvesi"
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
                                            placeholder="Örn: 25.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ürün Görseli (İsteğe bağlı)
                                        </label>
                                        <input
                                            type="url"
                                            value={productForm.imageUrl}
                                            onChange={(e) => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://example.com/latte-image.jpg"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Ekleniyor...' : `🍽️ "${selectedCategory.name}" kategorisine ürün ekle`}
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="text-center">
                                <h3 className="font-bold text-blue-800 mb-2">🎉 Tebrikler! Menü Hiyerarşiniz Hazır</h3>
                                <div className="text-blue-800 space-y-1">
                                    <p className="font-medium">📋 Ana Menü: &quot;{createdMenu?.title}&quot;</p>
                                    <p>🗂️ {categories.length} kategori eklendi</p>
                                    <p className="text-sm">
                                        İstediğiniz kadar ürün eklemeye devam edebilir, yeni kategoriler oluşturabilirsiniz.
                                    </p>
                                </div>
                                <div className="mt-3 p-2 bg-white rounded text-xs text-gray-600">
                                    <strong>Hiyerarşi:</strong> Menü → Kategoriler → Ürünler
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
} 