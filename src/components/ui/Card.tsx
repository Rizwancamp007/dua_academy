"use client";

import { HTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverLift?: boolean;
  tilt?: boolean;
  shadow?: boolean;
  clickable?: boolean;
}

export function Card({
  children,
  hoverLift = true,
  tilt = false,
  shadow = true,
  clickable = false,
  className,
  ...props
}: CardProps) {
  const baseStyles =
    "rounded-xl border border-border bg-surface p-6 text-text overflow-hidden transition-all duration-300";

  const hoverStyles = hoverLift
    ? "hover:-translate-y-2 hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/45"
    : "";

  const shadowStyles = shadow ? "shadow-md" : "";

  const clickableStyles = clickable ? "cursor-pointer select-none" : "";

  // Combine standard classes
  const classes = twMerge(
    clsx(baseStyles, hoverStyles, shadowStyles, clickableStyles, className)
  );

  // If clickable, wrap in motion.div for tap feedback
  if (clickable) {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={classes}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge("mb-4 flex flex-col space-y-1.5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={twMerge("font-serif text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={twMerge("text-sm text-text/70", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge("pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge("flex items-center pt-4 border-t border-border/50 mt-4", className)} {...props}>
      {children}
    </div>
  );
}
