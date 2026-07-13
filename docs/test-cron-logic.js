const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { learningRoadmap } = require('./src/config/roadmap.ts');

async function dryRun() {
    console.log("Starting dry run...");
    let targetTopic = null;
    let missingSubtopics = [];

    for (const stage of learningRoadmap) {
      for (const topic of stage.topics) {
        const existingSubsCount = await prisma.subTopic.count({
          where: { slug: { startsWith: `${topic.slug}-` } }
        });
        
        console.log(`Topic: ${topic.slug} | Expected: ${topic.subtopics.length} | DB Count: ${existingSubsCount}`);

        if (existingSubsCount < topic.subtopics.length) {
          targetTopic = topic;
          
          const existingSubs = await prisma.subTopic.findMany({
            where: { slug: { startsWith: `${topic.slug}-` } },
            select: { slug: true }
          });
          const existingSlugs = existingSubs.map(s => s.slug);
          
          missingSubtopics = topic.subtopics.filter(s => !existingSlugs.includes(`${topic.slug}-${s.slug}`));
          break;
        }
      }
      if (targetTopic) break;
    }

    if (!targetTopic) {
        console.log("All topics fully generated!");
    } else {
        console.log("TARGET TOPIC:", targetTopic.slug);
        console.log("MISSING SUBTOPICS:", missingSubtopics.map(m => m.slug));
    }
}

dryRun().catch(console.error).finally(() => prisma.$disconnect());
