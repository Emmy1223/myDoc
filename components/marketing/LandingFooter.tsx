import Link from "next/link";

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link
              href="/"
              className="font-display text-xl font-extrabold tracking-tightish text-ink"
            >
              my<span className="text-rust">Doc</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-7 text-stone-600">
              The CV builder that does not lie. Tailor your CV to any job,
              without inventing experience.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
              Product
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-sm text-stone-600 transition-colors hover:text-rust"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-sm text-stone-600 transition-colors hover:text-rust"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#roadmap"
                  className="text-sm text-stone-600 transition-colors hover:text-rust"
                >
                  Roadmap
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-sm text-stone-600 transition-colors hover:text-rust"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-sm text-stone-600 transition-colors hover:text-rust"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
              Elsewhere
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-stone-600 transition-colors hover:text-rust"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-stone-600 transition-colors hover:text-rust"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-stone-600 transition-colors hover:text-rust"
                >
                  Terms
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Emmy1223/myDoc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-stone-600 transition-colors hover:text-rust"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-6">
          <p className="text-xs text-stone-500">
            Copyright {year} myDoc. All rights reserved.
          </p>
          <p className="text-xs text-stone-500">
            Built for people who want to apply honestly.
          </p>
        </div>
      </div>
    </footer>
  );
}