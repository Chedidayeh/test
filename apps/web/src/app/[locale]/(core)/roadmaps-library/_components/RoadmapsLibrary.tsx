/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import FeaturedCarousel from "./FeaturedCarousel";
import RoadmapCard from "./RoadmapCard";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";
import { Button } from "@/src/components/ui/button";
import { Roadmap, ChildProfile } from "@shared/types";
import { transformRoadmapForDisplay } from "../_lib/roadmap-display";

interface Filters {
  categories: string[];
  levels: string[];
  ageGroups: string[];
}

interface RoadmapsLibraryProps {
  roadmaps: Roadmap[];
  childrenList?: ChildProfile[];
}

const RoadmapsLibrary = ({
  roadmaps,
  childrenList = [],
}: RoadmapsLibraryProps) => {
  const t = useTranslations("RoadmapsLibrary");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    levels: [],
    ageGroups: [],
  });

  // Transform real roadmap data for display
  const displayRoadmaps = roadmaps.map(transformRoadmapForDisplay);

  // Create a map for quick lookup of original roadmaps
  const roadmapMap = new Map(roadmaps.map((r) => [r.id, r]));

  // Get unique themes/categories from roadmaps
  const uniqueThemes = Array.from(
    new Set(displayRoadmaps.map((r) => r.category)),
  );

  // Get unique age groups from roadmaps
  const uniqueAgeGroups = Array.from(
    new Set(displayRoadmaps.map((r) => r.ageGroup)),
  );

  const getFilteredRoadmaps = () => {
    let filtered = [...displayRoadmaps];

    // Filter by search query (title or description)
    if (searchQuery) {
      filtered = filtered.filter(
        (roadmap) =>
          roadmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          roadmap.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by categories (themes)
    if (filters.categories.length > 0) {
      filtered = filtered.filter((roadmap) =>
        filters.categories.includes(roadmap.title),
      );
    }

    // Filter by reading levels
    if (filters.levels.length > 0) {
      filtered = filtered.filter((roadmap) =>
        filters.levels.includes(roadmap.readingLevel),
      );
    }

    // Filter by age groups
    if (filters.ageGroups.length > 0) {
      filtered = filtered.filter((roadmap) =>
        filters.ageGroups.includes(roadmap.ageGroup),
      );
    }

    return filtered;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const filteredRoadmaps = getFilteredRoadmaps();

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}

        {/* Featured Carousel */}
        <div className="mb-8">
          <FeaturedCarousel roadmaps={roadmaps} />
        </div>

        <div className="text-center mb-6">
          <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-1">
            {t("library.title")}
          </h1>
          <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("library.description")}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <FilterPanel
              onFilterChange={handleFilterChange}
              uniqueThemes={uniqueThemes}
              uniqueAgeGroups={uniqueAgeGroups}
            />
          </div>

          {/* Stories Grid */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="flex items-center justify-between mb-3 gap-4">
              <div className="flex-1">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl md:text-2xl text-foreground">
                {t("library.allRoadmaps", { count: filteredRoadmaps.length })}
              </h2>
            </div>

            {filteredRoadmaps.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="font-heading text-2xl text-foreground mb-2">
                  {t("library.empty.title")}
                </h3>
                <p className="font-body text-muted-foreground">
                  {t("library.empty.hint")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRoadmaps.map((roadmap) => {
                  const originalRoadmap = roadmapMap.get(roadmap.id);
                  return originalRoadmap ? (
                    <RoadmapCard
                      key={roadmap.id}
                      roadmap={roadmap}
                      originalRoadmap={originalRoadmap}
                      childrenList={childrenList}
                    />
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoadmapsLibrary;
