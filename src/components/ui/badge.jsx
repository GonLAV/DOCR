import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105",
  {
    variants: {
      variant: {
        default:
          "border-indigo-500/30 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/50",
        secondary:
          "border-white/20 bg-white/10 backdrop-blur-md text-white shadow-white/20",
        destructive:
          "border-red-500/30 bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-red-500/50",
        outline: "border-white/30 text-white bg-white/5 backdrop-blur-sm hover:bg-white/10",
        success: "border-emerald-500/30 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/50",
        warning: "border-amber-500/30 bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-amber-500/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }