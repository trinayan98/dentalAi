import { API_BASE_URL } from "../config/constants";

const API_URL = API_BASE_URL;

export const usersApi = {
  getUsers: async (token, { page = 1, limit = 10, search = "" } = {}) => {
    const response = await fetch(
      `${API_URL}/users?page=${page}&limit=${limit}&search=${search}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch users");
    }
    return response.json();
  },

  createUser: async (token, userData) => {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create user");
    }
    return response.json();
  },

  updateUser: async (token, userId, userData) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update user");
    }
    return response.json();
  },

  deleteUser: async (token, userId) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete user");
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
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch user");
    }
    return response.json();
  },

  changeUserRole: async (token, userId, role) => {
    const response = await fetch(`${API_URL}/users/${userId}/role`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to change user role");
    }
    return response.json();
  },

  changeUserStatus: async (token, userId, status) => {
    const response = await fetch(`${API_URL}/users/${userId}/status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to change user status");
    }
    return response.json();
  },

  toggleUserStatus: async (token, userId, isCurrentlyActive) => {
    const response = await fetch(`${API_URL}/users/${userId}/toggle-status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        active: isCurrentlyActive ? 0 : 1, // Toggle between 0 and 1
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to toggle user status");
    }
    return response.json();
  },
};
