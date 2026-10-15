import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllReviews, getReviewStats } from "@/lib/server-db";
import AdminReviewsClient from "@/components/admin/AdminReviewsClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export default async function AdminReviewsPage() {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();

  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    redirect("/");
  }

  const [items, stats] = await Promise.all([
    getAllReviews(),
    getReviewStats(),
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

        <div className="mt-6">
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="mt-1 text-sm text-stone-400">
            {stats.total} total
            {stats.pending > 0 && (
              <>
                {" · "}
                <span className="font-semibold text-rust">
                  {stats.pending} pending
                </span>
              </>
            )}
            {stats.approved > 0 && (
              <>
                {" · "}
                {stats.approved} approved
                {stats.avgRating > 0 && (
                  <> · avg {stats.avgRating.toFixed(1)} ★</>
                )}
              </>
            )}
          </p>
        </div>

        <div className="mt-8">
          <AdminReviewsClient initialItems={items} />
        </div>
      </div>
    </main>
  );
}