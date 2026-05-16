import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white backdrop-blur-xl transition-all duration-300 placeholder:text-white/40 focus-visible:border-violet-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:shadow-[0_0_24px_rgba(139,92,246,0.2)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
