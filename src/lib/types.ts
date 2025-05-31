// API Response tipini tanımlıyoruz
export interface ApiResponse<T> {
  isSucceed: boolean;
  message: string;
  data: T;
}

// Kullanıcı tipleri
export interface User {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  userId?: string;
  email: string;
  password: string;
}

// Menü tipleri
export interface Menu {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ownerId: string;
  language: string;
}

export interface CreateMenuData {
  title: string;
  description: string;
  imageUrl: string;
  language: string;
}

export interface UpdateMenuData extends CreateMenuData {
  id: string;
}

// Kategori tipleri
export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  language: string;
}

export interface CreateCategoryData {
  menuId: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface UpdateCategoryData extends CreateCategoryData {
  id: string;
}

// Ürün tipleri
export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  language: string;
}

export interface CreateProductData {
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
}

export interface UpdateProductData extends CreateProductData {
  id: string;
}
