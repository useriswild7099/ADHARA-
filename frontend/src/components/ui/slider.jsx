import * as React from "react"
import { cn } from "../../lib/utils"

const Slider = React.forwardRef(
  ({ className, min = 0, max = 100, step = 1, value = [0], onValueChange, ...props }, ref) => {
    const val = Array.isArray(value) ? value[0] : value

    const handleChange = (e) => {
      const num = parseFloat(e.target.value)
      if (onValueChange) onValueChange([num])
    }

    const percentage = ((val - min) / (max - min)) * 100

    return (
      <div className={cn("relative flex w-full touch-none select-none items-center py-2", className)}>
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={handleChange}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-1 focus:ring-primary"
          {...props}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
