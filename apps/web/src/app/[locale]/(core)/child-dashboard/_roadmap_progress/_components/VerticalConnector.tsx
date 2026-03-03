'use client';

import { motion } from 'motion/react';

interface VerticalConnectorProps {
  worldColor: string;
  isNextStoryLocked?: boolean;
}

const colorMap: Record<string, { stroke: string }> = {
  emerald: { stroke: '#10b981' },
  blue: { stroke: '#3b82f6' },
  purple: { stroke: '#a855f7' },
  amber: { stroke: '#f59e0b' },
  pink: { stroke: '#ec4899' },
  indigo: { stroke: '#6366f1' },
};

export default function VerticalConnector({
  worldColor,
  isNextStoryLocked = false,
}: VerticalConnectorProps) {
  const colors = colorMap[worldColor as keyof typeof colorMap] || colorMap.blue;

  return (
    <div className="flex justify-center py-2">
      <motion.svg
        width="4"
        height="80"
        viewBox="0 0 4 80"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="overflow-visible"
      >
        <motion.line
          x1="2"
          y1="0"
          x2="2"
          y2="80"
          stroke={colors.stroke}
          strokeWidth="3"
          strokeLinecap="round"
          opacity={isNextStoryLocked ? 0.4 : 0.8}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />

        {/* Animated glow effect */}
        <motion.circle
          cx="2"
          cy="20"
          r="2"
          fill={colors.stroke}
          animate={{ cy: [0, 80], opacity: [0, 1, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.svg>
    </div>
  );
}
