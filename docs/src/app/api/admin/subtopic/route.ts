import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Authentication Middleware
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return token === (process.env.ADMINPASS || "supersecret");
}

export async function POST(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { action, id, content, topicSlug, subtopicSlug } = await req.json();

    if (action === 'approve') {
      await prisma.subTopic.update({
        where: { id },
        data: { status: 'Published' }
      });
      return NextResponse.json({ success: true, status: 'Published' });
    }

    if (action === 'update') {
      await prisma.subTopic.update({
        where: { id },
        data: { content }
      });
      await prisma.article.update({
        where: { subTopicId: id },
        data: { content }
      });
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
      const url = `${protocol}://${host}/api/cron/generate?topic=${topicSlug}&subtopic=${subtopicSlug}&secret=${secret}`;
      
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
