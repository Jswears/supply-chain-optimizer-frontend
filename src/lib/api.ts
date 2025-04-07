import { useAuthStore } from "@/stores/authStore";
import axios, { AxiosInstance } from "axios";

const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track authentication initialization
let authInitialized = false;
let authInitializationPromise: Promise<void> | null = null;

// Function to ensure auth is initialized before making requests
const ensureAuthInitialized = async () => {
  if (authInitialized) return;

  if (!authInitializationPromise) {
    authInitializationPromise = new Promise<void>((resolve) => {
      const authStore = useAuthStore.getState();

      // If we already have a token, we're good to go
      if (authStore.user?.idToken) {
        authInitialized = true;
        resolve();
        return;
      }

      // Otherwise, fetch the current user and wait for the result
      authStore
        .fetchCurrentUser()
        .then(() => {
          authInitialized = true;
          resolve();
        })
        .catch(() => {
          // Even if there's an error, we consider auth "initialized"
          authInitialized = true;
          resolve();
        });
    });
  }

  return authInitializationPromise;
};

// Add request interceptor with auth check
axiosClient.interceptors.request.use(async (config) => {
  // Ensure auth is initialized before proceeding with the request
  await ensureAuthInitialized();

  // Add the token if available (now it should be available if user is logged in)
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
