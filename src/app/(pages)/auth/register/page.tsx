"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "customer" as "customer" | "warkop_owner",
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showSuccess, showError } = useNotification();
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showError("Error", "Password dan konfirmasi password tidak sama");
      return;
    }

    if (formData.password.length < 6) {
      showError("Error", "Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const success = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.phone
      );

      if (success) {
        showSuccess("Registrasi Berhasil", "Akun Anda berhasil dibuat!");
        router.push("/");
      } else {
        showError("Registrasi Gagal", "Terjadi kesalahan, silakan coba lagi");
      }
    } catch {
      showError("Registrasi Gagal", "Terjadi kesalahan, silakan coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf6f1] to-[#f5ede3] flex items-center justify-center px-4 py-8">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#5c3d2e] mb-2">Daftar</h1>
          <p className="text-[#8b6f5c]">Buat akun Warkop Kamoe baru</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nama Lengkap"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Masukkan nama lengkap"
            variant="light"
            required
          />

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
            label="Nomor Telepon"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Masukkan nomor telepon"
            variant="light"
          />

          <div>
            <label className="block text-sm font-semibold text-[#5c3d2e] mb-2">
              Tipe Akun
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[#faf6f1] border-2 border-[#d4c4b0] rounded-lg text-[#5c3d2e] font-medium focus:outline-none focus:ring-2 focus:ring-[#c49a6c] focus:border-[#c49a6c] focus:bg-white hover:border-[#c49a6c] transition-all"
              required
            >
              <option value="customer">Customer</option>
              <option value="warkop_owner">Pemilik Warkop</option>
            </select>
          </div>

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Masukkan password (min. 6 karakter)"
            variant="light"
            required
          />

          <Input
            label="Konfirmasi Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Konfirmasi password Anda"
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
            {loading ? "Memproses..." : "Daftar"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#8b6f5c]">
            Sudah punya akun?{" "}
            <Link
              href="/auth/login"
              className="text-[#c49a6c] hover:text-[#b8956b] font-semibold"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
