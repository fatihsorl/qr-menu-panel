import axios from "axios";
import Cookies from "js-cookie";
import {
  ApiResponse,
  User,
  LoginCredentials,
  RegisterCredentials,
  Menu,
  CreateMenuData,
  UpdateMenuData,
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  Product,
  CreateProductData,
  UpdateProductData,
} from "./types";

// Base API URL - gerçek API endpoint'inizi buraya yazın
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://jovial-bouman.104-247-167-194.plesk.page";

// Axios instance oluşturuyoruz
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - token'ı otomatik olarak ekler
api.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");

  console.log("🚀 ===== API REQUEST DETAYLARI =====");
  console.log("📍 Full URL:", `${config.baseURL}${config.url}`);
  console.log(
    "🔑 Token:",
    token ? `${token.substring(0, 20)}...` : "❌ TOKEN YOK!"
  );
  console.log("📋 Method:", config.method?.toUpperCase());
  console.log("📦 Data:", config.data);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Authorization header eklendi");
  } else {
    console.log("❌ TOKEN YOK! Authorization header eklenmedi");
  }

  console.log("📤 Gönderilen Headers:", {
    Authorization: config.headers.Authorization,
    "Content-Type": config.headers["Content-Type"],
    Accept: config.headers.Accept,
  });
  console.log("=======================================");

  return config;
});

// Response interceptor - 401 durumunda logout yapar
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get("refreshToken");

      if (refreshToken) {
        try {
          console.log("🔄 Token yenilenmeye çalışılıyor...");

          // Refresh token ile yeni access token al
          const refreshResponse = await axios.post(
            `${BASE_URL}/api/auth/refresh-token`,
            {
              refreshToken: refreshToken,
            }
          );

          if (refreshResponse.data.isSucceed) {
            const {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            } = refreshResponse.data.data;

            // Yeni token'ları kaydet
            Cookies.set("accessToken", newAccessToken, { expires: 7 });
            if (newRefreshToken) {
              Cookies.set("refreshToken", newRefreshToken, { expires: 30 });
            }

            // Orijinal isteği yeni token ile tekrar dene
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            console.log("✅ Token yenilendi, istek tekrarlanıyor...");

            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("❌ Token yenileme başarısız:", refreshError);
        }
      }

      // Token yenilenemedin, logout yap
      console.log("🚪 Oturum sonlandırılıyor...");
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");

      // Store'a logout bilgisi gönder
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:logout"));
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    }

    return Promise.reject(error);
  }
);

// Auth servisleri
export const authService = {
  // API sunucu durumunu test et
  testApiServer: async (): Promise<void> => {
    console.log("🔍 API sunucu testi başlatılıyor...");
    console.log("🌐 Base URL:", BASE_URL);

    // Basit GET isteği ile test
    const testEndpoints = ["/", "/api", "/health", "/api/health", "/status"];

    for (const endpoint of testEndpoints) {
      try {
        console.log(`🧪 Test edilen: ${BASE_URL}${endpoint}`);
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          method: "GET",
        });
        console.log(
          `✅ ${endpoint} yanıt verdi:`,
          response.status,
          response.statusText
        );

        if (response.ok) {
          const text = await response.text();
          console.log(`📄 İçerik:`, text.substring(0, 200));
        }
      } catch (error: any) {
        console.log(`❌ ${endpoint} hata:`, error);
      }
    }
  },

  // Kayıt olma
  register: async (
    credentials: RegisterCredentials
  ): Promise<ApiResponse<User>> => {
    const response = await api.post("/api/auth/register", credentials);
    return response.data;
  },

  // Giriş yapma
  login: async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  },

  // Kullanıcı bilgilerini alma
  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  // Token yenileme
  refreshToken: async (
    userData: User
  ): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    const response = await api.post("/api/auth/refresh-token", userData);
    return response.data;
  },

  // Şifre sıfırlama
  resetPassword: async (
    email: string,
    newPassword: string
  ): Promise<ApiResponse<null>> => {
    const response = await api.post("/api/auth/reset-password", {
      email,
      newPassword,
    });
    return response.data;
  },
};

// Menü servisleri
export const menuService = {
  // Kendi menülerini listeleme
  getMyMenus: async (): Promise<ApiResponse<Menu[]>> => {
    console.log("🍔 Menü API çağrısı başlatılıyor...");
    console.log("🌐 Base URL:", BASE_URL);

    // Token kontrolü
    const token = Cookies.get("accessToken");
    console.log("🔑 Access Token:", token ? "✅ Mevcut" : "❌ YOK!");

    if (!token) {
      throw new Error("Token bulunamadı! Lütfen tekrar giriş yapın.");
    }

    try {
      // Token'dan user bilgisini çıkaralım (JWT decode)
      console.log("🔍 Token debug başlıyor...");
      console.log("📜 Raw Token:", token);

      const tokenParts = token.split(".");
      console.log("🔧 Token parçaları sayısı:", tokenParts.length);

      if (tokenParts.length !== 3) {
        throw new Error("Geçersiz JWT token formatı!");
      }

      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      console.log("📋 Token Payload (tüm içerik):", tokenPayload);

      // Farklı user ID field'larını kontrol edelim
      const possibleUserIdFields = [
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", // ASP.NET Core
        "sub",
        "userId",
        "id",
        "user_id",
        "uid",
        "nameid",
        "unique_name",
      ];
      let userId = null;

      for (const field of possibleUserIdFields) {
        if (tokenPayload[field]) {
          userId = tokenPayload[field];
          console.log(`✅ User ID bulundu! Field: ${field}, Value: ${userId}`);
          break;
        }
      }

      console.log("👤 Final User ID:", userId);

      if (!userId) {
        console.error("🚨 TOKEN YAPISI:", Object.keys(tokenPayload));
        throw new Error(
          "Token'da kullanıcı ID'si bulunamadı! Desteklenen field'lar: " +
            possibleUserIdFields.join(", ")
        );
      }

      // Query parametreleri ile API çağrısı
      const params = new URLSearchParams({
        ownerId: userId,
        language: "tr",
      });

      console.log(
        "📡 API çağrısı:",
        `GET /api/base/menus?${params.toString()}`
      );

      const response = await api.get(`/api/base/menus?${params.toString()}`);
      console.log("✅ API başarılı:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ API hatası:",
        error.response?.status,
        error.response?.data
      );

      // Token decode hatası
      if (error instanceof Error && error.message?.includes("Token")) {
        console.error("🚨 TOKEN SORUNU:", error.message);
        throw new Error(
          "Giriş bilgileriniz geçersiz. Lütfen tekrar giriş yapın."
        );
      }

      // Hata detayları
      if (error.response) {
        console.error("📄 Response Headers:", error.response.headers);
        console.error("📊 Response Status:", error.response.status);
        console.error("💬 Response Message:", error.response.data?.message);
      }

      // 400 hatası alırsak boş array döndür
      if (error.response?.status === 400) {
        console.warn("⚠️  400 hatası alındı, boş array döndürülüyor");
        return {
          isSucceed: true,
          message: "Henüz menü bulunmuyor",
          data: [],
        };
      }

      // Diğer hatalarda yeniden fırlat
      throw error;
    }
  },

  // Menü detayı alma
  getMenuDetail: async (menuId: string): Promise<ApiResponse<Menu>> => {
    const response = await api.get(`/api/base/menu-detail/${menuId}`);
    return response.data;
  },

  // Menü oluşturma
  createMenu: async (menuData: CreateMenuData): Promise<ApiResponse<Menu>> => {
    console.log("➕ Menü oluşturma API çağrısı başlatılıyor...");
    console.log("📊 Create Data:", menuData);

    // Token kontrolü
    const token = Cookies.get("accessToken");
    if (!token) {
      throw new Error("Token bulunamadı! Lütfen tekrar giriş yapın.");
    }

    try {
      // Token'dan user ID'sini çıkar
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Geçersiz JWT token formatı!");
      }

      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      const userId =
        tokenPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

      if (!userId) {
        throw new Error("Token'da kullanıcı ID'si bulunamadı!");
      }

      // API'nin beklediği formata göre payload hazırla
      const createPayload = {
        name: menuData.title, // API'nin beklediği name field'ı - title yerine
        description: menuData.description,
        imageUrl: menuData.imageUrl || "", // Boş string yerine undefined göndermemek için
        language: menuData.language,
      };

      console.log("📡 API çağrısı: POST /api/base/menu (CREATE)");
      console.log("📦 SWAGGER UYUMLU PAYLOAD:");
      console.log("- name (title):", createPayload.name);
      console.log("- description:", createPayload.description);
      console.log("- imageUrl:", createPayload.imageUrl);
      console.log("- language:", createPayload.language);

      const response = await api.post("/api/base/menu", createPayload);
      console.log("✅ Menü oluşturma başarılı:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ MENÜ OLUŞTURMA HATA DETAYLARI:");
      console.error("- Status:", error.response?.status);
      console.error("- Response Data:", error.response?.data);

      if (error.response?.data?.errors) {
        console.error("🚨 VALIDATION ERRORS:");
        Object.keys(error.response.data.errors).forEach((field) => {
          console.error(`- ${field}:`, error.response.data.errors[field]);
        });
      }

      throw error;
    }
  },

  // Menü güncelleme
  updateMenu: async (menuData: UpdateMenuData): Promise<ApiResponse<Menu>> => {
    console.log("📝 Menü güncelleme API çağrısı başlatılıyor...");
    console.log("📊 Update Data:", menuData);

    // Token kontrolü
    const token = Cookies.get("accessToken");
    if (!token) {
      throw new Error("Token bulunamadı! Lütfen tekrar giriş yapın.");
    }

    try {
      // Token'dan user ID'sini çıkar
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Geçersiz JWT token formatı!");
      }

      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      const userId =
        tokenPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

      if (!userId) {
        throw new Error("Token'da kullanıcı ID'si bulunamadı!");
      }

      // API'nin beklediği formata göre payload hazırla
      const updatePayload = {
        id: menuData.id, // Mevcut menünün ID'si
        name: menuData.title, // API'nin beklediği name field'ı
        description: menuData.description,
        imageUrl: menuData.imageUrl || "",
        language: menuData.language,
      };

      console.log("📡 API çağrısı: POST /api/base/menu (UPDATE)");
      console.log("📦 Update Payload:", updatePayload);

      const response = await api.post("/api/base/menu", updatePayload);
      console.log("✅ Menü güncelleme başarılı:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Menü güncelleme hatası:",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  // Menü silme
  deleteMenu: async (menuId: string): Promise<ApiResponse<boolean>> => {
    console.log("🗑️ Menü silme API çağrısı başlatılıyor...");
    console.log("📝 Menu ID:", menuId);

    // Token kontrolü
    const token = Cookies.get("accessToken");
    if (!token) {
      throw new Error("Token bulunamadı! Lütfen tekrar giriş yapın.");
    }

    try {
      // Token'dan user ID'sini çıkar
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Geçersiz JWT token formatı!");
      }

      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      const userId =
        tokenPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

      if (!userId) {
        throw new Error("Token'da kullanıcı ID'si bulunamadı!");
      }

      console.log("👤 User ID:", userId);

      // API dokümantasyonuna göre POST metodu ile silme
      console.log("📡 API çağrısı:", `POST /api/base/delete-menu/${menuId}`);

      const response = await api.post(`/api/base/delete-menu/${menuId}`);
      console.log("✅ Menü silme başarılı:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Menü silme hatası:",
        error.response?.status,
        error.response?.data
      );

      // HTTP hata kodları
      if (error.response?.status === 403) {
        throw new Error(
          "Bu menüyü silme yetkiniz yok. Sadece kendi oluşturduğunuz menüleri silebilirsiniz."
        );
      }

      if (error.response?.status === 404) {
        throw new Error(
          "Menü bulunamadı. Bu menü daha önce silinmiş olabilir."
        );
      }

      // Genel hata
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Menü silinirken beklenmeyen bir hata oluştu"
      );
    }
  },
};

// Kategori servisleri
export const categoryService = {
  // Menüye ait kategorileri listeleme
  getCategoriesByMenuId: async (
    menuId: string
  ): Promise<ApiResponse<Category[]>> => {
    console.log("🔍 Kategori API çağrısı başlatılıyor...");
    console.log("📝 Menu ID:", menuId);

    // Token kontrolü
    const token = Cookies.get("accessToken");
    console.log("🔑 Access Token:", token ? "✅ Mevcut" : "❌ YOK!");

    if (!token) {
      throw new Error("Token bulunamadı! Lütfen tekrar giriş yapın.");
    }

    try {
      // Token'dan user ID'sini çıkar
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Geçersiz JWT token formatı!");
      }

      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      const userId =
        tokenPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

      console.log("👤 User ID:", userId);

      if (!userId) {
        throw new Error("Token'da kullanıcı ID'si bulunamadı!");
      }

      // Query parametreleri ile API çağrısı
      const params = new URLSearchParams({
        ownerId: userId,
        language: "tr",
      });

      console.log(
        "📡 API çağrısı:",
        `GET /api/base/categories/${menuId}?${params.toString()}`
      );

      const response = await api.get(
        `/api/base/categories/${menuId}?${params.toString()}`
      );
      console.log("✅ Kategori API başarılı:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Kategori API hatası:",
        error.response?.status,
        error.response?.data
      );

      // Token decode hatası
      if (error instanceof Error && error.message?.includes("Token")) {
        console.error("🚨 TOKEN SORUNU:", error.message);
        throw new Error(
          "Giriş bilgileriniz geçersiz. Lütfen tekrar giriş yapın."
        );
      }

      // Hata detayları
      if (error.response) {
        console.error("📄 Response Headers:", error.response.headers);
        console.error("📊 Response Status:", error.response.status);
        console.error("💬 Response Message:", error.response.data?.message);
      }

      // 400 hatası alırsak boş array döndür
      if (error.response?.status === 400) {
        console.warn("⚠️  400 hatası alındı, boş array döndürülüyor");
        return {
          isSucceed: true,
          message: "Bu menüde henüz kategori bulunmuyor",
          data: [],
        };
      }

      // Diğer hatalarda yeniden fırlat
      throw error;
    }
  },

  // Kategori oluşturma
  createCategory: async (
    categoryData: CreateCategoryData
  ): Promise<ApiResponse<Category>> => {
    const response = await api.post("/api/base/category", categoryData);
    return response.data;
  },

  // Kategori güncelleme
  updateCategory: async (
    categoryData: UpdateCategoryData
  ): Promise<ApiResponse<Category>> => {
    const response = await api.post("/api/base/category", categoryData);
    return response.data;
  },

  // Kategori silme
  deleteCategory: async (categoryId: string): Promise<ApiResponse<boolean>> => {
    console.log("🗑️ Kategori silme API çağrısı başlatılıyor...");
    console.log("📝 Category ID:", categoryId);

    // Token kontrolü
    const token = Cookies.get("accessToken");
    if (!token) {
      throw new Error("Token bulunamadı! Lütfen tekrar giriş yapın.");
    }

    try {
      // Token'dan user ID'sini çıkar
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Geçersiz JWT token formatı!");
      }

      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      const userId =
        tokenPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

      if (!userId) {
        throw new Error("Token'da kullanıcı ID'si bulunamadı!");
      }

      console.log("👤 User ID:", userId);

      // API dokümantasyonuna göre POST metodu ile silme
      console.log(
        "📡 API çağrısı:",
        `POST /api/base/delete-category/${categoryId}`
      );

      const response = await api.post(
        `/api/base/delete-category/${categoryId}`
      );
      console.log("✅ Kategori silme başarılı:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Kategori silme hatası:",
        error.response?.status,
        error.response?.data
      );

      // HTTP hata kodları
      if (error.response?.status === 403) {
        throw new Error(
          "Bu kategoriyi silme yetkiniz yok. Sadece kendi oluşturduğunuz kategorileri silebilirsiniz."
        );
      }

      if (error.response?.status === 404) {
        throw new Error(
          "Kategori bulunamadı. Bu kategori daha önce silinmiş olabilir."
        );
      }

      // Genel hata
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Kategori silinirken beklenmeyen bir hata oluştu"
      );
    }
  },
};

// Ürün servisleri
export const productService = {
  // Kategoriye ait ürünleri listeleme
  getProductsByCategoryId: async (
    categoryId: string
  ): Promise<ApiResponse<Product[]>> => {
    console.log("🍽️ Ürün API çağrısı başlatılıyor...");
    console.log("📝 Category ID:", categoryId);

    // Token kontrolü
    const token = Cookies.get("accessToken");
    console.log("🔑 Access Token:", token ? "✅ Mevcut" : "❌ YOK!");

    if (!token) {
      throw new Error("Token bulunamadı! Lütfen tekrar giriş yapın.");
    }

    try {
      // Token'dan user ID'sini çıkar
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Geçersiz JWT token formatı!");
      }

      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      const userId =
        tokenPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

      console.log("👤 User ID:", userId);

      if (!userId) {
        throw new Error("Token'da kullanıcı ID'si bulunamadı!");
      }

      // Query parametreleri ile API çağrısı
      const params = new URLSearchParams({
        ownerId: userId,
        language: "tr",
      });

      console.log(
        "📡 API çağrısı:",
        `GET /api/base/products/${categoryId}?${params.toString()}`
      );

      const response = await api.get(
        `/api/base/products/${categoryId}?${params.toString()}`
      );
      console.log("✅ Ürün API başarılı:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Ürün API hatası:",
        error.response?.status,
        error.response?.data
      );

      // Token decode hatası
      if (error instanceof Error && error.message?.includes("Token")) {
        console.error("🚨 TOKEN SORUNU:", error.message);
        throw new Error(
          "Giriş bilgileriniz geçersiz. Lütfen tekrar giriş yapın."
        );
      }

      // Hata detayları
      if (error.response) {
        console.error("📄 Response Headers:", error.response.headers);
        console.error("📊 Response Status:", error.response.status);
        console.error("💬 Response Message:", error.response.data?.message);
      }

      // 400 hatası alırsak boş array döndür
      if (error instanceof Response && error.status === 400) {
        console.warn("⚠️  Ürün 400 hatası alındı, boş array döndürülüyor");
        return {
          isSucceed: true,
          message: "Bu kategoride henüz ürün bulunmuyor",
          data: [],
        };
      }

      // Diğer hatalarda yeniden fırlat
      throw error;
    }
  },

  // Ürün detayı alma
  getProductDetail: async (
    productId: string
  ): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/api/base/product/${productId}`);
    return response.data;
  },

  // Ürün oluşturma
  createProduct: async (
    productData: CreateProductData
  ): Promise<ApiResponse<Product>> => {
    const response = await api.post("/api/base/product", productData);
    return response.data;
  },

  // Ürün güncelleme
  updateProduct: async (
    productData: UpdateProductData
  ): Promise<ApiResponse<Product>> => {
    const response = await api.post("/api/base/product", productData);
    return response.data;
  },

  // Ürün silme
  deleteProduct: async (productId: string): Promise<ApiResponse<boolean>> => {
    console.log("🗑️ Ürün silme API çağrısı başlatılıyor...");
    console.log("📝 Product ID:", productId);

    // Token kontrolü
    const token = Cookies.get("accessToken");
    if (!token) {
      throw new Error("Token bulunamadı! Lütfen tekrar giriş yapın.");
    }

    try {
      // Token'dan user ID'sini çıkar
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Geçersiz JWT token formatı!");
      }

      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      const userId =
        tokenPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

      if (!userId) {
        throw new Error("Token'da kullanıcı ID'si bulunamadı!");
      }

      console.log("👤 User ID:", userId);

      // API dokümantasyonuna göre POST metodu ile silme
      console.log(
        "📡 API çağrısı:",
        `POST /api/base/delete-product/${productId}`
      );

      const response = await api.post(`/api/base/delete-product/${productId}`);
      console.log("✅ Ürün silme başarılı:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Ürün silme hatası:",
        error.response?.status,
        error.response?.data
      );

      // HTTP hata kodları
      if (error.response?.status === 403) {
        throw new Error(
          "Bu ürünü silme yetkiniz yok. Sadece kendi oluşturduğunuz ürünleri silebilirsiniz."
        );
      }

      if (error.response?.status === 404) {
        throw new Error(
          "Ürün bulunamadı. Bu ürün daha önce silinmiş olabilir."
        );
      }

      // Genel hata
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Ürün silinirken beklenmeyen bir hata oluştu"
      );
    }
  },
};

export default api;
