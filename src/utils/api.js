import { API_BASE_URL } from "../config/constants";

const API_URL = API_BASE_URL;

export const authApi = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    console.log("Full login response:", data);
    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }
    return data;
  },

  getCurrentUser: async (token) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to get user data");
    }
    return response.json();
  },
};

export const userApi = {
  updateProfile: async (token, data) => {
    // Log the incoming data
    console.log("updateProfile - Incoming data:", {
      type: data instanceof FormData ? "FormData" : "JSON",
      data:
        data instanceof FormData ? Object.fromEntries(data.entries()) : data,
    });

    let response;

    if (data instanceof FormData) {
      // Handle FormData (for file uploads)
      response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData
        },
        body: data,
      });
    } else {
      // Handle JSON data (for regular updates)
      response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update profile");
    }

    const result = await response.json();
    console.log("Profile update response:", result);
    return result;
  },

  changePassword: async (token, passwordData) => {
    const response = await fetch(`${API_URL}/users/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to change password");
    }
    return response.json();
  },

  getUserProfile: async (token) => {
    console.log(
      "Calling getUserProfile with token:",
      token ? `${token.substring(0, 15)}...` : "No token"
    );
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Profile response status:", response.status);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Profile error:", errorData);
      throw new Error(errorData.message || "Failed to get user profile");
    }
    return response.json();
  },

  getUserById: async (token, userId) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get user profile");
    }
    return response.json();
  },

  getUserDetails: async (token, userId) => {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch user details");
    }
    const { data } = await response.json();
    return data;
  },
};
