import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold tracking-normal transition duration-200 ease-out focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        variant === "primary" && "bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] text-white shadow-[0_12px_30px_color-mix(in_srgb,hsl(var(--primary))_28%,transparent)] hover:-translate-y-0.5 hover:shadow-[0_18px_42px_color-mix(in_srgb,hsl(var(--primary))_34%,transparent)]",
        variant === "secondary" && "border border-border bg-card/80 text-foreground shadow-sm backdrop-blur hover:-translate-y-0.5 hover:border-primary/50 hover:bg-muted/80 hover:shadow-lg",
        variant === "ghost" && "text-foreground hover:bg-muted/80 hover:text-primary",
        className
      )}
      {...props}
    />
  );
}
