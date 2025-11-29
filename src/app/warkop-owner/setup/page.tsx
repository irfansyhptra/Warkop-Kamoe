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
      // Simulasi API call untuk registrasi warkop
      await new Promise((resolve) => setTimeout(resolve, 2000));

      showSuccess(
        "Warkop Berhasil Didaftarkan",
        "Warkop Anda akan diverifikasi dalam 1-2 hari kerja"
      );

      router.push("/warkop-owner/dashboard");
    } catch {
      showError("Error", "Terjadi kesalahan, silakan coba lagi");
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Akses Ditolak</h1>
          <p className="text-gray-600 mt-2">
            Halaman ini hanya untuk pemilik warkop
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Setup Warkop Anda
          </h1>
          <p className="text-gray-600">
            Lengkapi informasi warkop untuk memulai berjualan
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  step <= currentStep ? "bg-amber-600" : "bg-gray-300"
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-16 h-1 ${
                    step < currentStep ? "bg-amber-600" : "bg-gray-300"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">
                  Informasi Dasar Warkop
                </h2>

                <Input
                  label="Nama Warkop *"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Contoh: Warkop Pak Ahmad"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Warkop *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Ceritakan tentang warkop Anda..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
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
                    required
                  />
                  <Input
                    label="WhatsApp (Opsional)"
                    type="tel"
                    name="contactInfo.whatsapp"
                    value={formData.contactInfo.whatsapp}
                    onChange={handleInputChange}
                    placeholder="08123456789"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Operational Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">
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
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
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
                      />
                      <Input
                        label="Jam Tutup"
                        type="time"
                        name="openingHours.close"
                        value={formData.openingHours.close}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Fasilitas yang Tersedia
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {facilities.map((facility) => (
                      <label
                        key={facility}
                        className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={formData.facilities.includes(facility)}
                          onChange={() => handleFacilityToggle(facility)}
                          className="mr-2"
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
                <h2 className="text-xl font-semibold mb-4">
                  Informasi Pemilik
                </h2>

                <Input
                  label="Nama Lengkap Pemilik *"
                  type="text"
                  name="ownerInfo.name"
                  value={formData.ownerInfo.name}
                  onChange={handleInputChange}
                  placeholder="Nama sesuai KTP"
                  required
                />

                <Input
                  label="Email Pemilik *"
                  type="email"
                  name="ownerInfo.email"
                  value={formData.ownerInfo.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  required
                />

                <Input
                  label="Nomor Telepon Pemilik *"
                  type="tel"
                  name="ownerInfo.phone"
                  value={formData.ownerInfo.phone}
                  onChange={handleInputChange}
                  placeholder="08123456789"
                  required
                />

                <Input
                  label="Nomor KTP *"
                  type="text"
                  name="ownerInfo.idCard"
                  value={formData.ownerInfo.idCard}
                  onChange={handleInputChange}
                  placeholder="16 digit nomor KTP"
                  required
                />

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">
                    📋 Proses Verifikasi
                  </h3>
                  <p className="text-sm text-yellow-700">
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
