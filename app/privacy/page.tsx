import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - myDoc",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <div className="mt-8 space-y-6 text-sm leading-7 text-stone-700 md:text-base md:leading-8">
          <p>
            This is a starter Privacy Policy for myDoc. It is being reviewed
            and will be replaced with a complete policy.
          </p>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              What we collect
            </h2>
            <p className="mt-2">
              When you create an account, we store your name and email address.
              When you upload a CV or create one in myDoc, we store the text
              and structured data associated with it in your account.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              How we use it
            </h2>
            <p className="mt-2">
              Your CV data is used only to provide the service to you. It is
              never sold, shared, or used to train models.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Third parties
            </h2>
            <p className="mt-2">
              We use Neon for database storage, Vercel for hosting, and Groq
              for AI parsing and tailoring. Each of these services processes
              data on our behalf and has its own privacy policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Your control
            </h2>
            <p className="mt-2">
              You can delete any CV or your entire account at any time. When
              you delete, your data is removed from our database.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Contact
            </h2>
            <p className="mt-2">
              For questions about privacy, reach out through the GitHub
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