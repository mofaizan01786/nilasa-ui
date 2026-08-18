"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, AuthResponse, RegisterCustomerPayload } from "@/lib/types";
import {
  loginBackend,
  registerBackend,
  sendVerificationCodeBackend,
  verifyCodeBackend,
  changePassword as changePasswordApi
} from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterCustomerPayload) => Promise<{ success: boolean; error?: string }>;
  sendVerificationCode: (email: string, purpose?: string) => Promise<{ success: boolean; message: string }>;
  verifyCode: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "nilasa-auth-token";
const USER_KEY = "nilasa-user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on initial mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // localStorage read error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAuthSession = useCallback((authRes: AuthResponse) => {
    const userObj: User = {
      userId: authRes.userId,
      name: authRes.name,
      email: authRes.email,
      role: authRes.role,
      isActive: true,
      createdAt: new Date().toISOString(),
      id: authRes.userId
    };

    setToken(authRes.accessToken);
    setUser(userObj);

    try {
      localStorage.setItem(TOKEN_KEY, authRes.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userObj));
      // Sync cookie for SSR routes
      document.cookie = `nilasa_session=${authRes.accessToken}; path=/; max-age=604800; samesite=lax`;
    } catch {
      // storage write error
    }
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await loginBackend(email.trim().toLowerCase(), pass);
      if (res.success && res.data && res.data.accessToken) {
        saveAuthSession(res.data);
        return { success: true };
      }
      return { success: false, error: res.error || "Invalid email or password. Please try again." };
    } catch (err: any) {
      return { success: false, error: err.message || "Unable to connect to authentication service." };
    }
  };

  const sendVerificationCode = async (email: string, purpose: string = "Register") => {
    return await sendVerificationCodeBackend(email, purpose);
  };

  const verifyCode = async (email: string, code: string) => {
    return await verifyCodeBackend(email, code);
  };

  const register = async (payload: RegisterCustomerPayload) => {
    try {
      const res = await registerBackend(payload);
      if (res.success && res.data && res.data.accessToken) {
        saveAuthSession(res.data);
        return { success: true };
      }
      return { success: false, error: res.error || "Registration failed. An account with this email may already exist." };
    } catch (err: any) {
      return { success: false, error: err.message || "Unable to connect to registration service." };
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      document.cookie = "nilasa_session=; path=/; max-age=0; samesite=lax";
    } catch {
      // storage remove error
    }
  }, []);

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) return { success: false, error: "You must be signed in to change your password." };
    try {
      const ok = await changePasswordApi({ currentPassword, newPassword }, token);
      if (ok) return { success: true };
      return { success: false, error: "Current password was incorrect." };
    } catch {
      return { success: false, error: "Failed to update password." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        sendVerificationCode,
        verifyCode,
        logout,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
