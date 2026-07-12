import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { learningRoadmap, TopicConfig, SubTopicConfig } from "@/config/roadmap";
import { SECTION_LIBRARY } from "@/config/sectionLibrary";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret") || req.headers.get("x-cron-secret");
  const forceTopic = searchParams.get("topic");
  const forceSubTopic = searchParams.get("subtopic"); 

  const expectedSecret = process.env.CRON_SECRET || "leet_vision_secret_cron_key_123";

  // Security authorization check
  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    let targetTopic: TopicConfig | undefined;
    let targetSubTopic: SubTopicConfig | undefined;

    // We now enforce explicit one-by-one generation to prevent runaway cron execution and allow human review
    if (forceTopic && forceSubTopic) {
      targetTopic = learningRoadmap.flatMap((s) => s.topics).find((t) => t.slug === forceTopic);
      if (targetTopic) {
        targetSubTopic = targetTopic.subtopics.find((s) => s.slug === forceSubTopic);
      }
    } else {
      return NextResponse.json({ error: "Please specify ?topic=...&subtopic=... to generate exactly one subtopic at a time." }, { status: 400 });
    }

    if (!targetTopic || !targetSubTopic) {
      return NextResponse.json({ error: "Topic or SubTopic not found in roadmap" }, { status: 400 });
    }

    const fullSlug = `${targetTopic.slug}-${targetSubTopic.slug}`;
    const existingSub = await prisma.subTopic.findUnique({
      where: { slug: fullSlug }
    });

    if (existingSub && (existingSub.status === "Approved" || existingSub.status === "Published")) {
      return NextResponse.json({ message: "Subtopic is already Approved or Published. Skipping generation." });
    }

    console.log(`Starting dynamic generation for: ${targetSubTopic.title}`);

    // Ensure the Topic model exists in the database
    let dbTopic = await prisma.topic.findUnique({
      where: { slug: targetTopic.slug }
    });

    if (!dbTopic) {
      dbTopic = await prisma.topic.create({
        data: {
          title: targetTopic.title,
          slug: targetTopic.slug,
          order: targetTopic.order,
          category: targetTopic.category,
          difficulty: targetTopic.difficulty,
          status: "draft"
        }
      });
    }

    // Configure the Gemini Model
    const geminiModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", 
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    // ---------------------------------------------------------
    // PASS 1: Classification & Section Selection
    // ---------------------------------------------------------
    const classificationPrompt = `
      You are an expert Documentation Architect for LeetVision, a professional Data Structures & Algorithms learning platform for LeetCode interview prep.
      Topic Category: ${targetTopic.category}
      Parent Topic: ${targetTopic.title}
      Current Page to Generate: ${targetSubTopic.title}
      
      Your task:
      1. Classify what type of documentation this page should be (e.g., Concept, Algorithm, Data Structure, Pattern, Practice Hub, Cheat Sheet, etc.).
      2. Select the most relevant sections from our Section Library that would best explain this specific topic to a reader preparing for technical interviews.
      DO NOT select unnecessary sections. For example, a pure "Concept" page shouldn't have "Pseudocode". A "Practice Hub" shouldn't have "Algorithm".

      Available Sections:
      ${SECTION_LIBRARY.map(s => `- ${s.id}: ${s.description}`).join("\n")}

      Return a strict JSON object:
      {
        "classification": "String (e.g. Concept)",
        "selectedSectionIds": ["array", "of", "strings", "matching", "the", "ids", "above"],
        "reasoning": "Brief explanation of why these sections were chosen."
      }
    `;

    console.log("Running Pass 1: Section Selection...");
    const pass1Result = await geminiModel.generateContent(classificationPrompt);
    const pass1Json = JSON.parse(pass1Result.response.text().replace(/^```json|```$/ig, "").trim());
    
    console.log(`Classification: ${pass1Json.classification}`);
    console.log(`Selected Sections: ${pass1Json.selectedSectionIds.join(", ")}`);

    // Build the dynamic schema for Pass 2
    const selectedSections = SECTION_LIBRARY.filter(s => pass1Json.selectedSectionIds.includes(s.id));
    
    let schemaDefinition = "{\n";
    schemaDefinition += `  "title": "Subtopic Title",\n`;
    schemaDefinition += `  "readingTime": 5,\n`;
    selectedSections.forEach(s => {
      schemaDefinition += `  "${s.id}": "${s.formatDescription}",\n`;
    });
    schemaDefinition += "}";

    // ---------------------------------------------------------
    // PASS 2: Content Generation
    // ---------------------------------------------------------
    const generationPrompt = `
      You are a Principal Software Engineer and expert computer science professor. Generate comprehensive, production-ready, professional documentation for the subtopic "${targetSubTopic.title}" which is part of the topic "${targetTopic.title}".
      
      This page is classified as: ${pass1Json.classification}.
      The writing style should feel like high-quality engineering documentation (e.g., Mozilla MDN, Microsoft Learn, GitBook), focusing heavily on Pattern Recognition, Interview Thinking, Problem Solving, and Optimization for LeetCode. 
      DO NOT write repetitive, generic AI templates. 
      DO NOT start sections with repetitive transition phrases.
      DO NOT hallucinate.
      
      Your response must be a strict JSON object following this EXACT dynamic schema composed specifically for this topic:
      ${schemaDefinition}

      RULES:
      1. If 'code' section is requested, provide functionally correct implementations. 
      2. If 'practiceProblems' is requested, use real LeetCode problems (URLs: https://leetcode.com/problems/[slug]/).
      3. ASCII diagrams must be formatted with newlines.
      4. Markdown tables (e.g., in cheat sheets) must be perfectly formatted with exact standard columns and no trailing empty pipes.
    `;

    console.log("Running Pass 2: Content Generation...");
    const pass2Result = await geminiModel.generateContent(generationPrompt);
    const pass2Json = JSON.parse(pass2Result.response.text().replace(/^```json|```$/ig, "").trim());

    // Build the markdown body dynamically based on the returned keys in Pass 2
    let markdownBody = `# ${pass2Json.title}\n\n`;
    
    // Ordered rendering logic based on Section Library
    for (const section of SECTION_LIBRARY) {
      const content = pass2Json[section.id];
      if (!content) continue;

      markdownBody += `## ${section.name}\n`;
      
      if (typeof content === "string") {
        if (["visualization", "asciiDiagram", "memoryVisualization", "pseudocode", "flowDiagram"].includes(section.id)) {
          markdownBody += `\`\`\`text\n${content}\n\`\`\`\n\n`;
        } else {
          markdownBody += `${content}\n\n`;
        }
      } else if (Array.isArray(content)) {
        if (section.id === "code") {
          markdownBody += `*(See Implementations block below)*\n\n`;
        } else if (section.id === "lineByLineExplanation") {
          content.forEach((item: any) => {
            markdownBody += `- **Line ${item.line}**: ${item.explanation}\n`;
          });
          markdownBody += `\n`;
        } else if (section.id === "comparisonTable") {
          markdownBody += `| Approach | Pros | Cons |\n|---|---|---|\n`;
          content.forEach((item: any) => {
            markdownBody += `| ${item.approach} | ${item.pros} | ${item.cons} |\n`;
          });
          markdownBody += `\n`;
        } else if (section.id === "frequentlyAskedQuestions") {
          content.forEach((item: any) => {
            markdownBody += `**Q: ${item.question}**\n${item.answer}\n\n`;
          });
        } else if (section.id === "practiceProblems") {
           markdownBody += `*(See Practice Problems index below)*\n\n`;
        } else {
          content.forEach((item: string) => {
            markdownBody += `- ${item}\n`;
          });
          markdownBody += `\n`;
        }
      } else if (typeof content === "object") {
        if (section.id === "timeComplexity" || section.id === "spaceComplexity") {
          markdownBody += `**\`${content.complexity}\`** - ${content.explanation}\n\n`;
        }
      }
    }

    // Save to Database as DRAFT
    const finalSubTopic = await prisma.subTopic.upsert({
      where: { slug: fullSlug },
      update: {
        title: pass2Json.title,
        readingTime: pass2Json.readingTime || 5,
        codeExamples: pass2Json.code || [],
        content: markdownBody,
        status: "Draft" // Enforcement of review workflow
      },
      create: {
        topicId: dbTopic.id,
        title: pass2Json.title,
        slug: fullSlug,
        readingTime: pass2Json.readingTime || 5,
        codeExamples: pass2Json.code || [],
        content: markdownBody,
        status: "Draft" // Enforcement of review workflow
      }
    });

    await prisma.article.upsert({
      where: { subTopicId: finalSubTopic.id },
      update: { content: markdownBody },
      create: { subTopicId: finalSubTopic.id, content: markdownBody }
    });

    // Wipe old practice problems and insert new ones if provided
    await prisma.practiceProblem.deleteMany({
      where: { subTopicId: finalSubTopic.id }
    });

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

    console.log(`Successfully generated and saved Draft for: ${targetSubTopic.title}`);

    return NextResponse.json({
      success: true,
      message: `Successfully generated Draft for ${targetSubTopic.title}`,
      classification: pass1Json.classification,
      sections: pass1Json.selectedSectionIds
    });

  } catch (err: any) {
    console.error("General Generation Error:", err);
    return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
  }
}
