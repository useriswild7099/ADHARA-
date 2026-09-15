import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-primary text-background font-semibold hover:bg-primary/90 shadow-[0_0_12px_rgba(0,212,255,0.4)]",
      secondary: "bg-muted text-foreground border border-white/10 hover:bg-white/10 hover:border-primary/50",
      outline: "border border-border bg-transparent hover:bg-white/5 hover:text-foreground text-muted-foreground",
      ghost: "hover:bg-white/5 text-muted-foreground hover:text-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
      tactical: "bg-sky-950/60 border border-primary/40 text-primary hover:bg-primary hover:text-background font-mono shadow-[0_0_8px_rgba(56,189,248,0.25)]"
    }

    const sizes = {
      default: "h-9 px-4 py-2 text-xs",
      sm: "h-7 rounded-md px-2.5 text-[11px]",
      lg: "h-11 rounded-md px-6 text-sm",
      icon: "h-8 w-8"
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          variants[variant] || variants.default,
          sizes[size] || sizes.default,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
