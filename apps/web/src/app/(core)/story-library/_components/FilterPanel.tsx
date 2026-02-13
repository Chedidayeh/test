"use client";

import { useState } from "react";
import FilterChip from "./FilterChip";
import { ScrollArea } from "@/src/components/ui/scroll-area";

interface FilterPanelProps {
  onFilterChange: (filters: {
    categories: string[];
    levels: string[];
    status: string[];
    sortBy: string;
  }) => void;
}

const FilterPanel = ({ onFilterChange }: FilterPanelProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");

  const categories = [
    { label: "Adventure" },
    { label: "Mystery" },
    { label: "Fantasy" },
    { label: "Animals" },
    { label: "Science" },
    { label: "Friendship" },
  ];

  const levels = [
    { label: "Beginner" },
    { label: "Easy" },
    { label: "Medium" },
    { label: "Advanced" },
  ];

  const statusOptions = [
    { label: "Not Started" },
    { label: "In Progress" },
    { label: "Completed" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First", icon: "SparklesIcon" },
    { value: "oldest", label: "Oldest First", icon: "ClockIcon" },
    { value: "easy", label: "Easy to Hard", icon: "ArrowUpIcon" },
    { value: "hard", label: "Hard to Easy", icon: "ArrowDownIcon" },
    { value: "popular", label: "Most Popular", icon: "FireIcon" },
  ];

  const handleCategoryToggle = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(updated);
    emitFilters(updated, selectedLevels, selectedStatus, sortBy);
  };

  const handleLevelToggle = (level: string) => {
    const updated = selectedLevels.includes(level)
      ? selectedLevels.filter((l) => l !== level)
      : [...selectedLevels, level];
    setSelectedLevels(updated);
    emitFilters(selectedCategories, updated, selectedStatus, sortBy);
  };

  const handleStatusToggle = (status: string) => {
    const updated = selectedStatus.includes(status)
      ? selectedStatus.filter((s) => s !== status)
      : [...selectedStatus, status];
    setSelectedStatus(updated);
    emitFilters(selectedCategories, selectedLevels, updated, sortBy);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    emitFilters(selectedCategories, selectedLevels, selectedStatus, value);
  };

  const emitFilters = (
    cats: string[],
    lvls: string[],
    stats: string[],
    sort: string,
  ) => {
    onFilterChange({
      categories: cats,
      levels: lvls,
      status: stats,
      sortBy: sort,
    });
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSelectedStatus([]);
    setSortBy("newest");
    onFilterChange({
      categories: [],
      levels: [],
      status: [],
      sortBy: "newest",
    });
  };

  const activeFilterCount =
    selectedCategories.length + selectedLevels.length + selectedStatus.length;

  const handleFilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-heading text-sm font-semibold text-foreground/70 mb-4 uppercase tracking-wide">
          Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <FilterChip
              key={cat.label}
              label={cat.label}
              isActive={selectedCategories.includes(cat.label)}
              onClick={() => handleCategoryToggle(cat.label)}
              color="primary"
            />
          ))}
        </div>
      </div>

      {/* Reading Levels */}
      <div>
        <h3 className="font-heading text-sm font-semibold text-foreground/70 mb-4 uppercase tracking-wide">
          Reading Level
        </h3>
        <div className="flex flex-wrap gap-2">
          {levels.map((level) => (
            <FilterChip
              key={level.label}
              label={level.label}
              isActive={selectedLevels.includes(level.label)}
              onClick={() => handleLevelToggle(level.label)}
              color="secondary"
            />
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <h3 className="font-heading text-sm font-semibold text-foreground/70 mb-4 uppercase tracking-wide">
          Progress Status
        </h3>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <FilterChip
              key={status.label}
              label={status.label}
              isActive={selectedStatus.includes(status.label)}
              onClick={() => handleStatusToggle(status.label)}
              color="accent"
            />
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="font-heading text-sm font-semibold text-foreground/70 mb-4 uppercase tracking-wide">
          Sort By
        </h3>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`w-full px-4 py-2.5 rounded-lg font-body text-sm transition-all flex items-center gap-3 ${
                sortBy === option.value
                  ? "bg-primary text-primary-foreground font-medium border border-primary"
                  : "text-foreground/60 hover:text-foreground hover:bg-foreground/5 border border-transparent hover:border-primary/30"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear All */}
      {activeFilterCount > 0 && (
        <button
          onClick={handleClearAll}
          className="w-full px-4 py-2.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-foreground/5 font-body text-sm transition-all border border-foreground/10 hover:border-foreground/20"
        >
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filter Panel */}
      <div className="hidden lg:block rounded-xl bg-card p-6 sticky top-24 border border-foreground/10 max-h-[calc(100vh-120px)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-base font-bold text-foreground">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full font-data text-xs font-semibold border border-primary/20">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <ScrollArea className="h-96">
          <div className="pr-4">
            {handleFilterContent()}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default FilterPanel;
