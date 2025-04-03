import { api } from "../lib/api";
import { ProductsStoreState } from "../types/stores";
import { ProductsResponse, SingleProductResponse } from "../types";
import { create } from "zustand";

type ProductKey = `${string}_${string}`; // productId_warehouseId

export const useProductsStore = create<ProductsStoreState>((set, get) => ({
  products: [],
  totalProductsCount: 0,
  error: null,
  selectedProducts: {},
  loadingProducts: {},

  fetchProducts: async () => {
    set({ error: null });
    try {
      const warehouseId = "warehouse_main_01";
      const response = await api.get<ProductsResponse>(
        `/warehouses/${warehouseId}/products`
      );
      set({
        products: response.data.data,
        totalProductsCount: response.data.data.length,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
      });
    }
  },

  fetchProductById: async (productId: string, warehouseId: string) => {
    if (!productId || !warehouseId) {
      set({
        error: "Product ID and Warehouse ID are required",
      });
      return null;
    }

    const key: ProductKey = `${productId}_${warehouseId}`;

    const existing = get().selectedProducts[key];
    if (existing) return existing;

    // Set loading for this specific product
    set((state) => ({
      loadingProducts: { ...state.loadingProducts, [key]: true },
    }));

    try {
      const url = `/products/${productId}?warehouseId=${warehouseId}`;
      const response = await api.get<SingleProductResponse>(url);
      const product = response.data.data;

      set((state) => ({
        selectedProducts: { ...state.selectedProducts, [key]: product },
        loadingProducts: { ...state.loadingProducts, [key]: false },
      }));

      return product;
    } catch (error) {
      set((state) => ({
        loadingProducts: { ...state.loadingProducts, [key]: false },
        error: (error as Error).message,
      }));
      console.error("Error fetching product:", error);
      return null;
    }
  },
}));
