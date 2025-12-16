"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    console.log("🔍 Dashboard Layout - Checking authentication...")
    console.log("📍 Current pathname:", window.location.pathname)
    console.log("⏰ Timestamp:", new Date().toISOString())

    const token = localStorage.getItem("facility_token");
    const userType = localStorage.getItem("user_type");

    console.log("🔑 Token present:", token ? "Yes" : "No")
    console.log("🔑 Token value:", token ? token.substring(0, 20) + "..." : "null")
    console.log("👤 User type:", userType || "Not set")

    // Check all localStorage items
    const allKeys = Object.keys(localStorage)
    console.log("💾 All localStorage keys:", allKeys)

    if (!token) {
      console.log("❌ No token found, redirecting to login")
      router.push("/login");
      return;
    }

    console.log("✅ Token found, allowing access to dashboard")
    setIsChecking(false);
  }, [router]);

  const getCurrentPage = (): "dashboard" | "doctors" | "patients" | "appointments" | "staff" | "locations" => {
    if (pathname.includes("/doctors")) return "doctors";
    if (pathname.includes("/patients")) return "patients";
    if (pathname.includes("/appointments")) return "appointments";
    if (pathname.includes("/locations")) return "locations";
    if (pathname.includes("/staff")) return "staff";
    return "dashboard";
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar currentPage={getCurrentPage()} />
      <div ref={contentRef} className="min-h-screen bg-gray-50" style={{ minHeight: 'calc(100vh - 73px)' }}>
        {children}
      </div>
    </>
  );
}
