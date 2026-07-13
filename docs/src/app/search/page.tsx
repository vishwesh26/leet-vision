import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search, Book, Sparkles, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    difficulty?: string;
  }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const diffFilter = resolvedParams.difficulty || "";

  let results: any[] = [];
  let totalCount = 0;

  if (q.trim() !== "" || diffFilter !== "") {
    try {
      // Find matching subtopics
      const subtopics = await prisma.subTopic.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } }
          ],
          topic: diffFilter
            ? { difficulty: { equals: diffFilter, mode: "insensitive" } }
            : undefined
        },
        include: {
          topic: true,
          leetcodeProblems: true
        },
        take: 30
      });

      results = subtopics.map((sub) => ({
        type: "subtopic",
        title: sub.title,
        slug: sub.slug,
        category: sub.topic.category,
        difficulty: sub.topic.difficulty,
        readingTime: sub.readingTime,
        topicTitle: sub.topic.title,
        problemsCount: sub.leetcodeProblems.length
      }));

      // Search practice problems specifically if query matches a problem
      const practiceProblems = await prisma.practiceProblem.findMany({
        where: {
          OR: [
            { leetcodeProblemName: { contains: q, mode: "insensitive" } },
            { leetcodeProblemId: { contains: q, mode: "insensitive" } },
            { pattern: { contains: q, mode: "insensitive" } }
          ],
          subTopic: diffFilter
            ? { topic: { difficulty: { equals: diffFilter, mode: "insensitive" } } }
            : undefined
        },
        include: {
          subTopic: {
            include: { topic: true }
          }
        },
        take: 20
      });

      practiceProblems.forEach((p) => {
        // Avoid adding duplicate links if subtopic is already in results
        const exists = results.some((r) => r.slug === p.subTopic.slug);
        if (!exists) {
          results.push({
            type: "problem-match",
            title: `${p.leetcodeProblemName} (LeetCode #${p.leetcodeProblemId})`,
            slug: p.subTopic.slug,
            category: p.subTopic.topic.category,
            difficulty: p.difficulty,
            topicTitle: p.subTopic.topic.title,
            matchReason: `Matches recommended problem under: ${p.subTopic.title}`
          });
        }
      });

      totalCount = results.length;
    } catch (err) {
      console.error("Search query execution failed:", err);
    }
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "easy":
        return "text-green-500 bg-green-500/10";
      case "medium":
        return "text-amber-500 bg-amber-500/10";
      case "hard":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search size={22} className="text-brand" /> Search Documentation
        </h1>
        <p className="text-xs text-gray-500">
          Query topics, subtopics, recommended LeetCode problems, categories, or keywords.
        </p>
      </div>

      {/* Search Form */}
      <form method="GET" action="/docs/search" className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Type search keywords (e.g., Kadane, Binary Search, Two Sum)..."
            className="w-full pl-4 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#1e293b] bg-gray-50 dark:bg-[#0d1017] text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div className="flex gap-3">
          <select
            name="difficulty"
            defaultValue={diffFilter}
            className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#1e293b] bg-gray-50 dark:bg-[#0d1017] text-sm text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-brand text-white font-bold text-sm hover:bg-brand-hover transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results View */}
      <div className="space-y-4">
        {q.trim() === "" && diffFilter === "" ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-600 flex flex-col items-center gap-2">
            <Sparkles size={36} />
            <p className="text-sm">Enter search terms above to explore our DSA knowledge graphs.</p>
          </div>
        ) : totalCount > 0 ? (
          <>
            <div className="text-xs text-gray-500">
              Found {totalCount} matching article{totalCount > 1 ? "s" : ""}
            </div>
            <div className="space-y-4">
              {results.map((res, index) => (
                <div
                  key={index}
                  className="p-5 border border-gray-200 dark:border-[#1e293b] bg-white dark:bg-[#07090e] rounded-xl shadow-sm hover:border-brand/50 transition-colors space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      {res.category}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${getDifficultyColor(
                        res.difficulty
                      )}`}
                    >
                      {res.difficulty}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href={`/concept/${res.slug}`}
                      className="text-base font-bold text-gray-900 dark:text-white hover:text-brand transition-colors block"
                    >
                      {res.title}
                    </Link>
                    <p className="text-xs text-gray-500">
                      Inside: <span className="font-medium text-gray-600 dark:text-gray-400">{res.topicTitle}</span>
                    </p>
                  </div>

                  {res.matchReason && (
                    <div className="flex items-center gap-1 text-[11px] text-brand font-medium bg-brand/5 px-2.5 py-1 rounded">
                      <AlertCircle size={12} /> {res.matchReason}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 dark:border-[#1e293b] pt-3">
                    {res.readingTime ? (
                      <span>⏱️ {res.readingTime} min read</span>
                    ) : (
                      <span className="font-semibold text-brand">🎯 Recommended problem</span>
                    )}
                    {res.problemsCount !== undefined && (
                      <span>📚 {res.problemsCount} practice problems</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-400 dark:text-gray-600 flex flex-col items-center gap-2 border border-dashed border-gray-200 dark:border-[#1e293b] rounded-xl">
            <AlertCircle size={36} />
            <p className="text-sm font-semibold">No results match your query.</p>
            <p className="text-xs">Try different keywords or verify your filter settings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
