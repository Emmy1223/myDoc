"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Smartphone, Loader2 } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

type Status =
  | "loading"
  | "unsupported"
  | "needs-install"
  | "default"
  | "subscribed"
  | "denied";

export default function PushNotificationToggle() {
  const [status, setStatus] = useState<Status>("loading");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // iOS: PushManager only exists in standalone mode
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isStandalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;

    if (isIOS && !isStandalone) {
      setStatus("needs-install");
      return;
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        setStatus(sub ? "subscribed" : "default");
      })
      .catch(() => setStatus("default"));
  }, []);

  const enable = async () => {
    setWorking(true);
    setError(null);
    try {
      // The gesture must be live when this is called
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "default");
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

      if (!res.ok) throw new Error(`Server rejected subscription (${res.status})`);
      setStatus("subscribed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setWorking(false);
    }
  };

  const disable = async () => {
    setWorking(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      // NOTE: we don't delete the server-side row for simplicity.
      // The subscription will be pruned naturally on next failed send.
      setStatus("default");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setWorking(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3 py-4">
        <Loader2 className="h-4 w-4 animate-spin text-stone-400" strokeWidth={2} />
        <span className="text-sm text-stone-500">Checking notification status…</span>
      </div>
    );
  }

  if (status === "needs-install") {
    return (
      <div className="flex items-start gap-3 py-4">
        <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-rust" strokeWidth={2} />
        <div>
          <p className="text-sm font-semibold text-ink">Add myDoc to your home screen</p>
          <p className="mt-0.5 text-xs leading-5 text-stone-500">
            On iOS, notifications only work when myDoc is installed. Tap Share →
            Add to Home Screen, then open myDoc from your home screen to enable
            notifications.
          </p>
        </div>
      </div>
    );
  }

  if (status === "unsupported") {
    return (
      <div className="flex items-start gap-3 py-4">
        <BellOff className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" strokeWidth={2} />
        <div>
          <p className="text-sm font-semibold text-ink">Not supported</p>
          <p className="mt-0.5 text-xs leading-5 text-stone-500">
            This browser does not support push notifications.
          </p>
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex items-start gap-3 py-4">
        <BellOff className="mt-0.5 h-4 w-4 shrink-0 text-red-500" strokeWidth={2} />
        <div>
          <p className="text-sm font-semibold text-ink">Notifications blocked</p>
          <p className="mt-0.5 text-xs leading-5 text-stone-500">
            You previously blocked notifications. Open your browser settings,
            find myDoc, and allow notifications. Then reload this page.
          </p>
        </div>
      </div>
    );
  }

  const enabled = status === "subscribed";

  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div className="flex items-start gap-3">
        {enabled ? (
          <Bell className="mt-0.5 h-4 w-4 shrink-0 text-rust" strokeWidth={2} />
        ) : (
          <BellOff className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" strokeWidth={2} />
        )}
        <div>
          <p className="text-sm font-semibold text-ink">
            {enabled ? "Notifications are on" : "Turn on notifications"}
          </p>
          <p className="mt-0.5 text-xs leading-5 text-stone-500">
            {enabled
              ? "You will be notified about updates from myDoc."
              : "Get notified about updates from myDoc. You can turn this off any time."}
          </p>
          {error && (
            <p className="mt-1 text-xs text-red-600">{error}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        disabled={working}
        onClick={enabled ? disable : enable}
        className={`shrink-0 border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-wait disabled:opacity-50 ${
          enabled
            ? "border-stone-300 bg-white text-ink hover:border-rust hover:text-rust"
            : "border-rust bg-rust text-white hover:bg-rust-dark"
        }`}
      >
        {working
          ? enabled
            ? "Turning off…"
            : "Enabling…"
          : enabled
            ? "Turn off"
            : "Enable"}
      </button>
    </div>
  );
}