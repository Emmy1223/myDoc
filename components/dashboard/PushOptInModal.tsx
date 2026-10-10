"use client";

import { useEffect, useState } from "react";
import { Bell, X, Smartphone, Loader2 } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const DISMISS_KEY = "mydoc-push-dismissed-at";
const DISMISS_DAYS = 30;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

function dismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    const elapsedDays = (Date.now() - at) / (1000 * 60 * 60 * 24);
    return elapsedDays < DISMISS_DAYS;
  } catch {
    return false;
  }
}

function rememberDismiss() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable — ignore
  }
}

type ShowState =
  | "checking"
  | "hidden"
  | "show"
  | "ios-needs-install";

export default function PushOptInModal() {
  const [state, setState] = useState<ShowState>("checking");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already dismissed recently?
    if (dismissedRecently()) {
      setState("hidden");
      return;
    }

    // iOS: PushManager only exists in standalone mode
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isStandalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;

    if (isIOS && !isStandalone) {
      // Show the "install first" version
      setState("ios-needs-install");
      return;
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("hidden");
      return;
    }

    if (Notification.permission === "denied") {
      setState("hidden");
      return;
    }

    // Already subscribed?
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (sub) {
          setState("hidden");
        } else if (Notification.permission === "granted") {
          // Permission granted but no sub — try to silently subscribe
          setState("hidden");
        } else {
          setState("show");
        }
      })
      .catch(() => setState("hidden"));
  }, []);

  const enable = async () => {
    setWorking(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        rememberDismiss();
        setState("hidden");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      if (!res.ok) throw new Error("Could not save subscription");

      rememberDismiss();
      setState("hidden");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not enable");
    } finally {
      setWorking(false);
    }
  };

  const dismiss = () => {
    rememberDismiss();
    setState("hidden");
  };

  if (state === "checking" || state === "hidden") return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md border border-stone-200 bg-white shadow-xl">
        {/* Close */}
        <div className="flex justify-end px-3 pt-3">
          <button
            onClick={dismiss}
            className="border border-transparent p-1 text-stone-500 transition-colors hover:border-stone-300 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-2">
          {state === "ios-needs-install" ? (
            <>
              <span className="flex h-12 w-12 items-center justify-center border border-rust/20 bg-rust/5">
                <Smartphone
                  className="h-6 w-6 text-rust"
                  strokeWidth={1.75}
                />
              </span>
              <h2 className="mt-5 font-display text-xl font-bold tracking-tightish text-ink">
                Add myDoc to your home screen
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                On iPhone, notifications only work when myDoc is installed.
              </p>
              <ol className="mt-4 space-y-2 text-sm leading-6 text-stone-600">
                <li>
                  <strong className="text-ink">1.</strong> Tap the Share
                  button in Safari
                </li>
                <li>
                  <strong className="text-ink">2.</strong> Scroll down and
                  select <em>Add to Home Screen</em>
                </li>
                <li>
                  <strong className="text-ink">3.</strong> Open myDoc from
                  your home screen
                </li>
              </ol>
              <button
                onClick={dismiss}
                className="mt-6 w-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-rust hover:text-rust"
              >
                Got it
              </button>
            </>
          ) : (
            <>
              <span className="flex h-12 w-12 items-center justify-center border border-rust/20 bg-rust/5">
                <Bell className="h-6 w-6 text-rust" strokeWidth={1.75} />
              </span>
              <h2 className="mt-5 font-display text-xl font-bold tracking-tightish text-ink">
                Stay in the loop
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Get notified when your tailored CV is ready, or when we ship
                something new. You can turn this off at any time.
              </p>

              {error && (
                <p className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={enable}
                  disabled={working}
                  className="inline-flex w-full items-center justify-center gap-2 bg-rust px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rust-dark disabled:cursor-wait disabled:opacity-60"
                >
                  {working ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        strokeWidth={2}
                      />
                      Enabling…
                    </>
                  ) : (
                    "Enable notifications"
                  )}
                </button>
                <button
                  onClick={dismiss}
                  disabled={working}
                  className="w-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-600 transition-colors hover:border-stone-500 hover:text-ink disabled:opacity-50"
                >
                  Not now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}