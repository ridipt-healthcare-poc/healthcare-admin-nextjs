"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PermissionGuardProps {
  children: React.ReactNode;
  module: string;
  action?: "create" | "read" | "update" | "delete";
}

export default function PermissionGuard({
  children,
  module,
  action,
}: PermissionGuardProps) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = () => {
      const userType = localStorage.getItem("user_type");

      // Facility owners have full access
      if (userType === "owner") {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // For staff, check permissions
      const permissionsStr = localStorage.getItem("staff_permissions");
      if (!permissionsStr) {
        router.push("/dashboard");
        return;
      }

      const permissions = JSON.parse(permissionsStr);

      // Map frontend module names to permission fields
      const modulePermissionMap: Record<string, { manage: string; actions: string }> = {
        dashboard: { manage: "manageDashboard", actions: "" },
        doctors: { manage: "manageDoctors", actions: "doctorActions" },
        patients: { manage: "managePatients", actions: "patientActions" },
        appointments: { manage: "manageAppointments", actions: "appointmentActions" },
        locations: { manage: "manageLocations", actions: "locationActions" },
        staff: { manage: "manageStaff", actions: "staffActions" },
        reports: { manage: "manageReports", actions: "" },
      };

      const moduleConfig = modulePermissionMap[module];
      
      if (!moduleConfig) {
        router.push("/dashboard");
        return;
      }

      // Check if user has access to the module
      if (!permissions[moduleConfig.manage]) {
        router.push("/dashboard");
        return;
      }

      // If specific action is required, check it
      if (action && moduleConfig.actions) {
        const moduleActions = permissions[moduleConfig.actions];
        if (!moduleActions || !moduleActions[action]) {
          router.push("/dashboard");
          return;
        }
      }

      setHasAccess(true);
      setLoading(false);
    };

    checkPermission();
  }, [router, module, action]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
