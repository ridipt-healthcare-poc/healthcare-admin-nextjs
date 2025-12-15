"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Building2,
  LogOut,
  Activity,
  Users,
  Stethoscope,
  ClipboardList,
  UserRound,
  Plus,
  MapPin,
} from "lucide-react";

interface NavbarProps {
  currentPage: "dashboard" | "doctors" | "patients" | "appointments" | "staff";
  onAddClick?: () => void;
  addButtonText?: string;
  showAddButton?: boolean;
}

export default function Navbar({
  currentPage,
  onAddClick,
  addButtonText,
  showAddButton = false,
}: NavbarProps) {
  const router = useRouter();
  const [facility, setFacility] = useState<any>(null);
  const [facilityType, setFacilityType] = useState<string>("");

  useEffect(() => {
    const facilityData = localStorage.getItem("facility_data");
    const type = localStorage.getItem("facility_type");
    if (facilityData && type) {
      setFacility(JSON.parse(facilityData));
      setFacilityType(type);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("facility_token");
    localStorage.removeItem("facility_data");
    localStorage.removeItem("facility_type");
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {facility?.name || "Facility"}
                </h1>
                <p className="text-xs text-gray-500 capitalize">{facilityType}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => router.push("/dashboard")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === "dashboard"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Activity className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => router.push("/doctors")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === "doctors"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                Doctors
              </button>
              <button
                onClick={() => router.push("/patients")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === "patients"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <UserRound className="w-4 h-4" />
                Patients
              </button>
              <button
                onClick={() => router.push("/appointments")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === "appointments"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Appointments
              </button>
              <button
                onClick={() => router.push("/locations")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Locations
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                <Users className="w-4 h-4" />
                Staff
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {showAddButton && onAddClick && (
              <button
                onClick={onAddClick}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
              >
                <Plus className="h-5 w-5" />
                {addButtonText || "Add"}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
