'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import ImageUpload from '@/components/ImageUpload';
import { menuService, categoryService } from '@/lib/api';
import { Menu, CreateMenuData, UpdateMenuData, CreateCategoryData } from '@/lib/types';
import toast from 'react-hot-toast';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';
import Cookies from 'js-cookie';

export default function MenusPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

    const [selectedLanguage, setSelectedLanguage] = useState<string>('tr');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        language: ''
    });

    const [showCategoryForm, setShowCategoryForm] = useState<string | null>(null);
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        imageUrl: ''
    });
    const [categoryLoading, setCategoryLoading] = useState(false);

    const loadMenus = useCallback(async () => {
        try {
            setLoading(true);
            const response = await menuService.getMyMenus(selectedLanguage);
            if (response.isSucceed) {
                const filteredMenus = response.data.filter(menu => menu.language === selectedLanguage);
                setMenus(filteredMenus);
            }
        } catch (error: unknown) {
            console.error('Menüler yüklenirken hata:', error);
            toast.error('Menüler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [selectedLanguage]);

    useEffect(() => {
        loadMenus();
        (window as any).debugLoadMenus = loadMenus;

        // Auth durumu kontrolü
        const checkAuthStatus = () => {
            const token = Cookies.get('accessToken');
            if (!token) {
                console.warn('⚠️ Token bulunamadı, login sayfasına yönlendiriliyor...');
                window.location.href = '/login';
                return;
            }

            try {
                // Token payload'ını decode et ve süresini kontrol et
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    const currentTime = Math.floor(Date.now() / 1000);

                    if (payload.exp && payload.exp < currentTime) {
                        console.warn('⚠️ Token süresi dolmuş, login sayfasına yönlendiriliyor...');
                        Cookies.remove('accessToken');
                        Cookies.remove('refreshToken');
                        window.location.href = '/login';
                        return;
                    }
                }
            } catch (error) {
                console.error('Token decode hatası:', error);
            }
        };

        // İlk kontrol
        checkAuthStatus();

        // Her 30 saniyede bir kontrol et
        const authCheckInterval = setInterval(checkAuthStatus, 30000);

        return () => {
            clearInterval(authCheckInterval);
        };
    }, [loadMenus]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('🚀 Form submit başladı:', { editingMenuId, formData });

        if (!formData.language) {
            toast.error('Menü dili seçmek zorunludur');
            return;
        }

        // Token kontrolü
        const token = Cookies.get('accessToken');
        if (!token) {
            toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
            return;
        }

        console.log('✅ Token var, API çağrısı yapılıyor...');

        try {
            if (editingMenuId && editingMenuId !== 'new') {
                console.log('📝 Güncelleme modu:', editingMenuId);
                // Güncelleme işlemi
                const updateData: UpdateMenuData = {
                    id: editingMenuId,
                    ...formData
                };
                console.log('📤 Update payload:', updateData);

                const response = await menuService.updateMenu(updateData);
                console.log('📥 Update response:', response);

                if (response.isSucceed) {
                    toast.success('Menü güncellendi');
                } else {
                    toast.error(response.message || 'Menü güncellenirken hata oluştu');
                    return;
                }
            } else {
                console.log('🆕 Yeni oluşturma modu');
                // Yeni oluşturma işlemi
                const createData: CreateMenuData = formData;
                console.log('📤 Create payload:', createData);

                const response = await menuService.createMenu(createData);
                console.log('📥 Create response:', response);

                if (response.isSucceed) {
                    toast.success('Menü oluşturuldu');
                } else {
                    toast.error(response.message || 'Menü oluşturulurken hata oluştu');
                    return;
                }
            }

            console.log('✅ API çağrısı başarılı, form resetleniyor...');
            setEditingMenuId(null);
            setFormData({ title: '', description: '', imageUrl: '', language: '' });
            await loadMenus();
            console.log('✅ Menüler yeniden yüklendi');

        } catch (error: unknown) {
            console.error('❌ Menü kaydetme hatası:', error);

            // Axios error kontrolü
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as any;
                console.error('📊 Axios error details:', {
                    status: axiosError.response?.status,
                    data: axiosError.response?.data,
                    headers: axiosError.response?.headers
                });

                if (axiosError.response?.status === 401) {
                    toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
                } else if (axiosError.response?.data?.message) {
                    toast.error(axiosError.response.data.message);
                } else {
                    toast.error('Menü kaydedilirken hata oluştu');
                }
            } else {
                console.error('📊 Non-axios error:', error);
                toast.error('Menü kaydedilirken hata oluştu');
            }
        }
    };

    const handleEdit = (menu: Menu) => {
        setEditingMenuId(menu.id);
        setFormData({
            title: menu.title,
            description: menu.description,
            imageUrl: menu.imageUrl,
            language: menu.language
        });
    };

    const handleCancelEdit = () => {
        setEditingMenuId(null);
        setFormData({ title: '', description: '', imageUrl: '', language: '' });
    };

    const handleDelete = async (menuId: string) => {
        if (!confirm('Bu menüyü silmek istediğinizden emin misiniz?')) return;

        try {
            const response = await menuService.deleteMenu(menuId);
            if (response.isSucceed) {
                toast.success('Menü silindi');
                loadMenus();
            }
        } catch (error: unknown) {
            console.error('Menü silme hatası:', error);
            toast.error('Menü silinirken hata oluştu');
        }
    };

    const handleShowCategoryForm = (menuId: string) => {
        setShowCategoryForm(menuId);
        setCategoryFormData({ name: '', imageUrl: '' });
    };

    const handleCloseCategoryForm = () => {
        setShowCategoryForm(null);
        setCategoryFormData({ name: '', imageUrl: '' });
    };

    const handleCreateCategory = async (e: React.FormEvent, menuId: string) => {
        e.preventDefault();
        if (!categoryFormData.name.trim()) {
            toast.error('Kategori adı zorunludur');
            return;
        }

        try {
            setCategoryLoading(true);
            const categoryData: CreateCategoryData = {
                menuId: menuId,
                name: categoryFormData.name.trim(),
                description: '',
                imageUrl: categoryFormData.imageUrl.trim()
            };

            const response = await categoryService.createCategory(categoryData);

            if (response.isSucceed) {
                toast.success('Alt kategori başarıyla eklendi!');
                handleCloseCategoryForm();
            } else {
                toast.error(response.message || 'Alt kategori oluşturulurken hata oluştu');
            }
        } catch (error: unknown) {
            console.error('Alt kategori oluşturma hatası:', error);
            toast.error('Alt kategori oluşturulurken hata oluştu');
        } finally {
            setCategoryLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-base sm:text-lg">Yükleniyor...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-4 sm:space-y-6 mb-10">
                <div className="flex flex-col gap-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center text-blue-600 hover:text-blue-700 text-sm w-fit"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Ana Sayfaya Dön
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Ana Kategoriler</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Seçilen dile göre ana kategoriler görüntüleniyor.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <button
                                onClick={() => setEditingMenuId('new')}
                                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Yeni Ana Kategori
                            </button>
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
                </div>

                {editingMenuId === 'new' && (
                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4">
                            Yeni Ana Kategori Oluştur
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ana Kategori Adı *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Açıklama *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Görsel URL
                                </label>
                                <ImageUpload
                                    value={formData.imageUrl}
                                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                                    label="Ana Kategori Görseli"
                                    placeholder="Ana kategori için görsel seçin"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Menü Dili *
                                </label>
                                <select
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900"
                                    required
                                >
                                    <option value="" disabled>Dil seçiniz...</option>
                                    <option value="tr">TR</option>
                                    <option value="en">EN</option>
                                    <option value="ru">RU</option>
                                </select>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
                                >
                                    Oluştur
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm sm:text-base"
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {menus.map((menu) => (
                        <div key={menu.id} className="bg-white rounded-lg shadow p-4 sm:p-6">
                            {menu.imageUrl && (
                                <img
                                    src={optimizeCloudinaryUrl(menu.imageUrl, 400, 300)}
                                    alt={menu.title}
                                    className="w-full h-32 sm:h-40 object-cover rounded-lg mb-4"
                                />
                            )}
                            <h3 className="text-base sm:text-lg font-semibold mb-2 truncate text-black">{menu.title}</h3>
                            <p className="text-gray-600 mb-2 text-sm line-clamp-2">{menu.description}</p>
                            <div className="mb-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                    {menu.language === 'tr' && 'TR'}
                                    {menu.language === 'en' && 'EN'}
                                    {menu.language === 'ru' && 'RU'}
                                </span>
                            </div>

                            {editingMenuId === menu.id && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-800 mb-3">Ana Kategori Düzenle</h4>
                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Ana Kategori Adı *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Açıklama *
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={2}
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Görsel URL
                                            </label>
                                            <ImageUpload
                                                value={formData.imageUrl}
                                                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                                                label="Ana Kategori Görseli"
                                                placeholder="Ana kategori için görsel seçin"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Menü Dili *
                                            </label>
                                            <select
                                                value={formData.language}
                                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                                required
                                            >
                                                <option value="" disabled>Dil seçiniz...</option>
                                                <option value="tr">TR</option>
                                                <option value="en">EN</option>
                                                <option value="ru">RU</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                            >
                                                Güncelle
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="flex-1 px-3 py-1.5 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                            >
                                                İptal
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {showCategoryForm === menu.id && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <h4 className="text-sm font-medium text-green-800 mb-3">Alt Kategori Ekle</h4>
                                    <form onSubmit={(e) => handleCreateCategory(e, menu.id)} className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Kategori Adı *
                                            </label>
                                            <input
                                                type="text"
                                                value={categoryFormData.name}
                                                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                                                placeholder="örn: Sıcak İçecekler"
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                disabled={categoryLoading}
                                                className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {categoryLoading ? 'Ekleniyor...' : 'Ekle'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCloseCategoryForm}
                                                className="flex-1 px-3 py-1.5 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                            >
                                                İptal
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <Link
                                    href={`/dashboard/categories?menuId=${menu.id}&language=${selectedLanguage}`}
                                    className="w-full text-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                                >
                                    Alt Kategorileri Görüntüle
                                </Link>

                                {showCategoryForm === menu.id ? null : (
                                    <button
                                        onClick={() => handleShowCategoryForm(menu.id)}
                                        className="w-full text-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm"
                                    >
                                        + Alt Kategori Ekle
                                    </button>
                                )}

                                {editingMenuId === menu.id ? null : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(menu)}
                                            className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                                        >
                                            <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => handleDelete(menu.id)}
                                            className="flex-1 flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                                        >
                                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                            Sil
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {menus.length === 0 && !loading && (
                    <div className="text-center py-8 sm:py-12">
                        <div className="text-gray-500 mb-4">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                            {selectedLanguage === 'tr' ? 'Türkçe' : selectedLanguage === 'en' ? 'İngilizce' : 'Rusça'} dilinde henüz menü yok
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {selectedLanguage === 'tr' ? 'Türkçe' : selectedLanguage === 'en' ? 'İngilizce' : 'Rusça'} dilinde başlamak için ilk menünüzü oluşturun
                        </p>
                        <button
                            onClick={() => setEditingMenuId('new')}
                            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            İlk Menüyü Oluştur
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
} 