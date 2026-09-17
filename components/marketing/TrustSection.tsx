const RULES = [
  "We never add a skill without evidence in your CV.",
  "We never change job titles, dates, or companies.",
  "We never invent achievements.",
  "We never hide gaps. If a job wants five years of Kubernetes and you have never touched Kubernetes, we tell you.",
];

export default function TrustSection() {
  return (
    <section className="border-b border-stone-200">
      <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
          Trust and ethics
        </p>
        <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.15] tracking-[-0.02em] text-ink md:text-4xl">
          Our single rule: never lie on your behalf
        </h2>

        <p className="mt-8 text-base leading-8 text-stone-700 md:text-lg md:leading-9">
          Every other AI resume tool on the market will happily add skills you
          do not have. They rewrite your experience to sound more impressive
          than it was. They make you look like a better candidate than you are.
        </p>

        <p className="mt-6 font-display text-xl font-bold tracking-tightish text-ink md:text-2xl">
          We do not do that.
        </p>

        <ul className="mt-10 space-y-4">
          {RULES.map((rule) => (
            <li key={rule} className="flex gap-3">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-rust" />
              <span className="text-sm leading-7 text-stone-700 md:text-base md:leading-8">
                {rule}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-10 border-l-2 border-rust pl-4 text-sm italic leading-7 text-stone-600 md:text-base md:leading-8">
          Tailoring should help you present your real experience better. Not
          help you lie about it. That is the whole point of myDoc.
        </p>
      </div>
    </section>
  );
}