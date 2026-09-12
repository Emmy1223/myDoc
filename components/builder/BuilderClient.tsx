// components/builder/BuilderClient.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  FileDown,
  LayoutTemplate,
  Cloud,
  CloudOff,
  Save,
} from "lucide-react";
import type { CVData, TemplateId, Density } from "@/lib/cv-data";
import { emptyCV, DEFAULT_SECTION_ORDER } from "@/lib/cv-data";
import Dropzone from "./Dropzone";
import ContentTab from "./ContentTab";
import TemplatesTab from "./TemplatesTab";
import SettingsTab from "./SettingsTab";
import CvPage from "./CvPage";
import MeasureCv from "./MeasureCv";
import type { BulletStyle, BulletSpacing } from "./fields";

type Tab = "content" | "templates" | "settings";

const PAGE_PX: Record<"A4" | "Letter", { w: number; h: number }> = {
  A4: { w: 793.7, h: 1122.5 },
  Letter: { w: 816, h: 1056 },
};

const STORAGE_KEY = "myDoc_cv_data";

function saveToLocalStorage(data: CVData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

function loadFromLocalStorage(): CVData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
  }
  return null;
}

export default function BuilderClient({
  startUpload = false,
  startNew = false,
  startPrint = false,
  documentId,
}: {
  startUpload?: boolean;
  startNew?: boolean;
  startPrint?: boolean;
  documentId?: string;
}) {
  const [cv, setCv] = useState<CVData>(() => {
    if (startNew) return emptyCV;
    if (documentId) return emptyCV;

    const saved = loadFromLocalStorage();
    if (saved) {
      return {
        ...emptyCV,
        ...saved,
        sectionOrder: saved.sectionOrder || DEFAULT_SECTION_ORDER,
      };
    }

    return emptyCV;
  });

  const [tab, setTab] = useState<Tab>("content");
  const [template, setTemplate] = useState<TemplateId>("folio");
  const [pageSize, setPageSize] = useState<"A4" | "Letter">("A4");
  const [density, setDensity] = useState<Density>("auto");
  const [docName, setDocName] = useState("");
  const [showGuides, setShowGuides] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [autoFit, setAutoFit] = useState(true);
  const [highlightDropzone, setHighlightDropzone] = useState(startUpload);
  const [saved, setSaved] = useState(true);
  const [scale, setScale] = useState(0.5);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [documentLoaded, setDocumentLoaded] = useState(!documentId);

  const [resolvedDensity, setResolvedDensity] = useState<Density>("normal");
  const [measuring, setMeasuring] = useState<"normal" | "compact" | null>(null);
  const [overflowWarning, setOverflowWarning] = useState(false);

  const [bulletStyle, setBulletStyle] = useState<BulletStyle>("dot");
  const [bulletSpacing, setBulletSpacing] = useState<BulletSpacing>("compact");

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoSave) {
      saveToLocalStorage(cv);
      setSaved(true);
      setLastSaved(new Date());
    }
  }, [cv, autoSave]);

  useEffect(() => {
    if (autoSave) {
      const settings = {
        template,
        pageSize,
        density,
        docName,
        bulletStyle,
        bulletSpacing,
        autoFit,
      };
      try {
        localStorage.setItem("myDoc_settings", JSON.stringify(settings));
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    }
  }, [
    template,
    pageSize,
    density,
    docName,
    bulletStyle,
    bulletSpacing,
    autoFit,
    autoSave,
  ]);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("myDoc_settings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.template) setTemplate(settings.template);
        if (settings.pageSize) setPageSize(settings.pageSize);
        if (settings.density) setDensity(settings.density);
        if (settings.docName) setDocName(settings.docName);
        if (settings.bulletStyle) setBulletStyle(settings.bulletStyle);
        if (settings.bulletSpacing) setBulletSpacing(settings.bulletSpacing);
        if (typeof settings.autoFit === "boolean") setAutoFit(settings.autoFit);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  useEffect(() => {
    if (!documentId) {
      setDocumentLoaded(true);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/documents/${encodeURIComponent(documentId)}`,
        );
        if (!res.ok) {
          console.error("Failed to load document:", res.status);
          setDocumentLoaded(true);
          return;
        }
        const result = (await res.json()) as {
          document?: {
            id: string;
            title: string;
            templateId: string;
            content?: Record<string, unknown> | null;
          };
        };
        const doc = result.document;
        if (cancelled || !doc) {
          setDocumentLoaded(true);
          return;
        }

        const loadedCv: CVData = {
          ...emptyCV,
          ...(doc.content ?? {}),
          sectionOrder:
            (doc.content as any)?.sectionOrder || DEFAULT_SECTION_ORDER,
        };

        setCv(loadedCv);
        if (doc.title) setDocName(doc.title);
        if (
          doc.templateId === "folio" ||
          doc.templateId === "ledger" ||
          doc.templateId === "slab"
        ) {
          setTemplate(doc.templateId);
        }
        setHighlightDropzone(false);
        setDocumentLoaded(true);
      } catch (err) {
        console.error("Failed to load document:", err);
        setDocumentLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  useEffect(() => {
    if (!documentId || !documentLoaded || !autoSave) return;

    const timer = window.setTimeout(async () => {
      try {
        await fetch(`/api/documents/${encodeURIComponent(documentId)}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            content: cv,
            title: docName || "Untitled document",
            templateId: template,
          }),
        });
        setSaved(true);
        setLastSaved(new Date());
      } catch (err) {
        console.error("Failed to save document to DB:", err);
      }
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [documentId, documentLoaded, cv, docName, template, autoSave]);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const compute = () => {
      const available = el.clientWidth - 48;
      const pageW = PAGE_PX[pageSize].w;
      setScale(Math.min(1, Math.max(0.15, available / pageW)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pageSize]);

  useEffect(() => {
    if (autoSave) {
      setSaved(false);
      const t = window.setTimeout(() => setSaved(true), 900);
      return () => window.clearTimeout(t);
    }
  }, [
    cv,
    docName,
    template,
    pageSize,
    density,
    autoSave,
    bulletStyle,
    bulletSpacing,
  ]);

  useEffect(() => {
    if (!startPrint) return;
    if (!documentLoaded) return;

    const timer = window.setTimeout(() => {
      const previousTitle = document.title;
      const pdfTitle =
        docName?.trim() || cv.fullName?.trim() || "CV";

      document.title = pdfTitle;
      window.print();

      const restore = () => {
        document.title = previousTitle;
        window.removeEventListener("afterprint", restore);
      };
      window.addEventListener("afterprint", restore);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [startPrint, documentLoaded, docName, cv.fullName]);

  useEffect(() => {
    if (!documentLoaded) return;

    if (!autoFit) {
      setResolvedDensity(density === "auto" ? "normal" : density);
      setOverflowWarning(false);
      setMeasuring(null);
      return;
    }

    setOverflowWarning(false);
    setMeasuring("normal");
  }, [autoFit, density, cv, template, pageSize, bulletStyle, bulletSpacing, documentLoaded]);

  const handleMeasure = useCallback(
    (height: number) => {
      if (!autoFit || !measuring) return;

      const targetHeight = PAGE_PX[pageSize].h * 2;

      if (height <= targetHeight) {
        setResolvedDensity(measuring);
        setOverflowWarning(false);
        setMeasuring(null);
        return;
      }

      if (measuring === "normal") {
        setMeasuring("compact");
      } else if (measuring === "compact") {
        setResolvedDensity("compact");
        setOverflowWarning(true);
        setMeasuring(null);
      }
    },
    [autoFit, measuring, pageSize],
  );

  const handleExtracted = useCallback(
    (fileName: string, extractedData: CVData) => {
      setCv(extractedData);
      const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "").trim();
      setDocName(nameWithoutExtension || "Imported CV");
      setTab("content");
    },
    [],
  );

  const handleDownload = () => {
    saveToLocalStorage(cv);
    window.print();
  };

  const handleManualSave = () => {
    saveToLocalStorage(cv);
    setSaved(true);
    setLastSaved(new Date());
  };

  const pagePx = PAGE_PX[pageSize];

  const getLastSavedText = () => {
    if (!lastSaved) return "Not saved yet";
    const diff = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (diff < 60) return "Saved just now";
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)} minutes ago`;
    return `Saved ${Math.floor(diff / 3600)} hours ago`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper md:h-screen md:flex-row">
      <div className="flex max-h-[70vh] shrink-0 flex-col border-b border-stone-200 bg-paper md:max-h-none md:h-screen md:w-[35%] md:border-b-0 md:border-r print-hidden">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-rust"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleManualSave}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-rust"
              title="Save manually"
            >
              <Save className="h-3.5 w-3.5" strokeWidth={2} />
              Save
            </button>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                saved ? "text-stone-500" : "text-rust"
              }`}
              title={getLastSavedText()}
            >
              {saved ? (
                <>
                  <Cloud className="h-3.5 w-3.5" strokeWidth={2} />
                  Saved
                </>
              ) : (
                <>
                  <CloudOff className="h-3.5 w-3.5" strokeWidth={2} />
                  Saving…
                </>
              )}
            </span>
          </div>
        </div>

        <div className="border-b border-stone-200 p-4">
          <Dropzone
            onExtracted={handleExtracted}
            highlight={highlightDropzone}
            onHighlightClear={() => setHighlightDropzone(false)}
          />
        </div>

        <div className="border-b border-stone-200 px-4 py-3">
          <input
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            aria-label="Document name"
            className="w-full bg-transparent font-display text-base font-bold tracking-tightish text-ink placeholder:text-stone-400"
            placeholder="Untitled document"
          />
        </div>

        <div className="flex border-b border-stone-200">
          {(
            [
              ["content", "Content"],
              ["templates", "Templates"],
              ["settings", "Settings"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 border-b-2 px-2 py-3 text-sm font-semibold transition-colors ${
                tab === key
                  ? "border-rust text-rust"
                  : "border-transparent text-stone-500 hover:bg-stone-100 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {tab === "content" && (
            <ContentTab
              cv={cv}
              setCv={setCv}
              bulletStyle={bulletStyle}
              bulletSpacing={bulletSpacing}
              onBulletStyleChange={setBulletStyle}
              onBulletSpacingChange={setBulletSpacing}
            />
          )}
          {tab === "templates" && (
            <TemplatesTab template={template} setTemplate={setTemplate} />
          )}
          {tab === "settings" && (
            <SettingsTab
              docName={docName}
              setDocName={setDocName}
              pageSize={pageSize}
              setPageSize={setPageSize}
              density={density}
              setDensity={setDensity}
              showGuides={showGuides}
              setShowGuides={setShowGuides}
              autoSave={autoSave}
              setAutoSave={setAutoSave}
              autoFit={autoFit}
              setAutoFit={setAutoFit}
            />
          )}
        </div>
      </div>

      <div
        ref={previewRef}
        className="cv-preview-panel relative min-h-[80vh] flex-1 overflow-auto bg-stone-200 md:h-screen md:min-h-0"
      >
        <div className="sticky top-0 z-10 flex justify-center print:hidden">
          <div className="mt-4 flex items-center gap-2 border border-stone-300 bg-white px-2 py-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-rust px-4 py-2 text-sm font-semibold text-white hover:bg-rust-dark"
            >
              <FileDown className="h-4 w-4" strokeWidth={2} />
              Download PDF
            </button>
            <button
              onClick={() => setTab("templates")}
              className="inline-flex items-center gap-2 border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-rust hover:text-rust"
            >
              <LayoutTemplate className="h-4 w-4" strokeWidth={2} />
              Change Template
            </button>
          </div>
        </div>

        {overflowWarning && (
          <div className="relative z-10 mx-auto max-w-2xl px-6 print:hidden">
            <div className="mt-4 flex items-start gap-3 border border-orange-200 bg-orange-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rust" strokeWidth={2} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">
                  Your CV exceeds two pages.
                </p>
                <p className="mt-0.5 text-xs leading-5 text-stone-600">
                  The tightest compression has already been applied. Consider
                  trimming experience bullets or removing less relevant sections.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="cv-print-area relative px-6 py-8">
          <div className="flex justify-center">
            <div
              className="cv-sizer relative"
              style={{
                width: pagePx.w * scale,
                height: pagePx.h * scale,
              }}
            >
              {showGuides && (
                <div
                  className="pointer-events-none absolute inset-0 border-l border-r border-dashed border-stone-400/70 print:hidden"
                  aria-hidden
                />
              )}
              <div
                className="cv-scale-wrap"
                style={{
                  width: pagePx.w,
                  height: pagePx.h,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                <CvPage
                  cv={cv}
                  template={template}
                  density={resolvedDensity}
                  pageSize={pageSize}
                  bulletStyle={bulletStyle}
                  bulletSpacing={bulletSpacing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {measuring && (
        <MeasureCv
          cv={cv}
          template={template}
          density={measuring}
          pageSize={pageSize}
          bulletStyle={bulletStyle}
          bulletSpacing={bulletSpacing}
          onMeasure={handleMeasure}
        />
      )}
    </div>
  );
}