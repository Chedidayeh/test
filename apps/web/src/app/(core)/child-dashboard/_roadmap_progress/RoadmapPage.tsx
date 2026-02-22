"use client";

import { useState } from "react";

import { motion } from "motion/react";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { ChildProfile, Roadmap } from "@shared/types";
import WorldTabs from "./_components/WorldTabs";
import StoriesRoadmap from "./_components/StoriesRoadmap";

interface RoadmapPageProps {
  child: ChildProfile;
  roadmap: Roadmap;
  setSeeRoadmap: (see: boolean) => void;
}

export default function RoadmapPage({
  child,
  roadmap,
  setSeeRoadmap,
}: RoadmapPageProps) {
  const [selectedWorldId, setSelectedWorldId] = useState(roadmap.worlds[0].id);

  const selectedWorld = roadmap.worlds.find((w) => w.id === selectedWorldId);

  if (!selectedWorld) {
    return null;
  }

  return (
    <>
      <main className="space-y-2 mx-auto px-4 py-2">
        <div className="flex items-center gap-4">
          <Button variant={"outline"} onClick={() => setSeeRoadmap(false)}>
            <ChevronLeft size={20} />
          </Button>

          <div>
            <h1 className="text-2xl font-bold">
              Roadmap: {roadmap.theme.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {roadmap.theme.description}
            </p>
          </div>
        </div>

        {/* World Selection Tabs */}

        <section className="">
          <WorldTabs
            worlds={roadmap.worlds}
            selectedWorldId={selectedWorldId}
            onWorldSelect={setSelectedWorldId}
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
          <StoriesRoadmap
            selectedWorld={selectedWorld}
            childProfile={child}
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
