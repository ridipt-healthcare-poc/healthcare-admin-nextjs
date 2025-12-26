import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface FacilityStaffPermissions {
  manageDashboard?: boolean;
  manageDoctors?: boolean;
  doctorActions?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };
  managePatients?: boolean;
  patientActions?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };
  manageAppointments?: boolean;
  appointmentActions?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };
  manageLocations?: boolean;
  locationActions?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };
  manageStaff?: boolean;
  staffActions?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };
  manageReports?: boolean;
}

export interface FacilityStaff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  facilityId: string;
  facilityType: "Hospital" | "Clinic";
  locationId?: {
    _id: string;
    branchName: string;
    branchCode: string;
  } | string;
  role: "Manager" | "Admin" | "Supervisor" | "Staff";
  staffType: "BranchManager" | "FacilityAdmin" | "LocationSupervisor" | "GeneralStaff";
  permissions: FacilityStaffPermissions;
  profileImage?: string;
  employeeId?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface CreateFacilityStaffData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  facilityId: string;
  facilityType: "Hospital" | "Clinic";
  locationId?: string;
  role?: string;
  staffType?: string;
  permissions?: FacilityStaffPermissions;
  employeeId?: string;
  notes?: string;
}

// Create axios instance with default config
const createApiInstance = () => {
  const token = localStorage.getItem("facility_token");
  return axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

export const facilityStaffService = {
  // Create facility staff
  createStaff: async (data: CreateFacilityStaffData) => {
    const api = createApiInstance();
    const response = await api.post("/api/facility-staff", data);
    return response.data;
  },

  // Get all facility staff
  getAllStaff: async (params?: {
    facilityId?: string;
    locationId?: string;
    role?: string;
    staffType?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const api = createApiInstance();
    const response = await api.get("/api/facility-staff", { params });
    return response.data;
  },

  // Get facility staff by ID
  getStaffById: async (staffId: string) => {
    const api = createApiInstance();
    const response = await api.get(`/api/facility-staff/${staffId}`);
    return response.data;
  },

  // Update facility staff
  updateStaff: async (staffId: string, data: Partial<CreateFacilityStaffData>) => {
    const api = createApiInstance();
    const response = await api.put(`/api/facility-staff/${staffId}`, data);
    return response.data;
  },

  // Update staff permissions
  updatePermissions: async (staffId: string, permissions: FacilityStaffPermissions) => {
    const api = createApiInstance();
    const response = await api.patch(`/api/facility-staff/${staffId}/permissions`, {
      permissions,
    });
    return response.data;
  },

  // Toggle staff status
  toggleStatus: async (staffId: string) => {
    const api = createApiInstance();
    const response = await api.patch(`/api/facility-staff/${staffId}/toggle-status`);
    return response.data;
  },

  // Update staff password
  updatePassword: async (staffId: string, newPassword: string) => {
    const api = createApiInstance();
    const response = await api.patch(`/api/facility-staff/${staffId}/password`, {
      newPassword,
    });
    return response.data;
  },

  // Delete facility staff
  deleteStaff: async (staffId: string) => {
    const api = createApiInstance();
    const response = await api.delete(`/api/facility-staff/${staffId}`);
    return response.data;
  },
};
