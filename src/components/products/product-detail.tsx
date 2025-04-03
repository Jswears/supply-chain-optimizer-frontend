'use client';

import { useProductsStore } from "@/stores/productsStore";
import { ProductDetailProps } from "@/types/components";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import ForecastTable from "../forecast/forecast-table";
import { SummaryCard } from "../forecast/summary-card";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";

const ProductDetail = ({ productId, warehouseId }: ProductDetailProps) => {
    const { fetchProductById, selectedProducts, loadingProducts, error } = useProductsStore();

    const key = `${productId}_${warehouseId}`;
    const product = selectedProducts[key];
    const loading = loadingProducts[key];

    const prevKey = useRef("");

    useEffect(() => {
        const currentKey = `${productId}_${warehouseId}`;
        if (productId && warehouseId && currentKey !== prevKey.current) {
            fetchProductById(productId, warehouseId);
            prevKey.current = currentKey;
        }
    }, [productId, warehouseId, fetchProductById]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    const isLowStock = (product?.stock_level ?? 0) < (product?.reorder_threshold ?? 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Button asChild variant="ghost" size="sm" className="h-8 px-2">
                            <Link href="/dashboard/products">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only sm:not-sr-only sm:ml-2">Back</span>
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        {product?.product_name ?? "Product"}
                        {isLowStock && <Badge variant="destructive">Low Stock</Badge>}
                    </h1>
                    <p className="text-muted-foreground">
                        {product?.category} • {product?.supplier}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Inventory Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm text-muted-foreground">Current Stock</dt>
                                <dd className="text-2xl font-bold">{product?.stock_level}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Reorder Threshold</dt>
                                <dd className="text-xl">{product?.reorder_threshold}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Status</dt>
                                <dd>
                                    {isLowStock ? (
                                        <Badge variant="destructive" className="mt-1">
                                            Reorder Needed
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="mt-1">
                                            Sufficient Stock
                                        </Badge>
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Supplier</dt>
                                <dd>{product?.supplier}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Warehouse</dt>
                                <dd>{product?.warehouse_id}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="forecast" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 gap-x-4 bg-gray-100 rounded-md p-1">
                            <TabsTrigger
                                value="forecast"
                                className="py-2 px-4 text-sm font-medium text-gray-700 bg-charcoal/10 hover:charcoal/40 cursor-pointer rounded-md hover:bg-gray-200 "
                            >
                                Forecast
                            </TabsTrigger>
                            <TabsTrigger
                                value="summary"
                                className="py-2 px-4 text-sm font-medium text-gray-700 bg-charcoal/10 hover:charcoal/40 cursor-pointer rounded-md hover:bg-gray-200 "
                            >
                                AI Summary
                            </TabsTrigger>
                        </TabsList>
                        <ForecastTable productId={productId} productName={product?.product_name} />
                        <SummaryCard productId={productId} productName={product?.product_name} />
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
