import { create } from "zustand";
import { usersApi } from "../utils/usersApi.js";
import useAuthStore from "./authStore";

const useUsersStore = create((set) => ({
  users: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  },

  fetchUsers: async ({ page = 1, limit = 10, search = "" } = {}) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const response = await usersApi.getUsers(token, { page, limit, search });

      set({
        users: response.data,
        pagination: response.pagination,
        isLoading: false,
        error: null,
      });
      return response;
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },
}));

export default useUsersStore;
