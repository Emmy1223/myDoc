"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Link2, Loader2, RefreshCw, X } from "lucide-react";

type SharingStatus = {
  enabled: boolean;
  token: string | null;
};

export default function ShareDialog({
  open,
  documentId,
  documentTitle,
  onClose,
}: {
  open: boolean;
  documentId: string | null;
  documentTitle: string;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<SharingStatus>({ enabled: false, token: null });
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const shareUrl =
    status.enabled && status.token ? `${appUrl}/d/${status.token}` : "";

  useEffect(() => {
    if (!open || !documentId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/documents/${documentId}/share`)
      .then((r) => r.json())
      .then((data) => setStatus({ enabled: Boolean(data.enabled), token: data.token ?? null }))
      .catch(() => setError("Could not load sharing status."))
      .finally(() => setLoading(false));
  }, [open, documentId]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  async function call(action: "enable" | "disable" | "regenerate") {
    if (!documentId) return;
    setWorking(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setStatus({ enabled: Boolean(data.enabled), token: data.token ?? null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setWorking(false);
    }
  }

  async function copy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <p className="font-display text-base font-bold tracking-tightish text-ink">
              Share this document
            </p>
            <p className="mt-0.5 truncate text-xs text-stone-500">
              {documentTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-transparent p-1.5 text-stone-500 transition-colors hover:border-stone-300 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="px-5 py-5">
          {loading ? (
            <div className="flex items-center gap-3 text-sm text-stone-500">
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              Loading…
            </div>
          ) : !status.enabled ? (
            <div>
              <p className="text-sm leading-6 text-stone-600">
                Anyone with the link will be able to view this document. You can
                turn it off anytime.
              </p>
              <button
                type="button"
                onClick={() => call("enable")}
                disabled={working}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-rust px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rust-dark disabled:cursor-wait disabled:opacity-60"
              >
                <Link2 className="h-4 w-4" strokeWidth={2} />
                {working ? "Enabling…" : "Create share link"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Share link
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="min-w-0 flex-1 border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-700 outline-none"
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <button
                    type="button"
                    onClick={copy}
                    className="inline-flex shrink-0 items-center gap-1.5 border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-rust hover:text-rust"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" strokeWidth={2} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-stone-200 pt-4">
                <button
                  type="button"
                  onClick={() => call("regenerate")}
                  disabled={working}
                  className="inline-flex items-center justify-center gap-2 border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition-colors hover:border-rust hover:text-rust disabled:cursor-wait disabled:opacity-60"
                >
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                  Regenerate link (old link stops working)
                </button>
                <button
                  type="button"
                  onClick={() => call("disable")}
                  disabled={working}
                  className="inline-flex items-center justify-center gap-2 border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
                >
                  Turn off sharing
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}