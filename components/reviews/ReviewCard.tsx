import { Star } from "lucide-react";

export type ReviewItem = {
  id: string;
  rating: number;
  message: string;
  name: string | null;
  role: string | null;
  createdAt: string;
};

export default function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <article className="border border-stone-200 bg-white p-6">
      {/* Stars */}
      <div className="flex items-center gap-1">
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

      {/* Message */}
      <p className="mt-4 text-sm leading-7 text-stone-700">
        {review.message}
      </p>

      {/* Author */}
      <div className="mt-5 border-t border-stone-100 pt-4">
        <p className="text-sm font-semibold text-ink">
          {review.name || "Anonymous"}
        </p>
        {review.role && (
          <p className="mt-0.5 text-xs text-stone-500">{review.role}</p>
        )}
      </div>
    </article>
  );
}