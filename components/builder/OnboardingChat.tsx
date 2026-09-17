"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Send, Sparkles, X } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function OnboardingChat({
  open,
  onClose,
  onSkip,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onSkip: () => void;
  onComplete: (cvData: any) => Promise<void> | void;
}) {
  const [stage, setStage] = useState<"intro" | "chat" | "finalizing">("intro");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setStage("intro");
      setMessages([]);
      setInput("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (scroller.current) {
      scroller.current.scrollTop = scroller.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!open) return null;

  const sendMessages = async (next: ChatMessage[]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Something went wrong.");

      if (result.type === "question") {
        setMessages([
          ...next,
          { role: "assistant", content: result.content },
        ]);
      } else if (result.type === "draft") {
        setMessages([
          ...next,
          {
            role: "assistant",
            content:
              "Perfect, that's enough. I've drafted your CV. Opening the builder…",
          },
        ]);
        setStage("finalizing");
        await onComplete(result.data);
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    setStage("chat");
    const seed: ChatMessage[] = [
      {
        role: "user",
        content:
          "Hi, I don't really know what to put in my CV. Can you help me figure it out?",
      },
    ];
    setMessages(seed);
    await sendMessages(seed);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    await sendMessages(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex h-[600px] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-rust/10">
              <Sparkles className="h-4 w-4 text-rust" strokeWidth={2} />
            </span>
            <div>
              <p className="font-display text-base font-bold text-ink">
                Let&apos;s build your CV
              </p>
              <p className="text-xs text-stone-500">
                Answer a few questions, get a draft
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-stone-500 hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* intro */}
        {stage === "intro" && (
          <div className="flex flex-1 flex-col justify-center px-6 py-8 text-center">
            <h2 className="font-display text-2xl font-extrabold text-ink">
              Not sure where to start?
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              I&apos;ll ask you about 5 short questions — your role, your
              experience, projects, skills, and education. Then I&apos;ll turn
              your answers into a first draft you can edit.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleStartChat}
                className="inline-flex items-center justify-center gap-2 bg-rust px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
              >
                <Sparkles className="h-4 w-4" strokeWidth={2} />
                Guide me
              </button>
              <button
                onClick={onSkip}
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-stone-600 transition-colors hover:text-ink"
              >
                No thanks, start blank
              </button>
            </div>
          </div>
        )}

        {/* chat */}
        {stage !== "intro" && (
          <>
            <div
              ref={scroller}
              className="flex-1 space-y-3 overflow-y-auto px-5 py-4"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-6 ${
                      m.role === "user"
                        ? "bg-rust text-white"
                        : "bg-stone-100 text-ink"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-600">
                    <LoaderCircle
                      className="h-3.5 w-3.5 animate-spin"
                      strokeWidth={2}
                    />
                    Thinking…
                  </div>
                </div>
              )}
              {error && (
                <p className="text-center text-xs text-red-600">{error}</p>
              )}
            </div>

            {/* input */}
            <div className="border-t border-stone-200 p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Type your answer…"
                  rows={1}
                  disabled={loading || stage === "finalizing"}
                  className="min-h-[42px] flex-1 resize-none border border-stone-300 px-3 py-2.5 text-sm text-ink outline-none focus:border-rust disabled:opacity-60"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading || stage === "finalizing"}
                  className="flex h-[42px] w-[42px] items-center justify-center bg-rust text-white transition-colors hover:bg-rust-dark disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}