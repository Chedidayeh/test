"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: Array<{
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }>;
  onClear?: () => void;
  isFiltered?: boolean;
  className?: string;
}

export function FilterBar({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  onClear,
  isFiltered = false,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-3 items-center", className)}>
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-10 bg-white border-slate-200"
        />
      </div>

      {/* Filters */}
      {filters.map((filter, idx) => (
        <Select key={idx} value={filter.value} onValueChange={filter.onChange}>
          <SelectTrigger className="w-full sm:w-40 bg-white border-slate-200">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Clear Button */}
      {isFiltered && onClear && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="gap-1"
        >
          <X className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
