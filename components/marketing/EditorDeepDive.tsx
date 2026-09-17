const FEATURES = [
  {
  title: "Six professional templates",
  body: "Folio, Ledger, Slab, Compact, Editorial, and Modern. Recruiter-tested layouts that work in every ATS.",
},
  {
    title: "Auto-fit to two pages",
    body: "If your CV runs long, we tighten spacing automatically. If it still does not fit, we tell you honestly and suggest trimming content, not shrinking fonts below readable sizes.",
  },
  {
    title: "Bullet control",
    body: "Choose dot, dash, or no bullets. Adjust line spacing. The preview updates instantly.",
  },
  {
    title: "Live A4 preview",
    body: "See exactly how your CV will look on paper while you type.",
  },
];

export default function EditorDeepDive() {
  return (
    <section className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
            The Editor
          </p>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.15] tracking-[-0.02em] text-ink md:text-4xl">
            A live editor that does not get in your way
          </h2>
          <p className="mt-6 text-base leading-8 text-stone-700 md:text-lg md:leading-9">
            Edit any section. Add optional sections like languages, projects,
            and certifications. Everything autosaves to your account. Nothing
            you do is ever lost.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="border border-stone-200 bg-paper p-6"
            >
              <h3 className="font-display text-lg font-bold tracking-tightish text-ink">
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