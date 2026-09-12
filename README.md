# myDoc

A modern CV builder that turns an uploaded resume into a clean, editable, ATS-friendly document.

Users can upload an existing PDF or Word CV, let AI map it into structured fields, fine tune the content in a live editor, and download a polished PDF. A built in tailoring flow lets users paste a job description and get a version of their CV rewritten to match, without inventing skills or experience.

## Features

### CV Upload and Parsing
- Upload PDF or DOCX files up to 10 MB
- Extract text on the client and parse it into structured data using Groq AI
- Automatic fallback to a local regex parser if the AI call fails
- Extract name, title, email, phone, location, website, summary, experience, education, and skills

### Live Editor
- Live preview of the CV at A4 or Letter size
- Three templates: Folio, Ledger, and Slab
- Editable sections for personal details, experience, education, skills, and more
- Additional sections available on demand: languages, certificates, projects, publications, courses, organizations, interests, references, awards, declaration, and custom
- Adjustable bullet style (dot, dash, or none) and spacing (compact, normal, or roomy)

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
- Unified session across all three methods

### Persistence
- Auto save to the cloud for signed in users
- Local storage backup while editing
- Every CV belongs to a user account

## Tech Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS
- Neon Postgres for persistent storage
- Auth.js (NextAuth v5) for authentication
- Groq SDK for AI parsing and tailoring
- pdfjs-dist for PDF text extraction
- Mammoth for DOCX text extraction

## Running Locally

### Prerequisites
- Node.js 20 or newer
- A Neon account for the Postgres database
- A Groq API key for AI parsing and tailoring
- Optional: Google OAuth credentials
- Optional: GitHub OAuth credentials

### Setup

Clone the repository and install dependencies:

git clone https://github.com/Emmy1223/myDoc.git
cd myDoc
npm install

Create a file named .env.local in the project root with the following keys:

DATABASE_URL="postgresql://..."
AUTH_SECRET="a random base64 string"
AUTH_URL="http://localhost:3000"
GROQ_API_KEY="gsk_..."
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
AUTH_GITHUB_ID="..."
AUTH_GITHUB_SECRET="..."

Generate an auth secret with:

node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

Run the development server:

npm run dev

Open http://localhost:3000 in your browser.

To create a production build:

npm run build
npm start

## Environment Variables

Every variable below is required unless noted otherwise.

| Name | Purpose |
|------|---------|
| DATABASE_URL | Postgres connection string from Neon |
| AUTH_SECRET | Secret used to sign sessions, generate with the command above |
| AUTH_URL | Base URL of the app |
| GROQ_API_KEY | API key for AI parsing and tailoring |
| AUTH_GOOGLE_ID | Google OAuth client ID, optional |
| AUTH_GOOGLE_SECRET | Google OAuth client secret, optional |
| AUTH_GITHUB_ID | GitHub OAuth client ID, optional |
| AUTH_GITHUB_SECRET | GitHub OAuth client secret, optional |

## Project Structure

app/
  api/
    auth/         Authentication endpoints, custom login, and Auth.js
    dashboard/    Dashboard data endpoint
    documents/    Document CRUD endpoints
    parse-cv/     AI CV parsing endpoint
    tailor-cv/    AI tailoring and save endpoints
  builder/        The CV editor
  dashboard/      User dashboard
    tailor/       The Tailor to a Job flow
  login/          Sign in and sign up

components/
  auth/           Login and sign out components
  builder/        Editor, preview, and template renderers
  dashboard/      Dashboard shell and sidebar
  tailor/         Tailoring wizard components

lib/
  auth.ts           Auth.js configuration
  cv-data.ts        Types and default data
  server-db.ts      Database helpers
  session.ts        Session helpers
  tailor-prompt.ts  AI prompts for the tailoring flow

## How the AI Parser Works

1. The user uploads a PDF or DOCX
2. Text is extracted in the browser
3. The text is sent to /api/parse-cv
4. The endpoint calls Groq with a strict JSON schema
5. The response is normalized and validated
6. If the AI call fails, the client falls back to a local regex parser

## How the Tailoring Flow Works

1. The user picks a source CV
2. The user pastes a job description
3. /api/tailor-cv analyzes the CV against the job and returns a match report
4. /api/tailor-cv/save creates a new document with the tailored summary and skills
5. The user is redirected to the builder with the print dialog open

The AI is explicitly forbidden from inventing skills, experience, titles, dates, or companies. It may only add a skill when there is evidence in the CV itself.

## How Auto-Fit Works

1. The rendered CV is measured offscreen at the normal density
2. If it exceeds two pages, the CV is measured again at compact density
3. If compact also exceeds two pages, a stricter tier is applied
4. If even the strictest tier overflows, a warning banner appears and the user is asked to trim content

The system never shrinks text below readable sizes. The goal is a two page CV, but the honest answer when content is too long is to reduce content, not font size.

## Scripts

npm run dev       Start the development server
npm run build     Create a production build
npm start         Start the production server
npm run lint      Run the linter

## License

This project is unlicensed and currently maintained for personal use. If you would like to use it, please reach out first.

## Contact

Emmanuel Faleti
GitHub: https://github.com/Emmy1223
