const FEATURES = [
  {
    title: "AI CV parsing",
    body: "Upload any PDF or Word CV. We extract and structure it automatically.",
  },
  {
    title: "Tailor to any job",
    body: "Paste a job description, get a tailored version in 60 seconds.",
  },
  {
    title: "ATS-friendly output",
    body: "Black on white. Standard fonts. No graphics that break parsers.",
  },
  {
    title: "Auto-fit to two pages",
    body: "Density adjusts automatically. A warning if it cannot fit.",
  },
  {
  title: "Six templates",
  body: "Folio, Ledger, Slab, Compact, Editorial, and Modern. Recruiter-tested layouts.",
},
  {
    title: "Live editor",
    body: "Real-time A4 preview as you type. Every change saves automatically.",
  },
  {
    title: "Multi-section support",
    body: "Experience, education, skills, languages, projects, certifications, and more.",
  },
  {
    title: "Match scoring",
    body: "See exactly how well your CV matches a job, with matched and missing keywords.",
  },
  {
    title: "Never invents",
    body: "Every claim comes from your existing CV. Nothing is fabricated.",
  },
  {
    title: "Free forever",
    body: "No credit card. No document limit. No trial that expires.",
  },
  {
    title: "Export as PDF",
    body: "Print-ready PDF with the correct filename, ready to submit.",
  },
  {
    title: "No account required to try",
    body: "Start building without signing up. Sign up only to save to the cloud.",
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="border-b border-stone-200">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
            Everything you get
          </p>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.15] tracking-[-0.02em] text-ink md:text-4xl">
            Every feature, no marketing fluff
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="border border-stone-200 bg-white p-5"
            >
              <h3 className="font-display text-base font-bold tracking-tightish text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-stone-600">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}