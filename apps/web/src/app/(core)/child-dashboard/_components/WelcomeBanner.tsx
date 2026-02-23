/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  BookOpen,
  Clock,
  StarIcon,
  TrophyIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@shared/types";

interface WelcomeBannerProps {
  childName: string;
  avatar: string | undefined;
  currentLevel: number;
  totalStars: number;
  storiesCompleted: number;
  readingTimeMinutes: number;
  recentBadges: Badge[];
  readingTimeSubtitle?: string;
}

const WelcomeBanner = ({
  childName,
  avatar,
  currentLevel,
  totalStars,
  storiesCompleted,
  readingTimeMinutes,
  recentBadges,
  readingTimeSubtitle,
}: WelcomeBannerProps) => {
  return (
    <div className="rounded-xl bg-card border border-black/30 p-6 shadow-warm-lg">
      <div className="flex items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.36, ease: "anticipate" }}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-primary shadow-warm hover:scale-105 transition-transform duration-100 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20"
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={"Avatar of " + childName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl md:text-4xl font-heading font-bold text-primary">
                  {childName.charAt(0).toUpperCase()}
                </span>
              )}
            </motion.div>
          </div>

          {/* Welcome Message */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-between">
              <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-2">
                Welcome
                {currentLevel === 1 ? " on board, " : " back, "}
                {childName}!
              </h1>
              {recentBadges.length > 0 && (
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center gap-2 p-2 px-4 bg-accent hover:bg-accent/70 text-white rounded-full"
                >
                  <TrophyIcon size={20} className="" />
                  <span className="font-body font-medium">
                    {recentBadges[recentBadges.length - 1].name}
                  </span>
                </motion.div>
              )}
            </div>
            <p className="font-body text-lg text-muted-foreground">
              {currentLevel === 1
                ? "Your reading adventure begins now! 🌟"
                : `Ready for another amazing reading adventure?`}
              <br />
            </p>

            {/* Stats Section */}
            <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
              {/* Total Stars */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg px-4 py-1"
              >
                <StarIcon size={20} className="text-yellow-500" />
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm text-muted-foreground">
                    Stars earned:
                  </span>
                  <span className="font-heading font-semibold text-foreground">
                    {totalStars}
                  </span>
                </div>
              </motion.div>

              {/* Stories Completed */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg px-4 py-1"
              >
                <BookOpen size={20} className="text-blue-500" />
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm text-muted-foreground">
                    Stories completed:
                  </span>
                  <span className="font-heading font-semibold text-foreground">
                    {storiesCompleted}
                  </span>
                </div>
              </motion.div>

              {/* Reading Time */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-purple-100/50 dark:bg-purple-900/20 rounded-lg px-4 py-1"
              >
                <Clock size={20} className="text-purple-500" />
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm text-muted-foreground">
                    Minutes read:{" "}
                  </span>
                  <span className="font-heading font-semibold text-foreground">
                    {readingTimeMinutes} min {readingTimeSubtitle && <span className="text-md text-muted-foreground">{readingTimeSubtitle}</span>}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
