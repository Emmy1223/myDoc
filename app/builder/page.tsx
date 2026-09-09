// app/builder/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const BuilderClient = dynamic(
  () => import("@/components/builder/BuilderClient"),
  { ssr: false }
);

export default function BuilderPage() {
  const searchParams = useSearchParams();
  
  return (
    <BuilderClient
      startUpload={searchParams.get("upload") === "1"}
      startNew={searchParams.get("new") === "1"}
      startPrint={searchParams.get("print") === "1"}
      documentId={searchParams.get("id") || undefined}
    />
  );
}