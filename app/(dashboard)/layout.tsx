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
    const token = localStorage.getItem("facility_token");
    if (!token) {
      router.push("/login");
      return;
    }
    setIsChecking(false);
  }, [router]);

  const getCurrentPage = (): "dashboard" | "doctors" | "patients" | "appointments" | "staff" => {
    if (pathname.includes("/doctors")) return "doctors";
    if (pathname.includes("/patients")) return "patients";
    if (pathname.includes("/appointments")) return "appointments";
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
