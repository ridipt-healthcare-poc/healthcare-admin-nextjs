import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("facility_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on the login page
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("facility_token");
        localStorage.removeItem("facility_data");
        localStorage.removeItem("facility_type");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
