import Link from "next/link";

export default function Nav() {
  return (
    <header className="border-b border-stone-200 bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl font-extrabold tracking-tightish text-ink"
        >
          my<span className="text-rust">Doc</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-ink"
          >
            Sign In
          </Link>
          <Link
            href="/builder"
            className="bg-rust px-4 py-2 text-sm font-semibold text-white hover:bg-rust-dark"
          >
            Start Building
          </Link>
        </nav>
      </div>
    </header>
  );
}
