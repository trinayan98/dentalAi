import axios from "axios";

const API_URL = "http://localhost:5001/api";

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
      // Use window.location.replace to ensure a full page reload
      window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);

// Blog API functions
export const blogApi = {
  createBlog: async (blogData) => {
    try {
      // Log the token being sent (for debugging)
      console.log("Token:", localStorage.getItem("token"));

      const response = await api.post("/blogs", blogData, {
        headers: {
          // Let axios set the correct Content-Type for FormData
          ...(blogData instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
        },
      });
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
      throw error.response?.data || error;
    }
  },

  updateBlog: async ({ id, data }) => {
    try {
      const response = await api.put(`/blogs/${id}`, data, {
        headers: {
          // Let axios set the correct Content-Type for FormData
          ...(data instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getBlogs: async ({ page = 1, limit = 10, status, author }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append("status", status);
      if (author) params.append("author", author);

      const response = await api.get(`/blogs?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteBlog: async (id) => {
    try {
      const response = await api.delete(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
