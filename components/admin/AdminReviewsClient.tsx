"use client";

import { useState } from "react";
import { Check, X, Trash2, Star, Mail } from "lucide-react";

type ReviewItem = {
  id: string;
  rating: number;
  message: string;
  name: string | null;
  role: string | null;
  email: string | null;
  isApproved: boolean;
  createdAt: string;
};

export default function AdminReviewsClient({
  initialItems,
}: {
  initialItems: ReviewItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [workingId, setWorkingId] = useState<string | null>(null);

  async function setApproved(id: string, isApproved: boolean) {
    setWorkingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isApproved }),
      });
      if (!res.ok) throw new Error("Failed");
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isApproved } : item,
        ),
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    setWorkingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setItems((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setWorkingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <p className="border border-white/10 bg-black/20 px-4 py-6 text-sm text-stone-400">
        No reviews yet. Submissions from{" "}
        <span className="font-mono text-stone-300">/reviews</span> will appear
        here for approval.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li
          key={item.id}
          className={`border bg-black/20 p-5 ${
            item.isApproved
              ? "border-emerald-500/40"
              : "border-orange-500/40"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i <= item.rating
                        ? "fill-rust text-rust"
                        : "fill-stone-700 text-stone-700"
                    }`}
                    strokeWidth={1.5}
                  />
                ))}
              </div>

              <span>
                {new Date(item.createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>

              {item.name && (
                <span className="text-stone-300">{item.name}</span>
              )}
              {item.role && (
                <span className="text-stone-400">· {item.role}</span>
              )}

              {item.email && (
                <a
                  href={`mailto:${item.email}`}
                  className="inline-flex items-center gap-1 text-stone-400 hover:text-white"
                >
                  <Mail className="h-3 w-3" strokeWidth={2} />
                  {item.email}
                </a>
              )}

              {item.isApproved ? (
                <span className="border border-emerald-500 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Approved
                </span>
              ) : (
                <span className="border border-orange-500 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                  Pending
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {item.isApproved ? (
                <button
                  type="button"
                  disabled={workingId === item.id}
                  onClick={() => setApproved(item.id, false)}
                  className="border border-transparent p-2 text-orange-400 transition-colors hover:border-orange-600 hover:text-orange-300 disabled:opacity-50"
                  aria-label="Unapprove"
                  title="Unapprove"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={workingId === item.id}
                  onClick={() => setApproved(item.id, true)}
                  className="border border-transparent p-2 text-emerald-400 transition-colors hover:border-emerald-600 hover:text-emerald-300 disabled:opacity-50"
                  aria-label="Approve"
                  title="Approve"
                >
                  <Check className="h-4 w-4" strokeWidth={2} />
                </button>
              )}
              <button
                type="button"
                disabled={workingId === item.id}
                onClick={() => remove(item.id)}
                className="border border-transparent p-2 text-red-400 transition-colors hover:border-red-600 hover:text-red-300 disabled:opacity-50"
                aria-label="Delete"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-100">
            {item.message}
          </p>
        </li>
      ))}
    </ul>
  );
}