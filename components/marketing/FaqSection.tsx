"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "Is myDoc really free?",
    answer:
      "Yes. No credit card, no trial period, no document limit. We use free-tier infrastructure for AI and storage, so we can offer this at no cost. If we ever add paid tiers for heavy usage, existing users keep free access.",
  },
  {
    question: "Do you store my CV?",
    answer:
      "Yes, in your own account. Only you can access it. You can delete any CV at any time from the dashboard.",
  },
  {
    question: "Does the AI invent experience?",
    answer:
      "No. This is the whole point. We only rewrite your summary and reorder your skills. We never add skills you do not have, never change dates, and never invent achievements. You see every change before it is applied.",
  },
  {
    question: "What file types do you accept?",
    answer:
      "PDF and DOCX for upload. You can also build a CV from scratch without uploading anything.",
  },
  {
    question: "Does it work for any industry?",
    answer:
      "Yes. The tailoring works on any job description, in any industry, in any language the AI supports.",
  },
  {
    question: "Is my CV ATS-friendly?",
    answer:
      "Yes. Our templates use black text on white, standard fonts, and no graphics that break parsers. This is a deliberate design decision, not an accident.",
  },
  {
    question: "Can I use myDoc without signing up?",
    answer:
      "Yes. You can build a CV locally without an account. Sign up only when you want to save it to the cloud or use the AI tailoring.",
  },
  {
    question: "How accurate is the AI parsing?",
    answer:
      "Very accurate on standard CVs, less accurate on unusual layouts. There is always a local fallback parser if the AI fails, and you can edit every field manually.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
            FAQ
          </p>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.15] tracking-[-0.02em] text-ink md:text-4xl">
            Questions, answered honestly
          </h2>
        </div>

        <div className="mt-12 divide-y divide-stone-200 border-y border-stone-200">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-start justify-between gap-4 py-5 text-left transition-colors hover:text-rust"
                >
                  <span className="font-display text-base font-bold tracking-tightish text-ink md:text-lg">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`mt-0.5 h-4 w-4 shrink-0 text-stone-500 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    strokeWidth={2}
                  />
                </button>
                {isOpen && (
                  <div className="pb-5">
                    <p className="text-sm leading-7 text-stone-600 md:text-base md:leading-8">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}