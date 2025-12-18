"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, authLoading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth?tab=login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateProfile(formData);
      setIsEditing(false);
      alert("Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Gagal memperbarui profil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profil Saya</h1>
          <p className="text-zinc-400">
            Kelola informasi profil Anda untuk mengontrol, melindungi, dan
            mengamankan akun
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 p-8 border-b border-white/5">
            <div className="flex items-center gap-6">
              {user.profileImage || user.avatar ? (
                <Image
                  src={user.profileImage || user.avatar || ""}
                  alt={user.name}
                  width={100}
                  height={100}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-violet-500/50 shadow-lg shadow-violet-500/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center ring-4 ring-violet-500/50 shadow-lg shadow-violet-500/20">
                  <span className="text-white text-3xl font-bold">
                    {getInitials(user.name)}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {user.name}
                </h2>
                <p className="text-zinc-400 mb-2">{user.email}</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-violet-500/20 backdrop-blur-sm rounded-full text-violet-400 text-sm font-medium capitalize border border-violet-500/20">
                    {user.role || "customer"}
                  </span>
                  {user.isVerified && (
                    <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-sm rounded-full text-emerald-400 text-sm font-medium flex items-center gap-1 border border-emerald-500/20">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Terverifikasi
                    </span>
                  )}
                </div>
              </div>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/40"
                >
                  Edit Profil
                </Button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Nama Lengkap
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Masukkan nama lengkap"
                    variant="dark"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Masukkan email"
                    disabled
                    variant="dark"
                    className="bg-white/5 cursor-not-allowed opacity-60"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Email tidak dapat diubah
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Nomor Telepon
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Contoh: 08123456789"
                    variant="dark"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">
                      Nama Lengkap
                    </label>
                    <p className="text-lg text-white">{user.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">
                      Email
                    </label>
                    <p className="text-lg text-white">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">
                      Nomor Telepon
                    </label>
                    <p className="text-lg text-white">
                      {user.phone || "Belum diatur"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">
                      Role
                    </label>
                    <p className="text-lg text-white capitalize">
                      {user.role || "customer"}
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Informasi Tambahan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
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
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm text-zinc-400">Warkop Favorit</p>
                        <p className="font-semibold text-white">
                          {user.favoriteWarkops?.length || 0} Warkop
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm text-zinc-400">Status Akun</p>
                        <p className="font-semibold text-white">
                          {user.isVerified
                            ? "Terverifikasi"
                            : "Belum Terverifikasi"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Aksi Cepat
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => router.push("/(pages)/favorites")}
                      className="justify-start"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      Lihat Favorit
                    </Button>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => router.push("/(pages)/order-tracking")}
                      className="justify-start"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Lacak Pesanan
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
