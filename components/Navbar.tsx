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
  currentPage: "dashboard" | "doctors" | "patients" | "appointments" | "staff" | "locations";
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
  const [userType, setUserType] = useState<string>("owner");
  const [permissions, setPermissions] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    const facilityData = localStorage.getItem("facility_data");
    const type = localStorage.getItem("facility_type");
    const uType = localStorage.getItem("user_type") || "owner";
    const perms = localStorage.getItem("staff_permissions");
    const staffData = localStorage.getItem("staff_data");
    const locationData = localStorage.getItem("location_data");
    
    if (uType === "staff" && staffData) {
      // For staff users, create minimal facility info
      try {
        const staff = JSON.parse(staffData);
        const minimalFacility = {
          _id: staff.facilityId?._id || staff.facilityId,
          name: staff.facilityId?.name || "Facility",
        };
        setFacility(minimalFacility);
        setFacilityType(staff.facilityType);
      } catch (error) {
        console.error("Error parsing staff data in navbar:", error);
      }
    } else if (facilityData && type) {
      // For facility owners
      setFacility(JSON.parse(facilityData));
      setFacilityType(type);
    }
    
    setUserType(uType);
    if (perms) {
      setPermissions(JSON.parse(perms));
    }
    if (locationData) {
      setLocation(JSON.parse(locationData));
    }
  }, []);

  // Check if user has permission for a module
  const hasPermission = (module: string) => {
    if (userType === "owner") return true; // Owner has all permissions
    if (!permissions) return false;
    
    // Check if the manage flag is true or if read permission exists
    switch (module) {
      case "dashboard":
        return permissions.manageDashboard === true;
      case "doctors":
        return permissions.manageDoctors === true || permissions.doctorActions?.read === true;
      case "patients":
        return permissions.managePatients === true || permissions.patientActions?.read === true;
      case "appointments":
        return permissions.manageAppointments === true || permissions.appointmentActions?.read === true;
      case "locations":
        return permissions.manageLocations === true || permissions.locationActions?.read === true;
      case "staff":
        return permissions.manageStaff === true || permissions.staffActions?.read === true;
      default:
        return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("facility_token");
    localStorage.removeItem("facility_data");
    localStorage.removeItem("facility_type");
    localStorage.removeItem("user_type");
    localStorage.removeItem("staff_data");
    localStorage.removeItem("staff_permissions");
    localStorage.removeItem("location_data");
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
                <p className="text-xs text-gray-500 capitalize">
                  {location ? `${location.branchName} - ${facilityType}` : facilityType}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {hasPermission("dashboard") && (
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
              )}
              {hasPermission("doctors") && (
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
              )}
              {hasPermission("patients") && (
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
              )}
              {hasPermission("appointments") && (
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
              )}
              {hasPermission("locations") && (
                <button
                  onClick={() => router.push("/locations")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === "locations"
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Locations
                </button>
              )}
              {hasPermission("staff") && (
                <button
                  onClick={() => router.push("/staff")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === "staff"
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Staff
                </button>
              )}
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
