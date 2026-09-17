"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <Link
      href="/api/auth/logout-all"
      className="text-stone-500 hover:text-stone-300 transition-colors"
      aria-label="Sign out"
      prefetch={false}
    >
      <LogOut className="h-4 w-4" strokeWidth={1.75} />
    </Link>
  );
}