/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Button } from "@/src/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface FeaturedStory {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  coverAlt: string;
  badge: string;
  badgeColor: string;
}

interface FeaturedCarouselProps {
  stories: FeaturedStory[];
  onStoryClick: (id: number) => void;
}

const FeaturedCarousel = ({ stories, onStoryClick }: FeaturedCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stories.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [stories.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  return (
    <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-warm-lg group">
      {/* Carousel Container - Shows images side by side */}
      <div 
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {stories.map((story) => (
          <div key={story.id} className="min-w-full h-full flex-shrink-0 relative">
            {/* Background Image */}
            <img
              src={story.coverImage}
              alt={story.coverAlt}
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-white/10 dark:bg-black/10" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 mx-10">
              {/* Title & Description */}
              <h2 className="font-heading text-2xl md:text-3xl text-white mb-2">
                {story.title}
              </h2>
              <p className="font-body text-white/90 mb-4 line-clamp-2 max-w-2xl">
                {story.description}
              </p>

              {/* Action Button */}
              <Button className="max-w-max" onClick={() => onStoryClick(story.id)}>
                Start Reading
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/90 rounded-full flex items-center justify-center hover:scale-110 transition-smooth shadow-warm opacity-0 group-hover:opacity-100"
        aria-label="Previous story"
      >
        <ChevronLeftIcon />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/90 rounded-full flex items-center justify-center hover:scale-110 transition-smooth shadow-warm opacity-0 group-hover:opacity-100"
        aria-label="Next story"
      >
        <ChevronRightIcon />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {stories.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-smooth ${
              index === currentIndex ? "bg-white w-6" : "bg-white/50"
            }`}
            aria-label={`Go to story ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedCarousel;
