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

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://jovial-bouman.104-247-167-194.plesk.page";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get("refreshToken");

      if (refreshToken) {
        try {
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

            Cookies.set("accessToken", newAccessToken, { expires: 7 });
            if (newRefreshToken) {
              Cookies.set("refreshToken", newRefreshToken, { expires: 30 });
            }

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("❌ Token yenileme başarısız:", refreshError);
        }
      }

      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");

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

export const authService = {
  testApiServer: async (): Promise<void> => {
    const testEndpoints = ["/", "/api", "/health", "/api/health", "/status"];

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          method: "GET",
        });
      } catch (error: any) {}
    }
  },

  register: async (
    credentials: RegisterCredentials
  ): Promise<ApiResponse<User>> => {
    const response = await api.post("/api/auth/register", credentials);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  refreshToken: async (
    userData: User
  ): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    const response = await api.post("/api/auth/refresh-token", userData);
    return response.data;
  },

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

export const menuService = {
  getMyMenus: async (language?: string): Promise<ApiResponse<Menu[]>> => {
    const token = Cookies.get("accessToken");

    if (!token) {
      throw new Error("Token bulunamadı! Lütfen tekrar giriş yapın.");
    }

    try {
      const tokenParts = token.split(".");

      if (tokenParts.length !== 3) {
        throw new Error("Geçersiz JWT token formatı!");
      }

      const tokenPayload = JSON.parse(atob(tokenParts[1]));

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
          break;
        }
      }

      if (!userId) {
        console.error("🚨 TOKEN YAPISI:", Object.keys(tokenPayload));
        throw new Error(
          "Token'da kullanıcı ID'si bulunamadı! Desteklenen field'lar: " +
            possibleUserIdFields.join(", ")
        );
      }

      const params = new URLSearchParams({
        ownerId: userId,
      });

      if (language) {
        params.set("language", language);
      } else {
        params.set("language", "tr");
      }

      const response = await api.get(`/api/base/menus?${params.toString()}`);

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ API hatası:",
        error.response?.status,
        error.response?.data
      );

      if (error instanceof Error && error.message?.includes("Token")) {
        console.error("🚨 TOKEN SORUNU:", error.message);
        throw new Error(
          "Giriş bilgileriniz geçersiz. Lütfen tekrar giriş yapın."
        );
      }

      if (error.response) {
        console.error("📄 Response Headers:", error.response.headers);
        console.error("📊 Response Status:", error.response.status);
        console.error("💬 Response Message:", error.response.data?.message);
      }

      if (error.response?.status === 400) {
        console.warn("⚠️  400 hatası alındı, boş array döndürülüyor");
        return {
          isSucceed: true,
          message: "Henüz menü bulunmuyor",
          data: [],
        };
      }

      throw error;
    }
  },

  getMenuDetail: async (menuId: string): Promise<ApiResponse<Menu>> => {
    const response = await api.get(`/api/base/menu-detail/${menuId}`);
    return response.data;
  },

  createMenu: async (menuData: CreateMenuData): Promise<ApiResponse<Menu>> => {
    const token = Cookies.get("accessToken");
    if (!token) {
      throw new Error("Token bulunamadı! Lütfen tekrar giriş yapın.");
    }

    try {
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

      const createPayload = {
        name: menuData.title,
        description: menuData.description,
        imageUrl: menuData.imageUrl || "",
        language: menuData.language,
      };

      const response = await api.post("/api/base/menu", createPayload);
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

  updateMenu: async (menuData: UpdateMenuData): Promise<ApiResponse<Menu>> => {
    const token = Cookies.get("accessToken");
    if (!token) {
      throw new Error("Token bulunamadı! Lütfen tekrar giriş yapın.");
    }

    try {
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

      const updatePayload = {
        id: menuData.id,
        name: menuData.title,
        description: menuData.description,
        imageUrl: menuData.imageUrl || "",
        language: menuData.language,
      };

      const response = await api.post("/api/base/menu", updatePayload);
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

  deleteMenu: async (menuId: string): Promise<ApiResponse<boolean>> => {
    // Token kontrolü
    const token = Cookies.get("accessToken");
    if (!token) {
      throw new Error("Token bulunamadı! Lütfen tekrar giriş yapın.");
    }

    try {
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

      const response = await api.post(`/api/base/delete-menu/${menuId}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Menü silme hatası:",
        error.response?.status,
        error.response?.data
      );

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

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Menü silinirken beklenmeyen bir hata oluştu"
      );
    }
  },
};

export const categoryService = {
  getCategoriesByMenuId: async (
    menuId: string,
    language?: string
  ): Promise<ApiResponse<Category[]>> => {
    const token = Cookies.get("accessToken");

    if (!token) {
      throw new Error("Token bulunamadı! Lütfen tekrar giriş yapın.");
    }

    try {
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

      const params = new URLSearchParams({
        ownerId: userId,
        language: language || "tr",
      });

      const response = await api.get(
        `/api/base/categories/${menuId}?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Kategori API hatası:",
        error.response?.status,
        error.response?.data
      );

      if (error instanceof Error && error.message?.includes("Token")) {
        console.error("🚨 TOKEN SORUNU:", error.message);
        throw new Error(
          "Giriş bilgileriniz geçersiz. Lütfen tekrar giriş yapın."
        );
      }

      if (error.response) {
        console.error("📄 Response Headers:", error.response.headers);
        console.error("📊 Response Status:", error.response.status);
        console.error("💬 Response Message:", error.response.data?.message);
      }

      if (error.response?.status === 400) {
        console.warn("⚠️  400 hatası alındı, boş array döndürülüyor");
        return {
          isSucceed: true,
          message: "Bu menüde henüz kategori bulunmuyor",
          data: [],
        };
      }

      throw error;
    }
  },

  createCategory: async (
    categoryData: CreateCategoryData
  ): Promise<ApiResponse<Category>> => {
    const response = await api.post("/api/base/category", categoryData);
    return response.data;
  },

  updateCategory: async (
    categoryData: UpdateCategoryData
  ): Promise<ApiResponse<Category>> => {
    const response = await api.post("/api/base/category", categoryData);
    return response.data;
  },

  deleteCategory: async (categoryId: string): Promise<ApiResponse<boolean>> => {
    const token = Cookies.get("accessToken");
    if (!token) {
      throw new Error("Token bulunamadı! Lütfen tekrar giriş yapın.");
    }

    try {
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

      const response = await api.post(
        `/api/base/delete-category/${categoryId}`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Kategori silme hatası:",
        error.response?.status,
        error.response?.data
      );

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

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Kategori silinirken beklenmeyen bir hata oluştu"
      );
    }
  },
};

export const productService = {
  getProductsByCategoryId: async (
    categoryId: string,
    language?: string
  ): Promise<ApiResponse<Product[]>> => {
    const token = Cookies.get("accessToken");

    if (!token) {
      throw new Error("Token bulunamadı! Lütfen tekrar giriş yapın.");
    }

    try {
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

      const params = new URLSearchParams({
        ownerId: userId,
        language: language || "tr",
      });

      const response = await api.get(
        `/api/base/products/${categoryId}?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Ürün API hatası:",
        error.response?.status,
        error.response?.data
      );

      if (error instanceof Error && error.message?.includes("Token")) {
        console.error("🚨 TOKEN SORUNU:", error.message);
        throw new Error(
          "Giriş bilgileriniz geçersiz. Lütfen tekrar giriş yapın."
        );
      }

      if (error.response) {
        console.error("📄 Response Headers:", error.response.headers);
        console.error("📊 Response Status:", error.response.status);
        console.error("💬 Response Message:", error.response.data?.message);
      }

      if (error instanceof Response && error.status === 400) {
        console.warn("⚠️  Ürün 400 hatası alındı, boş array döndürülüyor");
        return {
          isSucceed: true,
          message: "Bu kategoride henüz ürün bulunmuyor",
          data: [],
        };
      }

      throw error;
    }
  },

  getProductDetail: async (
    productId: string
  ): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/api/base/product/${productId}`);
    return response.data;
  },

  createProduct: async (
    productData: CreateProductData
  ): Promise<ApiResponse<Product>> => {
    const response = await api.post("/api/base/product", productData);
    return response.data;
  },

  updateProduct: async (
    productData: UpdateProductData
  ): Promise<ApiResponse<Product>> => {
    const response = await api.post("/api/base/product", productData);
    return response.data;
  },

  deleteProduct: async (productId: string): Promise<ApiResponse<boolean>> => {
    const token = Cookies.get("accessToken");
    if (!token) {
      throw new Error("Token bulunamadı! Lütfen tekrar giriş yapın.");
    }

    try {
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
      const response = await api.post(`/api/base/delete-product/${productId}`);

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Ürün silme hatası:",
        error.response?.status,
        error.response?.data
      );

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

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Ürün silinirken beklenmeyen bir hata oluştu"
      );
    }
  },
};

export default api;
