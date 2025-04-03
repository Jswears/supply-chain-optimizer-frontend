"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useForecastSummaryStore } from "@/stores/forecastSummaryStore"
import { useEffect } from "react"
import { TabsContent } from "@radix-ui/react-tabs"

interface SummaryCardProps {
    productId: string
    productName: string
}

export function SummaryCard({ productId, productName }: SummaryCardProps) {
    const { summariesByProductId, loadingSummaries, summaryErrors, fetchForecastSummary } = useForecastSummaryStore()

    const data = summariesByProductId[productId];
    const isLoading = loadingSummaries[productId];
    const error = summaryErrors[productId];

    useEffect(() => {
        if (productId && productName) {
            fetchForecastSummary(productId, productName);
        }
    }, [productId, productName, fetchForecastSummary]);

    const onRefresh = () => {
        fetchForecastSummary(productId, productName);
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>Error: {error}</p>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>No summary available</p>
            </div>
        )
    }
    return (
        <TabsContent value="summary" className="w-full">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>AI-Generated Insights</CardTitle>
                    <Button onClick={onRefresh} variant="outline" size="sm" disabled={isLoading} className="h-8 px-2 text-xs cursor-pointer">
                        <RefreshCw className={`h-3.5 w-3.5 mr-1${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex flex-col gap-2">
                            <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                            <div className="h-4 bg-muted rounded animate-pulse w-[90%]"></div>
                            <div className="h-4 bg-muted rounded animate-pulse w-[95%]"></div>
                            <div className="h-4 bg-muted rounded animate-pulse w-[85%]"></div>
                            <div className="h-4 bg-muted rounded animate-pulse w-[70%]"></div>
                        </div>
                    ) : (
                        <div className="relative py-4 px-5 border-l-4 border-primary bg-primary/5 rounded-r-md">
                            <blockquote className="text-base italic">{data.summary}</blockquote>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    )
}

