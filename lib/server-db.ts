import "server-only";

import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type DocumentStatus = "draft" | "in-progress" | "completed";
export type DocumentKind = "CV" | "Cover Letter" | "Proposal";
export type ActivityType = "created" | "duplicated" | "exported" | "deleted";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type TemplateRecord = {
  id: string;
  name: string;
  category: DocumentKind | "CVs" | "Cover Letters" | "Proposals";
  description: string;
};

export type DocumentRecord = {
  id: string;
  userId: string;
  title: string;
  kind: DocumentKind;
  status: DocumentStatus;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  exportCount: number;
  sourceDocumentId?: string;
  content?: Record<string, unknown>;
};

export type ActivityRecord = {
  id: string;
  userId: string;
  type: ActivityType;
  documentId?: string;
  documentTitle: string;
  createdAt: string;
};

type Database = {
  users: UserRecord[];
  templates: TemplateRecord[];
  documents: DocumentRecord[];
  activities: ActivityRecord[];
};

const databasePath = join(process.cwd(), ".data", "mydoc.json");

// Templates are system records. User documents, activity, and user accounts are
// never seeded, so every dashboard count starts from the real database state.
const availableTemplates: TemplateRecord[] = [
  {
    id: "folio",
    name: "Folio",
    category: "CVs",
    description: "A clean single-column CV for focused applications.",
  },
  {
    id: "ledger",
    name: "Ledger",
    category: "CVs",
    description: "A structured two-column CV for detailed experience.",
  },
  {
    id: "slab",
    name: "Slab",
    category: "CVs",
    description: "A spacious CV with strong hierarchy and clear sections.",
  },
  {
    id: "correspondence",
    name: "Correspondence",
    category: "Cover Letters",
    description: "A direct, well-spaced layout for cover letters.",
  },
  {
    id: "brief",
    name: "Brief",
    category: "Proposals",
    description: "A compact proposal layout for client-ready documents.",
  },
];

function emptyDatabase(): Database {
  return {
    users: [],
    templates: availableTemplates,
    documents: [],
    activities: [],
  };
}

function loadDatabase(): Database {
  mkdirSync(dirname(databasePath), { recursive: true });
  try {
    const parsed = JSON.parse(readFileSync(databasePath, "utf8")) as Partial<Database>;
    return {
      users: parsed.users ?? [],
      templates: parsed.templates?.length ? parsed.templates : availableTemplates,
      documents: parsed.documents ?? [],
      activities: parsed.activities ?? [],
    };
  } catch {
    const database = emptyDatabase();
    saveDatabase(database);
    return database;
  }
}

function saveDatabase(database: Database) {
  mkdirSync(dirname(databasePath), { recursive: true });
  const temporaryPath = `${databasePath}.tmp`;
  writeFileSync(temporaryPath, JSON.stringify(database, null, 2), "utf8");
  renameSync(temporaryPath, databasePath);
}

function now() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

export function hashPassword(password: string) {
  const salt = randomUUID();
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, expected] = storedHash.split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");
  return expectedBuffer.length === actual.length && timingSafeEqual(actual, expectedBuffer);
}

export function getUser(userId: string) {
  return loadDatabase().users.find((user) => user.id === userId) ?? null;
}

export function getUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return loadDatabase().users.find((user) => user.email === normalizedEmail) ?? null;
}

export function registerUser({ name, email, password }: { name: string; email: string; password: string }) {
  const database = loadDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  if (database.users.some((user) => user.email === normalizedEmail)) {
    return { error: "An account with this email already exists." as const };
  }

  const user: UserRecord = {
    id: id("user"),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: now(),
  };
  database.users.push(user);
  saveDatabase(database);
  return { user };
}

export function authenticateUser({ email, password }: { email: string; password: string }) {
  const user = getUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "The email or password is incorrect." as const };
  }
  return { user };
}

function publicUser(user: UserRecord) {
  return { id: user.id, name: user.name, email: user.email };
}

function templateName(database: Database, templateId: string) {
  return database.templates.find((template) => template.id === templateId)?.name ?? templateId;
}

function publicDocument(database: Database, document: DocumentRecord) {
  return {
    id: document.id,
    title: document.title,
    kind: document.kind,
    status: document.status,
    templateId: document.templateId,
    templateName: templateName(database, document.templateId),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    exportCount: document.exportCount,
  };
}

function addActivity(
  database: Database,
  values: Omit<ActivityRecord, "id" | "createdAt">,
) {
  database.activities.push({ ...values, id: id("activity"), createdAt: now() });
}

export function getDashboardData(userId: string, category?: string) {
  const database = loadDatabase();
  const user = database.users.find((item) => item.id === userId);
  if (!user) return null;

  const documents = database.documents
    .filter((document) => document.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const usage = new Map<string, number>();
  documents.forEach((document) => {
    usage.set(document.templateId, (usage.get(document.templateId) ?? 0) + 1);
  });

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const exportsThisMonth = database.activities.filter(
    (activity) =>
      activity.userId === userId &&
      activity.type === "exported" &&
      activity.createdAt >= monthStart.toISOString(),
  ).length;
  const mostUsedTemplateId = [...usage.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const selectedTemplates = database.templates.filter(
    (template) => !category || template.category === category,
  );

  return {
    user: publicUser(user),
    documents: documents.map((document) => publicDocument(database, document)),
    templates: selectedTemplates.map((template) => ({
      ...template,
      usageCount: usage.get(template.id) ?? 0,
    })),
    categories: [...new Set(database.templates.map((template) => template.category))],
    stats: {
      totalDocuments: documents.length,
      exportsThisMonth,
      mostUsedTemplate: mostUsedTemplateId
        ? templateName(database, mostUsedTemplateId)
        : null,
    },
    activities: database.activities
      .filter((activity) => activity.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 12)
      .map(({ id: activityId, type, documentId, documentTitle, createdAt }) => ({
        id: activityId,
        type,
        documentId,
        documentTitle,
        createdAt,
      })),
  };
}

export function createDocument({
  userId,
  title,
  kind = "CV",
  templateId = "folio",
  status = "draft",
  sourceDocumentId,
}: {
  userId: string;
  title: string;
  kind?: DocumentKind;
  templateId?: string;
  status?: DocumentStatus;
  sourceDocumentId?: string;
}) {
  const database = loadDatabase();
  const timestamp = now();
  const document: DocumentRecord = {
    id: id("document"),
    userId,
    title: title.trim() || "Untitled document",
    kind,
    status,
    templateId,
    createdAt: timestamp,
    updatedAt: timestamp,
    exportCount: 0,
    sourceDocumentId,
  };
  database.documents.push(document);
  addActivity(database, {
    userId,
    type: "created",
    documentId: document.id,
    documentTitle: document.title,
  });
  saveDatabase(database);
  return publicDocument(database, document);
}

export function getDocument(userId: string, documentId: string) {
  const database = loadDatabase();
  const document = database.documents.find(
    (item) => item.userId === userId && item.id === documentId,
  );
  if (!document) return null;
  return { ...publicDocument(database, document), content: document.content ?? null };
}

export function updateDocument(
  userId: string,
  documentId: string,
  values: {
    title?: string;
    templateId?: string;
    status?: DocumentStatus;
    content?: Record<string, unknown>;
  },
) {
  const database = loadDatabase();
  const document = database.documents.find(
    (item) => item.userId === userId && item.id === documentId,
  );
  if (!document) return null;

  if (typeof values.title === "string") document.title = values.title.trim() || "Untitled document";
  if (typeof values.templateId === "string") document.templateId = values.templateId;
  if (values.status) document.status = values.status;
  if (values.content) document.content = values.content;
  document.updatedAt = now();
  saveDatabase(database);
  return publicDocument(database, document);
}

export function duplicateDocument(userId: string, documentId: string) {
  const database = loadDatabase();
  const source = database.documents.find(
    (item) => item.userId === userId && item.id === documentId,
  );
  if (!source) return null;

  const timestamp = now();
  const document: DocumentRecord = {
    ...source,
    id: id("document"),
    title: `${source.title} copy`,
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
    exportCount: 0,
    sourceDocumentId: source.id,
  };
  database.documents.push(document);
  addActivity(database, {
    userId,
    type: "duplicated",
    documentId: document.id,
    documentTitle: document.title,
  });
  saveDatabase(database);
  return publicDocument(database, document);
}

export function exportDocument(userId: string, documentId: string) {
  const database = loadDatabase();
  const document = database.documents.find(
    (item) => item.userId === userId && item.id === documentId,
  );
  if (!document) return null;

  document.exportCount += 1;
  document.updatedAt = now();
  addActivity(database, {
    userId,
    type: "exported",
    documentId: document.id,
    documentTitle: document.title,
  });
  saveDatabase(database);
  return publicDocument(database, document);
}

export function deleteDocument(userId: string, documentId: string) {
  const database = loadDatabase();
  const index = database.documents.findIndex(
    (item) => item.userId === userId && item.id === documentId,
  );
  if (index === -1) return null;
  const [document] = database.documents.splice(index, 1);
  addActivity(database, {
    userId,
    type: "deleted",
    documentTitle: document.title,
  });
  saveDatabase(database);
  return publicDocument(database, document);
}

export function cloneMostRecentDocument(userId: string) {
  const database = loadDatabase();
  const latest = database.documents
    .filter((document) => document.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  if (!latest) return null;
  return duplicateDocument(userId, latest.id);
}
