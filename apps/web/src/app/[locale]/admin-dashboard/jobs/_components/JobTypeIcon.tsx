/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/src/lib/utils";
import { Languages, Volume2, BarChart3, FileText } from "lucide-react";

interface JobTypeIconProps {
  jobType: string;
  showLabel?: boolean;
  className?: string;
}

export function JobTypeIcon({
  jobType,
  showLabel = true,
  className,
}: JobTypeIconProps) {
  const typeConfig: Record<
    string,
    { label: string; color: string; Icon: any }
  > = {
    translation: {
      label: "Translation",
      color: "text-blue-600",
      Icon: Languages,
    },
    tts_audio: {
      label: "Audio Generation",
      color: "text-purple-600",
      Icon: Volume2,
    },
    weekly_analytics: {
      label: "Weekly Analytics",
      color: "text-green-600",
      Icon: BarChart3,
    },
  };

  const config = typeConfig[jobType] || {
    label: jobType,
    color: "text-gray-600",
    Icon: FileText,
  };

  const IconComponent = config.Icon;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <IconComponent className={cn("w-4 h-4", config.color)} />
      {showLabel && (
        <span className={cn("text-sm font-medium", config.color)}>
          {config.label}
        </span>
      )}
    </div>
  );
}
