"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Plus,
  X,
  Check,
  Ban,
  Trash2,
  Filter,
  Search,
  Stethoscope,
  ChevronLeft,
  Activity,
  UserRound,
  ClipboardList,
  Users,
  Building2,
  LogOut,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  isActive: boolean;
  consultationFees: {
    onsite?: number;
    voiceCall?: number;
    videoCall?: number;
    homeVisit?: number;
  };
}

interface Patient {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  bloodGroup: string;
  dateOfBirth: string;
  isActive: boolean;
}

interface Appointment {
  _id: string;
  doctorId: Doctor;
  patientId: Patient;
  appointmentDate: string;
  appointmentTime: string;
  slot: {
    start: string;
    end: string;
  };
  appointmentType: "onsite" | "voiceCall" | "videoCall" | "homeVisit";
  status: string;
  visitType: "First Visit" | "Follow-Up";
  consultationFee: number;
  paymentStatus: string;
  remarks?: string;
}

interface AvailableSlot {
  start: string;
  end: string;
  duration: number;
  isBooked: boolean;
  isAvailable: boolean;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [facility, setFacility] = useState<any>(null);
  const [facilityType, setFacilityType] = useState<string>("");
  const [currentPath, setCurrentPath] = useState("/appointments");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: "",
    patientId: "",
    appointmentDate: "",
    appointmentTime: "",
    slot: { start: "", end: "" },
    appointmentType: "onsite" as "onsite" | "voiceCall" | "videoCall" | "homeVisit",
    visitType: "First Visit" as "First Visit" | "Follow-Up",
    consultationFee: 0,
    paymentStatus: "Pending",
    remarks: "",
  });

  useEffect(() => {
    const facilityData = localStorage.getItem("facility_data");
    const type = localStorage.getItem("facility_type");
    if (facilityData && type) {
      setFacility(JSON.parse(facilityData));
      setFacilityType(type);
    }
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("facility_token");
    localStorage.removeItem("facility_data");
    localStorage.removeItem("facility_type");
    router.push("/login");
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get("/api/appointments");
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get("/api/doctors");
      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get("/api/patients");
      if (response.data.success) {
        setPatients(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchAvailableSlots = async (doctorId: string, date: string) => {
    try {
      const response = await api.get(`/api/appointments/available-slots?doctorId=${doctorId}&date=${date}`);
      if (response.data.success) {
        setAvailableSlots(response.data.data);
      }
    } catch (error: any) {
      toast.error("Failed to fetch available slots");
    }
  };

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find((d) => d._id === doctorId);
    setFormData((prev) => ({
      ...prev,
      doctorId,
      consultationFee: doctor?.consultationFees?.[formData.appointmentType] || 0,
    }));

    if (formData.appointmentDate) {
      fetchAvailableSlots(doctorId, formData.appointmentDate);
    }
  };

  const handleDateChange = (date: string) => {
    setFormData((prev) => ({ ...prev, appointmentDate: date }));
    if (formData.doctorId) {
      fetchAvailableSlots(formData.doctorId, date);
    }
  };

  const handleAppointmentTypeChange = (type: "onsite" | "voiceCall" | "videoCall" | "homeVisit") => {
    const doctor = doctors.find((d) => d._id === formData.doctorId);
    setFormData((prev) => ({
      ...prev,
      appointmentType: type,
      consultationFee: doctor?.consultationFees?.[type] || 0,
    }));
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    if (!slot.isAvailable) return;

    const slotStart = new Date(slot.start);
    const time = slotStart.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    setFormData((prev) => ({
      ...prev,
      appointmentTime: time,
      slot: {
        start: slot.start,
        end: slot.end,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.doctorId || !formData.patientId || !formData.appointmentDate || !formData.slot.start) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const slotStart = new Date(formData.slot.start);
      const slotEnd = new Date(formData.slot.end);
      const durationMinutes = (slotEnd.getTime() - slotStart.getTime()) / (1000 * 60);

      const appointmentData = {
        doctorId: formData.doctorId,
        patientId: formData.patientId,
        appointmentDate: formData.appointmentDate,
        appointmentDateTime: slotStart.toISOString(),
        appointmentTime: formData.appointmentTime,
        slot: {
          start: formData.slot.start,
          end: formData.slot.end,
        },
        durationMinutes,
        appointmentType: formData.appointmentType,
        visitType: formData.visitType,
        consultationFee: formData.consultationFee,
        paymentStatus: formData.paymentStatus,
        reasonForVisit: formData.remarks,
        notes: formData.remarks,
      };

      const response = await api.post("/api/appointments", appointmentData);
      if (response.data.success) {
        toast.success("Appointment created successfully");
        setShowForm(false);
        resetForm();
        fetchAppointments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const response = await api.patch(`/api/appointments/${id}/status`, { status });
      if (response.data.success) {
        toast.success(`Appointment ${status.toLowerCase()} successfully`);
        fetchAppointments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const response = await api.patch(`/api/appointments/${id}/cancel`, {
        cancellationReason: "Cancelled by facility",
      });
      if (response.data.success) {
        toast.success("Appointment cancelled successfully");
        fetchAppointments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    try {
      const response = await api.delete(`/api/appointments/${id}`);
      if (response.data.success) {
        toast.success("Appointment deleted successfully");
        fetchAppointments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete appointment");
    }
  };

  const resetForm = () => {
    setFormData({
      doctorId: "",
      patientId: "",
      appointmentDate: "",
      appointmentTime: "",
      slot: { start: "", end: "" },
      appointmentType: "onsite",
      visitType: "First Visit",
      consultationFee: 0,
      paymentStatus: "Pending",
      remarks: "",
    });
    setAvailableSlots([]);
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
    const matchesSearch =
      appointment.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      Scheduled: "bg-blue-100 text-blue-800",
      Booked: "bg-purple-100 text-purple-800",
      Confirmed: "bg-green-100 text-green-800",
      Completed: "bg-gray-100 text-gray-800",
      Cancelled: "bg-red-100 text-red-800",
      "No-Show": "bg-orange-100 text-orange-800",
      Rescheduled: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getAppointmentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      onsite: "On-site",
      voiceCall: "Voice Call",
      videoCall: "Video Call",
      homeVisit: "Home Visit",
    };
    return labels[type] || type;
  };

  return (
    <>
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments</h1>
            <p className="text-gray-600">Manage and track all your appointments</p>
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
                Book Appointment
              </button>
            </div>
          )}

          {!showForm && (
            <div>
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by doctor or patient name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[180px] font-medium"
                    >
                      <option value="all">All Status</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Appointments List */}
              {filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
                  <p className="text-gray-500 mb-6">Get started by booking your first appointment</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Book Appointment
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          {/* Main Info */}
                          <div className="flex-1">
                            {/* Status Badges */}
                            <div className="flex items-center gap-3 mb-5">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                              </span>
                              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                {getAppointmentTypeLabel(appointment.appointmentType)}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">{appointment.visitType}</span>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Doctor */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Stethoscope className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</h3>
                                </div>
                                <p className="font-bold text-gray-900 text-base">{appointment.doctorId?.name}</p>
                                <p className="text-sm text-gray-600">{appointment.doctorId?.specialization}</p>
                              </div>

                              {/* Patient */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                    <User className="w-4 h-4 text-green-600" />
                                  </div>
                                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</h3>
                                </div>
                                <p className="font-bold text-gray-900 text-base">{appointment.patientId?.fullName}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{appointment.patientId?.mobile}</span>
                                </div>
                              </div>

                              {/* Schedule */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-purple-600" />
                                  </div>
                                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule</h3>
                                </div>
                                <div className="flex items-center gap-2 font-medium text-gray-900">
                                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                  <span>
                                    {new Date(appointment.appointmentDate).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  <span>
                                    {new Date(appointment.slot.start).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                    {" - "}
                                    {new Date(appointment.slot.end).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Payment Info */}
                            <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-6">
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm text-gray-500 font-medium">Fee:</span>
                                <span className="text-2xl font-bold text-gray-900">₹{appointment.consultationFee}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 font-medium">Payment:</span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${appointment.paymentStatus === "Paid"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-orange-100 text-orange-800"
                                    }`}
                                >
                                  {appointment.paymentStatus}
                                </span>
                              </div>
                            </div>

                            {appointment.remarks && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold">Note: </span>
                                  {appointment.remarks}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 min-w-[140px]">
                            {appointment.status === "Scheduled" && (
                              <button
                                onClick={() => handleStatusUpdate(appointment._id, "Confirmed")}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                                Confirm
                              </button>
                            )}
                            {appointment.status === "Confirmed" && (
                              <button
                                onClick={() => handleStatusUpdate(appointment._id, "Completed")}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                                Complete
                              </button>
                            )}
                            {!["Cancelled", "Completed", "No-Show"].includes(appointment.status) && (
                              <button
                                onClick={() => handleCancel(appointment._id)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                              >
                                <Ban className="w-4 h-4" />
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(appointment._id)}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Section */}
          {showForm && (
            <Card className="shadow-xl border-gray-200/50 backdrop-blur-sm bg-white/90">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Book New Appointment</CardTitle>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to List
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Doctor & Patient Selection */}
                  <div className="bg-gradient-to-br from-blue-50/30 to-indigo-50/20 rounded-xl p-6 border border-blue-100/50">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                      <Users className="h-5 w-5 text-blue-600" />
                      Doctor & Patient Selection
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="doctor" className="text-gray-700 font-medium">
                          Doctor <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="doctor"
                          required
                          value={formData.doctorId}
                          onChange={(e) => handleDoctorChange(e.target.value)}
                          className="mt-1.5 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                        >
                          <option value="">Select Doctor</option>
                          {doctors.filter(doctor => doctor.isActive).map((doctor) => (
                            <option key={doctor._id} value={doctor._id}>
                              {doctor.name} - {doctor.specialization}
                            </option>
                          ))}
                        </select>
                        {doctors.some(d => !d.isActive) && (
                          <p className="mt-1 text-xs text-gray-500">Only active doctors are shown</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="patient" className="text-gray-700 font-medium">
                          Patient <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="patient"
                          required
                          value={formData.patientId}
                          onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                          className="mt-1.5 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                        >
                          <option value="">Select Patient</option>
                          {patients.filter(patient => patient.isActive).map((patient) => (
                            <option key={patient._id} value={patient._id}>
                              {patient.fullName} - {patient.mobile}
                            </option>
                          ))}
                        </select>
                        {patients.some(p => !p.isActive) && (
                          <p className="mt-1 text-xs text-gray-500">Only active patients are shown</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="bg-gradient-to-br from-purple-50/30 to-pink-50/20 rounded-xl p-6 border border-purple-100/50">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                      <Clock className="h-5 w-5 text-purple-600" />
                      Appointment Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="appointmentDate" className="text-gray-700 font-medium">
                          Appointment Date <span className="text-red-500">*</span>
                        </Label>
                        <input
                          id="appointmentDate"
                          type="date"
                          required
                          value={formData.appointmentDate}
                          onChange={(e) => handleDateChange(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="mt-1.5 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                        />
                      </div>

                    </div>

                    <div>
                      <Label htmlFor="appointmentType" className="text-gray-700 font-medium">
                        Appointment Type <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="appointmentType"
                        required
                        value={formData.appointmentType}
                        onChange={(e) => handleAppointmentTypeChange(e.target.value as any)}
                        className="mt-1.5 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                      >
                        <option value="onsite">On-site Visit</option>
                        <option value="voiceCall">Voice Call</option>
                        <option value="videoCall">Video Call</option>
                        <option value="homeVisit">Home Visit</option>
                      </select>
                    </div>
                  </div>

                  {/* Available Slots */}
                  {availableSlots.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-gray-700 font-medium mb-3 block">
                        Select Time Slot <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {availableSlots.map((slot, index) => {
                          const slotStart = new Date(slot.start);
                          const timeStr = slotStart.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          });

                          return (
                            <button
                              key={index}
                              type="button"
                              disabled={!slot.isAvailable}
                              onClick={() => handleSlotSelect(slot)}
                              className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-all ${formData.slot.start === slot.start
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                : slot.isAvailable
                                  ? "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                }`}
                            >
                              {timeStr}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-green-50/30 to-emerald-50/20 rounded-xl p-6 border border-green-100/50">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                      <ClipboardList className="h-5 w-5 text-green-600" />
                      Visit & Payment Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="visitType" className="text-gray-700 font-medium">
                          Visit Type <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="visitType"
                          required
                          value={formData.visitType}
                          onChange={(e) => setFormData({ ...formData, visitType: e.target.value as any })}
                          className="mt-1.5 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                        >
                          <option value="First Visit">First Visit</option>
                          <option value="Follow-Up">Follow-Up</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="paymentStatus" className="text-gray-700 font-medium">
                          Payment Status
                        </Label>
                        <select
                          id="paymentStatus"
                          value={formData.paymentStatus}
                          onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                          className="mt-1.5 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="consultationFee" className="text-gray-700 font-medium">
                          Consultation Fee (₹) <span className="text-red-500">*</span>
                        </Label>
                        <input
                          id="consultationFee"
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.consultationFee || ''}
                          onChange={(e) => setFormData({ ...formData, consultationFee: parseFloat(e.target.value) || 0 })}
                          className="mt-1.5 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                          placeholder={formData.doctorId ? "Enter consultation fee" : "Select doctor first"}
                        />
                        {formData.doctorId && (() => {
                          const doctor = doctors.find(d => d._id === formData.doctorId);
                          if (doctor?.consultationFees) {
                            return (
                              <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Doctor's Fee Structure:</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {doctor.consultationFees.onsite && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">On-site:</span>
                                      <span className="font-semibold">₹{doctor.consultationFees.onsite}</span>
                                    </div>
                                  )}
                                  {doctor.consultationFees.voiceCall && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Voice Call:</span>
                                      <span className="font-semibold">₹{doctor.consultationFees.voiceCall}</span>
                                    </div>
                                  )}
                                  {doctor.consultationFees.videoCall && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Video Call:</span>
                                      <span className="font-semibold">₹{doctor.consultationFees.videoCall}</span>
                                    </div>
                                  )}
                                  {doctor.consultationFees.homeVisit && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Home Visit:</span>
                                      <span className="font-semibold">₹{doctor.consultationFees.homeVisit}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="bg-gradient-to-br from-amber-50/30 to-orange-50/20 rounded-xl p-6 border border-amber-100/50">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                      <ClipboardList className="h-5 w-5 text-amber-600" />
                      Additional Notes
                    </h3>
                    <div>
                      <Label htmlFor="remarks" className="text-gray-700 font-medium">
                        Remarks / Notes
                      </Label>
                      <textarea
                        id="remarks"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        rows={3}
                        className="mt-1.5 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        placeholder="Any additional notes about this appointment..."
                      />
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Booking..." : "Book Appointment"}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main >
    </>
  );
}
