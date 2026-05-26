
import { motion, AnimatePresence } from "framer-motion";
import { StoryPage } from "./storyDataTransform";

interface StoryContentProps {
  currentPage: StoryPage;
  textSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  highlightedWord?: number;
  highlightMode?: 'word' | 'sentence';
}

const StoryContent = ({ currentPage, textSize, highContrast, highlightedWord, highlightMode = 'sentence' }: StoryContentProps) => {
  const textSizeClasses = {
    small: 'text-base sm:text-lg md:text-xl',
    medium: 'text-lg sm:text-xl md:text-2xl',
    large: 'text-xl sm:text-2xl md:text-3xl',
  };

  const words = currentPage.text.split(' ');

  // Split text into sentences for sentence-mode highlighting
  const sentences = currentPage.text.match(/[^.!?؟]+[.!?؟]*/g) ?? [currentPage.text];

  // Map each word index → sentence index
  const wordToSentence: number[] = [];
  let sentIdx = 0;
  for (const sentence of sentences) {
    const count = sentence.trim().split(/\s+/).filter(Boolean).length;
    for (let i = 0; i < count; i++) wordToSentence.push(sentIdx);
    sentIdx++;
  }

  const activeSentenceIndex = highlightedWord !== undefined ? (wordToSentence[highlightedWord] ?? -1) : -1;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage.pageNumber}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className={`flex flex-col gap-4 sm:gap-6 md:gap-8 ${highContrast ? 'bg-black text-white' : 'text-foreground'}`}
      >
      {/* Story Image */}
      {/* <div className="w-full aspect-video rounded-xl overflow-hidden shadow-warm-lg">
        <img
          src={currentPage.image}
          alt={currentPage.alt}
          className="w-full h-full object-cover"
        />
      </div> */}

      {/* Story Text */}
      <div className={`font-body ${textSizeClasses[textSize]} leading-relaxed`}>
        {highlightMode === 'sentence' ? (
          // Sentence mode: each sentence is one span — clean highlight, no word-gap or BiDi issues
          sentences.map((sentence, idx) => (
            <span
              key={idx}
              className={idx === activeSentenceIndex
                ? 'bg-accent text-accent-foreground rounded-lg px-1.5 py-0.5 font-medium'
                : ''
              }
            >
              {sentence}
            </span>
          ))
        ) : (
          // Word mode: highlight one word at a time
          words.map((word, index) => (
            <span
              key={index}
              className={highlightedWord === index
                ? 'bg-accent text-accent-foreground rounded font-medium'
                : ''
              }
            >
              {word}{' '}
            </span>
          ))
        )}
      </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryContent;