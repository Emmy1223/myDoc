import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSharedDocument } from "@/lib/server-db";
import { isRichDocContent, type RichDocNode } from "@/lib/doc-data";
import type { CVData, TemplateId } from "@/lib/cv-data";
import { emptyCV, DEFAULT_SECTION_ORDER } from "@/lib/cv-data";
import CvPage from "@/components/builder/CvPage";
import PublicDocView from "@/components/share/PublicDocView";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shared document",
};

export default async function SharedPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const doc = await getSharedDocument(token);
  if (!doc) notFound();

  const isCv = doc.kind === "CV";

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="border-b border-stone-200 bg-white px-6 py-4 print-hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/"
            className="font-display text-lg font-extrabold tracking-tightish text-black"
          >
            my<span className="text-rust">Doc</span>
          </Link>
          <p className="text-xs text-stone-500">
            Shared document
          </p>
        </div>
      </header>

      <main className="px-6 py-8 md:py-12">
        {isCv ? (
          <CvView content={doc.content} templateId={doc.templateId} />
        ) : (
          <DocView content={doc.content} title={doc.title} />
        )}
      </main>

      <footer className="mt-12 border-t border-stone-200 bg-white px-6 py-6 print-hidden">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs text-stone-500">
            Made with myDoc.{" "}
            <Link href="/" className="font-semibold text-rust hover:underline">
              Create yours
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

function CvView({
  content,
  templateId,
}: {
  content: Record<string, unknown> | null;
  templateId: string;
}) {
  const cv: CVData = {
    ...emptyCV,
    ...(content ?? {}),
    sectionOrder: (content as any)?.sectionOrder || DEFAULT_SECTION_ORDER,
  } as CVData;

  const validTemplates: TemplateId[] = [
    "folio",
    "ledger",
    "slab",
    "compact",
    "editorial",
    "modern",
  ];
  const template: TemplateId = validTemplates.includes(templateId as TemplateId)
    ? (templateId as TemplateId)
    : "folio";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden border border-stone-300 bg-white shadow-sm">
        <CvPage cv={cv} template={template} density="normal" pageSize="A4" />
      </div>
    </div>
  );
}

function DocView({
  content,
  title,
}: {
  content: Record<string, unknown> | null;
  title: string;
}) {
  let body: RichDocNode | null = null;
  if (isRichDocContent(content)) {
    body = content.doc;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <article className="border border-stone-300 bg-white shadow-sm">
        <div className="px-8 py-10 md:px-14 md:py-14">
          <h1 className="mb-6 font-display text-3xl font-extrabold tracking-tightish text-black">
            {title}
          </h1>
          {body ? (
            <PublicDocView body={body} />
          ) : (
            <p className="text-sm italic text-stone-500">
              This document has no readable content.
            </p>
          )}
        </div>
      </article>
    </div>
  );
}