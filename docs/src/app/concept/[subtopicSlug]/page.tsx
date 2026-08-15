import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { prisma } from "@/lib/prisma";
import { learningRoadmap } from "@/config/roadmap";
import CodeExplorer from "@/components/CodeExplorer";
import TableOfContents from "@/components/TableOfContents";
import EzoicAd from "@/components/ads/EzoicAd";
import { ChevronLeft, ChevronRight, BookOpen, Clock, AlertTriangle } from "lucide-react";

const cleanAnsi = (str: string) => {
  if (!str) return "";
  const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
  return str.replace(ansiRegex, "");
};

const renderContentWithAds = (content: string) => {
  const cleaned = cleanAnsi(content);
  // Split article content by headings (e.g. ## or ###) or paragraph blocks (\n\n)
  let sections = cleaned.split(/(?=\n##?\s)/);
  if (sections.length < 3) {
    sections = cleaned.split(/\n\n+/);
  }

  if (sections.length <= 1) {
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleaned}</ReactMarkdown>;
  }

  // Distribute 3 to 4 ads evenly between sections
  const maxAds = 4;
  const step = Math.max(1, Math.floor(sections.length / (maxAds + 1)));

  let adsPlaced = 0;

  return (
    <>
      {sections.map((sec, idx) => {
        const showAd = idx > 0 && idx % step === 0 && adsPlaced < maxAds;
        if (showAd) {
          adsPlaced++;
        }
        return (
          <React.Fragment key={idx}>
            {showAd && <EzoicAd />}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{sec}</ReactMarkdown>
          </React.Fragment>
        );
      })}
    </>
  );
};

export const revalidate = 60; // ISR validation interval

interface PageProps {
  params: Promise<{
    subtopicSlug: string;
  }>;
}

// Generate static params for Next.js build optimization (pre-renders Complexity on build)
export async function generateStaticParams() {
  try {
    const publishedSubtopics = await prisma.subTopic.findMany({
      select: { slug: true }
    });
    return publishedSubtopics.map((sub) => ({
      subtopicSlug: sub.slug
    }));
  } catch (e) {
    return [];
  }
}

export default async function ConceptDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { subtopicSlug } = resolvedParams;

  // 1. Fetch subtopic data from MongoDB
  const subtopic = await prisma.subTopic.findUnique({
    where: { slug: subtopicSlug },
    include: {
      topic: true,
      leetcodeProblems: true
    }
  });

  // Verify if the subtopic exists in the syllabus config
  let configSubtopic: any = null;
  let configTopic: any = null;

  for (const stage of learningRoadmap) {
    for (const topic of stage.topics) {
      const match = topic.subtopics.find((s) => `${topic.slug}-${s.slug}` === subtopicSlug);
      if (match) {
        configSubtopic = match;
        configTopic = topic;
        break;
      }
    }
    if (configSubtopic) break;
  }

  // If it's not even in the config AND not in the DB, it's a true 404
  if (!subtopic && !configSubtopic) {
    return notFound();
  }

  const isComingSoon = !subtopic;

  // Resolve metadata fields dynamically based on source availability
  const pageTitle = subtopic ? subtopic.title : configSubtopic.title;
  const topicTitle = subtopic ? subtopic.topic.title : configTopic.title;
  const categoryName = subtopic ? subtopic.topic.category : configTopic.category;
  const difficulty = subtopic ? subtopic.topic.difficulty : configTopic.difficulty;
  const readingTime = subtopic ? subtopic.readingTime : 5;

  // 2. Resolve Previous and Next subtopic navigation links dynamically from configuration
  const allSubtopics: { title: string; slug: string; topicSlug: string }[] = [];
  learningRoadmap.forEach((stage) => {
    stage.topics.forEach((topic) => {
      topic.subtopics.forEach((sub) => {
        allSubtopics.push({
          title: sub.title,
          slug: `${topic.slug}-${sub.slug}`,
          topicSlug: topic.slug
        });
      });
    });
  });

  const currentIndex = allSubtopics.findIndex((s) => s.slug === subtopicSlug);
  const prevSub = currentIndex > 0 ? allSubtopics[currentIndex - 1] : null;
  const nextSub = currentIndex < allSubtopics.length - 1 ? allSubtopics[currentIndex + 1] : null;

  // Resolve related topics within the same learning Stage
  const activeTopicSlug = subtopic ? subtopic.topic.slug : configTopic.slug;
  const currentStage = learningRoadmap.find((stage) =>
    stage.topics.some((t) => t.slug === activeTopicSlug)
  );
  const relatedTopics = currentStage
    ? currentStage.topics.filter((t) => t.slug !== activeTopicSlug).slice(0, 3)
    : [];

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
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative w-full">
      {/* Article Body */}
      <article className="flex-1 min-w-0 space-y-8" id="article-root">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <span>{categoryName}</span>
          <span>/</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {topicTitle}
          </span>
        </div>

        {/* Title and metadata */}
        <div className="space-y-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {pageTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <span
              className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${getDifficultyColor(
                difficulty
              )}`}
            >
              {difficulty}
            </span>
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Clock size={14} /> {readingTime} min read
            </span>
            {isComingSoon && (
              <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded">
                Coming Soon
              </span>
            )}
          </div>
        </div>

        {isComingSoon ? (
          /* Beautiful Coming Soon layout matching theme rules */
          <div className="p-8 sm:p-12 rounded-2xl border border-gray-200 dark:border-[#1e293b] bg-gray-50/50 dark:bg-[#07090e] text-center space-y-6 max-w-2xl mx-auto my-12 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Module Coming Soon
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                This DSA module is currently in the queue.  We are writing high-quality explanations, code examples, and practice problems for this topic.
              </p>
            </div>
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-center gap-4 text-xs">
              <Link href="/" className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Back to Syllabus
              </Link>
              {nextSub && (
                <Link href={`/concept/${nextSub.slug}`} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">
                  Go to Next Topic
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Dynamic Markdown Content with In-article Ads */}
            <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-gray-100 dark:prose-pre:bg-[#07090e] prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand prose-a:no-underline hover:prose-a:underline">
              {renderContentWithAds(subtopic.content)}
            </div>

            {/* Stacked code sections */}
            <section className="space-y-4" id="implementations">
              <h2 className="text-xl font-bold tracking-tight border-b border-gray-200 dark:border-[#1e293b] pb-2">
                Implementations
              </h2>
              <CodeExplorer examples={subtopic.codeExamples} />
            </section>

            <EzoicAd />

            {/* Practice Problems Index */}
            <section className="space-y-4" id="practice-problems">
              <h2 className="text-xl font-bold tracking-tight border-b border-gray-200 dark:border-gray-800 pb-2">
                Practice Problems
              </h2>
              {subtopic.leetcodeProblems.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-[#1e293b]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-[#0d1017] border-b border-gray-200 dark:border-[#1e293b] font-bold text-gray-700 dark:text-gray-300">
                        <th className="p-3">LeetCode Problem</th>
                        <th className="p-3">ID</th>
                        <th className="p-3">Difficulty</th>
                        <th className="p-3">Pattern</th>
                        <th className="p-3">Official Link</th>
                        <th className="p-3">Leet Vision Solution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#1e293b]">
                      {subtopic.leetcodeProblems.map((prob) => (
                        <tr
                          key={prob.id}
                          className="hover:bg-gray-100/50 dark:hover:bg-[#0e111a]/30 transition-colors"
                        >
                          <td className="p-3 font-semibold text-gray-900 dark:text-white">
                            {prob.leetcodeProblemName}
                          </td>
                          <td className="p-3 text-gray-500">{prob.leetcodeProblemId}</td>
                          <td className="p-3">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${getDifficultyColor(
                                prob.difficulty
                              )}`}
                            >
                              {prob.difficulty}
                            </span>
                          </td>
                          <td className="p-3 text-gray-500">{prob.pattern}</td>
                          <td className="p-3">
                            <a
                              href={prob.leetcodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand hover:underline"
                            >
                              Solve on LeetCode ↗
                            </a>
                          </td>
                          <td className="p-3">
                            <a
                              href={prob.leetVisionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand hover:underline"
                            >
                              Video Solution ↗
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#07090e] text-xs text-gray-500 border border-gray-200 dark:border-[#1e293b] flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Practice problems are being curated for this concept.
                </div>
              )}
            </section>
          </>
        )}

        {/* Previous and Next pagination links */}
        <div className="flex justify-between items-center border-t border-gray-200 dark:border-[#1e293b] pt-6 mt-12">
          {prevSub ? (
            <Link
              href={`/concept/${prevSub.slug}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand transition-colors"
            >
              <ChevronLeft size={16} /> Previous
            </Link>
          ) : (
            <div />
          )}

          {nextSub ? (
            <Link
              href={`/concept/${nextSub.slug}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand transition-colors"
            >
              Next <ChevronRight size={16} />
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Related stages links */}
        {relatedTopics.length > 0 && (
          <div className="border-t border-gray-200 dark:border-[#1e293b] pt-6 mt-8 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Related Modules</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relatedTopics.map((t) => (
                <Link
                  key={t.slug}
                  href={`/concept/${t.slug}-${t.subtopics[0]?.slug}`}
                  className="p-3 rounded-lg border border-gray-200 dark:border-[#1e293b] hover:border-brand/50 bg-white dark:bg-[#07090e] hover:bg-gray-50 dark:hover:bg-[#0e111a]/30 transition-colors text-xs text-center font-bold"
                >
                  {t.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Desktop Sticky Table of Contents (Right side) */}
      <div className="hidden xl:block w-52 flex-shrink-0 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto pr-2 border-l border-gray-100 dark:border-gray-900 pl-4">
        <TableOfContents contentSelector="#article-root" />
      </div>
    </div>
  );
}
