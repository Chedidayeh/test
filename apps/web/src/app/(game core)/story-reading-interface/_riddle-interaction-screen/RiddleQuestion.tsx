import { Pause, Play, Puzzle } from "lucide-react";


interface RiddleQuestionProps {
  question: string;
  storyImage: string;
  storyImageAlt: string;
  riddleNumber: number;
  totalRiddles: number;
  onAudioPlay: () => void;
  isAudioPlaying: boolean;
}

const RiddleQuestion = ({
  question,
  storyImage,
  storyImageAlt,
  riddleNumber,
  totalRiddles,
  onAudioPlay,
  isAudioPlaying,
}: RiddleQuestionProps) => {
  return (
    <div className="bg-card rounded-xl shadow-warm-lg p-6">
      {/* Riddle Counter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Puzzle size={24} className="text-secondary" />
          <span className="font-heading text-lg text-foreground">
            Riddle {riddleNumber} of {totalRiddles}
          </span>
        </div>
        <button
          onClick={onAudioPlay}
          className="p-3 rounded-full bg-secondary text-white hover:scale-105 transition-smooth shadow-warm"
          aria-label={isAudioPlaying ? 'Stop reading riddle' : 'Read riddle aloud'}
        >
          {isAudioPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>

      {/* Story Context Image */}
      {/* <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6 shadow-warm">
        <img
          src={storyImage}
          alt={storyImageAlt}
          className="w-full h-full object-cover"
        />
      </div> */}

      {/* Riddle Question */}
      <div className="bg-secondary/10 rounded-xl p-6 border-2 border-secondary/30">
        <p className="font-body text-xl md:text-2xl text-foreground leading-relaxed text-center">
          {question}
        </p>
      </div>
    </div>
  );
};

export default RiddleQuestion;