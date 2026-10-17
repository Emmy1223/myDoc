"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Bell, X } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  createdAt: string;
};

export default function WhatsNewButton() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Wrap in useCallback so we can reuse it for polling and visibility changes
  const fetchItems = useCallback(() => {
    fetch("/api/announcements")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    // 1. Fetch immediately on load
    fetchItems();

    // 2. Set up polling every 30 seconds
    const interval = setInterval(fetchItems, 30000);

    // 3. Refresh instantly if the user switches tabs and comes back
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchItems();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchItems]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const clearOne = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch("/api/announcements/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const clearAll = async () => {
    setItems([]);
    await fetch("/api/announcements/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative flex w-full items-center gap-3 border border-transparent px-4 py-2.5 text-sm font-medium text-stone-300 transition-colors hover:border-stone-700 hover:bg-stone-800 hover:text-white"
      >
        <Bell className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span className="flex-1 text-left">What's new</span>
        {loaded && items.length > 0 && (
          <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-rust px-1 text-[10px] font-bold text-white">
            {items.length > 9 ? "9+" : items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-40 mb-2 w-80 border border-stone-700 bg-stone-800 shadow-lg">
          <div className="flex items-center justify-between border-b border-stone-700 px-4 py-3">
            <span className="text-sm font-semibold text-white">What's new</span>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-medium text-stone-400 hover:text-rust"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-stone-400">
                You're all caught up.
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-stone-700 px-4 py-3 last:border-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="mt-0.5 whitespace-pre-line text-sm text-stone-300">
                        {item.body}
                      </p>
                      {item.url && (
                        <a
                          href={item.url}
                          className="mt-1 inline-block text-xs font-medium text-rust hover:underline"
                        >
                          Open →
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => clearOne(item.id)}
                      aria-label="Dismiss"
                      className="shrink-0 text-stone-500 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}