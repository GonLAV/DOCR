import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105",
  {
    variants: {
      variant: {
        default:
          "border-blue-500/30 bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-blue-500/40",
        secondary:
          "border-slate-600/30 bg-slate-700/60 backdrop-blur-md text-gray-100 shadow-slate-700/40",
        destructive:
          "border-rose-500/30 bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-rose-500/40",
        outline: "border-slate-600/40 text-gray-100 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-700/50",
        success: "border-emerald-500/30 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/40",
        warning: "border-amber-500/30 bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-amber-500/40",
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