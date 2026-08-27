import { cookies, headers } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SEC,
  createSessionToken,
  verifyPassword,
  isRateLimited,
  recordFailedAttempt,
  clearAttempts,
} from "../../../../lib/adminAuth";

function getIp() {
  const h = headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

export async function POST(request) {
  const ip = getIp();
  if (isRateLimited(ip)) {
    return Response.json(
      { ok: false, error: "嘗試次數過多，請稍後再試。" },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid body" }, { status: 400 });
  }

  const password = body?.password;
  const storedHash = process.env.ADMIN_PASSWORD_HASH;

  if (!storedHash || !verifyPassword(password, storedHash)) {
    recordFailedAttempt(ip);
    return Response.json({ ok: false, error: "密碼錯誤" }, { status: 401 });
  }

  clearAttempts(ip);
  const token = createSessionToken();
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });

  return Response.json({ ok: true });
}
