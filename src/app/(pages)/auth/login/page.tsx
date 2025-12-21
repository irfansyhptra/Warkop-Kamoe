"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        showSuccess("Login Berhasil", "Selamat datang kembali!");
        router.push("/");
      } else {
        showError("Login Gagal", "Email atau password salah");
      }
    } catch {
      showError("Login Gagal", "Terjadi kesalahan, silakan coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#121215] rounded-2xl border border-white/10 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full mb-4 shadow-lg shadow-violet-500/30">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Masuk</h1>
          <p className="text-zinc-400">Masuk ke akun Warkop Kamoe Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Masukkan email Anda"
            variant="dark"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Masukkan password Anda"
            variant="dark"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-zinc-400">
            Belum punya akun?{" "}
            <Link
              href="/auth/register"
              className="text-violet-400 hover:text-violet-300 font-semibold"
            >
              Daftar di sini
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-sm font-semibold text-white mb-2">
            📋 Demo Accounts:
          </p>
          <div className="text-xs space-y-2">
            <div className="bg-white/5 p-2 rounded border border-white/10">
              <p className="font-semibold text-white">Admin:</p>
              <p className="text-zinc-400">📧 admin@warkopkamoe.com</p>
              <p className="text-zinc-400">🔑 Admin123</p>
            </div>
            <div className="bg-white/5 p-2 rounded border border-white/10">
              <p className="font-semibold text-white">Owner/Customer:</p>
              <p className="text-zinc-400">Register untuk akun baru</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
