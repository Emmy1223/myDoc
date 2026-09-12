"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  FileText,
  Settings,
  Sparkles,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import HowItWorksModal from "@/components/tailor/HowItWorksModal";

type SidebarLinkProps = {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
  onClick,
}: SidebarLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
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

function SidebarContent({
  user,
  documentsCount,
  initials,
  pathname,
  onNavigate,
  onShowHowItWorks,
}: {
  user: { name: string };
  documentsCount: number;
  initials: string;
  pathname: string;
  onNavigate?: () => void;
  onShowHowItWorks: () => void;
}) {
  const isDashboard = pathname === "/dashboard";
  const isTailor = pathname.startsWith("/dashboard/tailor");
  const isSettings = pathname.startsWith("/settings");

  return (
    <>
      <div className="border-b border-stone-800 px-5 py-5">
        <Link
          href="/"
          onClick={onNavigate}
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
          active={isDashboard}
          onClick={onNavigate}
        />

        <div className="flex items-center gap-0.5">
          <div className="flex-1">
            <SidebarLink
              href="/dashboard/tailor"
              icon={Sparkles}
              label="Tailor to a Job"
              active={isTailor}
              onClick={onNavigate}
            />
          </div>
          <button
            type="button"
            onClick={onShowHowItWorks}
            className="shrink-0 border border-transparent p-2 text-stone-500 transition-colors hover:border-stone-700 hover:text-stone-300"
            aria-label="How Tailor to a Job works"
            title="How it works"
          >
            <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>

        <SidebarLink
          href="/settings"
          icon={Settings}
          label="Settings"
          active={isSettings}
          onClick={onNavigate}
        />
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
    </>
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col border-r border-stone-800 bg-stone-900 md:flex print-hidden">
        <SidebarContent
          user={user}
          documentsCount={documentsCount}
          initials={initials}
          pathname={pathname}
          onShowHowItWorks={() => setShowHowItWorks(true)}
        />
      </aside>

      <div className="flex items-center justify-between border-b border-stone-800 bg-stone-900 px-4 py-3 md:hidden print-hidden">
        <Link
          href="/"
          className="font-display text-lg font-extrabold tracking-tightish text-white"
        >
          my<span className="text-orange-400">Doc</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="border border-stone-700 p-2 text-stone-300 transition-colors hover:border-stone-500 hover:text-white"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col border-r border-stone-800 bg-stone-900">
            <div className="flex items-center justify-end border-b border-stone-800 px-3 py-2">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="border border-transparent p-2 text-stone-400 transition-colors hover:border-stone-700 hover:text-white"
                aria-label="Close navigation menu"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <SidebarContent
                user={user}
                documentsCount={documentsCount}
                initials={initials}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
                onShowHowItWorks={() => {
                  setShowHowItWorks(true);
                  setMobileOpen(false);
                }}
              />
            </div>
          </aside>
        </div>
      )}

      <HowItWorksModal
        open={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />
    </>
  );
}