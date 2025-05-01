const API_URL = "http://localhost:5001/api";

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
    console.log("Updating profile with data:", data); // Debug log

    const formData = new FormData();

    // Handle name update
    if (data.name !== undefined) {
      formData.append("name", data.name);
    }

    // Handle username update
    if (data.username !== undefined) {
      formData.append("username", data.username);
      console.log("FormData username value:", data.username);
      // Log the actual FormData entries
      for (let [key, value] of formData.entries()) {
        console.log(`FormData ${key}:`, value);
      }
    }

    // Handle avatar update
    if (data.avatar && data.avatar instanceof File) {
      formData.append("avatar", data.avatar);
    }

    const response = await fetch(`${API_URL}/users/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update profile");
    }
    return response.json();
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
};
