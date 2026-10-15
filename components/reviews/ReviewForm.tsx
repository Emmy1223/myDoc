"use client";

import { useState } from "react";
import { Loader2, Star, CheckCircle2, AlertCircle } from "lucide-react";

export default function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = rating > 0 && message.trim().length > 0 && !sending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          rating,
          message: message.trim(),
          name: name.trim() || undefined,
          role: role.trim() || undefined,
          email: email.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit review.");

      setSuccess(true);
      setRating(0);
      setMessage("");
      setName("");
      setRole("");
      setEmail("");
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
              Review received
            </p>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              Thank you. Your review will appear on the page once it is
              approved.
            </p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="mt-4 text-xs font-semibold text-rust hover:underline"
            >
              Write another review
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
      {/* Rating */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500">
          Your rating <span className="text-rust">*</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => {
            const active = i <= (hoverRating || rating);
            return (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i)}
                aria-label={`${i} star${i !== 1 ? "s" : ""}`}
                className="p-1"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    active
                      ? "fill-rust text-rust"
                      : "fill-stone-200 text-stone-200 hover:fill-rust/40 hover:text-rust/40"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            );
          })}
          {rating > 0 && (
            <span className="ml-2 text-sm text-stone-500">
              {rating} / 5
            </span>
          )}
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="review-message"
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500"
        >
          Your review <span className="text-rust">*</span>
        </label>
        <textarea
          id="review-message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
          rows={5}
          placeholder="What did you use myDoc for? What worked well?"
          className="w-full resize-y border border-stone-300 bg-white px-3 py-2.5 text-sm leading-6 text-ink outline-none placeholder:text-stone-400 focus:border-rust"
        />
        <p className="mt-1 text-right text-xs text-stone-400">
          {message.length} / 1000
        </p>
      </div>

      {/* Name + Role */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="review-name"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500"
          >
            Name <span className="text-stone-400">(optional)</span>
          </label>
          <input
            id="review-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Leave blank to stay anonymous"
            className="w-full border border-stone-300 bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-stone-400 focus:border-rust"
          />
        </div>
        <div>
          <label
            htmlFor="review-role"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500"
          >
            Role <span className="text-stone-400">(optional)</span>
          </label>
          <input
            id="review-role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Product Designer"
            className="w-full border border-stone-300 bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-stone-400 focus:border-rust"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="review-email"
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500"
        >
          Email <span className="text-stone-400">(optional, private)</span>
        </label>
        <input
          id="review-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Only if you want a reply. Never shown publicly."
          className="w-full border border-stone-300 bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-stone-400 focus:border-rust"
        />
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
          "Submit review"
        )}
      </button>

      <p className="text-center text-xs text-stone-400">
        Reviews appear publicly after approval.
      </p>
    </form>
  );
}