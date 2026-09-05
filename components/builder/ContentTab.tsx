"use client";

import { useState } from "react";
import { ChevronDown, User, Briefcase, GraduationCap, Wrench } from "lucide-react";
import type { CVData } from "@/lib/cv-data";
import {
  Field,
  TextArea,
  SkillsEditor,
  ExperienceEditor,
  EducationEditor,
} from "./fields";

type SectionKey = "personal" | "experience" | "education" | "skills";

const sections: {
  key: SectionKey;
  label: string;
  icon: typeof User;
}[] = [
  { key: "personal", label: "Personal Details", icon: User },
  { key: "experience", label: "Work Experience", icon: Briefcase },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "skills", label: "Skills", icon: Wrench },
];

export default function ContentTab({
  cv,
  setCv,
}: {
  cv: CVData;
  setCv: (updater: (prev: CVData) => CVData) => void;
}) {
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    personal: true,
    experience: true,
    education: false,
    skills: false,
  });

  function toggle(key: SectionKey) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="border-t border-stone-200">
      {sections.map((section) => {
        const Icon = section.icon;
        const isOpen = open[section.key];
        return (
          <div key={section.key} className="border-b border-stone-200">
            <button
              onClick={() => toggle(section.key)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-stone-100"
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-rust" strokeWidth={1.75} />
                <span className="font-display text-sm font-bold tracking-tightish text-ink">
                  {section.label}
                </span>
              </span>
              <ChevronDown
                className={`h-4 w-4 text-stone-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                strokeWidth={2}
              />
            </button>

            {isOpen && (
              <div className="space-y-3 border-t border-stone-200 bg-white px-4 py-4">
                {section.key === "personal" && (
                  <>
                    <Field
                      label="Full name"
                      value={cv.fullName}
                      placeholder="Maya Okafor"
                      onChange={(v) =>
                        setCv((prev) => ({ ...prev, fullName: v }))
                      }
                    />
                    <Field
                      label="Professional title"
                      value={cv.title}
                      placeholder="Senior Product Designer"
                      onChange={(v) =>
                        setCv((prev) => ({ ...prev, title: v }))
                      }
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                      <Field
                        label="Email"
                        type="email"
                        value={cv.email}
                        placeholder="you@example.com"
                        onChange={(v) =>
                          setCv((prev) => ({ ...prev, email: v }))
                        }
                      />
                      <Field
                        label="Phone"
                        value={cv.phone}
                        placeholder="+44 7700 900 321"
                        onChange={(v) =>
                          setCv((prev) => ({ ...prev, phone: v }))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <Field
                        label="Location"
                        value={cv.location}
                        placeholder="London, UK"
                        onChange={(v) =>
                          setCv((prev) => ({ ...prev, location: v }))
                        }
                      />
                      <Field
                        label="Website"
                        value={cv.website}
                        placeholder="yoursite.com"
                        onChange={(v) =>
                          setCv((prev) => ({ ...prev, website: v }))
                        }
                      />
                    </div>
                    <TextArea
                      label="Professional summary"
                      rows={4}
                      value={cv.summary}
                      placeholder="Two or three sentences on what you do and what you're known for."
                      onChange={(v) =>
                        setCv((prev) => ({ ...prev, summary: v }))
                      }
                    />
                  </>
                )}

                {section.key === "experience" && (
                  <ExperienceEditor
                    items={cv.experience}
                    onChange={(items) =>
                      setCv((prev) => ({ ...prev, experience: items }))
                    }
                  />
                )}

                {section.key === "education" && (
                  <EducationEditor
                    items={cv.education}
                    onChange={(items) =>
                      setCv((prev) => ({ ...prev, education: items }))
                    }
                  />
                )}

                {section.key === "skills" && (
                  <SkillsEditor
                    skills={cv.skills}
                    onChange={(skills) =>
                      setCv((prev) => ({ ...prev, skills }))
                    }
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
