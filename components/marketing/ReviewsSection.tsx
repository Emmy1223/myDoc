import Link from "next/link";
import { Star } from "lucide-react";
import { getApprovedReviews, getReviewStats } from "@/lib/server-db";

export default async function ReviewsSection() {
  const [reviews, stats] = await Promise.all([
    getApprovedReviews(),
    getReviewStats(),
  ]);

  // No reviews yet → render nothing
  if (reviews.length === 0 || stats.approved === 0) {
    return null;
  }

  // Show up to 3 most recent approved reviews
  const featured = reviews.slice(0, 3);

  return (
    <section className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
              Reviews
            </p>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.15] tracking-[-0.02em] text-ink md:text-4xl">
              What people are saying
            </h2>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex items-center gap-0.5">
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
              <p className="text-sm text-stone-600">
                <span className="font-display text-lg font-bold text-ink">
                  {stats.avgRating.toFixed(1)}
                </span>{" "}
                from {stats.approved}{" "}
                {stats.approved === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>

          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-rust hover:text-rust"
          >
            See all reviews
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {featured.map((review) => (
            <article
              key={review.id}
              className="flex flex-col border border-stone-200 bg-paper p-6"
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i <= review.rating
                        ? "fill-rust text-rust"
                        : "fill-stone-200 text-stone-200"
                    }`}
                    strokeWidth={1.5}
                  />
                ))}
              </div>

              <p className="mt-4 flex-1 text-sm leading-7 text-stone-700">
                {review.message}
              </p>

              <div className="mt-5 border-t border-stone-100 pt-4">
                <p className="text-sm font-semibold text-ink">
                  {review.name || "Anonymous"}
                </p>
                {review.role && (
                  <p className="mt-0.5 text-xs text-stone-500">
                    {review.role}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}