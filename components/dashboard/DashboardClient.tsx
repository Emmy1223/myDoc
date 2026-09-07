"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  FilePlus2,
  FileText,
  FolderOpen,
  LayoutTemplate,
  LoaderCircle,
  LogOut,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";

type DocumentItem = {
  id: string;
  title: string;
  kind: string;
  status: "draft" | "in-progress" | "completed";
  templateId: string;
  templateName: string;
  createdAt: string;
  updatedAt: string;
  exportCount: number;
};

type TemplateItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  usageCount: number;
};

type DashboardData = {
  user: { id: string; name: string; email: string };
  documents: DocumentItem[];
  templates: TemplateItem[];
  categories: string[];
  stats: {
    totalDocuments: number;
    exportsThisMonth: number;
    mostUsedTemplate: string | null;
  };
  activities: {
    id: string;
    type: "created" | "duplicated" | "exported" | "deleted";
    documentId?: string;
    documentTitle: string;
    createdAt: string;
  }[];
};

type Notice = { tone: "error" | "success"; message: string } | null;

const statusLabel: Record<DocumentItem["status"], string> = {
  draft: "Draft",
  "in-progress": "In progress",
  completed: "Completed",
};

const activityLabel: Record<DashboardData["activities"][number]["type"], string> = {
  created: "Created",
  duplicated: "Duplicated",
  exported: "Exported",
  deleted: "Deleted",
};

export default function DashboardClient() {
  const router = useRouter();
  const uploadInput = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [working, setWorking] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [openDocumentMenu, setOpenDocumentMenu] = useState<string | null>(null);

  const loadDashboard = useCallback(async (selectedCategory = category) => {
    setLoading(true);
    setNotice(null);
    try {
      const query = selectedCategory === "All" ? "" : `?category=${encodeURIComponent(selectedCategory)}`;
      const response = await fetch(`/api/dashboard${query}`, { cache: "no-store" });
      if (response.status === 401) {
        setAuthRequired(true);
        setData(null);
        return;
      }
      const result = (await response.json()) as DashboardData & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "The dashboard could not be loaded.");
      setAuthRequired(false);
      setData(result);
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "The dashboard could not be loaded.",
      });
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function createDocument(values: { title: string; status?: DocumentItem["status"] }) {
    setWorking(values.title);
    setNotice(null);
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "create",
          title: values.title,
          kind: "CV",
          status: values.status ?? "draft",
        }),
      });
      const result = (await response.json()) as { document?: DocumentItem; error?: string };
      if (!response.ok || !result.document) throw new Error(result.error ?? "The document could not be created.");
      router.push(`/builder?new=1&document=${encodeURIComponent(result.document.id)}`);
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "The document could not be created.",
      });
    } finally {
      setWorking(null);
    }
  }

  async function cloneLast() {
    setWorking("clone-last");
    setNotice(null);
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "clone-last" }),
      });
      const result = (await response.json()) as { document?: DocumentItem; error?: string };
      if (!response.ok || !result.document) throw new Error(result.error ?? "There is no document to clone yet.");
      setNotice({ tone: "success", message: `${result.document.title} is ready to edit.` });
      await loadDashboard();
      router.push(`/builder?document=${encodeURIComponent(result.document.id)}`);
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "The last document could not be cloned.",
      });
    } finally {
      setWorking(null);
    }
  }

  async function uploadExisting(file: File) {
    const title = file.name.replace(/\.[^/.]+$/, "").trim() || "Uploaded CV";
    setWorking("upload");
    setNotice(null);
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "create", title, kind: "CV", status: "in-progress" }),
      });
      const result = (await response.json()) as { document?: DocumentItem; error?: string };
      if (!response.ok || !result.document) throw new Error(result.error ?? "The upload could not be started.");
      router.push(`/builder?upload=1&document=${encodeURIComponent(result.document.id)}`);
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "The upload could not be started.",
      });
    } finally {
      setWorking(null);
      if (uploadInput.current) uploadInput.current.value = "";
    }
  }

  async function documentAction(document: DocumentItem, action: "duplicate" | "export" | "delete") {
    if (action === "delete" && !window.confirm(`Delete ${document.title}?`)) return;
    setWorking(`${action}-${document.id}`);
    setOpenDocumentMenu(null);
    setNotice(null);
    try {
      const response =
        action === "delete"
          ? await fetch(`/api/documents/${document.id}`, { method: "DELETE" })
          : await fetch(`/api/documents/${document.id}`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ action }),
            });
      const result = (await response.json()) as { document?: DocumentItem; error?: string };
      if (!response.ok) throw new Error(result.error ?? "The document action failed.");
      await loadDashboard();
      setNotice({
        tone: "success",
        message:
          action === "delete"
            ? "Document deleted."
            : action === "duplicate"
              ? "Document duplicated."
              : "Export recorded. Open the document to download it as a PDF.",
      });
      if (action === "export") router.push(`/builder?document=${encodeURIComponent(document.id)}&print=1`);
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "The document action failed.",
      });
    } finally {
      setWorking(null);
    }
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  if (loading && !data && !authRequired) return <LoadingState />;
  if (authRequired) return <AuthRequiredState />;
  if (!data) return <ErrorState onRetry={() => void loadDashboard()} />;

  const categories = ["All", ...data.categories];

  return (
    <div className="min-h-screen bg-white text-[#171717]">
      <input
        ref={uploadInput}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadExisting(file);
        }}
      />
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-[#E5E5E5] bg-white md:flex md:flex-col">
          <div className="border-b border-[#E5E5E5] px-6 py-6">
            <Link href="/" className="font-sans text-xl font-bold tracking-[-0.02em]">
              my<span className="text-[#4F46E5]">Doc</span>
            </Link>
            <p className="mt-1 text-xs text-[#737373]">Document workspace</p>
          </div>
          <nav className="p-4" aria-label="Dashboard">
            <a
              href="#documents"
              className="flex min-h-11 items-center gap-3 border border-[#4F46E5] bg-[#EEF2FF] px-3 text-sm font-semibold text-[#3730A3]"
            >
              <FolderOpen className="h-4 w-4" strokeWidth={1.8} />
              My documents
            </a>
            <a
              href="#templates"
              className="mt-1 flex min-h-11 items-center gap-3 border border-transparent px-3 text-sm font-semibold text-[#525252] hover:border-[#E5E5E5] hover:bg-[#F5F5F5]"
            >
              <LayoutTemplate className="h-4 w-4" strokeWidth={1.8} />
              Templates
            </a>
          </nav>
          <div className="mt-auto border-t border-[#E5E5E5] p-4">
            <button
              type="button"
              onClick={signOut}
              className="inline-flex min-h-11 w-full items-center gap-2 px-1 text-sm font-semibold text-[#525252] hover:text-[#4F46E5]"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
              Sign out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-24 md:pb-12">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 md:px-12 md:py-12">
            <header className="border-b border-[#E5E5E5] pb-8 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">Your workspace</p>
              <h1 className="mt-3 font-sans text-4xl font-bold leading-[1.15] tracking-[-0.02em] md:text-5xl">
                Welcome back, {data.user.name}.
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#525252]">
                Pick up where you left off or start a new document from your saved workspace.
              </p>
            </header>

            {notice && <Notice notice={notice} onDismiss={() => setNotice(null)} />}

            <section className="pt-8" aria-labelledby="quick-actions-heading">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#737373]">Start here</p>
                  <h2 id="quick-actions-heading" className="mt-1 text-2xl font-bold leading-[1.2] tracking-[-0.02em]">
                    Quick actions
                  </h2>
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <ActionCard
                  icon={Upload}
                  title="Upload existing CV"
                  description="Bring in a PDF or Word document and continue in the builder."
                  onClick={() => uploadInput.current?.click()}
                  loading={working === "upload"}
                />
                <ActionCard
                  icon={FilePlus2}
                  title="Start blank"
                  description="Open a clean document and enter your details manually."
                  onClick={() => void createDocument({ title: "Untitled document" })}
                  loading={working === "Untitled document"}
                />
                <ActionCard
                  icon={Copy}
                  title="Clone last"
                  description="Duplicate your most recently updated document."
                  onClick={() => void cloneLast()}
                  loading={working === "clone-last"}
                />
              </div>
            </section>

            <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.75fr)]">
              <section id="documents" aria-labelledby="documents-heading">
                <SectionHeading eyebrow="Library" title="Recent documents" count={data.documents.length} />
                {data.documents.length === 0 ? (
                  <EmptyDocuments onUpload={() => uploadInput.current?.click()} onStart={() => void createDocument({ title: "Untitled document" })} />
                ) : (
                  <div className="mt-5 divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
                    {data.documents.map((document) => (
                      <DocumentRow
                        key={document.id}
                        document={document}
                        open={openDocumentMenu === document.id}
                        working={working}
                        onToggleMenu={() => setOpenDocumentMenu(openDocumentMenu === document.id ? null : document.id)}
                        onEdit={() => router.push(`/builder?document=${encodeURIComponent(document.id)}`)}
                        onAction={(action) => void documentAction(document, action)}
                      />
                    ))}
                  </div>
                )}
              </section>

              <aside className="space-y-8">
                <section aria-labelledby="stats-heading">
                  <SectionHeading eyebrow="Your numbers" title="Quick stats" />
                  <div className="mt-5 divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
                    <StatRow label="Documents created" value={String(data.stats.totalDocuments)} />
                    <StatRow label="Exports this month" value={String(data.stats.exportsThisMonth)} />
                    <StatRow label="Most used template" value={data.stats.mostUsedTemplate ?? "—"} />
                  </div>
                </section>

                <section aria-labelledby="activity-heading">
                  <SectionHeading eyebrow="History" title="Recent activity" />
                  {data.activities.length === 0 ? (
                    <p className="mt-5 border border-dashed border-[#D4D4D4] px-4 py-6 text-sm leading-6 text-[#737373]">
                      Your document activity will appear here after your first action.
                    </p>
                  ) : (
                    <ul className="mt-5 divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
                      {data.activities.map((activity) => (
                        <li key={activity.id} className="py-3">
                          <p className="text-sm leading-6">
                            <span className="font-semibold">{activityLabel[activity.type]}</span>{" "}
                            <span className="break-words">{activity.documentTitle}</span>
                          </p>
                          <p className="mt-0.5 text-xs text-[#737373]">{relativeDate(activity.createdAt)}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </aside>
            </div>

            <section id="templates" className="mt-12 border-t border-[#E5E5E5] pt-10" aria-labelledby="templates-heading">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeading eyebrow="Layouts" title="Template gallery" />
                <div className="relative">
                  <label htmlFor="template-category" className="sr-only">Filter templates by category</label>
                  <select
                    id="template-category"
                    value={category}
                    disabled={templateLoading}
                    onChange={async (event) => {
                      const nextCategory = event.target.value;
                      setCategory(nextCategory);
                      setTemplateLoading(true);
                      await loadDashboard(nextCategory);
                      setTemplateLoading(false);
                    }}
                    className="min-h-11 border border-[#D4D4D4] bg-white px-3 pr-9 text-sm font-semibold outline-none focus:border-[#4F46E5]"
                  >
                    {categories.map((item) => <option key={item}>{item}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-[#737373]" strokeWidth={1.8} />
                </div>
              </div>
              {templateLoading ? (
                <div className="mt-5 flex min-h-40 items-center justify-center border border-[#E5E5E5] text-sm text-[#737373]">
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" strokeWidth={1.8} />
                  Loading templates…
                </div>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {data.templates.map((template) => <TemplateCard key={template.id} template={template} />)}
                </div>
              )}
            </section>
          </div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E5E5E5] bg-white px-3 py-2 md:hidden" aria-label="Mobile dashboard navigation">
          <div className="mx-auto flex max-w-md items-center justify-around">
            <a href="#documents" className="flex min-h-11 min-w-20 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-[#4F46E5]">
              <FolderOpen className="h-4 w-4" strokeWidth={1.8} />
              Documents
            </a>
            <button type="button" onClick={() => void createDocument({ title: "Untitled document" })} className="flex min-h-11 min-w-20 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-[#525252]">
              <Plus className="h-4 w-4" strokeWidth={1.8} />
              New
            </button>
            <a href="#templates" className="flex min-h-11 min-w-20 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-[#525252]">
              <LayoutTemplate className="h-4 w-4" strokeWidth={1.8} />
              Templates
            </a>
            <button type="button" onClick={() => void signOut()} className="flex min-h-11 min-w-20 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-[#525252]">
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
              Sign out
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  loading,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="group min-h-40 border border-[#E5E5E5] bg-white p-5 text-left hover:border-[#4F46E5] hover:bg-[#FAFAFF] disabled:cursor-wait disabled:opacity-70"
    >
      <span className="flex h-10 w-10 items-center justify-center border border-[#C7D2FE] bg-[#EEF2FF] text-[#4F46E5]">
        {loading ? <LoaderCircle className="h-5 w-5 animate-spin" strokeWidth={1.8} /> : <Icon className="h-5 w-5" strokeWidth={1.8} />}
      </span>
      <span className="mt-5 flex items-center justify-between gap-3">
        <span className="font-sans text-lg font-bold tracking-[-0.02em]">{title}</span>
        <ArrowRight className="h-4 w-4 text-[#4F46E5] transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
      </span>
      <span className="mt-2 block text-sm leading-6 text-[#525252]">{description}</span>
    </button>
  );
}

function DocumentRow({
  document,
  open,
  working,
  onToggleMenu,
  onEdit,
  onAction,
}: {
  document: DocumentItem;
  open: boolean;
  working: string | null;
  onToggleMenu: () => void;
  onEdit: () => void;
  onAction: (action: "duplicate" | "export" | "delete") => void;
}) {
  return (
    <article className="relative flex flex-wrap items-center gap-4 py-5">
      <DocumentThumbnail templateId={document.templateId} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-bold tracking-[-0.02em]">{document.title}</h3>
        <p className="mt-1 text-xs leading-5 text-[#737373]">
          {document.kind} · Edited {relativeDate(document.updatedAt)} · {document.templateName}
        </p>
      </div>
      <span className={`border px-2.5 py-1 text-xs font-semibold ${statusClass(document.status)}`}>
        {statusLabel[document.status]}
      </span>
      <div className="flex items-center gap-1">
        <button type="button" onClick={onEdit} className="inline-flex min-h-11 items-center gap-1.5 border border-[#D4D4D4] bg-white px-3 text-xs font-semibold hover:border-[#4F46E5] hover:text-[#4F46E5]">
          <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
          Edit
        </button>
        <div className="relative">
          <button type="button" aria-label={`Actions for ${document.title}`} aria-expanded={open} onClick={onToggleMenu} className="inline-flex min-h-11 min-w-11 items-center justify-center border border-transparent text-[#737373] hover:border-[#D4D4D4] hover:text-[#171717]">
            <MoreHorizontal className="h-4 w-4" strokeWidth={1.8} />
          </button>
          {open && (
            <div className="absolute right-0 top-12 z-20 w-48 border border-[#D4D4D4] bg-white py-1">
              <MenuAction icon={ArrowDownToLine} label="Download PDF" disabled={working === `export-${document.id}`} onClick={() => onAction("export")} />
              <MenuAction icon={Copy} label="Duplicate" disabled={working === `duplicate-${document.id}`} onClick={() => onAction("duplicate")} />
              <MenuAction icon={Trash2} label="Delete" danger disabled={working === `delete-${document.id}`} onClick={() => onAction("delete")} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function MenuAction({
  icon: Icon,
  label,
  danger,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`flex min-h-11 w-full items-center gap-2 px-3 text-left text-xs font-semibold hover:bg-[#F5F5F5] disabled:opacity-50 ${danger ? "text-red-700" : "text-[#171717]"}`}>
      {disabled ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" strokeWidth={1.8} /> : <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />}
      {label}
    </button>
  );
}

function DocumentThumbnail({ templateId }: { templateId: string }) {
  return (
    <div className={`flex h-16 w-12 shrink-0 flex-col gap-1 border border-[#D4D4D4] bg-white p-1.5 ${templateId === "ledger" ? "border-l-4 border-l-[#4F46E5]" : templateId === "slab" ? "border-t-4 border-t-[#171717]" : ""}`} aria-hidden>
      <span className="h-1 w-5 bg-[#171717]" />
      <span className="h-0.5 w-full bg-[#D4D4D4]" />
      <span className="h-0.5 w-4/5 bg-[#D4D4D4]" />
      <span className="mt-1 h-0.5 w-3/5 bg-[#A3A3A3]" />
      <span className="h-0.5 w-full bg-[#E5E5E5]" />
      <span className="h-0.5 w-4/5 bg-[#E5E5E5]" />
    </div>
  );
}

function TemplateCard({ template }: { template: TemplateItem }) {
  return (
    <article className="flex gap-5 border border-[#E5E5E5] bg-white p-4">
      <div className="flex h-28 w-20 shrink-0 flex-col gap-1 border border-[#D4D4D4] bg-white p-2" aria-hidden>
        <span className="h-1.5 w-8 bg-[#171717]" />
        <span className="h-0.5 w-full bg-[#D4D4D4]" />
        <span className="h-0.5 w-3/4 bg-[#D4D4D4]" />
        <span className="mt-2 h-0.5 w-full bg-[#A3A3A3]" />
        <span className="h-0.5 w-5/6 bg-[#E5E5E5]" />
        <span className="h-0.5 w-full bg-[#E5E5E5]" />
        <span className="mt-2 h-0.5 w-2/3 bg-[#A3A3A3]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4F46E5]">{template.category}</p>
        <h3 className="mt-2 text-lg font-bold tracking-[-0.02em]">{template.name}</h3>
        <p className="mt-1 text-sm leading-6 text-[#525252]">{template.description}</p>
        <p className="mt-3 text-xs text-[#737373]">Used in {template.usageCount} {template.usageCount === 1 ? "document" : "documents"}</p>
      </div>
    </article>
  );
}

function SectionHeading({ eyebrow, title, count }: { eyebrow: string; title: string; count?: number }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#737373]">{eyebrow}</p>
      <div className="mt-1 flex items-center gap-3">
        <h2 className="text-2xl font-bold leading-[1.2] tracking-[-0.02em]">{title}</h2>
        {count !== undefined && <span className="border border-[#D4D4D4] px-2 py-1 text-xs font-semibold text-[#737373]">{count}</span>}
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-4 py-3">
      <span className="text-sm text-[#525252]">{label}</span>
      <span className="text-xl font-bold tracking-[-0.02em]">{value}</span>
    </div>
  );
}

function EmptyDocuments({ onUpload, onStart }: { onUpload: () => void; onStart: () => void }) {
  return (
    <div className="mt-5 border border-dashed border-[#D4D4D4] px-6 py-10">
      <FileText className="h-6 w-6 text-[#737373]" strokeWidth={1.8} />
      <h3 className="mt-4 text-xl font-bold tracking-[-0.02em]">Your workspace is ready.</h3>
      <p className="mt-2 max-w-lg text-sm leading-7 text-[#525252]">Create your first document by uploading an existing CV or starting with a blank page.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={onUpload} className="inline-flex min-h-11 items-center gap-2 bg-[#4F46E5] px-4 text-sm font-semibold text-white hover:bg-[#4338CA]"><Upload className="h-4 w-4" strokeWidth={1.8} />Upload existing CV</button>
        <button type="button" onClick={onStart} className="inline-flex min-h-11 items-center gap-2 border border-[#D4D4D4] px-4 text-sm font-semibold hover:border-[#4F46E5] hover:text-[#4F46E5]"><FilePlus2 className="h-4 w-4" strokeWidth={1.8} />Start blank</button>
      </div>
    </div>
  );
}

function Notice({ notice, onDismiss }: { notice: NonNullable<Notice>; onDismiss: () => void }) {
  return (
    <div className={`mt-6 flex items-start justify-between gap-3 border px-4 py-3 text-sm leading-6 ${notice.tone === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-[#C7D2FE] bg-[#EEF2FF] text-[#3730A3]"}`} role="status">
      <span>{notice.message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss message" className="min-h-7 min-w-7 text-current opacity-70 hover:opacity-100"><X className="mx-auto h-4 w-4" strokeWidth={1.8} /></button>
    </div>
  );
}

function LoadingState() {
  return <main className="flex min-h-screen items-center justify-center bg-white text-sm text-[#737373]"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" strokeWidth={1.8} />Loading your workspace…</main>;
}

function AuthRequiredState() {
  return <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-[#171717]"><div className="max-w-md"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">myDoc</p><h1 className="mt-3 text-3xl font-bold tracking-[-0.02em]">Sign in to open your dashboard.</h1><p className="mt-3 text-sm leading-7 text-[#525252]">Your documents and activity belong to your account. Sign in to continue.</p><Link href="/login?next=/dashboard" className="mt-6 inline-flex min-h-11 items-center gap-2 bg-[#4F46E5] px-5 text-sm font-semibold text-white hover:bg-[#4338CA]">Sign in <ArrowRight className="h-4 w-4" strokeWidth={1.8} /></Link></div></main>;
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-[#171717]"><div className="max-w-md"><h1 className="text-2xl font-bold tracking-[-0.02em]">We couldn’t load your workspace.</h1><p className="mt-3 text-sm leading-7 text-[#525252]">Check your connection and try again.</p><button type="button" onClick={onRetry} className="mt-6 inline-flex min-h-11 items-center gap-2 border border-[#D4D4D4] px-5 text-sm font-semibold hover:border-[#4F46E5] hover:text-[#4F46E5]">Try again</button></div></main>;
}

function statusClass(status: DocumentItem["status"]) {
  if (status === "completed") return "border-green-200 bg-green-50 text-green-800";
  if (status === "in-progress") return "border-[#C7D2FE] bg-[#EEF2FF] text-[#3730A3]";
  return "border-[#D4D4D4] bg-[#F5F5F5] text-[#525252]";
}

function relativeDate(isoDate: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(isoDate));
}
