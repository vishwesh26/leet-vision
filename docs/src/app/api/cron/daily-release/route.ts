import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { learningRoadmap, TopicConfig, SubTopicConfig } from "@/config/roadmap";
import { SECTION_LIBRARY } from "@/config/sectionLibrary";

// Vercel execution config (max duration)
export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret") || req.headers.get("x-cron-secret");
  const expectedSecret = process.env.CRON_SECRET || "leet_vision_secret_cron_key_123";

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // 1. Determine "Topic of the Day"
    // Find the first Topic in the roadmap that does not have all its subtopics fully generated
    let targetTopic: TopicConfig | null = null;
    let missingSubtopics: SubTopicConfig[] = [];

    for (const stage of learningRoadmap) {
      for (const topic of stage.topics) {
        // Count how many subtopics exist in DB for this topic
        const existingSubsCount = await prisma.subTopic.count({
          where: { slug: { startsWith: `${topic.slug}-` } }
        });

        if (existingSubsCount < topic.subtopics.length) {
          // This is the Topic of the Day!
          targetTopic = topic;
          
          // Find exactly which ones are missing
          const existingSubs = await prisma.subTopic.findMany({
            where: { slug: { startsWith: `${topic.slug}-` } },
            select: { slug: true }
          });
          const existingSlugs = existingSubs.map(s => s.slug);
          
          missingSubtopics = topic.subtopics.filter(s => !existingSlugs.includes(`${topic.slug}-${s.slug}`));
          break; // Stop looking, we found today's topic
        }
      }
      if (targetTopic) break;
    }

    if (!targetTopic) {
      return NextResponse.json({ message: "All topics in the roadmap have been fully generated!" });
    }

    console.log(`[DAILY CRON] Topic of the Day: ${targetTopic.title}`);
    console.log(`[DAILY CRON] Need to generate ${missingSubtopics.length} subtopics.`);

    // Ensure Topic exists in DB
    let dbTopic = await prisma.topic.findUnique({ where: { slug: targetTopic.slug } });
    if (!dbTopic) {
      dbTopic = await prisma.topic.create({
        data: {
          title: targetTopic.title,
          slug: targetTopic.slug,
          order: targetTopic.order,
          category: targetTopic.category,
          difficulty: targetTopic.difficulty,
          status: "Draft"
        }
      });
    }

    const geminiModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", 
      generationConfig: { responseMimeType: "application/json" }
    });

    const results = [];

    // 2. Loop and generate missing subtopics
    for (let i = 0; i < missingSubtopics.length; i++) {
      const targetSubTopic = missingSubtopics[i];
      const fullSlug = `${targetTopic.slug}-${targetSubTopic.slug}`;
      console.log(`[DAILY CRON] Generating Subtopic: ${targetSubTopic.title} (${i+1}/${missingSubtopics.length})`);

      try {
        // Pass 1: Classification
        const classificationPrompt = `
          You are an expert Documentation Architect for LeetVision.
          Topic Category: ${targetTopic.category}
          Parent Topic: ${targetTopic.title}
          Current Page to Generate: ${targetSubTopic.title}
          
          Your task:
          1. Classify what type of documentation this page should be.
          2. Select the most relevant sections from our Section Library. DO NOT select unnecessary sections.

          Available Sections:
          ${SECTION_LIBRARY.map(s => `- ${s.id}: ${s.description}`).join("\n")}

          Return a strict JSON object:
          {
            "classification": "String (e.g. Concept)",
            "selectedSectionIds": ["array", "of", "strings", "matching", "the", "ids", "above"],
            "reasoning": "Brief explanation of why these sections were chosen."
          }
        `;

        const pass1Result = await geminiModel.generateContent(classificationPrompt);
        const pass1Json = JSON.parse(pass1Result.response.text().replace(/^```json|```$/ig, "").trim());

        const selectedSections = SECTION_LIBRARY.filter(s => pass1Json.selectedSectionIds.includes(s.id));
        let schemaDefinition = "{\n  \"title\": \"Subtopic Title\",\n  \"readingTime\": 5,\n";
        selectedSections.forEach(s => { schemaDefinition += `  "${s.id}": "${s.formatDescription}",\n`; });
        schemaDefinition += "}";

        // Pass 2: Generation
        const generationPrompt = `
          You are a Principal Software Engineer generating production-ready documentation for LeetVision.
          Subtopic: "${targetSubTopic.title}" (Topic: "${targetTopic.title}").
          Classification: ${pass1Json.classification}.
          
          Return a strict JSON object following this EXACT dynamic schema:
          ${schemaDefinition}

          RULES:
          1. If 'code' is requested, provide functionally correct implementations. 
          2. If 'practiceProblems' is requested, use real LeetCode problems (URLs: https://leetcode.com/problems/[slug]/).
          3. ASCII diagrams must be formatted with newlines.
          4. Markdown tables (e.g., in cheat sheets) must be perfectly formatted with exact standard columns and no trailing empty pipes.
        `;

        const pass2Result = await geminiModel.generateContent(generationPrompt);
        const pass2Json = JSON.parse(pass2Result.response.text().replace(/^```json|```$/ig, "").trim());

        // Markdown Construction
        let markdownBody = `# ${pass2Json.title}\n\n`;
        for (const section of SECTION_LIBRARY) {
          const content = pass2Json[section.id];
          if (!content) continue;
          markdownBody += `## ${section.name}\n`;
          if (typeof content === "string") {
            if (["visualization", "asciiDiagram", "memoryVisualization", "pseudocode", "flowDiagram"].includes(section.id)) {
              markdownBody += `\`\`\`text\n${content}\n\`\`\`\n\n`;
            } else { markdownBody += `${content}\n\n`; }
          } else if (Array.isArray(content)) {
            if (section.id === "code") { markdownBody += `*(See Implementations block below)*\n\n`; } 
            else if (section.id === "lineByLineExplanation") {
              content.forEach((item: any) => { markdownBody += `- **Line ${item.line}**: ${item.explanation}\n`; });
              markdownBody += `\n`;
            } else if (section.id === "comparisonTable") {
              markdownBody += `| Approach | Pros | Cons |\n|---|---|---|\n`;
              content.forEach((item: any) => { markdownBody += `| ${item.approach} | ${item.pros} | ${item.cons} |\n`; });
              markdownBody += `\n`;
            } else if (section.id === "frequentlyAskedQuestions") {
              content.forEach((item: any) => { markdownBody += `**Q: ${item.question}**\n${item.answer}\n\n`; });
            } else if (section.id === "practiceProblems") { markdownBody += `*(See Practice Problems index below)*\n\n`; } 
            else { content.forEach((item: string) => { markdownBody += `- ${item}\n`; }); markdownBody += `\n`; }
          } else if (typeof content === "object") {
            if (section.id === "timeComplexity" || section.id === "spaceComplexity") {
              markdownBody += `**\`${content.complexity}\`** - ${content.explanation}\n\n`;
            }
          }
        }

        // Save as Draft
        const finalSubTopic = await prisma.subTopic.upsert({
          where: { slug: fullSlug },
          update: {
            title: pass2Json.title,
            readingTime: pass2Json.readingTime || 5,
            codeExamples: pass2Json.code || [],
            content: markdownBody,
            status: "Draft" // Force save as Draft for Admin review
          },
          create: {
            topicId: dbTopic.id,
            title: pass2Json.title,
            slug: fullSlug,
            readingTime: pass2Json.readingTime || 5,
            codeExamples: pass2Json.code || [],
            content: markdownBody,
            status: "Draft" // Force save as Draft for Admin review
          }
        });

        await prisma.article.upsert({
          where: { subTopicId: finalSubTopic.id },
          update: { content: markdownBody },
          create: { subTopicId: finalSubTopic.id, content: markdownBody }
        });

        await prisma.practiceProblem.deleteMany({ where: { subTopicId: finalSubTopic.id } });
        if (pass2Json.practiceProblems && Array.isArray(pass2Json.practiceProblems)) {
          for (const prob of pass2Json.practiceProblems) {
            await prisma.practiceProblem.create({
              data: {
                subTopicId: finalSubTopic.id,
                leetcodeProblemName: prob.name,
                leetcodeProblemId: prob.id,
                difficulty: prob.difficulty,
                pattern: prob.pattern,
                leetcodeUrl: prob.leetcodeUrl,
                leetVisionUrl: prob.leetVisionUrl
              }
            });
          }
        }

        results.push({ slug: fullSlug, status: "success" });

        // Enforce the 60-second delay UNLESS this is the last item
        if (i < missingSubtopics.length - 1) {
          console.log(`[DAILY CRON] Waiting 60 seconds before generating the next subtopic...`);
          await new Promise(r => setTimeout(r, 60000));
        }

      } catch (err: any) {
        console.error(`[DAILY CRON] Error generating ${fullSlug}:`, err);
        results.push({ slug: fullSlug, status: "error", error: err.message });
      }
    }

    return NextResponse.json({
      message: `Completed daily run for Topic: ${targetTopic.title}`,
      results
    });

  } catch (err: any) {
    console.error("General Generation Error:", err);
    return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
  }
}
