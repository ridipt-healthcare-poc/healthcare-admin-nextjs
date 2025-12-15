import { api } from "./api";

// Location Types
export interface Location {
  _id: string;
  facilityId: string;
  facilityType: "Hospital" | "Clinic";
  branchName: string;
  branchCode: string;
  phone: string;
  email?: string;
  address: {
    street: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isMainBranch: boolean;
  operatingHours: Record<string, { open: string; close: string; is24x7?: boolean }>;
  numberOfBeds?: number;
  departments?: string[];
  facilities?: string[];
  totalDoctors: number;
  totalSupportStaff: number;
  isActive: boolean;
  branchManager?: {
    name: string;
    phone: string;
    email: string;
  };
  description?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationData {
  facilityId: string;
  facilityType: "Hospital" | "Clinic";
  branchName: string;
  branchCode: string;
  phone: string;
  email?: string;
  address: {
    street: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isMainBranch?: boolean;
  operatingHours?: Record<string, { open: string; close: string; is24x7?: boolean }>;
  numberOfBeds?: number;
  departments?: string[];
  facilities?: string[];
  branchManager?: {
    name: string;
    phone: string;
    email: string;
  };
  description?: string;
}

// Location API Services
export const locationService = {
  // Create a new location
  createLocation: async (data: CreateLocationData) => {
    const response = await api.post("/api/locations", data);
    return response.data;
  },

  // Get all locations for a facility
  getLocationsByFacility: async (
    facilityId: string,
    params?: {
      page?: number;
      limit?: number;
      isActive?: boolean;
      city?: string;
      state?: string;
      isMainBranch?: boolean;
    }
  ) => {
    const response = await api.get(`/api/locations/facility/${facilityId}`, {
      params,
    });
    return response.data;
  },

  // Get all locations (public)
  getAllLocations: async (params?: {
    page?: number;
    limit?: number;
    facilityType?: "Hospital" | "Clinic";
    city?: string;
    state?: string;
    isActive?: boolean;
    search?: string;
  }) => {
    const response = await api.get("/api/locations/all", { params });
    return response.data;
  },

  // Get location by ID
  getLocationById: async (locationId: string) => {
    const response = await api.get(`/api/locations/${locationId}`);
    return response.data;
  },

  // Update location
  updateLocation: async (locationId: string, data: Partial<CreateLocationData>) => {
    const response = await api.put(`/api/locations/${locationId}`, data);
    return response.data;
  },

  // Delete location
  deleteLocation: async (locationId: string) => {
    const response = await api.delete(`/api/locations/${locationId}`);
    return response.data;
  },

  // Toggle location status
  toggleLocationStatus: async (locationId: string) => {
    const response = await api.patch(`/api/locations/${locationId}/toggle-status`);
    return response.data;
  },

  // Set main branch
  setMainBranch: async (locationId: string) => {
    const response = await api.patch(`/api/locations/${locationId}/set-main-branch`);
    return response.data;
  },

  // Get location statistics
  getLocationStats: async (locationId: string) => {
    const response = await api.get(`/api/locations/${locationId}/stats`);
    return response.data;
  },

  // Find nearby locations
  getNearbyLocations: async (latitude: number, longitude: number, maxDistance?: number) => {
    const response = await api.get("/api/locations/nearby", {
      params: { latitude, longitude, maxDistance },
    });
    return response.data;
  },
};
