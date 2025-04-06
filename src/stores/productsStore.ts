import { api } from "../lib/api";
import { ProductsStoreState } from "../types/stores";
import { Product, ProductsResponse, SingleProductResponse } from "../types";
import { create } from "zustand";

type ProductKey = `${string}_${string}`; // productId_warehouseId

export const useProductsStore = create<ProductsStoreState>((set, get) => ({
  products: [],
  totalProductsCount: 0,
  error: null,
  selectedProducts: {},
  loadingProducts: {},
  isLoading: false,

  fetchProducts: async () => {
    set({ error: null });
    try {
      set((state) => ({ ...state, isLoading: true }));
      const warehouseId = "warehouse_main_01";
      const response = await api.get<ProductsResponse>(
        `/warehouses/${warehouseId}/products`
      );

      if (!response.success) {
        throw new Error(response.data.message || "Failed to fetch products");
      }

      set({
        products: response.data.data,
        totalProductsCount: response.data.data.length,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      set({
        error:
          (error as Error).message ||
          "An error occurred while fetching products",
        isLoading: false,
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
      error: null, // Reset error when starting a new fetch
    }));

    try {
      const url = `/products/${productId}?warehouseId=${warehouseId}`;
      const response = await api.get<SingleProductResponse>(url);

      if (!response.success) {
        throw new Error(
          response.data.message || "Failed to fetch product details"
        );
      }

      const product = response.data.data;

      set((state) => ({
        selectedProducts: { ...state.selectedProducts, [key]: product },
        loadingProducts: { ...state.loadingProducts, [key]: false },
      }));

      return product;
    } catch (error) {
      const errorMessage =
        (error as Error).message ||
        "An error occurred while fetching product details";
      console.error("Error fetching product:", error);

      set((state) => ({
        loadingProducts: { ...state.loadingProducts, [key]: false },
        error: errorMessage,
      }));

      return null;
    }
  },

  // New method to update product stock when an order is completed
  updateProductStock: async (
    productId: string,
    warehouseId: string,
    quantityChange: number
  ) => {
    if (!productId || !warehouseId) {
      set({ error: "Product ID and Warehouse ID are required" });
      return null;
    }

    const key: ProductKey = `${productId}_${warehouseId}`;

    try {
      // First, get the latest product data
      const currentProduct =
        get().selectedProducts[key] ||
        (await get().fetchProductById(productId, warehouseId));

      if (!currentProduct) {
        throw new Error("Failed to find product");
      }

      // Calculate the new stock level
      const newStockLevel = currentProduct.stock_level + quantityChange;

      // Update the backend with the new stock level using the correct endpoint format
      // with query parameter for warehouseId
      const response = await api.put<SingleProductResponse>(
        `/products/${productId}?warehouseId=${warehouseId}`,
        { stock_level: newStockLevel }
      );

      if (!response.success) {
        throw new Error(
          response.data?.message || "Failed to update product stock in backend"
        );
      }

      // If backend update was successful, create the updated product object
      const updatedProduct: Product = {
        ...currentProduct,
        stock_level: newStockLevel,
      };

      // Update both the selected product and the product in the list if it exists
      set((state) => {
        // Update in the products list
        const updatedProducts = state.products.map((product) =>
          product.product_id === productId ? updatedProduct : product
        );

        return {
          products: updatedProducts,
          selectedProducts: {
            ...state.selectedProducts,
            [key]: updatedProduct,
          },
        };
      });

      return updatedProduct;
    } catch (error) {
      console.error("Error updating product stock:", error);
      set({
        error:
          (error as Error).message ||
          "An error occurred while updating product stock",
      });
      return null;
    }
  },
}));
