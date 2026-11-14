import { API_BASE } from "../utils/api.client";

function getAuthHeaders() {
  const token = localStorage.getItem("healu_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Login failed with status ${response.status}`);
    }

    if (data.token) {
      localStorage.setItem("healu_token", data.token);
    }
    if (data.user) {
      localStorage.setItem("healu_user", JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
}

export async function registerUser(userData) {
  try {
    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Registration failed with status ${response.status}`);
    }

    if (data.token) {
      localStorage.setItem("healu_token", data.token);
    }
    if (data.user) {
      localStorage.setItem("healu_user", JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    console.error("Register API error:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const token = localStorage.getItem("healu_token");
    if (!token) return null;

    const response = await fetch(`${API_BASE}/api/auth/me`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      localStorage.removeItem("healu_token");
      localStorage.removeItem("healu_user");
      return null;
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load user");
    }

    if (data.user) {
      localStorage.setItem("healu_user", JSON.stringify(data.user));
    }
    return data.user;
  } catch (error) {
    console.error("getCurrentUser API error:", error);
    return null;
  }
}

export async function updateUserProfile(profileData) {
  try {
    const response = await fetch(`${API_BASE}/api/auth/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update profile");
    }

    if (data.user) {
      localStorage.setItem("healu_user", JSON.stringify(data.user));
    }
    return data.user;
  } catch (error) {
    console.error("updateProfile API error:", error);
    throw error;
  }
}

export function logoutUser() {
  localStorage.removeItem("healu_token");
  localStorage.removeItem("healu_user");
}
