import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  const InstagramIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.988-5.367 11.988-11.988C24.005 5.367 18.638.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.354-1.396S3.699 13.781 3.699 12.484s.49-2.448 1.396-3.354S7.152 7.734 8.449 7.734s2.448.49 3.354 1.396.896 2.057.896 3.354-.49 2.448-1.396 3.354-2.057.896-3.354.896z" />
    </svg>
  );

  const FacebookIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );

  const TwitterIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </svg>
  );

  const WhatsappIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
    </svg>
  );

  return (
    <footer className="border-t border-amber-200/20 bg-gradient-to-r from-amber-900/60 to-amber-800/50 backdrop-blur-2xl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">☕</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-amber-50">
                  Warkop Kamoe
                </h2>
                <p className="text-xs text-amber-200/80">Marketplace</p>
              </div>
            </div>
            <p className="text-amber-200/80 text-sm">
              Platform marketplace warkop terpercaya di Banda Aceh dengan
              pengalaman belanja yang modern dan nyaman.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 rounded-full bg-amber-400/10 text-amber-200 hover:text-amber-100 hover:bg-amber-400/20 transition-colors"
              >
                <InstagramIcon />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-amber-400/10 text-amber-200 hover:text-amber-100 hover:bg-amber-400/20 transition-colors"
              >
                <FacebookIcon />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-amber-400/10 text-amber-200 hover:text-amber-100 hover:bg-amber-400/20 transition-colors"
              >
                <TwitterIcon />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-amber-400/10 text-amber-200 hover:text-amber-100 hover:bg-amber-400/20 transition-colors"
              >
                <WhatsappIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-50">Quick Links</h3>
            <nav className="space-y-2">
              <Link
                href="/"
                className="block text-amber-200/80 hover:text-amber-100 transition-colors text-sm"
              >
                Home
              </Link>
              <Link
                href="/favorites"
                className="block text-amber-200/80 hover:text-amber-100 transition-colors text-sm"
              >
                Favorites
              </Link>
              <Link
                href="/cart"
                className="block text-amber-200/80 hover:text-amber-100 transition-colors text-sm"
              >
                Keranjang
              </Link>
              <Link
                href="/(pages)/order-tracking"
                className="block text-amber-200/80 hover:text-amber-100 transition-colors text-sm"
              >
                Order Tracking
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-50">
              Customer Service
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-amber-200/80">
                <span className="font-medium">Phone:</span> +62 651-1234567
              </p>
              <p className="text-amber-200/80">
                <span className="font-medium">WhatsApp:</span> +62 812-3456-7890
              </p>
              <p className="text-amber-200/80">
                <span className="font-medium">Email:</span> info@warkopkamoe.com
              </p>
              <p className="text-amber-200/80">
                <span className="font-medium">Jam Layanan:</span> 08:00 - 22:00
                WIB
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-50">Lokasi</h3>
            <div className="text-sm text-amber-200/80">
              <p>Jl. Sultan Iskandar Muda</p>
              <p>Banda Aceh, Aceh 23116</p>
              <p>Indonesia</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-amber-100">Area Layanan:</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-lg bg-amber-400/20 text-amber-100 text-xs border border-amber-300/30">
                  Banda Aceh
                </span>
                <span className="px-2 py-1 rounded-lg bg-amber-400/20 text-amber-100 text-xs border border-amber-300/30">
                  Aceh Besar
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-amber-200/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-amber-200/60 text-sm">
            © 2024 Warkop Kamoe Marketplace. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-amber-200/80 hover:text-amber-100 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-amber-200/80 hover:text-amber-100 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-amber-200/80 hover:text-amber-100 transition-colors"
            >
              Help Center
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
