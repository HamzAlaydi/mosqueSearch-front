"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Check if we're on one of the auth pages or home page
  const isAuthOrHomePage =
    pathname === "/" ||
    pathname === "/auth/login" ||
    pathname === "/auth/signup";

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="navbar-logo">
          <Link href="/">
            <h1>MosqueMatch</h1>
          </Link>
        </div>

        {isAuthOrHomePage ? (
          <>
            <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
              <Link href="/auth/login" className="btn">
                Login
              </Link>
              <Link href="/auth/signup" className="btn">
                SignUp
              </Link>
            </div>

            <div className="mobile-toggle" onClick={toggleMenu}>
              <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                className="flex items-center gap-2 border border-gray-300 rounded-full p-2 hover:shadow-md transition"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <Menu size={18} className="text-gray-600" />
                <div className="bg-gray-200 rounded-full p-1">
                  <User size={18} className="text-gray-600" />
                </div>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                  <div className="py-2">
                    <Link
                      href="/auth/signup"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Sign up
                    </Link>
                    <Link
                      href="/auth/login"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Log in
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <Link
                      href="/"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Mosque dashboard
                    </Link>
                    <Link
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Community events
                    </Link>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                      Settings
                    </a>
                    <Link
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Help
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
