import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import ProductDetail from "@/components/products/product-detail";
import { useProductsStore } from "@/stores/productsStore";
import type { Metadata } from 'next'


const fetchProductById = useProductsStore.getState().fetchProductById;

type Props = {
    params: Promise<{ productId: string, warehouseId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
    params }: Props,
): Promise<Metadata> {
    const { productId, warehouseId } = await params;

    const product = await fetchProductById(productId, warehouseId);
    const title = product?.product_name ?? "Product";
    const description = `Product details for ${title}`;
    return {
        title: `${title} | ChainOPT Inventory Dashboard`,
        description: description,
    }
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