import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - myDoc",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-20">
        <Link
          href="/"
          className="font-display text-xl font-extrabold tracking-tightish text-ink"
        >
          my<span className="text-rust">Doc</span>
        </Link>

        <h1 className="mt-10 font-display text-3xl font-extrabold tracking-tightish text-ink md:text-4xl">
          Terms of Service
        </h1>

        <div className="mt-8 space-y-6 text-sm leading-7 text-stone-700 md:text-base md:leading-8">
          <p>
            This is a starter Terms of Service for myDoc. It is being reviewed
            and will be replaced with complete terms.
          </p>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Using myDoc
            </h2>
            <p className="mt-2">
              myDoc is provided as-is for personal and professional CV
              creation. You agree to use it only for lawful purposes and to
              provide accurate information.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Your content
            </h2>
            <p className="mt-2">
              You own everything you create in myDoc. We do not claim any
              rights over your CV, your experience data, or the documents you
              generate.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              AI features
            </h2>
            <p className="mt-2">
              myDoc uses AI to parse CVs and tailor them to job descriptions.
              You are responsible for reviewing all AI-generated output before
              submitting it to employers. We design our AI to never fabricate
              experience, but you should always verify the final document.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Availability
            </h2>
            <p className="mt-2">
              We aim to keep myDoc available at all times but cannot guarantee
              uninterrupted service. We may update, change, or discontinue
              features at any time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Contact            </h2>
            <p className="mt-2">
              For questions about these terms, reach out through the GitHub
              repository.
            </p>
          </section>
        </div>

        <p className="mt-12 border-t border-stone-200 pt-6 text-xs text-stone-500">
          Last updated: September 2026
        </p>
      </div>
    </main>
  );
}