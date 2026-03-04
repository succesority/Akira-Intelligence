"use client";
import { cn } from "@/lib/utils";
import * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition outline-none",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "placeholder:text-muted-foreground disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
