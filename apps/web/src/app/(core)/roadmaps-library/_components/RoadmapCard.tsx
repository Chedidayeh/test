"use client";

import { Button } from "@/src/components/ui/button";
import { RoadmapDisplay } from "@/src/lib/utils/roadmap-display";
import { useState } from "react";

interface RoadmapCardProps {
  roadmap: RoadmapDisplay;
}

const RoadmapCard = ({ roadmap }: RoadmapCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-card rounded-lg border border-foreground/10 shadow-sm hover:shadow-md hover:border-foreground/20 transition-all duration-300 overflow-hidden group">
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={roadmap.coverImage}
          alt={`Cover image for ${roadmap.title}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
      </div>

      {/* Roadmap Info */}
      <div className="p-5">
        <h3 className="font-heading text-xl font-medium text-foreground line-clamp-2 mb-3">
          {roadmap.title}
        </h3>

        {/* Reading Level & Age Group */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-lg font-caption text-sm font-medium">
            {roadmap.readingLevel}
          </span>
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg font-caption text-sm font-medium">
            {roadmap.ageGroup}
          </span>
        </div>

        {/* World & Story Count */}
        <div className="flex items-center gap-4 text-foreground/60 mb-4">
          <div className="flex items-center gap-1">
            <span className="font-body">
              {roadmap.worldCount > 1 ? "Worlds" : "World"}
            </span>
            <span className="font-data font-medium text-foreground/80">
              {roadmap.worldCount}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-body">
              {roadmap.storyCount > 1 ? "Stories" : "Story"}
            </span>
            <span className="font-data font-medium text-foreground/80">
              {roadmap.storyCount}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          className={`w-full py-3 rounded-xl font-heading font-bold transition-smooth`}
        >
          Explore Roadmap
        </Button>
      </div>
    </div>
  );
};

export default RoadmapCard;
