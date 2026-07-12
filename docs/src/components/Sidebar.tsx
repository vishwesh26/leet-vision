"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Search, BookOpen, Layers } from "lucide-react";
import { learningRoadmap, StageConfig, TopicConfig } from "@/config/roadmap";

export default function Sidebar({ 
  onCloseMobile,
  publishedSlugs = []
}: { 
  onCloseMobile?: () => void;
  publishedSlugs?: string[];
}) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({
    "stage-1-fundamentals": true // Expand Stage 1 by default
  });
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Auto-expand parent stage and topic on route loads
  useEffect(() => {
    const activeSubtopic = pathname.split("/").pop();
    if (activeSubtopic) {
      for (const stage of learningRoadmap) {
        for (const topic of stage.topics) {
          const hasActiveSub = topic.subtopics.some((s) => `${topic.slug}-${s.slug}` === activeSubtopic);
          if (hasActiveSub) {
            setExpandedStages((prev) => ({ ...prev, [stage.slug]: true }));
            setExpandedTopics((prev) => ({ ...prev, [topic.slug]: true }));
          }
        }
      }
    }
  }, [pathname]);

  const toggleStage = (stageSlug: string) => {
    setExpandedStages((prev) => ({ ...prev, [stageSlug]: !prev[stageSlug] }));
  };

  const toggleTopic = (topicSlug: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicSlug]: !prev[topicSlug] }));
  };

  // Search Filter logic: returns only stages and topics matching title, topic, or subtopic terms
  const filteredRoadmap = learningRoadmap
    .map((stage) => {
      const filteredTopics = stage.topics
        .map((topic) => {
          const matchesQuery =
            topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            topic.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            topic.subtopics.some((sub) =>
              sub.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
          return matchesQuery ? topic : null;
        })
        .filter((t): t is TopicConfig => t !== null);

      return filteredTopics.length > 0
        ? { ...stage, topics: filteredTopics }
        : null;
    })
    .filter((s): s is StageConfig => s !== null);

  return (
    <aside className="w-full flex flex-col h-full bg-slate-50/70 dark:bg-[#06080e] border-r border-gray-200 dark:border-[#1e293b] text-gray-800 dark:text-gray-200">
      {/* Header and Search */}
      <div className="p-4 border-b border-gray-200 dark:border-[#1e293b]">
        <Link href="/" className="flex items-center gap-2 mb-4">
          <BookOpen className="text-brand" size={22} />
          <span className="font-bold text-lg tracking-tight">LeetVision <span className="text-xs px-2 py-0.5 rounded bg-brand text-white font-semibold uppercase">Docs</span></span>
        </Link>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-[#1e293b] bg-gray-50 dark:bg-[#0d1017] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      {/* Navigation Tree */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {filteredRoadmap.map((stage) => {
          const isStageExpanded = expandedStages[stage.slug] || searchQuery.length > 0;
          return (
            <div key={stage.slug} className="space-y-1">
              <button
                onClick={() => toggleStage(stage.slug)}
                className="w-full flex items-center justify-between px-2 py-1 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <span>{stage.title}</span>
                {isStageExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {isStageExpanded && (
                <div className="pl-1 mt-1 space-y-1 border-l border-gray-100 dark:border-[#181d2a] ml-1">
                  {stage.topics.map((topic) => {
                     const isTopicExpanded = expandedTopics[topic.slug] || searchQuery.length > 0;
                     return (
                       <div key={topic.slug} className="space-y-0.5">
                         <button
                           onClick={() => toggleTopic(topic.slug)}
                           className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-[#0e111a] transition-colors group text-left"
                         >
                           <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white truncate">
                             {topic.title}
                           </span>
                           {isTopicExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                         </button>

                         {isTopicExpanded && (
                           <div className="pl-3 space-y-0.5">
                             {topic.subtopics
                               .filter((sub) =>
                                 searchQuery.length === 0 ||
                                 sub.title.toLowerCase().includes(searchQuery.toLowerCase())
                               )
                               .map((sub) => {
                                 const subPath = `/concept/${topic.slug}-${sub.slug}`;
                                 const isActive = pathname === subPath;
                                 const subSlug = `${topic.slug}-${sub.slug}`;
                                 const isPublished = publishedSlugs.includes(subSlug);

                                 return (
                                   <Link
                                     key={sub.slug}
                                     href={subPath}
                                     onClick={onCloseMobile}
                                     className={`block px-2 py-1.5 text-xs rounded-r-md transition-all truncate border-l-2 ${
                                       isActive
                                         ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold border-blue-600 dark:border-blue-500 pl-2"
                                         : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border-transparent pl-1.5 hover:border-gray-300 dark:hover:border-gray-700"
                                     }`}
                                   >
                                     <div className="flex items-center justify-between w-full">
                                       <span className="truncate">{sub.title}</span>
                                       {!isPublished && (
                                         <span className="ml-1 px-1 py-0.5 text-[9px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-[#0f121d] rounded border border-gray-200 dark:border-gray-800 flex-shrink-0 select-none">
                                           Soon
                                         </span>
                                       )}
                                     </div>
                                   </Link>
                                 );
                               })}
                           </div>
                         )}
                       </div>
                     );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
