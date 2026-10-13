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

        <p className="mt-4 text-sm leading-7 text-stone-500">
          Last updated: October 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-stone-700 md:text-base md:leading-8">
          <p>
            myDoc is a CV and document workspace. This page explains what
            information we collect, why we collect it, and what control you have
            over it. The short version: we collect the minimum needed to run the
            service, and we never sell your data.
          </p>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              What we collect
            </h2>

            <div className="mt-3 space-y-4">
              <div>
                <p className="font-semibold text-ink">Account information</p>
                <p className="mt-1">
                  When you create an account, we store your name and email
                  address. If you sign in with Google, GitHub, or LinkedIn, we
                  receive your name and email from that provider. We do not
                  receive your password from those services.
                </p>
              </div>

              <div>
                <p className="font-semibold text-ink">Your documents</p>
                <p className="mt-1">
                  Anything you create in myDoc, including CVs, cover letters,
                  project briefs, reports, meeting notes, and invoices, is
                  stored on our servers so you can access it from any device.
                </p>
              </div>

              <div>
                <p className="font-semibold text-ink">Uploaded files</p>
                <p className="mt-1">
                  When you upload a PDF or Word document to parse a CV, the file
                  is sent to our servers for text extraction. The extracted text
                  is used to populate your CV. We do not keep the original file
                  after processing.
                </p>
              </div>

              <div>
                <p className="font-semibold text-ink">Push notifications</p>
                <p className="mt-1">
                  If you enable notifications, your browser sends us a
                  subscription token. We use it only to deliver notifications
                  you have asked to receive. You can turn notifications off at
                  any time from Settings or your browser.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              How we use it
            </h2>
            <ul className="mt-3 space-y-2">
              <li>
                To run the service: creating your account, storing your
                documents, and letting you sign in.
              </li>
              <li>
                To parse CVs and tailor them to job descriptions. This uses AI
                providers listed below.
              </li>
              <li>To send notifications you have asked to receive.</li>
              <li>To respond to support requests and debug issues.</li>
            </ul>
            <p className="mt-4">
              We do not sell your data. We do not use your documents to train AI
              models. We do not show ads.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Third-party services
            </h2>
            <p className="mt-3">
              We use a small set of trusted providers to run myDoc. Each
              processes data on our behalf under their own privacy policies.
            </p>

            <ul className="mt-3 space-y-3">
              <li>
                <span className="font-semibold text-ink">Vercel</span> hosts the
                application.
              </li>
              <li>
                <span className="font-semibold text-ink">Neon</span> hosts the
                database where your account and documents are stored.
              </li>
              <li>
                <span className="font-semibold text-ink">Groq</span> processes
                the text of your CV when you use AI parsing or tailoring
                features.
              </li>
              <li>
                <span className="font-semibold text-ink">
                  Google, GitHub, LinkedIn
                </span>{" "}
                provide optional sign-in. If you use them, they share your name
                and email with us.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Public sharing
            </h2>
            <p className="mt-3">
              You can choose to share a CV or document by creating a public
              link. When sharing is enabled, anyone with the link can view the
              document without signing in. You can turn sharing off at any time,
              which immediately stops the link from working.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Your control
            </h2>
            <ul className="mt-3 space-y-2">
              <li>
                You can edit or delete any document from your dashboard at any
                time.
              </li>
              <li>You can revoke a public share link at any time.</li>
              <li>You can turn off notifications at any time.</li>
              <li>
                You can request deletion of your entire account by contacting
                us. When we delete your account, all your documents, activities,
                and notification subscriptions are removed from our database.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Cookies
            </h2>
            <p className="mt-3">
              We use cookies only to keep you signed in. We do not use tracking,
              advertising, or analytics cookies that follow you across other
              sites.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Children
            </h2>
            <p className="mt-3">
              myDoc is not intended for anyone under 16. If we learn that we
              have collected data from someone under 16, we will delete it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Changes to this policy
            </h2>
            <p className="mt-3">
              If we make material changes to this policy, we will update the
              date at the top and notify users when appropriate.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold tracking-tightish text-ink">
              Contact
            </h2>
            <p className="mt-3">
              For questions about privacy or to request account deletion, reach
              out through our{" "}
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
          This policy describes how myDoc handles your data. It is provided in
          good faith and is not legal advice. Last Updated: October 2026.
        </p>
      </div>
    </main>
  );
}
