"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  GraduationCap,
  LayoutDashboard,
  Video,
  FileText,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Back to Home Page", href: "/", icon: Home },
    { name: "Dashboard", href: "/student", icon: LayoutDashboard },
    { name: "Video Lectures", href: "/student/lectures", icon: Video },
    { name: "Practice & Mocks", href: "/student/tests", icon: FileText },
    { name: "My Results", href: "/student/results", icon: Award },
    { name: "Settings", href: "/student/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bg flex text-text">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border shrink-0">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/">
            <Logo showText={true} className="w-8 h-8" />
          </Link>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "text-text/70 hover:bg-border/20 hover:text-text"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg bg-primary/5 text-xs text-text/60">
            <User className="w-4 h-4 text-primary" />
            <div className="truncate">
              <p className="font-semibold text-text truncate">{session?.user?.name || "Student Portal"}</p>
              <p className="truncate text-[10px]">{session?.user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-start gap-3 px-3 py-2 text-red-500 hover:bg-red-500/10 hover:text-red-600 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* 2. Main Content Container */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-text/75 hover:bg-border/20 md:hidden cursor-pointer"
              aria-label="Open Sidebar Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-serif font-bold hidden sm:block">
              Student Portal
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {session?.user?.name?.[0]?.toUpperCase() || "S"}
            </div>
          </div>
        </header>

        {/* Dynamic page children */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* 3. Mobile Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-64 bg-surface h-full flex flex-col shadow-2xl border-r border-border"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                <Logo showText={true} className="w-8 h-8" />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-text/60 hover:bg-border/20 cursor-pointer"
                  aria-label="Close Sidebar Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-grow px-4 py-6 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/10"
                          : "text-text/70 hover:bg-border/20 hover:text-text"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border/50">
                <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg bg-primary/5 text-xs text-text/60">
                  <User className="w-4 h-4 text-primary" />
                  <div className="truncate">
                    <p className="font-semibold text-text truncate">{session?.user?.name || "Student"}</p>
                    <p className="truncate text-[10px]">{session?.user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center justify-start gap-3 px-3 py-2 text-red-500 hover:bg-red-500/10 hover:text-red-600 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
