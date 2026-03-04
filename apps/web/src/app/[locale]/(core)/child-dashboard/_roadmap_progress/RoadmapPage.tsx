"use client";

import { useState, useEffect } from "react";

import { motion } from "motion/react";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChildProfile, Roadmap, RoleType } from "@shared/types";
import WorldTabs from "./_components/WorldTabs";
import StoriesRoadmap from "./_components/StoriesRoadmap";
import { useLocale } from "@/src/contexts/LocaleContext";

interface RoadmapPageProps {
  userRole: RoleType
  child: ChildProfile;
  roadmap: Roadmap;
  setSeeRoadmap: (see: boolean) => void;
}

export default function RoadmapPage({
  userRole,
  child,
  roadmap,
  setSeeRoadmap,
}: RoadmapPageProps) {
  const t = useTranslations("ChildDashboard");
    const {isRTL} = useLocale();

  const [selectedWorldId, setSelectedWorldId] = useState(roadmap.worlds[0].id);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const selectedWorld = roadmap.worlds.find((w) => w.id === selectedWorldId);

  if (!selectedWorld) {
    return null;
  }

  return (
    <>
      <main className="space-y-3 mx-auto px-4 py-4 md:px-6 md:py-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button variant={"outline"} onClick={() => setSeeRoadmap(false)} className="px-2 py-1 md:px-3 md:py-2">
            {isRTL ? <ChevronLeft size={18} className="rotate-180" /> : <ChevronLeft size={18} />}
          </Button>

          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
              {t("roadmapPage.title", { name: roadmap.theme.name })}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-prose">
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
          className="p-6 hidden md:block rounded-xl bg-muted/30 border border-border text-center"
        >
          <p className="text-muted-foreground">
            💡 <span className="font-semibold">{t("roadmapPage.proTip")}</span> {t("roadmapPage.proTipMessage")}
          </p>
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: selectedWorld.stories.length * 0.1 + 0.3 }}
          className="flex justify-center mb-8 "
        >
          <div className="bg-linear-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl px-6 py-4 text-center max-w-sm">
            <p className="font-medium text-foreground">
              🎯 <span className="font-medium">Journey Progress</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete all stories in {selectedWorld.name} to unlock special
              rewards!
            </p>
          </div>
        </motion.div> */}

        {/* Roadmap Tree */}
        <section>
          <StoriesRoadmap
            selectedWorld={selectedWorld}
            roadmap={roadmap}
            childProfile={child}
            userRole={userRole}
          />
        </section>

        {/* Footer Info */}
        {/* End of Roadmap Message */}
      </main>
    </>
  );
}
