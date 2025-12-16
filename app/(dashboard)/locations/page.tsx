"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { locationService, type Location, type CreateLocationData } from "@/lib/locationApi";
import { Plus, MapPin, Phone, Mail, Building2, Edit, Trash2, Star, Search, ChevronLeft, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import PermissionGuard from "@/components/PermissionGuard";

export default function LocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [facilityData, setFacilityData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("facility_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Get facility data from localStorage
    const data = localStorage.getItem("facility_data");
    if (data) {
      const parsed = JSON.parse(data);
      setFacilityData(parsed);
      loadLocations(parsed._id);
    }
  }, [router]);

  const loadLocations = async (facilityId: string) => {
    try {
      setLoading(true);
      const response = await locationService.getLocationsByFacility(facilityId);
      setLocations(response.data || []);
    } catch (error: any) {
      console.error("Error loading locations:", error);
      const message = error.response?.status === 403
        ? "You don't have permission to view locations"
        : error.response?.data?.message || "Failed to load locations";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (locationId: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      await locationService.deleteLocation(locationId);
      toast.success("Location deleted successfully");
      if (facilityData) {
        loadLocations(facilityData._id);
      }
    } catch (error: any) {
      const message = error.response?.status === 403
        ? "You don't have permission to delete locations"
        : error.response?.data?.message || "Failed to delete location";
      toast.error(message);
    }
  };

  const handleToggleStatus = async (locationId: string) => {
    try {
      const response = await locationService.toggleLocationStatus(locationId);
      toast.success(response.message);
      if (facilityData) {
        loadLocations(facilityData._id);
      }
    } catch (error: any) {
      const message = error.response?.status === 403
        ? "You don't have permission to update location status"
        : error.response?.data?.message || "Failed to update location status";
      toast.error(message);
    }
  };

  const handleSetMainBranch = async (locationId: string) => {
    try {
      const response = await locationService.setMainBranch(locationId);
      toast.success(response.message);
      if (facilityData) {
        loadLocations(facilityData._id);
      }
    } catch (error) {
      toast.error("Failed to set main branch");
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  const handleAddClick = () => {
    setEditingLocation(null);
    setShowForm(true);
  };

  const filteredLocations = locations.filter((location) =>
    location.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.branchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <PermissionGuard module="locations" action="read">
      {showForm ? (
        <main className="flex-1 overflow-auto bg-gray-50">
          <LocationForm
            facilityId={facilityData?._id}
            facilityType={facilityData?.facilityType}
            location={editingLocation || undefined}
            onClose={() => {
              setShowForm(false);
              setEditingLocation(null);
              if (facilityData) loadLocations(facilityData._id);
            }}
          />
        </main>
      ) : (
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Locations</h1>
              <p className="text-gray-600">Manage your facility branches and locations</p>
            </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Location
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by branch name, code, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Locations List */}
        {filteredLocations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? "No locations found" : "No locations yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Get started by adding your first location"}
            </p>
            {!searchQuery && (
              <button
                onClick={handleAddClick}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Location
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredLocations.map((location) => (
              <div
                key={location._id}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all ${
                  !location.isActive ? "opacity-60" : ""
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        {/* Branch Name & Status */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {location.branchName}
                            </h3>
                            {location.isMainBranch && (
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{location.branchCode}</p>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {location.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                              <XCircle className="w-3.5 h-3.5" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Address */}
                        <div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                ADDRESS
                              </p>
                              <p className="text-sm text-gray-900">
                                {location.address.street}, {location.address.city}
                                <br />
                                {location.address.state} - {location.address.pincode}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Contact */}
                        <div>
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                CONTACT
                              </p>
                              <p className="text-sm text-gray-900">{location.phone}</p>
                              {location.email && (
                                <p className="text-sm text-gray-600 truncate">{location.email}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Staff Count */}
                        <div>
                          <div className="flex items-start gap-2">
                            <Building2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                STAFF
                              </p>
                              <p className="text-sm text-gray-900">
                                {location.totalDoctors} Doctors
                                {location.totalSupportStaff > 0 &&
                                  `, ${location.totalSupportStaff} Staff`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEdit(location)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {!location.isMainBranch && (
                        <button
                          onClick={() => handleDelete(location._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleToggleStatus(location._id)}
                      className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {location.isActive ? "Deactivate" : "Activate"}
                    </button>
                    {!location.isMainBranch && (
                      <button
                        onClick={() => handleSetMainBranch(location._id)}
                        className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Set as Main
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </div>
        </main>
      )}
    </PermissionGuard>
  );
}

function LocationForm({
  facilityId,
  facilityType,
  location,
  onClose,
}: {
  facilityId: string;
  facilityType: "Hospital" | "Clinic";
  location?: Location;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<CreateLocationData>({
    facilityId,
    facilityType,
    branchName: location?.branchName || "",
    branchCode: location?.branchCode || "",
    phone: location?.phone || "",
    email: location?.email || "",
    address: location?.address || {
      street: "",
      landmark: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
    },
    isMainBranch: location?.isMainBranch || false,
    numberOfBeds: location?.numberOfBeds,
    departments: location?.departments || [],
    facilities: location?.facilities || [],
    description: location?.description || "",
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Ensure operating hours are included
      const dataToSubmit = {
        ...formData,
        operatingHours: formData.operatingHours || {
          Monday: { open: "09:00", close: "17:00", is24x7: false },
          Tuesday: { open: "09:00", close: "17:00", is24x7: false },
          Wednesday: { open: "09:00", close: "17:00", is24x7: false },
          Thursday: { open: "09:00", close: "17:00", is24x7: false },
          Friday: { open: "09:00", close: "17:00", is24x7: false },
          Saturday: { open: "09:00", close: "14:00", is24x7: false },
          Sunday: { open: "Closed", close: "Closed", is24x7: false },
        },
      };

      if (location) {
        await locationService.updateLocation(location._id, dataToSubmit);
        toast.success("Location updated successfully");
      } else {
        await locationService.createLocation(dataToSubmit);
        toast.success("Location created successfully");
      }
      onClose();
    } catch (error: any) {
      console.error("Location save error:", error.response?.data);
      const message = error.response?.status === 403
        ? location
          ? "You don't have permission to update locations"
          : "You don't have permission to create locations"
        : error.response?.data?.message || "Failed to save location";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {location ? "Edit Location" : "Create New Location"}
        </h1>
        <p className="text-gray-600">
          {location ? "Update location information" : "Add a new branch location"}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <Building2 className="h-5 w-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="branchName" className="text-gray-700 font-medium">
                    Branch Name *
                  </Label>
                  <Input
                    id="branchName"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    required
                    className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="branchCode" className="text-gray-700 font-medium">
                    Branch Code *
                  </Label>
                  <Input
                    id="branchCode"
                    value={formData.branchCode}
                    onChange={(e) =>
                      setFormData({ ...formData, branchCode: e.target.value.toUpperCase() })
                    }
                    required
                    disabled={!!location}
                    className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    placeholder="e.g., BRN001"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-700 font-medium">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    placeholder="10-15 digit number"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <MapPin className="h-5 w-5 text-green-600" />
                Address Details
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="street" className="text-gray-700 font-medium">
                    Street Address *
                  </Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value },
                      })
                    }
                    required
                    className="mt-1.5 border-gray-300 focus:border-green-500 focus:ring-green-500 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="landmark" className="text-gray-700 font-medium">
                    Landmark
                  </Label>
                  <Input
                    id="landmark"
                    value={formData.address.landmark}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, landmark: e.target.value },
                      })
                    }
                    className="mt-1.5 border-gray-300 focus:border-green-500 focus:ring-green-500 bg-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-gray-700 font-medium">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value },
                        })
                      }
                      required
                      className="mt-1.5 border-gray-300 focus:border-green-500 focus:ring-green-500 bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-gray-700 font-medium">
                      State *
                    </Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value },
                        })
                      }
                      required
                      className="mt-1.5 border-gray-300 focus:border-green-500 focus:ring-green-500 bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode" className="text-gray-700 font-medium">
                      Pincode *
                    </Label>
                    <Input
                      id="pincode"
                      value={formData.address.pincode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, pincode: e.target.value },
                        })
                      }
                      required
                      className="mt-1.5 border-gray-300 focus:border-green-500 focus:ring-green-500 bg-white"
                      placeholder="6 digits"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <Building2 className="h-5 w-5 text-purple-600" />
                Additional Details
              </h3>
              <div className="space-y-4">
                {facilityType === "Hospital" && (
                  <div>
                    <Label htmlFor="numberOfBeds" className="text-gray-700 font-medium">
                      Number of Beds
                    </Label>
                    <Input
                      id="numberOfBeds"
                      type="number"
                      value={formData.numberOfBeds || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, numberOfBeds: parseInt(e.target.value) })
                      }
                      className="mt-1.5 border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="description" className="text-gray-700 font-medium">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1.5 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                    placeholder="Brief description of this location"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isMainBranch"
                    checked={formData.isMainBranch}
                    onChange={(e) => setFormData({ ...formData, isMainBranch: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <Label htmlFor="isMainBranch" className="text-gray-700 font-medium cursor-pointer">
                    Set as Main Branch
                  </Label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : location ? "Update Location" : "Create Location"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
