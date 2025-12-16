"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Mail, Lock, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password")
      return
    }

    setLoading(true)

    try {
      console.log("🔐 Attempting login with email:", email)

      // Try facility owner login first
      let response;
      let isStaff = false;

      try {
        console.log("🏥 Trying facility owner login...")
        response = await api.post("/api/facility-auth/login", {
          email,
          password,
        })
        console.log("✅ Facility owner login successful")
      } catch (facilityError: any) {
        console.log("❌ Facility owner login failed, trying staff login...")
        // If facility login fails, try staff login
        try {
          response = await api.post("/api/facility-staff-auth/login", {
            email,
            password,
          })
          isStaff = true;
          console.log("✅ Staff login successful")
        } catch (staffError: any) {
          console.log("❌ Both facility and staff login failed")
          // Both failed, show error
          throw facilityError; // Show the first error
        }
      }

      console.log("📦 Login response:", response.data)

      if (response.data.success) {
        if (isStaff) {
          console.log("👤 Processing staff login response")
          // Staff login response structure: { success, message, token, staff }
          localStorage.setItem("facility_token", response.data.token)
          localStorage.setItem("user_type", "staff")
          localStorage.setItem("staff_data", JSON.stringify(response.data.staff))
          localStorage.setItem("staff_permissions", JSON.stringify(response.data.staff.permissions))
          // Store facility data for compatibility
          localStorage.setItem("facility_data", JSON.stringify({
            _id: response.data.staff.facilityId?._id || response.data.staff.facilityId,
            name: response.data.staff.facilityId?.name || "Facility",
            facilityType: response.data.staff.facilityType
          }))
          localStorage.setItem("facility_type", response.data.staff.facilityType)

          // Store location data if staff is assigned to a specific branch
          if (response.data.staff.locationId && typeof response.data.staff.locationId === 'object') {
            localStorage.setItem("location_data", JSON.stringify(response.data.staff.locationId))
            console.log("✅ Location data stored:", response.data.staff.locationId.branchName)
          }

          console.log("💾 Staff data stored in localStorage")
          console.log("🔑 Token:", response.data.token ? "Present" : "Missing")
          console.log("👤 User type:", "staff")

          // Verify storage immediately
          const storedToken = localStorage.getItem("facility_token")
          const storedUserType = localStorage.getItem("user_type")
          console.log("🔍 Verification - Stored token:", storedToken ? "Present" : "Missing")
          console.log("🔍 Verification - Stored user type:", storedUserType)
        } else {
          console.log("🏥 Processing facility owner login response")
          // Facility owner login response structure: { success, data: { token, facility, facilityType } }
          localStorage.setItem("facility_token", response.data.data.token)
          localStorage.setItem("user_type", "owner")
          localStorage.setItem("facility_data", JSON.stringify(response.data.data.facility))
          localStorage.setItem("facility_type", response.data.data.facilityType)

          console.log("💾 Owner data stored in localStorage")
          console.log("🔑 Token:", response.data.data.token ? "Present" : "Missing")
          console.log("👤 User type:", "owner")
        }

        toast.success("Login successful!")
        console.log("🚀 Redirecting to dashboard...")
        
        // Add a small delay to ensure localStorage is written
        setTimeout(() => {
          console.log("⏰ Pre-redirect check - Token in storage:", localStorage.getItem("facility_token") ? "Present" : "Missing")
          router.push("/dashboard")
        }, 100)
      } else {
        console.log("❌ Login response success is false")
        // Handle case where success is false
        toast.error(response.data.message || "Login failed")
      }
    } catch (error: any) {
      console.error("❌ Login error:", error)
      console.error("❌ Error response:", error?.response?.data)
      const errorMsg = error?.response?.data?.message || error?.response?.data?.error || "Invalid credentials. Please try again."
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email && password && !loading) {
      handleSubmit()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl mb-6 shadow-xl">
            <Building2 className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Facility Portal</h1>
          <p className="text-gray-600 text-base">Sign in to manage your facility</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-2 pb-8 pt-8">
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
            <CardDescription className="text-base">Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            {/* Email Field */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-900">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  autoComplete="username"
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="admin@healthcare.com"
                  className="pl-11 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-900">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your password"
                  className="pl-11 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Footer Links */}
            <div className="flex items-center justify-between pt-2">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                Forgot password?
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900 hover:underline">
                Need help?
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Protected by enterprise-grade security</p>
        </div>
      </div>
    </div>
  )
}
