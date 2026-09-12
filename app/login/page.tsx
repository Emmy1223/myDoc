import type { Metadata } from "next";
import Link from "next/link";
import LoginClient from "@/components/auth/LoginClient";

export const metadata: Metadata = {
  title: "Sign in — myDoc",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // ✅ Await searchParams in Next.js 15+
  const params = await searchParams;
  const next = params.next?.startsWith("/") ? params.next : "/dashboard";

  return (
    <main className="min-h-screen bg-paper px-6 py-8 text-ink md:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between border-b border-stone-200 pb-5">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tightish text-ink">
          my<span className="text-rust">Doc</span>
        </Link>
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-105px)] max-w-md items-center justify-center py-16">
        <div className="w-full">
          <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-rust">
            Your workspace
          </p>
          <h1 className="mt-3 text-center font-display text-4xl font-bold leading-[1.15] tracking-tightish text-ink">
            Build documents that move with you.
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-center text-sm leading-7 text-stone-600">
            Sign in to access your saved documents, exports, templates, and activity.
          </p>
          <div className="mt-8 border border-stone-200 bg-white p-6 md:p-8">
            <LoginClient nextPath={next} />
          </div>
        </div>
      </div>
    </main>
  );
}