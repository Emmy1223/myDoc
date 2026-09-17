import { ScanText, History, LayoutPanelTop, Check } from "lucide-react";

const features = [
  {
    icon: ScanText,
    title: "Smart text extraction",
    body: "Raw PDF text is parsed into a strict schema — name, experience, education, skills — so every field lands where it belongs.",
  },
  {
    icon: History,
    title: "Version history",
    body: "Every save is kept. Roll back to an earlier draft without re-uploading or rebuilding anything from scratch.",
  },
  {
    icon: LayoutPanelTop,
    title: "One-click layout switching",
    body: "Switch between editorial, two-column, and monospaced templates. Your content reflows into the new design automatically.",
  },
];

/** CSS-built document wireframe for the right pane. */
function DocumentWireframe() {
  return (
    <div className="flex justify-center border-l border-stone-200 bg-stone-100 py-14 md:py-20">
      <div className="aspect-[1/1.414] w-64 bg-white p-7 border border-stone-300 md:w-72">
        {/* header */}
        <div className="flex items-start justify-between border-b border-stone-900 pb-4">
          <div>
            <div className="h-3 w-32 bg-stone-900" />
            <div className="mt-1.5 h-1.5 w-24 bg-rust" />
          </div>
          <ScanText className="h-5 w-5 text-stone-400" strokeWidth={1.5} />
        </div>

        {/* extracted blocks */}
        <div className="mt-5">
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-rust">
            Experience
          </p>
          {[0, 1].map((i) => (
            <div key={i} className="mt-3 border-b border-stone-200 pb-3">
              <div className="flex items-center gap-1.5">
                <Check className="h-2.5 w-2.5 text-rust" strokeWidth={3} />
                <div className="h-1.5 w-28 bg-stone-700" />
              </div>
              <div className="ml-4 mt-1.5 space-y-1">
                <div className="h-1 w-40 bg-stone-300" />
                <div className="h-1 w-32 bg-stone-300" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-rust">
            Skills
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {["w-8", "w-10", "w-7", "w-9"].map((w, i) => (
              <span key={i} className={`h-3 ${w} border border-stone-300 bg-stone-100`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeatureShowcase() {
  return (
    <section className="bg-stone-100 border-y border-stone-200">
      <div className="mx-auto grid max-w-6xl gap-0 md:grid-cols-5">
        {/* Left: feature list (40%) */}
        <div className="px-6 py-16 md:col-span-2 md:py-20">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-rust">
            What you get
          </p>
          <h2 className="font-display text-3xl font-bold leading-[1.15] tracking-tightish text-ink md:text-4xl">
            The hard parts of reformatting, handled for you.
          </h2>

          <ul className="mt-10">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <li
                  key={i}
                  className="flex gap-4 border-t border-stone-300 py-6 first:border-t-0 first:pt-0"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-stone-300 bg-white">
                    <Icon className="h-4 w-4 text-rust" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold tracking-tightish text-ink">
                      {f.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-7 text-stone-600">
                      {f.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right: wireframe visual (60%) */}
        <div className="md:col-span-3">
          <DocumentWireframe />
        </div>
      </div>
    </section>
  );
}
