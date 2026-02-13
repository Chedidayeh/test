"use client";

import { Badge } from "../_data/mockData";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

interface BadgeCardProps {
  badge: Badge;
  index: number;
}

const rarityColors: Record<Badge["rarity"], string> = {
  common: "bg-gray-100 border-gray-300",
  uncommon: "bg-green-100 border-green-300",
  rare: "bg-blue-100 border-blue-300",
  legendary: "bg-yellow-100 border-yellow-300",
};

const rarityTextColors: Record<Badge["rarity"], string> = {
  common: "text-gray-700",
  uncommon: "text-green-700",
  rare: "text-blue-700",
  legendary: "text-yellow-700",
};

const rarityLabels: Record<Badge["rarity"], string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  legendary: "Legendary",
};

export default function BadgeCard({ badge, index }: BadgeCardProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.1, y: -4 }}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${rarityColors[badge.rarity]}`}
          >
            <span className="text-5xl">{badge.icon}</span>
            <p className={`font-semibold text-sm text-center ${rarityTextColors[badge.rarity]}`}>
              {badge.name}
            </p>
            <p className={`text-xs font-medium ${rarityTextColors[badge.rarity]}`}>
              {rarityLabels[badge.rarity]}
            </p>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{badge.name}</p>
            <p className="text-sm">{badge.description}</p>
            <p className="text-xs text-muted-foreground pt-1">
              Unlocked: {new Date(badge.unlockedAt).toLocaleDateString()}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
