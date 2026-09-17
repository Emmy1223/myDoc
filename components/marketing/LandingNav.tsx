"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingNav({ isSignedIn }: { isSignedIn: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await fetch("/api/auth/logout-all", { method: "GET", redirect: "manual" });
    } catch {
     
    }
    
    window.location.reload();
  }

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors ${
        scrolled
          ? "border-stone-200 bg-paper/95 backdrop-blur"
          : "border-transparent bg-paper"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8 md:py-4">
        <Link
          href="/"
          className="font-display text-xl font-extrabold tracking-tightish text-ink"
        >
          my<span className="text-rust">Doc</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-stone-600 transition-colors hover:text-rust"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-rust px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
              >
                Go to dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="text-sm font-semibold text-stone-700 transition-colors hover:text-rust disabled:opacity-60"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-stone-700 transition-colors hover:text-rust"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-rust px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
              >
                Try it free
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="border border-stone-300 p-2 text-stone-600 transition-colors hover:border-stone-900 hover:text-ink md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 ml-auto flex h-full w-72 max-w-[85vw] flex-col border-l border-stone-200 bg-paper">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <span className="font-display text-base font-bold tracking-tightish text-ink">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="border border-transparent p-2 text-stone-500 transition-colors hover:border-stone-300 hover:text-ink"
                aria-label="Close navigation menu"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <nav className="flex flex-col p-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-stone-200 py-3 text-sm font-semibold text-stone-700 transition-colors hover:text-rust"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="mt-auto border-t border-stone-200 p-4">
              {isSignedIn ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex w-full items-center justify-center bg-rust px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
                  >
                    Go to dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="inline-flex w-full items-center justify-center gap-2 border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-900 hover:text-ink disabled:opacity-60"
                  >
                    <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                    {signingOut ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex w-full items-center justify-center border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-900 hover:text-ink"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex w-full items-center justify-center bg-rust px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
                  >
                    Try it free
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}