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
          "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 hover:from-indigo-500 hover:to-purple-500 hover:-translate-y-0.5 border border-white/20",
        destructive:
          "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/60 hover:from-red-500 hover:to-pink-500 hover:-translate-y-0.5 border border-white/20",
        outline:
          "border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white shadow-lg hover:bg-white/10 hover:border-white/30 hover:-translate-y-0.5 hover:shadow-xl",
        secondary:
          "bg-white/10 backdrop-blur-md text-white shadow-lg border border-white/20 hover:bg-white/15 hover:border-white/30 hover:-translate-y-0.5 hover:shadow-xl",
        ghost: "hover:bg-white/10 hover:text-white text-gray-300",
        link: "text-purple-400 underline-offset-4 hover:underline hover:text-purple-300",
        glow: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 hover:from-cyan-500 hover:to-blue-500 hover:-translate-y-0.5 border border-cyan-400/30 animate-pulse-slow",
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