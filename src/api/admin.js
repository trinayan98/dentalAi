import axios from "axios";
import { API_BASE_URL } from "../config/constants";
import useAuthStore from "../stores/authStore";

export const fetchAdminLogs = async ({
  type = "all",
  startDate,
  endDate,
  page = 1,
  limit = 100,
  search,
}) => {
  const params = {
    type,
    startDate,
    endDate,
    page,
    limit,
    search,
  };

  // Remove undefined parameters
  Object.keys(params).forEach(
    (key) => params[key] === undefined && delete params[key]
  );

  const token = useAuthStore.getState().token;
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await axios.get(`${API_BASE_URL}/admin/logs`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return response.data;
};
