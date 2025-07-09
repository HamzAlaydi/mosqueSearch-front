"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/redux/auth/authSlice";
import { useDispatch } from "react-redux";
import { HeaderNotifications } from "./NotificationSystem";
import "./Navbar.css";

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/auth/login");
  };

  const isAuthPage =
    pathname === "/" ||
    pathname === "/auth/login" ||
    pathname === "/auth/signup" ||
    pathname === "/auth/imam";

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 w-full py-3">
      <div className="container navbar-container">
        <div className="navbar-logo">
          <Link href="/mosqueSearch">
            <h1>MosqueZawaj</h1>
          </Link>
        </div>

        {!isAuthPage && (
          <div className="flex items-center gap-4 ml-auto">
            {/* Notifications */}
            <HeaderNotifications />

            {/* User menu */}
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

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                  <div className="py-2">
                    <a
                      href="/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Profile
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isAuthPage && (
          <>
            <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
              <Link
                href="/auth/login"
                className="text-sm px-1 py-1 rounded-md"
                style={{ backgroundColor: "var(--primary)", color: "#fff" }}
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm px-3 py-1 rounded-md"
                style={{ backgroundColor: "var(--primary)", color: "#fff" }}
              >
                SignUp
              </Link>
              <Link
                href="/auth/imam"
                className="text-sm px-3 py-1 rounded-md"
                style={{ backgroundColor: "var(--primary)", color: "#fff" }}
              >
                SignUp Imam
              </Link>
            </div>

            <div className="mobile-toggle" onClick={toggleMenu}>
              <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
