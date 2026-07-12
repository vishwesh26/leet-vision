"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowLeft, Search } from "lucide-react";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import ProgressBar from "./ProgressBar";

export default function MainLayout({ 
  children,
  publishedSlugs = []
}: { 
  children: React.ReactNode;
  publishedSlugs?: string[];
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#06080e] text-gray-900 dark:text-gray-100 transition-colors">
      <ProgressBar />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#06080e]/80 backdrop-blur border-b border-gray-200 dark:border-[#1e293b]">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"
              aria-label="Open Menu"
            >
              <Menu size={20} />
            </button>

            {/* Title / Logo */}
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <span className="font-bold text-md tracking-tight">LeetVision <span className="text-xs px-2 py-0.5 rounded bg-brand text-white font-semibold uppercase">Docs</span></span>
            </Link>

            {/* Back button to main website */}
            <a
              href="https://leet-vision.com"
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand transition-colors"
            >
              <ArrowLeft size={14} /> Back to Main Site
            </a>
          </div>

          <div className="flex items-center gap-4">
            {/* Search link */}
            <Link
              href="/search"
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"
              aria-label="Search"
            >
              <Search size={18} />
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex w-full max-w-[1440px] mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <Sidebar publishedSlugs={publishedSlugs} />
        </div>

        {/* Mobile Sidebar Backdrop & Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Content */}
            <div className="relative w-80 max-w-xs flex-1 flex flex-col bg-white dark:bg-[#06080e] h-full shadow-xl">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 z-55"
                aria-label="Close Menu"
              >
                <X size={18} />
              </button>
              <Sidebar 
                publishedSlugs={publishedSlugs}
                onCloseMobile={() => setMobileMenuOpen(false)} 
              />
            </div>
          </div>
        )}

        {/* Document Content View */}
        <main className="flex-1 min-w-0 py-8 px-4 sm:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Clean Compact Footer */}
      <footer className="border-t border-gray-200 dark:border-[#1e293b] py-6 bg-gray-50 dark:bg-[#06080e]">
        <div className="max-w-[1440px] mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div>© {new Date().getFullYear()} LeetVision. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/" className="hover:underline">Home</Link>
            <a href="https://leet-vision.com/about" className="hover:underline">About</a>
            <a href="https://leet-vision.com/contact" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
