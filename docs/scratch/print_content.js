const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const subtopic = await prisma.subTopic.findUnique({
    where: { slug: "complexity-analysis-space-complexity" }
  });

  if (!subtopic) {
    console.log("Subtopic not found.");
    return;
  }

  fs.writeFileSync('scratch/raw_output_space.txt', subtopic.content);
  console.log("Raw space content successfully written to scratch/raw_output_space.txt");

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
});
