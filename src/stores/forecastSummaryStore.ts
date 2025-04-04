import { create } from "zustand";
import { ForecastSummaryStoreState } from "@/types/stores";
import { api } from "@/lib/api";
import { ForecastSummaryResponse } from "@/types";

export const useForecastSummaryStore = create<ForecastSummaryStoreState>(
  (set, get) => ({
    summariesByProductId: {},
    loadingSummaries: {},
    summaryErrors: {},

    fetchForecastSummary: async (productId: string, productName: string) => {
      if (!productId || !productName) return null;

      const existing = get().summariesByProductId[productId];
      if (existing) return existing;

      set((state) => ({
        loadingSummaries: { ...state.loadingSummaries, [productId]: true },
        summaryErrors: { ...state.summaryErrors, [productId]: null },
      }));

      try {
        const response = await api.post<ForecastSummaryResponse>(
          `/predict/${productId}/summary`,
          { product_name: productName }
        );

        if (!response.success) {
          throw new Error(response.data.message || "Failed to fetch summary");
        }

        const data = response.data.data;

        set((state) => ({
          summariesByProductId: {
            ...state.summariesByProductId,
            [productId]: {
              ...data,
              text: data.text,
              trend: data.trend,
              alert: data.alert,
            },
          },
          loadingSummaries: {
            ...state.loadingSummaries,
            [productId]: false,
          },
        }));

        return data;
      } catch (error) {
        const errorMessage =
          (error as Error).message ||
          "An error occurred while fetching summary";

        set((state) => ({
          summaryErrors: {
            ...state.summaryErrors,
            [productId]: errorMessage,
          },
          loadingSummaries: {
            ...state.loadingSummaries,
            [productId]: false,
          },
        }));

        console.error("Error fetching summary:", error);
        return null;
      }
    },
  })
);
