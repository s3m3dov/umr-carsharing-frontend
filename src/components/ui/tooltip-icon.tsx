import { cn } from "@/lib/utils"

interface TooltipIconProps {
  className?: string
}

export function TooltipIcon({ className }: TooltipIconProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-muted text-muted-foreground",
        className
      )}
    >
      ?
    </span>
  )
}