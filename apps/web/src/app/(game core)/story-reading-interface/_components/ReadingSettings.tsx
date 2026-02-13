"use client";

import { Lightbulb, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ReadingSettingsProps {
  textSize: "small" | "medium" | "large";
  onTextSizeChange: (size: "small" | "medium" | "large") => void;
  highContrast: boolean;
  onHighContrastToggle: () => void;
  onClose: () => void;
}

const ReadingSettings = ({
  textSize,
  onTextSizeChange,
  highContrast,
  onHighContrastToggle,
  onClose,
}: ReadingSettingsProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-warm-xl p-6 md:p-8 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl text-foreground">
            Reading Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent hover:text-white rounded-full transition-smooth"
            aria-label="Close settings"
          >
            <X  />
          </button>
        </div>

        {/* Text Size */}
        <div className="mb-6">
          <label className="block font-body font-semibold text-foreground mb-3">
            Text Size
          </label>
          <div className="flex gap-3">
            {(["small", "medium", "large"] as const).map((size) => (
              <button
                key={size}
                onClick={() => onTextSizeChange(size)}
                className={`flex-1 px-4 py-3 rounded-lg font-body font-medium transition-smooth ${
                  textSize === size
                    ? "bg-accent text-accent-foreground shadow-warm"
                    : "bg-muted hover:bg-accent/20"
                }`}
              >
                <span
                  className={
                    size === "small"
                      ? "text-sm"
                      : size === "medium"
                        ? "text-base"
                        : "text-lg"
                  }
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* High Contrast */}
        {/* <div className="mb-6">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="block font-body font-semibold text-foreground mb-1">
                High Contrast Mode
              </span>
              <span className="block font-caption text-sm text-muted-foreground">
                Easier reading for visual accessibility
              </span>
            </div>
            
          </label>
        </div> */}

        {/* Reading Tips */}
        <div className="bg-accent/10 border-2 border-accent/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="text-accent w-12 h-12" />
            <div>
              <p className="font-body font-semibold text-foreground mb-1">
                Reading Tip
              </p>
              <p className="font-caption text-sm text-muted-foreground">
                Use the audio controls to listen along while reading. This helps
                improve pronunciation and comprehension!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingSettings;
