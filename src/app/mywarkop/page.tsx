"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function MyWarkopLandingPage() {
  const router = useRouter();
  const { register, login } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(loginForm.email, loginForm.password);
      if (success) {
        showSuccess("Login Berhasil", "Selamat datang kembali!");
        router.push("/warkop-owner/dashboard");
      } else {
        showError("Login Gagal", "Email atau password salah");
      }
    } catch {
      showError("Login Gagal", "Terjadi kesalahan, silakan coba lagi");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      showError("Error", "Password dan konfirmasi password tidak sama");
      return;
    }

    if (registerForm.password.length < 6) {
      showError("Error", "Password minimal 6 karakter");
      return;
    }

    if (!registerForm.phone) {
      showError("Error", "Nomor telepon wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const success = await register(
        registerForm.name,
        registerForm.email,
        registerForm.password,
        registerForm.phone,
        "warkop_owner"
      );

      if (success) {
        showSuccess(
          "Registrasi Berhasil",
          "Akun Anda berhasil dibuat! Silakan setup warkop Anda."
        );
        router.push("/warkop-owner/setup");
      } else {
        showError("Registrasi Gagal", "Email sudah terdaftar atau terjadi kesalahan");
      }
    } catch {
      showError("Registrasi Gagal", "Terjadi kesalahan, silakan coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Header */}
      <header className="bg-[#121215]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                <span className="text-white text-2xl">☕</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Warkop Kamoe</h1>
                <p className="text-xs text-zinc-400">Partner Portal</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                ← Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 bg-violet-500/20 text-violet-400 rounded-full text-sm font-semibold border border-violet-500/30">
                🚀 Platform Terpercaya untuk Warkop
              </span>
            </div>

            <h1 className="text-5xl font-bold text-white leading-tight">
              Kembangkan Bisnis
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                Warkop Anda
              </span>
            </h1>

            <p className="text-xl text-zinc-400 leading-relaxed">
              Bergabunglah dengan Warkop Kamoe dan jangkau lebih banyak pelanggan.
              Platform digital untuk mengelola menu, pesanan, dan pembayaran dengan mudah.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                  <svg
                    className="w-6 h-6 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Pembayaran Digital
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Terima pembayaran via transfer bank, e-wallet, dan kartu kredit
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
                  <svg
                    className="w-6 h-6 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Analitik Penjualan
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Dashboard lengkap untuk monitor performa warkop Anda
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center border border-violet-500/30">
                  <svg
                    className="w-6 h-6 text-violet-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Kelola Menu Mudah
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Update menu, harga, dan foto produk kapan saja
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                  <svg
                    className="w-6 h-6 text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Jangkau Pelanggan Baru
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Platform dengan ribuan pengguna aktif setiap hari
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-sm text-zinc-400">Warkop Partner</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-sm text-zinc-400">Order/Bulan</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">4.8★</div>
                <div className="text-sm text-zinc-400">Rating Partner</div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="bg-[#121215] rounded-3xl border border-white/10 p-8 lg:p-10">
            {/* Tab Switcher */}
            <div className="flex items-center justify-center space-x-2 bg-white/5 rounded-2xl p-2 mb-8">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === "login"
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === "register"
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Daftar
              </button>
            </div>

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Masuk ke Akun Anda
                  </h2>
                  <p className="text-zinc-400">
                    Kelola warkop Anda dengan mudah
                  </p>
                </div>

                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  placeholder="warkop@email.com"
                  variant="dark"
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Masukkan password"
                  variant="dark"
                  required
                />

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-violet-500 bg-white/5 border-white/20 rounded focus:ring-violet-500"
                    />
                    <span className="text-zinc-400">Ingat saya</span>
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-violet-400 hover:text-violet-300 font-medium"
                  >
                    Lupa password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Masuk"}
                </Button>

                <div className="text-center text-sm text-zinc-400">
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    Daftar sekarang
                  </button>
                </div>
              </form>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Daftarkan Warkop Anda
                  </h2>
                  <p className="text-zinc-400">
                    Mulai bergabung dalam 3 langkah mudah
                  </p>
                </div>

                <Input
                  label="Nama Lengkap"
                  type="text"
                  name="name"
                  value={registerForm.name}
                  onChange={handleRegisterChange}
                  placeholder="Nama pemilik warkop"
                  variant="dark"
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  placeholder="warkop@email.com"
                  variant="dark"
                  required
                />

                <Input
                  label="Nomor Telepon"
                  type="tel"
                  name="phone"
                  value={registerForm.phone}
                  onChange={handleRegisterChange}
                  placeholder="081234567890"
                  variant="dark"
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  placeholder="Minimal 6 karakter"
                  variant="dark"
                  required
                />

                <Input
                  label="Konfirmasi Password"
                  type="password"
                  name="confirmPassword"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Ulangi password"
                  variant="dark"
                  required
                />

                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-sm text-cyan-300">
                      <p className="font-semibold mb-1">Setelah registrasi:</p>
                      <ul className="space-y-1 text-cyan-400">
                        <li>• Lengkapi data warkop Anda</li>
                        <li>• Upload foto dan menu</li>
                        <li>• Tunggu verifikasi admin (1x24 jam)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-violet-500 bg-white/5 border-white/20 rounded focus:ring-violet-500 mt-1"
                    required
                  />
                  <span className="text-sm text-zinc-400">
                    Saya setuju dengan{" "}
                    <Link
                      href="/terms"
                      className="text-violet-400 hover:text-violet-300 font-medium"
                    >
                      Syarat & Ketentuan
                    </Link>{" "}
                    dan{" "}
                    <Link
                      href="/privacy"
                      className="text-violet-400 hover:text-violet-300 font-medium"
                    >
                      Kebijakan Privasi
                    </Link>
                  </span>
                </label>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Daftar Sekarang"}
                </Button>

                <div className="text-center text-sm text-zinc-400">
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    Masuk di sini
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-20 bg-[#121215] rounded-3xl border border-white/10 p-8 lg:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Kenapa Bergabung dengan Warkop Kamoe?
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Platform yang dirancang khusus untuk membantu warkop berkembang
              dan menjangkau lebih banyak pelanggan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Cepat & Mudah
              </h3>
              <p className="text-zinc-400">
                Setup dalam hitungan menit. Tidak perlu coding atau technical skill
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Aman & Terpercaya
              </h3>
              <p className="text-zinc-400">
                Sistem pembayaran terintegrasi dengan keamanan tingkat bank
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Support 24/7
              </h3>
              <p className="text-zinc-400">
                Tim support siap membantu Anda kapan pun dibutuhkan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a0a0b] border-t border-white/10 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <span className="text-white text-2xl">☕</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Warkop Kamoe</h3>
                  <p className="text-sm text-zinc-400">Partner Portal</p>
                </div>
              </div>
              <p className="text-zinc-400 mb-4">
                Platform digital terbaik untuk mengelola dan mengembangkan bisnis warkop Anda
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Partner</h4>
              <ul className="space-y-2 text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">Daftar Warkop</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Panduan</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Bantuan</h4>
              <ul className="space-y-2 text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">Pusat Bantuan</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hubungi Kami</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-zinc-400">
            <p>&copy; 2025 Warkop Kamoe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
