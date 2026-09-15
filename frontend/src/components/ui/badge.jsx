import * as React from "react"
import { cn } from "../../lib/utils"

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "border-transparent bg-primary text-background font-semibold shadow",
    secondary: "border-white/10 bg-muted text-foreground",
    destructive: "border-destructive/30 bg-destructive/15 text-red-300",
    success: "border-success/30 bg-success/15 text-emerald-300",
    warning: "border-accent/30 bg-accent/15 text-amber-300",
    outline: "border-border text-foreground font-mono",
    tactical: "border-sky-500/30 bg-sky-500/10 text-sky-400 font-mono tracking-wider"
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-colors uppercase",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  )
}

export { Badge }
