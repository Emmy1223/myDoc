import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDashboardData } from "@/lib/server-db";
import DocBuilderClient from "@/components/builder/doc/DocBuilderClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ doc?: string }>;
}) {
  const { doc: requestedId } = await searchParams;
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const data = await getDashboardData(userId);
  if (!data) redirect("/login");

  // Only rich-text documents belong in this workspace.
  const docList = data.documents
    .filter((d) => d.kind === "Document")
    .map((d) => ({
      id: d.id,
      title: d.title,
      updatedAt: d.updatedAt,
    }));

  return (
    <main className="flex h-[100dvh] w-full flex-col bg-stone-100">
      <DocBuilderClient
        initialDocuments={docList}
        initialActiveId={requestedId ?? null}
      />
    </main>
  );
}