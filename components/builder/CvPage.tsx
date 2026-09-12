// components/builder/CvPage.tsx
import React from "react";
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

type ResolvedDensity = Exclude<Density, "auto">;

const densityPadding: Record<ResolvedDensity, string> = {
  compact: "13mm",
  normal: "17mm",
  roomy: "21mm",
};

const densityGap: Record<ResolvedDensity, string> = {
  compact: "3.5mm",
  normal: "5mm",
  roomy: "7mm",
};

type BulletStyle = "dot" | "dash" | "none";

const DEFAULT_BULLET_STYLE: BulletStyle = "dash";

const bulletSymbols = {
  dot: "·",
  dash: "—",
  none: "",
};

const bulletSpacingMap = {
  compact: "0.5mm",
  normal: "1mm",
  roomy: "1.5mm",
};

function Or({ value, fallback }: { value: string; fallback: string }) {
  return value.trim() ? (
    <>{value}</>
  ) : (
    <span className="text-gray-300">{fallback}</span>
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
    <ul className={dark ? "space-y-1.5 text-gray-300" : "flex flex-wrap items-center gap-x-3 gap-y-1"}>
      {items.map((item, i) => {
        const Icon = item.icon;
        const empty = !item.value.trim();
        return (
          <li
            key={i}
            className={`flex items-center gap-1.5 text-[8.5pt] leading-relaxed ${
              dark ? "text-gray-300" : "text-black"
            } ${empty ? "text-gray-400" : ""}`}
          >
            <Icon
              className={`h-[9pt] w-[9pt] shrink-0 ${
                dark ? "text-gray-400" : "text-black"
              }`}
              strokeWidth={1.75}
            />
            <span className={empty ? "text-gray-400" : dark ? "text-gray-200" : "text-black"}>
              {empty ? item.fallback : item.value}
            </span>
            {!dark && i < items.length - 1 && (
              <span className="ml-1.5 text-gray-400">/</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function BulletList({
  items,
  bulletStyle = DEFAULT_BULLET_STYLE,
  spacing = "normal",
  className = "",
  emptyText = "Describe what you did and what changed because of it."
}: {
  items: string[];
  bulletStyle?: BulletStyle;
  spacing?: "compact" | "normal" | "roomy";
  className?: string;
  emptyText?: string;
}) {
  const displayItems = items.length > 0 ? items : [emptyText];
  const isEmpty = items.length === 0;
  const symbol = bulletSymbols[bulletStyle];
  const gapSize = bulletSpacingMap[spacing];

  return (
    <ul className={`space-y-[${gapSize}] ${className}`}>
      {displayItems.map((item, index) => (
        <li
          key={index}
          className={`flex gap-[2mm] text-[9.5pt] leading-[1.55] ${
            isEmpty ? "text-gray-400" : "text-black"
          }`}
        >
          {bulletStyle !== "none" && (
            <span className="shrink-0 text-black min-w-[8pt] text-center">
              {symbol}
            </span>
          )}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionWrapper({
  title,
  gap,
  children,
}: {
  title: string;
  gap: string;
  children: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <section style={{ marginTop: gap }}>
      <h3 className="cv-section-heading text-[9pt] font-bold uppercase tracking-[0.15em] text-black">
        {title}
      </h3>
      <div className="mt-[2mm]">{children}</div>
    </section>
  );
}

function renderLanguages(cv: CVData, gap: string) {
  if (!cv.languages || cv.languages.length === 0) return null;
  return (
    <SectionWrapper key="languages" title="Languages" gap={gap}>
      <ul className="space-y-[1mm]">
        {cv.languages.map((lang) => (
          <li key={lang.id} className="flex items-baseline justify-between gap-4 text-[9pt]">
            <span className="font-medium text-black">{lang.name}</span>
            <span className="text-gray-600">{lang.proficiency}</span>
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

function renderCertificates(cv: CVData, gap: string) {
  if (!cv.certificates || cv.certificates.length === 0) return null;
  return (
    <SectionWrapper key="certificates" title="Certificates" gap={gap}>
      <ul className="space-y-[2mm]">
        {cv.certificates.map((cert) => (
          <li key={cert.id} className="cv-entry">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[9.5pt] font-medium text-black">{cert.name}</span>
              <span className="text-[8.5pt] text-gray-600">{cert.date}</span>
            </div>
            <p className="text-[8.5pt] text-gray-600">{cert.issuer}</p>
            {cert.link && (
              <p className="text-[8pt] text-gray-500">{cert.link}</p>
            )}
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

function renderProjects(cv: CVData, gap: string) {
  if (!cv.projects || cv.projects.length === 0) return null;
  return (
    <SectionWrapper key="projects" title="Projects" gap={gap}>
      <ul className="space-y-[3mm]">
        {cv.projects.map((project) => (
          <li key={project.id} className="cv-entry">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[9.5pt] font-medium text-black">{project.name}</span>
              <span className="text-[8.5pt] text-gray-600">{project.role}</span>
            </div>
            <p className="mt-[0.5mm] text-[9pt] text-gray-700">{project.description}</p>
            {project.technologies && (
              <p className="mt-[0.5mm] text-[8.5pt] text-gray-600">Tech: {project.technologies}</p>
            )}
            {project.link && (
              <p className="text-[8pt] text-gray-500">{project.link}</p>
            )}
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

function renderPublications(cv: CVData, gap: string) {
  if (!cv.publications || cv.publications.length === 0) return null;
  return (
    <SectionWrapper key="publications" title="Publications" gap={gap}>
      <ul className="space-y-[2mm]">
        {cv.publications.map((pub) => (
          <li key={pub.id} className="cv-entry">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[9.5pt] font-medium text-black">{pub.title}</span>
              <span className="text-[8.5pt] text-gray-600">{pub.date}</span>
            </div>
            <p className="text-[8.5pt] text-gray-600">{pub.publisher}</p>
            {pub.description && (
              <p className="mt-[0.5mm] text-[9pt] text-gray-700">{pub.description}</p>
            )}
            {pub.link && (
              <p className="text-[8pt] text-gray-500">{pub.link}</p>
            )}
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

function renderCourses(cv: CVData, gap: string) {
  if (!cv.courses || cv.courses.length === 0) return null;
  return (
    <SectionWrapper key="courses" title="Courses" gap={gap}>
      <ul className="space-y-[2mm]">
        {cv.courses.map((course) => (
          <li key={course.id} className="cv-entry">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[9.5pt] font-medium text-black">{course.name}</span>
              <span className="text-[8.5pt] text-gray-600">{course.date}</span>
            </div>
            <p className="text-[8.5pt] text-gray-600">{course.provider}</p>
            {course.link && (
              <p className="text-[8pt] text-gray-500">{course.link}</p>
            )}
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

function renderOrganizations(cv: CVData, gap: string) {
  if (!cv.organizations || cv.organizations.length === 0) return null;
  return (
    <SectionWrapper key="organizations" title="Organizations" gap={gap}>
      <ul className="space-y-[3mm]">
        {cv.organizations.map((org) => (
          <li key={org.id} className="cv-entry">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[9.5pt] font-medium text-black">{org.name}</span>
              <span className="text-[8.5pt] text-gray-600">{org.role}</span>
            </div>
            <p className="text-[8.5pt] text-gray-600">
              {org.start} {org.start && org.end && "–"} {org.end}
            </p>
            {org.description && (
              <p className="mt-[0.5mm] text-[9pt] text-gray-700">{org.description}</p>
            )}
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

function renderInterests(cv: CVData, gap: string) {
  if (!cv.interests || cv.interests.length === 0) return null;
  return (
    <SectionWrapper key="interests" title="Interests" gap={gap}>
      <div className="flex flex-wrap gap-x-[3mm] gap-y-[1mm]">
        {cv.interests.map((interest) => (
          <span key={interest.id} className="text-[9pt] text-black">
            {interest.name}
            {cv.interests.indexOf(interest) < cv.interests.length - 1 && (
              <span className="ml-[3mm] text-gray-400">·</span>
            )}
          </span>
        ))}
      </div>
    </SectionWrapper>
  );
}

function renderReferences(cv: CVData, gap: string) {
  if (!cv.references || cv.references.length === 0) return null;
  return (
    <SectionWrapper key="references" title="References" gap={gap}>
      <ul className="space-y-[3mm]">
        {cv.references.map((ref) => (
          <li key={ref.id} className="cv-entry">
            <p className="text-[9.5pt] font-medium text-black">{ref.name}</p>
            <p className="text-[8.5pt] text-gray-600">{ref.position}, {ref.company}</p>
            <p className="text-[8.5pt] text-gray-600">{ref.email}</p>
            <p className="text-[8.5pt] text-gray-600">{ref.phone}</p>
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

function renderAwards(cv: CVData, gap: string) {
  if (!cv.awards || cv.awards.length === 0) return null;
  return (
    <SectionWrapper key="awards" title="Awards" gap={gap}>
      <ul className="space-y-[2mm]">
        {cv.awards.map((award) => (
          <li key={award.id} className="cv-entry">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[9.5pt] font-medium text-black">{award.name}</span>
              <span className="text-[8.5pt] text-gray-600">{award.date}</span>
            </div>
            <p className="text-[8.5pt] text-gray-600">{award.issuer}</p>
            {award.description && (
              <p className="mt-[0.5mm] text-[9pt] text-gray-700">{award.description}</p>
            )}
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

function renderDeclaration(cv: CVData, gap: string) {
  if (!cv.declaration || cv.declaration.length === 0) return null;
  return (
    <SectionWrapper key="declaration" title="Declaration" gap={gap}>
      {cv.declaration.map((dec) => (
        <div key={dec.id} className="cv-entry">
          <p className="text-[9pt] leading-[1.6] text-black">{dec.text}</p>
          <div className="mt-[2mm] flex gap-[8mm]">
            {dec.signature && (
              <div>
                <p className="text-[8pt] text-gray-500">Signature</p>
                <p className="text-[9pt] font-medium text-black">{dec.signature}</p>
              </div>
            )}
            {dec.date && (
              <div>
                <p className="text-[8pt] text-gray-500">Date</p>
                <p className="text-[9pt] text-black">{dec.date}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </SectionWrapper>
  );
}

function renderCustom(cv: CVData, gap: string) {
  if (!cv.custom || cv.custom.length === 0) return null;
  return (
    <SectionWrapper key="custom" title="" gap={gap}>
      {cv.custom.map((section) => (
        <div key={section.id} className="cv-entry">
          <h3 className="text-[10pt] font-bold uppercase tracking-[0.12em] text-black">
            {section.title}
          </h3>
          <p className="mt-[1mm] text-[9pt] leading-[1.6] text-black">
            {section.content}
          </p>
        </div>
      ))}
    </SectionWrapper>
  );
}

function Folio({
  cv,
  pad,
  gap,
  bulletStyle = DEFAULT_BULLET_STYLE,
  bulletSpacing = "normal",
}: {
  cv: CVData;
  pad: string;
  gap: string;
  bulletStyle?: BulletStyle;
  bulletSpacing?: "compact" | "normal" | "roomy";
}) {
  const enabledSections = cv.sectionOrder || [];

  return (
    <div style={{ padding: pad }} className="flex h-full flex-col bg-white">
      <header className="border-b-2 border-black pb-[4mm]">
        <h1 className="font-display text-[27pt] font-extrabold leading-none tracking-[-0.02em] text-black">
          <Or value={cv.fullName} fallback="Your Name" />
        </h1>
        <p className="mt-[2mm] text-[11pt] font-semibold tracking-[0.14em] text-black">
          <Or value={cv.title} fallback="Job Title" />
        </p>
        <div className="mt-[3mm]">
          <ContactItems cv={cv} />
        </div>
      </header>

      {enabledSections.map((id) => {
        switch (id) {
          case "summary":
            return cv.summary?.trim() ? (
              <SectionWrapper key="summary" title="Profile" gap={gap}>
                <p className="text-[9.5pt] leading-[1.65] text-black">{cv.summary}</p>
              </SectionWrapper>
            ) : null;
          case "experience":
            return cv.experience.length > 0 ? (
              <SectionWrapper key="experience" title="Experience" gap={gap}>
                <div>
                  {cv.experience.map((exp, i) => (
                    <div
                      key={exp.id}
                      style={{ paddingBottom: gap }}
                      className={`cv-entry ${i > 0 ? "border-t border-gray-300 pt-[3mm]" : ""}`}
                    >
                      <div className="cv-entry-header flex items-baseline justify-between gap-4">
                        <h3 className="text-[11pt] font-bold text-black">
                          <Or value={exp.role} fallback="Role Title" />
                        </h3>
                        <span className="shrink-0 text-[8.5pt] font-medium tabular-nums text-gray-600">
                          <Or value={`${exp.start}${exp.start || exp.end ? " – " : ""}${exp.end}`} fallback="20XX – Present" />
                        </span>
                      </div>
                      <p className="mt-[0.5mm] text-[9pt] font-semibold text-black">
                        <Or
                          value={[exp.company, exp.location].filter(Boolean).join(" · ")}
                          fallback="Company · City"
                        />
                      </p>
                      <BulletList
                        items={bulletsFrom(exp.bullets)}
                        bulletStyle={bulletStyle}
                        spacing={bulletSpacing}
                        className="mt-[1.5mm]"
                      />
                    </div>
                  ))}
                </div>
              </SectionWrapper>
            ) : null;
          case "education":
            return cv.education.length > 0 ? (
              <SectionWrapper key="education" title="Education" gap={gap}>
                <div>
                  {cv.education.map((ed) => (
                    <div
                      key={ed.id}
                      className={`cv-entry ${ed.id !== cv.education[0].id ? "mt-[3mm]" : ""}`}
                    >
                      <div className="cv-entry-header flex items-baseline justify-between gap-4">
                        <h3 className="text-[10.5pt] font-bold text-black">
                          <Or value={ed.degree} fallback="Degree Title" />
                        </h3>
                        <span className="shrink-0 text-[8.5pt] font-medium tabular-nums text-gray-600">
                          <Or value={`${ed.start}${ed.start || ed.end ? " – " : ""}${ed.end}`} fallback="20XX – 20XX" />
                        </span>
                      </div>
                      <p className="mt-[0.5mm] text-[9pt] font-semibold text-black">
                        <Or value={ed.school} fallback="Institution Name" />
                      </p>
                      {ed.detail.trim() && (
                        <p className="mt-[1mm] text-[9pt] leading-[1.55] text-gray-700">
                          {ed.detail}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </SectionWrapper>
            ) : null;
          case "skills":
            return cv.skills.length > 0 ? (
              <SectionWrapper key="skills" title="Skills" gap={gap}>
                <div className="flex flex-wrap gap-x-[3mm] gap-y-[1mm]">
                  {cv.skills.map((s, i) => (
                    <span key={i} className="text-[8.5pt] text-black">
                      {s}
                      {i < cv.skills.length - 1 && (
                        <span className="ml-[3mm] text-black">·</span>
                      )}
                    </span>
                  ))}
                </div>
              </SectionWrapper>
            ) : null;
          case "languages":
            return renderLanguages(cv, gap);
          case "certificates":
            return renderCertificates(cv, gap);
          case "projects":
            return renderProjects(cv, gap);
          case "publications":
            return renderPublications(cv, gap);
          case "courses":
            return renderCourses(cv, gap);
          case "organizations":
            return renderOrganizations(cv, gap);
          case "interests":
            return renderInterests(cv, gap);
          case "references":
            return renderReferences(cv, gap);
          case "awards":
            return renderAwards(cv, gap);
          case "declaration":
            return renderDeclaration(cv, gap);
          case "custom":
            return renderCustom(cv, gap);
          default:
            return null;
        }
      })}
    </div>
  );
}

function Ledger({
  cv,
  pad,
  gap,
  bulletStyle = DEFAULT_BULLET_STYLE,
  bulletSpacing = "compact",
}: {
  cv: CVData;
  pad: string;
  gap: string;
  bulletStyle?: BulletStyle;
  bulletSpacing?: "compact" | "normal" | "roomy";
}) {
  const enabledSections = cv.sectionOrder || [];

  const renderMainSection = (id: string) => {
    switch (id) {
      case "summary":
        return cv.summary?.trim() ? (
          <p className="text-[9.5pt] leading-[1.65] text-black">{cv.summary}</p>
        ) : null;
      case "experience":
        return cv.experience.length > 0 ? (
          <div>
            {cv.experience.map((exp, i) => (
              <div
                key={exp.id}
                style={{ paddingBottom: gap }}
                className={`cv-entry ${i > 0 ? "border-t border-gray-300 pt-[3mm]" : ""}`}
              >
                <div className="cv-entry-header flex items-baseline justify-between gap-3">
                  <h3 className="text-[10.5pt] font-bold text-black">
                    <Or value={exp.role} fallback="Role Title" />
                  </h3>
                  <span className="shrink-0 text-[8pt] font-medium tabular-nums text-gray-600">
                    <Or value={`${exp.start}${exp.start || exp.end ? " – " : ""}${exp.end}`} fallback="20XX – Present" />
                  </span>
                </div>
                <p className="mt-[0.5mm] text-[8.5pt] font-semibold uppercase tracking-wide text-gray-700">
                  <Or
                    value={[exp.company, exp.location].filter(Boolean).join(" — ")}
                    fallback="Company — City"
                  />
                </p>
                <BulletList
                  items={bulletsFrom(exp.bullets)}
                  bulletStyle={bulletStyle}
                  spacing={bulletSpacing}
                  className="mt-[1.5mm]"
                />
              </div>
            ))}
          </div>
        ) : null;
      case "education":
        return cv.education.length > 0 ? (
          <div>
            {cv.education.map((ed) => (
              <div
                key={ed.id}
                className={`cv-entry ${ed.id !== cv.education[0].id ? "mt-[3mm]" : ""}`}
              >
                <div className="cv-entry-header flex items-baseline justify-between gap-4">
                  <h3 className="text-[10.5pt] font-bold text-black">
                    <Or value={ed.degree} fallback="Degree Title" />
                  </h3>
                  <span className="shrink-0 text-[8.5pt] font-medium tabular-nums text-gray-600">
                    <Or value={`${ed.start}${ed.start || ed.end ? " – " : ""}${ed.end}`} fallback="20XX – 20XX" />
                  </span>
                </div>
                <p className="mt-[0.5mm] text-[9pt] font-semibold text-black">
                  <Or value={ed.school} fallback="Institution Name" />
                </p>
                {ed.detail.trim() && (
                  <p className="mt-[1mm] text-[9pt] leading-[1.55] text-gray-700">
                    {ed.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full bg-white">
      <aside className="w-[36%] bg-gray-800 py-[14mm] pl-[10mm] pr-[6mm] text-white">
        <p className="text-[8.5pt] font-bold uppercase tracking-[0.2em] text-white">Contact</p>
        <div className="mt-[3mm]">
          <ContactItems cv={cv} dark />
        </div>

        {cv.skills.length > 0 && (
          <>
            <p className="mt-[7mm] text-[8.5pt] font-bold uppercase tracking-[0.2em] text-white">Skills</p>
            <ul className="mt-[2mm]">
              {cv.skills.map((s, i) => (
                <li key={i} className="border-b border-gray-600 py-[1mm] text-[8.5pt] text-gray-200">
                  {s}
                </li>
              ))}
            </ul>
          </>
        )}

        {cv.languages && cv.languages.length > 0 && (
          <>
            <p className="mt-[7mm] text-[8.5pt] font-bold uppercase tracking-[0.2em] text-white">Languages</p>
            <ul className="mt-[2mm]">
              {cv.languages.map((lang) => (
                <li key={lang.id} className="border-b border-gray-600 py-[1mm] text-[8.5pt] text-gray-200">
                  <span>{lang.name}</span>
                  <span className="ml-2 text-gray-400">{lang.proficiency}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {cv.education.length > 0 && (
          <>
            <p className="mt-[7mm] text-[8.5pt] font-bold uppercase tracking-[0.2em] text-white">Education</p>
            <div className="mt-[2mm] space-y-[3mm]">
              {cv.education.map((ed) => (
                <div key={ed.id} className="cv-entry">
                  <p className="text-[9pt] font-bold leading-snug text-white">
                    <Or value={ed.degree} fallback="Degree Title" />
                  </p>
                  <p className="text-[8pt] text-gray-400">
                    <Or value={ed.school} fallback="Institution" />
                  </p>
                  <p className="text-[7.5pt] text-gray-500">
                    <Or value={`${ed.start}${ed.start || ed.end ? " – " : ""}${ed.end}`} fallback="20XX – 20XX" />
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </aside>

      <div style={{ padding: pad }} className="min-w-0 flex-1 bg-white">
        <header className="border-b-2 border-black pb-[4mm]">
          <h1 className="font-display text-[26pt] font-extrabold leading-none tracking-[-0.02em] text-black">
            <Or value={cv.fullName} fallback="Your Name" />
          </h1>
          <p className="mt-[2mm] text-[10.5pt] font-semibold tracking-[0.14em] text-black">
            <Or value={cv.title} fallback="Job Title" />
          </p>
        </header>

        {enabledSections.map((id) => {
          const content = renderMainSection(id);
          if (!content) return null;

          const labels: Record<string, string> = {
            summary: "Profile",
            experience: "Experience",
            education: "Education",
          };

          const label = labels[id];
          if (!label) return null;

          return (
            <section key={id} style={{ marginTop: gap }}>
              <p className="cv-section-heading text-[9pt] font-bold uppercase tracking-[0.18em] text-black">{label}</p>
              <div className="mt-[2.5mm]">{content}</div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Slab({
  cv,
  pad,
  gap,
  bulletStyle = DEFAULT_BULLET_STYLE,
  bulletSpacing = "normal",
}: {
  cv: CVData;
  pad: string;
  gap: string;
  bulletStyle?: BulletStyle;
  bulletSpacing?: "compact" | "normal" | "roomy";
}) {
  const enabledSections = cv.sectionOrder || [];
  let sectionCounter = 0;

  const getSectionNumber = () => {
    sectionCounter++;
    return String(sectionCounter).padStart(2, '0');
  };

  return (
    <div style={{ padding: pad }} className="flex h-full flex-col bg-white">
      <header>
        <h1 className="font-display text-[28pt] font-extrabold leading-none tracking-[-0.02em] text-black">
          <Or value={cv.fullName} fallback="YOUR NAME" />
        </h1>
        <p className="mt-[2mm] font-mono text-[9pt] tracking-[0.22em] text-black">
          <Or value={cv.title} fallback="// job title" />
        </p>
        <div className="mt-[3.5mm] border-t border-black pt-[3mm]">
          <ContactItems cv={cv} />
        </div>
      </header>

      {enabledSections.map((id) => {
        switch (id) {
          case "summary":
            return cv.summary?.trim() ? (
              <SlabSection key="summary" title={`${getSectionNumber()} / Profile`} mt={gap}>
                <p className="text-[9.5pt] leading-[1.7] text-black">{cv.summary}</p>
              </SlabSection>
            ) : null;
          case "experience":
            return cv.experience.length > 0 ? (
              <SlabSection key="experience" title={`${getSectionNumber()} / Experience`} mt={gap}>
                <div>
                  {cv.experience.map((exp, i) => (
                    <div
                      key={exp.id}
                      style={{ paddingBottom: gap }}
                      className={`cv-entry ${i > 0 ? "border-t border-gray-300 pt-[3mm]" : ""}`}
                    >
                      <div className="cv-entry-header flex items-baseline justify-between gap-4">
                        <h3 className="font-mono text-[10.5pt] font-bold tracking-tight text-black">
                          <Or value={exp.role} fallback="role-title" />
                        </h3>
                        <span className="shrink-0 font-mono text-[8pt] tabular-nums text-gray-600">
                          <Or value={`${exp.start}/${exp.end}`} fallback="20XX/PRESENT" />
                        </span>
                      </div>
                      <p className="mt-[0.5mm] font-mono text-[8.5pt] uppercase tracking-[0.12em] text-gray-700">
                        <Or
                          value={[exp.company, exp.location].filter(Boolean).join(" · ")}
                          fallback="company · city"
                        />
                      </p>
                      <BulletList
                        items={bulletsFrom(exp.bullets)}
                        bulletStyle={bulletStyle}
                        spacing={bulletSpacing}
                        className="mt-[2mm]"
                        emptyText="Describe what you did and what changed because of it."
                      />
                    </div>
                  ))}
                </div>
              </SlabSection>
            ) : null;
          case "education":
            return cv.education.length > 0 ? (
              <SlabSection key="education" title={`${getSectionNumber()} / Education`} mt={gap}>
                <div>
                  {cv.education.map((ed) => (
                    <div
                      key={ed.id}
                      className={`cv-entry ${ed.id !== cv.education[0].id ? "mt-[3mm]" : ""}`}
                    >
                      <div className="cv-entry-header flex items-baseline justify-between gap-4">
                        <h3 className="font-mono text-[10pt] font-bold text-black">
                          <Or value={ed.degree} fallback="degree-title" />
                        </h3>
                        <span className="shrink-0 font-mono text-[8pt] tabular-nums text-gray-600">
                          <Or value={`${ed.start}/${ed.end}`} fallback="20XX/20XX" />
                        </span>
                      </div>
                      <p className="mt-[0.5mm] font-mono text-[8.5pt] uppercase tracking-[0.12em] text-black">
                        <Or value={ed.school} fallback="institution" />
                      </p>
                      {ed.detail.trim() && (
                        <p className="mt-[1mm] text-[9pt] leading-[1.55] text-gray-700">
                          {ed.detail}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </SlabSection>
            ) : null;
          case "skills":
            return cv.skills.length > 0 ? (
              <SlabSection key="skills" title={`${getSectionNumber()} / Skills`} mt={gap}>
                <ul className="flex flex-wrap gap-[1.5mm]">
                  {cv.skills.map((s, i) => (
                    <li
                      key={i}
                      className="border border-gray-400 px-[2mm] py-[0.5mm] font-mono text-[8pt] uppercase tracking-wide text-black border-gray-600"
                    >
                      {s.toLowerCase().replace(/\s+/g, "-")}
                    </li>
                  ))}
                </ul>
              </SlabSection>
            ) : null;
          case "languages":
            return renderLanguages(cv, gap) ? (
              <SlabSection key="languages" title={`${getSectionNumber()} / Languages`} mt={gap}>
                {renderLanguages(cv, gap)}
              </SlabSection>
            ) : null;
          case "certificates":
            return renderCertificates(cv, gap) ? (
              <SlabSection key="certificates" title={`${getSectionNumber()} / Certificates`} mt={gap}>
                {renderCertificates(cv, gap)}
              </SlabSection>
            ) : null;
          case "projects":
            return renderProjects(cv, gap) ? (
              <SlabSection key="projects" title={`${getSectionNumber()} / Projects`} mt={gap}>
                {renderProjects(cv, gap)}
              </SlabSection>
            ) : null;
          case "publications":
            return renderPublications(cv, gap) ? (
              <SlabSection key="publications" title={`${getSectionNumber()} / Publications`} mt={gap}>
                {renderPublications(cv, gap)}
              </SlabSection>
            ) : null;
          case "courses":
            return renderCourses(cv, gap) ? (
              <SlabSection key="courses" title={`${getSectionNumber()} / Courses`} mt={gap}>
                {renderCourses(cv, gap)}
              </SlabSection>
            ) : null;
          case "organizations":
            return renderOrganizations(cv, gap) ? (
              <SlabSection key="organizations" title={`${getSectionNumber()} / Organizations`} mt={gap}>
                {renderOrganizations(cv, gap)}
              </SlabSection>
            ) : null;
          case "interests":
            return renderInterests(cv, gap) ? (
              <SlabSection key="interests" title={`${getSectionNumber()} / Interests`} mt={gap}>
                {renderInterests(cv, gap)}
              </SlabSection>
            ) : null;
          case "references":
            return renderReferences(cv, gap) ? (
              <SlabSection key="references" title={`${getSectionNumber()} / References`} mt={gap}>
                {renderReferences(cv, gap)}
              </SlabSection>
            ) : null;
          case "awards":
            return renderAwards(cv, gap) ? (
              <SlabSection key="awards" title={`${getSectionNumber()} / Awards`} mt={gap}>
                {renderAwards(cv, gap)}
              </SlabSection>
            ) : null;
          case "declaration":
            return renderDeclaration(cv, gap) ? (
              <SlabSection key="declaration" title={`${getSectionNumber()} / Declaration`} mt={gap}>
                {renderDeclaration(cv, gap)}
              </SlabSection>
            ) : null;
          case "custom":
            return renderCustom(cv, gap) ? (
              <SlabSection key="custom" title={`${getSectionNumber()} / Custom`} mt={gap}>
                {renderCustom(cv, gap)}
              </SlabSection>
            ) : null;
          default:
            return null;
        }
      })}
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
      <p className="cv-section-heading border-l-[3px] border-black pl-[3mm] font-mono text-[9pt] font-bold uppercase tracking-[0.2em] text-black">
        {title}
      </p>
      <div className="pl-[calc(3mm+3px)] pt-[3mm]">{children}</div>
    </section>
  );
}

export default function CvPage({
  cv,
  template,
  density = "normal",
  pageSize = "A4",
  bulletStyle = "dash",
  bulletSpacing = "compact",
}: {
  cv: CVData;
  template: TemplateId;
  density?: Density;
  pageSize?: "A4" | "Letter";
  bulletStyle?: BulletStyle;
  bulletSpacing?: "compact" | "normal" | "roomy";
}) {
  const resolvedDensity: ResolvedDensity =
    density === "auto" ? "normal" : density;

  const size = pageSizes[pageSize];
  const pad = densityPadding[resolvedDensity];
  const gap = densityGap[resolvedDensity];

  return (
    <div
      className="cv-page bg-white"
      data-density={resolvedDensity}
      style={
        {
          "--cv-page-w": size.w,
          "--cv-page-h": size.h,
        } as React.CSSProperties
      }
    >
      {template === "folio" && (
        <Folio
          cv={cv}
          pad={pad}
          gap={gap}
          bulletStyle={bulletStyle}
          bulletSpacing={bulletSpacing}
        />
      )}
      {template === "ledger" && (
        <Ledger
          cv={cv}
          pad={pad}
          gap={gap}
          bulletStyle={bulletStyle}
          bulletSpacing={bulletSpacing}
        />
      )}
      {template === "slab" && (
        <Slab
          cv={cv}
          pad={pad}
          gap={gap}
          bulletStyle={bulletStyle}
          bulletSpacing={bulletSpacing}
        />
      )}
    </div>
  );
}