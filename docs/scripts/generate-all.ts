import { learningRoadmap } from '../src/config/roadmap';
import { PrismaClient } from '@prisma/client';
import http from 'http';

const prisma = new PrismaClient();

async function trigger(port: number, topicSlug: string, subtopicSlug: string) {
  return new Promise((resolve) => {
    http.get(`http://localhost:${port}/api/cron/generate?topic=${topicSlug}&subtopic=${subtopicSlug}&secret=leet_vision_secret_cron_key_123`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    }).on('error', (err) => {
      resolve(null);
    });
  });
}

async function main() {
  console.log("Starting bulk generation engine...");
  let count = 0;

  for (const stage of learningRoadmap) {
    for (const topic of stage.topics) {
      if (topic.slug !== 'complexity-analysis') continue;
      
      for (const sub of topic.subtopics) {
        const fullSlug = `${topic.slug}-${sub.slug}`;
        
        // Check if the subtopic already exists to avoid overwriting Drafts or Published pages
        const existing = await prisma.subTopic.findUnique({ 
          where: { slug: fullSlug },
          select: { status: true }
        });
        
        if (existing) {
          console.log(`[SKIPPED] ${fullSlug} (Exists as ${existing.status})`);
          continue;
        }

        console.log(`\n[GENERATING] ${fullSlug}...`);
        
        // Make the request to the Next.js API
        const res: any = await trigger(3000, topic.slug, sub.slug);
        
        if (res && res.status === 200) {
          console.log(`[SUCCESS] -> ${res.data}`);
          count++;
        } else {
          console.log(`[FAILED] -> Status: ${res?.status} Data: ${res?.data}`);
        }
        
        // Wait 8 seconds between generations to avoid Gemini API rate limits
        console.log("Cooling down for 8 seconds...");
        await new Promise(r => setTimeout(r, 8000));
      }
    }
  }
  
  console.log(`\n🎉 Bulk generation complete! Generated ${count} new subtopics.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
