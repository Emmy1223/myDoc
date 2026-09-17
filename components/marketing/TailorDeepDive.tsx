import { Check } from "lucide-react";

const RULES = [
  "We rewrite your profile summary to emphasize what matters for this specific job.",
  "We reorder your skills so the relevant ones come first.",
  "We never add a skill unless it is supported by evidence in your CV.",
  "We show you a match score with matched and missing keywords.",
  "We list the gaps honestly. If the job wants Rust and you have never touched Rust, we tell you. We do not fake it.",
];

export default function TailorDeepDive() {
  return (
    <section className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
              Tailor to a Job
            </p>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.15] tracking-[-0.02em] text-ink md:text-4xl">
              Tailoring that tells the truth
            </h2>
            <p className="mt-6 text-base leading-8 text-stone-700 md:text-lg md:leading-9">
              Most AI tailoring tools add skills you do not have, invent
              achievements, and inflate your title. myDoc does the opposite.
            </p>

            <ul className="mt-8 space-y-4">
              {RULES.map((rule) => (
                <li key={rule} className="flex gap-3">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-rust"
                    strokeWidth={2.5}
                  />
                  <span className="text-sm leading-7 text-stone-700">
                    {rule}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-sm leading-7 text-stone-600">
              You see every change before it is saved. You accept what you
              want. The original CV is never modified.
            </p>
          </div>

          <div className="border border-stone-200 bg-paper p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Example
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Before
                </p>
                <div className="border border-stone-200 bg-white p-4">
                  <p className="text-xs leading-6 text-stone-600">
                    Product designer with eight years of experience turning
                    complicated workflows into clean software.
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-rust">
                  After
                </p>
                <div className="border border-rust/40 bg-orange-50 p-4">
                  <p className="text-xs leading-6 text-stone-700">
                    Product designer with eight years of experience building
                    design systems for fintech SaaS products, turning
                    complicated onboarding flows into clean interfaces.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-stone-200 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Match report
              </p>
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-stone-700">
                    Match score: 74%
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["React", "Figma", "Design Systems", "User Research"].map(
                    (kw) => (
                      <span
                        key={kw}
                        className="border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-800"
                      >
                        {kw}
                      </span>
                    ),
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["GraphQL", "A/B Testing", "Kubernetes"].map((kw) => (
                    <span
                      key={kw}
                      className="border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-rust"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] leading-5 text-stone-500">
                  Skills in orange are missing from your CV. We have not added
                  them because that would not be truthful.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}