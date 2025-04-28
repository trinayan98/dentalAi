import { create } from "zustand";

// Mock user data for demonstration
const MOCK_USER = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  avatar:
    "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  createdAt: new Date().toISOString(),
};

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo purposes, any login works
    if (email && password) {
      set({
        user: MOCK_USER,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
      throw new Error("Invalid credentials");
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (name && email && password) {
      const newUser = { ...MOCK_USER, name, email };
      set({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
      throw new Error("All fields are required");
    }
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  resetPassword: async (email) => {
    set({ isLoading: true });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    set({ isLoading: false });
    // In a real app, this would send a reset link via email
  },

  setNewPassword: async (password, token) => {
    set({ isLoading: true });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    set({ isLoading: false });
    // In a real app, this would validate the token and update the password
  },

  verifyEmail: async (token) => {
    set({ isLoading: true });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    set({ isLoading: false });
    // In a real app, this would verify the email token
  },
}));
