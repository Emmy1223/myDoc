"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2, AlertCircle } from "lucide-react";

type Category = "Bug" | "Feature" | "Praise" | "Other";

const CATEGORIES: Category[] = ["Bug", "Feature", "Praise", "Other"];

export default function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = message.length;
  const canSubmit = message.trim().length > 0 && !sending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          category: category || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not submit feedback.");
      }

      setSuccess(true);
      setMessage("");
      setName("");
      setEmail("");
      setCategory("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  if (success) {
    return (
      <div className="border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
            strokeWidth={2}
          />
          <div>
            <p className="font-display text-base font-bold tracking-tightish text-ink">
              Thank you
            </p>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              Your feedback was received. Everything gets read.
            </p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="mt-4 text-xs font-semibold text-rust hover:underline"
            >
              Send another message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 border border-stone-200 bg-white p-6 md:p-8"
    >
      {/* Category */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500">
          What kind of feedback is this?
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(category === c ? "" : c)}
              className={`border px-3 py-1.5 text-xs font-semibold transition-colors ${
                category === c
                  ? "border-rust bg-orange-50 text-rust"
                  : "border-stone-300 bg-white text-stone-600 hover:border-stone-500 hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="feedback-message"
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500"
        >
          Your message <span className="text-rust">*</span>
        </label>
        <textarea
          id="feedback-message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
          rows={6}
          placeholder="What is on your mind?"
          className="w-full resize-y border border-stone-300 bg-white px-3 py-2.5 text-sm leading-6 text-ink outline-none placeholder:text-stone-400 focus:border-rust"
        />
        <p className="mt-1 text-right text-xs text-stone-400">
          {charCount} / 2000
        </p>
      </div>

      {/* Name + Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="feedback-name"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500"
          >
            Name <span className="text-stone-400">(optional)</span>
          </label>
          <input
            id="feedback-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Leave blank to stay anonymous"
            className="w-full border border-stone-300 bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-stone-400 focus:border-rust"
          />
        </div>
        <div>
          <label
            htmlFor="feedback-email"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500"
          >
            Email <span className="text-stone-400">(optional)</span>
          </label>
          <input
            id="feedback-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Only if you want a reply"
            className="w-full border border-stone-300 bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-stone-400 focus:border-rust"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-2.5">
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
            strokeWidth={2}
          />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex w-full items-center justify-center gap-2 bg-rust px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-rust-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" strokeWidth={2} />
            Send feedback
          </>
        )}
      </button>

      <p className="text-center text-xs text-stone-400">
        Name and email are optional. Everything is read.
      </p>
    </form>
  );
}