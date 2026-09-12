import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/session";
import { getDashboardData } from "@/lib/server-db";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DocumentsList from "@/components/dashboard/DocumentsList";

export const metadata: Metadata = {
  title: "Dashboard - myDoc",
};

export default async function DashboardPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login?next=/dashboard");
  }

  const data = await getDashboardData(userId);

  if (!data) {
    redirect("/login?next=/dashboard");
  }

  const { user, documents, stats } = data;
  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex min-h-screen bg-paper">
      <DashboardSidebar
        user={{ name: user.name }}
        documentsCount={documents.length}
        initials={initials}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-stone-200 bg-paper px-5 py-3 md:hidden print-hidden">
          <Link
            href="/"
            className="font-display text-lg font-extrabold tracking-tightish"
          >
            my<span className="text-rust">Doc</span>
          </Link>
          <Link
            href="/builder?new=1"
            className="bg-rust px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rust-dark"
          >
            New
          </Link>
        </div>

        <main className="flex-1 px-6 py-10 md:px-10 md:py-12">
          <DocumentsList
            userName={user.name}
            documents={documents}
            stats={stats}
          />
        </main>
      </div>
    </div>
  );
}