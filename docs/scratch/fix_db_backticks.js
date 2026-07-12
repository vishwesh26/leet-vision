const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Checking for unclosed backticks in database articles...");

  // Find all subtopics
  const subtopics = await prisma.subTopic.findMany();
  let fixedCount = 0;

  for (const sub of subtopics) {
    if (sub.content.includes("```text\n```pseudocode") || sub.content.includes("```text\r\n```pseudocode") || sub.content.includes("```\n```\n")) {
      console.log(`Fixing double code wraps in subtopic: ${sub.title} (${sub.slug})`);
      
      // Clean up the text
      let cleanedContent = sub.content
        .replace(/```text\r?\n```pseudocode/gi, "```text")
        .replace(/```text\r?\n```text/gi, "```text")
        .replace(/```\r?\n```\r?\n/g, "```\n")
        .replace(/```\r?\n```/g, "```");
      
      // Update DB
      await prisma.subTopic.update({
        where: { id: sub.id },
        data: { content: cleanedContent }
      });

      // Also update the related Article table
      const article = await prisma.article.findFirst({
        where: { subTopicId: sub.id }
      });
      if (article) {
        await prisma.article.update({
          where: { id: article.id },
          data: { content: cleanedContent }
        });
      }

      fixedCount++;
    }
  }

  console.log(`Done. Successfully fixed ${fixedCount} database entries.`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error("Fix script failed:", err);
  process.exit(1);
});
