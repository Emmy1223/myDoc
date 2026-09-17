import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FinalCta() {
  return (
    <section className="border-b border-stone-200">
      <div className="mx-auto max-w-4xl px-5 py-20 text-center md:px-8 md:py-28">
        <h2 className="font-display text-3xl font-extrabold leading-[1.15] tracking-[-0.02em] text-ink md:text-5xl">
          Ready to stop rewriting your CV for every job?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-stone-700 md:text-lg md:leading-9">
          Upload your existing CV. Tailor it in less than 60 seconds. Apply with
          confidence, knowing every word is true.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-rust px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
          >
            Try it free
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-900 hover:text-ink"
          >
            See how it works
          </a>
        </div>

        <p className="mt-6 text-xs text-stone-500">
          Free forever. No credit card. No limits.
        </p>
      </div>
    </section>
  );
}