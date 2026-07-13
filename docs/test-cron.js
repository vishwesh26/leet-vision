const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const arraysCount = await prisma.subTopic.count({ where: { slug: { startsWith: 'arrays-' } } });
    console.log('Arrays count:', arraysCount);

    const compCount = await prisma.subTopic.count({ where: { slug: { startsWith: 'complexity-analysis-' } } });
    console.log('Complexity count:', compCount);

    process.exit(0);
}

run().catch(console.error);
