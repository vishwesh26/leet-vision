const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const topic = await prisma.topic.findUnique({ where: { slug: 'arrays' } });
    console.log('Arrays Topic:', topic);
    process.exit(0);
}

run().catch(console.error);
