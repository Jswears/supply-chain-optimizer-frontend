export interface Order {
    order_id: string
    product_id: string
    quantity: number
    status: "Pending" | "Processing" | "Completed" | "Cancelled"
    created_at: string
    warehouse_id?: string
  }
  
  export interface OrdersResponse {
    success: boolean
    data: Order[]
    timestamp: string
  }
  
  export interface OrderResponse {
    success: boolean
    data: Order
    timestamp: string
  }
  
  export interface CreateOrderRequest {
    product_id: string
    warehouse_id: string
    quantity: number
  }
  
  export interface UpdateOrderRequest {
    status: "Pending" | "Processing" | "Completed" | "Cancelled"
    warehouse_id: string
  }
  
  
  export interface OrdersStoreState {
    orders: Order[];
    totalOrdersCount: number;
    error: string | null;
    selectedOrders: Record<string, Order>;
    loadingOrders: Record<string, boolean>;
    isLoading?: boolean;
    fetchOrders: () => Promise<void>;
    fetchOrderById: (
      productId: string,
    ) => Promise<Order | null>;
  }