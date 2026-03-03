"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import FilterChip from "./FilterChip";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { ReadingLevel } from "@shared/types";

interface FilterPanelProps {
  uniqueThemes: string[];
  uniqueAgeGroups: string[];
  onFilterChange: (filters: {
    categories: string[];
    levels: string[];
    ageGroups: string[];
  }) => void;
}

const FilterPanel = ({
  onFilterChange,
  uniqueThemes,
  uniqueAgeGroups,
}: FilterPanelProps) => {
  const t = useTranslations("RoadmapsLibrary.filterPanel");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);

  const levels = ReadingLevel
    ? Object.values(ReadingLevel).map((level) => ({
        value: level,
        label: level.charAt(0).toUpperCase() + level.slice(1),
      }))
    : [];

  const handleCategoryToggle = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(updated);
    emitFilters(updated, selectedLevels, selectedAgeGroups);
  };

  const handleLevelToggle = (level: string) => {
    const updated = selectedLevels.includes(level)
      ? selectedLevels.filter((l) => l !== level)
      : [...selectedLevels, level];
    setSelectedLevels(updated);
    emitFilters(selectedCategories, updated, selectedAgeGroups);
  };

  const handleAgeGroupToggle = (ageGroup: string) => {
    const updated = selectedAgeGroups.includes(ageGroup)
      ? selectedAgeGroups.filter((a) => a !== ageGroup)
      : [...selectedAgeGroups, ageGroup];
    setSelectedAgeGroups(updated);
    emitFilters(selectedCategories, selectedLevels, updated);
  };

  const emitFilters = (
    cats: string[],
    lvls: string[],
    ages: string[],
  ) => {
    onFilterChange({
      categories: cats,
      levels: lvls,
      ageGroups: ages,
    });
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSelectedAgeGroups([]);
    onFilterChange({
      categories: [],
      levels: [],
      ageGroups: [],
    });
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedLevels.length +
    selectedAgeGroups.length;

  const handleFilterContent = () => (
    <div className="space-y-6">
      {/* Categories (Themes) */}
      <div>
        <h3 className="font-heading text-sm font-semibold text-foreground/70 mb-4 uppercase tracking-wide">
          {t("categoryLabel")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {uniqueThemes.map((theme) => (
            <FilterChip
              key={theme}
              label={theme}
              isActive={selectedCategories.includes(theme)}
              onClick={() => handleCategoryToggle(theme)}
              color="primary"
            />
          ))}
        </div>
      </div>

      {/* Age Groups */}
      <div>
        <h3 className="font-heading text-sm font-semibold text-foreground/70 mb-4 uppercase tracking-wide">
          {t("ageGroupLabel")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {uniqueAgeGroups.map((ageGroup) => (
            <FilterChip
              key={ageGroup}
              label={ageGroup}
              isActive={selectedAgeGroups.includes(ageGroup)}
              onClick={() => handleAgeGroupToggle(ageGroup)}
              color="primary"
            />
          ))}
        </div>
      </div>

      {/* Reading Levels */}
      <div>
        <h3 className="font-heading text-sm font-semibold text-foreground/70 mb-4 uppercase tracking-wide">
          {t("readingLevelLabel")}
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

      {/* Clear All */}
      {activeFilterCount > 0 && (
        <button
          onClick={handleClearAll}
          className="w-full px-4 py-2.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-foreground/5 font-body text-sm transition-all border border-foreground/10 hover:border-foreground/20"
        >
          {t("clearAllFilters", { count: activeFilterCount })}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filter Panel */}
      <div className="hidden lg:block rounded-xl bg-card p-6 sticky top-24 border border-foreground/10 max-h-[calc(100vh-120px)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-base font-bold text-foreground">
            {t("title")}
          </h2>
          {activeFilterCount > 0 && (
            <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full font-data text-xs font-semibold border border-primary/20">
              {t("activeCount", { count: activeFilterCount })}
            </span>
          )}
        </div>
        <ScrollArea className="h-96">
          <div className="pr-4">{handleFilterContent()}</div>
        </ScrollArea>
      </div>
    </>
  );
};

export default FilterPanel;
