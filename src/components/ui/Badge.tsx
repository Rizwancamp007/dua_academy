import { HTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "outline";
}

export function Badge({ children, variant = "primary", className, ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/50 select-none";

  const variants = {
    primary: "bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20",
    secondary: "bg-secondary/15 text-secondary border border-secondary/20 dark:bg-secondary/25",
    success: "bg-success/10 text-success border border-success/20 dark:bg-success/20",
    warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20 dark:bg-amber-500/20",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 dark:bg-red-500/20",
    outline: "border border-border bg-transparent text-text",
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, variants[variant], className))}
      {...props}
    >
      {children}
    </span>
  );
}
