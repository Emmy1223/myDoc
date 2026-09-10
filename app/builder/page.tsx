// app/builder/page.tsx
import { Suspense } from "react";
import dynamic from "next/dynamic";

const BuilderClient = dynamic(
  () => import("@/components/builder/BuilderClient"),
  { ssr: false }
);

function BuilderLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-rust" />
        <p className="mt-4 text-sm text-stone-500">Loading builder...</p>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<BuilderLoading />}>
      <BuilderClient />
    </Suspense>
  );
}