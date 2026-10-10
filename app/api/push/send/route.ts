import { NextResponse } from "next/server";
import webpush from "web-push";
import { getSessionUserId } from "@/lib/session";
import { getAllPushSubscriptions } from "@/lib/server-db";

export const runtime = "nodejs";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Auth required" }, { status: 401 });
  }

  // Optionally: check admin here using ADMIN_EMAILS

  const body = (await request.json()) as {
    title?: string;
    body?: string;
    url?: string;
  };

  const title = body.title?.trim() || "myDoc";
  const message = body.body?.trim();
  const url = body.url?.trim() || "/dashboard";

  if (!message) {
    return NextResponse.json({ error: "Body is required" }, { status: 400 });
  }

  const subs = await getAllPushSubscriptions();

  const results = await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        {
          endpoint: s.endpoint,
          keys: { auth: s.auth, p256dh: s.p256dh },
        },
        JSON.stringify({ title, body: message, url, icon: "/icon-192.png" })
      )
    )
  );

  const delivered = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ delivered, failed, total: subs.length });
}