// lib/cv-data.ts

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  start: string;
  end: string;
  detail: string;
}

// New section interfaces
export interface LanguageItem {
  id: string;
  name: string;
  proficiency: string;
}

export interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  role: string;
  link?: string;
  technologies?: string;
}

export interface PublicationItem {
  id: string;
  title: string;
  publisher: string;
  date: string;
  link?: string;
  description?: string;
}

export interface CourseItem {
  id: string;
  name: string;
  provider: string;
  date: string;
  link?: string;
}

export interface OrganizationItem {
  id: string;
  name: string;
  role: string;
  start: string;
  end: string;
  description?: string;
}

export interface InterestItem {
  id: string;
  name: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
}

export interface AwardItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface DeclarationItem {
  id: string;
  text: string;
  signature?: string;
  date?: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  content: string;
}

// Section configuration
export interface SectionConfig {
  id: string;
  label: string;
  description: string;
  icon?: string;
  enabled: boolean;
  required: boolean;
}

export interface CVData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  languages: LanguageItem[];
  certificates: CertificateItem[];
  projects: ProjectItem[];
  publications: PublicationItem[];
  courses: CourseItem[];
  organizations: OrganizationItem[];
  interests: InterestItem[];
  references: ReferenceItem[];
  awards: AwardItem[];
  declaration: DeclarationItem[];
  custom: CustomSectionItem[];
  sectionOrder: string[];
}

export type TemplateId = "folio" | "ledger" | "slab";
export type Density = "compact" | "normal" | "roomy";

let idCounter = 0;
export const uid = () => `item-${Date.now().toString(36)}-${idCounter++}`;

// ============================================================
// TAILORING TYPES
// ============================================================

export type TailorMatchReport = {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  companyName: string | null;
  roleTitle: string | null;
  summaryChange: {
    original: string;
    tailored: string;
  } | null;
  skillsChange: {
    original: string[];
    tailored: string[];
    movedToBottom: string[];
  } | null;
};

// ✅ ADD THIS - templates export
export const templates: {
  id: TemplateId;
  name: string;
  description: string;
}[] = [
  {
    id: "folio",
    name: "Folio",
    description: "Single-column editorial with rules and serif-style headings.",
  },
  {
    id: "ledger",
    name: "Ledger",
    description: "Two-column layout with a dark side rail for contact and skills.",
  },
  {
    id: "slab",
    name: "Slab",
    description: "Mono labels, indented rules, and generous whitespace.",
  },
];

// All available sections
export const AVAILABLE_SECTIONS: SectionConfig[] = [
  { id: "summary", label: "Summary", description: "Add a short summary of your key strengths, experience, and career goals.", enabled: true, required: true },
  { id: "experience", label: "Professional Experience", description: "Add your professional roles and employer history including internships.", enabled: true, required: true },
  { id: "education", label: "Education", description: "Add your degrees and schools. Include your focus, honors, or exchange terms.", enabled: true, required: true },
  { id: "skills", label: "Skills", description: "Add your hard and soft skills that help you stand out from the crowd today.", enabled: true, required: true },
  { id: "languages", label: "Languages", description: "Add your languages and proficiency level to show your communication range.", enabled: false, required: false },
  { id: "certificates", label: "Certificates", description: "Add your industry certificates or licences. Include issuer and date earned.", enabled: false, required: false },
  { id: "projects", label: "Projects", description: "Add key projects you participated in and highlight your challenges, role, and impact.", enabled: false, required: false },
  { id: "publications", label: "Publications", description: "Add publications, articles, or books you wrote or contributed to.", enabled: false, required: false },
  { id: "courses", label: "Courses", description: "Add online or in-person courses and trainings you joined and completed.", enabled: false, required: false },
  { id: "organizations", label: "Organizations", description: "Add your memberships or volunteering with organisations including your role.", enabled: false, required: false },
  { id: "interests", label: "Interests", description: "Add relevant personal interests that support your career story and cultural fit.", enabled: false, required: false },
  { id: "references", label: "References", description: "Add your references from managers or coworkers, including their contact details.", enabled: false, required: false },
  { id: "awards", label: "Awards", description: "Add your awards and recognitions from industry, competitions, or academia.", enabled: false, required: false },
  { id: "declaration", label: "Declaration", description: "Add your declaration by creating or uploading your personal signature.", enabled: false, required: false },
  { id: "custom", label: "Custom", description: "Add a custom section for anything else, or combine sections cleanly.", enabled: false, required: false },
];

export const DEFAULT_SECTION_ORDER: string[] = [
  "summary",
  "experience",
  "education",
  "skills",
  "languages",
  "certificates",
  "projects",
  "publications",
  "courses",
  "organizations",
  "interests",
  "references",
  "awards",
  "declaration",
  "custom"
];

export const emptyCV: CVData = {
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  summary: "",
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certificates: [],
  projects: [],
  publications: [],
  courses: [],
  organizations: [],
  interests: [],
  references: [],
  awards: [],
  declaration: [],
  custom: [],
  sectionOrder: DEFAULT_SECTION_ORDER,
};

export const sampleCV: CVData = {
  fullName: "Maya Okafor",
  title: "Senior Product Designer",
  email: "maya.okafor@example.com",
  phone: "+44 7700 900 321",
  location: "London, UK",
  website: "mayaokafor.design",
  summary: "Product designer with eight years of experience turning complicated workflows into calm, legible software. I work across research, interface design, and design systems, and I ship with engineers rather than handing off over walls.",
  experience: [
    {
      id: "exp-1",
      role: "Senior Product Designer",
      company: "Northwind Studio",
      location: "London",
      start: "2022",
      end: "Present",
      bullets: "Led the redesign of the client onboarding flow, cutting drop-off from 41% to 18% over two quarters.\nBuilt and documented a 120-component design system adopted by four product teams.\nRan fortnightly usability sessions and turned findings into prioritised design changes.",
    },
    {
      id: "exp-2",
      role: "Product Designer",
      company: "Harbourline",
      location: "Remote",
      start: "2019",
      end: "2022",
      bullets: "Designed the merchant dashboard used by 30,000 small businesses daily.\nIntroduced a content-first review process that reduced design review time by half.\nMentored two junior designers through their first end-to-end releases.",
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "BA (Hons) Graphic Design",
      school: "University of the Arts London",
      start: "2013",
      end: "2016",
      detail: "First-class honours. Final project on accessible civic information design.",
    },
  ],
  skills: ["Product Design", "Design Systems", "User Research", "Prototyping", "Figma", "Accessibility", "Typography", "Workshop Facilitation"],
  languages: [],
  certificates: [],
  projects: [],
  publications: [],
  courses: [],
  organizations: [],
  interests: [],
  references: [],
  awards: [],
  declaration: [],
  custom: [],
  sectionOrder: DEFAULT_SECTION_ORDER,
};

export type SectionDataMap = {
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  languages: LanguageItem[];
  certificates: CertificateItem[];
  projects: ProjectItem[];
  publications: PublicationItem[];
  courses: CourseItem[];
  organizations: OrganizationItem[];
  interests: InterestItem[];
  references: ReferenceItem[];
  awards: AwardItem[];
  declaration: DeclarationItem[];
  custom: CustomSectionItem[];
};