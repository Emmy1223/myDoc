import "server-only";

import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";

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

// ============================================================
// DATABASE CONNECTION
// ============================================================

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local for local dev, and to Vercel → Settings → Environment Variables for production.",
  );
}

const sql = neon(connectionString);

// ============================================================
// TEMPLATES (system records, seeded in code)
// ============================================================

const availableTemplates: TemplateRecord[] = [
  { id: "folio", name: "Folio", category: "CVs", description: "A clean single-column CV for focused applications." },
  { id: "ledger", name: "Ledger", category: "CVs", description: "A structured two-column CV for detailed experience." },
  { id: "slab", name: "Slab", category: "CVs", description: "A spacious CV with strong hierarchy and clear sections." },
  { id: "correspondence", name: "Correspondence", category: "Cover Letters", description: "A direct, well-spaced layout for cover letters." },
  { id: "brief", name: "Brief", category: "Proposals", description: "A compact proposal layout for client-ready documents." },
];

// ============================================================
// SCHEMA INITIALIZATION (runs once per serverless instance)
// ============================================================

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        oauth_provider TEXT,
        oauth_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    // Safe migrations for existing tables
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_id TEXT`;
    await sql`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id) WHERE oauth_provider IS NOT NULL`;

    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        kind TEXT NOT NULL,
        status TEXT NOT NULL,
        template_id TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        export_count INTEGER NOT NULL DEFAULT 0,
        source_document_id TEXT,
        content JSONB
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        document_id TEXT,
        document_title TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id)`;
  })();

  return schemaReady;
}

// ============================================================
// HELPERS
// ============================================================

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

function rowToUser(row: any): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash ?? "",
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

function templateName(templateId: string) {
  return availableTemplates.find((template) => template.id === templateId)?.name ?? templateId;
}

function publicUser(user: UserRecord) {
  return { id: user.id, name: user.name, email: user.email };
}

// ============================================================
// USERS
// ============================================================

export async function getUser(userId: string): Promise<UserRecord | null> {
  await ensureSchema();
  const rows = await sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`;
  return rows.length > 0 ? rowToUser(rows[0]) : null;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  await ensureSchema();
  const normalizedEmail = email.trim().toLowerCase();
  const rows = await sql`SELECT * FROM users WHERE email = ${normalizedEmail} LIMIT 1`;
  return rows.length > 0 ? rowToUser(rows[0]) : null;
}

export async function registerUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: UserRecord } | { error: string }> {
  await ensureSchema();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await sql`SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1`;
  if (existing.length > 0) {
    return { error: "An account with this email already exists." };
  }

  const user: UserRecord = {
    id: id("user"),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: now(),
  };

  await sql`
    INSERT INTO users (id, name, email, password_hash, created_at)
    VALUES (${user.id}, ${user.name}, ${user.email}, ${user.passwordHash}, ${user.createdAt})
  `;

  return { user };
}

export async function authenticateUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ user: UserRecord } | { error: string }> {
  await ensureSchema();
  const user = await getUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "The email or password is incorrect." };
  }
  return { user };
}

export async function findOrCreateOAuthUser({
  provider,
  providerAccountId,
  email,
  name,
}: {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string;
}): Promise<{ user: UserRecord } | { error: string }> {
  await ensureSchema();
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Try to find by OAuth provider + id
  const byOauth = (await sql`
    SELECT * FROM users
    WHERE oauth_provider = ${provider} AND oauth_id = ${providerAccountId}
    LIMIT 1
  `) as any[];

  if (byOauth.length > 0) {
    return { user: rowToUser(byOauth[0]) };
  }

  // 2. Try to find by email (link existing account)
  const byEmail = (await sql`
    SELECT * FROM users WHERE email = ${normalizedEmail} LIMIT 1
  `) as any[];

  if (byEmail.length > 0) {
    // Link OAuth to existing account
    await sql`
      UPDATE users
      SET oauth_provider = ${provider}, oauth_id = ${providerAccountId}
      WHERE id = ${byEmail[0].id}
    `;
    return { user: rowToUser({ ...byEmail[0], oauth_provider: provider, oauth_id: providerAccountId }) };
  }

  // 3. Create a new user
  const newUser: UserRecord = {
    id: id("user"),
    name: name.trim() || normalizedEmail.split("@")[0],
    email: normalizedEmail,
    passwordHash: "",
    createdAt: now(),
  };

  await sql`
    INSERT INTO users (id, name, email, password_hash, oauth_provider, oauth_id, created_at)
    VALUES (
      ${newUser.id}, ${newUser.name}, ${newUser.email}, NULL,
      ${provider}, ${providerAccountId}, ${newUser.createdAt}
    )
  `;

  return { user: newUser };
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getDashboardData(userId: string, category?: string) {
  await ensureSchema();
  const user = await getUser(userId);
  if (!user) return null;

  const documentRows = (await sql`
    SELECT * FROM documents WHERE user_id = ${userId} ORDER BY updated_at DESC
  `) as any[];

  const activityRows = (await sql`
    SELECT * FROM activities WHERE user_id = ${userId} ORDER BY created_at DESC
  `) as any[];

  const usage = new Map<string, number>();
  documentRows.forEach((doc) => {
    usage.set(doc.template_id, (usage.get(doc.template_id) ?? 0) + 1);
  });

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const exportsThisMonth = activityRows.filter((activity) => {
    const createdAt =
      activity.created_at instanceof Date
        ? activity.created_at.toISOString()
        : String(activity.created_at);
    return activity.type === "exported" && createdAt >= monthStart.toISOString();
  }).length;

  const mostUsedTemplateId = [...usage.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  const selectedTemplates = availableTemplates.filter(
    (template) => !category || template.category === category,
  );

  return {
    user: publicUser(user),
    documents: documentRows.map((row) => ({
      id: row.id,
      title: row.title,
      kind: row.kind,
      status: row.status,
      templateId: row.template_id,
      templateName: templateName(row.template_id),
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
      exportCount: row.export_count,
    })),
    templates: selectedTemplates.map((template) => ({
      ...template,
      usageCount: usage.get(template.id) ?? 0,
    })),
    categories: [...new Set(availableTemplates.map((template) => template.category))],
    stats: {
      totalDocuments: documentRows.length,
      exportsThisMonth,
      mostUsedTemplate: mostUsedTemplateId ? templateName(mostUsedTemplateId) : null,
    },
    activities: activityRows.slice(0, 12).map((row) => ({
      id: row.id,
      type: row.type,
      documentId: row.document_id ?? undefined,
      documentTitle: row.document_title,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    })),
  };
}

// ============================================================
// DOCUMENTS
// ============================================================

export async function createDocument({
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
  await ensureSchema();
  const timestamp = now();
  const documentId = id("document");
  const cleanTitle = title.trim() || "Untitled document";

  await sql`
    INSERT INTO documents (
      id, user_id, title, kind, status, template_id,
      created_at, updated_at, export_count, source_document_id
    )
    VALUES (
      ${documentId}, ${userId}, ${cleanTitle}, ${kind}, ${status}, ${templateId},
      ${timestamp}, ${timestamp}, 0, ${sourceDocumentId ?? null}
    )
  `;

  await addActivity({
    userId,
    type: "created",
    documentId,
    documentTitle: cleanTitle,
  });

  return {
    id: documentId,
    title: cleanTitle,
    kind,
    status,
    templateId,
    templateName: templateName(templateId),
    createdAt: timestamp,
    updatedAt: timestamp,
    exportCount: 0,
  };
}

export async function getDocument(userId: string, documentId: string) {
  await ensureSchema();
  const rows = (await sql`
    SELECT * FROM documents WHERE user_id = ${userId} AND id = ${documentId} LIMIT 1
  `) as any[];

  if (rows.length === 0) return null;
  const row = rows[0];

  return {
    id: row.id,
    title: row.title,
    kind: row.kind,
    status: row.status,
    templateId: row.template_id,
    templateName: templateName(row.template_id),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
    exportCount: row.export_count,
    content: row.content ?? null,
  };
}

export async function updateDocument(
  userId: string,
  documentId: string,
  values: {
    title?: string;
    templateId?: string;
    status?: DocumentStatus;
    content?: Record<string, unknown>;
  },
) {
  await ensureSchema();
  const existing = await getDocument(userId, documentId);
  if (!existing) return null;

  const newTitle =
    typeof values.title === "string"
      ? values.title.trim() || "Untitled document"
      : existing.title;
  const newTemplateId =
    typeof values.templateId === "string" ? values.templateId : existing.templateId;
  const newStatus = values.status ?? (existing.status as DocumentStatus);
  const newContent =
    values.content !== undefined ? values.content : existing.content;
  const timestamp = now();

  await sql`
    UPDATE documents
    SET title = ${newTitle},
        template_id = ${newTemplateId},
        status = ${newStatus},
        content = ${newContent ? JSON.stringify(newContent) : null}::jsonb,
        updated_at = ${timestamp}
    WHERE id = ${documentId} AND user_id = ${userId}
  `;

  return {
    ...existing,
    title: newTitle,
    templateId: newTemplateId,
    templateName: templateName(newTemplateId),
    status: newStatus,
    updatedAt: timestamp,
  };
}

export async function duplicateDocument(userId: string, documentId: string) {
  await ensureSchema();
  const source = await getDocument(userId, documentId);
  if (!source) return null;

  const timestamp = now();
  const newId = id("document");
  const newTitle = `${source.title} copy`;

  await sql`
    INSERT INTO documents (
      id, user_id, title, kind, status, template_id,
      created_at, updated_at, export_count, source_document_id, content
    )
    VALUES (
      ${newId}, ${userId}, ${newTitle}, ${source.kind}, 'draft', ${source.templateId},
      ${timestamp}, ${timestamp}, 0, ${source.id},
      ${source.content ? JSON.stringify(source.content) : null}::jsonb
    )
  `;

  await addActivity({
    userId,
    type: "duplicated",
    documentId: newId,
    documentTitle: newTitle,
  });

  return {
    ...source,
    id: newId,
    title: newTitle,
    status: "draft" as DocumentStatus,
    createdAt: timestamp,
    updatedAt: timestamp,
    exportCount: 0,
  };
}

export async function exportDocument(userId: string, documentId: string) {
  await ensureSchema();
  const document = await getDocument(userId, documentId);
  if (!document) return null;

  const timestamp = now();
  await sql`
    UPDATE documents
    SET export_count = export_count + 1, updated_at = ${timestamp}
    WHERE id = ${documentId} AND user_id = ${userId}
  `;

  await addActivity({
    userId,
    type: "exported",
    documentId,
    documentTitle: document.title,
  });

  return { ...document, exportCount: document.exportCount + 1, updatedAt: timestamp };
}

export async function deleteDocument(userId: string, documentId: string) {
  await ensureSchema();
  const document = await getDocument(userId, documentId);
  if (!document) return null;

  await sql`DELETE FROM documents WHERE id = ${documentId} AND user_id = ${userId}`;

  await addActivity({
    userId,
    type: "deleted",
    documentTitle: document.title,
  });

  return document;
}

export async function cloneMostRecentDocument(userId: string) {
  await ensureSchema();
  const rows = (await sql`
    SELECT id FROM documents WHERE user_id = ${userId} ORDER BY updated_at DESC LIMIT 1
  `) as any[];

  if (rows.length === 0) return null;
  return duplicateDocument(userId, rows[0].id);
}

// ============================================================
// ACTIVITIES (internal helper)
// ============================================================

async function addActivity(values: {
  userId: string;
  type: ActivityType;
  documentId?: string;
  documentTitle: string;
}) {
  await sql`
    INSERT INTO activities (id, user_id, type, document_id, document_title, created_at)
    VALUES (
      ${id("activity")}, ${values.userId}, ${values.type},
      ${values.documentId ?? null}, ${values.documentTitle}, ${now()}
    )
  `;
}