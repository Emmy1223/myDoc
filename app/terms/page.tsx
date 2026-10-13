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

        <p className="mt-4 text-sm leading-7 text-stone-500">
          Last updated: October 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-stone-700 md:text-base md:leading-8">
          <p>
            These terms explain how you can use myDoc and what you can expect
            from us. By creating an account or using the service, you agree to
            them. If anything here is unclear, reach out before using myDoc.
          </p>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Using myDoc
            </h2>
            <p className="mt-3">
              myDoc is a CV and document workspace. You can use it to create
              CVs, cover letters, project briefs, reports, meeting notes,
              invoices, and other professional documents. You agree to use it
              only for lawful purposes and to provide accurate information
              about yourself.
            </p>
            <p className="mt-3">
              Do not use myDoc to create documents that are fraudulent,
              misleading, or that impersonate another person. Do not attempt
              to disrupt the service, access other users&apos; accounts, or
              reverse engineer parts of the platform we do not expose.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Your account
            </h2>
            <p className="mt-3">
              You are responsible for keeping your login credentials secure.
              You can sign in with an email and password, or through Google,
              GitHub, or LinkedIn. If you believe your account has been
              compromised, sign out of all devices and contact us.
            </p>
            <p className="mt-3">
              You must be at least 16 years old to create an account.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Your content
            </h2>
            <p className="mt-3">
              You own everything you create in myDoc. Your CVs, documents,
              uploaded files, and the data inside them are yours. We do not
              claim any ownership over them.
            </p>
            <p className="mt-3">
              We do not use your content to train AI models, and we do not
              share it with third parties except as described in our{" "}
              <Link
                href="/privacy"
                className="font-semibold text-rust hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              AI features
            </h2>
            <p className="mt-3">
              myDoc uses AI to parse uploaded CVs, tailor your CV to a job
              description, and generate suggestions. We design our AI to never
              fabricate experience, skills, or achievements.
            </p>
            <p className="mt-3">
              You are responsible for reviewing all AI output before using it.
              AI can make mistakes. Read what it produces, fix anything that
              is wrong, and make sure the final document reflects the truth
              about your experience.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Public sharing
            </h2>
            <p className="mt-3">
              You can share a CV or document by creating a public link. When
              sharing is enabled, anyone with the link can view that document
              without signing in. You are responsible for what you choose to
              share publicly and who you send the link to.
            </p>
            <p className="mt-3">
              Turn sharing off at any time to revoke the link. We do not
              actively monitor or moderate shared documents, but we may
              remove content that violates these terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              PDF to Word conversion
            </h2>
            <p className="mt-3">
              The PDF to Word tool runs entirely in your browser. We do not
              upload, store, or see the files you convert. The result depends
              on the quality of the original PDF. Scanned documents and
              complex layouts may not convert perfectly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Availability
            </h2>
            <p className="mt-3">
              We aim to keep myDoc available at all times, but we cannot
              guarantee uninterrupted service. We may update, add, or remove
              features at any time. If we ever decide to shut down the
              service, we will give users reasonable notice and a way to
              export their documents.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Free service
            </h2>
            <p className="mt-3">
              myDoc is currently free to use, with no limits on the number of
              documents or exports. We reserve the right to introduce paid
              tiers in the future for heavy usage, but existing users keep
              free access at the level they were using when the change is
              announced.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Limitation of liability
            </h2>
            <p className="mt-3">
              myDoc is provided as-is. We do not guarantee that documents you
              create will result in job offers, interviews, or any specific
              outcome. We are not responsible for losses caused by AI errors,
              formatting issues, service interruptions, or shared links you
              choose to make public.
            </p>
            <p className="mt-3">
              You are responsible for reviewing your final documents before
              submitting them to employers, clients, or any other party.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Termination
            </h2>
            <p className="mt-3">
              You can delete your account at any time. When you do, your
              documents, activities, and subscription data are removed from
              our database. We may also terminate accounts that violate these
              terms or abuse the service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Changes to these terms
            </h2>
            <p className="mt-3">
              If we make material changes to these terms, we will update the
              date at the top and notify users when appropriate. Continuing to
              use myDoc after a change means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Contact
            </h2>
            <p className="mt-3">
              For questions about these terms, reach out through our{" "}
              <a
                href="https://www.linkedin.com/company/mydoc-official"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-rust hover:underline"
              >
                LinkedIn page
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-12 border-t border-stone-200 pt-6 text-xs text-stone-500">
          These terms describe how myDoc works and what we expect from each
          other. They are provided in good faith and are not legal advice.
        </p>
      </div>
    </main>
  );
}