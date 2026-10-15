import type { Metadata } from "next";
import Link from "next/link";
import FeedbackForm from "@/components/feedback/FeedbackForm";

export const metadata: Metadata = {
  title: "Feedback - myDoc",
};

export default function FeedbackPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-stone-200">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/"
            className="font-display text-lg font-extrabold tracking-tightish text-ink"
          >
            my<span className="text-rust">Doc</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-stone-600 hover:text-rust"
          >
            Back to myDoc
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
          Feedback
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tightish text-ink md:text-4xl">
          Tell us what you think
        </h1>
        <p className="mt-3 text-base leading-7 text-stone-600">
          Found a bug? Have an idea? Want to say something works well? Send it
          through. Everything is read. Name and email are optional.
        </p>

        <div className="mt-8">
          <FeedbackForm />
        </div>
      </div>
    </main>
  );
}