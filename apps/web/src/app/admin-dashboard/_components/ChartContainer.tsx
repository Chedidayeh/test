"use client";

import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

interface ChartContainerProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  title,
  description,
  children,
  className,
}: ChartContainerProps) {
  return (
    <Card className={cn("p-6", className)}>
      {(title || description) && (
        <div className="mb-6">
          {title && <h3 className="font-semibold text-slate-900">{title}</h3>}
          {description && (
            <p className="text-sm text-slate-600 mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </Card>
  );
}
