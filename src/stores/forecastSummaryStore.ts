import { create } from "zustand";
import { ForecastSummaryStoreState } from "@/types/stores";
import { api } from "@/lib/api";
import { ForecastSummary, ForecastSummaryResponse } from "@/types";

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
        console.log("FETCHING SUMMARY FOR PRODUCT ID:", productId);
        const response = await api.post<ForecastSummaryResponse>(
          `/predict/${productId}/summary`,
          { product_name: productName }
        );

        if (!response.success) {
          throw new Error(response.data.message);
        }

        const data = response.data.data;

        set((state) => ({
          summariesByProductId: {
            ...state.summariesByProductId,
            [productId]: data,
          },
          loadingSummaries: {
            ...state.loadingSummaries,
            [productId]: false,
          },
        }));

        return data;
      } catch (error) {
        set((state) => ({
          summaryErrors: {
            ...state.summaryErrors,
            [productId]: (error as Error).message,
          },
          loadingSummaries: {
            ...state.loadingSummaries,
            [productId]: false,
          },
        }));

        console.error("Error fetching summary:", error);
        return null as ForecastSummary | null;
      }
    },
  })
);
