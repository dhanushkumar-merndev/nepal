"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatPrice } from "@/lib/utils/format";
import type { AdminDailyOrder, AdminMetrics } from "@/lib/data/admin";

const metricLabels: Record<keyof AdminMetrics, string> = {
  products: "Products",
  plans: "Plans",
  orders: "Orders",
  revenue: "Completed revenue",
  grossProfit: "Gross profit",
  pendingReviews: "Pending reviews",
};

const lineColors = [
  "#159FD3",
  "#16A34A",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#84CC16",
  "#F97316",
  "#14B8A6",
  "#6366F1",
  "#64748B",
  "#A855F7",
];

export function AdminOverview({
  metrics,
  dailyOrders,
}: {
  metrics: AdminMetrics;
  dailyOrders: AdminDailyOrder[];
}) {
  const productNames = Array.from(new Set(dailyOrders.flatMap((day) => Object.keys(day.productOrders ?? {})))).sort((a, b) =>
    a.localeCompare(b)
  );
  const chartData = dailyOrders.map((day) => {
    const row: Record<string, number | string> = {
      date: day.date,
      orders: day.orders,
      revenue: day.revenue,
    };
    productNames.forEach((name) => {
      row[productKey(name)] = day.productOrders?.[name] ?? 0;
    });
    return row;
  });

  const chartConfig = {
    orders: {
      label: "Total orders",
      color: "#159FD3",
    },
    revenue: {
      label: "Revenue",
      color: "#0F766E",
    },
    ...Object.fromEntries(
      productNames.map((name, index) => [
        productKey(name),
        {
          label: name,
          color: lineColors[(index + 2) % lineColors.length],
        },
      ])
    ),
  } satisfies ChartConfig;

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {(Object.keys(metricLabels) as (keyof AdminMetrics)[]).map((key) => (
          <Card key={key} size="sm">
            <CardHeader>
              <CardDescription>{metricLabels[key]}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {key === "revenue" || key === "grossProfit" ? formatPrice(metrics[key]) : metrics[key]}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden py-0">
        <CardHeader className="border-b border-white/35 px-5 py-4">
          <CardTitle className="text-base font-semibold">Orders and revenue by date</CardTitle>
          <CardDescription>Last {dailyOrders.length || 0} active order days</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          {dailyOrders.length ? (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[260px] w-full rounded-xl border border-white/35 bg-white/20 px-2 py-3 shadow-sm backdrop-blur-md"
            >
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 16,
                  right: 8,
                  bottom: 0,
                  left: 8,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="4 4" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  minTickGap={32}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  yAxisId="orders"
                  hide
                  domain={[0, (dataMax: number) => Math.max(2, Math.ceil(dataMax * 1.5))]}
                />
                <YAxis
                  yAxisId="revenue"
                  hide
                  orientation="right"
                  domain={[0, (dataMax: number) => Math.max(100, Math.ceil(dataMax * 1.25))]}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="min-w-44 border-white/50 bg-white/95 shadow-xl"
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      }
                    />
                  }
                />
                <Line
                  yAxisId="orders"
                  dataKey="orders"
                  type="monotone"
                  stroke="var(--color-orders)"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                  activeDot={{ r: 5 }}
                />
                {productNames.map((name) => {
                  const key = productKey(name);
                  return (
                    <Line
                      key={key}
                      yAxisId="orders"
                      dataKey={key}
                      type="monotone"
                      stroke={`var(--color-${key})`}
                      strokeWidth={1.8}
                      dot={{ r: 3, strokeWidth: 1.5, fill: "white" }}
                      activeDot={{ r: 4 }}
                    />
                  );
                })}
                <Line
                  yAxisId="revenue"
                  dataKey="revenue"
                  type="monotone"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  strokeOpacity={0.7}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="grid h-[180px] place-items-center rounded-xl border border-white/35 bg-white/20 text-sm text-muted-foreground">
              No order data yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function productKey(name: string) {
  return `product_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}`;
}
