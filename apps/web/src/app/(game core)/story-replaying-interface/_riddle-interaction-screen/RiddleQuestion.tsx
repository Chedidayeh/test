import { Pause, Play, Puzzle, Clock } from "lucide-react";
import { ChallengeType } from "@shared/types";


interface RiddleQuestionProps {
  question: string;
  storyImage: string;
  storyImageAlt: string;
  riddleNumber: number;
  totalRiddles: number;
  onAudioPlay: () => void;
  isAudioPlaying: boolean;
  elapsedTime?: number;
  challengeType?: ChallengeType;
}

const RiddleQuestion = ({
  question,
  storyImage,
  storyImageAlt,
  riddleNumber,
  totalRiddles,
  onAudioPlay,
  isAudioPlaying,
  elapsedTime = 0,
  challengeType,
}: RiddleQuestionProps) => {
  const getTypeLabel = (type?: ChallengeType): string => {
    switch (type) {
      case "TRUE_FALSE":
        return "Choose True or False:";
      case "CHOOSE_ENDING":
        return "Choose the story's ending:";
      case "MORAL_DECISION":
        return "What would you do?";
      case "MULTIPLE_CHOICE":
        return "Choose the correct answer:";
      case "RIDDLE":
        return "Solve the riddle:";
      default:
        return "Answer the question:";
    }
  };
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

      {/* Elapsed Time Display */}
      <div className="mb-6 flex items-center gap-2 p-3 bg-secondary/10 rounded-lg w-fit">
        <Clock size={20} className="text-secondary" />
        <span className="font-heading text-lg text-foreground">
          Time: {elapsedTime}s
        </span>
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
        <label className="block font-heading text-sm text-secondary mb-3">
          {getTypeLabel(challengeType)}
        </label>
        <p className="font-body text-xl md:text-2xl text-foreground leading-relaxed text-center">
          {question}
        </p>
      </div>
    </div>
  );
};

export default RiddleQuestion;