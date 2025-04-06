export interface Order {
  order_id: string;
  product_id: string;
  supplier: string;
  product_name: string;
  quantity: number;
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
  created_at: string;
  warehouse_id?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  timestamp: string;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
  timestamp: string;
}

export interface CreateOrderRequest {
  product_id: string;
  warehouse_id: string;
  quantity: number;
  product_name?: string;
  supplier?: string;
}

export interface UpdateOrderRequest {
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
  warehouse_id: string;
}

export interface OrdersStoreState {
  orders: Order[];
  totalOrdersCount: number;
  error: string | null;
  selectedOrders: Record<string, Order>;
  loadingOrders: Record<string, boolean>;
  isLoading: boolean;
  ordersLoaded: boolean;
  fetchOrders: () => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<Order | null>;
  updateOrder: (
    orderId: string,
    updateData: UpdateOrderRequest
  ) => Promise<Order | null>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  createOrder: (orderData: CreateOrderRequest) => Promise<Order | null>;
}
