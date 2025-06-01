'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { menuService, categoryService } from '@/lib/api';
import { Menu, CreateMenuData, UpdateMenuData, CreateCategoryData } from '@/lib/types';
import toast from 'react-hot-toast';

export default function MenusPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

    // Ana kategori formu
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        language: 'tr'
    });

    // Alt kategori ekleme state'leri
    const [showCategoryForm, setShowCategoryForm] = useState<string | null>(null); // hangi menu için form açık
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        imageUrl: ''
    });
    const [categoryLoading, setCategoryLoading] = useState(false);

    const loadMenus = useCallback(async () => {
        try {
            setLoading(true);
            const response = await menuService.getMyMenus();
            if (response.isSucceed) {
                setMenus(response.data);
            }
        } catch (error: unknown) {
            console.error('Menüler yüklenirken hata:', error);
            toast.error('Menüler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMenus();
    }, [loadMenus]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingMenu) {
                const updateData: UpdateMenuData = {
                    id: editingMenu.id,
                    ...formData
                };
                const response = await menuService.updateMenu(updateData);
                if (response.isSucceed) {
                    toast.success('Menü güncellendi');
                }
            } else {
                const createData: CreateMenuData = formData;
                const response = await menuService.createMenu(createData);
                if (response.isSucceed) {
                    toast.success('Menü oluşturuldu');
                }
            }

            setShowForm(false);
            setEditingMenu(null);
            setFormData({ title: '', description: '', imageUrl: '', language: 'tr' });
            loadMenus();
        } catch (error: unknown) {
            console.error('Menü kaydetme hatası:', error);
            toast.error('Menü kaydedilirken hata oluştu');
        }
    };

    const handleEdit = (menu: Menu) => {
        setEditingMenu(menu);
        setFormData({
            title: menu.title,
            description: menu.description,
            imageUrl: menu.imageUrl,
            language: menu.language
        });
        setShowForm(true);
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

    // Alt kategori ekleme fonksiyonları
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
                description: '', // Açıklama boş gönderiliyor
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
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Ana Kategoriler</h1>
                </div>

                {showForm && (
                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4">
                            {editingMenu ? 'Ana Kategori Düzenle' : 'Yeni Ana Kategori Oluştur'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ana Kategori Adı
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
                                    Açıklama
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
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
                                >
                                    {editingMenu ? 'Güncelle' : 'Oluştur'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingMenu(null);
                                        setFormData({ title: '', description: '', imageUrl: '', language: 'tr' });
                                    }}
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
                                    src={menu.imageUrl}
                                    alt={menu.title}
                                    className="w-full h-32 sm:h-40 object-cover rounded-lg mb-4"
                                />
                            )}
                            <h3 className="text-base sm:text-lg font-semibold mb-2 truncate">{menu.title}</h3>
                            <p className="text-gray-600 mb-4 text-sm line-clamp-2">{menu.description}</p>

                            {/* Alt kategori ekleme formu */}
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
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Görsel URL
                                            </label>
                                            <input
                                                type="url"
                                                value={categoryFormData.imageUrl}
                                                onChange={(e) => setCategoryFormData({ ...categoryFormData, imageUrl: e.target.value })}
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                                                placeholder="https://example.com/image.jpg"
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
                                    href={`/dashboard/categories?menuId=${menu.id}`}
                                    className="w-full text-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                                >
                                    Alt Kategorileri Görüntüle
                                </Link>

                                {/* Alt kategori ekleme butonu */}
                                {showCategoryForm === menu.id ? null : (
                                    <button
                                        onClick={() => handleShowCategoryForm(menu.id)}
                                        className="w-full text-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm"
                                    >
                                        + Alt Kategori Ekle
                                    </button>
                                )}

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
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Henüz menü yok</h3>
                        <p className="text-sm text-gray-500 mb-4">Başlamak için ilk menünüzü oluşturun</p>
                        <button
                            onClick={() => setShowForm(true)}
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