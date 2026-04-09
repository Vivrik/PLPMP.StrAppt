import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSession } from "@/lib/auth/session";

const schema = z.object({
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  const success = await createAdminSession(parsed.data.password);

  if (!success) {
    return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
