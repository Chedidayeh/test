/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Button } from "@/src/components/ui/button";
import { LanguageCode, Roadmap } from "@readdly/shared-types";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getLanguageCode } from "@/src/lib/translation-utils";
import { useLocale } from "@/src/contexts/LocaleContext";

const FeaturedCarousel = ({ roadmaps }: { roadmaps: Roadmap[] }) => {
  const t = useTranslations("RoadmapsLibrary.featuredCarousel");
  const [currentIndex, setCurrentIndex] = useState(0);
  const { locale, isRTL } = useLocale();

  const langCode = getLanguageCode(locale);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % roadmaps.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [roadmaps.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + roadmaps.length) % roadmaps.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % roadmaps.length);
  };

  return (
    <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-warm-lg group">
      {/* Carousel Container - Shows images side by side */}
      <div
        dir="ltr"
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {roadmaps.map((roadmap) => {
          const localizedTheme = (() => {
            const translation = roadmap.theme.translations?.find(
              (tr: { languageCode: LanguageCode }) =>
                tr.languageCode === langCode,
            );
            return {
              name: translation?.name || roadmap.theme.name,
              description:
                translation?.description || roadmap.theme.description,
            };
          })();

          const localizedRoadmapTitle = (() => {
            const translation = roadmap.translations?.find(
              (tr: { languageCode: LanguageCode }) =>
                tr.languageCode === langCode,
            );
            return translation?.title ?? roadmap.title ?? "";
          })();
          console.log("Localized Theme Name:", roadmap.theme.imageUrl);
          return (
            <div
              key={roadmap.id}
              className="min-w-full h-full flex-shrink-0 relative"
            >
              {/* Background Image */}
              <img
                src={roadmap.theme.imageUrl}
                alt={localizedTheme.name}
                className="w-full h-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-white/10 dark:bg-black/10" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 mx-10">
                {/* Title & Description */}
                <h2 className="font-heading text-2xl md:text-3xl text-white mb-2">
                  {localizedTheme.name} - {localizedRoadmapTitle}
                </h2>
                <p className="font-body text-white/90 mb-4 line-clamp-2 max-w-2xl">
                  {localizedTheme.description}
                </p>

                {/* Action Button */}
                <Button size={"sm"} className="max-w-max">{t("startReading")}</Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/90 rounded-full flex items-center justify-center hover:scale-110 transition-smooth shadow-warm opacity-0 group-hover:opacity-100"
        aria-label={t("previousStory")}
      >
        <ChevronLeftIcon />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/90 rounded-full flex items-center justify-center hover:scale-110 transition-smooth shadow-warm opacity-0 group-hover:opacity-100"
        aria-label={t("nextStory")}
      >
        <ChevronRightIcon />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {roadmaps.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-smooth ${
              index === currentIndex ? "bg-white w-6" : "bg-white/50"
            }`}
            aria-label={t("goToRoadmap", { index: index + 1 })}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedCarousel;
