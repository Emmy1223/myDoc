"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Settings, Sparkles, HelpCircle } from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import HowItWorksModal from "@/components/tailor/HowItWorksModal";

type SidebarLinkProps = {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
};

function SidebarLink({ href, icon: Icon, label, active }: SidebarLinkProps) {
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

export default function DashboardSidebar({
  user,
  documentsCount,
  initials,
}: {
  user: { name: string };
  documentsCount: number;
  initials: string;
}) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <>
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
          <SidebarLink
            href="/dashboard"
            icon={FileText}
            label="My Documents"
            active
          />

          <div className="flex items-center gap-0.5">
            <div className="flex-1">
              <SidebarLink
                href="/dashboard/tailor"
                icon={Sparkles}
                label="Tailor to a Job"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowHowItWorks(true)}
              className="shrink-0 border border-transparent p-2 text-stone-500 hover:border-stone-700 hover:text-stone-300 transition-colors"
              aria-label="How Tailor to a Job works"
              title="How it works"
            >
              <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>

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
                  {documentsCount} document{documentsCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>

      <HowItWorksModal
        open={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />
    </>
  );
}