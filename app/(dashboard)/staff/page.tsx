"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  facilityStaffService,
  type FacilityStaff,
} from "@/lib/facilityStaffApi";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  CheckCircle,
  XCircle,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import PermissionGuard from "@/components/PermissionGuard";

export default function StaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<FacilityStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [facilityData, setFacilityData] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
      loadStaff(parsed._id);
    }
  }, [router]);

  const loadStaff = async (facilityId: string) => {
    try {
      setLoading(true);
      const response = await facilityStaffService.getAllStaff({ facilityId });
      setStaff(response.data || []);
    } catch (error: any) {
      console.error("Error loading staff:", error);
      const message = error.response?.status === 403
        ? "You don't have permission to view staff"
        : error.response?.data?.message || "Failed to load staff";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (staffId: string) => {
    try {
      await facilityStaffService.deleteStaff(staffId);
      setStaff((prev) => prev.filter((s) => s.id !== staffId));
      toast.success("Staff deleted successfully");
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error("Error deleting staff:", error);
      const message = error.response?.status === 403
        ? "You don't have permission to delete staff"
        : error.response?.data?.message || "Failed to delete staff";
      toast.error(message);
    }
  };

  const handleToggleStatus = async (staffId: string) => {
    try {
      const response = await facilityStaffService.toggleStatus(staffId);
      setStaff((prev) =>
        prev.map((s) => (s.id === staffId ? response.data : s))
      );
      toast.success("Status updated successfully");
    } catch (error: any) {
      console.error("Error toggling status:", error);
      const message = error.response?.status === 403
        ? "You don't have permission to update staff status"
        : error.response?.data?.message || "Failed to update status";
      toast.error(message);
    }
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      Manager: "bg-purple-100 text-purple-800",
      Admin: "bg-blue-100 text-blue-800",
      Supervisor: "bg-green-100 text-green-800",
      Staff: "bg-gray-100 text-gray-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getPermissionCount = (permissions: any) => {
    if (!permissions) return 0;
    let count = 0;
    Object.entries(permissions).forEach(([key, value]) => {
      if (typeof value === "boolean" && value) count++;
      if (typeof value === "object" && value !== null) {
        count += Object.values(value).filter((v) => v === true).length;
      }
    });
    return count;
  };

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
    <PermissionGuard module="staff" action="read">
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Management</h1>
            <p className="text-gray-600">Manage branch managers and staff members</p>
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
              onClick={() => router.push("/staff/create")}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Staff
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or employee ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Staff List */}
          {filteredStaff.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "No staff found" : "No staff members yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first staff member"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => router.push("/staff/create")}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add Staff
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredStaff.map((member) => (
                <div
                  key={member.id}
                  className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all ${!member.isActive ? "opacity-60" : ""
                    }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Main Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          {/* Staff Name & ID */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {member.name}
                              </h3>
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full ${getRoleBadgeColor(
                                  member.role
                                )}`}
                              >
                                {member.role}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {member.employeeId || "No Employee ID"}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {member.isActive ? (
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
                          {/* Email */}
                          <div>
                            <div className="flex items-start gap-2">
                              <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                  Email
                                </p>
                                <p className="text-sm text-gray-900 truncate">{member.email}</p>
                              </div>
                            </div>
                          </div>

                          {/* Phone */}
                          {member.phone && (
                            <div>
                              <div className="flex items-start gap-2">
                                <Phone className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                    Phone
                                  </p>
                                  <p className="text-sm text-gray-900">{member.phone}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Location */}
                          {member.locationId && typeof member.locationId === "object" && (
                            <div>
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                    Branch
                                  </p>
                                  <p className="text-sm text-gray-900 truncate">
                                    {member.locationId.branchName} ({member.locationId.branchCode})
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Staff Type & Permissions */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{member.staffType}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {getPermissionCount(member.permissions)} permissions
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                      <button
                        onClick={() => router.push(`/staff/${member.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(member.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {member.isActive ? "Deactivate" : "Activate"}
                      </button>
                      {deleteConfirm === member.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(member.id)}
                          className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </PermissionGuard>
  );
}
