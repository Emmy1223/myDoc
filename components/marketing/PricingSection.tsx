import { Check } from "lucide-react";
import Link from "next/link";

const INCLUDED = [
  "Unlimited CVs",
  "Unlimited PDF exports",
  "AI parsing on every upload",
  "Tailor to any job description",
  "All six templates",
  "Cloud save with any account",
  "No credit card required",
];

export default function PricingSection() {
  return (
    <section id="pricing" className="border-b border-stone-200">
      <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
            Pricing
          </p>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.15] tracking-[-0.02em] text-ink md:text-4xl">
            Free. No asterisks.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-stone-700 md:text-lg md:leading-9">
            myDoc is free to use. No credit card, no trial that expires, no
            limit on how many CVs you can create.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-lg">
          <div className="border border-stone-900 bg-white">
            <div className="border-b border-stone-200 bg-paper px-6 py-5">
              <p className="font-display text-lg font-bold tracking-tightish text-ink">
                Free plan
              </p>
              <p className="mt-1 text-sm text-stone-600">
                Everything you need to apply confidently
              </p>
            </div>

            <ul className="space-y-3 p-6">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check
                    className="h-4 w-4 shrink-0 text-rust"
                    strokeWidth={2.5}
                  />
                  <span className="text-sm text-stone-700">{item}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-stone-200 p-6">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center bg-rust px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
              >
                Get started free
              </Link>
              <p className="mt-3 text-center text-xs text-stone-500">
                No card. No commitments. Yours forever.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs leading-6 text-stone-500">
            We use free-tier infrastructure for AI and storage, so we can offer
            this at no cost. If we ever need to introduce paid tiers for heavy
            usage, existing users keep free access.
          </p>
        </div>
      </div>
    </section>
  );
}