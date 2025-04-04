'use client';
import { useEffect, useState, useMemo } from "react";
import { useProductsStore } from "@/stores/productsStore";
import { useForecastStore } from "@/stores/forecastStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar } from "lucide-react";
import { ForecastChart } from "./forecast-chart";

const ForecastView = () => {
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const { fetchProducts, products, isLoading } = useProductsStore();
    const {
        fetchForecastForProduct,
        forecastsByProductId,
        loadingForecasts,
    } = useForecastStore();

    useEffect(() => {
        if (products.length === 0 && !isLoading) {
            fetchProducts();
        }
    }, [products.length, isLoading, fetchProducts]);

    const selected = useMemo(
        () => products.find((p) => p.product_id === selectedProduct),
        [products, selectedProduct]
    );

    const getStockStatus = () => {
        if (!selected) return { status: "unknown", text: "Unknown" };
        if (selected.stock_level < selected.reorder_threshold) {
            return { status: "low", text: "Low Stock" };
        } else {
            return { status: "sufficient", text: "Sufficient Stock" };
        }
    };

    const handleForecast = async () => {
        if (!selectedProduct) return;
        await fetchForecastForProduct(selectedProduct);
    };

    const forecastData = selectedProduct
        ? forecastsByProductId[selectedProduct]
        : null;

    const loadingForecast = selectedProduct
        ? loadingForecasts[selectedProduct]
        : false;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold">Demand Forecasts</h1>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Forecast Settings Panel */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Forecast Settings</CardTitle>
                        <CardDescription>Select a product and forecast period</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product</label>
                            <Select
                                value={selectedProduct ?? undefined}
                                onValueChange={setSelectedProduct}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem
                                            key={product.product_id}
                                            value={product.product_id}
                                        >
                                            {product.product_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selected && (
                            <div className="bg-muted/50 p-3 rounded-md">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-medium">{selected.product_name}</h3>
                                        <p className="text-sm text-muted-foreground">{selected.category}</p>
                                    </div>
                                    <Badge
                                        variant={
                                            getStockStatus().status === "low"
                                                ? "destructive"
                                                : "secondary"
                                        }
                                    >
                                        {getStockStatus().text}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Current Stock</p>
                                        <p className="font-medium">{selected.stock_level}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Reorder At</p>
                                        <p className="font-medium">{selected.reorder_threshold}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Forecast</label>
                        </div>
                        <Button
                            className="w-full flex items-center justify-center gap-2"
                            onClick={handleForecast}
                            disabled={isLoading || !selectedProduct || loadingForecast}
                        >
                            <Calendar className="h-4 w-4" />
                            {loadingForecast ? "Fetching..." : "Fetch Forecast"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Forecast Chart or Empty State */}
                {selectedProduct ? (
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div>
                                <CardTitle>Forecast Chart</CardTitle>
                                <CardDescription>
                                    {loadingForecast
                                        ? "Loading forecast data..."
                                        : "Forecast data for the selected product"}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                            {loadingForecast ? (
                                <div className="loader">Loading...</div>
                            ) : forecastData && forecastData.length > 0 ? (
                                <div className="w-full">
                                    <ForecastChart data={forecastData} />
                                </div>
                            ) : (
                                <div className="text-center">
                                    <h3 className="font-medium text-muted-foreground">
                                        No forecast data available
                                    </h3>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="lg:col-span-2 flex items-center justify-center p-12">
                        <div className="text-center">
                            <h3 className="font-medium text-muted-foreground">
                                Select a product to view forecast
                            </h3>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ForecastView;
