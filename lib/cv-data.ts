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
}

export type TemplateId = "folio" | "ledger" | "slab";

export type Density = "compact" | "normal" | "roomy";

let idCounter = 0;
export const uid = () => `item-${Date.now().toString(36)}-${idCounter++}`;

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
};

export const sampleCV: CVData = {
  fullName: "Maya Okafor",
  title: "Senior Product Designer",
  email: "maya.okafor@example.com",
  phone: "+44 7700 900 321",
  location: "London, UK",
  website: "mayaokafor.design",
  summary:
    "Product designer with eight years of experience turning complicated workflows into calm, legible software. I work across research, interface design, and design systems, and I ship with engineers rather than handing off over walls.",
  experience: [
    {
      id: "exp-1",
      role: "Senior Product Designer",
      company: "Northwind Studio",
      location: "London",
      start: "2022",
      end: "Present",
      bullets:
        "Led the redesign of the client onboarding flow, cutting drop-off from 41% to 18% over two quarters.\nBuilt and documented a 120-component design system adopted by four product teams.\nRan fortnightly usability sessions and turned findings into prioritised design changes.",
    },
    {
      id: "exp-2",
      role: "Product Designer",
      company: "Harbourline",
      location: "Remote",
      start: "2019",
      end: "2022",
      bullets:
        "Designed the merchant dashboard used by 30,000 small businesses daily.\nIntroduced a content-first review process that reduced design review time by half.\nMentored two junior designers through their first end-to-end releases.",
    },
    {
      id: "exp-3",
      role: "UI Designer",
      company: "Field & Form",
      location: "Bristol",
      start: "2017",
      end: "2019",
      bullets:
        "Designed marketing sites and product interfaces for early-stage startups.\nProduced brand identities, including wordmarks, type systems, and print collateral.",
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
  skills: [
    "Product Design",
    "Design Systems",
    "User Research",
    "Prototyping",
    "Figma",
    "Accessibility",
    "Typography",
    "Workshop Facilitation",
  ],
};

/** Data returned by the simulated CV-upload extraction. */
export const extractedCV: CVData = {
  fullName: "Daniel Reyes",
  title: "Frontend Engineer",
  email: "daniel.reyes@example.com",
  phone: "+34 612 345 678",
  location: "Valencia, Spain",
  website: "danielreyes.dev",
  summary:
    "Frontend engineer focused on building fast, accessible interfaces with React and TypeScript. I care about performance budgets, progressive enhancement, and design systems that engineers actually enjoy using.",
  experience: [
    {
      id: "ext-exp-1",
      role: "Frontend Engineer",
      company: "Cabal Financial",
      location: "Remote",
      start: "2021",
      end: "Present",
      bullets:
        "Rebuilt the account dashboard in Next.js, reducing first load time by 45%.\nMaintained a shared component library used across six internal teams.\nIntroduced visual regression testing to the deployment pipeline.",
    },
    {
      id: "ext-exp-2",
      role: "Junior Web Developer",
      company: "Mercado Studio",
      location: "Valencia",
      start: "2019",
      end: "2021",
      bullets:
        "Built marketing sites and landing pages for e-commerce clients.\nMigrated a legacy jQuery codebase to a modern React stack.",
    },
  ],
  education: [
    {
      id: "ext-edu-1",
      degree: "BSc Computer Science",
      school: "Universitat Politècnica de València",
      start: "2015",
      end: "2019",
      detail: "Graduated with honours. Thesis on rendering performance in web applications.",
    },
  ],
  skills: [
    "React",
    "TypeScript",
    "Next.js",
    "Tailwind CSS",
    "Node.js",
    "Testing",
    "Performance",
    "Accessibility",
  ],
};

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
