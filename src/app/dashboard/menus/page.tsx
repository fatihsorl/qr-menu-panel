'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { menuService } from '@/lib/api';
import { Menu, CreateMenuData, UpdateMenuData } from '@/lib/types';
import toast from 'react-hot-toast';

export default function MenusPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        language: 'tr'
    });

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

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Yükleniyor...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Menüler</h1>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Menü
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingMenu ? 'Menü Düzenle' : 'Yeni Menü Oluştur'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Menü Adı
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menus.map((menu) => (
                        <div key={menu.id} className="bg-white rounded-lg shadow p-6">
                            {menu.imageUrl && (
                                <img
                                    src={menu.imageUrl}
                                    alt={menu.title}
                                    className="w-full h-40 object-cover rounded-lg mb-4"
                                />
                            )}
                            <h3 className="text-lg font-semibold mb-2">{menu.title}</h3>
                            <p className="text-gray-600 mb-4">{menu.description}</p>
                            <div className="flex gap-2">
                                <Link
                                    href={`/dashboard/categories?menuId=${menu.id}`}
                                    className="flex-1 text-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                >
                                    Kategoriler
                                </Link>
                                <button
                                    onClick={() => handleEdit(menu)}
                                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(menu.id)}
                                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {menus.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">Henüz menü bulunmuyor</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            İlk Menünü Oluştur
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
} 