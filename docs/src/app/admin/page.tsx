import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import LoginForm from "./LoginForm";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const isAdmin = token === (process.env.ADMINPASS || "supersecret");

  if (!isAdmin) {
    return <LoginForm />;
  }

  // Fetch all subtopics ordered by most recently created
  const subtopics = await prisma.subTopic.findMany({
    include: { topic: true },
    orderBy: { createdAt: 'desc' }
  });

  return <AdminDashboard initialSubtopics={subtopics} />;
}
