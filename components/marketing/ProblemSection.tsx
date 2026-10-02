export default function ProblemSection() {
  return (
    <section className="border-b border-stone-200">
      <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
          The problem
        </p>
        <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.15] tracking-[-0.02em] text-ink md:text-4xl">
          Two jobs, and the tools are broken
        </h2>

        <div className="mt-8 space-y-6 text-base leading-8 text-stone-700 md:text-lg md:leading-9">
          <p>
            <strong className="font-semibold text-ink">
              For your CV.
            </strong>{" "}
            Sending the same CV to fifty jobs does not work anymore. Applicant
            Tracking Systems filter out generic CVs before a human ever sees
            them. Tailoring each CV by hand takes an hour you do not have. And
            most AI resume builders solve this by inventing experience you do
            not have they add skills, inflate titles, and rewrite
            achievements. You get caught in the interview. You get blacklisted
            from the company. You lose the opportunity.
          </p>
          <p>
            <strong className="font-semibold text-ink">
              For everything else.
            </strong>{" "}
            The other half of your job search - cover letters, project briefs,
            reports, meeting notes lives in a different app. Usually Word,
            Google Docs, or a notes tool that was never designed for
            professional documents. You copy and paste between windows, reformat
            everything by hand, and lose track of what you wrote where.
          </p>
          <p className="font-display text-xl font-bold tracking-tightish text-ink md:text-2xl">
            There is a better way.
          </p>
        </div>
      </div>
    </section>
  );
}