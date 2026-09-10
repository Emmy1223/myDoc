"use client";

import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginClient({ nextPath }: { nextPath: string }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: nextPath });
    } catch {
      setError("Google sign-in failed. Try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <>
      {/* Google sign-in button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="inline-flex min-h-11 w-full items-center justify-center gap-3 border border-stone-300 bg-white px-4 text-sm font-semibold text-ink hover:bg-stone-50 disabled:cursor-wait disabled:opacity-70 transition-colors"
      >
        {googleLoading ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={2} />
            Connecting to Google…
          </>
        ) : (
          <>
            {/* Google G logo */}
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </button>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-stone-200" />
        <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
          or
        </span>
        <span className="h-px flex-1 bg-stone-200" />
      </div>

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
          disabled={loading || googleLoading}
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