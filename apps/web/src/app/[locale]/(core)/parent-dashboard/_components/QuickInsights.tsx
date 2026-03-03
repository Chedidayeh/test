"use client";

import { AIInsight } from "../_data/mockData";
import { motion } from "framer-motion";

interface QuickInsightsProps {
  insights: AIInsight[];
}

const insightColorMap: Record<AIInsight["type"], string> = {
  achievement:
    "border-green-200 bg-green-50 text-green-900",
  progress:
    "border-blue-200 bg-blue-50 text-blue-900",
  "area-for-growth":
    "border-amber-200 bg-amber-50 text-amber-900",
  motivation:
    "border-pink-200 bg-pink-50 text-pink-900",
};

export default function QuickInsights({ insights }: QuickInsightsProps) {
  return (
    <div className="rounded-xl bg-card border border-black/30 p-6 shadow-warm-lg">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🤖</span>
        <h2 className="font-heading text-2xl text-foreground">AI Insights</h2>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg border p-4 flex gap-3 ${insightColorMap[insight.type]}`}
          >
            <span className="text-xl shrink-0">{insight.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{insight.title}</p>
              <p className="text-sm opacity-90 mt-1">{insight.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
