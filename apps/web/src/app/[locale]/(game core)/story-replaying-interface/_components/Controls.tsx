"use client";

import { CirclePause, CirclePlay, Pause, Play } from "lucide-react";
import { useState, useEffect } from "react";

interface TTSControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
}

const Controls = ({ isPlaying, onPlayPause }: TTSControlsProps) => {
  return (
    <div className="flex border border-accent items-center justify-center gap-2 sm:gap-4 p-3 sm:p-4 bg-card rounded-xl shadow-warm">
      {/* previous button  */}

      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        className="w-10 h-10 sm:w-11 sm:h-11 text-white bg-accent rounded-full flex items-center justify-center shadow-warm hover:scale-110 transition-smooth flex-shrink-0"
        aria-label={isPlaying ? "Pause reading" : "Play reading"}
      >
        {isPlaying ? <Pause size={18} className="sm:size-5" /> : <Play size={18} className="sm:size-5" />}
      </button>

      {/* next button  */}
    </div>
  );
};

export default Controls;
