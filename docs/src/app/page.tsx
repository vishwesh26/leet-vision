import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { learningRoadmap } from "@/config/roadmap";
import { BookOpen, CheckCircle, Clock, ArrowRight, Award } from "lucide-react";

export const revalidate = 60; // Incremental Static Regeneration (ISR) - revalidate every 60s

export default async function HomePage() {
  // Query DB to see which topics have been fully generated and published
  let publishedSlugs = new Set<string>();
  try {
    const topics = await prisma.topic.findMany({
      where: { status: "published" },
      select: { slug: true }
    });
    publishedSlugs = new Set(topics.map((t) => t.slug));
  } catch (err) {
    console.error("Failed to fetch published topics from MongoDB:", err);
  }

  return (
    <div className="space-y-12">
      {/* Hero Welcome Banner */}
      <section className="text-center py-10 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold uppercase tracking-wider">
          <Award size={14} /> Master DSA Step-by-Step
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
          Elite Coding Intelligence Documentation
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Deep, high-quality documentation specifically engineered for LeetCode interview preparation. Analogy-driven, annotated solutions, dry runs, and complexity analysis.
        </p>

        {/* Action Button */}
        <div className="pt-4">
          <Link
            href="/concept/complexity-analysis-introduction-to-complexity"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand text-white font-bold text-sm shadow-md hover:bg-brand-hover transition-all"
          >
            Start Learning <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Learning Roadmap Modules Grid */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold border-b border-gray-200 dark:border-[#1e293b] pb-2">
          Documentation Syllabus
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningRoadmap.map((stage) => (
            <div
              key={stage.slug}
              className="p-6 rounded-xl border border-gray-200 dark:border-[#1e293b] bg-white dark:bg-[#07090e] shadow-sm flex flex-col space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1e293b] pb-3">
                <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen size={16} className="text-brand" /> {stage.title}
                </h3>
              </div>

              <div className="flex-1 space-y-4">
                {stage.topics.map((topic) => {
                  const isPublished = publishedSlugs.has(topic.slug);
                  return (
                    <div key={topic.slug} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {topic.title}
                        </span>
                        {isPublished ? (
                          <span className="flex items-center gap-1 text-[10px] text-green-500 font-semibold uppercase tracking-wider bg-green-500/10 px-1.5 py-0.5 rounded">
                            <CheckCircle size={10} /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold uppercase tracking-wider bg-gray-100 dark:bg-[#0d1017] px-1.5 py-0.5 rounded">
                            <Clock size={10} /> Queue
                          </span>
                        )}
                      </div>

                      {/* Subtopics lists */}
                      <div className="pl-3 border-l-2 border-gray-100 dark:border-[#1e293b] space-y-1">
                        {topic.subtopics.map((sub) => {
                          const subPath = `/concept/${topic.slug}-${sub.slug}`;
                          return isPublished ? (
                            <Link
                              key={sub.slug}
                              href={subPath}
                              className="block text-xs text-gray-500 hover:text-brand dark:text-gray-400 dark:hover:text-brand transition-colors"
                            >
                              • {sub.title}
                            </Link>
                          ) : (
                            <span
                              key={sub.slug}
                              className="block text-xs text-gray-400 dark:text-[#334155] select-none"
                            >
                              • {sub.title} (Coming Soon)
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
