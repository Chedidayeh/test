'use client';

import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";


interface Choice {
  id: string;
  text: string;
}

interface MultipleChoiceAnswerProps {
  choices: Choice[];
  selectedChoice: string | null;
  onSelect: (choiceId: string) => void;
  isDisabled: boolean;
}

const MultipleChoiceAnswer = ({
  choices,
  selectedChoice,
  onSelect,
  isDisabled,
}: MultipleChoiceAnswerProps) => {
  const t = useTranslations("StoryReadingInterface.riddleInterface");

  return (
    <div className="space-y-2 sm:space-y-4">
      <label className="block font-body font-semibold text-sm sm:text-base text-foreground mb-2 sm:mb-4">
        {t("multipleChoiceAnswer.chooseAnswer")}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
        {choices.map((choice) => {
          const isSelected = selectedChoice === choice.id;
          return (
            <button
              key={choice.id}
              onClick={() => onSelect(choice.id)}
              disabled={isDisabled}
              className={`p-3 sm:p-4 rounded-xl border-2 transition-smooth text-left ${
                isSelected
                  ? 'border-secondary bg-secondary/10 shadow-warm'
                  : 'border-border bg-card hover:border-secondary/50 hover:bg-secondary/5'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-start gap-2 sm:gap-4">
                <div
                  className={`shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-smooth ${
                    isSelected
                      ? 'border-secondary bg-secondary' :'border-border bg-input'
                  }`}
                >
                  {isSelected && (
                    <CircleCheck size={16} className="sm:size-5 text-white" />
                  )}
                </div>
                <span className="font-body text-sm sm:text-lg text-foreground flex-1">
                  {choice.text}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoiceAnswer;