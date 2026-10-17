import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDashboardData } from "@/lib/server-db";
import GradeCvClient from "@/components/tools/GradeCvClient";

export default async function GradeCvPage() {
  const userId = await getSessionUserId();
  
  if (!userId) {
    redirect("/login");
  }

  const data = await getDashboardData(userId);
  
  if (!data) {
    redirect("/login");
  }

  // Filter only CVs. If they have a "Document" type, we don't want to grade a project brief.
  const cvs = data.documents.filter((doc) => doc.kind === "CV");

  return (
    <div className="min-h-screen bg-paper">
      <GradeCvClient initialDocuments={cvs} />
    </div>
  );
}