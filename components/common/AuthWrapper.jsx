"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

const AuthWrapper = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated && !token) {
      // Also check localStorage as a fallback
      const localToken = localStorage.getItem("token");
      if (!localToken) {
        router.push("/auth/login");
      }
    }
  }, [isAuthenticated, token, router]);

  // Show loading or nothing while checking authentication
  if (!isAuthenticated && !token && typeof window !== "undefined") {
    const localToken = localStorage.getItem("token");
    if (!localToken) {
      return null; // Don't render anything while redirecting
    }
  }

  return children;
};

export default AuthWrapper;
