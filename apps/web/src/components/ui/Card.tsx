import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "premium-surface rounded-lg text-card-foreground transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_22px_70px_color-mix(in_srgb,hsl(var(--foreground))_13%,transparent)]",
        className
      )}
      {...props}
    />
  );
}
