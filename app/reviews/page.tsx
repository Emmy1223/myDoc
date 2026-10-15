import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { getApprovedReviews, getReviewStats } from "@/lib/server-db";
import ReviewCard from "@/components/reviews/ReviewCard";
import ReviewForm from "@/components/reviews/ReviewForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reviews - myDoc",
};

export default async function ReviewsPage() {
  const [reviews, stats] = await Promise.all([
    getApprovedReviews(),
    getReviewStats(),
  ]);

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-stone-200">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/"
            className="font-display text-lg font-extrabold tracking-tightish text-ink"
          >
            my<span className="text-rust">Doc</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-stone-600 hover:text-rust"
          >
            Back to myDoc
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
          Reviews
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tightish text-ink md:text-4xl">
          What people are saying
        </h1>

        {stats.approved > 0 && (
          <div className="mt-6 flex items-center gap-4 border border-stone-200 bg-white px-5 py-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i <= Math.round(stats.avgRating)
                      ? "fill-rust text-rust"
                      : "fill-stone-200 text-stone-200"
                  }`}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-ink">
                {stats.avgRating.toFixed(1)}
              </p>
              <p className="text-xs text-stone-500">
                from {stats.approved}{" "}
                {stats.approved === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
        )}

        <p className="mt-6 text-base leading-7 text-stone-600">
          Real reviews from real users. Reviews are published after a quick
          check, so nothing here is spam or fake.
        </p>

        {/* Reviews grid */}
        {reviews.length > 0 ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <p className="mt-10 border border-stone-200 bg-white px-5 py-8 text-center text-sm text-stone-500">
            No reviews yet. Be the first to leave one.
          </p>
        )}

        {/* Submit form */}
        <div className="mt-16 border-t border-stone-200 pt-12">
          <h2 className="font-display text-2xl font-extrabold tracking-tightish text-ink">
            Leave a review
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Tell us how you use myDoc. Reviews appear publicly after approval.
          </p>
          <div className="mt-6">
            <ReviewForm />
          </div>
        </div>
      </div>
    </main>
  );
}