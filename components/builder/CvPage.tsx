import type { CVData, TemplateId, Density } from "@/lib/cv-data";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";

const pageSizes: Record<"A4" | "Letter", { w: string; h: string }> = {
  A4: { w: "210mm", h: "297mm" },
  Letter: { w: "216mm", h: "279mm" },
};

const densityPadding: Record<Density, string> = {
  compact: "13mm",
  normal: "17mm",
  roomy: "21mm",
};

const densityGap: Record<Density, string> = {
  compact: "3.5mm",
  normal: "5mm",
  roomy: "7mm",
};

/** Render fallback text in light gray when a field is empty. */
function Or({ value, fallback }: { value: string; fallback: string }) {
  return value.trim() ? (
    <>{value}</>
  ) : (
    <span className="text-stone-300">{fallback}</span>
  );
}

function bulletsFrom(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

function ContactItems({ cv, dark = false }: { cv: CVData; dark?: boolean }) {
  const items = [
    { icon: Mail, value: cv.email, fallback: "email@example.com" },
    { icon: Phone, value: cv.phone, fallback: "+00 000 000 000" },
    { icon: MapPin, value: cv.location, fallback: "City, Country" },
    { icon: Globe, value: cv.website, fallback: "yoursite.com" },
  ].filter((i) => i.value || i.fallback);

  return (
    <ul className={dark ? "space-y-1.5 text-stone-200" : "flex flex-wrap items-center gap-x-3 gap-y-1"}>
      {items.map((item, i) => {
        const Icon = item.icon;
        const empty = !item.value.trim();
        return (
          <li
            key={i}
            className={`flex items-center gap-1.5 text-[8.5pt] leading-relaxed ${
              dark ? "" : ""
            } ${empty ? "text-stone-500" : ""}`}
          >
            <Icon
              className={`h-[9pt] w-[9pt] shrink-0 ${
                dark ? "text-orange-400" : "text-rust"
              }`}
              strokeWidth={1.75}
            />
            <span className={empty ? "text-stone-500" : ""}>
              {empty ? item.fallback : item.value}
            </span>
            {!dark && i < items.length - 1 && (
              <span className="ml-1.5 text-stone-300">/</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Template 1 — Folio: single-column editorial                          */
/* ------------------------------------------------------------------ */
function Folio({ cv, pad, gap }: { cv: CVData; pad: string; gap: string }) {
  return (
    <div style={{ padding: pad }} className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b-2 border-stone-900 pb-[4mm]">
        <h1 className="font-display text-[27pt] font-extrabold leading-none tracking-[-0.02em]">
          <Or value={cv.fullName} fallback="Your Name" />
        </h1>
        <p className="mt-[2mm] text-[11pt] font-semibold uppercase tracking-[0.14em] text-rust">
          <Or value={cv.title} fallback="Job Title" />
        </p>
        <div className="mt-[3mm]">
          <ContactItems cv={cv} />
        </div>
      </header>

      {cv.summary.trim() && (
        <section style={{ marginTop: gap }}>
          <FolioLabel>Profile</FolioLabel>
          <p className="mt-[2mm] text-[9.5pt] leading-[1.65] text-stone-700">
            {cv.summary}
          </p>
        </section>
      )}

      <section style={{ marginTop: gap }}>
        <FolioLabel>Experience</FolioLabel>
        <div className="mt-[2mm]">
          {(cv.experience.length
            ? cv.experience
            : [{ id: "empty", role: "", company: "", location: "", start: "", end: "", bullets: "" }]
          ).map((exp, i) => (
            <div
              key={exp.id}
              style={{ paddingBottom: gap }}
              className={i > 0 || cv.experience.length === 0 ? "border-t border-stone-200" : ""}
            >
              <div style={{ paddingTop: i > 0 || cv.experience.length === 0 ? gap : 0 }}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-[11pt] font-bold text-ink">
                    <Or value={exp.role} fallback="Role Title" />
                  </h3>
                  <span className="shrink-0 text-[8.5pt] font-medium tabular-nums text-stone-500">
                    <Or value={`${exp.start}${exp.start || exp.end ? " – " : ""}${exp.end}`} fallback="20XX – Present" />
                  </span>
                </div>
                <p className="mt-[0.5mm] text-[9pt] font-semibold text-rust">
                  <Or
                    value={[exp.company, exp.location].filter(Boolean).join(" · ")}
                    fallback="Company · City"
                  />
                </p>
                <ul className="mt-[1.5mm] space-y-[1mm]">
                  {(bulletsFrom(exp.bullets).length
                    ? bulletsFrom(exp.bullets)
                    : ["Describe what you did and what changed because of it."]
                  ).map((b, j) => (
                    <li
                      key={j}
                      className={`flex gap-[2mm] text-[9.5pt] leading-[1.55] ${
                        exp.bullets.trim() ? "text-stone-700" : "text-stone-300"
                      }`}
                    >
                      <span className="text-rust">—</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: gap }}>
        <FolioLabel>Education</FolioLabel>
        <div className="mt-[2mm]">
          {(cv.education.length
            ? cv.education
            : [{ id: "empty", degree: "", school: "", start: "", end: "", detail: "" }]
          ).map((ed) => (
            <div key={ed.id}>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[10.5pt] font-bold text-ink">
                  <Or value={ed.degree} fallback="Degree Title" />
                </h3>
                <span className="shrink-0 text-[8.5pt] font-medium tabular-nums text-stone-500">
                  <Or value={`${ed.start}${ed.start || ed.end ? " – " : ""}${ed.end}`} fallback="20XX – 20XX" />
                </span>
              </div>
              <p className="mt-[0.5mm] text-[9pt] font-semibold text-rust">
                <Or value={ed.school} fallback="Institution Name" />
              </p>
              {ed.detail.trim() && (
                <p className="mt-[1mm] text-[9pt] leading-[1.55] text-stone-600">
                  {ed.detail}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: gap }}>
        <FolioLabel>Skills</FolioLabel>
        <div className="mt-[2mm] flex flex-wrap gap-x-[4mm] gap-y-[1.5mm]">
          {(cv.skills.length ? cv.skills : ["Your skill", "Another skill"]).map(
            (s, i) => (
              <span
                key={i}
                className={`text-[9pt] ${
                  cv.skills.length ? "text-stone-700" : "text-stone-300"
                }`}
              >
                {s}
                {i < (cv.skills.length ? cv.skills.length : 2) - 1 && (
                  <span className="ml-[4mm] text-rust">·</span>
                )}
              </span>
            )
          )}
        </div>
      </section>
    </div>
  );
}

function FolioLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[3mm]">
      <span className="shrink-0 text-[9pt] font-bold uppercase tracking-[0.18em] text-rust">
        {children}
      </span>
      <span className="h-px flex-1 bg-stone-300" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Template 2 — Ledger: dark side rail + main column                    */
/* ------------------------------------------------------------------ */
function Ledger({ cv, pad, gap }: { cv: CVData; pad: string; gap: string }) {
  return (
    <div className="flex h-full">
      {/* Side rail */}
      <aside className="w-[36%] bg-stone-900 py-[14mm] pl-[10mm] pr-[6mm] text-white">
        <p className="text-[8.5pt] font-bold uppercase tracking-[0.2em] text-orange-400">
          Contact
        </p>
        <div className="mt-[3mm]">
          <ContactItems cv={cv} dark />
        </div>

        <p className="mt-[7mm] text-[8.5pt] font-bold uppercase tracking-[0.2em] text-orange-400">
          Skills
        </p>
        <ul className="mt-[3mm]">
          {(cv.skills.length ? cv.skills : ["Your skill", "Another skill"]).map(
            (s, i) => (
              <li
                key={i}
                className={`border-b border-stone-700 py-[1.5mm] text-[9pt] ${
                  cv.skills.length ? "text-stone-200" : "text-stone-500"
                }`}
              >
                {s}
              </li>
            )
          )}
        </ul>

        <p className="mt-[7mm] text-[8.5pt] font-bold uppercase tracking-[0.2em] text-orange-400">
          Education
        </p>
        <div className="mt-[3mm] space-y-[4mm]">
          {(cv.education.length
            ? cv.education
            : [{ id: "empty", degree: "", school: "", start: "", end: "", detail: "" }]
          ).map((ed) => (
            <div key={ed.id}>
              <p className="text-[9.5pt] font-bold leading-snug text-white">
                <Or value={ed.degree} fallback="Degree Title" />
              </p>
              <p className="mt-[0.5mm] text-[8.5pt] text-stone-400">
                <Or value={ed.school} fallback="Institution" />
              </p>
              <p className="mt-[0.5mm] text-[8pt] tabular-nums text-stone-500">
                <Or value={`${ed.start}${ed.start || ed.end ? " – " : ""}${ed.end}`} fallback="20XX – 20XX" />
              </p>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div style={{ padding: pad }} className="min-w-0 flex-1">
        <header className="border-b-2 border-stone-900 pb-[4mm]">
          <h1 className="font-display text-[26pt] font-extrabold leading-none tracking-[-0.02em]">
            <Or value={cv.fullName} fallback="Your Name" />
          </h1>
          <p className="mt-[2mm] text-[10.5pt] font-semibold uppercase tracking-[0.14em] text-rust">
            <Or value={cv.title} fallback="Job Title" />
          </p>
        </header>

        {cv.summary.trim() && (
          <section style={{ marginTop: gap }}>
            <p className="text-[9.5pt] leading-[1.65] text-stone-700">
              {cv.summary}
            </p>
          </section>
        )}

        <section style={{ marginTop: gap }}>
          <p className="text-[9pt] font-bold uppercase tracking-[0.18em] text-rust">
            Experience
          </p>
          <div className="mt-[2.5mm]">
            {(cv.experience.length
              ? cv.experience
              : [{ id: "empty", role: "", company: "", location: "", start: "", end: "", bullets: "" }]
            ).map((exp, i) => (
              <div
                key={exp.id}
                style={{ paddingBottom: gap }}
                className={i > 0 || cv.experience.length === 0 ? "border-t border-stone-200 pt-[4mm]" : ""}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[10.5pt] font-bold">
                    <Or value={exp.role} fallback="Role Title" />
                  </h3>
                  <span className="shrink-0 text-[8pt] font-medium tabular-nums text-stone-500">
                    <Or value={`${exp.start}${exp.start || exp.end ? " – " : ""}${exp.end}`} fallback="20XX – Present" />
                  </span>
                </div>
                <p className="mt-[0.5mm] text-[8.5pt] font-semibold uppercase tracking-wide text-stone-500">
                  <Or
                    value={[exp.company, exp.location].filter(Boolean).join(" — ")}
                    fallback="Company — City"
                  />
                </p>
                <ul className="mt-[1.5mm] space-y-[1mm]">
                  {(bulletsFrom(exp.bullets).length
                    ? bulletsFrom(exp.bullets)
                    : ["Describe what you did and what changed because of it."]
                  ).map((b, j) => (
                    <li
                      key={j}
                      className={`flex gap-[2mm] text-[9pt] leading-[1.5] ${
                        exp.bullets.trim() ? "text-stone-700" : "text-stone-300"
                      }`}
                    >
                      <span className="font-bold text-rust">·</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Template 3 — Slab: mono labels, indented rules                       */
/* ------------------------------------------------------------------ */
function Slab({ cv, pad, gap }: { cv: CVData; pad: string; gap: string }) {
  return (
    <div style={{ padding: pad }} className="flex h-full flex-col">
      <header>
        <h1 className="font-display text-[28pt] font-extrabold leading-none tracking-[-0.02em]">
          <Or value={cv.fullName} fallback="YOUR NAME" />
        </h1>
        <p className="mt-[2mm] font-mono text-[9pt] uppercase tracking-[0.22em] text-rust">
          <Or value={cv.title} fallback="// job title" />
        </p>
        <div className="mt-[3.5mm] border-t border-stone-900 pt-[3mm]">
          <ContactItems cv={cv} />
        </div>
      </header>

      {cv.summary.trim() && (
        <SlabSection title="01 / Profile" mt={gap}>
          <p className="text-[9.5pt] leading-[1.7] text-stone-700">
            {cv.summary}
          </p>
        </SlabSection>
      )}

      <SlabSection title="02 / Experience" mt={gap}>
        <div>
          {(cv.experience.length
            ? cv.experience
            : [{ id: "empty", role: "", company: "", location: "", start: "", end: "", bullets: "" }]
          ).map((exp, i) => (
            <div
              key={exp.id}
              style={{ paddingBottom: gap }}
              className={i > 0 || cv.experience.length === 0 ? "border-t border-stone-200 pt-[4mm]" : ""}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-mono text-[10.5pt] font-bold tracking-tight">
                  <Or value={exp.role} fallback="role-title" />
                </h3>
                <span className="shrink-0 font-mono text-[8pt] tabular-nums text-stone-500">
                  <Or value={`${exp.start}/${exp.end}`} fallback="20XX/PRESENT" />
                </span>
              </div>
              <p className="mt-[0.5mm] font-mono text-[8.5pt] uppercase tracking-[0.12em] text-stone-500">
                <Or
                  value={[exp.company, exp.location].filter(Boolean).join(" · ")}
                  fallback="company · city"
                />
              </p>
              <ul className="mt-[2mm] space-y-[1.5mm]">
                {(bulletsFrom(exp.bullets).length
                  ? bulletsFrom(exp.bullets)
                  : ["Describe what you did and what changed because of it."]
                ).map((b, j) => (
                  <li
                    key={j}
                    className={`flex gap-[2.5mm] text-[9.5pt] leading-[1.6] ${
                      exp.bullets.trim() ? "text-stone-700" : "text-stone-300"
                    }`}
                  >
                    <span className="shrink-0 font-mono text-rust">→</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SlabSection>

      <SlabSection title="03 / Education" mt={gap}>
        <div>
          {(cv.education.length
            ? cv.education
            : [{ id: "empty", degree: "", school: "", start: "", end: "", detail: "" }]
          ).map((ed) => (
            <div key={ed.id} className={ed.id === "empty" ? "" : "mb-[3mm]"}>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-mono text-[10pt] font-bold">
                  <Or value={ed.degree} fallback="degree-title" />
                </h3>
                <span className="shrink-0 font-mono text-[8pt] tabular-nums text-stone-500">
                  <Or value={`${ed.start}/${ed.end}`} fallback="20XX/20XX" />
                </span>
              </div>
              <p className="mt-[0.5mm] font-mono text-[8.5pt] uppercase tracking-[0.12em] text-rust">
                <Or value={ed.school} fallback="institution" />
              </p>
              {ed.detail.trim() && (
                <p className="mt-[1mm] text-[9pt] leading-[1.55] text-stone-600">
                  {ed.detail}
                </p>
              )}
            </div>
          ))}
        </div>
      </SlabSection>

      <SlabSection title="04 / Skills" mt={gap}>
        <ul className="flex flex-wrap gap-[2mm]">
          {(cv.skills.length ? cv.skills : ["your-skill", "another-skill"]).map(
            (s, i) => (
              <li
                key={i}
                className={`border border-stone-300 px-[2.5mm] py-[1mm] font-mono text-[8.5pt] uppercase tracking-wide ${
                  cv.skills.length
                    ? "border-stone-400 text-stone-700"
                    : "text-stone-300"
                }`}
              >
                {s.toLowerCase().replace(/\s+/g, "-")}
              </li>
            )
          )}
        </ul>
      </SlabSection>
    </div>
  );
}

function SlabSection({
  title,
  mt,
  children,
}: {
  title: string;
  mt: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: mt }}>
      <p className="border-l-[3px] border-rust pl-[3mm] font-mono text-[9pt] font-bold uppercase tracking-[0.2em] text-ink">
        {title}
      </p>
      <div className="pl-[calc(3mm+3px)] pt-[3mm]">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page shell                                                           */
/* ------------------------------------------------------------------ */
export default function CvPage({
  cv,
  template,
  density = "normal",
  pageSize = "A4",
}: {
  cv: CVData;
  template: TemplateId;
  density?: Density;
  pageSize?: "A4" | "Letter";
}) {
  const size = pageSizes[pageSize];
  const pad = densityPadding[density];
  const gap = densityGap[density];

  return (
    <div
      className="cv-page"
      style={
        {
          "--cv-page-w": size.w,
          "--cv-page-h": size.h,
        } as React.CSSProperties
      }
    >
      {template === "folio" && <Folio cv={cv} pad={pad} gap={gap} />}
      {template === "ledger" && <Ledger cv={cv} pad={pad} gap={gap} />}
      {template === "slab" && <Slab cv={cv} pad={pad} gap={gap} />}
    </div>
  );
}
