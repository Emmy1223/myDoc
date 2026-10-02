const FEATURES = [
  {
    title: "Live A4 preview",
    body: "See exactly how your CV will look on paper while you type.",
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
    title: "Rich-text writing",
    body: "Headings, bold, italics, underline, lists, quotes, code, links, and alignment. Everything you expect from a real writing editor.",
  },
  {
    title: "CV templates",
    body: "Recruiter-tested layouts built for ATS parsers and human reviewers alike. Switch layouts with one click  your content stays exactly where it is.",
  },
  {
    title: "Document templates",
    body: "Blank pages, project briefs, reports, meeting notes, and more. Each template gives you a strong structure you can edit freely.",
  },
  {
    title: "Autosave everywhere",
    body: "Every keystroke is saved to the cloud. Close the tab, switch devices, come back later  your work is exactly where you left it.",
  },
  {
    title: "Optional sections",
    body: "Add languages, projects, certifications, awards, and anything else. Your CV grows with your career, not against it.",
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
            One editor. Two jobs.
          </h2>
          <p className="mt-6 text-base leading-8 text-stone-700 md:text-lg md:leading-9">
            Build a CV with the structured editor  or open a document and
            write freely, like you would in Word. Both live in the same
            workspace, both autosave, and both export to a clean PDF.
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