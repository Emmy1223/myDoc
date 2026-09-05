import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-lg font-extrabold tracking-tightish">
            my<span className="text-rust">Doc</span>
          </p>
          <p className="mt-2 max-w-sm text-sm leading-7 text-stone-600">
            A document builder that reads your old CV and lays it out again in
            clean, printable templates.
          </p>
        </div>
        <div className="flex gap-8 text-sm text-stone-600">
          <Link href="/builder" className="hover:text-rust">
            Builder
          </Link>
          <Link href="/dashboard" className="hover:text-rust">
            Dashboard
          </Link>
          <span className="cursor-default hover:text-rust">Templates</span>
          <span className="cursor-default hover:text-rust">Privacy</span>
        </div>
      </div>
      <div className="border-t border-stone-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-stone-500">
          <span>© 2026 myDoc</span>
          <span>Built with Next.js and Tailwind CSS</span>
        </div>
      </div>
    </footer>
  );
}
