import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/MainLayout";
import { prisma } from "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeetVision DSA Docs | Elite Algorithms Documentation",
  description: "The ultimate LeetCode helper and comprehensive Data Structures & Algorithms documentation engineered for competitive programming and interview preparation.",
  keywords: ["leetcode", "leetcode helper", "dsa documentation", "algorithm patterns", "competitive programming", "leetcode visualizer"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch only published subtopic slugs to know what is active
  let publishedSlugs: string[] = [];
  try {
    const subtopics = await prisma.subTopic.findMany({
      select: { slug: true }
    });
    publishedSlugs = subtopics.map((s) => s.slug);
  } catch (e) {
    console.error("Failed to fetch published subtopics for sidebar layout:", e);
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="google-adsense-account" content="ca-pub-2403388488389670" />
        {/* Ezoic Privacy & Header Scripts */}
        <script data-cfasync="false" src="https://cmp.gatekeeperconsent.com/min.js" async />
        <script data-cfasync="false" src="https://the.gatekeeperconsent.com/cmp.min.js" async />
        <script async src="//www.ezojs.com/ezoic/sa.min.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ezstandalone = window.ezstandalone || {}; ezstandalone.cmd = ezstandalone.cmd || [];`,
          }}
        />
        <script src="//ezoicanalytics.com/analytics.js" async />
      </head>
      <body className="min-h-full flex flex-col dark:bg-[#060607]">
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-0000000000000000'}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <MainLayout publishedSlugs={publishedSlugs}>{children}</MainLayout>
      </body>
    </html>
  );
}
