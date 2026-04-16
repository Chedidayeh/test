"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import * as React from "react";
import { LineChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";
import { DailySessionData, DailySessionSummary, filterByTimeRange, combinedGenderData } from "@/src/lib/progress-service/transform-children-data";

export const description = "Daily reading sessions - All children";

const chartConfig = {
  totalChildren: {
    label: "Total Children",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

interface ChartComponentProps {
  data: DailySessionData[];
}

export function ChartComponent({ data }: ChartComponentProps) {
  const [timeRange, setTimeRange] = React.useState("90d");

  const daysMap = {
    "90d": 90,
    "30d": 30,
    "7d": 7,
  };

  const daysToShow = daysMap[timeRange as keyof typeof daysMap] || 90;
  const combinedData = combinedGenderData(data);
  const filteredData = filterByTimeRange(combinedData, daysToShow);

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Daily Reading Sessions</CardTitle>
          <CardDescription>
            Active children - Last {daysToShow} days
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData && filteredData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <LineChart data={filteredData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              <Line
                dataKey="totalChildren"
                type="monotone"
                stroke="var(--color-totalChildren)"
                strokeWidth={2}
                dot={false}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            No session data available for this period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
