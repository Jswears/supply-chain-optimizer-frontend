import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { OrderDetail } from "@/components/orders/order-detail";
import { useOrdersStore } from "@/stores/ordersStore";
import type { Metadata } from 'next';

const fetchOrderById = useOrdersStore.getState().fetchOrderById;

type Props = {
    params: Promise<{ orderId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
    params
}: Props): Promise<Metadata> {
    const { orderId } = await params;

    const order = await fetchOrderById(orderId);
    const title = order ? `Order #${orderId.substring(0, 8)}` : "Order Details";
    const description = order ? `Order details for ${order.product_name}` : "Order details";

    return {
        title: `${title} | ChainOPT Supply Chain Dashboard`,
        description: description,
    }
}

export default async function OrderPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = await params;

    return (
        <DashboardLayout>
            <OrderDetail
                orderId={orderId}
                key={orderId}
            />
        </DashboardLayout>
    )
}