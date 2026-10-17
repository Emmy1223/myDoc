"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  createdAt: string;
};

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("myDoc");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/dashboard");
  const [alsoPush, setAlsoPush] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!body.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url: url || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      let extra = "";
      if (alsoPush) {
        try {
          const pushRes = await fetch("/api/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, body, url }),
          });
          const pushData = await pushRes.json();
          extra = pushRes.ok
            ? ` Push sent to ${pushData.delivered}/${pushData.total}.`
            : ` Push failed: ${pushData.error ?? "unknown"}.`;
        } catch {
          extra = " Push failed: network error.";
        }
      }

      setMessage(`Announcement saved.${extra}`);
      setBody("");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this announcement for everyone?")) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
  };

  return (
    <main className="min-h-screen bg-[#1c1c1e] p-8 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to admin
        </Link>

        <h1 className="mt-6 text-2xl font-bold">What's New</h1>
        <p className="mt-1 text-sm text-stone-400">
          Persistent in-app announcements shown in the dashboard. Unlike push,
          these stay until each user clears them.
        </p>

        {/* Compose */}
        <div className="mt-8 space-y-4 border border-white/10 bg-black/20 p-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border border-white/20 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-rust"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
              Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="What's new?"
              className="mt-1 w-full border border-white/20 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-stone-600 focus:border-rust"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
              URL (optional)
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 w-full border border-white/20 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-rust"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-300">
            <input
              type="checkbox"
              checked={alsoPush}
              onChange={(e) => setAlsoPush(e.target.checked)}
              className="h-4 w-4"
            />
            Also send as a push notification
          </label>

          <button
            onClick={create}
            disabled={saving || !body.trim()}
            className="inline-flex items-center gap-2 bg-rust px-6 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:cursor-wait disabled:opacity-50"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            {saving ? "Saving…" : "Publish announcement"}
          </button>

          {message && (
            <p className="border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-300">
              {message}
            </p>
          )}
        </div>

        {/* List */}
        <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-stone-400">
          Published ({items.length})
        </h2>

        <div className="mt-3 divide-y divide-white/10 border border-white/10">
          {loading ? (
            <p className="px-4 py-6 text-sm text-stone-500">Loading…</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-stone-500">
              Nothing published yet.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-0.5 whitespace-pre-line text-sm text-stone-300">
                    {item.body}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {new Date(item.createdAt).toLocaleString()}
                    {item.url ? ` · ${item.url}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => remove(item.id)}
                  aria-label="Delete"
                  className="shrink-0 text-stone-500 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}