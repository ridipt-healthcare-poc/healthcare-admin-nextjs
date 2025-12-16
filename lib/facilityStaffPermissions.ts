import { FacilityStaffPermissions } from "./facilityStaffApi";

// Check if user has access to a specific module
export const hasModule = (permissions: FacilityStaffPermissions | undefined, module: string): boolean => {
  if (!permissions) return false;
  return permissions[module as keyof FacilityStaffPermissions] === true;
};

// Check if user has access to a specific action within a module
export const hasAction = (
  permissions: FacilityStaffPermissions | undefined,
  module: string,
  action: "create" | "read" | "update" | "delete"
): boolean => {
  if (!permissions) return false;

  // Map module names to their action keys
  const moduleToActionsMap: Record<string, string> = {
    manageDoctors: "doctorActions",
    managePatients: "patientActions",
    manageAppointments: "appointmentActions",
    manageLocations: "locationActions",
    manageStaff: "staffActions",
  };

  const actionsKey = moduleToActionsMap[module];

  if (!actionsKey) {
    // If no actions key, just check if module access is granted
    return hasModule(permissions, module);
  }

  // Check if module access is granted first
  if (!hasModule(permissions, module)) {
    return false;
  }

  // Check specific action
  const actions = permissions[actionsKey as keyof FacilityStaffPermissions] as Record<string, boolean> | undefined;
  return actions?.[action] === true;
};

// Check if user can access any feature
export const hasAnyPermission = (permissions: FacilityStaffPermissions | undefined): boolean => {
  if (!permissions) return false;
  
  return Object.values(permissions).some((value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "object") {
      return Object.values(value).some((v) => v === true);
    }
    return false;
  });
};
