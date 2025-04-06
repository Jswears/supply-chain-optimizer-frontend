'use client';
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useOrdersStore } from "@/stores/ordersStore";
import { useProductsStore } from "@/stores/productsStore";

interface OrderDetailProps {
    orderId: string;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
    const router = useRouter();
    const [newStatus, setNewStatus] = useState<string>("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [warehouseId, setWarehouseId] = useState<string>("warehouse_main_01");

    const { fetchOrderById, updateOrder, deleteOrder, selectedOrders, loadingOrders, error } = useOrdersStore();
    const { fetchProductById, selectedProducts } = useProductsStore();

    // Get the order from the store
    const order = selectedOrders[orderId];
    const loading = loadingOrders[orderId];

    // Fetch order data when component mounts
    useEffect(() => {
        fetchOrderById(orderId);
    }, [orderId, fetchOrderById]);

    // Set warehouse ID and status when order changes
    useEffect(() => {
        if (order) {
            if (order.warehouse_id) {
                setWarehouseId(order.warehouse_id);
            }
            setNewStatus(order.status);
        }
    }, [order]);

    // Fetch product data when we have order details
    useEffect(() => {
        if (order?.product_id) {
            const productKey = `${order.product_id}_${warehouseId}`;
            if (!selectedProducts[productKey]) {
                fetchProductById(order.product_id, warehouseId);
            }
        }
    }, [order?.product_id, warehouseId, selectedProducts, fetchProductById]);

    // Get product using the warehouse ID
    const productKey = order?.product_id ? `${order.product_id}_${warehouseId}` : "";
    const product = selectedProducts[productKey];

    const handleUpdateStatus = async () => {
        if (!order || newStatus === order.status) return;

        setIsUpdating(true);
        try {
            const updatedOrder = await updateOrder(orderId, {
                status: newStatus as "Pending" | "Processing" | "Completed" | "Cancelled",
                warehouse_id: warehouseId
            });

            if (updatedOrder) {
                toast.success("Order status updated successfully");
            } else {
                throw new Error("Failed to update order status");
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Failed to update order status. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteOrder = async () => {
        try {
            const success = await deleteOrder(orderId);

            if (success) {
                toast.success("Order deleted successfully");
                router.push("/dashboard/orders");
            } else {
                throw new Error("Failed to delete order");
            }
        } catch (error) {
            console.error("Error deleting order:", error);
            toast.error("Failed to delete order. Please try again.");
            setIsDeleteDialogOpen(false);
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "N/A";

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (e) {
            console.error("Invalid date format:", dateString, e);
            return "Invalid date";
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "Pending":
                return "outline";
            case "Processing":
                return "secondary";
            case "Completed":
                return "secondary";
            case "Cancelled":
                return "destructive";
            default:
                return "outline";
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Error Loading Order</h2>
                <p className="mb-6">{error}</p>
                <Button asChild>
                    <Link href="/dashboard/orders">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Orders
                    </Link>
                </Button>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
                <p className="mb-6">The order you&#39;re looking for doesn&#39;t exist or has been removed.</p>
                <Button asChild>
                    <Link href="/dashboard/orders">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Orders
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Button asChild variant="ghost" size="sm" className="h-8 px-2">
                            <Link href="/dashboard/orders">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only sm:not-sr-only sm:ml-2">Back</span>
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        Order #{order.order_id.substring(0, 8)}...
                        <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                    </h1>
                    <p className="text-muted-foreground">Created on {formatDate(order.created_at)}</p>
                </div>
                <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                    onClick={() => setIsDeleteDialogOpen(true)}
                >
                    <Trash className="h-4 w-4" />
                    Delete Order
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm text-muted-foreground">Order ID</dt>
                                <dd className="font-medium">{order.order_id}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Product Name</dt>
                                <dd className="font-medium">{order.product_name || "N/A"}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Quantity</dt>
                                <dd className="text-2xl font-bold">{order.quantity}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Supplier</dt>
                                <dd>{order.supplier || "N/A"}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Created</dt>
                                <dd>{formatDate(order.created_at)}</dd>
                            </div>
                            <div className="pt-2">
                                <dt className="text-sm text-muted-foreground mb-2">Status</dt>
                                <div className="flex items-center gap-4">
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Processing">Processing</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        onClick={handleUpdateStatus}
                                        disabled={isUpdating || newStatus === order.status}
                                        className="flex items-center gap-2"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            "Update Status"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Product Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {product ? (
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm text-muted-foreground">Product Name</dt>
                                    <dd className="text-xl font-bold">{product.product_name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">Category</dt>
                                    <dd>{product.category}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">Supplier</dt>
                                    <dd>{product.supplier}</dd>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <dt className="text-sm text-muted-foreground">Current Stock</dt>
                                        <dd className="font-medium">{product.stock_level}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-muted-foreground">Reorder Threshold</dt>
                                        <dd className="font-medium">{product.reorder_threshold}</dd>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <Button asChild variant="outline">
                                        <Link href={`/dashboard/products/${product.warehouse_id}/${product.product_id}`}>
                                            View Product Details
                                        </Link>
                                    </Button>
                                </div>
                            </dl>
                        ) : (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the order and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteOrder}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}