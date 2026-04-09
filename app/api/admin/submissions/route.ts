import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/session";
import { listSubmissions } from "@/lib/repository";

export async function GET() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const submissions = await listSubmissions();
  return NextResponse.json({ submissions });
}
