"use client";

import { useState, useCallback, useEffect } from "react";
import { User } from "../types";

const AUTH_STORAGE_KEY = "warkop-kamoe-auth";
const USER_STORAGE_KEY = "warkop-kamoe-user";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const isAuth = localStorage.getItem(AUTH_STORAGE_KEY) === "true";
        const userJson = localStorage.getItem(USER_STORAGE_KEY);
        const user = userJson ? JSON.parse(userJson) : null;

        setAuthState({
          isAuthenticated: isAuth,
          user,
          loading: false,
        });
      } catch (error) {
        console.error("Error loading auth state:", error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    };

    loadAuthState();
  }, []);

  const login = useCallback(
    async (email: string, _password: string): Promise<boolean> => {
      try {
        // Simulasi API call - replace dengan actual API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock user data
        const mockUser: User = {
          id: "user-" + Date.now(),
          name: email.split("@")[0],
          email,
          phone: "+62812345678",
          avatar: undefined,
          favoriteWarkops: [],
        };

        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));

        setAuthState({
          isAuthenticated: true,
          user: mockUser,
          loading: false,
        });

        return true;
      } catch (error) {
        console.error("Login error:", error);
        return false;
      }
    },
    []
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      phone?: string
    ): Promise<boolean> => {
      try {
        // Simulasi API call - replace dengan actual API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock user data
        const mockUser: User = {
          id: "user-" + Date.now(),
          name,
          email,
          phone,
          avatar: undefined,
          favoriteWarkops: [],
        };

        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));

        setAuthState({
          isAuthenticated: true,
          user: mockUser,
          loading: false,
        });

        return true;
      } catch (error) {
        console.error("Register error:", error);
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);

    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setAuthState((prev) => {
      if (!prev.user) return prev;

      const updatedUser = { ...prev.user, ...updates };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
  };
};
