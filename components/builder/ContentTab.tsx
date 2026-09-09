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

// Helper to get field instructions
const fieldInstructions = {
  fullName: {
    placeholder: "e.g. Maya Okafor, John Smith",
    hint: "Enter your full legal name as it should appear on your CV",
    example: "Maya Okafor"
  },
  title: {
    placeholder: "e.g. Senior Product Designer, Full Stack Developer",
    hint: "Your current or most relevant professional title",
    example: "Senior Product Designer"
  },
  email: {
    placeholder: "e.g. maya@email.com, john@company.com",
    hint: "Professional email address you check regularly",
    example: "maya.okafor@example.com"
  },
  phone: {
    placeholder: "e.g. +44 7700 900 321, +1 234 567 8900",
    hint: "Include country code for international applications",
    example: "+44 7700 900 321"
  },
  location: {
    placeholder: "e.g. London, UK | New York, NY | Remote",
    hint: "Your current city and country (or 'Remote' if applicable)",
    example: "London, UK"
  },
  website: {
    placeholder: "e.g. maya.design, github.com/username",
    hint: "Portfolio, personal website, or LinkedIn profile URL",
    example: "mayaokafor.design"
  },
  summary: {
    placeholder: "Experienced Product Designer with 8+ years in fintech, passionate about...",
    hint: "2-3 sentences highlighting your expertise, key achievements, and what you bring",
    example: "Product designer with eight years of experience turning complicated workflows into calm, legible software."
  }
};

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

  // Check if a field should show a placeholder value in the UI
  const shouldShowPlaceholder = (value: string, fieldKey: keyof typeof fieldInstructions) => {
    // If the value is empty or matches any of the example placeholders
    if (!value || value.trim() === "") return true;
    
    const examples = [
      fieldInstructions[fieldKey]?.example,
      "Maya Okafor",
      "Senior Product Designer",
      "maya.okafor@example.com",
      "+44 7700 900 321",
      "London, UK",
      "mayaokafor.design",
      "Product designer with eight years of experience turning complicated workflows into calm, legible software."
    ];
    
    // If the value matches any example, treat it as a placeholder
    return examples.some(ex => ex && value.trim() === ex);
  };

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
                    <div className="space-y-1">
                      <Field
                        label="Full name"
                        value={cv.fullName}
                        placeholder={fieldInstructions.fullName.placeholder}
                        onChange={(v) =>
                          setCv((prev) => ({ ...prev, fullName: v }))
                        }
                      />
                      <p className="text-xs text-stone-400">{fieldInstructions.fullName.hint}</p>
                    </div>

                    <div className="space-y-1">
                      <Field
                        label="Professional title"
                        value={cv.title}
                        placeholder={fieldInstructions.title.placeholder}
                        onChange={(v) =>
                          setCv((prev) => ({ ...prev, title: v }))
                        }
                      />
                      <p className="text-xs text-stone-400">{fieldInstructions.title.hint}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <Field
                          label="Email"
                          type="email"
                          value={cv.email}
                          placeholder={fieldInstructions.email.placeholder}
                          onChange={(v) =>
                            setCv((prev) => ({ ...prev, email: v }))
                          }
                        />
                        <p className="text-xs text-stone-400">{fieldInstructions.email.hint}</p>
                      </div>
                      <div className="space-y-1">
                        <Field
                          label="Phone"
                          value={cv.phone}
                          placeholder={fieldInstructions.phone.placeholder}
                          onChange={(v) =>
                            setCv((prev) => ({ ...prev, phone: v }))
                          }
                        />
                        <p className="text-xs text-stone-400">{fieldInstructions.phone.hint}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <Field
                          label="Location"
                          value={cv.location}
                          placeholder={fieldInstructions.location.placeholder}
                          onChange={(v) =>
                            setCv((prev) => ({ ...prev, location: v }))
                          }
                        />
                        <p className="text-xs text-stone-400">{fieldInstructions.location.hint}</p>
                      </div>
                      <div className="space-y-1">
                        <Field
                          label="Website"
                          value={cv.website}
                          placeholder={fieldInstructions.website.placeholder}
                          onChange={(v) =>
                            setCv((prev) => ({ ...prev, website: v }))
                          }
                        />
                        <p className="text-xs text-stone-400">{fieldInstructions.website.hint}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <TextArea
                        label="Professional summary"
                        rows={4}
                        value={cv.summary}
                        placeholder={fieldInstructions.summary.placeholder}
                        onChange={(v) =>
                          setCv((prev) => ({ ...prev, summary: v }))
                        }
                      />
                      <p className="text-xs text-stone-400">{fieldInstructions.summary.hint}</p>
                    </div>
                  </>
                )}

                {section.key === "experience" && (
                  <div className="space-y-2">
                    <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 p-3">
                      <p className="text-xs text-stone-500">
                        <span className="font-medium">💡 Tip:</span> Add each role chronologically. Include your title, company, 
                        dates, and 3-5 key achievements. Start bullet points with action verbs like "Led", "Built", "Designed", or "Implemented".
                      </p>
                    </div>
                    <ExperienceEditor
                      items={cv.experience}
                      onChange={(items) =>
                        setCv((prev) => ({ ...prev, experience: items }))
                      }
                    />
                  </div>
                )}

                {section.key === "education" && (
                  <div className="space-y-2">
                    <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 p-3">
                      <p className="text-xs text-stone-500">
                        <span className="font-medium">💡 Tip:</span> List your most recent education first. Include degrees, 
                        institutions, graduation years, and any relevant coursework or achievements.
                      </p>
                    </div>
                    <EducationEditor
                      items={cv.education}
                      onChange={(items) =>
                        setCv((prev) => ({ ...prev, education: items }))
                      }
                    />
                  </div>
                )}

                {section.key === "skills" && (
                  <div className="space-y-2">
                    <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 p-3">
                      <p className="text-xs text-stone-500">
                        <span className="font-medium">💡 Tip:</span> Add 8-15 relevant skills. Mix technical skills (e.g., React, Python) 
                        with soft skills (e.g., Leadership, Communication). Use keywords from job descriptions you're targeting.
                      </p>
                    </div>
                    <SkillsEditor
                      skills={cv.skills}
                      onChange={(skills) =>
                        setCv((prev) => ({ ...prev, skills }))
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}