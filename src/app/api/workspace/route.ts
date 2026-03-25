import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { parseAppState } from "@/lib/parseAppState";

const REDIS_KEY = "timetable_shared_workspace_v1";

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ??
    process.env.timetable_shared_workspace_v1_KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.timetable_shared_workspace_v1_KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ enabled: false });
  }

  const raw = await redis.get<string>(REDIS_KEY);
  if (raw == null) {
    return NextResponse.json({ enabled: true, state: null });
  }

  let parsed: unknown;
  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return NextResponse.json({ enabled: true, state: null });
  }

  const state = parseAppState(parsed);
  return NextResponse.json({ enabled: true, state: state ?? null });
}

export async function PUT(request: Request) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Workspace sync is not configured (missing Redis env vars)." },
      { status: 501 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const state = parseAppState(body);
  if (!state) {
    return NextResponse.json({ error: "Invalid state shape" }, { status: 400 });
  }

  await redis.set(REDIS_KEY, JSON.stringify(state));
  return NextResponse.json({ ok: true });
}
