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

type Step = "choose" | "paste" | "review";

// ---- File extraction helpers (mirrors the builder's Dropzone logic) ----

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
  documents,
  initialDocumentId,
}: {
  user: { id: string; name: string };
  documents: DocumentItem[];
  initialDocumentId: string | null;
}) {
  const [step, setStep] = useState<Step>(
    initialDocumentId ? "paste" : "choose",
  );
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    initialDocumentId,
  );
  const [jobDescription, setJobDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);

  const selectedDocument =
    documents.find((d) => d.id === selectedDocumentId) ?? null;

  async function handleFilePicked(file: File) {
    // Validate size
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);
    setUploadingFileName(file.name);

    try {
      // 1. Create a new document
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

      // 2. Extract text from the file
      const extractedText = await extractTextFromFile(file);
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("We could not read any text from that file.");
      }

      // 3. Parse it with the AI route
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

            // 4. Save the parsed data into the document (PUT, not POST)
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

      // 5. Load the fresh document list and select this one
      // We reload the page so the server component re-fetches the documents list.
      // Then we can find the new one and jump to step 2.
      // Simpler: navigate to the tailor page with ?document=<id>
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

  return (
    <div className="min-h-screen bg-paper">
      {/* Top bar */}
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

      {/* Step indicator */}
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
            done={step === "review"}
            index={2}
          />
          <div className="h-px flex-1 bg-stone-200" />
          <StepDot label="Review" active={step === "review"} done={false} index={3} />
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-12">
        {step === "choose" && (
          <ChooseCvStep
            documents={documents}
            onChoose={(id) => {
              setSelectedDocumentId(id);
              setStep("paste");
            }}
            onFilePicked={handleFilePicked}
            uploading={uploading}
            uploadingFileName={uploadingFileName}
          />
        )}

        {step === "paste" && selectedDocument && (
          <PasteJdStep
            document={selectedDocument}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onBack={() => setStep("choose")}
            onAnalyze={() => {
              alert("AI analysis coming in the next step.");
            }}
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