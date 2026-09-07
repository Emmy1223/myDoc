import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FileText, Settings, Plus, Pencil, Clock, MoreHorizontal, LogOut } from "lucide-react";
import { getSessionUserId } from "@/lib/session";
import { getDashboardData } from "@/lib/server-db";

export const metadata: Metadata = {
  title: "Dashboard — myDoc",
};

type DocStatus = "draft" | "in-progress" | "completed";

const statusLabels: Record<DocStatus, string> = {
  draft: "Draft",
  "in-progress": "In progress",
  completed: "Ready",
};

const statusStyles: Record<DocStatus, string> = {
  draft: "bg-stone-100 text-stone-600 border-stone-200",
  "in-progress": "bg-orange-50 text-rust border-orange-200",
  completed: "bg-green-50 text-green-800 border-green-200",
};

function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 border px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-rust bg-rust text-white"
          : "border-transparent text-stone-300 hover:border-stone-700 hover:bg-stone-800 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </Link>
  );
}

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  
  if (!userId) {
    redirect("/login?next=/dashboard");
  }

  const data = getDashboardData(userId);
  
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

  const recentDocs = documents.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Left sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-stone-800 bg-stone-900 md:flex print-hidden">
        <div className="border-b border-stone-800 px-5 py-5">
          <Link
            href="/"
            className="font-display text-xl font-extrabold tracking-tightish text-white"
          >
            my<span className="text-orange-400">Doc</span>
          </Link>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          <SidebarLink href="/dashboard" icon={FileText} label="My Documents" active />
          <SidebarLink href="/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="mt-auto border-t border-stone-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center border border-stone-700 bg-stone-800 text-xs font-bold text-orange-400">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user.name}
                </p>
                <p className="truncate text-xs text-stone-400">
                  {documents.length} document{documents.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-stone-500 hover:text-stone-300 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-paper px-5 py-3 md:hidden print-hidden">
          <Link
            href="/"
            className="font-display text-lg font-extrabold tracking-tightish"
          >
            my<span className="text-rust">Doc</span>
          </Link>
          <Link
            href="/builder?new=1"
            className="bg-rust px-3 py-1.5 text-xs font-semibold text-white hover:bg-rust-dark transition-colors"
          >
            New
          </Link>
        </div>

        <main className="flex-1 px-6 py-10 md:px-10 md:py-12">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
                  Workspace
                </p>
                <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tightish text-ink md:text-4xl">
                  Recent Documents
                </h1>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {documents.length === 0
                    ? "No documents yet. Create your first one to get started."
                    : `${documents.length} document${documents.length !== 1 ? "s" : ""} in your library. Pick one up where you left off.`}
                </p>
              </div>
              <Link
                href="/builder?new=1"
                className="inline-flex items-center gap-2 bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark transition-colors print-hidden"
              >
                <Plus className="h-4 w-4" strokeWidth={2.25} />
                Create New Document
              </Link>
            </div>

            {/* Documents — 1-column list */}
            {recentDocs.length === 0 ? (
              <div className="mt-8 border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
                <FileText className="mx-auto h-8 w-8 text-stone-400" strokeWidth={1.5} />
                <h3 className="mt-4 font-display text-xl font-bold text-ink">No documents yet</h3>
                <p className="mt-2 text-sm text-stone-600">
                  Upload an existing CV or start a new document from scratch.
                </p>
                <Link
                  href="/builder?upload=1"
                  className="mt-6 inline-block bg-rust px-6 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark transition-colors"
                >
                  Upload a CV
                </Link>
              </div>
            ) : (
              <ul className="mt-2">
                {recentDocs.map((doc) => {
                  const status = doc.status as DocStatus;
                  return (
                    <li
                      key={doc.id}
                      className="group flex flex-wrap items-center gap-4 border-b border-stone-200 py-5"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-stone-300 bg-white">
                        <FileText className="h-4 w-4 text-stone-500" strokeWidth={1.75} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-base font-bold tracking-tightish text-ink">
                          {doc.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
                          <Clock className="h-3 w-3" strokeWidth={2} />
                          Updated {new Date(doc.updatedAt).toLocaleDateString()}
                          <span className="text-stone-300">/</span>
                          <span>{doc.templateName} template</span>
                        </p>
                      </div>

                      <span
                        className={`border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
                      >
                        {statusLabels[status]}
                      </span>

                      <Link
                        href={`/builder?document=${encodeURIComponent(doc.id)}`}
                        className="inline-flex items-center gap-1.5 border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-ink hover:border-rust hover:text-rust transition-colors print-hidden"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                        Edit
                      </Link>
                      <span
                        className="border border-transparent p-2 text-stone-400 print-hidden"
                        aria-hidden
                      >
                        <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Quick stats */}
            {documents.length > 0 && (
              <div className="mt-10 grid grid-cols-2 gap-4 border-t border-stone-200 pt-8 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
                    Total
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-ink">
                    {stats.totalDocuments}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
                    Exports this month
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-ink">
                    {stats.exportsThisMonth}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
                    Most used template
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-ink">
                    {stats.mostUsedTemplate || "—"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}