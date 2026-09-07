import Link from "next/link";
import { FileText, type LucideIcon } from "lucide-react";

type SidebarSection = "documents" | "settings";

export default function Sidebar({ active }: { active: SidebarSection }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-stone-800 bg-stone-900 md:flex print-hidden">
      <div className="border-b border-stone-800 px-5 py-5">
        <Link
          href="/"
          className="font-display text-xl font-extrabold tracking-tightish text-white"
        >
          my<span className="text-orange-400">Doc</span>
        </Link>
      </div>

      <nav className="flex flex-col gap-1 p-3" aria-label="Workspace">
        <SidebarLink
          href="/dashboard"
          icon={FileText}
          label="My Documents"
          active={active === "documents"}
        />
      </nav>
    </aside>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
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
