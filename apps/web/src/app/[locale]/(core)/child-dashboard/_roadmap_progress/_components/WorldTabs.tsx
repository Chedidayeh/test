"use client";

import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { LanguageCode, World } from "@readdly/shared-types";
import { useTranslations } from "next-intl";
import { useLocale } from "@/src/contexts/LocaleContext";
import { getLanguageCode } from "@/src/lib/translation-utils";

interface WorldTabsProps {
  worlds: World[];
  selectedWorldId: string;
  onWorldSelect: (worldId: string) => void;
}

export default function WorldTabs({
  worlds,
  selectedWorldId,
  onWorldSelect,
}: WorldTabsProps) {
  const t = useTranslations("ChildDashboard");
  const selectedWorld = worlds.find((w) => w.id === selectedWorldId);
  const { locale } = useLocale();

  const langCode = getLanguageCode(locale);

  const localizedWorld = (() => {
    const translation = selectedWorld?.translations?.find(
      (tr: { languageCode: LanguageCode }) => tr.languageCode === langCode,
    );
    return {
      description:
        translation?.description ||
        selectedWorld?.description ||
        selectedWorld?.description,
    };
  })();

  return (
    <div className="w-full">
      {/* World Tabs */}
      <div className="flex flex-col gap-2">
        {/* Tabs Container */}
        <div className="flex items-center justify-center">
          <div className="flex flex-wrap gap-3 bg-card rounded-xl border p-3 max-w-max items-center justify-center ">
            {worlds.map((world) => {
              const isSelected = world.id === selectedWorldId;
              const localizedWorld = (() => {
                const translation = world?.translations?.find(
                  (tr: { languageCode: LanguageCode }) =>
                    tr.languageCode === langCode,
                );
                return {
                  name:
                    translation?.name ||
                    world?.name ||
                    world?.name,
                };
              })();
              return (
                <motion.button
                  key={world.id}
                  onClick={() => onWorldSelect(world.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                  relative px-4 py-2 rounded-xl transition-all duration-300
                  flex items-center gap-2
                  ${
                    isSelected
                      ? "text-white shadow-lg bg-primary"
                      : "text-foreground bg-primary/10 hover:text-primary"
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

                  <span className="inline">{localizedWorld.name}</span>
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
                {localizedWorld.description}
              </p>

              {/* Story Count */}
              <div className="mt-3 flex items-center justify-center gap-4">
                <span className="text-muted-foreground">
                  {selectedWorld.stories.length}{" "}
                  {t("roadmapPage.worldTabs.storiesLabel")}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
