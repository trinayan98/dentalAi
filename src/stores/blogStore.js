import { create } from "zustand";
import axios from "axios";
import useAuthStore from "./authStore";
import { blogApi } from "../api/blogs";
import { API_BASE_URL } from "../config/constants";

const API_URL = API_BASE_URL;

// Helper function to get auth header
const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useBlogStore = create((set, get) => ({
  blogs: [],
  currentBlog: null,
  isLoading: false,
  error: null,

  fetchBlogs: async (queryParams = new URLSearchParams()) => {
    set({ isLoading: true, error: null });
    try {
      const response = await blogApi.getBlogs({
        page: queryParams.get("page") || 1,
        limit: queryParams.get("limit") || 10,
        status: queryParams.get("status"),
        sortBy: queryParams.get("sortBy") || "newest",
      });

      if (response.success) {
        set({
          blogs: response.data,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || "Failed to fetch blogs");
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      console.error("Error fetching blogs:", error);
    }
  },

  fetchBlog: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await blogApi.getBlog(id);

      if (response.success) {
        set({
          currentBlog: response.data,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || "Blog not found");
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  createBlog: async (blogData) => {
    set({ isLoading: true });
    try {
      const formData = new FormData();
      Object.keys(blogData).forEach((key) => {
        if (key === "media" && blogData[key]) {
          blogData[key].forEach((file) => {
            formData.append("media", file);
          });
        } else {
          formData.append(key, blogData[key]);
        }
      });

      const response = await axios.post(`${API_URL}/blogs`, formData, {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        set((state) => ({
          blogs: [...state.blogs, response.data.data],
          currentBlog: response.data.data,
          isLoading: false,
          error: null,
        }));
      } else {
        throw new Error(response.data.error || "Failed to create blog");
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  updateBlog: async (id, blogData) => {
    set({ isLoading: true });
    try {
      const response = await axios.put(`${API_URL}/blogs/${id}`, blogData, {
        headers: {
          ...getAuthHeader(),
        },
      });

      if (response.data.success) {
        set((state) => ({
          blogs: state.blogs.map((blog) =>
            blog._id === id ? response.data.data : blog
          ),
          currentBlog: response.data.data,
          isLoading: false,
          error: null,
        }));
      } else {
        throw new Error(response.data.error || "Failed to update blog");
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  deleteBlog: async (id) => {
    set({ isLoading: true });
    try {
      await axios.delete(`${API_URL}/blogs/${id}`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      set((state) => ({
        blogs: state.blogs.filter((blog) => blog._id !== id),
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  generateBlog: async (topic, options) => {
    set({ isLoading: true });

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock AI generation (in a real app, this would call an AI service)
    const generatedContent = `
    # ${topic}

    ## Introduction

    This is a generated blog post about ${topic}. The tone is ${options.tone} and the length is ${options.length}.

    ## Main Points

    1. First important point about ${topic}
    2. Second important point with detailed analysis
    3. Insights and industry trends

    ## Practical Applications

    Here are some ways to apply these insights in real-world scenarios...

    ## Conclusion

    In summary, ${topic} represents a significant opportunity/challenge that requires attention.
    `;

    const wordCount =
      options.length === "short"
        ? 800
        : options.length === "medium"
        ? 1500
        : 2500;

    const newBlog = {
      id: `${Math.floor(Math.random() * 1000)}`,
      title: topic,
      content: generatedContent,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "1",
      imageUrl:
        "https://images.pexels.com/photos/270373/pexels-photo-270373.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      excerpt: `An exploration of ${topic} with key insights and analysis.`,
      tags: [topic.split(" ")[0], "AI Generated"],
      wordCount,
    };

    set((state) => ({
      blogs: [...state.blogs, newBlog],
      currentBlog: newBlog,
      isLoading: false,
    }));
  },
}));
