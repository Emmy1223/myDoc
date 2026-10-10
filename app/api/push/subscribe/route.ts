import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { savePushSubscription } from "@/lib/server-db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Auth required" }, { status: 401 });
  }

  const body = (await request.json()) as {
    endpoint?: string;
    keys?: { auth?: string; p256dh?: string };
  };

  if (!body.endpoint || !body.keys?.auth || !body.keys?.p256dh) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  await savePushSubscription({
    userId,
    endpoint: body.endpoint,
    auth: body.keys.auth,
    p256dh: body.keys.p256dh,
  });

  return NextResponse.json({ ok: true });
}