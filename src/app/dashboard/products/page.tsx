import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import ProductsView from "@/components/products/products-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Products | ChainOPT Inventory Dashboard",
    description: "AI-powered supply chain optimization system for bakeries",
}

const Products = () => {
    return (
        <DashboardLayout>
            <ProductsView />
        </DashboardLayout>
    );
}

export default Products;