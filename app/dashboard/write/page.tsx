import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDashboardData } from "@/lib/server-db";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DocBuilderClient from "@/components/builder/doc/DocBuilderClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function initialsFrom(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

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

  const docList = data.documents
    .filter((d) => d.kind === "Document")
    .map((d) => ({
      id: d.id,
      title: d.title,
      updatedAt: d.updatedAt,
    }));

  return (
    <div className="flex min-h-screen bg-stone-950">
      <DashboardSidebar
        user={data.user}
        documentsCount={data.documents.length}
        initials={initialsFrom(data.user.name)}
      />
      <main className="flex min-h-screen flex-1 flex-col bg-stone-100">
        <DocBuilderClient
          initialDocuments={docList}
          initialActiveId={requestedId ?? null}
        />
      </main>
    </div>
  );
}