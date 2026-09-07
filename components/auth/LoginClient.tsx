"use client";

import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

export default function LoginClient({ nextPath }: { nextPath: string }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode, name, email, password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Unable to start your session.");
        return;
      }
      window.location.assign(nextPath);
    } catch {
      setError("The network request failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex border-b border-stone-200">
        {(["signin", "signup"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setMode(option);
              setError("");
            }}
            className={`min-h-11 flex-1 border-b-2 px-2 text-sm font-semibold capitalize transition-colors ${
              mode === option
                ? "border-rust text-rust"
                : "border-transparent text-stone-500 hover:bg-stone-100 hover:text-ink"
            }`}
          >
            {option === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Your name</span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="min-h-11 w-full border border-stone-300 bg-white px-3 text-sm text-ink outline-none focus:border-rust placeholder:text-stone-400"
              placeholder="e.g., Alex Reyes"
            />
          </label>
        )}
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className="min-h-11 w-full border border-stone-300 bg-white px-3 text-sm text-ink outline-none focus:border-rust placeholder:text-stone-400"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Password</span>
          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="min-h-11 w-full border border-stone-300 bg-white px-3 text-sm text-ink outline-none focus:border-rust placeholder:text-stone-400"
            placeholder={mode === "signin" ? "Enter your password" : "Create a password (min. 8 characters)"}
          />
          <span className="mt-1.5 block text-xs leading-5 text-stone-500">
            Use at least 8 characters.
          </span>
        </label>

        {error && (
          <p className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-6 text-red-800" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-rust px-4 text-sm font-semibold text-white hover:bg-rust-dark disabled:cursor-wait disabled:opacity-70 transition-colors"
        >
          {loading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={2} />
              Working…
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
              {mode === "signin" ? "Sign in" : "Create account"}
            </>
          )}
        </button>
      </form>
    </>
  );
}