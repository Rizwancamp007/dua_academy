import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "w-10 h-10", showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${className} overflow-hidden rounded-lg flex-shrink-0`}>
        <img
          src="/logo.png"
          alt="Duaa Academy Logo"
          className="object-cover w-full h-full"
        />
      </div>
      {showText && (
        <span className="font-serif text-xl font-bold tracking-tight text-text">
          Duaa <span className="text-primary dark:text-secondary">Academy</span>
        </span>
      )}
    </div>
  );
}
export default Logo;
