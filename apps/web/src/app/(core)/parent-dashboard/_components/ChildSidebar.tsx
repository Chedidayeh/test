"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import type { ParentUser } from "@shared/types";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChildSidebarProps {
  parentData: ParentUser | null | undefined;
  selectedChildId: string;
  onChildSelect: (childId: string) => void;
}

export default function ChildSidebar({
  parentData,
  selectedChildId,
  onChildSelect,
}: ChildSidebarProps) {
  const children = parentData?.children || [];

  return (
    <div className="hidden md:flex md:flex-col md:w-64 bg-card rounded-xl p-4 shadow-warm-lg border border-black/30 h-fit md:sticky md:top-8 gap-4">
      <div>
        <h3 className="font-heading text-lg text-foreground mb-4 px-2">
          Your Children
        </h3>
      </div>

      <div className="space-y-2">
        {children.map((profile) => (
          <button
            key={profile.childId}
            onClick={() => onChildSelect(profile.childId)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
              "hover:bg- active:scale-95",
              selectedChildId === profile.childId
                ? "bg-primary/15 border border-primary/30"
                : "hover:bg-muted"
            )}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile.child?.avatar || ""} alt={profile.child?.name} />
              <AvatarFallback>{profile.child?.name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm text-foreground">
                {profile.child?.name || "Unknown"}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile.totalStars || 0} stars
              </p>
            </div>
            {selectedChildId === profile.childId && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
