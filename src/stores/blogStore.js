import { create } from "zustand";
import axios from "axios";
import useAuthStore from "./authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Mock blog data for demonstration
const MOCK_BLOGS = [
  {
    id: "1",
    title: "The Future of Artificial Intelligence",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies ultricies, nunc nisl ultricies nunc, quis ultricies nisl nisl quis nisl.",
    status: "published",
    createdAt: "2023-05-15T10:30:00Z",
    updatedAt: "2023-05-15T14:20:00Z",
    userId: "1",
    imageUrl:
      "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    excerpt: "Exploring the future implications of AI technology",
    tags: ["AI", "Technology", "Future"],
    wordCount: 1200,
  },
  {
    id: "2",
    title: "Sustainable Living: A Complete Guide",
    content:
      "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula.",
    status: "draft",
    createdAt: "2023-06-02T09:15:00Z",
    updatedAt: "2023-06-03T11:40:00Z",
    userId: "1",
    imageUrl:
      "https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    excerpt: "Practical tips for sustainable living in the modern world",
    tags: ["Sustainability", "Lifestyle", "Environment"],
    wordCount: 1800,
  },
  {
    id: "3",
    title: "Mastering Remote Work: Tips and Strategies",
    content:
      "Curabitur aliquet quam id dui posuere blandit. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus.",
    status: "published",
    createdAt: "2023-06-10T15:45:00Z",
    updatedAt: "2023-06-12T08:30:00Z",
    userId: "1",
    imageUrl:
      "https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    excerpt: "Working remotely can be challenging, here's how to master it",
    tags: ["Remote Work", "Productivity", "Lifestyle"],
    wordCount: 1500,
  },
];

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

  fetchBlogs: async (queryParams) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(
        `${API_URL}/blogs?${queryParams.toString()}`,
        {
          headers: {
            ...getAuthHeader(),
          },
        }
      );

      if (response.data.success) {
        set({
          blogs: response.data.data,
          isLoading: false,
          error: null,
        });
        return response.data;
      } else {
        throw new Error(response.data.error || "Failed to fetch blogs");
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return null;
    }
  },

  fetchBlog: async (id) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/blogs/${id}`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      if (response.data.success) {
        set({
          currentBlog: response.data.data,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.data.error || "Blog not found");
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
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
    console.log("deleteBlog called with ID:", id);
    set({ isLoading: true });
    try {
      console.log("Sending delete request to:", `${API_URL}/blogs/${id}`);
      console.log("Auth headers:", getAuthHeader());

      const response = await axios.delete(`${API_URL}/blogs/${id}`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      console.log("Delete response:", response);

      if (response.data.success) {
        set((state) => {
          console.log("Updating state, removing blog with ID:", id);
          return {
            blogs: state.blogs.filter((blog) => blog._id !== id),
            isLoading: false,
            error: null,
          };
        });
      } else {
        throw new Error(response.data.error || "Failed to delete blog");
      }
    } catch (error) {
      console.error("Delete error in store:", error);
      set({
        error: error.message,
        isLoading: false,
      });
      throw error; // Re-throw to handle in component
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
