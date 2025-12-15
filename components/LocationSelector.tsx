"use client";

import { useEffect, useState } from "react";
import { locationService, type Location } from "@/lib/locationApi";

interface LocationSelectorProps {
  facilityId?: string;
  value?: string;
  onChange: (locationId: string) => void;
  required?: boolean;
  className?: string;
}

export function LocationSelector({
  facilityId,
  value,
  onChange,
  required = false,
  className = "",
}: LocationSelectorProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (facilityId) {
      loadLocations();
    }
  }, [facilityId]);

  const loadLocations = async () => {
    if (!facilityId) return;

    try {
      setLoading(true);
      const response = await locationService.getLocationsByFacility(facilityId, {
        isActive: true,
      });
      setLocations(response.data || []);
    } catch (error) {
      console.error("Error loading locations:", error);
    } finally {
      setLoading(false);
    }
  };

  // If there are no locations, return null (optional field)
  if (!loading && locations.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">
        Location {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={loading}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">
          {loading ? "Loading locations..." : "Select a location"}
        </option>
        {locations.map((location) => (
          <option key={location._id} value={location._id}>
            {location.branchName} {location.isMainBranch && "(Main)"} - {location.address.city}
          </option>
        ))}
      </select>
      {locations.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          {locations.length} location{locations.length !== 1 ? "s" : ""} available
        </p>
      )}
    </div>
  );
}

export default LocationSelector;
