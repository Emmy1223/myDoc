import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="border-b border-stone-200">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <h2 className="max-w-2xl font-display text-4xl font-bold leading-[1.15] tracking-tightish text-ink md:text-5xl">
          Stop fighting your word processor.
        </h2>
        <p className="mt-5 max-w-lg text-lg leading-7 text-stone-600">
          Bring the CV you already have. Five minutes later, it reads like it was
          typeset by someone who cared.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 bg-rust px-6 py-3 text-sm font-semibold text-white hover:bg-rust-dark"
          >
            Start Building
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-ink hover:border-ink"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
