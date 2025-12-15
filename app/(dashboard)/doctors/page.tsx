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
  Stethoscope,
  Award,
  Clock,
  IndianRupee,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { LocationSelector } from "@/components/LocationSelector";


interface Doctor {
  _id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  mobile?: string;
  gender?: string;
  locationId?: {
    _id: string;
    branchName: string;
    branchCode: string;
  };
  dateOfBirth?: string;
  age?: string;
  specialization?: string;
  qualification?: string;
  experience?: number;
  yearsOfExperience?: number;
  licenseNumber?: string;
  medicalLicenseNumber?: string;
  medicalSpecialty?: string[];
  consultationFee?: number;
  department?: string;
  languagesSpoken?: string[];
  qualifications?: string[];
  registrationDetails?: {
    councilName?: string;
    registrationYear?: number;
    registrationState?: string;
  };
  affiliations?: string[];
  profilePhoto?: string;
  photoID?: string;
  degreeCertificates?: string[];
  licenseCertificate?: string;
  professionalPhoto?: string;
  digitalSignature?: string;
  profileImage?: string;
  profileStatus?: string;
  preferredCommunicationMethod?: string;
  servicesProvided?: string[];
  proceduresPerformed?: string[];
  consultationFees?: {
    onsite?: number;
    voiceCall?: number;
    videoCall?: number;
    homeVisit?: number;
    general?: number;
    online?: number;
    followUpFee?: number;
    otherCategories?: Array<{
      category: string;
      fee: number;
    }>;
  };
  availabilitySchedule?: Array<{
    dayOfWeek: string;
    timeSlots: Array<{
      start: Date;
      end: Date;
    }>;
  }>;
  durationMinutes?: number;
  bio?: string;
  operatingHours?: {
    Monday: { open: string; close: string; slotDuration?: string };
    Tuesday: { open: string; close: string; slotDuration?: string };
    Wednesday: { open: string; close: string; slotDuration?: string };
    Thursday: { open: string; close: string; slotDuration?: string };
    Friday: { open: string; close: string; slotDuration?: string };
    Saturday: { open: string; close: string; slotDuration?: string };
    Sunday: { open: string; close: string; slotDuration?: string };
  };
  isActive: boolean;
  isVerified: boolean;
}

export default function DoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [facilityData, setFacilityData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [facilityId, setFacilityId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    mobile: "",
    gender: "Male",
    locationId: "",
    dateOfBirth: "",
    specialization: "General Physician",
    qualification: "",
    experience: "",
    licenseNumber: "",
    medicalLicenseNumber: "",
    medicalSpecialty: "",
    onsiteFee: "",
    voiceCallFee: "",
    videoCallFee: "",
    homeVisitFee: "",
    department: "",
    languagesSpoken: "",
    qualifications: "",
    registrationCouncilName: "",
    registrationYear: "",
    registrationState: "",
    affiliations: "",
    profilePhoto: "",
    yearsOfExperience: "",
    preferredCommunicationMethod: "Phone",
    servicesProvided: "",
    proceduresPerformed: "",
    bio: "",
    operatingHours: {
      Monday: { open: "09:00", close: "17:00", slotDuration: "30" },
      Tuesday: { open: "09:00", close: "17:00", slotDuration: "30" },
      Wednesday: { open: "09:00", close: "17:00", slotDuration: "30" },
      Thursday: { open: "09:00", close: "17:00", slotDuration: "30" },
      Friday: { open: "09:00", close: "17:00", slotDuration: "30" },
      Saturday: { open: "09:00", close: "14:00", slotDuration: "30" },
      Sunday: { open: "Off", close: "Off", slotDuration: "30" },
    },
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
    if (data._id) {
      setFacilityId(data._id);
    }

    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/doctors");
      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      // Prepare data
      const doctorData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        locationId: formData.locationId || undefined,
        mobile: formData.mobile || undefined,
        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        specialization: formData.specialization || undefined,
        qualification: formData.qualification || undefined,
        experience: formData.experience ? parseInt(formData.experience) : undefined,
        licenseNumber: formData.licenseNumber || undefined,
        medicalLicenseNumber: formData.medicalLicenseNumber || undefined,
        medicalSpecialty: formData.medicalSpecialty
          ? formData.medicalSpecialty.split(",").map((s) => s.trim())
          : undefined,
        consultationFees: (formData.onsiteFee || formData.voiceCallFee || formData.videoCallFee || formData.homeVisitFee)
          ? {
              onsite: formData.onsiteFee ? parseFloat(formData.onsiteFee) : undefined,
              voiceCall: formData.voiceCallFee ? parseFloat(formData.voiceCallFee) : undefined,
              videoCall: formData.videoCallFee ? parseFloat(formData.videoCallFee) : undefined,
              homeVisit: formData.homeVisitFee ? parseFloat(formData.homeVisitFee) : undefined,
            }
          : undefined,
        department: formData.department || undefined,
        languagesSpoken: formData.languagesSpoken
          ? formData.languagesSpoken.split(",").map((lang) => lang.trim())
          : undefined,
        qualifications: formData.qualifications
          ? formData.qualifications.split(",").map((q) => q.trim())
          : undefined,
        registrationDetails: (formData.registrationCouncilName || formData.registrationYear || formData.registrationState)
          ? {
              councilName: formData.registrationCouncilName || undefined,
              registrationYear: formData.registrationYear ? parseInt(formData.registrationYear) : undefined,
              registrationState: formData.registrationState || undefined,
            }
          : undefined,
        affiliations: formData.affiliations
          ? formData.affiliations.split(",").map((a) => a.trim())
          : undefined,
        profilePhoto: formData.profilePhoto || undefined,
        yearsOfExperience: formData.yearsOfExperience
          ? parseInt(formData.yearsOfExperience)
          : undefined,
        preferredCommunicationMethod: formData.preferredCommunicationMethod || undefined,
        servicesProvided: formData.servicesProvided
          ? formData.servicesProvided.split(",").map((s) => s.trim())
          : undefined,
        proceduresPerformed: formData.proceduresPerformed
          ? formData.proceduresPerformed.split(",").map((p) => p.trim())
          : undefined,
        bio: formData.bio || undefined,
        operatingHours: formData.operatingHours || undefined,
      };
      
      // Add password only if provided (for new doctors or password change)
      if (formData.password) {
        doctorData.password = formData.password;
      }

      if (editingDoctor) {
        // Update existing doctor
        const response = await api.put(
          `/api/doctors/${editingDoctor._id}`,
          doctorData
        );
        if (response.data.success) {
          toast.success("Doctor updated successfully");
          fetchDoctors();
          resetForm();
        }
      } else {
        // Add new doctor
        const response = await api.post("/api/doctors", doctorData);
        if (response.data.success) {
          toast.success("Doctor added successfully");
          fetchDoctors();
          resetForm();
        }
      }
    } catch (error: any) {
      console.error("Error saving doctor:", error);
      const message =
        error.response?.data?.message || "Failed to save doctor";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || "",
      email: doctor.email || "",
      password: "",
      phone: doctor.phone || "",
      mobile: doctor.mobile || "",
      gender: doctor.gender || "Male",
      locationId: doctor.locationId?._id || "",
      dateOfBirth: doctor.dateOfBirth || "",
      specialization: doctor.specialization || "General Physician",
      qualification: doctor.qualification || "",
      experience: doctor.experience ? String(doctor.experience) : "",
      licenseNumber: doctor.licenseNumber || "",
      medicalLicenseNumber: doctor.medicalLicenseNumber || "",
      medicalSpecialty: doctor.medicalSpecialty ? doctor.medicalSpecialty.join(", ") : "",
      onsiteFee: doctor.consultationFees?.onsite ? String(doctor.consultationFees.onsite) : "",
      voiceCallFee: doctor.consultationFees?.voiceCall ? String(doctor.consultationFees.voiceCall) : "",
      videoCallFee: doctor.consultationFees?.videoCall ? String(doctor.consultationFees.videoCall) : "",
      homeVisitFee: doctor.consultationFees?.homeVisit ? String(doctor.consultationFees.homeVisit) : "",
      department: doctor.department || "",
      languagesSpoken: doctor.languagesSpoken ? doctor.languagesSpoken.join(", ") : "",
      qualifications: doctor.qualifications ? doctor.qualifications.join(", ") : "",
      registrationCouncilName: doctor.registrationDetails?.councilName || "",
      registrationYear: doctor.registrationDetails?.registrationYear ? String(doctor.registrationDetails.registrationYear) : "",
      registrationState: doctor.registrationDetails?.registrationState || "",
      affiliations: doctor.affiliations ? doctor.affiliations.join(", ") : "",
      profilePhoto: doctor.profilePhoto || "",
      yearsOfExperience: doctor.yearsOfExperience ? String(doctor.yearsOfExperience) : "",
      preferredCommunicationMethod: doctor.preferredCommunicationMethod || "Phone",
      servicesProvided: doctor.servicesProvided ? doctor.servicesProvided.join(", ") : "",
      proceduresPerformed: doctor.proceduresPerformed ? doctor.proceduresPerformed.join(", ") : "",
      bio: doctor.bio || "",
      operatingHours: {
        Monday: { 
          open: doctor.operatingHours?.Monday?.open || "09:00", 
          close: doctor.operatingHours?.Monday?.close || "17:00", 
          slotDuration: (doctor.operatingHours?.Monday as any)?.slotDuration || "30" 
        },
        Tuesday: { 
          open: doctor.operatingHours?.Tuesday?.open || "09:00", 
          close: doctor.operatingHours?.Tuesday?.close || "17:00", 
          slotDuration: (doctor.operatingHours?.Tuesday as any)?.slotDuration || "30" 
        },
        Wednesday: { 
          open: doctor.operatingHours?.Wednesday?.open || "09:00", 
          close: doctor.operatingHours?.Wednesday?.close || "17:00", 
          slotDuration: (doctor.operatingHours?.Wednesday as any)?.slotDuration || "30" 
        },
        Thursday: { 
          open: doctor.operatingHours?.Thursday?.open || "09:00", 
          close: doctor.operatingHours?.Thursday?.close || "17:00", 
          slotDuration: (doctor.operatingHours?.Thursday as any)?.slotDuration || "30" 
        },
        Friday: { 
          open: doctor.operatingHours?.Friday?.open || "09:00", 
          close: doctor.operatingHours?.Friday?.close || "17:00", 
          slotDuration: (doctor.operatingHours?.Friday as any)?.slotDuration || "30" 
        },
        Saturday: { 
          open: doctor.operatingHours?.Saturday?.open || "09:00", 
          close: doctor.operatingHours?.Saturday?.close || "14:00", 
          slotDuration: (doctor.operatingHours?.Saturday as any)?.slotDuration || "30" 
        },
        Sunday: { 
          open: doctor.operatingHours?.Sunday?.open || "Off", 
          close: doctor.operatingHours?.Sunday?.close || "Off", 
          slotDuration: (doctor.operatingHours?.Sunday as any)?.slotDuration || "30" 
        },
      },
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const response = await api.delete(`/api/doctors/${id}`);
      if (response.data.success) {
        toast.success("Doctor deleted successfully");
        fetchDoctors();
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
      toast.error("Failed to delete doctor");
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const response = await api.patch(`/api/doctors/${id}/toggle-status`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchDoctors();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update doctor status");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      mobile: "",
      gender: "Male",
      locationId: "",
      dateOfBirth: "",
      specialization: "General Physician",
      qualification: "",
      experience: "",
      licenseNumber: "",
      medicalLicenseNumber: "",
      medicalSpecialty: "",
      onsiteFee: "",
      voiceCallFee: "",
      videoCallFee: "",
      homeVisitFee: "",
      department: "",
      languagesSpoken: "",
      qualifications: "",
      registrationCouncilName: "",
      registrationYear: "",
      registrationState: "",
      affiliations: "",
      profilePhoto: "",
      yearsOfExperience: "",
      preferredCommunicationMethod: "Phone",
      servicesProvided: "",
      proceduresPerformed: "",
      bio: "",
      operatingHours: {
        Monday: { open: "09:00", close: "17:00", slotDuration: "30" },
        Tuesday: { open: "09:00", close: "17:00", slotDuration: "30" },
        Wednesday: { open: "09:00", close: "17:00", slotDuration: "30" },
        Thursday: { open: "09:00", close: "17:00", slotDuration: "30" },
        Friday: { open: "09:00", close: "17:00", slotDuration: "30" },
        Saturday: { open: "09:00", close: "14:00", slotDuration: "30" },
        Sunday: { open: "Off", close: "Off", slotDuration: "30" },
      },
    });
    setEditingDoctor(null);
    setShowForm(false);
  };

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const specializations = [
    "Cardiologist",
    "Neurologist",
    "Orthopedic",
    "Pediatrician",
    "Gynecologist",
    "Oncologist",
    "Dermatologist",
    "ENT Specialist",
    "Ophthalmologist",
    "Psychiatrist",
    "General Physician",
    "Surgeon",
    "Dentist",
    "Radiologist",
    "Anesthesiologist",
    "Other",
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctors</h1>
        <p className="text-gray-600">Manage your facility's medical professionals</p>
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
            Add Doctor
          </button>
        </div>
      )}

        {showForm ? (
          <Card className="shadow-xl border-gray-200/50 backdrop-blur-sm bg-white/90">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl">
                  {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
                </CardTitle>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-700 font-medium">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
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
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-gray-700 font-medium">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobile" className="text-gray-700 font-medium">Mobile</Label>
                      <Input
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
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
                      <Label htmlFor="password" className="text-gray-700 font-medium">Password {!editingDoctor && "*"}</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder={editingDoctor ? "Leave blank to keep current" : "Enter password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!editingDoctor}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Branch Location</Label>
                      <div className="mt-1.5">
                        <LocationSelector
                          facilityId={facilityId}
                          value={formData.locationId}
                          onChange={(locationId) =>
                            setFormData((prev) => ({ ...prev, locationId }))
                          }
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Optional: Assign doctor to a specific branch
                      </p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-gradient-to-br from-purple-50/30 to-pink-50/20 rounded-xl p-6 border border-purple-100/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <Award className="h-5 w-5 text-purple-600" />
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="specialization" className="text-gray-700 font-medium">Specialization</Label>
                      <select
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="mt-1.5 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        {specializations.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="qualification" className="text-gray-700 font-medium">Qualification</Label>
                      <Input
                        id="qualification"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="yearsOfExperience" className="text-gray-700 font-medium">
                        Years of Experience
                      </Label>
                      <Input
                        id="yearsOfExperience"
                        name="yearsOfExperience"
                        type="number"
                        min="0"
                        value={formData.yearsOfExperience}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="medicalLicenseNumber" className="text-gray-700 font-medium">
                        Medical License Number
                      </Label>
                      <Input
                        id="medicalLicenseNumber"
                        name="medicalLicenseNumber"
                        value={formData.medicalLicenseNumber}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department" className="text-gray-700 font-medium">Department</Label>
                      <Input
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="onsiteFee" className="text-gray-700 font-medium">
                        Onsite Consultation Fee (₹)
                      </Label>
                      <Input
                        id="onsiteFee"
                        name="onsiteFee"
                        type="number"
                        min="0"
                        placeholder="500"
                        value={formData.onsiteFee}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="voiceCallFee" className="text-gray-700 font-medium">
                        Voice Call Consultation Fee (₹)
                      </Label>
                      <Input
                        id="voiceCallFee"
                        name="voiceCallFee"
                        type="number"
                        min="0"
                        placeholder="300"
                        value={formData.voiceCallFee}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="videoCallFee" className="text-gray-700 font-medium">
                        Video Call Consultation Fee (₹)
                      </Label>
                      <Input
                        id="videoCallFee"
                        name="videoCallFee"
                        type="number"
                        min="0"
                        placeholder="400"
                        value={formData.videoCallFee}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="homeVisitFee" className="text-gray-700 font-medium">
                        Home Visit Consultation Fee (₹)
                      </Label>
                      <Input
                        id="homeVisitFee"
                        name="homeVisitFee"
                        type="number"
                        min="0"
                        placeholder="1000"
                        value={formData.homeVisitFee}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="medicalSpecialty" className="text-gray-700 font-medium">
                        Medical Specialties (comma-separated)
                      </Label>
                      <Input
                        id="medicalSpecialty"
                        name="medicalSpecialty"
                        placeholder="Cardiology, Internal Medicine"
                        value={formData.medicalSpecialty}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="qualifications" className="text-gray-700 font-medium">
                        Qualifications (comma-separated)
                      </Label>
                      <Input
                        id="qualifications"
                        name="qualifications"
                        placeholder="MBBS, MD, DM"
                        value={formData.qualifications}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="languagesSpoken" className="text-gray-700 font-medium">
                        Languages Spoken (comma-separated)
                      </Label>
                      <Input
                        id="languagesSpoken"
                        name="languagesSpoken"
                        placeholder="English, Hindi, Tamil"
                        value={formData.languagesSpoken}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="affiliations" className="text-gray-700 font-medium">
                        Affiliations (comma-separated)
                      </Label>
                      <Input
                        id="affiliations"
                        name="affiliations"
                        placeholder="Medical Association, Hospital Board"
                        value={formData.affiliations}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="servicesProvided" className="text-gray-700 font-medium">
                        Services Provided (comma-separated)
                      </Label>
                      <Input
                        id="servicesProvided"
                        name="servicesProvided"
                        placeholder="Consultation, Surgery, Diagnosis"
                        value={formData.servicesProvided}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="proceduresPerformed" className="text-gray-700 font-medium">
                        Procedures Performed (comma-separated)
                      </Label>
                      <Input
                        id="proceduresPerformed"
                        name="proceduresPerformed"
                        placeholder="Angioplasty, ECG, Stress Test"
                        value={formData.proceduresPerformed}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferredCommunicationMethod" className="text-gray-700 font-medium">
                        Preferred Communication
                      </Label>
                      <select
                        id="preferredCommunicationMethod"
                        name="preferredCommunicationMethod"
                        value={formData.preferredCommunicationMethod}
                        onChange={handleInputChange}
                        className="mt-1.5 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="Phone">Phone</option>
                        <option value="Email">Email</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="SMS">SMS</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="profilePhoto" className="text-gray-700 font-medium">Profile Photo URL</Label>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Input
                            id="profilePhoto"
                            name="profilePhoto"
                            placeholder="https://example.com/photo.jpg"
                            value={formData.profilePhoto}
                            onChange={handleInputChange}
                            className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Enter a valid image URL (jpg, png, webp)
                          </p>
                        </div>
                        {formData.profilePhoto && (
                          <div className="mt-1.5">
                            <div className="w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                              <img
                                src={formData.profilePhoto}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="text-xs text-red-500 text-center px-2">Invalid URL</div>';
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="bio" className="text-gray-700 font-medium">Bio</Label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="mt-1.5 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.bio.length}/500 characters
                      </p>
                    </div>
                  </div>
                </div>

                {/* Registration Details */}
                <div className="bg-gradient-to-br from-green-50/30 to-teal-50/20 rounded-xl p-6 border border-green-100/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <Award className="h-5 w-5 text-green-600" />
                    Registration Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="registrationCouncilName" className="text-gray-700 font-medium">
                        Council Name
                      </Label>
                      <Input
                        id="registrationCouncilName"
                        name="registrationCouncilName"
                        placeholder="Medical Council of India"
                        value={formData.registrationCouncilName}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="registrationYear" className="text-gray-700 font-medium">
                        Registration Year
                      </Label>
                      <Input
                        id="registrationYear"
                        name="registrationYear"
                        type="number"
                        placeholder="2010"
                        value={formData.registrationYear}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="registrationState" className="text-gray-700 font-medium">
                        Registration State
                      </Label>
                      <Input
                        id="registrationState"
                        name="registrationState"
                        placeholder="Maharashtra"
                        value={formData.registrationState}
                        onChange={handleInputChange}
                        className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="bg-gradient-to-br from-indigo-50/30 to-purple-50/20 rounded-xl p-6 border border-indigo-100/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    Working Hours
                  </h3>
                  <div className="space-y-3">
                    {Object.keys(formData.operatingHours).map((day) => {
                      const dayKey = day as keyof typeof formData.operatingHours;
                      const isOff = formData.operatingHours[dayKey].open === "Off";
                      return (
                      <div key={day} className="grid grid-cols-5 gap-3 items-center">
                        <Label className="text-gray-700 font-medium">{day}</Label>
                        <div>
                          <Input
                            type="time"
                            value={isOff ? "" : formData.operatingHours[dayKey].open}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                operatingHours: {
                                  ...formData.operatingHours,
                                  [day]: {
                                    ...formData.operatingHours[dayKey],
                                    open: e.target.value,
                                  },
                                },
                              });
                            }}
                            disabled={isOff}
                            placeholder={isOff ? "Off" : "Start"}
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <Input
                            type="time"
                            value={isOff ? "" : formData.operatingHours[dayKey].close}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                operatingHours: {
                                  ...formData.operatingHours,
                                  [day]: {
                                    ...formData.operatingHours[dayKey],
                                    close: e.target.value,
                                  },
                                },
                              });
                            }}
                            disabled={isOff}
                            placeholder={isOff ? "Off" : "End"}
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <select
                            value={formData.operatingHours[dayKey].slotDuration}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                operatingHours: {
                                  ...formData.operatingHours,
                                  [day]: {
                                    ...formData.operatingHours[dayKey],
                                    slotDuration: e.target.value,
                                  },
                                },
                              });
                            }}
                            disabled={isOff}
                            className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 bg-white disabled:bg-gray-100"
                          >
                            <option value="15">15 min</option>
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                            <option value="60">60 min</option>
                          </select>
                        </div>
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                operatingHours: {
                                  ...formData.operatingHours,
                                  [day]: isOff
                                    ? { open: "09:00", close: "17:00", slotDuration: "30" }
                                    : { open: "Off", close: "Off", slotDuration: "30" },
                                },
                              });
                            }}
                            className={`text-xs whitespace-nowrap w-full ${isOff ? 'bg-red-50 text-red-700 border-red-200' : ''}`}
                          >
                            {isOff ? "Set Hours" : "Day Off"}
                          </Button>
                        </div>
                      </div>
                      );
                    })}
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
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 rounded-xl font-semibold px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      editingDoctor ? "Update Doctor" : "Add Doctor"
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
                    placeholder="Search doctors by name, email, or specialization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 rounded-xl border-gray-200/50 bg-white/80 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'}
                  </span>
                </div>
              </div>
            </div>

            {/* Doctors List */}
            {filteredDoctors.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? "No Results Found" : "No Doctors Yet"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? "Try adjusting your search terms or filters"
                    : "Start building your medical team by adding your first doctor"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDoctors.map((doctor) => (
                  <div 
                    key={doctor._id} 
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      {/* Header with Avatar and Status */}
                      <div className="flex items-start gap-4 mb-5">
                        <div className="relative flex-shrink-0">
                          {doctor.profilePhoto ? (
                            <img
                              src={doctor.profilePhoto}
                              alt={doctor.name}
                              className="w-14 h-14 rounded-xl object-cover border-2 border-gray-100"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center"
                            style={{ display: doctor.profilePhoto ? 'none' : 'flex' }}
                          >
                            <User className="w-7 h-7 text-white" />
                          </div>
                          {doctor.isActive && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base text-gray-900 mb-1 truncate">
                            {doctor.name}
                          </h3>
                          <p className="text-sm text-gray-600 font-medium mb-2 truncate">
                            {doctor.specialization || "General Physician"}
                          </p>
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            doctor.isActive 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {doctor.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-2.5 mb-5">
                        <div className="flex items-center gap-2.5 text-sm text-gray-700">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{doctor.email}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-gray-700">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{doctor.phone}</span>
                        </div>
                        {doctor.qualification && (
                          <div className="flex items-center gap-2.5 text-sm text-gray-700">
                            <Award className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{doctor.qualification}</span>
                          </div>
                        )}
                        {(doctor.experience || doctor.yearsOfExperience) && (
                          <div className="flex items-center gap-2.5 text-sm text-gray-700">
                            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>
                              {doctor.experience || doctor.yearsOfExperience} years experience
                            </span>
                          </div>
                        )}
                        {doctor.locationId && (
                          <div className="flex items-center gap-2.5 text-sm text-gray-700">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate" title={doctor.locationId.branchName}>
                              {doctor.locationId.branchName} ({doctor.locationId.branchCode})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-5 border-t border-gray-100">
                        <button
                          onClick={() => handleEdit(doctor)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => toggleStatus(doctor._id)}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors border ${
                            doctor.isActive 
                              ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' 
                              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          }`}
                        >
                          {doctor.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          {doctor.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(doctor._id)}
                          className="px-3 py-2 text-sm font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
  );
}
