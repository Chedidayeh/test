"use client";

import { motion } from "framer-motion";
import { Badge, Local, LanguageCode } from "@readdly/shared-types";
import { LockIcon, StarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "@/src/contexts/LocaleContext";
import { getLanguageCode } from "@/src/lib/translation-utils";

interface BadgeCardProps {
  badge: Badge;
  index: number;
  isLocked?: boolean;
  showDetails?: boolean;
}

// Enhanced badge style matching ProgressTracker aesthetic
const BADGE_STYLE = {
  base: "bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/50 shadow-warm hover:shadow-lg hover:border-primary/70",
  locked: "bg-muted/40 border-muted/50 opacity-60 hover:opacity-80 shadow-warm ",
  text: "text-foreground font-heading",
  label: "text-primary font-semibold",
  icon: "text-4xl",
};

export default function BadgeCard({
  badge,
  index,
  isLocked = false,
  showDetails = true,
}: BadgeCardProps) {
  const t = useTranslations("ParentDashboard");
  const {locale} = useLocale();


  const langCode = getLanguageCode(locale);

  const translation = badge.translations?.find((tr) => tr.languageCode === langCode);
  const localizedName = translation?.name || badge.name;
  const localizedDescription = translation?.description || badge.description;
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.08, 
        duration: 0.5,
        ease: "easeOut",
        scale: {
          type: "spring",
          stiffness: 300,
          damping: 30
        }
      }}
      whileHover={!isLocked ? { scale: 1.08, y: -8, transition: { duration: 0.2 } } : { transition: { duration: 0.2 } }}
      whileTap={!isLocked ? { scale: 0.95, transition: { duration: 0.1 } } : {}}
      className={`w-full min-h-64 flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 group relative overflow-hidden ${
        isLocked ? BADGE_STYLE.locked : BADGE_STYLE.base
      }`}
    >
      {/* Decorative gradient background on hover - only for unlocked */}
      {!isLocked && (
        <motion.div 
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent" 
        />
      )}

      {/* Icon */}
      <div className="relative z-10">
        {isLocked ? (
          <span className="text-3xl">🔒 </span>
        ) : (
          <span className={BADGE_STYLE.icon}>{"🏆"}</span>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-2">
        {isLocked ? (
          <>
            <p className={`text-lg font-semibold text-gray-600`}>{t("achievements.locked.title")}</p>
            <p className={`text-sm text-gray-500 px-2`}>
              {t("achievements.locked.message")}
            </p>
            <p className="text-sm text-gray-500 pt-1">
              {t("achievements.locked.required", { level: badge.level.levelNumber })}
            </p>
          </>
        ) : (
          <>
            <p className={`font-semibold text-xl leading-tight ${BADGE_STYLE.text}`}>
              {localizedName}
            </p>
            <p className={`text-sm text-gray-500 px-2`}>
              {localizedDescription}
            </p>
            <p className={`flex items-center justify-center gap-1 ${BADGE_STYLE.label}`}>
              <StarIcon size={16} />
              {t("achievements.levelLabel", { level: badge.level.levelNumber })}
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
