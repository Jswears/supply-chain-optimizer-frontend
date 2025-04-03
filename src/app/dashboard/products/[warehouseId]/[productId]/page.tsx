import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import ProductDetail from "@/components/products/product-detail";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Product Details | ChainOPT",
    description: "Product details and inventory information",
}

const ProductPage = async ({ params }: {
    params: Promise<{ productId: string, warehouseId: string }>
}) => {
    const { productId, warehouseId } = await params;

    return (
        <DashboardLayout>
            <ProductDetail
                productId={productId}
                warehouseId={warehouseId}
                key={`${warehouseId}-${productId}`}
            />
        </DashboardLayout>
    );
}

export default ProductPage;