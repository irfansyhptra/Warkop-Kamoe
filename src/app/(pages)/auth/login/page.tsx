"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../hooks/useAuth";
import { useNotification } from "../../../../hooks/useNotification";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";

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
      const user = await login(formData);
      showSuccess("Login Berhasil", `Selamat datang, ${user.name}!`);

      // Redirect based on user role
      switch (user.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "warkop_owner":
          router.push("/warkop-owner/dashboard");
          break;
        default:
          router.push("/");
          break;
      }
    } catch (error) {
      showError("Login Gagal", "Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Masuk</h1>
          <p className="text-gray-600">Masuk ke akun Warkop Kamoe Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Masukkan email Anda"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Masukkan password Anda"
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
          <p className="text-gray-600">
            Belum punya akun?{" "}
            <Link
              href="/auth/register"
              className="text-amber-600 hover:text-amber-700 font-semibold"
            >
              Daftar di sini
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Demo Accounts:</p>
          <div className="text-xs text-gray-400 mt-2 space-y-1">
            <p>Admin: admin@warkop.com</p>
            <p>Owner: owner@example.com</p>
            <p>Customer: customer@example.com</p>
            <p>Password: any</p>
          </div>
        </div>
      </div>
    </div>
  );
}
