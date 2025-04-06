"use client"

import { Search, X, AlertTriangle, RefreshCw, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useOrdersStore } from "@/stores/ordersStore"
import { useProductsStore } from "@/stores/productsStore"
import type { Order, CreateOrderRequest } from "@/types/order"
import { Button } from "@/components/ui/button"
import OrderTable from "./orders-table"
import OrderCard from "./order-card"
import { CreateOrderDialog } from "./create-order-dialog"
import { toast } from "sonner"

const OrdersView = () => {
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    const { fetchOrders, createOrder, orders, error, isLoading, ordersLoaded } = useOrdersStore()
    const { fetchProducts, products } = useProductsStore()

    // Default warehouse ID
    const warehouseId = "warehouse_main_01"

    const handleClearSearch = () => {
        setSearchQuery("")
    }

    // Fetch orders when component mounts
    useEffect(() => {
        if (!ordersLoaded) {
            fetchOrders()
        }
    }, [fetchOrders, ordersLoaded])

    // Fetch products when component mounts
    useEffect(() => {
        if (products.length === 0) {
            fetchProducts()
        }
    }, [fetchProducts, products.length])

    // Apply search filter
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredOrders(orders)
        } else {
            const lowercaseQuery = searchQuery.toLowerCase()
            const filtered = orders.filter(
                (order) =>
                    order.product_id.toLowerCase().includes(lowercaseQuery) ||
                    order.status.toLowerCase().includes(lowercaseQuery) ||
                    (order.product_name && order.product_name.toLowerCase().includes(lowercaseQuery)),
            )
            setFilteredOrders(filtered)
        }
    }, [orders, searchQuery])

    // Handle creating a new order
    const handleCreateOrder = async (orderData: CreateOrderRequest) => {
        try {
            // Find the selected product to get its name and supplier
            const selectedProduct = products.find(product => product.product_id === orderData.product_id)

            if (!selectedProduct) {
                throw new Error("Selected product not found")
            }

            // Create the complete order request data
            const completeOrderData: CreateOrderRequest = {
                ...orderData,
                product_name: selectedProduct.product_name,
                supplier: selectedProduct.supplier,
            }

            // Submit the order
            const newOrder = await createOrder(completeOrderData)

            if (newOrder) {
                toast.success("Order created successfully")
                return
            } else {
                throw new Error("Failed to create order")
            }
        } catch (error) {
            console.error("Error creating order:", error)
            toast.error((error as Error).message || "Failed to create order")
            return
        }
    }

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            )
        }

        if (error) {
            return (
                <div className="flex flex-col justify-center items-center h-64 text-red-500 gap-2">
                    <AlertTriangle className="h-8 w-8" />
                    <p>{error}</p>
                    <Button variant="outline" className="mt-2" onClick={() => fetchOrders()}>
                        Retry
                    </Button>
                </div>
            )
        }

        if (filteredOrders.length === 0) {
            return (
                <div className="flex flex-col justify-center items-center h-64 text-muted-foreground">
                    <p>No orders found{searchQuery ? " matching your search" : ""}.</p>
                    {searchQuery ? (
                        <Button variant="outline" className="mt-4 cursor-pointer" onClick={handleClearSearch}>
                            Clear Search
                        </Button>
                    ) : (
                        <Button variant="outline" className="mt-4 cursor-pointer" onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Order
                        </Button>
                    )}
                </div>
            )
        }

        return isDesktop ? (
            <OrderTable orders={filteredOrders} />
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredOrders.map((order) => (
                    <OrderCard key={order.order_id} order={order} />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <div className="flex gap-2">
                    <Button
                        variant="default"
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="text-sm cursor-pointer"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Order
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => fetchOrders()}
                        disabled={isLoading}
                        className="text-sm cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Refresh Data"
                        )}
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle>Order Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by product ID, name, or status..."
                            className="pl-10 pr-10 transition-all focus-visible:ring-1"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                                onClick={handleClearSearch}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Clear search</span>
                            </Button>
                        )}
                    </div>

                    {renderContent()}
                </CardContent>
            </Card>

            <CreateOrderDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                products={products}
                onSubmit={handleCreateOrder}
                warehouseId={warehouseId}
            />
        </div>
    )
}

export default OrdersView

