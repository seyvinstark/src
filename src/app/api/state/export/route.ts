import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: false, message: "Client-side export only for MVP." }, { status: 400 });
}

