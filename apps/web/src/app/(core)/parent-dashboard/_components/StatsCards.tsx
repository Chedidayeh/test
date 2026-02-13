"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  color: string;
  textColor: string;
  suffix?: string;
}

const StatCard = ({ icon, label, value, color, textColor, suffix }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      current = increment * stepCount;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`rounded-xl p-2 px-4 shadow-warm-lg border border-black/30 ${color} flex flex-col gap-2`}
    >
      <div className="flex items-center justify-between">
        <span className="text-4xl">{icon}</span>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className={`text-3xl font-data font-bold ${textColor}`}>
          {displayValue}
        </p>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </motion.div>
  );
};

interface StatsCardsProps {
  totalStars: number;
  storiesCompleted: number;
  totalReadingTime: number;
  riddlesSolved: number;
}

export default function StatsCards({
  totalStars,
  storiesCompleted,
  totalReadingTime,
  riddlesSolved,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        icon=""
        label="Total Stars"
        value={totalStars}
        color="bg-gradient-to-br from-yellow-50 to-amber-50"
        textColor="text-yellow-600"
      />
      <StatCard
        icon=""
        label="Stories Completed"
        value={storiesCompleted}
        color="bg-gradient-to-br from-blue-50 to-cyan-50"
        textColor="text-blue-600"
      />
      <StatCard
        icon=""
        label="Reading Time"
        value={Math.round(totalReadingTime / 60)}
        suffix="min"
        color="bg-gradient-to-br from-purple-50 to-pink-50"
        textColor="text-purple-600"
      />
      <StatCard
        icon=""
        label="Riddles Solved"
        value={riddlesSolved}
        color="bg-gradient-to-br from-green-50 to-emerald-50"
        textColor="text-green-600"
      />
    </div>
  );
}
