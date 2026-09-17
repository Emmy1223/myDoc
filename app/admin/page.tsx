import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllUsers, getAllDocuments } from "@/lib/server-db";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export default async function AdminPage() {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();

  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    redirect("/");
  }

  const [users, docs] = await Promise.all([getAllUsers(), getAllDocuments()]);

  return (
    <main className="min-h-screen bg-[#1c1c1e] p-8 text-white">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="mt-1 text-sm text-stone-400">
        {users.length} registered · {docs.length} documents
      </p>

      <h2 className="mt-8 text-lg font-semibold">Users</h2>
      <table className="mt-3 w-full text-sm">
        <thead className="text-left text-stone-400">
          <tr>
            <th className="py-2">Email</th>
            <th>Name</th>
            <th>Auth</th>
            <th>Docs</th>
            <th>Signed up</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-white/10">
              <td className="py-2">{u.email}</td>
              <td>{u.name}</td>
              <td className="text-stone-400">{u.oauthProvider ?? "password"}</td>
              <td>{u.documentCount}</td>
              <td className="text-stone-400">{new Date(u.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-10 text-lg font-semibold">Documents</h2>
      <table className="mt-3 w-full text-sm">
        <thead className="text-left text-stone-400">
          <tr>
            <th className="py-2">Title</th>
            <th>Owner</th>
            <th>Kind</th>
            <th>Exports</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((d) => (
            <tr key={d.id} className="border-t border-white/10">
              <td className="py-2">{d.title}</td>
              <td className="text-stone-400">{d.ownerEmail ?? "—"}</td>
              <td>{d.kind}</td>
              <td>{d.exportCount}</td>
              <td className="text-stone-400">{new Date(d.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}