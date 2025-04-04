import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useForecastStore } from "@/stores/forecastStore";
import { useEffect } from "react";
import { ForecastChart } from "./forecast-chart";
import { Skeleton } from "../ui/skeleton";

export type ForecastTableProps = {
    productId: string;
    productName?: string;
}

const ForecastTable = ({ productId }: ForecastTableProps) => {
    const {
        forecastsByProductId,
        loadingForecasts,
        forecastErrors,
        fetchForecastForProduct
    } = useForecastStore();

    const forecast = forecastsByProductId[productId];
    const isLoading = loadingForecasts[productId];
    const error = forecastErrors[productId];

    useEffect(() => {
        if (productId) {
            fetchForecastForProduct(productId);
        }
    }, [productId, fetchForecastForProduct]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>7-Day Demand Forecast</CardTitle>
                <CardTitle>
                    Current Date: 28.03.2025
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="flex justify-center items-center h-64">
                        <Skeleton className="h-full w-full rounded-md" />
                    </div>
                )}

                {error && (
                    <div className="flex justify-center items-center h-64">
                        <p>Error: {error}</p>
                    </div>
                )}

                {forecast && !isLoading && !error && (
                    <>
                        <ForecastChart data={forecast} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-muted/30 p-4 rounded-md">
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Average Daily Demand</h4>
                                <p className="text-2xl font-bold">
                                    {Math.round(forecast.reduce((sum, item) => sum + item.predicted_value, 0) / forecast.length)}{" "}
                                    units
                                </p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-md">
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Peak Demand</h4>
                                <p className="text-2xl font-bold">{Math.round(Math.max(...forecast.map((item) => item.upper_bound)))} units</p>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default ForecastTable;