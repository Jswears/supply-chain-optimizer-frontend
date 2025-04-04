import type { Order } from "@/types/order"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface OrderCardProps {
    order: Order
}

const OrderCard = ({ order }: OrderCardProps) => {
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
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-lg font-semibold text-primary hover:underline">{order.order_id.substring(0, 8)}...</p>
                        <p className="text-sm text-muted-foreground mt-1">{order.product_id}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="font-medium">{order.quantity}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="font-medium">{formatDate(order.created_at)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default OrderCard

