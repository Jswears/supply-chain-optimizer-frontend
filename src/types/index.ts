// Products Types
export interface Product {
  product_name: string;
  warehouse_id: string;
  stock_level: number;
  reorder_threshold: number;
  supplier: string;
  category: string;
  product_id: string;
  last_updated?: string;
}

export type ProductsResponse = {
  success: boolean;
  data: {
    message: string;
    data: Product[];
    pagination: null | {
      next_offset: object;
    };
  };
  timestamp: string;
};

export type SingleProductResponse = {
  success: boolean;
  data: {
    message: string;
    data: Product;
  };
  timestamp: string;
};

// Forecast Types
export interface ForecastDataPoint {
  date: string;
  predicted_value: number;
  lower_bound: number;
  upper_bound: number;
}
export interface ForecastDataPointResponse {
  success: boolean;
  data: {
    message: string;
    data: ForecastDataPoint[];
  };
  timestamp: string;
}

export interface ForecastSummary {
  product_id: string;
  text: string;
  trend: "low" | "stable" | "up";
  alert: boolean;
}

export interface ForecastSummaryResponse {
  success: boolean;
  data: {
    message: string;
    data: ForecastSummary;
  };
  timestamp: string;
}
