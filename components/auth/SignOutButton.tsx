"use client";

import { useState } from "react";
import { LogOut, LoaderCircle } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    if (loading) return;
    setLoading(true);

    try {
      // 1. Clear our custom session cookie
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore — still proceed to Auth.js signout
    }

    try {
      // 2. Sign out of Auth.js (Google), then redirect to /login
      await signOut({ callbackUrl: "/login" });
    } catch {
      // If Auth.js signout fails, hard-navigate to login
      window.location.href = "/login";
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="text-stone-500 hover:text-stone-300 transition-colors disabled:opacity-50"
      aria-label="Sign out"
    >
      {loading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.75} />
      ) : (
        <LogOut className="h-4 w-4" strokeWidth={1.75} />
      )}
    </button>
  );
}