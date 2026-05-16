import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030308] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "btn-shine relative bg-gradient-to-r from-violet-600 via-violet-500 to-cyan-500 text-white shadow-[0_0_24px_rgba(139,92,246,0.35)] hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(139,92,246,0.5),0_0_60px_rgba(34,211,238,0.2)] hover:brightness-110 active:translate-y-0",
        outline:
          "glass-card border border-white/15 bg-white/5 text-white backdrop-blur-xl hover:border-violet-400/40 hover:bg-white/10 hover:text-white hover:shadow-[0_0_24px_rgba(139,92,246,0.15)]",
        ghost:
          "text-white/70 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]",
        glass:
          "border border-white/10 bg-white/5 text-white backdrop-blur-xl hover:-translate-y-0.5 hover:border-cyan-400/35 hover:bg-white/10 hover:shadow-[0_0_28px_rgba(34,211,238,0.15)]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-2xl px-8 py-3 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
