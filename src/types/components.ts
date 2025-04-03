export interface ProductDetailProps {
  productId: string;
  warehouseId: string;
}

export interface ProductTableProps {
  products: Product[];
}

export interface ProductCardProps {
  product: Product;
}

export interface ForecastTableProps {
  productId: string;
  productName?: string;
}

export interface ForecastChartProps {
  data: ForecastDataPoint[];
}

export interface SummaryCardProps {
  productId: string;
  productName?: string;
}

import { Product, ForecastDataPoint } from "./index";
