import { create } from "zustand";
import axios from "axios";
import useAuthStore from "./authStore";
import { API_BASE_URL } from "../config/constants";

const API_URL = API_BASE_URL;

// Helper function to get auth header
const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useTranscribeStore = create((set, get) => ({
  transcriptions: [],
  currentTranscription: null,
  isLoading: false,
  error: null,

  fetchTranscriptions: async (queryParams = new URLSearchParams()) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/transcribe`, {
        params: {
          page: queryParams.get("page") || 1,
          limit: queryParams.get("limit") || 10,
          status: queryParams.get("status"),
          search: queryParams.get("search"),
        },
        headers: getAuthHeader(),
      });

      if (response.data.success) {
        set({
          transcriptions: response.data.data,
          isLoading: false,
          error: null,
        });
        return response.data;
      } else {
        throw new Error(
          response.data.error || "Failed to fetch transcriptions"
        );
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      console.error("Error fetching transcriptions:", error);
      throw error;
    }
  },

  fetchTranscription: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/transcribe/${id}`, {
        headers: getAuthHeader(),
      });

      if (response.data.success) {
        set({
          currentTranscription: response.data.data,
          isLoading: false,
          error: null,
        });
        return response.data.data;
      } else {
        // throw new Error(response.data.error || "Transcription not found");
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  createTranscription: async (transcriptionData) => {
    set({ isLoading: true });
    try {
      const formData = new FormData();

      // Handle audio file upload
      if (transcriptionData.audioFile) {
        formData.append("audioFile", transcriptionData.audioFile);
      }

      // Add other transcription data
      Object.keys(transcriptionData).forEach((key) => {
        if (key !== "audioFile") {
          formData.append(key, transcriptionData[key]);
        }
      });

      const response = await axios.post(`${API_URL}/transcribe`, formData, {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        set((state) => ({
          transcriptions: [...state.transcriptions, response.data.data],
          currentTranscription: response.data.data,
          isLoading: false,
          error: null,
        }));
      } else {
        throw new Error(
          response.data.error || "Failed to create transcription"
        );
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  updateTranscription: async (id, transcriptionData) => {
    set({ isLoading: true });
    try {
      const response = await axios.put(
        `${API_URL}/transcribe/${id}`,
        transcriptionData,
        {
          headers: getAuthHeader(),
        }
      );

      if (response.data.success) {
        set((state) => ({
          transcriptions: state.transcriptions.map((transcription) =>
            transcription._id === id ? response.data.data : transcription
          ),
          currentTranscription: response.data.data,
          isLoading: false,
          error: null,
        }));
      } else {
        throw new Error(
          response.data.error || "Failed to update transcription"
        );
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  deleteTranscription: async (id) => {
    set({ isLoading: true });
    try {
      await axios.delete(`${API_URL}/transcribe/${id}`, {
        headers: getAuthHeader(),
      });
      set((state) => ({
        transcriptions: state.transcriptions.filter(
          (transcription) => transcription._id !== id
        ),
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
}));
