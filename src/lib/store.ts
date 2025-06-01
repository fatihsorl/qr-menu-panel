import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { User } from "./types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      setUser: (user) => {
        set({ user });
        if (user) {
          Cookies.set("accessToken", user.accessToken, { expires: 7 });
          if (user.refreshToken) {
            Cookies.set("refreshToken", user.refreshToken, { expires: 30 });
          }
        }
      },
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        set({ user: null });
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Auth logout event listener
if (typeof window !== "undefined") {
  window.addEventListener("auth:logout", () => {
    useAuthStore.getState().logout();
  });
}

interface AppState {
  selectedMenuId: string | null;
  selectedCategoryId: string | null;
  setSelectedMenuId: (menuId: string | null) => void;
  setSelectedCategoryId: (categoryId: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedMenuId: null,
  selectedCategoryId: null,
  setSelectedMenuId: (menuId) => set({ selectedMenuId: menuId }),
  setSelectedCategoryId: (categoryId) =>
    set({ selectedCategoryId: categoryId }),
}));
