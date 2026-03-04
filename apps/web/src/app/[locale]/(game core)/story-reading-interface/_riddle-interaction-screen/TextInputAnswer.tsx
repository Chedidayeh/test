'use client';

import { Button } from '@/src/components/ui/button';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface TextInputAnswerProps {
  onSubmit: (answer: string) => void;
  isDisabled: boolean;
  placeholder?: string;
}

const TextInputAnswer = ({
  onSubmit,
  isDisabled,
  placeholder,
}: TextInputAnswerProps) => {
  const t = useTranslations("StoryReadingInterface.riddleInterface");
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && answer.trim() && !isDisabled) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <label className="block font-body text-foreground text-lg">
        {t("textInputAnswer.yourAnswer")}
      </label>
      <div className="flex gap-3">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isDisabled}
          placeholder={placeholder || t("textInputAnswer.placeholder")}
          spellCheck={true}
          className="flex-1 px-6 py-2 rounded-xl border bg-secondary/10 text-foreground text-lg transition-smooth disabled:opacity-50"
        />
        <Button
          onClick={handleSubmit}
          disabled={!answer.trim() || isDisabled}
          variant={"secondary"}
        >
          {t("textInputAnswer.checkButton")}
        </Button>
      </div>
    </div>
  );
};

export default TextInputAnswer;