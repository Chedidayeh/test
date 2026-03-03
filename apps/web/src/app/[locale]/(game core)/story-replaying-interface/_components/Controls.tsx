"use client";

import { CirclePause, CirclePlay, Pause, Play } from "lucide-react";
import { useState, useEffect } from "react";

interface TTSControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
}

const Controls = ({ isPlaying, onPlayPause }: TTSControlsProps) => {
  return (
    <div className="flex border border-accent items-center justify-center gap-4 p-4 bg-card rounded-xl shadow-warm">
      {/* previous button  */}

      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        className="w-11 h-11 text-white bg-accent rounded-full flex items-center justify-center shadow-warm hover:scale-110 transition-smooth"
        aria-label={isPlaying ? "Pause reading" : "Play reading"}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* next button  */}
    </div>
  );
};

export default Controls;
