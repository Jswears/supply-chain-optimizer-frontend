import { create } from "zustand";
import { api } from "../lib/api";
import { ForecastStoreState } from "@/types/stores";
import { ForecastDataPointResponse } from "@/types";

export const useForecastStore = create<ForecastStoreState>((set, get) => ({
  forecastsByProductId: {},
  loadingForecasts: {},
  forecastErrors: {},

  fetchForecastForProduct: async (productId: string) => {
    if (!productId) return null;

    const cached = get().forecastsByProductId[productId];
    if (cached) return cached;

    set((state) => ({
      loadingForecasts: { ...state.loadingForecasts, [productId]: true },
      forecastErrors: { ...state.forecastErrors, [productId]: null },
    }));

    try {
      const response = await api.get<ForecastDataPointResponse>(
        `/predict/${productId}`
      );

      if (!response.success) {
        throw new Error(response.data.message || "Failed to fetch forecast");
      }

      const data = response.data;

      set((state) => ({
        forecastsByProductId: {
          ...state.forecastsByProductId,
          [productId]: data.data,
        },
        loadingForecasts: {
          ...state.loadingForecasts,
          [productId]: false,
        },
      }));

      return data.data;
    } catch (error) {
      const errorMessage =
        (error as Error).message || "An error occurred while fetching forecast";

      set((state) => ({
        forecastErrors: {
          ...state.forecastErrors,
          [productId]: errorMessage,
        },
        loadingForecasts: {
          ...state.loadingForecasts,
          [productId]: false,
        },
      }));

      console.error("Error fetching forecast:", error);
      return null;
    }
  },
}));
