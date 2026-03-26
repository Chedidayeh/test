"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";

interface AiStorytellingIntroProps {
  onContinue: () => void;
}

export function AiStorytellingIntro({ onContinue }: AiStorytellingIntroProps) {
  const [isOpen, setIsOpen] = useState(true);
  const t = useTranslations("AiStorytellingIntro");

  const handleContinue = () => {
    setIsOpen(false);
    onContinue();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl sm:text-3xl">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6 py-4"
        >
          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Personalized Stories */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center p-4 rounded-lg bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20"
            >
              <BookOpen className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-center text-sm sm:text-base">
                {t("feature1Title")}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-center mt-2">
                {t("feature1Desc")}
              </p>
            </motion.div>

            {/* Card 2: Learning Goals */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col items-center p-4 rounded-lg bg-linear-to-br from-accent/10 to-accent/5 border border-accent/20"
            >
              <Lightbulb className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-semibold text-center text-sm sm:text-base">
                {t("feature2Title")}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-center mt-2">
                {t("feature2Desc")}
              </p>
            </motion.div>

            {/* Card 3: Engaging Adventures */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col items-center p-4 rounded-lg bg-linear-to-br from-secondary/10 to-secondary/5 border border-secondary/20"
            >
              <Sparkles className="w-8 h-8 text-secondary mb-3" />
              <h3 className="font-semibold text-center text-sm sm:text-base">
                {t("feature3Title")}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-center mt-2">
                {t("feature3Desc")}
              </p>
            </motion.div>
          </div>

          {/* Main description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-muted/50 rounded-lg p-4 border border-muted"
          >
            <p className="text-sm text-foreground text-center leading-relaxed">
              {t("mainDescription")}
            </p>
          </motion.div>
        </motion.div>

        {/* Action button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex justify-center pt-2"
        >
          <Button onClick={handleContinue} size="lg" className="w-full sm:w-auto">
            {t("continueButton")}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
