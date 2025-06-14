"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { authService } from "@/lib/api";
import toast from "react-hot-toast";

export const useAuth = () => {
  const { user, setUser, setLoading, logout } = useAuthStore();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });

      if (response.isSucceed) {
        setUser(response.data);
        toast.success("Başarıyla giriş yapıldı!");
        router.push("/dashboard");
      } else {
        toast.error("Giriş yapılırken hata oluştu!");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Giriş yapılırken hata oluştu!"
          : "Giriş yapılırken hata oluştu!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.register({ email, password });

      if (response.isSucceed) {
        setUser(response.data);
        toast.success("Başarıyla kayıt olundu!");
        router.push("/dashboard");
      } else {
        toast.error("Kayıt olurken hata oluştu!");
      }
    } catch (error: unknown) {
      console.error("Register error:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Kayıt olurken hata oluştu!"
          : "Kayıt olurken hata oluştu!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    logout();
    toast.success("Başarıyla çıkış yapıldı!");
    router.push("/login");
  };

  const checkAuth = async () => {
    try {
      const response = await authService.getMe();
      if (response.isSucceed) {
        setUser(response.data);
      } else {
        logout();
      }
    } catch (error) {
      console.error("CheckAuth error:", error);
      logout();
    }
  };

  return {
    user,
    login,
    register,
    logout: signOut,
    checkAuth,
  };
};
