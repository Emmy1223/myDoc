import Link from "next/link";
import type { Metadata } from "next";
import {
  FileText,
  Settings,
  Plus,
  Pencil,
  Clock,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard — myDoc",
};

type DocStatus = "Ready" | "Draft" | "Needs review";

const statusStyles: Record<DocStatus, string> = {
  Ready: "bg-orange-50 text-rust border-orange-200",
  Draft: "bg-stone-100 text-stone-600 border-stone-200",
  "Needs review": "bg-white text-stone-700 border-stone-300",
};

const documents: {
  title: string;
  edited: string;
  template: string;
  status: DocStatus;
}[] = [
  {
    title: "Product Designer — London",
    edited: "Edited 2 hours ago",
    template: "Folio",
    status: "Ready",
  },
  {
    title: "Frontend Engineer CV",
    edited: "Edited yesterday",
    template: "Ledger",
    status: "Draft",
  },
  {
    title: "Operations Manager 2026",
    edited: "Edited 3 days ago",
    template: "Slab",
    status: "Needs review",
  },
  {
    title: "Research Assistant — Academic",
    edited: "Edited last week",
    template: "Folio",
    status: "Ready",
  },
  {
    title: "Cover Letter — Studio Application",
    edited: "Edited 12 Aug 2026",
    template: "Slab",
    status: "Draft",
  },
];

function SidebarLink({
  icon: Icon,
  label,
  active,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <span
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 border px-4 py-2.5 text-sm font-medium ${
        active
          ? "border-rust bg-rust text-white"
          : "border-transparent text-stone-300"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </span>
  );
}

export default function DashboardPage() {
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
          <SidebarLink icon={FileText} label="My Documents" active />
          <SidebarLink icon={Settings} label="Settings" />
        </nav>

        <div className="mt-auto border-t border-stone-800 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center border border-stone-700 bg-stone-800 text-xs font-bold text-orange-400">
              AR
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                Alex Reyes
              </p>
              <p className="truncate text-xs text-stone-400">Free plan</p>
            </div>
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
            href="/builder"
            className="bg-rust px-3 py-1.5 text-xs font-semibold text-white"
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
                  Five documents in your library. Pick one up where you left
                  off.
                </p>
              </div>
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark print-hidden"
              >
                <Plus className="h-4 w-4" strokeWidth={2.25} />
                Create New Document
              </Link>
            </div>

            {/* Documents — 1-column list, not a card grid */}
            <ul className="mt-2">
              {documents.map((doc, i) => (
                <li
                  key={i}
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
                      {doc.edited}
                      <span className="text-stone-300">/</span>
                      <span>{doc.template} template</span>
                    </p>
                  </div>

                  <span
                    className={`border px-2.5 py-1 text-xs font-semibold ${statusStyles[doc.status]}`}
                  >
                    {doc.status}
                  </span>

                  <Link
                    href="/builder"
                    className="inline-flex items-center gap-1.5 border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-ink hover:border-rust hover:text-rust print-hidden"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                    Edit
                  </Link>
                  <span
                    className="border border-transparent p-2 text-stone-400 print:hidden"
                    aria-hidden
                  >
                    <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
