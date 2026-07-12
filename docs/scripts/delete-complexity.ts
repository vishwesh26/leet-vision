import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting deletion of Complexity Analysis data...');
  
  // Complexity Analysis slug
  const topicSlug = 'complexity-analysis';

  const topic = await prisma.topic.findUnique({
    where: { slug: topicSlug }
  });

  if (!topic) {
    console.log(`Topic '${topicSlug}' not found in database. Nothing to delete.`);
    return;
  }

  // Delete all SubTopics associated with this Topic.
  // Cascade deletes will automatically delete related Articles and PracticeProblems
  // because of `onDelete: Cascade` in schema.prisma!
  const deletedSubTopics = await prisma.subTopic.deleteMany({
    where: { topicId: topic.id }
  });
  console.log(`Deleted ${deletedSubTopics.count} SubTopics and their cascading Articles and Practice Problems.`);

  // Delete the Topic itself
  await prisma.topic.delete({
    where: { id: topic.id }
  });
  console.log(`Deleted Topic '${topic.title}'.`);

  // Delete GenerationLogs
  const deletedLogs = await prisma.generationLog.deleteMany({
    where: { topicSlug: topicSlug }
  });
  console.log(`Deleted ${deletedLogs.count} GenerationLogs.`);

  console.log('Successfully wiped all existing Complexity Analysis generated data.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
