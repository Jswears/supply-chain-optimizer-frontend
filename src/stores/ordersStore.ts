import { api } from "@/lib/api";
import { OrderResponse, OrdersResponse, OrdersStoreState } from "@/types/order";
import { create } from "zustand";


export const useOrdersStore = create<OrdersStoreState>((set, get) => ({
    orders: [],
    totalOrdersCount: 0,
    error: null,
    selectedOrders: {},
    loadingOrders: {},
    
    fetchOrders: async () => {
        set({ error: null });
        try {
        set((state) => ({ ...state, isLoading: true }));
        const response = await api.get<OrdersResponse>(`/orders`);
    
        if (!response.success) {
            throw new Error("Failed to fetch orders");
        }
        set({
            orders: response.data,
            totalOrdersCount: response.data.length,
            isLoading: false,
        });
        } catch (error) {
        console.error("Error fetching orders:", error);
        set({
            error:
            (error as Error).message || "An error occurred while fetching orders",
            isLoading: false,
        });
        }
    },
    fetchOrderById: async (orderId: string) => {
        if (!orderId) {
            set({
                error: "Order ID is required",
            });
            return null;
        }

        const existing = get().selectedOrders[orderId];
        if (existing) return existing;

        // Set loading for this specific order
        set((state) => ({
            loadingOrders: { ...state.loadingOrders, [orderId]: true },
            error: null, // Reset error when starting a new fetch
        }));

        try {
            const response = await api.get<OrderResponse>(`/orders/${orderId}`);

            if (!response.success) {
                throw new Error("Failed to fetch order");
            }

            set((state) => ({
                selectedOrders: {
                    ...state.selectedOrders,
                    [orderId]: response.data,
                },
                loadingOrders: { ...state.loadingOrders, [orderId]: false },
            }));
            return response.data;
        } catch (error) {
            console.error("Error fetching order:", error);
            set((state) => ({
                error:
                    (error as Error).message ||
                    "An error occurred while fetching order",
                loadingOrders: { ...state.loadingOrders, [orderId]: false },
            }));
            return null;
        }
    }
}));