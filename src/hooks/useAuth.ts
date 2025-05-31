"use client";

import { useEffect } from "react";
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

      console.log("Login response:", response); // Debug log

      if (response.isSucceed) {
        console.log("User data from login:", response.data); // Debug log
        setUser(response.data);
        toast.success("Başarıyla giriş yapıldı!");
        router.push("/dashboard");
      } else {
        toast.error("Giriş yapılırken hata oluştu!");
      }
    } catch (error: any) {
      console.error("Login error:", error); // Debug log
      toast.error(
        error?.response?.data?.message || "Giriş yapılırken hata oluştu!"
      );
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.register({ email, password });

      console.log("Register response:", response); // Debug log

      if (response.isSucceed) {
        console.log("User data from register:", response.data); // Debug log
        setUser(response.data);
        toast.success("Başarıyla kayıt olundu!");
        router.push("/dashboard");
      } else {
        toast.error("Kayıt olurken hata oluştu!");
      }
    } catch (error: any) {
      console.error("Register error:", error); // Debug log
      toast.error(
        error?.response?.data?.message || "Kayıt olurken hata oluştu!"
      );
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    logout();
    toast.success("Başarıyla çıkış yapıldı!");
    router.push("/login");
  };

  // Token'ı kontrol et ve kullanıcı bilgilerini getir
  const checkAuth = async () => {
    try {
      const response = await authService.getMe();
      console.log("CheckAuth response:", response); // Debug log
      if (response.isSucceed) {
        console.log("User data from checkAuth:", response.data); // Debug log
        setUser(response.data);
      } else {
        logout();
      }
    } catch (error) {
      console.error("CheckAuth error:", error); // Debug log
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
