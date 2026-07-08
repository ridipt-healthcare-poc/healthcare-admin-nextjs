import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.medsparsh.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("facility_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("📤 API Request - Adding token to:", config.url);
  } else {
    console.log("⚠️ API Request - No token found for:", config.url);
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("📥 API Response Error:", error.response?.status, error.response?.data?.message);
    console.log("📍 Current pathname:", window.location.pathname);

    if (error.response?.status === 401) {
      console.log("🚨 401 Unauthorized - Clearing tokens and redirecting to login");

      // Don't redirect if we're already on the login page
      if (!window.location.pathname.includes("/login")) {
        console.log("🔄 Not on login page, clearing storage and redirecting");
        localStorage.removeItem("facility_token");
        localStorage.removeItem("facility_data");
        localStorage.removeItem("facility_type");
        localStorage.removeItem("user_type");
        localStorage.removeItem("staff_data");
        localStorage.removeItem("staff_permissions");
        window.location.href = "/login";
      } else {
        console.log("🔄 On login page, NOT clearing storage or redirecting");
      }
    }
    return Promise.reject(error);
  }
);
