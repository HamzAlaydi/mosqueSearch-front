"use client";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import AuthWrapper from "@/components/common/AuthWrapper";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/mosqueSearch";

  // Define public paths that don't need authentication
  const publicPaths = [
    "/auth/login",
    "/auth/signup",
    "/auth/imam",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
    "/auth/resend-verification",
    "/auth/after-signup-handler",
  ];

  const isPublicPath = publicPaths.some(
    (publicPath) =>
      pathname === publicPath ||
      (publicPath !== "/" && pathname.startsWith(publicPath))
  );

  // Allow access to homepage regardless of authentication
  const isHomePage = pathname === "/";

  return (
    <>
      {!hideNavbar && <Navbar />}
      {isPublicPath || isHomePage ? (
        children
      ) : (
        <AuthWrapper>{children}</AuthWrapper>
      )}
    </>
  );
}
