# myDoc

A professional document and CV template platform. Users either fill in their details or upload an existing CV — the system extracts the data and maps it into a clean, printable template.

This repository contains the complete frontend: landing page, user dashboard, and the split-screen document builder with a live A4 preview.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Pages

| Route        | View                                                                 |
| ------------ | -------------------------------------------------------------------- |
| `/`          | Landing page — hero, how-it-works, feature showcase, CTA            |
| `/dashboard` | Returning user view — sidebar navigation and recent documents list   |
| `/builder`   | The editor — content/template/settings panels and live document preview |
| `/builder?upload=1` | Opens the builder with the upload dropzone highlighted       |

## Builder features

- **Upload dropzone** — drag in a PDF/DOCX; extraction is simulated in this demo and maps the document into the CV schema (Name, Experience, Education, Skills), auto-filling every field.
- **Content accordion** — Personal Details, Work Experience, Education, and a tag-based Skills editor. The preview updates as you type.
- **Templates** — three layouts (`Folio` editorial, `Ledger` two-column with dark side rail, `Slab` monospaced) with CSS-built thumbnails; content reflows when switching.
- **Settings** — document name, page size (A4 / Letter), content density, and preview preferences.
- **Live A4 preview** — the page renders at true print dimensions and scales to fit the panel. **Download PDF** opens the browser print dialog with print CSS that hides all app chrome and outputs only the page at real size.

## Design system

Strict rules, no generic SaaS look:

- **Palette** — warm off-white `stone-50` / `#FAFAF9`, ink `stone-900` / `#1C1917`, terracotta primary `orange-700` / `#C2410C`, warm gray borders `stone-200` / `#E7E5E4`.
- **Depth** — no box-shadows anywhere; 1px solid borders only. Flat buttons that simply darken on hover.
- **Typography** — Plus Jakarta Sans for headings (`font-display`, tight −0.02em tracking), Geist for body text (`font-sans`, 1.6–1.8 line height).
- **Layout** — left-aligned by default; only the hero is centered. Asymmetrical 2-column sections instead of card grids.
- **Imagery** — Lucide SVG icons only; every visual is a CSS/HTML wireframe. No emojis, stock photos, or illustrations.
- **Motion** — no scroll-reveal or fade-in animations.

## Tech stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS 3**
- **Lucide React** icons
- Fonts self-hosted via `@fontsource-variable` (Plus Jakarta Sans, Geist)
