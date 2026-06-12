import { cn } from "@/lib/utils";

type Difficulty = "Easy" | "Medium" | "Hard";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

const styles: Record<Difficulty, string> = {
  Easy: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20",
  Medium: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20",
  Hard: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20",
};

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        styles[difficulty],
        className
      )}
    >
      {difficulty}
    </span>
  );
}
