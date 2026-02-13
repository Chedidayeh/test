"use client";

import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {trend && (
            <div
              className={cn(
                "text-sm font-medium mt-2",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : "-"}
              {trend.value}% from last period
            </div>
          )}
        </div>
        {icon && (
          <div className="text-slate-400 ml-4 pt-1">{icon}</div>
        )}
      </div>
    </Card>
  );
}
