import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllFeedback, getUnreadFeedbackCount } from "@/lib/server-db";
import AdminFeedbackClient from "@/components/admin/AdminFeedbackClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export default async function AdminFeedbackPage() {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();

  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    redirect("/");
  }

  const [items, unreadCount] = await Promise.all([
    getAllFeedback(),
    getUnreadFeedbackCount(),
  ]);

  return (
    <main className="min-h-screen bg-[#1c1c1e] p-8 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to admin
        </Link>

        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Feedback</h1>
            <p className="mt-1 text-sm text-stone-400">
              {items.length} total
              {unreadCount > 0 && (
                <>
                  {" · "}
                  <span className="font-semibold text-rust">
                    {unreadCount} unread
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <AdminFeedbackClient initialItems={items} />
        </div>
      </div>
    </main>
  );
}