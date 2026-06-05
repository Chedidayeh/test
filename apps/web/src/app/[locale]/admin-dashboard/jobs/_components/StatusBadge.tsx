import { cn } from "@/src/lib/utils";

interface StatusBadgeProps {
  status: string;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const statusConfig: Record<
    string,
    { label: string; color: string; icon: string }
  > = {
    queued: {
      label: "Queued",
      color: "bg-slate-100 text-slate-700 border-slate-200",
      icon: "⏱️",
    },
    running: {
      label: "Running",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: "⚡",
    },
    completed: {
      label: "Completed",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: "✅",
    },
    failed: {
      label: "Failed",
      color: "bg-red-100 text-red-700 border-red-200",
      icon: "❌",
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-gray-100 text-gray-600 border-gray-200",
      icon: "🚫",
    },
  };

  const config =
    statusConfig[status] || statusConfig.queued;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.color,
        className,
      )}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
}
