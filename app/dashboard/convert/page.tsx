import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDashboardData } from "@/lib/server-db";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import PdfToWordClient from "@/components/tools/PdfToWordClient";

export const metadata: Metadata = {
  title: "PDF to Word - myDoc",
};

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

export default async function ConvertPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/dashboard/convert");

  const data = await getDashboardData(userId);
  if (!data) redirect("/login?next=/dashboard/convert");

  return (
    <div className="flex min-h-screen flex-col bg-paper md:flex-row">
      <DashboardSidebar
        user={{ name: data.user.name }}
        documentsCount={data.documents.length}
        initials={initialsFrom(data.user.name)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-6 py-10 md:px-10 md:py-12">
          <div className="mx-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
              Tools
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-extrabold tracking-tightish text-ink md:text-4xl">
                PDF to Word
              </h1>
              <span className="inline-flex items-center border border-rust bg-rust/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rust">
                Beta
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Upload a PDF and download an editable Word document. Runs entirely
              in your browser. Nothing is sent to a server.
            </p>
            <p className="mt-3 border-l-2 border-rust bg-orange-50/60 px-3 py-2 text-xs leading-5 text-stone-700">
              <strong className="font-semibold text-ink">Beta:</strong> Works
              best on text-based PDFs. Scanned documents and PDFs with complex
              layouts may not convert perfectly yet. We&apos;re actively
              improving this tool.
            </p>
            <p className="mt-3 border-l-2 border-amber-400 bg-amber-50/60 px-3 py-2 text-xs leading-5 text-stone-700">
              <strong className="font-semibold text-ink">iOS:</strong> Some
              iPhone and iPad users are seeing errors during conversion. This
              is a known issue and we are working on a fix.
            </p>

            <div className="mt-8">
              <PdfToWordClient />
            </div>

            <div className="mt-8 border-t border-stone-200 pt-6">
              <p className="text-xs leading-5 text-stone-500">
                Best for text-based PDFs (CVs, reports, memos). Scanned
                documents and image-heavy layouts may not convert cleanly.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}