import type { Order } from "@/types/order"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface OrderTableProps {
    orders: Order[]
}

const OrderTable = ({ orders }: OrderTableProps) => {

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "Pending":
                return "outline"
            case "Processing":
                return "secondary"
            case "Completed":
                return "secondary"
            case "Cancelled":
                return "destructive"
            default:
                return "outline"
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                                No orders found
                            </TableCell>
                        </TableRow>
                    ) : (
                        orders.map((order) => (
                            <TableRow key={order.order_id}>
                                <TableCell className="font-medium">
                                    <Link href={`/dashboard/orders/${order.order_id}`} className="text-primary hover:underline">
                                        {order.order_id.substring(0, 8)}...
                                    </Link>
                                </TableCell>
                                <TableCell>{order.product_name}</TableCell>
                                <TableCell>{order.supplier}</TableCell>
                                <TableCell>{order.quantity}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                                </TableCell>
                                <TableCell>{formatDate(order.created_at)}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export default OrderTable

