"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, LogOut, Activity, Users, Stethoscope, ClipboardList, UserRound, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

interface Facility {
  _id: string
  name: string
  email: string
  superAdminEmail?: string
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  registrationNumber?: string
  establishedYear?: number
  isActive: boolean
  isVerified: boolean
  facilityType?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [facility, setFacility] = useState<Facility | null>(null)
  const [facilityType, setFacilityType] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [currentPath, setCurrentPath] = useState("/dashboard")
  const [stats, setStats] = useState({
    totalDoctors: 0,
    activeDoctors: 0,
    totalPatients: 0,
    activePatients: 0,
    totalAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
  })
  const [recentPatients, setRecentPatients] = useState<any[]>([])
  const [recentDoctors, setRecentDoctors] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem("facility_token")
    if (!token) {
      router.push("/login")
      return
    }

    const facilityData = localStorage.getItem("facility_data")
    const type = localStorage.getItem("facility_type")
    
    if (facilityData && type) {
      try {
        setFacility(JSON.parse(facilityData))
        setFacilityType(type)
        fetchDashboardData()
      } catch (error) {
        console.error("Error parsing facility data:", error)
        handleLogout()
      }
    } else {
      handleLogout()
    }

    setLoading(false)
  }, [router])

  const fetchDashboardData = async () => {
    try {
      // Fetch doctor stats
      const doctorStatsRes = await api.get("/api/doctors/stats")
      if (doctorStatsRes.data.success) {
        setStats((prev) => ({
          ...prev,
          totalDoctors: doctorStatsRes.data.data.totalDoctors || 0,
          activeDoctors: doctorStatsRes.data.data.activeDoctors || 0,
        }))
      }

      // Fetch patient stats
      const patientStatsRes = await api.get("/api/patients/stats")
      if (patientStatsRes.data.success) {
        setStats((prev) => ({
          ...prev,
          totalPatients: patientStatsRes.data.data.total || 0,
          activePatients: patientStatsRes.data.data.active || 0,
        }))
      }

      // Fetch recent doctors
      const doctorsRes = await api.get("/api/doctors")
      if (doctorsRes.data.success) {
        setRecentDoctors(doctorsRes.data.data.slice(0, 5))
      }

      // Fetch recent patients
      const patientsRes = await api.get("/api/patients")
      if (patientsRes.data.success) {
        setRecentPatients(patientsRes.data.data.slice(0, 5))
      }

      // Fetch appointment stats
      const appointmentStatsRes = await api.get("/api/appointments/stats")
      if (appointmentStatsRes.data.success) {
        const appointmentData = appointmentStatsRes.data.data
        setStats((prev) => ({
          ...prev,
          totalAppointments: appointmentData.total || 0,
          scheduledAppointments: appointmentData.byStatus?.Scheduled || 0,
          completedAppointments: appointmentData.byStatus?.Completed || 0,
        }))
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("facility_token")
    localStorage.removeItem("facility_data")
    localStorage.removeItem("facility_type")
    toast.success("Logged out successfully")
    router.push("/login")
  }

  return (
    <main className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your facility.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Patients */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <UserRound className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Patients</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalPatients}</h3>
              <p className="text-gray-500 text-xs">{stats.activePatients} active patients</p>
            </CardContent>
          </Card>

          {/* Total Doctors */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Doctors</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalDoctors}</h3>
              <p className="text-gray-500 text-xs">{stats.activeDoctors} active doctors</p>
            </CardContent>
          </Card>

          {/* Appointments */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => router.push("/appointments")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Appointments</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalAppointments}</h3>
              <p className="text-gray-500 text-xs">{stats.scheduledAppointments} scheduled today</p>
            </CardContent>
          </Card>

          {/* Operations */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-sm font-medium">
                  <span>-</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Operations</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">-</h3>
              <p className="text-gray-500 text-xs">Coming soon</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Patients */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Patients</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/patients')}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentPatients.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentPatients.slice(0, 5).map((patient) => (
                    <div key={patient._id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {patient.fullName?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'P'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{patient.fullName}</p>
                          <p className="text-xs text-gray-500">{patient.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {patient.bloodGroup && (
                          <span className="inline-block px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-md">
                            {patient.bloodGroup}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserRound className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm mb-4">No patients registered yet</p>
                  <Button 
                    size="sm"
                    onClick={() => router.push('/patients')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Patient
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Doctors */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Doctors</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/doctors')}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentDoctors.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentDoctors.slice(0, 5).map((doctor) => (
                    <div key={doctor._id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {doctor.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'D'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{doctor.name}</p>
                          <p className="text-xs text-gray-500">{doctor.specialization}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md ${
                          doctor.isActive 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {doctor.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm mb-4">No doctors registered yet</p>
                  <Button 
                    size="sm"
                    onClick={() => router.push('/doctors')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Doctor
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
      </main>
  )
}
