import { Pause, Play, Puzzle, Clock } from "lucide-react";
import { ChallengeType } from "@readdly/shared-types";
import { useTranslations } from "next-intl";

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
  hasAudio?: boolean;
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
  hasAudio = false,
}: RiddleQuestionProps) => {
  const t = useTranslations("StoryReadingInterface.riddleInterface");

  const getTypeLabel = (type?: ChallengeType): string => {
    switch (type) {
      case "TRUE_FALSE":
        return t("riddleQuestion.trueOrFalse");
      case "CHOOSE_ENDING":
        return t("riddleQuestion.chooseEnding");
      case "MORAL_DECISION":
        return t("riddleQuestion.moralDecision");
      case "MULTIPLE_CHOICE":
        return t("riddleQuestion.multipleChoice");
      case "RIDDLE":
        return t("riddleQuestion.riddle");
      default:
        return t("riddleQuestion.defaultQuestion");
    }
  };
  return (
    <div className="bg-card rounded-xl shadow-warm-lg p-6">
      {/* Riddle Counter */}
      <div className="flex items-center justify-center mb-6">
        {hasAudio && (
          <button
            onClick={onAudioPlay}
            className="p-3 rounded-full bg-secondary text-white hover:scale-105 transition-smooth shadow-warm"
            aria-label={
              isAudioPlaying
                ? t("riddleQuestion.stopAudio")
                : t("riddleQuestion.playAudio")
            }
          >
            {isAudioPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        )}
      </div>

      {/* Elapsed Time Display */}
      {/* <div className="mb-6 flex items-center gap-2 p-3 bg-secondary/10 rounded-lg w-fit">
        <Clock size={20} className="text-secondary" />
        <span className="font-heading text-lg text-foreground">
          {t("riddleQuestion.timeDisplay", { seconds: elapsedTime })}
        </span>
      </div> */}

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
