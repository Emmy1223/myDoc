"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("myDoc");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/dashboard");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const send = async () => {
    if (!body.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Send failed");
      setResult(
        `Sent to ${data.delivered} of ${data.total} subscribers (${data.failed} failed)`
      );
      setBody("");
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1c1c1e] p-8 text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to admin
        </Link>

        <h1 className="mt-6 text-2xl font-bold">Send a notification</h1>
        <p className="mt-1 text-sm text-stone-400">
          Broadcasts to every user who has enabled push notifications.
        </p>

        <div className="mt-8 space-y-4">
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
              rows={3}
              placeholder="What do you want to tell them?"
              className="mt-1 w-full border border-white/20 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-stone-600 focus:border-rust"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
              URL when tapped (optional)
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 w-full border border-white/20 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-rust"
            />
          </div>

          <button
            onClick={send}
            disabled={sending || !body.trim()}
            className="inline-flex items-center gap-2 bg-rust px-6 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:cursor-wait disabled:opacity-50"
          >
            <Send className="h-4 w-4" strokeWidth={2} />
            {sending ? "Sending…" : "Send notification"}
          </button>

          {result && (
            <p className="border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-300">
              {result}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}