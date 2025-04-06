import { api } from "@/lib/api";
import {
  CreateOrderRequest,
  OrderResponse,
  OrdersResponse,
  OrdersStoreState,
  UpdateOrderRequest,
} from "@/types/order";
import { create } from "zustand";

export const useOrdersStore = create<OrdersStoreState>((set, get) => ({
  orders: [],
  totalOrdersCount: 0,
  error: null,
  selectedOrders: {},
  loadingOrders: {},
  isLoading: false,
  ordersLoaded: false, // Add this flag to track if orders have been loaded

  fetchOrders: async () => {
    set({ error: null, isLoading: true, ordersLoaded: false });
    try {
      const response = await api.get<OrdersResponse>(`/orders`);

      if (!response.success) {
        throw new Error("Failed to fetch orders");
      }

      // Process and store order data
      set({
        orders: response.data,
        totalOrdersCount: response.data.length,
        isLoading: false,
        ordersLoaded: true, // Mark orders as loaded, even if the array is empty
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      set({
        error:
          (error as Error).message || "An error occurred while fetching orders",
        isLoading: false,
        ordersLoaded: true, // Mark as loaded even on error
      });
    }
  },

  fetchOrderById: async (orderId: string) => {
    if (!orderId) {
      set({ error: "Order ID is required" });
      return null;
    }

    set((state) => ({
      loadingOrders: { ...state.loadingOrders, [orderId]: true },
      error: null,
    }));

    try {
      const response = await api.get<OrderResponse>(`/orders/${orderId}`);

      if (!response.success) {
        throw new Error("Failed to fetch order");
      }

      // Store the order data
      set((state) => {
        // Update existing order in the orders list if it exists
        let updatedOrdersList = [...state.orders];
        const orderIndex = updatedOrdersList.findIndex(
          (o) => o.order_id === orderId
        );

        if (orderIndex >= 0) {
          updatedOrdersList[orderIndex] = response.data;
        } else {
          // Add to orders list if not already there
          updatedOrdersList = [response.data, ...updatedOrdersList];
        }

        return {
          selectedOrders: {
            ...state.selectedOrders,
            [orderId]: response.data,
          },
          orders: updatedOrdersList,
          loadingOrders: { ...state.loadingOrders, [orderId]: false },
        };
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      set((state) => ({
        error:
          (error as Error).message || "An error occurred while fetching order",
        loadingOrders: { ...state.loadingOrders, [orderId]: false },
      }));
      return null;
    }
  },

  updateOrder: async (orderId: string, updateData: UpdateOrderRequest) => {
    if (!orderId) {
      set({ error: "Order ID is required" });
      return null;
    }

    set((state) => ({
      loadingOrders: { ...state.loadingOrders, [orderId]: true },
      error: null,
    }));

    try {
      // Get the current order before updating to check for status change
      let currentOrder = get().selectedOrders[orderId];
      if (!currentOrder) {
        await get().fetchOrderById(orderId);
        // Try again after fetching
        currentOrder = get().selectedOrders[orderId];
        if (!currentOrder) {
          throw new Error("Failed to find order");
        }
      }

      // Make the API call to update the order
      const updateResponse = await api.put<{
        success: boolean;
        data: { message: string; order_id: string };
      }>(`/orders/${orderId}`, updateData);

      if (!updateResponse.success) {
        throw new Error("Failed to update order");
      }

      // After successful update, fetch the latest order data
      const refreshedOrder = await get().fetchOrderById(orderId);

      if (!refreshedOrder) {
        throw new Error("Failed to refresh order data after update");
      }

      // Check if the order status has changed to "Completed"
      const { useProductsStore } = await import("@/stores/productsStore");

      // If the order status is changing to "Completed", update product stock
      if (
        updateData.status === "Completed" &&
        currentOrder.status !== "Completed"
      ) {
        try {
          // Order completion should add to product stock
          await useProductsStore.getState().updateProductStock(
            refreshedOrder.product_id,
            updateData.warehouse_id,
            refreshedOrder.quantity // Add the ordered quantity to stock
          );
        } catch (stockError) {
          console.error("Error updating product stock:", stockError);
          // We don't throw here since the order update was still successful
        }
      }

      return refreshedOrder;
    } catch (error) {
      console.error("Error updating order:", error);
      set((state) => ({
        error:
          (error as Error).message || "An error occurred while updating order",
        loadingOrders: { ...state.loadingOrders, [orderId]: false },
      }));
      return null;
    }
  },

  deleteOrder: async (orderId: string) => {
    if (!orderId) {
      set({ error: "Order ID is required" });
      return false;
    }

    set((state) => ({
      loadingOrders: { ...state.loadingOrders, [orderId]: true },
      error: null,
    }));

    try {
      const response = await api.delete<{ success: boolean }>(
        `/orders/${orderId}`
      );

      if (!response.success) {
        throw new Error("Failed to delete order");
      }

      // Remove the order from both the list and selected orders
      set((state) => {
        const { [orderId]: removedOrder, ...remainingSelectedOrders } =
          state.selectedOrders;

        return {
          orders: state.orders.filter((order) => order.order_id !== orderId),
          selectedOrders: remainingSelectedOrders,
          loadingOrders: { ...state.loadingOrders, [orderId]: false },
          totalOrdersCount: state.totalOrdersCount - 1,
        };
      });

      return true;
    } catch (error) {
      console.error("Error deleting order:", error);
      set((state) => ({
        error:
          (error as Error).message || "An error occurred while deleting order",
        loadingOrders: { ...state.loadingOrders, [orderId]: false },
      }));
      return false;
    }
  },

  createOrder: async (orderData: CreateOrderRequest) => {
    set({ error: null, isLoading: true });

    try {
      // Convert the input format to match the required API format
      const apiOrderData = {
        product_id: orderData.product_id,
        warehouse_id: orderData.warehouse_id,
        quantity: orderData.quantity,
        // Add the missing fields if they're not already in the CreateOrderRequest
        product_name: orderData.product_name,
        supplier: orderData.supplier,
      };

      const response = await api.post<OrderResponse>("/orders", apiOrderData);

      if (!response.success) {
        throw new Error("Failed to create order");
      }

      // Create a properly structured order object from the response and input data
      // This ensures we have all fields needed for display
      const newOrder = {
        order_id: response.data.order_id,
        product_id: orderData.product_id,
        product_name: orderData.product_name || "",
        supplier: orderData.supplier || "",
        quantity: orderData.quantity,
        status: "Pending" as const, // Default status for new orders
        created_at: new Date().toISOString(),
        warehouse_id: orderData.warehouse_id,
      };

      // Add the new order to the list and selected orders
      set((state) => ({
        orders: [newOrder, ...state.orders],
        selectedOrders: {
          ...state.selectedOrders,
          [newOrder.order_id]: newOrder,
        },
        totalOrdersCount: state.totalOrdersCount + 1,
        isLoading: false,
      }));

      return newOrder;
    } catch (error) {
      console.error("Error creating order:", error);
      set({
        error:
          (error as Error).message || "An error occurred while creating order",
        isLoading: false,
      });
      return null;
    }
  },
}));
