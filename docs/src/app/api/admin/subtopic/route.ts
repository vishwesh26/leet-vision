import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from 'next/cache';

// Authentication Middleware
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return token === (process.env.ADMINPASS || "supersecret");
}

export async function POST(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { action, id, content, topicSlug, subtopicSlug, topicId, title, slug } = await req.json();

    if (action === 'create') {
      const existing = await prisma.subTopic.findUnique({ where: { slug } });
      if (existing) return NextResponse.json({ error: "Article with this slug already exists" }, { status: 400 });

      const newSubTopic = await prisma.subTopic.create({
        data: {
          topicId,
          title,
          slug,
          content,
          readingTime: Math.max(1, Math.ceil(content.length / 1000)),
          codeExamples: [],
          status: 'Draft',
        }
      });
      
      await prisma.article.create({
        data: {
          subTopicId: newSubTopic.id,
          content
        }
      });
      
      return NextResponse.json({ success: true, id: newSubTopic.id });
    }

    if (action === 'approve') {
      const sub = await prisma.subTopic.update({
        where: { id },
        data: { status: 'Published' }
      });
      revalidatePath(`/concept/${sub.slug}`);
      
      // Ping production to revalidate if configured
      if (process.env.PRODUCTION_URL) {
        fetch(`${process.env.PRODUCTION_URL}/docs/api/revalidate?path=/concept/${sub.slug}&secret=${process.env.CRON_SECRET}`).catch(console.error);
      }
      return NextResponse.json({ success: true, status: 'Published' });
    }

    if (action === 'update') {
      const sub = await prisma.subTopic.update({
        where: { id },
        data: { content }
      });
      await prisma.article.update({
        where: { subTopicId: id },
        data: { content }
      });
      revalidatePath(`/concept/${sub.slug}`);
      
      if (process.env.PRODUCTION_URL) {
        fetch(`${process.env.PRODUCTION_URL}/docs/api/revalidate?path=/concept/${sub.slug}&secret=${process.env.CRON_SECRET}`).catch(console.error);
      }
      return NextResponse.json({ success: true });
    }
    
    if (action === 'delete') {
      await prisma.subTopic.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (action === 'regenerate') {
      const secret = process.env.CRON_SECRET || "leet_vision_secret_cron_key_123";
      // Determine the host (localhost or deployed domain)
      const host = req.headers.get("host");
      const protocol = host?.includes("localhost") ? "http" : "https";
      const url = `${protocol}://${host}/docs/api/cron/generate?topic=${topicSlug}&subtopic=${subtopicSlug}&secret=${secret}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Regeneration failed");
      
      return NextResponse.json({ success: true, message: data.message });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
