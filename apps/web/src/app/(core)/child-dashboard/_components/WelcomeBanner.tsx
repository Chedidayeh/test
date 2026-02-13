/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { BookOpen, Clock, SparklesIcon, StarIcon, TrophyIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface WelcomeBannerProps {
  childName: string;
  avatarUrl: string;
  avatarAlt: string;
  totalStars: number;
  storiesCompleted?: number;
  readingTimeMinutes?: number;
  recentBadges: Array<{
    id: number;
    name: string;
    icon: string;
    unlockedAt: string;
  }>;
}

const WelcomeBanner = ({
  childName,
  avatarUrl,
  avatarAlt,
  totalStars,
  storiesCompleted = 12,
  readingTimeMinutes = 233,
  recentBadges,
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
            className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-primary shadow-warm hover:scale-105 transition-transform duration-100"
          >
            <img
              src={avatarUrl}
              alt={avatarAlt}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Welcome Message */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-2">
            Welcome back, {childName}!
          </h1>
          <p className="font-body text-lg text-muted-foreground">
            Ready for another amazing reading adventure?
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
                <span className="font-body text-sm text-muted-foreground">Stars earned:</span>
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
                <span className="font-body text-sm text-muted-foreground">Stories completed:</span>
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
                <span className="font-body text-sm text-muted-foreground">Minutes read: </span>
                <span className="font-heading font-semibold text-foreground">
                  {readingTimeMinutes}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

      </div>

   </div>
      {/* Recent Badges */}
      {recentBadges.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-1 p-1 bg-accent hover:bg-accent/70 text-white rounded-full"
            >
              <TrophyIcon size={20} className="" />
            </motion.div>
            <h2 className="font-heading text-lg text-foreground">
              Recent Achievements
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {recentBadges.map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex items-center gap-1 bg-primary/10 hover:bg-primary/15 rounded-xl px-4 "
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="font-body font-semibold text-foreground">
                  {badge.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeBanner;
