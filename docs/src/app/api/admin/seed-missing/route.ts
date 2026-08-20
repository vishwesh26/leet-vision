import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { learningRoadmap } from "@/config/roadmap";

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return token === (process.env.ADMINPASS || "supersecret");
}

export async function POST() {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let addedTopics = 0;
    let addedSubtopics = 0;

    for (const stage of learningRoadmap) {
      for (const topicConfig of stage.topics) {
        // Ensure Topic exists
        let dbTopic = await prisma.topic.findUnique({
          where: { slug: topicConfig.slug }
        });

        if (!dbTopic) {
          dbTopic = await prisma.topic.create({
            data: {
              title: topicConfig.title,
              slug: topicConfig.slug,
              order: topicConfig.order,
              category: topicConfig.category,
              difficulty: topicConfig.difficulty,
              status: "draft"
            }
          });
          addedTopics++;
        }

        for (const sub of topicConfig.subtopics) {
          const fullSlug = `${topicConfig.slug}-${sub.slug}`;
          
          const existingSub = await prisma.subTopic.findUnique({
            where: { slug: fullSlug }
          });

          if (!existingSub) {
            const newSubTopic = await prisma.subTopic.create({
              data: {
                topicId: dbTopic.id,
                title: sub.title,
                slug: fullSlug,
                content: "# 🚧 Module Coming Soon!\n\nWe're currently crafting high-quality explanations, intuitive visualizations, and curated practice problems for this topic.\n\nOur team is working hard to bring you the best learning experience possible. This module will be published very soon!\n\n**Thank you for your patience!**",
                readingTime: 1,
                codeExamples: [],
                status: 'Draft',
              }
            });
            
            await prisma.article.create({
              data: {
                subTopicId: newSubTopic.id,
                content: "# 🚧 Module Coming Soon!\n\nWe're currently crafting high-quality explanations, intuitive visualizations, and curated practice problems for this topic.\n\nOur team is working hard to bring you the best learning experience possible. This module will be published very soon!\n\n**Thank you for your patience!**",
              }
            });
            addedSubtopics++;
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Seeded ${addedTopics} new Topics and ${addedSubtopics} new Subtopics as Drafts.` 
    });

  } catch (error: any) {
    console.error("Seed API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
