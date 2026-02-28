import { Lightbulb, PencilIcon } from "lucide-react";

interface FloatingItemsProps {
  attempts: number;
  hintsUsed: number;
  totalHints: number;
}

const FloatingItems = ({
  attempts,
  hintsUsed,
  totalHints,
}: FloatingItemsProps) => {
  return (
    <div className="fixed top-25 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      <div className="flex items-center gap-3 bg-card/90 backdrop-blur-md rounded-full px-3 py-2 shadow-warm pointer-events-auto">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
          <PencilIcon size={20} className="text-primary" />
        </div>
        <div className="text-right">
          <p className="font-caption text-xs text-muted-foreground uppercase tracking-wider">
            Attempts
          </p>
          <p className="font-data text-lg font-bold text-foreground">
            {attempts}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-card/90 backdrop-blur-md rounded-full px-3 py-2 shadow-warm pointer-events-auto">
        <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
          <Lightbulb size={20} className="text-secondary" />
        </div>
        <div className="text-right">
          <p className="font-caption text-xs text-muted-foreground uppercase tracking-wider">
            Hints Used
          </p>
          <p className="font-data text-lg font-bold text-foreground">
            {hintsUsed}/{totalHints}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FloatingItems;