"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useAuth } from "../../hooks/useAuth";

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

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

  const UserIcon = () => (
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
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );

  const LogoutIcon = () => (
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
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );

  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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

            {/* User Profile or Auth Buttons */}
            {isAuthenticated && user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-amber-400/10 transition-colors"
                >
                  {user.profileImage || user.avatar ? (
                    <Image
                      src={user.profileImage || user.avatar || ""}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover border-2 border-amber-400"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center border-2 border-amber-400">
                      <span className="text-white text-sm font-semibold">
                        {getInitials(user.name)}
                      </span>
                    </div>
                  )}
                  <span className="text-amber-100 font-medium hidden lg:block">
                    {user.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-amber-200 overflow-hidden z-50">
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200">
                      <p className="font-semibold text-amber-900">
                        {user.name}
                      </p>
                      <p className="text-sm text-amber-700">{user.email}</p>
                      <p className="text-xs text-amber-600 mt-1 capitalize">
                        {user.role}
                      </p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <UserIcon />
                        <span>Profil Saya</span>
                      </Link>
                      <Link
                        href="/(pages)/order-tracking"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <span>Pesanan Saya</span>
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
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
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      {user.role === "warkop_owner" && (
                        <Link
                          href="/warkop-owner/dashboard"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
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
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span>Dashboard Warkop</span>
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-amber-200">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogoutIcon />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
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
            )}
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
            {/* User Profile for Mobile */}
            {isAuthenticated && user && (
              <div className="pb-4 border-b border-amber-200/20">
                <div className="flex items-center gap-3 px-2">
                  {user.profileImage || user.avatar ? (
                    <Image
                      src={user.profileImage || user.avatar || ""}
                      alt={user.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center border-2 border-amber-400">
                      <span className="text-white font-semibold">
                        {getInitials(user.name)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-amber-50">{user.name}</p>
                    <p className="text-sm text-amber-200">{user.email}</p>
                    <p className="text-xs text-amber-300 mt-0.5 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
              </div>
            )}

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

              {/* Mobile User Menu Links */}
              {isAuthenticated && user && (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-amber-100 hover:text-amber-50 transition-colors"
                  >
                    <UserIcon />
                    <span>Profil Saya</span>
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-2 text-amber-100 hover:text-amber-50 transition-colors"
                    >
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
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  {user.role === "warkop_owner" && (
                    <Link
                      href="/warkop-owner/dashboard"
                      className="flex items-center gap-2 text-amber-100 hover:text-amber-50 transition-colors"
                    >
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span>Dashboard Warkop</span>
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* Auth Buttons or Logout for Mobile */}
            {isAuthenticated && user ? (
              <div className="pt-4 border-t border-amber-200/20">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  onClick={handleLogout}
                >
                  <div className="flex items-center justify-center gap-2">
                    <LogoutIcon />
                    <span>Logout</span>
                  </div>
                </Button>
              </div>
            ) : (
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
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
