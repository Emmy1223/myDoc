// components/builder/BuilderClient.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
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
import type { BulletStyle, BulletSpacing } from "./fields";

type Tab = "content" | "templates" | "settings";

const PAGE_PX: Record<"A4" | "Letter", { w: number; h: number }> = {
  A4: { w: 793.7, h: 1122.5 },
  Letter: { w: 816, h: 1056 },
};

// localStorage key
const STORAGE_KEY = "myDoc_cv_data";

// Helper to save to localStorage
function saveToLocalStorage(data: CVData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

// Helper to load from localStorage
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
  // Initialize CV from localStorage or empty
  const [cv, setCv] = useState<CVData>(() => {
    // If starting new, use emptyCV
    if (startNew) {
      return emptyCV;
    }
    
    // Try to load from localStorage
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
  const [density, setDensity] = useState<Density>("normal");
  const [docName, setDocName] = useState("");
  const [showGuides, setShowGuides] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [highlightDropzone, setHighlightDropzone] = useState(startUpload);
  const [saved, setSaved] = useState(true);
  const [scale, setScale] = useState(0.5);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Bullet style state
  const [bulletStyle, setBulletStyle] = useState<BulletStyle>("dash");
  const [bulletSpacing, setBulletSpacing] = useState<BulletSpacing>("compact");

  const previewRef = useRef<HTMLDivElement>(null);

  // Save to localStorage whenever CV changes
  useEffect(() => {
    if (autoSave) {
      saveToLocalStorage(cv);
      setSaved(true);
      setLastSaved(new Date());
    }
  }, [cv, autoSave]);

  // Also save when other settings change
  useEffect(() => {
    if (autoSave) {
      const settings = {
        template,
        pageSize,
        density,
        docName,
        bulletStyle,
        bulletSpacing,
      };
      try {
        localStorage.setItem("myDoc_settings", JSON.stringify(settings));
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    }
  }, [template, pageSize, density, docName, bulletStyle, bulletSpacing, autoSave]);

  // Load settings from localStorage
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
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  /* Fit the fixed-size A4 page into the available preview width */
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

  /* Simulated auto-save indicator */
  useEffect(() => {
    if (autoSave) {
      setSaved(false);
      const t = window.setTimeout(() => setSaved(true), 900);
      return () => window.clearTimeout(t);
    }
  }, [cv, docName, template, pageSize, density, autoSave, bulletStyle, bulletSpacing]);

  // Handle real PDF extraction
  const handleExtracted = useCallback((fileName: string, extractedData: CVData) => {
    setCv(extractedData);
    const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "").trim();
    setDocName(nameWithoutExtension || "Imported CV");
    setTab("content");
  }, []);

  const handleDownload = () => {
    saveToLocalStorage(cv);
    window.print();
  };

  // Manual save
  const handleManualSave = () => {
    saveToLocalStorage(cv);
    setSaved(true);
    setLastSaved(new Date());
  };

  const pagePx = PAGE_PX[pageSize];

  // Get last saved time string
  const getLastSavedText = () => {
    if (!lastSaved) return "Not saved yet";
    const diff = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (diff < 60) return "Saved just now";
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)} minutes ago`;
    return `Saved ${Math.floor(diff / 3600)} hours ago`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper md:h-screen md:flex-row">
      {/* ---------------- Left panel — input zone (35%) ---------------- */}
      <div className="flex max-h-[70vh] shrink-0 flex-col border-b border-stone-200 bg-paper md:max-h-none md:h-screen md:w-[35%] md:border-b-0 md:border-r print-hidden">
        {/* top bar */}
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

        {/* dropzone */}
        <div className="border-b border-stone-200 p-4">
          <Dropzone
            onExtracted={handleExtracted}
            highlight={highlightDropzone}
            onHighlightClear={() => setHighlightDropzone(false)}
          />
        </div>

        {/* document name */}
        <div className="border-b border-stone-200 px-4 py-3">
          <input
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            aria-label="Document name"
            className="w-full bg-transparent font-display text-base font-bold tracking-tightish text-ink placeholder:text-stone-400"
            placeholder="Untitled document"
          />
        </div>

        {/* tabs */}
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

        {/* tab content scroll area */}
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
            />
          )}
        </div>
      </div>

      {/* ---------------- Right panel — preview (65%) ---------------- */}
      <div
        ref={previewRef}
        className="cv-preview-panel relative min-h-[80vh] flex-1 overflow-auto bg-stone-200 md:h-screen md:min-h-0"
      >
        {/* floating action bar */}
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

        {/* scaled A4 page */}
        <div className="cv-print-area relative px-6 py-8">
          <div className="flex justify-center">
            <div
              className="cv-sizer relative"
              style={{
                width: pagePx.w * scale,
                height: pagePx.h * scale,
              }}
            >
              {/* margin guides */}
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
                  density={density}
                  pageSize={pageSize}
                  bulletStyle={bulletStyle}
                  bulletSpacing={bulletSpacing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}