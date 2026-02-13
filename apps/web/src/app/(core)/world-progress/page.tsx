"use client";

import { useState } from "react";
import { ALL_WORLDS, MOCK_CHILD_PROGRESS } from "./_data/roadmapMockData";
import WorldTabs from "./_components/WorldTabs";
import Roadmap from "./_components/Roadmap";
import { motion } from "motion/react";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RoadmapPage() {
  const router = useRouter();
  const [selectedWorldId, setSelectedWorldId] = useState(ALL_WORLDS[0].id);

  const selectedWorld = ALL_WORLDS.find((w) => w.id === selectedWorldId);

  if (!selectedWorld) {
    return null;
  }

  return (
    <>
      <main className="space-y-4 mx-auto px-4 py-2">
        {/* World Selection Tabs */}

        <section className="">
          <WorldTabs
            worlds={ALL_WORLDS}
            selectedWorldId={selectedWorldId}
            onWorldSelect={setSelectedWorldId}
            currentLevel={MOCK_CHILD_PROGRESS.currentLevel}
          />
        </section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 rounded-xl bg-muted/30 border border-border text-center"
        >
          <p className="text-sm text-muted-foreground">
            💡 <span className="font-semibold">Pro Tip:</span> Hover over story
            cards to see details. Complete stories to earn stars and unlock new
            challenges!
          </p>
        </motion.div>

        {/* Roadmap Tree */}
        <section>
          {/* first try :  */}
          <Roadmap
            selectedWorld={selectedWorld}
            currentStoryId={`story-${selectedWorldId.split("-")[1]}-${MOCK_CHILD_PROGRESS.currentLevel}`}
          />
        </section>

        {/* Footer Info */}
        {/* End of Roadmap Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: selectedWorld.stories.length * 0.1 + 0.3 }}
          className="flex justify-center mb-8 "
        >
          <div className="bg-linear-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl px-6 py-4 text-center max-w-sm">
            <p className="text-sm font-medium text-foreground">
              🎯 <span className="font-semibold">Journey Progress</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete all stories in {selectedWorld.name} to unlock special
              rewards!
            </p>
          </div>
        </motion.div>
      </main>
    </>
  );
}
