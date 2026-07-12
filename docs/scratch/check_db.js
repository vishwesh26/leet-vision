const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Checking database collections...");
  
  const topics = await prisma.topic.findMany({
    include: {
      _count: {
        select: { subTopics: true }
      }
    }
  });
  console.log("\nTopics in DB:");
  topics.forEach(t => {
    console.log(`- ${t.title} (${t.slug}) | Status: ${t.status} | Subtopics Count: ${t._count.subTopics}`);
  });

  const subtopics = await prisma.subTopic.findMany({
    select: {
      title: true,
      slug: true
    }
  });
  console.log("\nSubtopics in DB:");
  subtopics.forEach(s => {
    console.log(`  * ${s.title} (${s.slug})`);
  });

  const logs = await prisma.generationLog.findMany({
    orderBy: { startedAt: 'desc' },
    take: 5
  });
  console.log("\nRecent Generation Logs:");
  logs.forEach(l => {
    console.log(`- Slug: ${l.topicSlug} | Status: ${l.status} | Error: ${l.errorMessage} | Completed: ${l.completedAt}`);
  });

  await prisma.$disconnect();
}

main().catch(err => {
  console.error("DB Check script error:", err);
  process.exit(1);
});
