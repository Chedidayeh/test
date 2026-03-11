"use client";

import { Button } from "@/src/components/ui/button";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChildProfile, LanguageCode, Roadmap } from "@readdly/shared-types";
import AllocateRoadmapDialog from "./AllocateRoadmapDialog";
import { RoadmapDisplay } from "../_lib/roadmap-display";
import { useLocale } from "@/src/contexts/LocaleContext";
import { getLanguageCode } from "@/src/lib/translation-utils";

interface RoadmapCardProps {
  roadmap: RoadmapDisplay;
  originalRoadmap: Roadmap;
  childrenList?: ChildProfile[];
}

const RoadmapCard = ({
  roadmap,
  originalRoadmap,
  childrenList = [],
}: RoadmapCardProps) => {
  const t = useTranslations("RoadmapsLibrary.roadmapCard");
  const { locale, isRTL } = useLocale();

  const langCode = getLanguageCode(locale);

  // Localize theme name/description and roadmap title using translations arrays
  const localizedTheme = (() => {
    const translation = roadmap.theme.translations?.find(
      (tr: { languageCode: LanguageCode }) => tr.languageCode === langCode,
    );
    return {
      name: translation?.name || roadmap.theme.name,
      description: translation?.description || roadmap.theme.description,
    };
  })();

  const localizedRoadmapTitle = (() => {
    const translation = roadmap.translations?.find(
      (tr: { languageCode: LanguageCode }) => tr.languageCode === langCode,
    );
    return translation?.title ?? roadmap.title ?? "";
  })();

    const localizedAgeGroupName = (() => {
    const translation = roadmap.ageGroup.translations?.find(
      (tr: { languageCode: LanguageCode }) => tr.languageCode === langCode,
    );
    return translation?.name ?? roadmap.ageGroup.name ?? "";
  })();

  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);

  return (
    <div className="bg-card rounded-lg border border-foreground/10 shadow-sm hover:shadow-md hover:border-foreground/20 transition-all duration-300 overflow-hidden group">
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={roadmap.coverImage}
          alt={t("coverImageAlt", { title: localizedRoadmapTitle })}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Roadmap Info */}
      <div className="p-5">
        <h3 className="font-heading text-xl font-medium text-foreground line-clamp-2 mb-3">
          {localizedRoadmapTitle} - {localizedTheme.name}
        </h3>

        {/* Reading Level & Age Group */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-lg font-caption text-sm font-medium">
            {roadmap.readingLevel}
          </span>
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg font-caption text-sm font-medium">
            {localizedAgeGroupName}
          </span>
        </div>

        {/* World & Story Count */}
        <div className="flex items-center gap-4 text-foreground/60 mb-4">
          <div className="flex items-center gap-1">
            <span className="font-data font-medium text-foreground/80">
              {roadmap.worldCount}
            </span>
            <span className="font-body">
              {roadmap.worldCount > 1 ? t("worldsLabel") : t("worldLabel")}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-col">
          {/* <Button
            className={`w-full py-3 rounded-xl font-heading font-bold transition-smooth`}
          >
            Explore Roadmap
          </Button> */}
          {childrenList.length > 0 && (
            <Button
              variant="outline"
              className="w-full py-3 rounded-xl font-heading font-medium transition-smooth"
              onClick={() => setAllocateDialogOpen(true)}
            >
              {t("allocateButton")}
            </Button>
          )}
        </div>
      </div>

      <AllocateRoadmapDialog
        open={allocateDialogOpen}
        onOpenChange={setAllocateDialogOpen}
        roadmap={originalRoadmap}
        childrenList={childrenList}
      />
    </div>
  );
};

export default RoadmapCard;
