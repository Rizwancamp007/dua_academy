"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface Slide {
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
}

interface HeroProps {
  slides: Slide[];
  settings: {
    commenceDate: string;
    classTimings: string;
    admissionsOpen: boolean;
  };
}

export function Hero({ slides, settings }: HeroProps) {
  const [current, setCurrent] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTabVisible, setIsTabVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle visibility API to pause animations when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Auto slide interval
  useEffect(() => {
    if (!isTabVisible) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, isTabVisible]);

  // Handle cursor glow movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[600px] overflow-hidden bg-bg border-b border-border flex items-center"
    >
      {/* 1. GPU-cheap Layered Animated Blobs (transform + opacity only) */}
      {isTabVisible && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <motion.div
            animate={{
              x: [0, 40, -30, 0],
              y: [0, -50, 40, 0],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-10 left-10 w-96 h-96 rounded-full bg-primary/20 dark:bg-primary/10 blur-[100px]"
          />
          <motion.div
            animate={{
              x: [0, -50, 30, 0],
              y: [0, 40, -55, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-secondary/25 dark:bg-secondary/15 blur-[90px]"
          />
        </div>
      )}

      {/* 2. Cursor Follow Glow (Hero section only) */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 opacity-60 dark:opacity-40"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(212, 160, 23, 0.15), transparent 80%)`,
        }}
      />

      {/* 3. Slider Content */}
      <div className="absolute inset-0 z-20 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center"
          >
            {/* Slide Background Image Placeholder with Theme-aware contrast overlays */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700"
              style={{
                backgroundImage: `url(${slides[current].imageUrl})`,
              }}
            >
              {/* Light Mode Overlay: Soft warm gradient tint / Dark Mode Overlay: High-opacity dark tint */}
              <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/80 to-transparent dark:from-black/90 dark:via-black/70 dark:to-transparent" />
            </div>

            {/* Slide Text Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-30">
              <div className="max-w-2xl">
                <Badge variant="secondary" className="mb-4">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  20 Years of Educational Excellence
                </Badge>
                
                <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-text leading-tight mb-4">
                  {slides[current].title}
                </h1>
                
                <p className="text-lg sm:text-xl text-text/80 mb-8 max-w-lg">
                  {slides[current].subtitle}
                </p>

                <div className="flex flex-wrap gap-4">
                  <a href={slides[current].buttonLink}>
                    <Button size="lg">{slides[current].buttonText}</Button>
                  </a>
                  {settings.admissionsOpen && (
                    <a href="/register">
                      <Button size="lg" variant="outline">
                        Register Now
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. Carousel Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 z-30 p-2 rounded-full border border-border bg-surface text-text hover:bg-primary/10 cursor-pointer focus:outline-none transition-colors"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 z-30 p-2 rounded-full border border-border bg-surface text-text hover:bg-primary/10 cursor-pointer focus:outline-none transition-colors"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* 5. Carousel Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === current
                ? "w-8 bg-primary dark:bg-secondary"
                : "bg-text/30 hover:bg-text/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* 6. Admissions Sticky Banner */}
      <div className="absolute bottom-0 inset-x-0 bg-primary text-white py-3 px-4 z-30 border-t border-secondary/30 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm font-medium">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 text-secondary">
              <Calendar className="w-4 h-4" />
              Classes Commence: {settings.commenceDate}
            </span>
            <span className="flex items-center gap-1.5 text-secondary/90">
              <Clock className="w-4 h-4" />
              Timings: {settings.classTimings}
            </span>
          </div>
          <div>
            {settings.admissionsOpen ? (
              <span className="bg-secondary text-[#1A1A1A] px-3 py-1 rounded-full text-xs font-bold uppercase animate-pulse">
                Admissions Open
              </span>
            ) : (
              <span className="bg-border/30 text-white/80 px-3 py-1 rounded-full text-xs font-bold uppercase">
                Admissions Closed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Hero;
