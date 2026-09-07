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

      const structuredData = parseCVText(extractedText);

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
// COMPLETELY REWRITTEN CV PARSER - Fixes name/title extraction
// ============================================================
function parseCVText(text: string) {
  console.log("=== STARTING CV PARSING ===");
  console.log("Text length:", text.length);
  console.log("First 500 chars:", text.substring(0, 500));

  // Clean the text - remove any wrapper tags and normalize whitespace
  text = text
    .replace(/<[^>]*>/g, ' ')  // Remove all HTML/XML tags
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .trim();

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
  };

  // Split into lines for processing
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log("Lines:", lines.length);

  // ============================================================
  // 1. EXTRACT NAME AND TITLE FROM FIRST LINE
  // ============================================================
  // First line often contains name and title combined
  // Example: "Daniel Le Senior Software Engineer"
  if (lines.length > 0) {
    const firstLine = lines[0];
    console.log("First line:", firstLine);
    
    // Try to split name and title
    // Look for patterns like: "Name Title" or "Name - Title" or "Name | Title"
    let nameMatch = firstLine.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(Senior|Lead|Principal|Junior|Associate|Head|Director|Manager|Engineer|Designer|Developer|Analyst|Consultant|Specialist|Coordinator|Architect|DevOps|QA|Full[\s-]Stack|Frontend|Backend|Software|Product|Project|Program|Technical|Solutions|Systems|Network|Security|Data|Machine\s+Learning|AI|ML|DevOps|SRE|Cloud|Infrastructure|Site\s+Reliability)/i);
    
    if (nameMatch) {
      result.fullName = nameMatch[1].trim();
      result.title = nameMatch[0].replace(nameMatch[1], '').trim();
      console.log("✅ Found name:", result.fullName);
      console.log("✅ Found title:", result.title);
    } else {
      // Try alternative: split by common separators
      const separators = ['-', '|', '—', '–', '·'];
      let found = false;
      for (const sep of separators) {
        if (firstLine.includes(sep)) {
          const parts = firstLine.split(sep).map(p => p.trim());
          if (parts.length >= 2) {
            // Check which part looks like a name (has two words, both capitalized)
            if (parts[0].match(/^[A-Z][a-z]+ [A-Z][a-z]+/)) {
              result.fullName = parts[0];
              result.title = parts.slice(1).join(' ').trim();
            } else if (parts[1].match(/^[A-Z][a-z]+ [A-Z][a-z]+/)) {
              result.fullName = parts[1];
              result.title = parts[0];
            }
            found = true;
            console.log("✅ Found name (separator):", result.fullName);
            console.log("✅ Found title (separator):", result.title);
            break;
          }
        }
      }
      
      // If still not found, try to find name and title patterns
      if (!found) {
        // Try to find a name (two capitalized words) and a title after it
        const fullText = lines.slice(0, 3).join(' ');
        const nameTitleMatch = fullText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(Senior|Lead|Principal|Junior|Associate|Head|Director|Manager|Engineer|Designer|Developer|Analyst|Consultant|Specialist|Coordinator|Architect|DevOps|QA|Full[\s-]Stack|Frontend|Backend|Software|Product|Project|Program|Technical|Solutions|Systems|Network|Security|Data|Machine\s+Learning|AI|ML|DevOps|SRE|Cloud|Infrastructure|Site\s+Reliability)/i);
        if (nameTitleMatch) {
          result.fullName = nameTitleMatch[1].trim();
          result.title = nameTitleMatch[0].replace(nameTitleMatch[1], '').trim();
          console.log("✅ Found name (fallback):", result.fullName);
          console.log("✅ Found title (fallback):", result.title);
        } else {
          // Just use the first line as name if it looks like a name
          if (firstLine.match(/^[A-Z][a-z]+ [A-Z][a-z]+/)) {
            result.fullName = firstLine;
            console.log("✅ Found name (first line):", result.fullName);
          }
        }
      }
    }
  }

  // ============================================================
  // 2. EXTRACT EMAIL
  // ============================================================
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    result.email = emailMatch[0];
    console.log("✅ Found email:", result.email);
  }

  // ============================================================
  // 3. EXTRACT PHONE AND LOCATION
  // ============================================================
  // Look for phone number with location
  const phoneLocationMatch = text.match(/(\+\d{1,3}[\d\s-]+)\s+([A-Z][a-z]+,\s*[A-Z][a-z]+)/i);
  if (phoneLocationMatch) {
    result.phone = phoneLocationMatch[1].trim();
    result.location = phoneLocationMatch[2].trim();
    console.log("✅ Found phone:", result.phone);
    console.log("✅ Found location:", result.location);
  } else {
    // Try to find phone separately
    const phonePatterns = [
      /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
      /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
      /\d{3}[-.\s]\d{3}[-.\s]\d{4}/,
    ];
    
    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) {
        result.phone = match[0];
        console.log("✅ Found phone:", result.phone);
        break;
      }
    }
    
    // Try to find location
    const locationMatch = text.match(/([A-Z][a-z]+,\s*[A-Z][a-z]+)/);
    if (locationMatch && !result.location) {
      result.location = locationMatch[0];
      console.log("✅ Found location:", result.location);
    }
  }

  // ============================================================
  // 4. EXTRACT SUMMARY
  // ============================================================
  // Look for profile/summary section
  const summaryMatch = text.match(/(?:Profile|Summary|About)[:\s]+([^.]+(?:[.][^.]*)*)/i);
  if (summaryMatch) {
    const summary = summaryMatch[1].trim();
    if (summary.length > 20) {
      result.summary = summary;
      console.log("✅ Found summary:", result.summary.substring(0, 100) + "...");
    }
  }

  // If no summary found, try to get it from the text
  if (!result.summary) {
    // Look for sentences after the first few lines
    const sentences = text.match(/[A-Z][^.!?]*[.!?]/g);
    if (sentences && sentences.length > 1) {
      // Take the first few sentences as summary
      const summaryText = sentences.slice(0, 3).join(' ');
      if (summaryText.length > 30) {
        result.summary = summaryText;
        console.log("✅ Found summary (fallback):", result.summary.substring(0, 100) + "...");
      }
    }
  }

  // ============================================================
  // 5. EXTRACT SKILLS
  // ============================================================
  // Look for skills section
  const skillsSectionMatch = text.match(/Skills[:\s]+([^.]*(?:[.][^.]*)*)/i);
  if (skillsSectionMatch) {
    const skillsText = skillsSectionMatch[1];
    console.log("Skills text:", skillsText.substring(0, 200));
    
    // Extract skills from the text
    const skillMatches = skillsText.match(/([A-Z][a-z]+(?:[\s-][A-Z][a-z]+)*)/g);
    if (skillMatches) {
      for (const skill of skillMatches) {
        const trimmed = skill.trim();
        // Filter out common non-skill words
        if (trimmed.length > 2 && trimmed.length < 40 && 
            !result.skills.includes(trimmed) &&
            !trimmed.match(/^Skills|^Summary|^Education|^Experience|^Work|^Employment|^References|^Certifications|^Languages|^Programming|^Frontend|^Backend|^AI|^Automation|^Development$/i)) {
          result.skills.push(trimmed);
        }
      }
      console.log("✅ Found skills:", result.skills.length);
    }
  }

  // If no skills found, try to extract from the text
  if (result.skills.length === 0) {
    const commonSkills = [
      "TypeScript", "JavaScript", "Python", "Go", "Java", "SQL",
      "React", "Next.js", "Redux", "React Query", "Angular", "Vue.js",
      "Tailwind CSS", "Material UI", "HTML5", "CSS3",
      "Node.js", "Express.js", "NestJS", "FastAPI", "Spring Boot",
      "REST APIs", "GraphQL", "WebSockets", "Microservices",
      "OpenAI API", "Claude API", "RAG", "Retrieval-Augmented Generation",
      "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
      "Git", "CI/CD", "Jenkins", "GitHub Actions",
      "Agile", "Scrum", "Kanban", "Jira", "Confluence",
      "Research", "Data Analysis", "Project Management", "Leadership",
      "Communication", "Problem Solving", "Critical Thinking"
    ];
    
    for (const skill of commonSkills) {
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (text.match(new RegExp(escapedSkill, "i"))) {
        if (!result.skills.includes(skill)) {
          result.skills.push(skill);
        }
      }
    }
    console.log("✅ Found skills from common skills:", result.skills.length);
  }

  // ============================================================
  // 6. EXTRACT EXPERIENCE
  // ============================================================
  // Try to find experience information
  const expPatterns = [
    /(\d+)\+?\s*(?:years|yrs)\s*(?:of\s*)?experience/i,
    /Experience[:\s]+([^\n]+)/i,
  ];
  
  for (const pattern of expPatterns) {
    const match = text.match(pattern);
    if (match) {
      const expText = match[1] || match[0];
      // Extract years of experience
      const yearsMatch = expText.match(/(\d+)\+?/);
      if (yearsMatch) {
        const years = yearsMatch[1];
        // Create an experience entry from the years
        if (result.experience.length === 0) {
          result.experience.push({
            id: `exp-${Date.now()}-${result.experience.length}`,
            role: result.title || "Software Engineer",
            company: "Various Companies",
            location: result.location || "",
            start: "",
            end: "",
            bullets: `${years}+ years of experience in software development.`,
          });
          console.log("✅ Added experience from years:", years);
        }
      }
      break;
    }
  }

  // If no experience found, create a default one
  if (result.experience.length === 0) {
    result.experience = [{
      id: `exp-${Date.now()}-${result.experience.length}`,
      role: result.title || "Professional",
      company: "Organization",
      location: result.location || "",
      start: "",
      end: "",
      bullets: "Experienced professional with a strong background in the industry.",
    }];
    console.log("✅ Added default experience");
  }

  // ============================================================
  // 7. EXTRACT EDUCATION - Look for degree patterns
  // ============================================================
  const degreePatterns = [
    /(?:BA|BSc|MA|MSc|PhD|Bachelor|Master|Degree|Diploma|Certificate)[^,]*/i,
    /(?:Bachelor|Master|Doctorate|PhD)\s+(?:of|in)\s+[A-Za-z\s]+/i,
  ];
  
  for (const pattern of degreePatterns) {
    const match = text.match(pattern);
    if (match) {
      const degreeText = match[0].trim();
      if (degreeText.length > 5) {
        result.education.push({
          id: `edu-${Date.now()}-${result.education.length}`,
          degree: degreeText,
          school: "",
          start: "",
          end: "",
          detail: "",
        });
        console.log("✅ Found education:", degreeText);
        break;
      }
    }
  }

  // If no education found, create default
  if (result.education.length === 0) {
    result.education = [{
      id: `edu-${Date.now()}-${result.education.length}`,
      degree: "Bachelor's Degree",
      school: "University",
      start: "",
      end: "",
      detail: "",
    }];
    console.log("✅ Added default education");
  }

  // ============================================================
  // 8. FALLBACK VALUES
  // ============================================================
  if (!result.fullName) result.fullName = "Applicant Name";
  if (!result.title) result.title = "Software Engineer";
  if (!result.email) result.email = "email@example.com";
  if (!result.phone) result.phone = "+1 234 567 8900";
  if (!result.location) result.location = "City, Country";
  
  if (!result.summary) {
    result.summary = "Experienced professional with a strong background in software development, system architecture, and team leadership. Proven track record of delivering high-quality solutions and driving innovation.";
  }

  // Clean up skills - remove duplicates and sort
  result.skills = [...new Set(result.skills)].sort();

  if (result.skills.length === 0) {
    result.skills = ["JavaScript", "TypeScript", "React", "Node.js", "Python"];
  }

  console.log("=== PARSING COMPLETE ===");
  console.log("Final result:", {
    name: result.fullName,
    title: result.title,
    email: result.email,
    phone: result.phone,
    location: result.location,
    summaryLength: result.summary.length,
    education: result.education.length,
    experience: result.experience.length,
    skills: result.skills.length,
    skillsList: result.skills.slice(0, 10),
  });

  return result;
}