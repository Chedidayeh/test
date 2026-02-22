'use client';

import { ChildProgress } from '../_data/roadmapMockData';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProgressHeaderProps {
  progress: ChildProgress;
}

export default function ProgressHeader({ progress }: ProgressHeaderProps) {
  const [displayXP, setDisplayXP] = useState(0);

  // Animate XP counter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayXP(progress.currentXP);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress.currentXP]);

  const xpPercent = (progress.currentXP / progress.xpToNextLevel) * 100;
  const nextLevel = progress.currentLevel + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-linear-to-r from-primary/5 via-purple-500/5 to-blue-500/5 border-2 border-primary/20 rounded-2xl p-6 mb-8 overflow-hidden"
    >
      {/* Animated Background Elements */}
      <motion.div
        className="absolute -right-20 -top-20 w-40 h-40 bg-linear-to-br from-primary via-purple-500 to-transparent rounded-full opacity-20 blur-3xl"
        animate={{ x: [0, 10, 0], y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10">
        {/* Top Row: Level and Stars */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          {/* Level Card */}
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-white"
            >
              <div className="text-center">
                <div className="text-xs font-medium opacity-80">LEVEL</div>
                <div className="text-3xl font-heading font-bold">{progress.currentLevel}</div>
              </div>
            </motion.div>

            <div>
              <h3 className="font-heading text-2xl font-bold text-foreground">
                Level {progress.currentLevel}
              </h3>
              <p className="text-sm text-muted-foreground">
                {Math.floor(xpPercent)}% to Level {nextLevel}
              </p>
            </div>
          </div>

          {/* Stars Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="px-6 py-4 rounded-xl bg-linear-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-400/30"
          >
            <div className="flex items-center gap-2">
              <span className="text-3xl">⭐</span>
              <div>
                <div className="text-sm text-muted-foreground">Stars Earned</div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {progress.starsEarned}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* XP Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Experience Points</span>
            </div>
            <motion.span className="text-sm font-semibold text-primary">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {Math.floor(displayXP)} / {progress.xpToNextLevel}
              </motion.span>
              <span className="text-muted-foreground ml-2">XP</span>
            </motion.span>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-muted rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1, type: 'spring', stiffness: 100 }}
              className="h-full bg-linear-to-r from-primary via-purple-500 to-blue-500 rounded-full shadow-lg shadow-primary/50 relative"
            >
              {/* Shimmer Effect */}
              <motion.div
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>

          {/* Milestone Markers */}
          <div className="flex justify-between mt-2">
            {[0, 25, 50, 75, 100].map((mark) => (
              <div
                key={mark}
                className={`h-1 w-1 rounded-full ${
                  xpPercent >= mark ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex gap-4 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <span>📖</span>
            <span>{progress.completedStories.length} stories completed</span>
          </div>
          <div className="w-px bg-border" />
          <div className="flex items-center gap-2">
            <span>🌍</span>
            <span>{progress.completedWorlds.length} worlds conquered</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
