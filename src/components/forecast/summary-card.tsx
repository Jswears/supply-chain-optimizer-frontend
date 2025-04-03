"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useForecastSummaryStore } from "@/stores/forecastSummaryStore"
import { useEffect } from "react"
import { Skeleton } from "../ui/skeleton"

interface SummaryCardProps {
    productId: string
    productName?: string
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
        if (productName) {
            fetchForecastSummary(productId, productName);
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>AI-Generated Insights</CardTitle>
                <Button
                    onClick={onRefresh}
                    variant="outline"
                    size="sm"
                    disabled={isLoading || !productName}
                    className="h-8 px-2 text-xs cursor-pointer"
                >
                    <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[90%]" />
                        <Skeleton className="h-4 w-[95%]" />
                        <Skeleton className="h-4 w-[85%]" />
                        <Skeleton className="h-4 w-[70%]" />
                    </div>
                )}

                {error && (
                    <div className="relative py-4 px-5 border-l-4 border-destructive bg-destructive/5 rounded-r-md">
                        <p className="text-base">{error}</p>
                    </div>
                )}

                {data && !isLoading && !error && (
                    <div className="relative py-4 px-5 border-l-4 border-primary bg-primary/5 rounded-r-md">
                        <blockquote className="text-base italic">{data.text}</blockquote>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

