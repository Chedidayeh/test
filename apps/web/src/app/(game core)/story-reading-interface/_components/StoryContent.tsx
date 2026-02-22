
import { motion, AnimatePresence } from "framer-motion";
import { StoryPage } from "./storyDataTransform";

interface StoryContentProps {
  currentPage: StoryPage;
  textSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  highlightedWord?: number;
}

const StoryContent = ({ currentPage, textSize, highContrast, highlightedWord }: StoryContentProps) => {
  const textSizeClasses = {
    small: 'text-lg md:text-xl',
    medium: 'text-xl md:text-2xl',
    large: 'text-2xl md:text-3xl',
  };

  const words = currentPage.text.split(' ');

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage.pageNumber}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className={`flex flex-col gap-8 ${highContrast ? 'bg-black text-white' : 'text-foreground'}`}
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
      <div className={`font-body ${textSizeClasses[textSize]} leading-relaxed space-y-4`}>
        {words.map((word, index) => (
          <span
            key={index}
            className={`${
              highlightedWord === index
                ? 'bg-accent text-accent-foreground rounded transition-smooth'
                : ''
            }`}
          >
            {word}{' '}
          </span>
        ))}
      </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryContent;