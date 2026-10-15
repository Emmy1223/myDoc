"use client";

import { useState } from "react";
import { Check, Trash2, Mail, User } from "lucide-react";

type FeedbackItem = {
  id: string;
  message: string;
  name: string | null;
  email: string | null;
  category: string | null;
  isRead: boolean;
  createdAt: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  Bug: "border-red-400 text-red-300",
  Feature: "border-blue-400 text-blue-300",
  Praise: "border-emerald-400 text-emerald-300",
  Other: "border-stone-500 text-stone-300",
};

export default function AdminFeedbackClient({
  initialItems,
}: {
  initialItems: FeedbackItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [workingId, setWorkingId] = useState<string | null>(null);

  async function toggleRead(id: string, nextRead: boolean) {
    setWorkingId(id);
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isRead: nextRead }),
      });
      if (!res.ok) throw new Error("Failed");
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isRead: nextRead } : item,
        ),
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this feedback? This cannot be undone.")) return;
    setWorkingId(id);
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setItems((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setWorkingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <p className="border border-white/10 bg-black/20 px-4 py-6 text-sm text-stone-400">
        No feedback yet. When someone submits the form at{" "}
        <span className="font-mono text-stone-300">/feedback</span>, it will
        show up here.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li
          key={item.id}
          className={`border bg-black/20 p-5 ${
            item.isRead ? "border-white/10" : "border-rust/60"
          }`}
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
              <span>
                {new Date(item.createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>

              {item.category && (
                <span
                  className={`border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.Other
                  }`}
                >
                  {item.category}
                </span>
              )}

              {item.name && (
                <span className="inline-flex items-center gap-1 text-stone-300">
                  <User className="h-3 w-3" strokeWidth={2} />
                  {item.name}
                </span>
              )}

              {item.email && (
                <a
                  href={`mailto:${item.email}`}
                  className="inline-flex items-center gap-1 text-stone-300 hover:text-white"
                >
                  <Mail className="h-3 w-3" strokeWidth={2} />
                  {item.email}
                </a>
              )}

              {!item.isRead && (
                <span className="border border-rust bg-rust/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rust">
                  New
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={workingId === item.id}
                onClick={() => toggleRead(item.id, !item.isRead)}
                className="border border-transparent p-2 text-stone-400 transition-colors hover:border-stone-600 hover:text-white disabled:opacity-50"
                aria-label={item.isRead ? "Mark as unread" : "Mark as read"}
                title={item.isRead ? "Mark as unread" : "Mark as read"}
              >
                <Check className="h-4 w-4" strokeWidth={2} />
              </button>
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

          {/* Message */}
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-100">
            {item.message}
          </p>
        </li>
      ))}
    </ul>
  );
}