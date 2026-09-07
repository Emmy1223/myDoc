import type { Metadata } from "next";
import Link from "next/link";
import LoginClient from "@/components/auth/LoginClient";

export const metadata: Metadata = {
  title: "Sign in — myDoc",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const next = searchParams.next?.startsWith("/") ? searchParams.next : "/dashboard";
  return (
    <main className="min-h-screen bg-white px-6 py-8 text-[#171717] md:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between border-b border-[#E5E5E5] pb-5">
        <Link href="/" className="font-sans text-xl font-bold tracking-[-0.02em]">
          my<span className="text-[#4F46E5]">Doc</span>
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-[#525252] hover:bg-[#F5F5F5] hover:text-[#171717]"
        >
          Back to home
        </Link>
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-105px)] max-w-md items-center justify-center py-16">
        <div className="w-full">
          <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">
            Your workspace
          </p>
          <h1 className="mt-3 text-center font-sans text-4xl font-bold leading-[1.15] tracking-[-0.02em]">
            Build documents that move with you.
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-center text-sm leading-7 text-[#525252]">
            Sign in to access your saved documents, exports, templates, and activity.
          </p>
          <div className="mt-8 border border-[#E5E5E5] bg-white p-6 md:p-8">
            <LoginClient nextPath={next} />
          </div>
        </div>
      </div>
    </main>
  );
}
