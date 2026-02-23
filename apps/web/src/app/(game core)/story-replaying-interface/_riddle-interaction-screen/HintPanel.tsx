"use client";

import { Button } from "@/src/components/ui/button";
import { CheckCircle, Lightbulb, SparklesIcon, X } from "lucide-react";

interface Hint {
  text: string;
}

interface HintPanelProps {
  hints: Hint[];
  currentHintLevel: number;
  availableHints: number;
  onRequestHint: () => void;
  isVisible: boolean;
  onClose: () => void;
}

const HintPanel = ({
  hints,
  currentHintLevel,
  availableHints,
  onRequestHint,
  isVisible,
  onClose,
}: HintPanelProps) => {
  if (!isVisible) return null;

  const currentHint = hints[currentHintLevel - 1];
  const hasMoreHints = currentHintLevel < hints.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-card rounded-xl shadow-warm-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 text-white bg-secondary rounded-full flex items-center justify-center">
              <Lightbulb />
            </div>
            <div>
              <h2 className="font-heading text-xl text-foreground">
                Helpful Hint
              </h2>
              <p className="font-caption text-sm text-muted-foreground">
                {availableHints} hints remaining
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-smooth"
            aria-label="Close hint panel"
          >
            <X />
          </button>
        </div>

        {/* Friendly Character */}
        <div className="p-6 flex justify-center">
          <div className="relative w-60 h-60 rounded-2xl overflow-hidden">
            <img
              src="/hint-avatars/need-help.png"
              className=" object-contain shadow-warm"
            />
          </div>
        </div>

        {/* Current Hint */}
        {currentHint && (
          <div className="px-6 pb-2">
            <div className="p-6 rounded-xl border-2 border-secondary bg-secondary/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-caption text-xs uppercase tracking-wider font-semibold text-secondary">
                  Hint {currentHintLevel} of {hints.length}
                </span>
              </div>
              <p className="font-body text-lg text-foreground leading-relaxed">
                {currentHint.text}
              </p>
            </div>
          </div>
        )}

        {/* Previous Hints */}
        {currentHintLevel > 1 && (
          <div className="px-6 pb-2">
            <h3 className="font-heading text-lg text-foreground mb-3">
              Previous Hints:
            </h3>
            <div className="space-y-3">
              {hints
                .slice(0, currentHintLevel - 1)
                .map((hint, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-muted border border-border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-success" />
                      <span className="font-caption text-xs text-muted-foreground">
                        Hint {index + 1}
                      </span>
                    </div>
                    <p className="font-body text-sm text-foreground opacity-70">
                      {hint.text}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 border-border space-y-3">
          {hasMoreHints && availableHints > 0 ? (
            <Button variant={"secondary"} className="w-full" onClick={onRequestHint}>
              Get Another Hint ({availableHints} left)
            </Button>
          ) : (
            <div className="text-center p-4 bg-muted rounded-xl">
              <p className="font-body text-foreground">
                {availableHints === 0
                  ? "No more hints available. You can do this!"
                  : "All hints revealed. Give it your best try!"}
              </p>
            </div>
          )}
          <div className="flex items-center justify-center">
            <Button variant={"outline"} onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HintPanel;
