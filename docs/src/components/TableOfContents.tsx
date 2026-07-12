"use client";

import React, { useEffect, useState } from "react";

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ contentSelector }: { contentSelector: string }) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const container = document.querySelector(contentSelector);
    if (!container) return;

    // Find all H2 and H3 elements inside the article container
    const headingElements = container.querySelectorAll("h2, h3");
    const items: HeadingItem[] = [];

    headingElements.forEach((el, index) => {
      const text = el.textContent || "";
      // Ensure element has a valid id to scroll to, otherwise create one
      if (!el.id) {
        el.id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      items.push({
        id: el.id,
        text,
        level: el.tagName === "H2" ? 2 : 3
      });
    });

    setHeadings(items);

    // Track active heading using IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by bounding client rect to find the topmost visible header
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visibleEntries[0].target.id);
        }
      },
      { rootMargin: "0px 0px -60% 0px" } // Trigger when element enters the top half of viewport
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [contentSelector]);

  if (headings.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">On This Page</h4>
      <ul className="space-y-2 text-xs">
        {headings.map((h) => (
          <li
            key={h.id}
            style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
            className="transition-all"
          >
            <a
              href={`#${h.id}`}
              className={`hover:text-gray-900 dark:hover:text-white transition-colors block py-0.5 truncate ${
                activeId === h.id
                  ? "text-blue-600 dark:text-blue-400 font-bold border-l-2 border-blue-600 dark:border-blue-500 pl-2 -ml-[2px]"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
