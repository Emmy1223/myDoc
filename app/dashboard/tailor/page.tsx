// app/dashboard/tailor/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDashboardData } from "@/lib/server-db";
import TailorClient from "@/components/tailor/TailorClient";

export const metadata: Metadata = {
  title: "Tailor to a Job — myDoc",
};

export default async function TailorPage({
  searchParams,
}: {
  searchParams: Promise<{ document?: string }>;
}) {
  const params = await searchParams;
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login?next=/dashboard/tailor");
  }

  const data = await getDashboardData(userId);

  if (!data) {
    redirect("/login?next=/dashboard/tailor");
  }

  const { user, documents } = data;

  return (
    <TailorClient
      user={{ id: user.id, name: user.name }}
      documents={documents}
      initialDocumentId={params.document ?? null}
    />
  );
}