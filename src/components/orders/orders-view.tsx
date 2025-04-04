"use client"

import { Search, X, AlertTriangle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useOrdersStore } from "@/stores/ordersStore"
import type { Order } from "@/types/order"
import { Button } from "@/components/ui/button"
import OrderTable from "./orders-table"
import OrderCard from "./order-card"

const OrdersView = () => {
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const isDesktop = useMediaQuery("(min-width: 768px)")

    const { fetchOrders, orders, error } = useOrdersStore()
    const isLoading = orders.length === 0 && !error

    const handleClearSearch = () => {
        setSearchQuery("")
    }

    useEffect(() => {
        if (orders.length === 0) {
            fetchOrders()
        }
    }, [fetchOrders, orders.length])

    useEffect(() => {
        if (orders.length > 0) {
            if (searchQuery.trim() === "") {
                setFilteredOrders(orders)
            } else {
                const lowercaseQuery = searchQuery.toLowerCase()
                const filtered = orders.filter(
                    (order) =>
                        order.product_id.toLowerCase().includes(lowercaseQuery) ||
                        order.status.toLowerCase().includes(lowercaseQuery),
                )
                setFilteredOrders(filtered)
            }
        }
    }, [orders, searchQuery])

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
                    {searchQuery && (
                        <Button variant="outline" className="mt-4 cursor-pointer" onClick={handleClearSearch}>
                            Clear Search
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
                <Button variant="outline" onClick={() => fetchOrders()} disabled={isLoading} className="text-sm cursor-pointer">
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

            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle>Order Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by product ID or status..."
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
        </div>
    )
}

export default OrdersView

