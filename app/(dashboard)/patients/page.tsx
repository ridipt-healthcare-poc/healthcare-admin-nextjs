"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  User,
  Mail,
  Phone,
  UserRound,
  Calendar,
  CheckCircle,
  XCircle,
  Heart,
  MapPin,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import PermissionGuard from "@/components/PermissionGuard";
import { locationService, type Location } from "@/lib/locationApi";

interface Patient {
  _id: string;
  fullName: string;
  email?: string;  // Made optional for multi-facility
  mobile: string;
  password?: string;
  gender?: string;
  dateOfBirth?: string;
  age?: string;
  bloodGroup?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  preferredContactMethod?: string;
  knownAllergies?: string[];
  medicalConditions?: string[];
  medications?: string[];
  profileStatus?: string;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  profileImage?: string;
  isActive: boolean;
  isVerified: boolean;
  locationIds?: string[];
  // Multi-facility fields
  currentFacility?: {
    facilityId: string;
    facilityType: string;
    mrn: string;
    registeredAt: string;
    status: string;
    notes?: string;
  };
  facilitiesCount?: number;
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [facilityData, setFacilityData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    gender: "Male",
    dateOfBirth: "",
    age: "",
    bloodGroup: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    preferredContactMethod: "Phone",
    knownAllergies: "",
    medicalConditions: "",
    medications: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    locationIds: [] as string[],
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("facility_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Load facility data
    const data = JSON.parse(localStorage.getItem("facility_data") || "{}");
    setFacilityData(data);

    fetchPatients();
  }, []);

  useEffect(() => {
    if (facilityData?._id) {
      fetchLocations();
    }
  }, [facilityData]);

  const fetchLocations = async () => {
    try {
      const response = await locationService.getLocationsByFacility(facilityData._id);
      if (response.success) {
        setLocations(response.data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/patients");
      if (response.data.success) {
        setPatients(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      const message = error.response?.status === 403
        ? "You don't have permission to view patients"
        : error.response?.data?.message || "Failed to fetch patients";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Get facilityId from localStorage - handle both owner and staff cases
      const userType = localStorage.getItem("user_type") || "owner";
      let facilityId;

      if (userType === "staff") {
        const staffData = JSON.parse(localStorage.getItem("staff_data") || "{}");
        facilityId = staffData.facilityId?._id || staffData.facilityId;
      } else {
        facilityId = facilityData?._id;
      }

      if (!facilityId) {
        toast.error("Facility information not found. Please log in again.");
        return;
      }

      // Prepare data
      const patientData: any = {
        facilityId: facilityId,
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        age: formData.age || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        address: (formData.street || formData.city || formData.state || formData.pincode)
          ? {
            street: formData.street || undefined,
            city: formData.city || undefined,
            state: formData.state || undefined,
            pincode: formData.pincode || undefined,
            country: formData.country || "India",
          }
          : undefined,
        preferredContactMethod: formData.preferredContactMethod || undefined,
        knownAllergies: formData.knownAllergies
          ? formData.knownAllergies.split(",").map((a) => a.trim())
          : undefined,
        medicalConditions: formData.medicalConditions
          ? formData.medicalConditions.split(",").map((c) => c.trim())
          : undefined,
        medications: formData.medications
          ? formData.medications.split(",").map((m) => m.trim())
          : undefined,
        emergencyContact: (formData.emergencyContactName || formData.emergencyContactPhone)
          ? {
            name: formData.emergencyContactName || undefined,
            relationship: formData.emergencyContactRelationship || undefined,
            phone: formData.emergencyContactPhone || undefined,
          }
          : undefined,
        locationIds: formData.locationIds.length > 0 ? formData.locationIds : undefined,
      };

      // Add password only if provided (for new patients or password change)
      if (formData.password) {
        patientData.password = formData.password;
      }

      if (editingPatient) {
        // Update existing patient
        const response = await api.put(
          `/api/patients/${editingPatient._id}`,
          patientData
        );
        if (response.data.success) {
          toast.success("Patient updated successfully");
          fetchPatients();
          resetForm();
        }
      } else {
        // Add new patient
        const response = await api.post("/api/patients", patientData);
        if (response.data.success) {
          const message = response.data.isExistingPatient
            ? "Patient already exists and has been added to this facility"
            : "Patient created successfully and registered at this facility";
          toast.success(message);
          fetchPatients();
          resetForm();
        }
      }
    } catch (error: any) {
      console.error("Error saving patient:", error);

      // Handle name mismatch error
      if (error.response?.data?.code === 'NAME_MISMATCH') {
        const existingPatient = error.response.data.existingPatient;

        const confirmed = confirm(
          `⚠️ Mobile Number Already Registered\n\n` +
          `This mobile number (${existingPatient.mobile}) is registered to:\n\n` +
          `Name: ${existingPatient.fullName}\n` +
          `Email: ${existingPatient.email || 'N/A'}\n` +
          `Registered at: ${existingPatient.facilitiesCount} ${existingPatient.facilitiesCount === 1 ? 'facility' : 'facilities'}\n\n` +
          `Did you mean to add "${existingPatient.fullName}" to this facility?\n\n` +
          `Click OK to use the correct name, or Cancel to review.`
        );

        if (confirmed) {
          // Auto-fill with correct name
          setFormData(prev => ({
            ...prev,
            fullName: existingPatient.fullName,
            email: existingPatient.email || prev.email
          }));
          toast.info(`Name updated to "${existingPatient.fullName}". Please submit again.`);
        } else {
          toast.warning('Please verify the patient information before submitting.');
        }
      } else {
        // Handle other errors
        const message = error.response?.status === 403
          ? editingPatient
            ? "You don't have permission to update patients"
            : "You don't have permission to create patients"
          : error.response?.data?.message || "Failed to save patient";
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      fullName: patient.fullName || "",
      email: patient.email || "",
      mobile: patient.mobile || "",
      password: "",
      gender: patient.gender || "Male",
      dateOfBirth: patient.dateOfBirth || "",
      age: patient.age || "",
      bloodGroup: patient.bloodGroup || "",
      street: patient.address?.street || "",
      city: patient.address?.city || "",
      state: patient.address?.state || "",
      pincode: patient.address?.pincode || "",
      country: patient.address?.country || "India",
      preferredContactMethod: patient.preferredContactMethod || "Phone",
      knownAllergies: patient.knownAllergies ? patient.knownAllergies.join(", ") : "",
      medicalConditions: patient.medicalConditions ? patient.medicalConditions.join(", ") : "",
      medications: patient.medications ? patient.medications.join(", ") : "",
      emergencyContactName: patient.emergencyContact?.name || "",
      emergencyContactRelationship: patient.emergencyContact?.relationship || "",
      emergencyContactPhone: patient.emergencyContact?.phone || "",
      locationIds: patient.locationIds || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return;

    try {
      const response = await api.delete(`/api/patients/${id}`);
      if (response.data.success) {
        toast.success("Patient deleted successfully");
        fetchPatients();
      }
    } catch (error: any) {
      console.error("Error deleting patient:", error);
      const message = error.response?.status === 403
        ? "You don't have permission to delete patients"
        : error.response?.data?.message || "Failed to delete patient";
      toast.error(message);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await api.patch(`/api/patients/${id}/toggle-status`);
      if (response.data.success) {
        toast.success("Patient status updated successfully");
        fetchPatients();
      }
    } catch (error: any) {
      console.error("Error toggling status:", error);
      const message = error.response?.status === 403
        ? "You don't have permission to update patient status"
        : error.response?.data?.message || "Failed to update status";
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      mobile: "",
      password: "",
      gender: "Male",
      dateOfBirth: "",
      age: "",
      bloodGroup: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      preferredContactMethod: "Phone",
      knownAllergies: "",
      medicalConditions: "",
      medications: "",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
      locationIds: [],
    });
    setEditingPatient(null);
    setShowForm(false);
  };

  const filteredPatients = patients.filter((patient) =>
    patient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.mobile.includes(searchQuery)
  );

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];


  return (
    <PermissionGuard module="patients" action="read">
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patients</h1>
          <p className="text-gray-600">Manage your facility patients</p>
        </div>

        {/* Action Bar */}
        {!showForm && (
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
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Patient
            </button>
          </div>
        )}

        {showForm ? (
          <Card className="border-gray-200/50 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {editingPatient ? "Edit Patient" : "Add New Patient"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gradient-to-br from-blue-50/30 to-indigo-50/20 rounded-xl p-6 border border-blue-100/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <User className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Enter full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="patient@example.com (optional)"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobile" className="text-gray-700 font-medium">Mobile Number *</Label>
                      <Input
                        id="mobile"
                        name="mobile"
                        placeholder="1234567890"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required
                        disabled={!!editingPatient}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      {editingPatient && (
                        <p className="text-xs text-gray-500 mt-1">Mobile number cannot be changed</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="gender" className="text-gray-700 font-medium">Gender</Label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="mt-1.5 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth" className="text-gray-700 font-medium">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        placeholder="DD-MM-YYYY"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="age" className="text-gray-700 font-medium">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        placeholder="25"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bloodGroup" className="text-gray-700 font-medium">Blood Group</Label>
                      <select
                        id="bloodGroup"
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        className="mt-1.5 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="">Select Blood Group</option>
                        {bloodGroups.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-gray-700 font-medium">Password {!editingPatient && "*"}</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder={editingPatient ? "Leave blank to keep current" : "Enter password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!editingPatient}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-gradient-to-br from-green-50/30 to-emerald-50/20 rounded-xl p-6 border border-green-100/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="street" className="text-gray-700 font-medium">Street</Label>
                      <Input
                        id="street"
                        name="street"
                        placeholder="Enter street address"
                        value={formData.street}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-gray-700 font-medium">City</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-gray-700 font-medium">State</Label>
                      <Input
                        id="state"
                        name="state"
                        placeholder="Enter state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode" className="text-gray-700 font-medium">Pincode</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        placeholder="123456"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-gray-700 font-medium">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        placeholder="India"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Assignment */}
                <div className="bg-gradient-to-br from-blue-50/30 to-indigo-50/20 rounded-xl p-6 border border-blue-100/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Location Assignment
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="text-gray-700 font-medium">Assigned Locations</Label>
                      <p className="text-sm text-gray-500 mb-2">Select the hospital branches where this patient can receive care</p>
                      <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto bg-white">
                        {locations.length > 0 ? (
                          locations.map((location) => (
                            <label key={location._id} className="flex items-center gap-2 py-1">
                              <input
                                type="checkbox"
                                checked={formData.locationIds.includes(location._id)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setFormData(prev => ({
                                    ...prev,
                                    locationIds: checked
                                      ? [...prev.locationIds, location._id]
                                      : prev.locationIds.filter(id => id !== location._id)
                                  }));
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">
                                {location.branchName} ({location.branchCode})
                              </span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No locations available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-gradient-to-br from-red-50/30 to-orange-50/20 rounded-xl p-6 border border-red-100/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <Heart className="h-5 w-5 text-red-600" />
                    Medical Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="knownAllergies" className="text-gray-700 font-medium">
                        Known Allergies (comma-separated)
                      </Label>
                      <Input
                        id="knownAllergies"
                        name="knownAllergies"
                        placeholder="Peanuts, Penicillin, Dust"
                        value={formData.knownAllergies}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="medicalConditions" className="text-gray-700 font-medium">
                        Medical Conditions (comma-separated)
                      </Label>
                      <Input
                        id="medicalConditions"
                        name="medicalConditions"
                        placeholder="Diabetes, Hypertension"
                        value={formData.medicalConditions}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="medications" className="text-gray-700 font-medium">
                        Current Medications (comma-separated)
                      </Label>
                      <Input
                        id="medications"
                        name="medications"
                        placeholder="Aspirin, Metformin"
                        value={formData.medications}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-gradient-to-br from-purple-50/30 to-pink-50/20 rounded-xl p-6 border border-purple-100/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <Phone className="h-5 w-5 text-purple-600" />
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName" className="text-gray-700 font-medium">Name</Label>
                      <Input
                        id="emergencyContactName"
                        name="emergencyContactName"
                        placeholder="Contact name"
                        value={formData.emergencyContactName}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactRelationship" className="text-gray-700 font-medium">Relationship</Label>
                      <Input
                        id="emergencyContactRelationship"
                        name="emergencyContactRelationship"
                        placeholder="Father, Mother, Spouse"
                        value={formData.emergencyContactRelationship}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactPhone" className="text-gray-700 font-medium">Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        name="emergencyContactPhone"
                        placeholder="1234567890"
                        value={formData.emergencyContactPhone}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-gradient-to-br from-indigo-50/30 to-blue-50/20 rounded-xl p-6 border border-indigo-100/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <Mail className="h-5 w-5 text-indigo-600" />
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="preferredContactMethod" className="text-gray-700 font-medium">
                        Preferred Contact Method
                      </Label>
                      <select
                        id="preferredContactMethod"
                        name="preferredContactMethod"
                        value={formData.preferredContactMethod}
                        onChange={handleInputChange}
                        className="mt-1.5 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      >
                        <option value="Phone">Phone</option>
                        <option value="Email">Email</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="SMS">SMS</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="rounded-xl hover:bg-gray-50 font-semibold px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 rounded-xl font-semibold px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      editingPatient ? "Update Patient" : "Add Patient"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Search Bar and Stats */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search patients by name, email, or mobile..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 rounded-xl border-gray-200/50 bg-white/80 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {filteredPatients.length} {filteredPatients.length === 1 ? 'Patient' : 'Patients'}
                  </span>
                </div>
              </div>
            </div>

            {/* Patients List */}
            {filteredPatients.length === 0 ? (
              <div className="border border-gray-100 rounded-xl shadow-sm bg-white">
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserRound className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchQuery ? "No Results Found" : "No Patients Yet"}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {searchQuery
                      ? "Try adjusting your search terms or filters"
                      : "Start managing your patients by adding your first patient"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    className="border border-gray-100 rounded-xl shadow-sm bg-white p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-xl bg-purple-600 flex items-center justify-center">
                            <User className="h-7 w-7 text-white" />
                          </div>
                          {patient.isActive && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">
                            {patient.fullName}
                          </h3>
                          <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                            {patient.gender && <span>{patient.gender}</span>}
                            {patient.age && <span>• {patient.age} yrs</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {patient.isActive ? (
                          <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-lg">
                            Active
                          </div>
                        ) : (
                          <div className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg">
                            Inactive
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2.5 mb-4">
                      {patient.currentFacility?.mrn && (
                        <div className="flex items-center gap-3 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg p-2 border border-purple-200/50">
                          <UserRound className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span>MRN: {patient.currentFacility.mrn}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                        <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{patient.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                        <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span>{patient.mobile}</span>
                      </div>
                      {patient.bloodGroup && (
                        <div className="flex items-center gap-3 text-sm font-semibold text-gray-900 bg-red-50 rounded-lg p-2 border border-red-200/50">
                          <Heart className="h-4 w-4 text-red-600 flex-shrink-0" />
                          <span>{patient.bloodGroup}</span>
                        </div>
                      )}
                      {patient.address?.city && (
                        <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">
                            {patient.address.city}{patient.address.state && `, ${patient.address.state}`}
                          </span>
                        </div>
                      )}
                      {patient.locationIds && patient.locationIds.length > 0 && (
                        <div className="flex items-center gap-3 text-sm text-gray-700 bg-blue-50 rounded-lg p-2 border border-blue-200/50">
                          <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="truncate">
                            {patient.locationIds.length} location{patient.locationIds.length > 1 ? 's' : ''} assigned
                          </span>
                        </div>
                      )}
                      {patient.facilitiesCount && patient.facilitiesCount > 1 && (
                        <div className="flex items-center gap-3 text-sm text-blue-700 bg-blue-50 rounded-lg p-2 border border-blue-200/50">
                          <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Registered at {patient.facilitiesCount} facilities</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(patient)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(patient._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {patient.isActive ? (
                          <>
                            <XCircle className="h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Activate
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(patient._id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </PermissionGuard>
  );
}
