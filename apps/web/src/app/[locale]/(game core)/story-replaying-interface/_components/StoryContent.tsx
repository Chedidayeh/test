
import { motion, AnimatePresence } from "framer-motion";
import { StoryPage, splitSentences } from "./storyDataTransform";
import Image from "next/image";
interface StoryContentProps {
  currentPage: StoryPage;
  textSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  highlightedWord?: number;
  highlightedSentence?: number;
  highlightMode?: 'word' | 'sentence';
}

const StoryContent = ({ currentPage, textSize, highContrast, highlightedWord, highlightedSentence, highlightMode = 'sentence' }: StoryContentProps) => {
  const textSizeClasses = {
    small: 'text-base sm:text-lg md:text-xl',
    medium: 'text-lg sm:text-xl md:text-2xl',
    large: 'text-xl sm:text-2xl md:text-3xl',
  };

  const words = currentPage.text.split(' ');
  const sentences = splitSentences(currentPage.text);

  const wordToSentence: number[] = [];
  let sentIdx = 0;
  for (const sentence of sentences) {
    const count = sentence.split(' ').length;
    for (let i = 0; i < count; i++) wordToSentence.push(sentIdx);
    sentIdx++;
  }

  const activeSentenceIndex =
    highlightedSentence !== undefined
      ? highlightedSentence
      : highlightedWord !== undefined
        ? (wordToSentence[highlightedWord] ?? -1)
        : -1;

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
        {currentPage.image && (
          <div className="flex items-center justify-center">
            <div className="w-lg rounded-xl overflow-hidden shadow-warm-lg">
              <Image 
                src={currentPage.image}
                alt={currentPage.alt}
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

      {/* Story Text */}
      <div className={`font-body ${textSizeClasses[textSize]} leading-relaxed`}>
        {highlightMode === 'sentence' ? (
          sentences.map((sentence, idx) => (
            <span
              key={idx}
              className={idx === activeSentenceIndex
                ? 'bg-accent text-accent-foreground rounded-lg px-0.5 py-0.5 font-medium'
                : ''
              }
            >
              {sentence}
            </span>
          ))
        ) : (
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