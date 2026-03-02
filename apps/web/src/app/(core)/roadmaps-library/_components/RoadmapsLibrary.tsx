/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState } from "react";
import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import FeaturedCarousel from "./FeaturedCarousel";
import RoadmapCard from "./RoadmapCard";
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

const RoadmapsLibrary = ({ roadmaps, childrenList = [] }: RoadmapsLibraryProps) => {
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
    new Set(displayRoadmaps.map((r) => r.category))
  );

  // Get unique age groups from roadmaps
  const uniqueAgeGroups = Array.from(
    new Set(displayRoadmaps.map((r) => r.ageGroup))
  );

  const getFilteredRoadmaps = () => {
    let filtered = [...displayRoadmaps];

    // Filter by search query (title or description)
    if (searchQuery) {
      filtered = filtered.filter(
        (roadmap) =>
          roadmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          roadmap.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
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
          <FeaturedCarousel
            roadmaps={roadmaps}
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl text-foreground mb-1">
            Roadmaps Library
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing stories and start your child reading adventure!
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
            <div className="mb-2">
              <SearchBar onSearch={handleSearch} />
            </div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl text-foreground">
                All Roadmaps ({filteredRoadmaps.length})
              </h2>
            </div>

            {filteredRoadmaps.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="font-heading text-2xl text-foreground mb-2">
                  No roadmaps found
                </h3>
                <p className="font-body text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
