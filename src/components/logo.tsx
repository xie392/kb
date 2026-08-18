import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "w-9 h-9 text-[20px]",
  md: "w-10 h-10 text-[22px]",
  lg: "w-12 h-12 text-[26px]",
} as const;

export function Logo({ size = "sm", className }: LogoProps) {
  return (
    <span
      className={cn(
        "grid place-items-center sketch-border sketch-shadow bg-white font-hand-display font-bold text-secondary rotate-[-4deg]",
        SIZE_MAP[size],
        className
      )}
    >
      X
    </span>
  );
}
