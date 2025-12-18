"use client";

import { useState, useCallback, useEffect } from "react";
import { User } from "../types";

const AUTH_STORAGE_KEY = "warkop-kamoe-auth";
const USER_STORAGE_KEY = "warkop-kamoe-user";
const TOKEN_STORAGE_KEY = "warkop-kamoe-token";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);

        if (!token) {
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
          });
          return;
        }

        // Verify token with backend
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const user: User = {
            id: data.data.user.id,
            name: data.data.user.name,
            email: data.data.user.email,
            phone: data.data.user.phone,
            role: data.data.user.role,
            avatar: data.data.user.profileImage,
            favoriteWarkops: [],
            isVerified: data.data.user.isVerified,
            warkopId: data.data.user.warkopId,
          };

          localStorage.setItem(AUTH_STORAGE_KEY, "true");
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

          setAuthState({
            isAuthenticated: true,
            user,
            loading: false,
          });
        } else {
          // Token invalid, clear storage
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.removeItem(TOKEN_STORAGE_KEY);

          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
          });
        }
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
    async (email: string, password: string): Promise<boolean> => {
      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }

        // Save token and user data
        const token = data.data.token;
        const userData = data.data.user;

        const user: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          avatar: userData.profileImage,
          favoriteWarkops: [],
          isVerified: userData.isVerified,
          warkopId: userData.warkopId,
        };

        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

        setAuthState({
          isAuthenticated: true,
          user,
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
      phone?: string,
      role: "customer" | "warkop_owner" = "customer"
    ): Promise<boolean> => {
      try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            phone,
            role,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Registration failed");
        }

        // Auto login after registration
        const token = data.data.token;
        const userData = data.data.user;

        const user: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          avatar: userData.profileImage,
          favoriteWarkops: [],
          isVerified: userData.isVerified,
          warkopId: userData.warkopId,
        };

        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
        });

        return true;
      } catch (error) {
        console.error("Registration error:", error);
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);

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

  const updateProfile = useCallback(
    async (updates: { name?: string; phone?: string }) => {
      try {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);

        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/api/auth/update-profile`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update profile");
        }

        // Update local user data
        const userData = data.data.user;
        const updatedUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          avatar: userData.profileImage,
          profileImage: userData.profileImage,
          favoriteWarkops: [],
          isVerified: userData.isVerified,
          warkopId: userData.warkopId,
        };

        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

        setAuthState((prev) => ({
          ...prev,
          user: updatedUser,
        }));

        return true;
      } catch (error) {
        console.error("Update profile error:", error);
        throw error;
      }
    },
    []
  );

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    authLoading: authState.loading,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
  };
};
