import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useForecastStore } from "@/stores/forecastStore";
import { useEffect } from "react";
import { ForecastChart } from "./forecast-chart";
import { TabsContent } from "@radix-ui/react-tabs";

export type ForecastTableProps = {
    productId: string;
    productName: string;
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>Error: {error}</p>
            </div>
        );
    }
    return (
        <TabsContent value="forecast">
            <Card>
                <CardHeader>
                    <CardTitle>7-Day Demand Forecast</CardTitle>
                    <CardTitle>
                        Current Date: 28.03.2025
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {forecast ? (
                        <ForecastChart data={forecast} />
                    ) : (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    );
}

export default ForecastTable;