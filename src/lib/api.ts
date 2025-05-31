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
    console.error("🚨 UYARI: Token bulunamadı! Login olmayı kontrol et.");
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
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      window.location.href = "/login";
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
        console.log(`❌ ${endpoint} hata:`, error.message);
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
      if (error.message?.includes("Token")) {
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

      // Create data'ya ownerId ekle
      const createPayload = {
        ...menuData,
        ownerId: userId,
      };

      console.log("📡 API çağrısı: POST /api/base/menu (CREATE)");
      console.log("📦 Payload:", createPayload);

      const response = await api.post("/api/base/menu", createPayload);
      console.log("✅ Menü oluşturma başarılı:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Menü oluşturma hatası:",
        error.response?.status,
        error.response?.data
      );
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

      // Update data'ya ownerId ekle
      const updatePayload = {
        ...menuData,
        ownerId: userId,
      };

      console.log("📡 API çağrısı: POST /api/base/menu (UPDATE)");
      console.log("📦 Payload:", updatePayload);

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
      console.log("🔍 DELETE OWNERSHIP DEBUG:");
      console.log("📜 Full Token Payload:", tokenPayload);

      const userId =
        tokenPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

      console.log("👤 Extracted User ID:", userId);
      console.log("🗑️ Target Menu ID:", menuId);

      if (!userId) {
        throw new Error("Token'da kullanıcı ID'si bulunamadı!");
      }

      // Önce menü sahibini kontrol edelim
      console.log("🔍 OWNERSHIP KONTROLÜ BAŞLIYOR...");
      try {
        const menuDetailResponse = await api.get(
          `/api/base/menu-detail/${menuId}`
        );
        console.log("📋 Menü detayları:", menuDetailResponse.data);

        if (menuDetailResponse.data?.data?.ownerId) {
          console.log(
            "🔑 Menü Sahibi ID:",
            menuDetailResponse.data.data.ownerId
          );
          console.log("👤 Token User ID:", userId);
          console.log(
            "🤝 Ownership Eşleşiyor mu?",
            menuDetailResponse.data.data.ownerId === userId
          );

          if (menuDetailResponse.data.data.ownerId !== userId) {
            throw new Error(
              `Bu menüyü silme yetkiniz yok! Menü sahibi: ${menuDetailResponse.data.data.ownerId}, Sizin ID: ${userId}`
            );
          }
        }
      } catch (detailError: any) {
        console.warn(
          "⚠️ Menü detay kontrolü başarısız, silme işlemine devam:",
          detailError.message
        );
      }

      // İlk olarak DELETE metodu deneyelim
      console.log("🔥 Method 1: DELETE metodu deneniyor...");
      const params = new URLSearchParams({
        ownerId: userId,
      });

      console.log(
        "📡 DELETE API çağrısı:",
        `DELETE /api/base/menu/${menuId}?${params.toString()}`
      );

      try {
        const deleteResponse = await api.delete(
          `/api/base/menu/${menuId}?${params.toString()}`
        );
        console.log("✅ DELETE metodu başarılı:", deleteResponse.data);
        return deleteResponse.data;
      } catch (deleteError: any) {
        console.warn("⚠️ DELETE metodu başarısız:", deleteError.message);
        console.error("🚨 DELETE ERROR DETAILS:");
        console.error("- Status:", deleteError.response?.status);
        console.error("- Status Text:", deleteError.response?.statusText);
        console.error("- Response Data:", deleteError.response?.data);
        console.error("- Response Headers:", deleteError.response?.headers);

        // Eğer 404 veya Network Error alırsak, POST metodunu deneyelim
        if (
          deleteError.code === "NETWORK_ERROR" ||
          deleteError.response?.status === 404 ||
          deleteError.response?.status === 405
        ) {
          console.log(
            "🔄 Method 2: POST metodu deneniyor (DELETE operasyon)..."
          );

          // POST ile silme işlemi
          const deletePayload = {
            id: menuId,
            ownerId: userId,
            isDeleted: true, // Silindi olarak işaretle
          };

          console.log("📡 POST API çağrısı:", "POST /api/base/menu (DELETE)");
          console.log("📦 Payload:", deletePayload);

          const postResponse = await api.post("/api/base/menu", deletePayload);
          console.log("✅ POST metodu başarılı:", postResponse.data);
          return postResponse.data;
        }

        throw deleteError; // Başka bir hata varsa yeniden fırlat
      }
    } catch (error: any) {
      console.error(
        "❌ Menü silme hatası:",
        error.response?.status,
        error.response?.data
      );

      // Network Error detayları
      if (error.code === "NETWORK_ERROR") {
        console.error("🌐 NETWORK ERROR detayları:");
        console.error("- Base URL:", BASE_URL);
        console.error("- Tam URL:", `${BASE_URL}/api/base/menu/${menuId}`);
        console.error("- Token mevcut:", !!token);
        console.error("- Tarayıcı network sekmesini kontrol edin");

        throw new Error(
          "Ağ bağlantısı hatası! API sunucusuna erişilemiyor. Lütfen internet bağlantınızı kontrol edin veya sunucu yöneticisi ile iletişime geçin."
        );
      }

      // HTTP hata kodları
      if (error.response?.status === 403) {
        // 403 için daha detaylı bilgi
        console.error("🚫 403 FORBIDDEN DETAYLARI:");
        console.error("- Bu menü size ait değil veya silme yetkiniz yok");
        console.error("- API ownership kontrolü başarısız");
        console.error("- Sunucu yanıtı:", error.response?.data);

        throw new Error(
          "Bu menüyü silme yetkiniz yok! Sadece kendi oluşturduğunuz menüleri silebilirsiniz. " +
            "Ownership problemi olabilir - console'da detayları kontrol edin."
        );
      }

      if (error.response?.status === 404) {
        throw new Error(
          "Menü bulunamadı. Bu menü daha önce silinmiş olabilir."
        );
      }

      if (error.response?.status === 405) {
        throw new Error(
          "Bu API DELETE metodunu desteklemiyor. Sunucu yapılandırmasını kontrol edin."
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
    console.log("🗂️ Kategori API çağrısı başlatılıyor...");
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
      if (error.message?.includes("Token")) {
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
        console.warn("⚠️  Kategori 400 hatası alındı, boş array döndürülüyor");
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

      // İlk olarak DELETE metodu deneyelim
      console.log("🔥 Method 1: DELETE metodu deneniyor...");
      const params = new URLSearchParams({
        ownerId: userId,
      });

      console.log(
        "📡 DELETE API çağrısı:",
        `DELETE /api/base/category/${categoryId}?${params.toString()}`
      );

      try {
        const deleteResponse = await api.delete(
          `/api/base/category/${categoryId}?${params.toString()}`
        );
        console.log("✅ DELETE metodu başarılı:", deleteResponse.data);
        return deleteResponse.data;
      } catch (deleteError: any) {
        console.warn("⚠️ DELETE metodu başarısız:", deleteError.message);

        // Eğer 404 veya Network Error alırsak, POST metodunu deneyelim
        if (
          deleteError.code === "NETWORK_ERROR" ||
          deleteError.response?.status === 404 ||
          deleteError.response?.status === 405
        ) {
          console.log(
            "🔄 Method 2: POST metodu deneniyor (DELETE operasyon)..."
          );

          // POST ile silme işlemi
          const deletePayload = {
            id: categoryId,
            ownerId: userId,
            isDeleted: true, // Silindi olarak işaretle
          };

          console.log(
            "📡 POST API çağrısı:",
            "POST /api/base/category (DELETE)"
          );
          console.log("📦 Payload:", deletePayload);

          const postResponse = await api.post(
            "/api/base/category",
            deletePayload
          );
          console.log("✅ POST metodu başarılı:", postResponse.data);
          return postResponse.data;
        }

        throw deleteError; // Başka bir hata varsa yeniden fırlat
      }
    } catch (error: any) {
      console.error(
        "❌ Kategori silme hatası:",
        error.response?.status,
        error.response?.data
      );

      // Network Error detayları
      if (error.code === "NETWORK_ERROR") {
        console.error("🌐 NETWORK ERROR detayları:");
        console.error("- Base URL:", BASE_URL);
        console.error(
          "- Tam URL:",
          `${BASE_URL}/api/base/category/${categoryId}`
        );
        console.error("- Token mevcut:", !!token);
        console.error("- Tarayıcı network sekmesini kontrol edin");

        throw new Error(
          "Ağ bağlantısı hatası! API sunucusuna erişilemiyor. Lütfen internet bağlantınızı kontrol edin veya sunucu yöneticisi ile iletişime geçin."
        );
      }

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

      if (error.response?.status === 405) {
        throw new Error(
          "Bu API DELETE metodunu desteklemiyor. Sunucu yapılandırmasını kontrol edin."
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
      if (error.message?.includes("Token")) {
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

      // İlk olarak DELETE metodu deneyelim
      console.log("🔥 Method 1: DELETE metodu deneniyor...");
      const params = new URLSearchParams({
        ownerId: userId,
      });

      console.log(
        "📡 DELETE API çağrısı:",
        `DELETE /api/base/product/${productId}?${params.toString()}`
      );

      try {
        const deleteResponse = await api.delete(
          `/api/base/product/${productId}?${params.toString()}`
        );
        console.log("✅ DELETE metodu başarılı:", deleteResponse.data);
        return deleteResponse.data;
      } catch (deleteError: any) {
        console.warn("⚠️ DELETE metodu başarısız:", deleteError.message);

        // Eğer 404 veya Network Error alırsak, POST metodunu deneyelim
        if (
          deleteError.code === "NETWORK_ERROR" ||
          deleteError.response?.status === 404 ||
          deleteError.response?.status === 405
        ) {
          console.log(
            "🔄 Method 2: POST metodu deneniyor (DELETE operasyon)..."
          );

          // POST ile silme işlemi
          const deletePayload = {
            id: productId,
            ownerId: userId,
            isDeleted: true, // Silindi olarak işaretle
          };

          console.log(
            "📡 POST API çağrısı:",
            "POST /api/base/product (DELETE)"
          );
          console.log("📦 Payload:", deletePayload);

          const postResponse = await api.post(
            "/api/base/product",
            deletePayload
          );
          console.log("✅ POST metodu başarılı:", postResponse.data);
          return postResponse.data;
        }

        throw deleteError; // Başka bir hata varsa yeniden fırlat
      }
    } catch (error: any) {
      console.error(
        "❌ Ürün silme hatası:",
        error.response?.status,
        error.response?.data
      );

      // Network Error detayları
      if (error.code === "NETWORK_ERROR") {
        console.error("🌐 NETWORK ERROR detayları:");
        console.error("- Base URL:", BASE_URL);
        console.error(
          "- Tam URL:",
          `${BASE_URL}/api/base/product/${productId}`
        );
        console.error("- Token mevcut:", !!token);
        console.error("- Tarayıcı network sekmesini kontrol edin");

        throw new Error(
          "Ağ bağlantısı hatası! API sunucusuna erişilemiyor. Lütfen internet bağlantınızı kontrol edin veya sunucu yöneticisi ile iletişime geçin."
        );
      }

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

      if (error.response?.status === 405) {
        throw new Error(
          "Bu API DELETE metodunu desteklemiyor. Sunucu yapılandırmasını kontrol edin."
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
