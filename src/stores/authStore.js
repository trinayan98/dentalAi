import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../utils/api";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      updateUser: (userData) => {
        set((state) => ({
          ...state,
          user: { ...state.user, ...userData },
        }));
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          localStorage.setItem("token", response.token);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (username, email, password) => {
        set({ isLoading: true });
        try {
          const userData = {
            username,
            email,
            password,
          };

          const response = await authApi.register(userData);
          localStorage.setItem("token", response.token);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      resetPassword: async (email) => {
        set({ isLoading: true });
        try {
          await authApi.resetPassword(email);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setNewPassword: async (password, token) => {
        set({ isLoading: true });
        try {
          await authApi.setNewPassword(password, token);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      verifyEmail: async (token) => {
        set({ isLoading: true });
        try {
          await authApi.verifyEmail(token);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setAuth: (user, token) => {
        localStorage.setItem("token", token);
        set({ user, token, isAuthenticated: true });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state && state.token) {
          localStorage.setItem("token", state.token);
        }
      },
    }
  )
);

export default useAuthStore;
