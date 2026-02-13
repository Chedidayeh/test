"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Child } from "../_data/mockData";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChildSidebarProps {
  childrenData: Child[];
  selectedChildId: number;
  onChildSelect: (childId: number) => void;
}

export default function ChildSidebar({
  childrenData,
  selectedChildId,
  onChildSelect,
}: ChildSidebarProps) {
  return (
    <div className="hidden md:flex md:flex-col md:w-64 bg-card rounded-xl p-4 shadow-warm-lg border border-black/30 h-fit md:sticky md:top-8 gap-4">
      <div>
        <h3 className="font-heading text-lg text-foreground mb-4 px-2">
          Your Children
        </h3>
      </div>

      <div className="space-y-2">
        {childrenData.map((child) => (
          <button
            key={child.id}
            onClick={() => onChildSelect(child.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
              "hover:bg- active:scale-95",
              selectedChildId === child.id
                ? "bg-primary/15 border border-primary/30"
                : "hover:bg-muted"
            )}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={child.avatarUrl} alt={child.avatarAlt} />
              <AvatarFallback>{child.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm text-foreground">
                {child.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {child.totalStars} stars
              </p>
            </div>
            {selectedChildId === child.id && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
