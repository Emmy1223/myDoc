import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingHero() {
  return (
    <section className="border-b border-stone-200">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 md:px-8 md:pb-24 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
            Free forever. No credit card.
          </p>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl md:text-6xl">
            The CV builder that does not lie
          </h1>
          <p className="mt-6 text-lg leading-8 text-stone-600 md:text-xl md:leading-9">
            Build a CV from scratch, modernize one you already have, or tailor
            it to a specific job. Whatever path you take, every word stays
            grounded in your real experience. Nothing is fabricated.
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
            No credit card required. No document limit. Free forever.
          </p>
        </div>

        <div className="mt-16 md:mt-20">
          <div className="mx-auto max-w-5xl border border-stone-300 bg-white shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-stone-200 bg-stone-100 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-3 hidden text-xs text-stone-500 sm:inline">
                mydoc-six.vercel.app/builder
              </span>
            </div>
            <img
              src="/hero-screenshot.png"
              alt="myDoc builder showing a tailored CV with a live A4 preview"
              width={1919}
              height={1079}
              className="w-full h-auto"
              loading="eager"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3 md:mt-10">
          <div className="border border-stone-200 bg-white p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-rust">
              Start from scratch
            </p>
            <p className="mt-1.5 text-sm text-stone-600">
              Build a new CV section by section with live preview.
            </p>
          </div>
          <div className="border border-stone-200 bg-white p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-rust">
              Upload and modernize
            </p>
            <p className="mt-1.5 text-sm text-stone-600">
              Bring in an existing CV. We extract and restructure it.
            </p>
          </div>
          <div className="border border-stone-200 bg-white p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-rust">
              Tailor to a job
            </p>
            <p className="mt-1.5 text-sm text-stone-600">
              Paste a job description, get a version matched to it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}