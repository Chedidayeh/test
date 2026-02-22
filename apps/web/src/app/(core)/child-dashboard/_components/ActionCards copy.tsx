/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import {
  BookMarked,
  BookmarkIcon,
  BookOpenIcon,
  BookText,
  LucideIcon,
  MapPinned,
  MapPlus,
  TrophyIcon,
} from "lucide-react";

interface Story {
  id: number;
  title: string;
  coverImage: string;
  coverAlt: string;
  progress: number;
  totalPages: number;
}

interface ActionCardsProps {
  continueStory: Story | null;
}

const ActionCards = ({ continueStory }: ActionCardsProps) => {
  const actions = [
    {
      id: 1,
      title: "Track Progress",
      image: "/child-dashboard/roadmap3.jpg",
      description: "See your reading journey",
      icon: MapPinned,
      color: "bg-secondary",
      textColor: "text-white",
      href: "/story-library",
    },
    {
      id: 2,
      title: "My Rewards",
      image: "/child-dashboard/achievements.jpg",
      description: "See all your achievements",
      icon: TrophyIcon,
      color: "bg-accent",
      textColor: "text-white",
      href: "/child-dashboard",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Continue Reading Card */}
      {continueStory ? (
        <Link
          href="/story-reading-interface"
          className="bg-black/90 text-white rounded-xl h-52 p-6 shadow-warm-lg group relative overflow-hidden transform-gpu transition-transform duration-300 hover:scale-105  hover:z-20"
        >
          <div className="absolute inset-0 opacity-80">
            <img
              src={continueStory.coverImage}
              alt={continueStory.coverAlt}
              className="w-full h-full object-cover transform-gpu transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-primary/80 rounded-full px-3 py-1">
                <BookMarked size={20} className="text-white" />
              </div>
              <div className="bg-primary/80 rounded-full px-3 py-1">
                <span className="font-data text-sm font-bold">
                  {continueStory.progress}/{continueStory.totalPages}
                </span>
              </div>
            </div>
            <div className="bg-primary/80 px-3 max-w-max rounded-xl opacity-90">
              <h2 className="font-heading text-xl mb-2">Continue Reading</h2>
            </div>
            <p className="font-body bg-primary/80 px-3 max-w-max rounded-xl opacity-90 mb-4">
              {continueStory.title}
            </p>
            <div className="w-full bg-white/20 rounded-full h-2 mt-10 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-smooth"
                style={{
                  width: `${(continueStory.progress / continueStory.totalPages) * 100}%`,
                }}
              />
            </div>
          </div>
        </Link>
      ) : (
        <Link
          href="/story-reading-interface"
          className="bg-black/90 text-white rounded-xl h-52 p-6 shadow-warm-lg group relative overflow-hidden transform-gpu transition-transform duration-300 hover:scale-105  hover:z-20"
        >
          <div className="absolute inset-0 opacity-80">
            <img
              src={"/child-dashboard/new-story.jpeg"}
              alt={"inviting readers to start a new story"}
              className="w-full h-full object-cover transform-gpu transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-primary/80 rounded-full px-3 py-1">
                <MapPlus size={20} className="text-white" />
              </div>
            </div>
            <div className="bg-primary/80 px-3 max-w-max rounded-xl opacity-90">
              <h2 className="font-heading text-xl mb-2">Start new story</h2>
            </div>
            <p className="font-body opacity-90 mb-4">
              Explore new stories <br />
              and embark on new adventures
            </p>
          </div>
        </Link>
      )}

      {/* Other Action Cards */}
      {actions.map((action) => {
        const Icon = action.icon as LucideIcon;
        return (
          <Link
            key={action.id}
            href="/story-reading-interface"
            className="bg-black/90 text-white rounded-xl p-6 shadow-warm-lg group relative overflow-hidden transform-gpu transition-transform duration-300 hover:scale-105  hover:z-20"
          >
            <div className="absolute inset-0 opacity-80">
              <img
                src={action.image}
                alt={action.title}
                className="w-full h-full object-cover transform-gpu transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 rounded-full px-3 py-1">
                  {Icon && <Icon size={20} className={action.textColor} />}
                </div>
              </div>
              <div className="bg-white/20 px-3 max-w-max rounded-xl opacity-90">
                <h2 className="font-heading text-xl mb-2">{action.title}</h2>
              </div>
              <p className="font-body bg-white/20 px-3 max-w-max rounded-xl opacity-90 mb-4">
                {action.description}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ActionCards;
