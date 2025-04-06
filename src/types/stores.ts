import { ForecastDataPoint, ForecastSummary, Product } from ".";

export interface ProductsStoreState {
  products: Product[];
  totalProductsCount: number;
  error: string | null;
  selectedProducts: Record<string, Product>;
  loadingProducts: Record<string, boolean>;
  isLoading?: boolean;
  fetchProducts: () => Promise<void>;
  fetchProductById: (
    productId: string,
    warehouseId: string
  ) => Promise<Product | null>;
  updateProductStock: (
    productId: string,
    warehouseId: string,
    quantityChange: number
  ) => Promise<Product | null>;
}

export interface ForecastStoreState {
  forecastsByProductId: Record<string, ForecastDataPoint[]>;
  loadingForecasts: Record<string, boolean>;
  forecastErrors: Record<string, string | null>;

  fetchForecastForProduct: (
    productId: string
  ) => Promise<ForecastDataPoint[] | null>;
}

export interface ForecastSummaryStoreState {
  summariesByProductId: Record<string, ForecastSummary>;
  loadingSummaries: Record<string, boolean>;
  summaryErrors: Record<string, string | null>;

  fetchForecastSummary: (
    productId: string,
    productName: string
  ) => Promise<ForecastSummary | null>;
}
