"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import Input from "../ui/Input";

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const SearchIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );

  const MenuIcon = () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );

  const CloseIcon = () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  const CartIcon = () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l-2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
      />
    </svg>
  );

  const HeartIcon = () => (
    <svg
      className="w-6 h-6"
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
  );

  return (
    <header className="sticky top-0 z-40 border-b border-amber-200/20 bg-gradient-to-r from-amber-900/40 to-amber-800/40 backdrop-blur-2xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">☕</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-50">Warkop Kamoe</h1>
              <p className="text-xs text-amber-200/80">Marketplace</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-amber-100 hover:text-amber-50 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/(pages)/favorites"
              className="text-amber-100 hover:text-amber-50 transition-colors"
            >
              Favorites
            </Link>
            <Link
              href="/(pages)/order-tracking"
              className="text-amber-100 hover:text-amber-50 transition-colors"
            >
              Tracking
            </Link>
          </nav>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-8"
          >
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Cari warkop atau menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-200/60 hover:text-amber-100 transition-colors"
              >
                <SearchIcon />
              </button>
            </div>
          </form>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/(pages)/favorites"
              className="p-2 rounded-full hover:bg-amber-400/10 transition-colors text-amber-200 hover:text-amber-100"
            >
              <HeartIcon />
            </Link>
            <Link
              href="/(pages)/cart"
              className="relative p-2 rounded-full hover:bg-amber-400/10 transition-colors text-amber-200 hover:text-amber-100"
            >
              <CartIcon />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                0
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/auth?tab=login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-amber-400/10 transition-colors text-amber-200"
          >
            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Cari warkop atau menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-200/60 hover:text-amber-100 transition-colors"
            >
              <SearchIcon />
            </button>
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-amber-200/20 py-4 space-y-4">
            <nav className="space-y-3">
              <Link
                href="/"
                className="block text-amber-100 hover:text-amber-50 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/(pages)/favorites"
                className="block text-amber-100 hover:text-amber-50 transition-colors"
              >
                Favorites
              </Link>
              <Link
                href="/(pages)/order-tracking"
                className="block text-amber-100 hover:text-amber-50 transition-colors"
              >
                Order Tracking
              </Link>
              <Link
                href="/(pages)/cart"
                className="flex items-center gap-2 text-amber-100 hover:text-amber-50 transition-colors"
              >
                <CartIcon />
                <span>Keranjang (0)</span>
              </Link>
            </nav>
            <div className="flex gap-2 pt-4 border-t border-amber-200/20">
              <Link href="/auth?tab=login" className="flex-1">
                <Button variant="ghost" size="sm" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/auth?tab=register" className="flex-1">
                <Button variant="primary" size="sm" className="w-full">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
