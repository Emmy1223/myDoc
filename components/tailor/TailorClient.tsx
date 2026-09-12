"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import ChooseCvStep from "./ChooseCvStep";
import PasteJdStep from "./PasteJdStep";

type DocumentItem = {
  id: string;
  title: string;
  kind: string;
  status: "draft" | "in-progress" | "completed";
  templateId: string;
  templateName: string;
  createdAt: string;
  updatedAt: string;
  exportCount: number;
};

type Step = "choose" | "paste";

// ---- File extraction helpers ----

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjs = await import("pdfjs-dist");
  // @ts-ignore
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
}

async function extractTextFromFile(file: File): Promise<string> {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const isDocx =
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx");

  if (isPdf) {
    try {
      return await extractTextFromPDF(file);
    } catch (err) {
      console.error("PDF extraction failed, falling back to text:", err);
      return await file.text();
    }
  }

  if (isDocx) {
    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch {
      return await file.text();
    }
  }

  return await file.text();
}

// ---- Component ----

export default function TailorClient({
  user,
  documents: initialDocuments,
  initialDocumentId,
}: {
  user: { id: string; name: string };
  documents: DocumentItem[];
  initialDocumentId: string | null;
}) {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [step, setStep] = useState<Step>(
    initialDocumentId ? "paste" : "choose",
  );
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    initialDocumentId,
  );
  const [jobDescription, setJobDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [success, setSuccess] = useState<{
    documentId: string;
    title: string;
    matchScore: number;
  } | null>(null);

  const selectedDocument =
    documents.find((d) => d.id === selectedDocumentId) ?? null;

  async function handleFilePicked(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);
    setUploadingFileName(file.name);

    try {
      const titleFromFile =
        file.name.replace(/\.[^/.]+$/, "").trim() || "Uploaded CV";

      const createResponse = await fetch("/api/documents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "create",
          title: titleFromFile,
          kind: "CV",
          status: "in-progress",
        }),
      });
      const createResult = (await createResponse.json()) as {
        document?: DocumentItem;
        error?: string;
      };
      if (!createResponse.ok || !createResult.document) {
        throw new Error(createResult.error ?? "Could not create the document.");
      }

      const newDoc = createResult.document;

      const extractedText = await extractTextFromFile(file);
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("We could not read any text from that file.");
      }

      const parseResponse = await fetch("/api/parse-cv", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: extractedText }),
      });
      const parseResult = (await parseResponse.json()) as {
        data?: any;
        error?: string;
      };
      if (!parseResponse.ok || !parseResult.data) {
        throw new Error(parseResult.error ?? "Could not parse the CV.");
      }

      const saveResponse = await fetch(`/api/documents/${newDoc.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content: parseResult.data,
          title: parseResult.data.fullName
            ? `${parseResult.data.fullName} — CV`
            : titleFromFile,
        }),
      });
      if (!saveResponse.ok) {
        const err = (await saveResponse.json()) as { error?: string };
        throw new Error(err.error ?? "Could not save the parsed CV.");
      }

      window.location.href = `/dashboard/tailor?document=${encodeURIComponent(newDoc.id)}`;
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong while uploading. Please try again.",
      );
      setUploading(false);
      setUploadingFileName(null);
    }
  }

  async function handleAnalyze() {
    if (!selectedDocument) return;

    setAnalyzing(true);
    setAnalyzeError(null);

    try {
      // ---- Step 1: Analyze the CV against the JD ----
      const analyzeResponse = await fetch("/api/tailor-cv", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDocument.id,
          jobDescription,
        }),
      });

      const analyzeResult = (await analyzeResponse.json()) as {
        report?: any;
        error?: string;
      };

      if (!analyzeResponse.ok || !analyzeResult.report) {
        throw new Error(
          analyzeResult.error ?? "The analysis failed. Please try again.",
        );
      }

      // ---- Step 2: Save the tailored CV ----
      const saveResponse = await fetch("/api/tailor-cv/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sourceDocumentId: selectedDocument.id,
          report: analyzeResult.report,
        }),
      });

      const saveResult = (await saveResponse.json()) as {
        document?: { id: string; title: string };
        error?: string;
      };

      if (!saveResponse.ok || !saveResult.document) {
        throw new Error(saveResult.error ?? "Could not save the tailored CV.");
      }

      const savedDoc = saveResult.document;

      // ---- Step 3: Show the success state ----
      setSuccess({
        documentId: savedDoc.id,
        title: savedDoc.title,
        matchScore: analyzeResult.report.matchScore ?? 0,
      });

      // ---- Step 4: Navigate to the builder (same tab) with print=1 ----
      setTimeout(() => {
        window.location.href = `/builder?document=${encodeURIComponent(
          savedDoc.id,
        )}&print=1`;
      }, 800);
    } catch (err) {
      console.error(err);
      setAnalyzeError(
        err instanceof Error
          ? err.message
          : "The analysis failed. Please try again.",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/documents/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Could not delete the CV.");
      }
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedDocumentId === id) {
        setSelectedDocumentId(null);
        setStep("choose");
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Could not delete the CV.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteAll() {
    if (documents.length === 0) return;
    setDeletingAll(true);
    try {
      const results = await Promise.all(
        documents.map((doc) =>
          fetch(`/api/documents/${encodeURIComponent(doc.id)}`, {
            method: "DELETE",
          }).then((r) => ({ id: doc.id, ok: r.ok })),
        ),
      );
      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) {
        console.error("Failed to delete:", failed.map((f) => f.id));
      }
      setDocuments([]);
      setSelectedDocumentId(null);
      setStep("choose");
    } catch (err) {
      console.error(err);
      alert("Some CVs could not be deleted. Try again.");
    } finally {
      setDeletingAll(false);
    }
  }

  // ---- Success screen ----

  if (success) {
    return (
      <div className="min-h-screen bg-paper">
        <div className="border-b border-stone-200 bg-paper">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4 md:px-10">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-rust transition-colors"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              Back to dashboard
            </Link>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-rust">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              Tailor to a Job
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-2xl px-6 py-16 md:px-10">
          <div className="border border-stone-200 bg-white p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center border border-rust/20 bg-rust/5">
              <Sparkles className="h-5 w-5 text-rust" strokeWidth={1.75} />
            </div>
            <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tightish text-ink">
              Your tailored CV is ready
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              A new document has been created from your source CV, with the
              profile and skills rewritten to match this role.
            </p>

            <div className="mt-6 border border-stone-200 bg-stone-50 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Tailored document
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {success.title}
              </p>
              <p className="mt-2 text-xs text-stone-500">
                Match score: <strong>{success.matchScore}%</strong>
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`/builder?document=${encodeURIComponent(success.documentId)}&print=1`}
                className="inline-flex items-center gap-2 bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark transition-colors"
              >
                Download PDF
              </a>
              <Link
                href={`/builder?document=${encodeURIComponent(success.documentId)}`}
                className="inline-flex items-center gap-2 border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:border-rust hover:text-rust transition-colors"
              >
                Edit in builder
              </Link>
            </div>

            <div className="mt-8 border-t border-stone-200 pt-6">
              <Link
                href="/dashboard/tailor"
                className="text-sm font-semibold text-stone-600 hover:text-rust transition-colors"
              >
                Tailor another CV
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ---- Normal flow ----

  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b border-stone-200 bg-paper">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4 md:px-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-rust transition-colors"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Back to dashboard
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-rust">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            Tailor to a Job
          </div>
        </div>
      </div>

      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-6 py-3 md:px-10">
          <StepDot
            label="Choose CV"
            active={step === "choose"}
            done={step !== "choose"}
            index={1}
          />
          <div className="h-px flex-1 bg-stone-200" />
          <StepDot
            label="Job Description"
            active={step === "paste"}
            done={false}
            index={2}
          />
          <div className="h-px flex-1 bg-stone-200" />
          <StepDot label="Download" active={false} done={false} index={3} />
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-12">
        {step === "choose" && (
          <ChooseCvStep
            documents={documents}
            onChoose={(id) => {
              setSelectedDocumentId(id);
              setStep("paste");
            }}
            onFilePicked={handleFilePicked}
            onDelete={handleDelete}
            onDeleteAll={handleDeleteAll}
            uploading={uploading}
            uploadingFileName={uploadingFileName}
            deletingId={deletingId}
            deletingAll={deletingAll}
          />
        )}

        {step === "paste" && selectedDocument && (
          <PasteJdStep
            document={selectedDocument}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onBack={() => setStep("choose")}
            onAnalyze={handleAnalyze}
            analyzing={analyzing}
            analyzeError={analyzeError}
          />
        )}
      </main>
    </div>
  );
}

function StepDot({
  label,
  active,
  done,
  index,
}: {
  label: string;
  active: boolean;
  done: boolean;
  index: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-6 w-6 items-center justify-center text-xs font-bold transition-colors ${
          active
            ? "bg-rust text-white"
            : done
              ? "bg-rust/20 text-rust"
              : "bg-stone-100 text-stone-400"
        }`}
      >
        {index}
      </span>
      <span
        className={`hidden text-xs font-semibold sm:inline ${
          active ? "text-ink" : "text-stone-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}