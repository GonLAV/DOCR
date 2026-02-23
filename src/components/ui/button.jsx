import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-violet-500/50 hover:from-blue-500 hover:to-violet-500 hover:-translate-y-0.5 border border-blue-400/20",
        destructive:
          "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/40 hover:shadow-xl hover:shadow-rose-500/50 hover:from-rose-500 hover:to-red-500 hover:-translate-y-0.5 border border-rose-400/20",
        outline:
          "border-2 border-slate-600/40 bg-slate-800/50 backdrop-blur-sm text-gray-100 shadow-lg hover:bg-slate-700/60 hover:border-slate-500/50 hover:-translate-y-0.5 hover:shadow-xl",
        secondary:
          "bg-slate-700/60 backdrop-blur-md text-gray-100 shadow-lg border border-slate-600/40 hover:bg-slate-600/70 hover:border-slate-500/50 hover:-translate-y-0.5 hover:shadow-xl",
        ghost: "hover:bg-slate-800/50 hover:text-gray-100 text-gray-400",
        link: "text-blue-400 underline-offset-4 hover:underline hover:text-blue-300",
        glow: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/60 hover:from-cyan-500 hover:to-blue-500 hover:-translate-y-0.5 border border-cyan-400/20",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }