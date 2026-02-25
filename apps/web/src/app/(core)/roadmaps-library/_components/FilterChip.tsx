'use client';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  color?: string;
}

const FilterChip = ({ label, isActive, onClick , color }: FilterChipProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-lg font-body text-sm transition-all border ${
        isActive
          ? `bg-${color} text-${color}-foreground font-medium border-${color} shadow-md`
          : `bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground/90 border-foreground/10 hover:border-${color}/40`
      }`}
    >
      {label}
    </button>
  );
};

export default FilterChip;