"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileText, Loader2, CheckCircle2, X, AlertCircle } from "lucide-react";

export type UploadState = "idle" | "extracting" | "done" | "error";

export default function Dropzone({
  onExtracted,
  highlight,
  onHighlightClear,
}: {
  onExtracted: (fileName: string, extractedData: any) => void;
  highlight: boolean;
  onHighlightClear: () => void;
}) {
  const [state, setState] = useState<UploadState>("idle");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File is too large. Maximum size is 10MB.");
      setState("error");
      return;
    }

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      setErrorMessage("Please upload a PDF or Word document.");
      setState("error");
      return;
    }

    setFileName(file.name);
    setState("extracting");
    setErrorMessage(null);
    onHighlightClear();

    try {
      let extractedText = "";

      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        extractedText = await extractTextFromPDF(file);
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
        try {
          const mammoth = await import("mammoth");
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          extractedText = result.value;
        } catch {
          extractedText = await file.text();
        }
      } else {
        extractedText = await file.text();
      }

      if (!extractedText || extractedText.trim().length === 0) {
        extractedText = await file.text();
      }

            console.log("Raw extracted text:", extractedText.substring(0, 1000));

      // ============================================================
      // AI PARSING (primary) → regex fallback
      // ============================================================
      let structuredData: any = null;

      try {
        const response = await fetch("/api/parse-cv", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: extractedText }),
        });

        if (response.ok) {
          const json = await response.json();
          if (json?.data) {
            structuredData = json.data;
            console.log("✅ AI parser succeeded");
          } else {
            console.warn("AI parser returned no data, falling back");
          }
        } else {
          console.warn(
            "AI parser failed with status",
            response.status,
            "— falling back to regex",
          );
        }
      } catch (err) {
        console.warn("AI parser network error, falling back to regex:", err);
      }

      // Fallback to local regex parser if AI failed
      if (!structuredData) {
        console.log("⚙️ Using regex fallback parser");
        structuredData = parseCVText(extractedText);
      }

      setState("done");
      onExtracted(file.name, structuredData);
    } catch (error) {
      console.error("Extraction error:", error);
      setErrorMessage("Failed to extract text from the document. Please try again or enter the data manually.");
      setState("error");
    }
  }

  async function extractTextFromPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await import("pdfjs-dist");
      // @ts-ignore
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
      
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }
      
      return fullText;
    } catch (error) {
      console.error("PDF extraction error:", error);
      return await file.text();
    }
  }

  function reset() {
    setState("idle");
    setFileName(null);
    setErrorMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  // Show error state
  if (state === "error") {
    return (
      <div className="border border-red-500 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-800">Extraction failed</p>
            <p className="mt-0.5 text-sm text-red-600">{errorMessage}</p>
          </div>
          <button
            onClick={reset}
            className="border border-red-300 p-1 text-red-500 hover:border-red-500 hover:text-red-700"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  // Show extracting state
  if (state === "extracting") {
    return (
      <div className="border border-rust bg-orange-50 p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-rust" strokeWidth={2} />
          <div>
            <p className="text-sm font-semibold text-ink">
              Extracting your CV…
            </p>
            <p className="mt-0.5 truncate text-xs text-stone-500">
              Reading {fileName} and mapping text into fields
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show done state
  if (state === "done") {
    return (
      <div className="border border-stone-900 bg-white p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-rust" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">CV imported</p>
            <p className="mt-0.5 truncate text-xs text-stone-500">
              {fileName} — content mapped to the template
            </p>
          </div>
          <button
            onClick={reset}
            className="border border-stone-300 p-1 text-stone-500 hover:border-ink hover:text-ink"
            aria-label="Clear uploaded file"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  // Idle state - show dropzone
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      className={`block cursor-pointer border border-dashed p-5 text-center transition-colors ${
        dragging
          ? "border-rust bg-orange-50"
          : highlight
            ? "border-rust bg-orange-50"
            : "border-stone-300 bg-white hover:border-stone-900"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
      />
      <UploadCloud
        className={`mx-auto h-6 w-6 ${dragging || highlight ? "text-rust" : "text-stone-400"}`}
        strokeWidth={1.5}
      />
      <p className="mt-2 text-sm font-semibold text-ink">
        Drag your old CV here to auto-fill
      </p>
      <p className="mt-1 text-xs leading-5 text-stone-500">
        PDF or DOCX, up to 10 MB{" "}
        <span className="mx-1 text-stone-300">·</span> or{" "}
        <span className="inline-flex items-center gap-1 font-semibold text-rust">
          <FileText className="h-3 w-3" strokeWidth={2} />
          browse files
        </span>
      </p>
    </label>
  );
}

// ============================================================
// ROBUST CV PARSER - Handles complex real-world formats
// ============================================================

interface ParsedExperience {
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
}

interface ParsedEducation {
  degree: string;
  school: string;
  start: string;
  end: string;
  detail: string;
}

function parseCVText(text: string) {
  console.log("=== STARTING CV PARSING ===");
  console.log("Raw text length:", text.length);

  // Normalize line endings and clean up
  const rawLines = text
    .split(/\r\n|\r|\n/)
    .map(l => l.replace(/\t/g, ' ').trim())
    .filter(l => l.length > 0);

  console.log("Total lines:", rawLines.length);

  // ============================================================
  // RESULT OBJECT - NOW INCLUDES ALL NEW SECTION FIELDS
  // ============================================================
  const result = {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    summary: "",
    experience: [] as Array<{
      id: string;
      role: string;
      company: string;
      location: string;
      start: string;
      end: string;
      bullets: string;
    }>,
    education: [] as Array<{
      id: string;
      degree: string;
      school: string;
      start: string;
      end: string;
      detail: string;
    }>,
    skills: [] as string[],
    // ============================================================
    // NEW SECTION FIELDS - ALL EMPTY ARRAYS
    // ============================================================
    languages: [] as Array<{
      id: string;
      name: string;
      proficiency: string;
    }>,
    certificates: [] as Array<{
      id: string;
      name: string;
      issuer: string;
      date: string;
      link?: string;
    }>,
    projects: [] as Array<{
      id: string;
      name: string;
      description: string;
      role: string;
      link?: string;
      technologies?: string;
    }>,
    publications: [] as Array<{
      id: string;
      title: string;
      publisher: string;
      date: string;
      link?: string;
      description?: string;
    }>,
    courses: [] as Array<{
      id: string;
      name: string;
      provider: string;
      date: string;
      link?: string;
    }>,
    organizations: [] as Array<{
      id: string;
      name: string;
      role: string;
      start: string;
      end: string;
      description?: string;
    }>,
    interests: [] as Array<{
      id: string;
      name: string;
    }>,
    references: [] as Array<{
      id: string;
      name: string;
      position: string;
      company: string;
      email: string;
      phone: string;
    }>,
    awards: [] as Array<{
      id: string;
      name: string;
      issuer: string;
      date: string;
      description?: string;
    }>,
    declaration: [] as Array<{
      id: string;
      text: string;
      signature?: string;
      date?: string;
    }>,
    custom: [] as Array<{
      id: string;
      title: string;
      content: string;
    }>,
    // Section order - use default
    sectionOrder: [
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
    ],
  };

  const fullText = rawLines.join('\n');

  // ============================================================
  // CONTACT INFO EXTRACTION
  // ============================================================
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = fullText.match(emailRegex);
  if (emailMatch) result.email = emailMatch[0].trim();

  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/;
  const phoneMatch = fullText.match(phoneRegex);
  if (phoneMatch) result.phone = phoneMatch[0].trim();

  // Website / LinkedIn / GitHub
  const urlMatches = fullText.match(/https?:\/\/[^\s]+/g) || [];
  for (const url of urlMatches) {
    const clean = url.replace(/[),;]+$/, '').trim();
    if (/linkedin\.com/i.test(clean) || /github\.com/i.test(clean)) continue;
    if (!result.website && !clean.includes('@')) {
      result.website = clean.replace(/^https?:\/\//, '').replace(/\/$/, '').trim();
    }
  }
  if (!result.website) {
    const wwwMatch = fullText.match(/(?:www\.)[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}[^\s]*/);
    if (wwwMatch) result.website = wwwMatch[0].replace(/\/$/, '').trim();
  }

  // Name: first 2-3 capitalized words in the first few lines
  for (let i = 0; i < Math.min(6, rawLines.length); i++) {
    const line = rawLines[i];
    if (emailRegex.test(line) || phoneRegex.test(line) || /^(www\.|http)/i.test(line)) continue;
    const nameMatch = line.match(/^([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+){1,2})$/);
    if (nameMatch && nameMatch[1].split(/\s+/).length >= 2) {
      result.fullName = nameMatch[1].trim();
      break;
    }
  }
  if (!result.fullName && rawLines.length > 0) {
    const firstWords = rawLines[0].match(/^([A-Z][a-zA-Z'\-]+\s+[A-Z][a-zA-Z'\-]+)/);
    if (firstWords) result.fullName = firstWords[1].trim();
  }

  // Title: look for role keywords in the first 10 lines
  const titleRegex = /(Senior|Lead|Principal|Staff|Junior|Associate|Full\s*Stack|Frontend|Backend|DevOps|Cloud|Security|Data|Machine\s*Learning|AI|Software|Product|UX|UI|Graphic|Web|Mobile|QA|Sales|Marketing|Operations|Project|Program|Technical|Creative|Content|Business|Founder|Co-Founder|CEO|CTO|COO|CFO|VP|Director|Manager|Consultant|Specialist|Engineer|Developer|Architect|Analyst|Scientist|Designer|Owner|Officer|Coordinator|Administrator|Intern)\b/i;
  for (let i = 0; i < Math.min(10, rawLines.length); i++) {
    const line = rawLines[i];
    if (emailRegex.test(line) || phoneRegex.test(line)) continue;
    const m = line.match(titleRegex);
    if (m) {
      result.title = m[0].trim().replace(/\s+at\s+.*$/i, '').trim();
      break;
    }
  }

  // Location: "City, ST" or "City, Country"
  const locationRegex = /\b([A-Z][a-zA-Z'\-]+,\s*[A-Z]{2})\b/;
  const locMatch = fullText.match(locationRegex);
  if (locMatch) result.location = locMatch[1].trim();

  // ============================================================
  // SECTION SPLITTING
  // ============================================================
  const sectionHeaderPatterns: Array<{ key: string; patterns: RegExp[] }> = [
    { key: 'summary', patterns: [/^(summary|profile|about\s*me|professional\s*summary|personal\s*statement|career\s*objective|objective)\s*:?\s*$/i] },
    { key: 'experience', patterns: [/^(experience|work\s*experience|professional\s*experience|employment\s*history|work\s*history|employment|career\s*history|relevant\s*experience|professional\s*background)\s*:?\s*$/i] },
    { key: 'education', patterns: [/^(education|academic\s*background|academic\s*qualifications|qualifications|degrees?|education\s*&\s*training)\s*:?\s*$/i] },
    { key: 'skills', patterns: [/^(skills|technical\s*skills|core\s*competencies|competencies|expertise|technologies|tech\s*stack|tools\s*&\s*technologies)\s*:?\s*$/i] },
  ];

  function normalizeHeader(line: string): string {
    return line
      .replace(/^[\s•·\-–—=*_~|]+/, '')
      .replace(/[\s•·\-–—=*_~|]+$/, '')
      .replace(/^[•·\-–—*]\s*/, '')
      .trim();
  }

  const sections: Record<string, string[]> = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    other: [],
  };

  let currentSection = 'other';
  let foundAnySection = false;

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i];
    const normalized = normalizeHeader(raw);
    const lower = normalized.toLowerCase();

    let matchedSection: string | null = null;
    for (const detector of sectionHeaderPatterns) {
      if (detector.patterns.some(p => p.test(normalized))) {
        matchedSection = detector.key;
        break;
      }
    }

    if (matchedSection) {
      currentSection = matchedSection;
      foundAnySection = true;
      continue;
    }

    if (!foundAnySection) {
      if (emailRegex.test(raw) || phoneRegex.test(raw) || /^(www\.|http)/i.test(raw)) continue;
      if (i < 6 && /^[A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+){1,2}$/.test(raw)) continue;
    }

    sections[currentSection].push(raw);
  }

  console.log("Section lengths:", {
    summary: sections.summary.length,
    experience: sections.experience.length,
    education: sections.education.length,
    skills: sections.skills.length,
    other: sections.other.length,
  });

  // ============================================================
  // SUMMARY
  // ============================================================
  if (sections.summary.length > 0) {
    const summaryText = sections.summary.join(' ');
    const clean = summaryText
      .replace(/^(summary|profile|about\s*me|professional\s*summary|personal\s*statement|career\s*objective|objective)\s*:?\s*/i, '')
      .replace(/\s+/g, ' ').trim();
    if (clean.length > 20) result.summary = clean;
  }
  if (!result.summary && sections.other.length > 0) {
    const otherText = sections.other.join(' ');
    const sentences = otherText.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length >= 2) {
      result.summary = sentences.slice(0, 3).join(' ').trim();
    }
  }

  // ============================================================
  // SKILLS
  // ============================================================
  const skillsList: string[] = [];

  if (sections.skills.length > 0) {
    for (const line of sections.skills) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (/[,;•·|]/.test(trimmed)) {
        skillsList.push(...trimmed.split(/[,;•·|]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 60));
      } else {
        skillsList.push(trimmed);
      }
    }
  }

  if (skillsList.length < 3) {
    const techKeywords = [
      "Python", "Django", "Flask", "React", "Angular", "Vue", "Node.js", "TypeScript",
      "JavaScript", "Java", "C++", "C#", "Ruby", "PHP", "Go", "Rust", "Swift", "Kotlin",
      "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins",
      "Git", "GitHub", "GitLab", "CI/CD", "Agile", "Scrum", "Kanban",
      "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
      "REST", "GraphQL", "gRPC", "Microservices", "Serverless",
      "Machine Learning", "AI", "Data Science", "Analytics", "Big Data",
      "Leadership", "Management", "Mentoring", "Coaching", "Communication",
      "Problem Solving", "Critical Thinking", "Teamwork", "Adaptability",
      "Project Management", "Strategic Planning", "Change Management",
      "Healthcare", "HIPAA", "Compliance", "Regulatory", "Medical",
      "Security", "Cybersecurity", "Encryption", "Authentication",
      "Azure DevOps", "App Services", "Blob Storage", "Azure AD B2C",
      "Application Insights", "Scikit-learn", "spaCy", "NLP", "RBAC",
      "FISMA", "NIST 800-53", "Penetration Testing", "Security Headers",
      "HTTPS", "Encryption", "SAS", "CMS", "FX", "AHCA",
      "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator", "InDesign",
      "UX Research", "User Research", "Prototyping", "Wireframing", "Design Systems",
      "Accessibility", "Typography", "HTML", "CSS", "Tailwind", "Bootstrap",
      "Next.js", "Express", "PostgreSQL", "MySQL", "MongoDB", "Redis",
      "GraphQL", "REST API", "Microservices", "Docker", "Kubernetes",
    ];
    for (const keyword of techKeywords) {
      if (new RegExp('\\b' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(fullText)) {
        if (!skillsList.includes(keyword)) skillsList.push(keyword);
      }
    }
  }

  result.skills = [...new Set(skillsList)]
    .filter(s => s.length > 1)
    .sort((a, b) => a.localeCompare(b));

  // ============================================================
  // EXPERIENCE PARSING
  // ============================================================
  function isRoleLine(line: string): boolean {
    return /^(Senior|Lead|Principal|Staff|Junior|Associate|Full\s*Stack|Frontend|Backend|DevOps|Cloud|Security|Data|Machine\s*Learning|AI|Software|Product|UX|UI|Graphic|Web|Mobile|QA|Sales|Marketing|Operations|Project|Program|Technical|Creative|Content|Business|VP|Director|Manager|Consultant|Specialist|Engineer|Developer|Architect|Analyst|Scientist|Designer|Owner|Officer|Coordinator|Administrator|Intern)\b/i.test(line) ||
           /(Engineer|Developer|Architect|Analyst|Scientist|Specialist|Manager|Director|Designer|Consultant|Coordinator|Administrator)\b/i.test(line);
  }

  function isDateLine(line: string): boolean {
    return /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{0,2},?\s*)?\d{4}\s*(?:[-–—]|to)\s*(?:\d{4}|Present|Current|Now|Today)\b/i.test(line) ||
           /\b\d{1,2}\/\d{4}\s*(?:[-–—]|to)\s*(?:\d{1,2}\/\d{4}|Present|Current|Now|Today)\b/i.test(line) ||
           /\b\d{4}\s*(?:[-–—]|to)\s*\d{4}\b/.test(line) ||
           /\b\d{4}\s*\/\s*\d{4}\b/.test(line);
  }

  function extractDates(line: string): { start: string; end: string } | null {
    let m = line.match(/(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{0,2},?\s*)?(\d{4})\s*(?:[-–—]|to)\s*(\d{4}|Present|Current|Now|Today)\b/i);
    if (m) return { start: m[2], end: m[3] };
    m = line.match(/(\d{1,2})\/(\d{4})\s*(?:[-–—]|to)\s*(\d{1,2})\/(\d{4}|Present|Current|Now|Today)\b/i);
    if (m) return { start: `${m[1]}/${m[2]}`, end: m[4] };
    m = line.match(/(\d{4})\s*(?:[-–—]|to)\s*(\d{4})\b/);
    if (m) return { start: m[1], end: m[2] };
    m = line.match(/(\d{4})\s*\/\s*(\d{4})\b/);
    if (m) return { start: m[1], end: m[2] };
    return null;
  }

  function isLocationLine(line: string): boolean {
    return /^[A-Z][a-zA-Z'\-]+,\s*[A-Z]{2}\b/.test(line) ||
           /^[A-Z][a-zA-Z'\-]+,\s*[A-Z][a-zA-Z'\-]+$/.test(line) ||
           /^(Remote|Hybrid|On-site|Onsite)\b/i.test(line) ||
           /^location\s*:\s*.+$/i.test(line);
  }

  function isBulletLine(line: string): boolean {
    return /^[•·\-–—*]\s*/.test(line) || /^\d+[\.\)]\s*/.test(line);
  }

  function isCompanyLine(line: string): boolean {
    return /^[A-Z][a-zA-Z0-9&'\-\.\s,]*$/.test(line) &&
           line.length > 2 && line.length < 80 &&
           !isRoleLine(line) && !isDateLine(line) && !isLocationLine(line);
  }

  function stripDateRange(line: string): string {
    return line
      .replace(/\s*[-–—|]\s*(?:\d{4}|Present|Current|Now|Today)\b.*$/i, '')
      .replace(/\s*[-–—|]\s*(?:\d{1,2}\/\d{4}|Present|Current|Now|Today)\b.*$/i, '')
      .replace(/\s*\(?\s*\d{4}\s*\)?\s*$/, '')
      .replace(/[\(\)]/g, '')
      .trim();
  }

  function splitExperienceEntries(lines: string[]): string[][] {
    const entries: string[][] = [];
    let current: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const stripped = line.replace(/^[•·\-–—*]\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim();
      const isBullet = isBulletLine(line);
      const isRole = isRoleLine(line) || (isBullet && isRoleLine(stripped));
      const isDate = isDateLine(line) || (isBullet && isDateLine(stripped));
      const isCompany = isCompanyLine(line) || (isBullet && isCompanyLine(stripped));
      const isLocation = isLocationLine(line) || (isBullet && isLocationLine(stripped));

      let startsNew = false;

      if (isRole && current.length > 0) {
        const prevLine = current[current.length - 1]?.trim() || '';
        const prevIsHeader = isRoleLine(prevLine) || isCompanyLine(prevLine);
        const prevIsDate = isDateLine(prevLine);
        if (!prevIsHeader && !prevIsDate) startsNew = true;
        if (isRoleLine(prevLine)) startsNew = true;
        const hasRole = current.some(l => isRoleLine(l));
        const hasDate = current.some(l => isDateLine(l));
        if (hasRole && hasDate) startsNew = true;
      }

      if (isDate && current.length > 0) {
        const hasExistingDate = current.some(l => isDateLine(l));
        if (hasExistingDate) startsNew = true;
      }

      if (isCompany && current.length > 0) {
        const lastLine = current[current.length - 1]?.trim() || '';
        if (isBulletLine(lastLine) || /^\d+[\.\)]\s*/.test(lastLine)) startsNew = true;
        if (isCompanyLine(lastLine)) startsNew = true;
        const hasCompany = current.some(l => isCompanyLine(l));
        const hasDate = current.some(l => isDateLine(l));
        if (hasCompany && hasDate) startsNew = true;
      }

      if (startsNew && current.length > 0) {
        entries.push([...current]);
        current = [];
      }

      current.push(line);
    }

    if (current.length > 0) entries.push(current);
    return entries;
  }

  function parseExperienceEntry(entryLines: string[]): ParsedExperience | null {
    if (entryLines.length === 0) return null;

    let role = '';
    let company = '';
    let location = '';
    let start = '';
    let end = '';
    const bullets: string[] = [];

    // Handle pipe-separated first line: "Company | Role | Dates"
    const firstLine = entryLines[0].trim();
    if (firstLine.includes('|')) {
      const parts = firstLine.split('|').map(s => s.trim()).filter(Boolean);
      for (const part of parts) {
        if (isDateLine(part)) {
          const d = extractDates(part);
          if (d) { start = d.start; end = d.end; }
        } else if (isRoleLine(part) && !role) {
          role = part;
        } else if (isLocationLine(part) && !location) {
          location = part.replace(/[,;]+$/, '').trim();
        } else if (!company) {
          company = part;
        }
      }
      entryLines = entryLines.slice(1);
    }

    for (let i = 0; i < entryLines.length; i++) {
      const rawLine = entryLines[i].trim();
      if (!rawLine) continue;

      if (emailRegex.test(rawLine) || phoneRegex.test(rawLine)) continue;

      const isBullet = isBulletLine(rawLine);
      const line = isBullet ? rawLine.replace(/^[•·\-–—*]\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim() : rawLine;

      // Handle "Company | Location" or "Company | Role" inline
      if (line.includes('|') && !isBullet) {
        const parts = line.split('|').map(s => s.trim()).filter(Boolean);
        for (const part of parts) {
          if (isDateLine(part)) {
            const d = extractDates(part);
            if (d && !start) { start = d.start; end = d.end; }
          } else if (isRoleLine(part) && !role) {
            role = part;
          } else if (isLocationLine(part) && !location) {
            location = part.replace(/[,;]+$/, '').trim();
          } else if (isCompanyLine(part) && !company) {
            company = part;
          }
        }
        continue;
      }

      // If this looks like a header line (role/company + date), parse as header
      if ((isRoleLine(line) || isCompanyLine(line)) && isDateLine(line)) {
        const headerText = stripDateRange(line);
        const d = extractDates(line);
        if (d && !start) { start = d.start; end = d.end; }

        if (headerText.includes(',')) {
          const parts = headerText.split(',').map(s => s.trim()).filter(Boolean);
          for (const part of parts) {
            if (!role && isRoleLine(part)) role = part;
            else if (!company && isCompanyLine(part)) company = part;
            else if (!role) role = part;
            else if (!company) company = part;
          }
        } else {
          const atMatch = headerText.match(/^(.+?)\s+at\s+(.+)$/i);
          if (atMatch) {
            if (!role && isRoleLine(atMatch[1])) role = atMatch[1].trim();
            if (!company) company = atMatch[2].trim();
          } else {
            const dashMatch = headerText.match(/^(.+?)\s*[-–—]\s*(.+)$/);
            if (dashMatch) {
              if (!role && isRoleLine(dashMatch[1])) role = dashMatch[1].trim();
              if (!company) company = dashMatch[2].trim();
            } else {
              if (!role && isRoleLine(headerText)) role = headerText;
              if (!company && isCompanyLine(headerText)) company = headerText;
            }
          }
        }
        continue;
      }

      // Date
      if (!start && isDateLine(line)) {
        const d = extractDates(line);
        if (d) { start = d.start; end = d.end; }
        const locPart = line.split('|').map(s => s.trim()).find(s => isLocationLine(s));
        if (locPart && !location) location = locPart.replace(/[,;]+$/, '').trim();
        continue;
      }

      // Location
      if (!location && isLocationLine(line)) {
        location = line.replace(/^location\s*:\s*/i, '').replace(/[,;]+$/, '').trim();
        continue;
      }

      // Role
      if (!role && isRoleLine(line)) {
        role = line.replace(/\s*[-–—|]\s*.*$/, '').trim();
        continue;
      }

      // Company
      if (!company && isCompanyLine(line)) {
        company = line.replace(/[,;]+$/, '').replace(/\s*[-–—|]\s*.*$/, '').trim();
        continue;
      }

      // Bullet
      if (isBullet) {
        if (line.length > 2) bullets.push(line);
        continue;
      }

      // Continuation of a bullet
      if (bullets.length > 0 && line.length > 10 && !isRoleLine(line) && !isCompanyLine(line) && !isDateLine(line) && !isLocationLine(line)) {
        const lastIdx = bullets.length - 1;
        bullets[lastIdx] += ' ' + line;
      }
    }

    // Second pass: try harder for missing fields
    if (!role) {
      for (const l of entryLines) {
        const t = l.trim();
        if (isRoleLine(t)) {
          role = t.replace(/\s*[-–—|]\s*.*$/, '').trim();
          break;
        }
      }
    }

    if (!company) {
      for (const l of entryLines) {
        const t = l.trim();
        if (isCompanyLine(t) && !isRoleLine(t) && !isDateLine(t) && !isLocationLine(t)) {
          company = t.replace(/[,;]+$/, '').replace(/\s*[-–—|]\s*.*$/, '').trim();
          break;
        }
      }
    }

    return {
      role: role || '',
      company: company || '',
      location: location || '',
      start: start || '',
      end: end || '',
      bullets: bullets.filter(b => b.length > 2),
    };
  }

  function parseExperienceEntries() {
    let expLines = sections.experience;

    if (expLines.length === 0) {
      expLines = sections.other.filter(line =>
        !emailRegex.test(line) &&
        !phoneRegex.test(line) &&
        !/^(www\.|http)/i.test(line) &&
        !/^[A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+){1,2}$/.test(line) &&
        (isRoleLine(line) || isDateLine(line) || isBulletLine(line) || isCompanyLine(line))
      );
    }

    if (expLines.length === 0) {
      console.log("No experience lines found");
      return;
    }

    const entries = splitExperienceEntries(expLines);
    console.log(`Identified ${entries.length} experience entries`);

    for (let i = 0; i < entries.length; i++) {
      const parsed = parseExperienceEntry(entries[i]);
      if (parsed && (parsed.role || parsed.company)) {
        result.experience.push({
          id: `exp-${Date.now()}-${i}`,
          role: parsed.role || "Software Engineer",
          company: parsed.company || "Organization",
          location: parsed.location || result.location || "",
          start: parsed.start || "",
          end: parsed.end || "",
          bullets: parsed.bullets.join('\n'),
        });
      }
    }

    console.log(`Parsed ${result.experience.length} experience entries`);
  }

  // ============================================================
  // EDUCATION PARSING
  // ============================================================
  const degreeKeywords = [
    "Bachelor", "Master", "PhD", "Doctor", "Associate", "Diploma", "Certificate",
    "BBA", "MBA", "BS", "MS", "BA", "MA", "BSc", "MSc", "BEng", "MEng",
    "MPhil", "DPhil", "MD", "JD", "LLM", "MPH", "MPA", "MSW", "EdD", "EdM",
    "MFA", "MArch", "MLIS", "MLS", "MMus", "MPP", "MSN", "OTD", "PharmD", "DPT", "DVM",
    "High School", "GED", "A-Levels", "A-Level", "GCSE", "HND", "HNC",
  ];

  function isDegreeLine(line: string): boolean {
    return degreeKeywords.some(k => new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(line));
  }

  function isSchoolLine(line: string): boolean {
    return /(University|College|School|Institute|Academy|Polytechnic|Conservatoire|Académie|Hochschule|Universität|Universidad|Universidade|Lagos|Ibadan|Ife|Benin|Nsukka|Stanford|MIT|Harvard|Yale|Princeton|Cornell|Columbia|Duke|Northwestern|UCLA|USC|Berkeley|Oxford|Cambridge)/i.test(line);
  }

  function splitEducationEntries(lines: string[]): string[][] {
    const entries: string[][] = [];
    let current: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const isDegree = isDegreeLine(trimmed);
      const isSchool = isSchoolLine(trimmed);
      const isDate = isDateLine(trimmed);

      let startsNew = false;
      if (current.length > 0) {
        const hasDegree = current.some(l => isDegreeLine(l));
        const hasDate = current.some(l => isDateLine(l));
        if (isDegree && hasDegree) startsNew = true;
        if (isSchool && hasDegree && hasDate) startsNew = true;
        if (isDate && hasDegree && hasDate) startsNew = true;
      }

      if (startsNew) {
        entries.push([...current]);
        current = [];
      }

      current.push(trimmed);
    }

    if (current.length > 0) entries.push(current);
    return entries;
  }

  function parseEducationEntry(entryLines: string[]): ParsedEducation | null {
    if (entryLines.length === 0) return null;

    let degree = '';
    let school = '';
    let start = '';
    let end = '';
    let detail = '';

    // Handle comma-separated first line: "Degree, School, Dates"
    const firstLine = entryLines[0].trim();
    if (firstLine.includes(',') && isDegreeLine(firstLine) && isSchoolLine(firstLine)) {
      const parts = firstLine.split(',').map(s => s.trim()).filter(Boolean);
      for (const part of parts) {
        if (isDegreeLine(part) && !degree) degree = part;
        else if (isSchoolLine(part) && !school) school = part;
        else if (isDateLine(part)) {
          const d = extractDates(part);
          if (d) { start = d.start; end = d.end; }
        }
      }
      entryLines = entryLines.slice(1);
    }

    // Handle dash-separated first line: "Degree — School — Dates"
    if (!degree && (firstLine.includes('—') || firstLine.includes('–') || /^[^,]+[-–—][^,]+[-–—]/.test(firstLine))) {
      const d = extractDates(firstLine);
      if (d) { start = d.start; end = d.end; }
      const withoutDates = firstLine
        .replace(/\s*[-–—|]\s*(?:\d{4}|Present|Current|Now|Today)\b.*$/i, '')
        .replace(/\s*\(?\s*\d{4}\s*\)?\s*$/, '')
        .trim();
      const parts = withoutDates.split(/\s*[-–—]\s*/).map(s => s.trim()).filter(Boolean);
      for (const part of parts) {
        if (isDegreeLine(part) && !degree) degree = part;
        else if (isSchoolLine(part) && !school) school = part;
        else if (!degree) degree = part;
        else if (!school) school = part;
      }
      entryLines = entryLines.slice(1);
    }

    for (const line of entryLines) {
      const t = line.trim();
      if (!t) continue;

      if (isDegreeLine(t) && !degree) {
        degree = t.replace(/\s*[-–—|]\s*.*$/, '').trim();
        continue;
      }

      if (isSchoolLine(t) && !school && !isDegreeLine(t)) {
        school = t.replace(/\s*[-–—|]\s*.*$/, '').trim();
        continue;
      }

      if (!start && isDateLine(t)) {
        const d = extractDates(t);
        if (d) { start = d.start; end = d.end; }
        continue;
      }

      if (t.length > 3 && !isDegreeLine(t) && !isSchoolLine(t) && !isDateLine(t)) {
        detail = (detail ? detail + '; ' : '') + t;
      }
    }

    return {
      degree: degree || '',
      school: school || '',
      start: start || '',
      end: end || '',
      detail: detail || '',
    };
  }

  function parseEducationEntries() {
    let eduLines = sections.education;

    if (eduLines.length === 0) {
      eduLines = sections.other.filter(line =>
        isDegreeLine(line) || isSchoolLine(line) || isDateLine(line)
      );
    }

    if (eduLines.length === 0) {
      console.log("No education lines found");
      return;
    }

    const entries = splitEducationEntries(eduLines);
    console.log(`Identified ${entries.length} education entries`);

    for (let i = 0; i < entries.length; i++) {
      const parsed = parseEducationEntry(entries[i]);
      if (parsed && (parsed.degree || parsed.school)) {
        result.education.push({
          id: `edu-${Date.now()}-${i}`,
          degree: parsed.degree || "Bachelor's Degree",
          school: parsed.school || "University",
          start: parsed.start || '',
          end: parsed.end || '',
          detail: parsed.detail || '',
        });
      }
    }

    console.log(`Parsed ${result.education.length} education entries`);
  }

  // ============================================================
  // EXECUTE PARSERS
  // ============================================================
  parseExperienceEntries();
  parseEducationEntries();

  // ============================================================
  // FALLBACK VALUES - Now with all fields
  // ============================================================
  if (!result.fullName) result.fullName = "";
  if (!result.title) result.title = "";
  if (!result.email) result.email = "";
  if (!result.phone) result.phone = "";
  if (!result.location) result.location = "";
  if (!result.website) result.website = "";
  
  if (!result.summary) {
    result.summary = "";
  }

  // Don't add fallback experience/education/skills - let user add them
  // if they want them

  console.log("=== PARSING COMPLETE ===");
  console.log("Final result:", {
    name: result.fullName,
    title: result.title,
    email: result.email,
    phone: result.phone,
    location: result.location,
    education: result.education.length,
    experience: result.experience.length,
    skills: result.skills.length,
    languages: result.languages.length,
    certificates: result.certificates.length,
    projects: result.projects.length,
    publications: result.publications.length,
    courses: result.courses.length,
    organizations: result.organizations.length,
    interests: result.interests.length,
    references: result.references.length,
    awards: result.awards.length,
    declaration: result.declaration.length,
    custom: result.custom.length,
  });
  console.log("Experience entries:", result.experience.map(e => `${e.role} at ${e.company}`));
  console.log("Education entries:", result.education.map(e => `${e.degree} at ${e.school}`));

  return result;
}