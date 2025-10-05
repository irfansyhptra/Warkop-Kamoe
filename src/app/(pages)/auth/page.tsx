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
  const { login, register, user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasi
      if (!loginData.email || !loginData.password) {
        showError("Error", "Email dan password harus diisi");
        setLoading(false);
        return;
      }

      // Simulasi login
      await login(loginData.email, loginData.password);
      showSuccess("Berhasil", "Login berhasil!");
      router.push("/");
    } catch {
      showError("Error", "Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasi
      if (!registerData.name || !registerData.email || !registerData.password) {
        showError("Error", "Semua field harus diisi");
        setLoading(false);
        return;
      }

      if (registerData.password !== registerData.confirmPassword) {
        showError("Error", "Password tidak cocok");
        setLoading(false);
        return;
      }

      if (registerData.password.length < 6) {
        showError("Error", "Password minimal 6 karakter");
        setLoading(false);
        return;
      }

      // Simulasi register
      await register(
        registerData.email,
        registerData.password,
        registerData.name
      );
      showSuccess("Berhasil", "Registrasi berhasil! Silakan login.");
      setActiveTab("login");
      setRegisterData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
      });
    } catch {
      showError("Error", "Registrasi gagal. Email mungkin sudah terdaftar.");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab: "login" | "register") => {
    setActiveTab(tab);
    router.push(`/auth?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">☕</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Warkop Kamoe
          </h1>
          <p className="text-gray-600">
            {activeTab === "login" ? "Masuk ke akun Anda" : "Daftar akun baru"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => switchTab("login")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                activeTab === "login"
                  ? "bg-amber-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => switchTab("register")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                activeTab === "register"
                  ? "bg-amber-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
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
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Ingat saya</span>
                </label>

                <a
                  href="#"
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Lupa password?
                </a>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? "Memproses..." : "Masuk"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Atau masuk dengan
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span>🔵</span>
                  <span className="text-sm font-medium text-gray-700">
                    Google
                  </span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span>📘</span>
                  <span className="text-sm font-medium text-gray-700">
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
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                />
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                />
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                />
              </div>

              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  Saya setuju dengan{" "}
                  <a href="#" className="text-amber-600 hover:text-amber-700">
                    Syarat & Ketentuan
                  </a>{" "}
                  dan{" "}
                  <a href="#" className="text-amber-600 hover:text-amber-700">
                    Kebijakan Privasi
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          {activeTab === "login" ? (
            <>
              Belum punya akun?{" "}
              <button
                onClick={() => switchTab("register")}
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Daftar sekarang
              </button>
            </>
          ) : (
            <>
              Sudah punya akun?{" "}
              <button
                onClick={() => switchTab("login")}
                className="text-amber-600 hover:text-amber-700 font-medium"
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
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Memuat...</p>
          </div>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
