export type RichDocNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichDocNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
};

export type RichDocContent = {
  doc: RichDocNode;
  schemaVersion: 1;
  fontFamily?: string;
};

export const DOC_FONTS: {
  id: string;
  name: string;
  css: string;
}[] = [
  { id: "geist",     name: "Geist",            css: "'Geist', system-ui, sans-serif" },
  { id: "arial",     name: "Arial",            css: "Arial, Helvetica, sans-serif" },
  { id: "helvetica", name: "Helvetica",        css: "Helvetica, Arial, sans-serif" },
  { id: "calibri",   name: "Calibri",          css: "Calibri, Carlito, Arial, sans-serif" },
  { id: "verdana",   name: "Verdana",          css: "Verdana, Geneva, sans-serif" },
  { id: "trebuchet", name: "Trebuchet MS",     css: "'Trebuchet MS', Tahoma, sans-serif" },
  { id: "georgia",   name: "Georgia",          css: "Georgia, 'Times New Roman', serif" },
  { id: "times",     name: "Times New Roman",  css: "'Times New Roman', Times, serif" },
  { id: "garamond",  name: "Garamond",         css: "Garamond, Georgia, serif" },
  { id: "cambria",   name: "Cambria",          css: "Cambria, Georgia, serif" },
  { id: "courier",   name: "Courier New",      css: "'Courier New', Courier, monospace" },
];

export const DEFAULT_DOC_FONT = "geist";

export function getDocFontCss(id: string | undefined): string {
  return (
    DOC_FONTS.find((f) => f.id === id)?.css ??
    DOC_FONTS.find((f) => f.id === DEFAULT_DOC_FONT)!.css
  );
}

export function emptyDocBody(): RichDocNode {
  return {
    type: "doc",
    content: [{ type: "paragraph" }],
  };
}

export function emptyDocContent(): RichDocContent {
  return { doc: emptyDocBody(), schemaVersion: 1 };
}

export function isRichDocContent(value: unknown): value is RichDocContent {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.schemaVersion === 1 &&
    typeof v.doc === "object" &&
    v.doc !== null &&
    (v.doc as Record<string, unknown>).type === "doc"
  );
}

export type DocTemplateId =
  | "blank"
  | "project-brief"
  | "report"
  | "meeting-notes"
  | "invoice";

export type DocTemplate = {
  id: DocTemplateId;
  name: string;
  description: string;
  build: () => RichDocNode;
};

function heading(level: 1 | 2 | 3, text: string): RichDocNode {
  return {
    type: "heading",
    attrs: { level },
    content: [{ type: "text", text }],
  };
}

function paragraph(text: string): RichDocNode {
  return {
    type: "paragraph",
    content: [{ type: "text", text }],
  };
}

function ghostParagraph(hint: string): RichDocNode {
  return {
    type: "paragraph",
    attrs: { placeholder: hint },
  };
}

function ghostBulletList(hints: string[]): RichDocNode {
  return {
    type: "bulletList",
    content: hints.map((hint) => ({
      type: "listItem",
      content: [ghostParagraph(hint)],
    })),
  };
}

function horizontalRule(): RichDocNode {
  return { type: "horizontalRule" };
}

export const docTemplates: DocTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start from an empty page.",
    build: emptyDocBody,
  },
  {
    id: "project-brief",
    name: "Project Brief",
    description: "Goals, scope, deliverables, and success criteria.",
    build: () => ({
      type: "doc",
      content: [
        heading(1, "Project Brief"),
        ghostParagraph("A one-line summary of the project"),
        heading(2, "Goals"),
        ghostBulletList([
          "Primary goal",
          "Secondary goal",
          "What success looks like",
        ]),
        heading(2, "Scope"),
        ghostParagraph("What is in scope, and what is out of scope"),
        heading(2, "Deliverables"),
        ghostBulletList(["Deliverable", "Deliverable", "Deliverable"]),
        heading(2, "Timeline"),
        ghostParagraph("Key milestones and dates"),
        heading(2, "Stakeholders"),
        ghostBulletList(["Owner", "Contributors", "Reviewers"]),
      ],
    }),
  },
  {
    id: "report",
    name: "Report",
    description: "Structured findings with clear sections.",
    build: () => ({
      type: "doc",
      content: [
        heading(1, "Report"),
        ghostParagraph("Prepared by, date"),
        heading(2, "Summary"),
        ghostParagraph("A short executive summary of the report"),
        heading(2, "Background"),
        ghostParagraph("Context and why this report exists"),
        heading(2, "Findings"),
        ghostBulletList(["Finding", "Finding", "Finding"]),
        heading(2, "Recommendations"),
        ghostBulletList(["Recommendation", "Recommendation"]),
        heading(2, "Appendix"),
        ghostParagraph("Supporting data, references, or notes"),
      ],
    }),
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    description: "Agenda, notes, decisions, and action items.",
    build: () => ({
      type: "doc",
      content: [
        heading(1, "Meeting Notes"),
        ghostParagraph("Date and attendees"),
        heading(2, "Agenda"),
        ghostBulletList(["Topic", "Topic", "Topic"]),
        heading(2, "Notes"),
        ghostParagraph("Discussion points"),
        heading(2, "Decisions"),
        ghostBulletList(["Decision", "Decision"]),
        heading(2, "Action Items"),
        ghostBulletList([
          "Owner, task, due date",
          "Owner, task, due date",
        ]),
      ],
    }),
  },
  {
    id: "invoice",
    name: "Invoice",
    description: "Bill a client with line items, totals, and payment details.",
    build: () => ({
      type: "doc",
      content: [
        heading(1, "Invoice"),

        heading(2, "From"),
        ghostParagraph("Your name, company, and address"),

        heading(2, "Billing to"),
        ghostParagraph("Client name and address"),

        heading(2, "Invoice details"),
        ghostBulletList([
          "Invoice number: INV-001",
          "Date issued: 11 October 2026",
          "Due date: 25 October 2026",
        ]),

        horizontalRule(),

        heading(2, "Line items"),
        ghostBulletList([
          "Service or product - $0.00",
          "Service or product - $0.00",
          "Service or product - $0.00",
        ]),

        horizontalRule(),

        heading(2, "Totals"),
        paragraph("Subtotal: $0.00"),
        paragraph("Tax (0%): $0.00"),
        paragraph("Total: $0.00"),

        horizontalRule(),

        heading(2, "Payment details"),
        ghostParagraph("Bank name, account number, or payment link"),

        heading(2, "Notes"),
        ghostParagraph("Thank you for your business"),
      ],
    }),
  },
];

export function getDocTemplate(id: string): DocTemplate {
  return docTemplates.find((t) => t.id === id) ?? docTemplates[0];
}