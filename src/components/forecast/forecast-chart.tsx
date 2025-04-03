"use client";

import {
    ChartContainer,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ForecastDataPoint } from "@/types";

interface ForecastChartProps {
    data: ForecastDataPoint[];
}

export function ForecastChart({ data }: ForecastChartProps) {
    const chartData = data.map((point) => ({
        ...point,
        dateFormatted: new Date(point.date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        }),
    }));

    const chartConfig = {
        predicted_value: {
            label: "Predicted",
            color: "hsl(var(--chart-1))",
        },
        lower_bound: {
            label: "Lower Bound",
            color: "hsl(var(--chart-2))",
        },
        upper_bound: {
            label: "Upper Bound",
            color: "hsl(var(--chart-3))",
        },
    } as const;

    return (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <defs>
                        <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="colorLower" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.01} />
                        </linearGradient>
                        <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.01} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                        dataKey="dateFormatted"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis tick={{ fontSize: 12 }} width={40} tickLine={false} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area
                        type="monotone"
                        dataKey="upper_bound"
                        stroke="none"
                        fill="url(#colorUpper)"
                        fillOpacity={1}
                    />
                    <Area
                        type="monotone"
                        dataKey="predicted_value"
                        stroke="hsl(var(--chart-1))"
                        fill="url(#colorPredicted)"
                        strokeWidth={2}
                        fillOpacity={1}
                    />
                    <Area
                        type="monotone"
                        dataKey="lower_bound"
                        stroke="none"
                        fill="url(#colorLower)"
                        fillOpacity={1}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
