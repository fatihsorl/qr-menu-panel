'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/lib/store';
import { menuService } from '@/lib/api';
import { Menu, UpdateMenuData } from '@/lib/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function MenusPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const { user } = useAuthStore();

    // Edit form state
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        imageUrl: '',
        language: 'tr'
    });

    useEffect(() => {
        if (user) {
            loadMenus();
            // Current user ID'sini çıkar
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('accessToken='))
                ?.split('=')[1];

            if (token) {
                try {
                    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                    const userId = tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
                    setCurrentUserId(userId || 'Token\'da bulunamadı');
                } catch (error) {
                    setCurrentUserId('Token parse hatası');
                }
            }
        }
    }, [user]);

    const loadMenus = async () => {
        try {
            setLoading(true);
            if (user) {
                const response = await menuService.getMyMenus();
                if (response.isSucceed) {
                    setMenus(response.data);
                }
            }
        } catch (error: any) {
            console.error('Menüler yüklenirken hata:', error);
            toast.error('Menüler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleEditMenu = (menu: Menu) => {
        setEditingMenu(menu);
        setEditForm({
            title: menu.title,
            description: menu.description,
            imageUrl: menu.imageUrl,
            language: menu.language
        });
        setShowEditModal(true);
    };

    const handleUpdateMenu = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMenu) return;

        try {
            setLoading(true);
            const updateData: UpdateMenuData = {
                id: editingMenu.id,
                title: editForm.title.trim(),
                description: editForm.description.trim(),
                imageUrl: editForm.imageUrl.trim(),
                language: editForm.language
            };

            const response = await menuService.updateMenu(updateData);
            if (response.isSucceed) {
                toast.success('Menü başarıyla güncellendi');
                setShowEditModal(false);
                setEditingMenu(null);
                loadMenus(); // Listeyi yenile
            } else {
                toast.error(response.message || 'Menü güncellenirken hata oluştu');
            }
        } catch (error: any) {
            console.error('Menü güncelleme hatası:', error);
            toast.error('Menü güncellenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMenu = async (menuId: string, menuTitle: string) => {
        if (window.confirm(`"${menuTitle}" menüsünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
            try {
                setLoading(true);
                const response = await menuService.deleteMenu(menuId);
                if (response.isSucceed) {
                    toast.success('Menü başarıyla silindi');
                    loadMenus(); // Listeyi yenile
                } else {
                    toast.error(response.message || 'Menü silinirken hata oluştu');
                }
            } catch (error: any) {
                console.error('Menü silme hatası:', error);
                toast.error('Menü silinirken hata oluştu');
            } finally {
                setLoading(false);
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
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Oluşturulan Menüler</h1>
                        <p className="text-sm text-gray-600">Current User ID: {currentUserId}</p>
                    </div>
                </div>

                {/* Menus List */}
                <div className="bg-white rounded-lg shadow">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : menus.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {menus.map((menu) => (
                                <div key={menu.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            {menu.imageUrl ? (
                                                <img
                                                    src={menu.imageUrl}
                                                    alt={menu.title}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">Görsel Yok</span>
                                                </div>
                                            )}

                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{menu.title}</h3>
                                                <p className="text-gray-600 mt-1">{menu.description}</p>
                                                <div className="flex items-center mt-2 space-x-3">
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        {menu.language.toUpperCase()}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Menü ID: {menu.id}
                                                    </span>
                                                    <span className="text-xs text-red-500">
                                                        Owner: {menu.ownerId}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleEditMenu(menu)}
                                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                title="Düzenle"
                                                disabled={loading}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMenu(menu.id, menu.title)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Sil"
                                                disabled={loading}
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Henüz menü oluşturmadınız
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Ana sayfaya gidip ilk menünüzü oluşturun
                            </p>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Ana Sayfaya Dön
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && editingMenu && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h2 className="text-xl font-bold mb-4">Menü Düzenle</h2>
                        <form onSubmit={handleUpdateMenu} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Menü Adı *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.title}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Menü Açıklaması *
                                </label>
                                <textarea
                                    required
                                    value={editForm.description}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Menü Görseli (İsteğe bağlı)
                                </label>
                                <input
                                    type="url"
                                    value={editForm.imageUrl}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dil
                                </label>
                                <select
                                    value={editForm.language}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, language: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="tr">Türkçe</option>
                                    <option value="en">İngilizce</option>
                                    <option value="de">Almanca</option>
                                    <option value="fr">Fransızca</option>
                                </select>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingMenu(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    disabled={loading}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Güncelleniyor...' : 'Güncelle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
} 