"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PermissionGuard from "@/components/PermissionGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  facilityStaffService,
  type FacilityStaff,
  type FacilityStaffPermissions,
} from "@/lib/facilityStaffApi";
import { locationService, type Location } from "@/lib/locationApi";
import { Loader2, ArrowLeft, User, Shield, MapPin, FileText } from "lucide-react";
import { toast } from "sonner";

const PERMISSION_GROUPS = [
  {
    group: "Dashboard",
    permissions: [{ key: "manageDashboard", label: "Access Dashboard" }],
  },
  {
    group: "Doctors",
    permissions: [
      { key: "manageDoctors", label: "Manage Doctors" },
      { key: "doctorActions.create", label: "Create Doctor" },
      { key: "doctorActions.read", label: "View Doctors" },
      { key: "doctorActions.update", label: "Update Doctor" },
      { key: "doctorActions.delete", label: "Delete Doctor" },
    ],
  },
  {
    group: "Patients",
    permissions: [
      { key: "managePatients", label: "Manage Patients" },
      { key: "patientActions.create", label: "Create Patient" },
      { key: "patientActions.read", label: "View Patients" },
      { key: "patientActions.update", label: "Update Patient" },
      { key: "patientActions.delete", label: "Delete Patient" },
    ],
  },
  {
    group: "Appointments",
    permissions: [
      { key: "manageAppointments", label: "Manage Appointments" },
      { key: "appointmentActions.create", label: "Create Appointment" },
      { key: "appointmentActions.read", label: "View Appointments" },
      { key: "appointmentActions.update", label: "Update Appointment" },
      { key: "appointmentActions.delete", label: "Delete Appointment" },
    ],
  },
  {
    group: "Locations",
    permissions: [
      { key: "manageLocations", label: "Manage Locations" },
      { key: "locationActions.create", label: "Create Location" },
      { key: "locationActions.read", label: "View Locations" },
      { key: "locationActions.update", label: "Update Location" },
      { key: "locationActions.delete", label: "Delete Location" },
    ],
  },
  {
    group: "Staff",
    permissions: [
      { key: "manageStaff", label: "Manage Staff" },
      { key: "staffActions.create", label: "Create Staff" },
      { key: "staffActions.read", label: "View Staff" },
      { key: "staffActions.update", label: "Update Staff" },
      { key: "staffActions.delete", label: "Delete Staff" },
    ],
  },
  {
    group: "Reports",
    permissions: [{ key: "manageReports", label: "Access Reports" }],
  },
];

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [staff, setStaff] = useState<FacilityStaff | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    locationId: "",
    role: "Staff",
    staffType: "GeneralStaff",
    employeeId: "",
    notes: "",
    isActive: true,
  });

  const [permissions, setPermissions] = useState<FacilityStaffPermissions>({});

  useEffect(() => {
    const token = localStorage.getItem("facility_token");
    if (!token) {
      router.push("/login");
      return;
    }

    loadStaff();
  }, [staffId]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await facilityStaffService.getStaffById(staffId);
      const staffData = response.data;
      setStaff(staffData);

      setForm({
        name: staffData.name,
        email: staffData.email,
        phone: staffData.phone || "",
        locationId:
          typeof staffData.locationId === "object"
            ? staffData.locationId._id
            : staffData.locationId || "",
        role: staffData.role,
        staffType: staffData.staffType,
        employeeId: staffData.employeeId || "",
        notes: staffData.notes || "",
        isActive: staffData.isActive,
      });

      setPermissions(staffData.permissions || {});

      // Load locations
      const facilityId = typeof staffData.facilityId === "object" 
        ? staffData.facilityId._id 
        : staffData.facilityId;
      const locResponse = await locationService.getLocationsByFacility(facilityId);
      setLocations(locResponse.data || []);
    } catch (error: any) {
      console.error("Error loading staff:", error);
      const message = error.response?.status === 403
        ? "You don't have permission to view staff details"
        : error.response?.data?.message || "Failed to load staff";
      toast.error(message);
      router.push("/staff");
    } finally {
      setLoading(false);
    }
  };

  const handlePermChange = (permKey: string, checked: boolean) => {
    if (permKey.includes(".")) {
      const [module, action] = permKey.split(".");
      setPermissions((curr) => ({
        ...curr,
        [module]: {
          ...(curr[module as keyof FacilityStaffPermissions] as any),
          [action]: checked,
        },
      }));
    } else {
      setPermissions((curr) => ({
        ...curr,
        [permKey]: checked,
      }));
    }
  };

  const getPermissionValue = (permKey: string): boolean => {
    if (permKey.includes(".")) {
      const [module, action] = permKey.split(".");
      const modulePerms = permissions[module as keyof FacilityStaffPermissions];
      return (modulePerms as any)?.[action] === true;
    }
    return permissions[permKey as keyof FacilityStaffPermissions] === true;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await facilityStaffService.updateStaff(staffId, {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        locationId: form.locationId || undefined,
        role: form.role,
        staffType: form.staffType,
        employeeId: form.employeeId || undefined,
        notes: form.notes || undefined,
        permissions,
      });
      toast.success("Staff updated successfully");
      router.push("/staff");
    } catch (error: any) {
      console.error("Error updating staff:", error);
      const message = error.response?.status === 403
        ? "You don't have permission to update staff"
        : error.response?.data?.message || "Failed to update staff";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <PermissionGuard module="staff" action="update">
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <button
            onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Staff
        </button>

        <Card className="shadow-xl border-gray-200/50 backdrop-blur-sm bg-white/90">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl">Edit Facility Staff</CardTitle>
            </div>
          </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gradient-to-br from-blue-50/30 to-indigo-50/20 rounded-xl p-6 border border-blue-100/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                <User className="h-5 w-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                    className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    required
                    className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-700 font-medium">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="employeeId" className="text-gray-700 font-medium">Employee ID</Label>
                  <Input
                    id="employeeId"
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleInputChange}
                    placeholder="Employee ID"
                    disabled
                    className="mt-1.5 border-gray-300 bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Role & Assignment */}
            <div className="bg-gradient-to-br from-purple-50/30 to-pink-50/20 rounded-xl p-6 border border-purple-100/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                <Shield className="h-5 w-5 text-purple-600" />
                Role & Assignment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="role" className="text-gray-700 font-medium">Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(value) =>
                      setForm((f) => ({ ...f, role: value }))
                    }
                  >
                    <SelectTrigger className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Supervisor">Supervisor</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="staffType" className="text-gray-700 font-medium">Staff Type</Label>
                  <Select
                    value={form.staffType}
                    onValueChange={(value) =>
                      setForm((f) => ({ ...f, staffType: value }))
                    }
                  >
                    <SelectTrigger className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="BranchManager">
                        Branch Manager
                      </SelectItem>
                      <SelectItem value="FacilityAdmin">
                        Facility Admin
                      </SelectItem>
                      <SelectItem value="LocationSupervisor">
                        Location Supervisor
                      </SelectItem>
                      <SelectItem value="GeneralStaff">
                        General Staff
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="locationId" className="text-gray-700 font-medium">Branch Location (Optional)</Label>
                  <Select
                    value={form.locationId}
                    onValueChange={(value) =>
                      setForm((f) => ({ ...f, locationId: value }))
                    }
                  >
                    <SelectTrigger className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="All Locations (No specific branch)" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {locations
                        .filter((loc) => loc.isActive)
                        .map((loc) => (
                          <SelectItem key={loc._id} value={loc._id}>
                            {loc.branchName} ({loc.branchCode})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gradient-to-br from-green-50/30 to-emerald-50/20 rounded-xl p-6 border border-green-100/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                <FileText className="h-5 w-5 text-green-600" />
                Additional Notes
              </h3>
              <Label htmlFor="notes" className="text-gray-700 font-medium">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleInputChange}
                placeholder="Add any additional notes..."
                className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* Permissions */}
            <div className="bg-gradient-to-br from-orange-50/30 to-amber-50/20 rounded-xl p-6 border border-orange-100/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                <Shield className="h-5 w-5 text-orange-600" />
                Permissions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.group} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="font-semibold mb-3">{group.group}</div>
                    <div className="flex flex-col gap-2">
                      {group.permissions.map((perm) => (
                        <label
                          key={perm.key}
                          className="inline-flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            checked={getPermissionValue(perm.key)}
                            onCheckedChange={(value) =>
                              handlePermChange(perm.key, !!value)
                            }
                          />
                          <span className="text-sm">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="px-6"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 font-medium">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </main>
    </PermissionGuard>
  );
}
