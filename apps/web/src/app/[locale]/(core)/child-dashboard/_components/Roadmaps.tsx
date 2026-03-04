/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckIcon, ChevronRightIcon, LockIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { Roadmap } from "@shared/types";
import { useLocale } from "@/src/contexts/LocaleContext";

interface RoadmapsProps {
  roadmaps: Roadmap[];
  setSelectedRoadmap: (roadmap: Roadmap) => void;
  setSeeRoadmap: (see: boolean) => void;
}

const Roadmaps = ({
  roadmaps,
  setSelectedRoadmap,
  setSeeRoadmap,
}: RoadmapsProps) => {
  const t = useTranslations("ChildDashboard");
  const {isRTL} = useLocale();
  return (
    <div className="bg-card border border-black/30 rounded-xl p-4 md:p-6 shadow-warm-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <h2 className="font-heading text-xl md:text-2xl lg:text-3xl text-foreground">
          {t("roadmaps.title")}
        </h2>
        <Link
          href="/roadmaps-library"
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-smooth mt-2 sm:mt-0"
        >
          <span className="font-body font-medium text-sm">{t("roadmaps.seeAll")}</span>
          {isRTL ? <ChevronRightIcon size={18} className="rotate-180" /> : <ChevronRightIcon size={18} />}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {roadmaps.map((roadmap) => (
          <div
            key={roadmap.id}
            className={`group bg-background border border-black/30 rounded-xl overflow-hidden shadow-warm hover:shadow-warm-lg transform transition-transform duration-300 hover:-translate-y-1 hover:scale-105`}
          >
            {/* Cover Image */}
            <div className="relative h-40 md:h-48 overflow-hidden">
              <img
                src={roadmap.theme.imageUrl}
                alt={t("roadmaps.coverAlt", { name: roadmap.theme.name })}
                className="w-full h-full object-cover transition-transform duration-500 transform group-hover:scale-110"
              />
              {/* {story.isLocked && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <LockIcon size={25} className="text-white" />
                    <p className="font-body font-bold text-white">
                      {story.starsRequired} stars needed
                    </p>
                  </div>
                </div>
              )} */}
              {/* <div
                className={`absolute bg-secondary text-white top-3 left-3 ${getDifficultyColor(story.difficulty)} rounded-full px-3 py-1 shadow-warm transition-opacity duration-300 group-hover:opacity-95`}
              >
                <span className="font-caption">
                  {story.difficulty}
                </span>
              </div> */}
            </div>

            {/* Story Info */}
            <div className="p-4">
              <h3 className="font-heading text-lg md:text-xl text-foreground mb-2 line-clamp-1">
                {roadmap.theme.name} - {roadmap.title || t("roadmaps.untitled")}
              </h3>
              <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-2">
                {roadmap.theme.description}
              </p>

              <Button
                className="w-full text-sm py-2"
                onClick={() => {
                  setSelectedRoadmap(roadmap);
                  setSeeRoadmap(true);
                }}
              >
                {t("roadmaps.viewButton")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roadmaps;
