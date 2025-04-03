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
      set((state) => ({
        forecastErrors: {
          ...state.forecastErrors,
          [productId]: (error as Error).message,
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
