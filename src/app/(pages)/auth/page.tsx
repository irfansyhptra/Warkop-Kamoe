"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, register, user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [formLoading, setFormLoading] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  useEffect(() => {
    // Set tab based on URL parameter
    const tab = searchParams.get("tab");
    if (tab === "login" || tab === "register") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Redirect after successful login/register
  useEffect(() => {
    // Don't redirect if still checking auth state
    if (authLoading) return;

    if (user && !formLoading) {
      // Small delay to show success message
      const timer = setTimeout(() => {
        router.push("/");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user, formLoading, authLoading, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Validasi
      if (!loginData.email || !loginData.password) {
        showError("Error", "Email dan password harus diisi");
        setFormLoading(false);
        return;
      }

      // Call login API
      const success = await login(loginData.email, loginData.password);

      if (success) {
        showSuccess("Berhasil", "Login berhasil!");
        // Auto redirect will happen from useEffect
      } else {
        showError("Error", "Email atau password salah");
      }
    } catch (error) {
      console.error("Login error:", error);
      showError("Error", "Login gagal. Silakan coba lagi.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Validasi
      if (!registerData.name || !registerData.email || !registerData.password) {
        showError("Error", "Semua field harus diisi");
        setFormLoading(false);
        return;
      }

      if (registerData.password !== registerData.confirmPassword) {
        showError("Error", "Password tidak cocok");
        setFormLoading(false);
        return;
      }

      if (registerData.password.length < 6) {
        showError("Error", "Password minimal 6 karakter");
        setFormLoading(false);
        return;
      }

      // Call register API
      const success = await register(
        registerData.name,
        registerData.email,
        registerData.password,
        registerData.phone
      );

      if (success) {
        showSuccess("Berhasil", "Registrasi berhasil! Anda akan diarahkan...");
        // Auto redirect will happen from useEffect
      } else {
        showError("Error", "Registrasi gagal. Email mungkin sudah terdaftar.");
      }
    } catch (error) {
      console.error("Register error:", error);
      showError("Error", "Registrasi gagal. Silakan coba lagi.");
    } finally {
      setFormLoading(false);
    }
  };

  const switchTab = (tab: "login" | "register") => {
    setActiveTab(tab);
    router.push(`/auth?tab=${tab}`, { scroll: false });
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Memuat...</p>
        </div>
      </div>
    );
  }

  // Show success message if user is logged in
  if (user) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Login Berhasil!
          </h2>
          <p className="text-zinc-400 mb-4">Selamat datang, {user.name}!</p>
          <p className="text-sm text-zinc-500">Mengalihkan ke beranda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">☕</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Warkop Kamoe
          </h1>
          <p className="text-zinc-400">
            {activeTab === "login" ? "Masuk ke akun Anda" : "Daftar akun baru"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8">
          <div className="flex mb-8 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => switchTab("login")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 ${
                activeTab === "login"
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => switchTab("register")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 ${
                activeTab === "register"
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  required
                  className="w-full"
                  variant="dark"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  required
                  className="w-full"
                  variant="dark"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
                  />
                  <span className="ml-2 text-sm text-zinc-400">Ingat saya</span>
                </label>

                <a
                  href="#"
                  className="text-sm text-violet-400 hover:text-violet-300 font-medium"
                >
                  Lupa password?
                </a>
              </div>

              <Button
                type="submit"
                disabled={formLoading}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all shadow-lg shadow-violet-500/25"
              >
                {formLoading ? "Memproses..." : "Masuk"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#121215] text-zinc-500">
                    Atau masuk dengan
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2 px-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span>🔵</span>
                  <span className="text-sm font-medium text-zinc-300">
                    Google
                  </span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2 px-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span>📘</span>
                  <span className="text-sm font-medium text-zinc-300">
                    Facebook
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Nama Lengkap
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={registerData.name}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, name: e.target.value })
                  }
                  required
                  className="w-full"
                  variant="dark"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Email
                </label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="nama@email.com"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                  required
                  className="w-full"
                  variant="dark"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Nomor Telepon (Opsional)
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08123456789"
                  value={registerData.phone}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, phone: e.target.value })
                  }
                  className="w-full"
                  variant="dark"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Password
                </label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  required
                  className="w-full"
                  variant="dark"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Konfirmasi Password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Ulangi password"
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full"
                  variant="dark"
                />
              </div>

              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="mt-1 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-zinc-400">
                  Saya setuju dengan{" "}
                  <a href="#" className="text-violet-400 hover:text-violet-300">
                    Syarat & Ketentuan
                  </a>{" "}
                  dan{" "}
                  <a href="#" className="text-violet-400 hover:text-violet-300">
                    Kebijakan Privasi
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                disabled={formLoading}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all shadow-lg shadow-violet-500/25"
              >
                {formLoading ? "Memproses..." : "Daftar Sekarang"}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-400 mt-6">
          {activeTab === "login" ? (
            <>
              Belum punya akun?{" "}
              <button
                onClick={() => switchTab("register")}
                className="text-violet-400 hover:text-violet-300 font-medium"
              >
                Daftar sekarang
              </button>
            </>
          ) : (
            <>
              Sudah punya akun?{" "}
              <button
                onClick={() => switchTab("login")}
                className="text-violet-400 hover:text-violet-300 font-medium"
              >
                Masuk di sini
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500 mx-auto"></div>
            <p className="mt-4 text-zinc-400 text-lg">Memuat...</p>
          </div>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
