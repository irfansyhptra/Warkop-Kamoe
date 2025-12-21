"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { WarkopRegistration } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function WarkopSetupPage() {
  const [formData, setFormData] = useState<WarkopRegistration>({
    name: "",
    description: "",
    location: "",
    coordinates: { lat: 0, lng: 0 },
    contactInfo: { phone: "", whatsapp: "" },
    openingHours: { open: "06:00", close: "22:00", is24Hours: false },
    facilities: [],
    images: [],
    ownerInfo: { name: "", email: "", phone: "", idCard: "" },
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const router = useRouter();

  const facilities = [
    "WiFi",
    "Parkir",
    "AC",
    "Musholla",
    "Toilet",
    "Live Music",
    "Outdoor Seating",
    "Non-Smoking Area",
    "Playground",
    "Meeting Room",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof WarkopRegistration] as Record<
            string,
            unknown
          >),
          [child]:
            type === "checkbox"
              ? (e.target as HTMLInputElement).checked
              : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFacilityToggle = (facility: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("warkop-kamoe-token");

      if (!token || !user) {
        showError("Error", "Silakan login terlebih dahulu");
        router.push("/mywarkop");
        return;
      }

      // Create warkop via API
      const response = await fetch("/api/warkops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          ownerId: user.id,
          address: formData.location,
          city: formData.location.split(",").pop()?.trim() || "Unknown",
          phone: formData.contactInfo.phone,
          openingHours: formData.openingHours.is24Hours
            ? ["24 Hours"]
            : [
                `${formData.openingHours.open} - ${formData.openingHours.close}`,
              ],
          facilities: formData.facilities,
          latitude: formData.coordinates.lat || -6.2,
          longitude: formData.coordinates.lng || 106.8,
          images: formData.images || [],
          categories: ["Kopi", "Makanan"],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Warkop creation failed:", errorData);
        throw new Error(errorData.error || "Gagal mendaftarkan warkop");
      }

      const result = await response.json();
      
      if (!result.success || !result.data || !result.data.warkop) {
        console.error("Invalid response format:", result);
        throw new Error("Response tidak valid dari server");
      }

      const warkopId = result.data.warkop._id;

      // Update user's warkopId
      const updateResponse = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ warkopId }),
      });

      if (!updateResponse.ok) {
        console.warn("Failed to update user warkopId, but warkop was created");
        // Still continue, user can manually link later
      } else {
        // Update local user object
        const userData = await updateResponse.json();
        if (userData.success && userData.data) {
          localStorage.setItem("warkop-kamoe-user", JSON.stringify(userData.data));
        }
      }

      showSuccess(
        "Warkop Berhasil Didaftarkan",
        "Warkop Anda akan diverifikasi dalam 1-2 hari kerja"
      );

      // Small delay before redirect to ensure state is updated
      setTimeout(() => {
        router.push("/warkop-owner/dashboard");
      }, 500);
    } catch (error) {
      console.error("Setup warkop error:", error);
      showError(
        "Gagal Setup Warkop",
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan, silakan coba lagi"
      );
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (!user || user.role !== "warkop_owner") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Akses Ditolak</h1>
          <p className="text-zinc-400 mt-2">
            Halaman ini hanya untuk pemilik warkop
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Setup Warkop Anda
          </h1>
          <p className="text-zinc-400">
            Lengkapi informasi warkop untuk memulai berjualan
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  step <= currentStep ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30" : "bg-zinc-700"
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-16 h-1 ${
                    step < currentStep ? "bg-violet-500" : "bg-zinc-700"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-[#121215] rounded-2xl border border-white/10 p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Informasi Dasar Warkop
                </h2>

                <Input
                  label="Nama Warkop *"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Contoh: Warkop Pak Ahmad"
                  variant="dark"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Deskripsi Warkop *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Ceritakan tentang warkop Anda..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
                    required
                  />
                </div>

                <Input
                  label="Alamat Lengkap *"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Jl. Contoh No. 123, Kota"
                  variant="dark"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nomor Telepon *"
                    type="tel"
                    name="contactInfo.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleInputChange}
                    placeholder="021-12345678"
                    variant="dark"
                    required
                  />
                  <Input
                    label="WhatsApp (Opsional)"
                    type="tel"
                    name="contactInfo.whatsapp"
                    value={formData.contactInfo.whatsapp}
                    onChange={handleInputChange}
                    placeholder="08123456789"
                    variant="dark"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Operational Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Informasi Operasional
                </h2>

                <div>
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      name="openingHours.is24Hours"
                      checked={formData.openingHours.is24Hours}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          openingHours: {
                            ...prev.openingHours,
                            is24Hours: e.target.checked,
                          },
                        }))
                      }
                      className="mr-2 w-4 h-4 text-violet-500 bg-white/5 border-white/20 rounded focus:ring-violet-500"
                    />
                    <span className="text-sm font-medium text-zinc-300">
                      Buka 24 Jam
                    </span>
                  </label>

                  {!formData.openingHours.is24Hours && (
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Jam Buka"
                        type="time"
                        name="openingHours.open"
                        value={formData.openingHours.open}
                        onChange={handleInputChange}
                        variant="dark"
                      />
                      <Input
                        label="Jam Tutup"
                        type="time"
                        name="openingHours.close"
                        value={formData.openingHours.close}
                        onChange={handleInputChange}
                        variant="dark"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-3">
                    Fasilitas yang Tersedia
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {facilities.map((facility) => (
                      <label
                        key={facility}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.facilities.includes(facility)
                            ? "bg-violet-500/20 border-violet-500/50 text-white"
                            : "border-white/10 text-zinc-400 hover:bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.facilities.includes(facility)}
                          onChange={() => handleFacilityToggle(facility)}
                          className="mr-2 w-4 h-4 text-violet-500 bg-white/5 border-white/20 rounded focus:ring-violet-500"
                        />
                        <span className="text-sm">{facility}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Owner Info */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Informasi Pemilik
                </h2>

                <Input
                  label="Nama Lengkap Pemilik *"
                  type="text"
                  name="ownerInfo.name"
                  value={formData.ownerInfo.name}
                  onChange={handleInputChange}
                  placeholder="Nama sesuai KTP"
                  variant="dark"
                  required
                />

                <Input
                  label="Email Pemilik *"
                  type="email"
                  name="ownerInfo.email"
                  value={formData.ownerInfo.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  variant="dark"
                  required
                />

                <Input
                  label="Nomor Telepon Pemilik *"
                  type="tel"
                  name="ownerInfo.phone"
                  value={formData.ownerInfo.phone}
                  onChange={handleInputChange}
                  placeholder="08123456789"
                  variant="dark"
                  required
                />

                <Input
                  label="Nomor KTP *"
                  type="text"
                  name="ownerInfo.idCard"
                  value={formData.ownerInfo.idCard}
                  onChange={handleInputChange}
                  placeholder="16 digit nomor KTP"
                  variant="dark"
                  required
                />

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <h3 className="font-medium text-amber-400 mb-2">
                    📋 Proses Verifikasi
                  </h3>
                  <p className="text-sm text-amber-300/80">
                    Setelah mendaftar, tim kami akan memverifikasi informasi
                    warkop Anda dalam 1-2 hari kerja. Anda akan mendapat
                    notifikasi melalui email setelah verifikasi selesai.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                disabled={currentStep === 1}
              >
                ← Sebelumnya
              </Button>

              {currentStep < 3 ? (
                <Button type="button" onClick={nextStep} variant="primary">
                  Selanjutnya →
                </Button>
              ) : (
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Menyimpan..." : "Daftar Warkop"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
