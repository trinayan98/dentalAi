import axios from "axios";
import { API_BASE_URL } from "../config/constants";

const API_URL = API_BASE_URL;

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to add auth token and handle content type
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Make sure we're using the correct format: "Bearer <token>"
      config.headers.Authorization = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem("token");
      window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);

// Blog API functions
export const blogApi = {
  createBlog: async (blogData) => {
    try {
      let dataToSend = blogData;
      let headers = {};

      // If it's FormData, parse the blogData from the FormData
      if (blogData instanceof FormData) {
        headers = {}; // Let axios set the correct Content-Type for FormData
      } else {
        headers = { "Content-Type": "application/json" };
      }

      const response = await api.post("/blogs", dataToSend, { headers });
      return response.data;
    } catch (error) {
      console.error("Create blog error:", error.response || error);
      throw error.response?.data || error;
    }
  },

  getBlog: async (id) => {
    try {
      const response = await api.get(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get blog error:", error.response || error);
      throw error.response?.data || error;
    }
  },

  updateBlog: async (id, blogData) => {
    try {
      const response = await api.put(`/blogs/${id}`, blogData);
      return response.data;
    } catch (error) {
      console.error("Update blog error:", error.response || error);
      throw error.response?.data || error;
    }
  },

  getBlogs: async ({
    page = 1,
    limit = 10,
    status,
    sortBy = "newest",
  } = {}) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (status) params.append("status", status);
      if (sortBy) params.append("sortBy", sortBy);

      const response = await api.get(`/blogs?${params}`);
      return response.data;
    } catch (error) {
      console.error("Get blogs error:", error.response || error);
      throw error.response?.data || error;
    }
  },

  deleteBlog: async (id) => {
    try {
      const response = await api.delete(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete blog error:", error.response || error);
      throw error.response?.data || error;
    }
  },
};
