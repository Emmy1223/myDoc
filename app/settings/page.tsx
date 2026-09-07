import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import SettingsClient from "@/components/dashboard/SettingsClient";

export const metadata: Metadata = {
  title: "Settings — myDoc",
};

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar active="settings" />

      <div className="flex min-w-0 flex-1 flex-col">
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
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 border-b border-stone-200 pb-6">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-rust"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                Back to documents
              </Link>
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-rust">
                Workspace
              </p>
              <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tightish text-ink md:text-4xl">
                Settings
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                Choose your document defaults, editor preferences, and local workspace details.
              </p>
            </div>

            <SettingsClient />
          </div>
        </main>
      </div>
    </div>
  );
}
