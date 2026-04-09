import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "bd_admin_session";

function expectedHash(): string {
  const secret = process.env.ADMIN_PASSWORD ?? "change-me";
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  return token === expectedHash();
}

export async function createAdminSession(password: string): Promise<boolean> {
  if (crypto.createHash("sha256").update(password).digest("hex") !== expectedHash()) {
    return false;
  }

  const store = await cookies();

  store.set(COOKIE_NAME, expectedHash(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  return true;
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
