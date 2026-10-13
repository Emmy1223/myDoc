# myDoc

A CV and document workspace. Build a resume, write a project brief, convert a PDF, share a document as a link.

Users can upload an existing CV, let AI map it into structured fields, fine tune the content in a live editor, and export a clean, ATS-friendly PDF. The same workspace is a full rich-text document editor for project briefs, reports, meeting notes, and invoices. Any document can be shared as a public link without requiring viewers to sign in.

## Features

### CV Upload and Parsing
- Upload PDF or DOCX files up to 10 MB
- Extract text on the client and parse it into structured data using Groq AI
- Automatic fallback to a local regex parser if the AI call fails
- Extract name, title, email, phone, location, website, LinkedIn, summary, experience, education, and skills

### Live Editor
- Live preview of the CV at A4 or Letter size
- Six CV templates: Folio, Ledger, Slab, Compact, Editorial, and Modern
- Editable sections for personal details, experience, education, skills, and more
- Additional sections available on demand: languages, certificates, projects, publications, courses, organizations, interests, references, awards, declaration, and custom
- Adjustable bullet style (dot, dash, or none) and spacing (compact, normal, or roomy)

### CV Templates
- **Folio**: single column editorial layout with rules and strong hierarchy
- **Ledger**: two column layout with a dark side rail for contact, skills, and education
- **Slab**: mono labels, indented rules, and generous whitespace
- **Compact**: dense two column layout designed to fit long careers on two pages
- **Editorial**: magazine inspired layout with serif headings and a two column summary
- **Modern**: clean sans serif layout with accent rules, timeline dots, and skill chips

### Document Editor
- Full rich-text editor built on Tiptap
- Document templates: Blank, Project Brief, Report, Meeting Notes, and Invoice
- Headings, bold, italic, underline, strike, lists, quotes, code, links, and alignment
- Autosave with debounced writes to the database
- Responsive A4 canvas that scales to fit any screen

### Public Sharing
- Turn any CV or document into a public link with a single click
- Share URLs are unique tokens, not predictable IDs
- Viewers do not need an account
- Regenerate the link to invalidate the old one
- Revoke sharing at any time

### PDF to Word
- Upload a PDF and download an editable Word document
- Runs entirely in the browser, no upload or server round trip
- Uses pdfjs-dist for extraction and the docx library for generation
- Best for text-based PDFs; scanned documents are not supported
- iOS Safari uses the main-thread fallback for compatibility

### Auto-Fit to Two Pages
- Measures the rendered CV automatically
- Cascades through density tiers (normal then compact) until the CV fits on two pages
- Applies a stricter compression pass as a final tier
- Shows a clear warning if the CV still exceeds two pages, suggesting content trimming rather than more aggressive shrinking

### Tailor to a Job
- Paste a job description and get a version of the CV rewritten to match
- Match score with matched and missing keywords
- Profile summary and skills rewritten to emphasize relevance
- AI may only add skills when there is evidence in the CV itself
- Never fabricates experience, titles, dates, or companies
- Creates a new document without touching the original
- Auto-opens the print dialog with the tailored CV

### Authentication
- Email and password sign up and sign in
- Google OAuth
- GitHub OAuth
- LinkedIn OAuth
- Unified session across all four methods

### Push Notifications
- Install myDoc as an app on iOS, Android, and desktop
- Web Push API with VAPID keys
- Subscriptions stored in the database
- Admin broadcast page at /admin/notifications
- User opt-in modal on first dashboard visit and toggle in Settings

### Search
- Search documents by title on the dashboard
- Compact search inside the Write page rail
- Live filtering as you type

### Persistence
- Auto save to the cloud for signed in users
- Local storage backup while editing
- Every CV and document belongs to a user account

### Landing Page
- Public marketing site at the root route
- Session aware navigation that shows different actions for signed in vs signed out users
- Full product breakdown including how it works, feature grid, roadmap, pricing, and FAQ

## Tech Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS
- Neon Postgres for persistent storage
- Auth.js (NextAuth v5) for authentication
- Groq SDK for AI parsing and tailoring
- Tiptap for the rich-text document editor
- pdfjs-dist for PDF text extraction and conversion
- Mammoth for DOCX text extraction
- docx for generating Word documents
- web-push for browser push notifications

## Running Locally

### Prerequisites
- Node.js 20 or newer
- A Neon account for the Postgres database
- A Groq API key for AI parsing and tailoring
- Optional: Google OAuth credentials
- Optional: GitHub OAuth credentials
- Optional: LinkedIn OAuth credentials
- Optional: VAPID keys for push notifications

### Setup

Clone the repository and install dependencies:

```
git clone https://github.com/Emmy1223/myDoc.git
cd myDoc
npm install
```

Create a file named `.env.local` in the project root:

```
# Database
DATABASE_URL="postgresql://..."

# Auth
AUTH_SECRET="a random base64 string"
AUTH_URL="http://localhost:3000"

# AI
GROQ_API_KEY="gsk_..."

# OAuth (optional)
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
AUTH_GITHUB_ID="..."
AUTH_GITHUB_SECRET="..."
LINKEDIN_CLIENT_ID="..."
LINKEDIN_CLIENT_SECRET="..."

# Push notifications (optional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:you@example.com"

# App URL (used for share links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Admin
ADMIN_EMAILS="you@example.com"
```

Generate an auth secret with:

```
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Run the development server:

```
npm run dev
```

Open http://localhost:3000 in your browser.

To create a production build:

```
npm run build
npm start
```

## Environment Variables

| Name | Purpose | Required |
|------|---------|----------|
| DATABASE_URL | Postgres connection string from Neon | Yes |
| AUTH_SECRET | Secret used to sign sessions | Yes |
| AUTH_URL | Base URL of the app | Yes |
| GROQ_API_KEY | API key for AI parsing and tailoring | Yes |
| AUTH_GOOGLE_ID | Google OAuth client ID | No |
| AUTH_GOOGLE_SECRET | Google OAuth client secret | No |
| AUTH_GITHUB_ID | GitHub OAuth client ID | No |
| AUTH_GITHUB_SECRET | GitHub OAuth client secret | No |
| LINKEDIN_CLIENT_ID | LinkedIn OAuth client ID | No |
| LINKEDIN_CLIENT_SECRET | LinkedIn OAuth client secret | No |
| NEXT_PUBLIC_VAPID_PUBLIC_KEY | VAPID public key for push notifications | No |
| VAPID_PRIVATE_KEY | VAPID private key for push notifications | No |
| VAPID_SUBJECT | Contact for push services (mailto: or URL) | No |
| NEXT_PUBLIC_APP_URL | Public URL used to build share links | Yes for sharing |
| ADMIN_EMAILS | Comma separated list of admin emails | No |

## Project Structure

```
app/
  page.tsx              Public landing page
  api/
    auth/               Authentication endpoints and Auth.js
    dashboard/          Dashboard data endpoint
    documents/          Document CRUD endpoints
    parse-cv/           AI CV parsing endpoint
    tailor-cv/          AI tailoring and save endpoints
    push/               Push notification subscribe and send endpoints
    share/              Public share link read endpoint
  admin/
    page.tsx            Admin overview
    notifications/      Admin push broadcast page
  builder/              The CV editor
  dashboard/            User dashboard
    tailor/             The Tailor to a Job flow
    write/              The rich-text document editor
    convert/            PDF to Word (beta)
  d/[token]/            Public shared document view
  login/                Sign in and sign up
  privacy/              Privacy policy
  settings/             User settings
  terms/                Terms of service

components/
  auth/                 Login and sign out components
  builder/
    doc/                Rich-text document editor
    ...                 CV editor, preview, and template renderers
  dashboard/            Dashboard shell, sidebar, document list, share dialog
  marketing/            Landing page sections
  share/                Public viewer components
  tailor/               Tailoring wizard components
  tools/                PDF to Word client

lib/
  auth.ts               Auth.js configuration
  cv-data.ts            CV types, templates, and default data
  doc-data.ts           Rich-document types and templates
  server-db.ts          Database helpers
  session.ts            Session helpers
  onboarding-prompt.ts  AI prompt for the CV onboarding chat
  tailor-prompt.ts      AI prompts for the tailoring flow
  pdf-to-docx.ts        PDF to Word conversion
```

## How the AI Parser Works

1. The user uploads a PDF or DOCX
2. Text is extracted in the browser
3. The text is sent to `/api/parse-cv`
4. The endpoint calls Groq with a strict JSON schema
5. The response is normalized and validated
6. If the AI call fails, the client falls back to a local regex parser

## How the Tailoring Flow Works

1. The user picks a source CV
2. The user pastes a job description
3. `/api/tailor-cv` analyzes the CV against the job and returns a match report
4. `/api/tailor-cv/save` creates a new document with the tailored summary and skills
5. The user is redirected to the builder with the print dialog open

The AI is explicitly forbidden from inventing skills, experience, titles, dates, or companies. It may only add a skill when there is evidence in the CV itself.

## How Auto-Fit Works

1. The rendered CV is measured offscreen at the normal density
2. If it exceeds two pages, the CV is measured again at compact density
3. If compact also exceeds two pages, a stricter tier is applied
4. If even the strictest tier overflows, a warning banner appears and the user is asked to trim content

The system never shrinks text below readable sizes. The goal is a two page CV, but the honest answer when content is too long is to reduce content, not font size.

## How Public Sharing Works

1. The user opens the Share dialog from a document's row menu
2. Clicking Create share link generates a 16-character token and stores it in the database
3. The share URL is `{NEXT_PUBLIC_APP_URL}/d/{token}`
4. Anyone with the link can view the document at `/d/[token]` without signing in
5. Regenerating creates a new token and invalidates the old one
6. Turning sharing off sets a flag and the old link returns 404

## How Push Notifications Work

1. The user enables notifications from Settings or the opt-in modal
2. The service worker (`public/sw.js`) registers
3. The browser creates a push subscription using the VAPID public key
4. The subscription is stored in the `push_subscriptions` table
5. An admin sends a broadcast from `/admin/notifications`
6. The server signs and sends each message via the web-push library
7. The service worker receives the push and displays a notification

On iOS, push only works when the app is installed to the home screen.

```

## License

This project is unlicensed and currently maintained for personal use. If you would like to use it, please reach out first.

## Contact

Emmanuel Faleti
GitHub: https://github.com/Emmy1223
LinkedIn: https://www.linkedin.com/company/mydoc-official
