"use client";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/mosqueSearch";

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}
