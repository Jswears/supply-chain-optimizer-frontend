import { useAuthStore } from "@/stores/authStore";
import axios, { AxiosInstance } from "axios";

const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().user?.idToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  get: async <T = unknown>(url: string, params?: object): Promise<T> => {
    const response = await axiosClient.get<T>(url, { params });
    return response.data;
  },
  post: async <T = unknown>(url: string, data?: object): Promise<T> => {
    const response = await axiosClient.post<T>(url, data);
    return response.data;
  },
  put: async <T = unknown>(url: string, data?: object): Promise<T> => {
    const response = await axiosClient.put<T>(url, data);
    return response.data;
  },
  delete: async <T = unknown>(url: string): Promise<T> => {
    const response = await axiosClient.delete<T>(url);
    return response.data;
  },
};
