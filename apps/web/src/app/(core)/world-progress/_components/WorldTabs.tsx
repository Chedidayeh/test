"use client";

import { World } from "../_data/roadmapMockData";
import { motion } from "motion/react";
import { Lock } from "lucide-react";

interface WorldTabsProps {
  worlds: World[];
  selectedWorldId: string;
  onWorldSelect: (worldId: string) => void;
  currentLevel: number;
}

export default function WorldTabs({
  worlds,
  selectedWorldId,
  onWorldSelect,
  currentLevel,
}: WorldTabsProps) {
  const selectedWorld = worlds.find((w) => w.id === selectedWorldId);
  const isWorldUnlocked = (world: World) => currentLevel >= world.unlockLevel;

  return (
    <div className="w-full">
      {/* World Tabs */}
      <div className="flex flex-col gap-2">
        {/* Tabs Container */}
        <div className="flex items-center justify-center">
          <div className="flex flex-wrap gap-3 bg-card rounded-xl border p-3 max-w-max items-center justify-center ">
            {worlds.map((world) => {
              const isLocked = !isWorldUnlocked(world);
              const isSelected = world.id === selectedWorldId;

              return (
                <motion.button
                  key={world.id}
                  onClick={() => !isLocked && onWorldSelect(world.id)}
                  disabled={isLocked}
                  whileHover={!isLocked ? { scale: 1.05 } : {}}
                  whileTap={!isLocked ? { scale: 0.98 } : {}}
                  className={`
                  relative px-4 py-2 rounded-xl transition-all duration-300
                  flex items-center gap-2
                  ${
                    isSelected
                      ? "text-white shadow-lg bg-primary"
                      : isLocked
                        ? "text-muted-foreground opacity-50"
                        : "text-foreground hover:text-primary"
                  }
                `}
                >
                  {/* Background for selected tab */}
                  {isSelected && (
                    <motion.div
                      layoutId="worldTabBackground"
                      className={`absolute inset-0 rounded-lg -z-10`}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}

                  <span className="hidden sm:inline">{world.name}</span>

                  {/* Lock Badge */}
                  {isLocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Lock className="w-4 h-4" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
        {/* World Description Card */}
        {selectedWorld && (
          <motion.div
            key={selectedWorld.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`
            flex items-center justify-center
            `}
          >
            <div className="flex-1 text-center">
              <p className="text-muted-foreground mb-3">
                {selectedWorld.description}
              </p>

              {/* Story Count */}
              <div className="mt-3 flex items-center justify-center gap-4">
                <span className="text-muted-foreground">
                  {selectedWorld.stories.length} stories
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  {
                    selectedWorld.stories.filter(
                      (s) => s.status === "completed",
                    ).length
                  }
                  /{selectedWorld.stories.length} completed
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
