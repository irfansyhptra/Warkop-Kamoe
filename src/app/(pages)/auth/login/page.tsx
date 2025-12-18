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
    <div className="min-h-screen bg-gradient-to-br from-[#faf6f1] to-[#f5ede3] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#e8dcc8] p-8">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-[#f5ede3] rounded-full mb-4">
            <svg
              className="w-12 h-12 text-[#c49a6c]"
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
          <h1 className="text-3xl font-bold text-[#5c3d2e] mb-2">Masuk</h1>
          <p className="text-[#8b6f5c]">Masuk ke akun Warkop Kamoe Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Masukkan email Anda"
            variant="light"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Masukkan password Anda"
            variant="light"
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
          <p className="text-[#8b6f5c]">
            Belum punya akun?{" "}
            <Link
              href="/auth/register"
              className="text-[#c49a6c] hover:text-[#b8956b] font-semibold"
            >
              Daftar di sini
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-[#f5ede3] rounded-lg border border-[#e8dcc8]">
          <p className="text-sm font-semibold text-[#5c3d2e] mb-2">
            📋 Demo Accounts:
          </p>
          <div className="text-xs space-y-2">
            <div className="bg-white p-2 rounded border border-[#e8dcc8]">
              <p className="font-semibold text-[#5c3d2e]">Admin:</p>
              <p className="text-[#8b6f5c]">📧 admin@warkopkamoe.com</p>
              <p className="text-[#8b6f5c]">🔑 Admin123</p>
            </div>
            <div className="bg-white p-2 rounded border border-[#e8dcc8]">
              <p className="font-semibold text-[#5c3d2e]">Owner/Customer:</p>
              <p className="text-[#8b6f5c]">Register untuk akun baru</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
