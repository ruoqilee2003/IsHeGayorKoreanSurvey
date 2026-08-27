import crypto from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "svt_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 小時

export function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  const parts = storedHash.split(":");
  if (parts.length !== 3 || parts[0] !== "s2") return false;
  const [, salt, hashHex] = parts;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(password, salt, expected.length);
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

function sign(payload) {
  const secret = process.env.ADMIN_SESSION_SECRET || "";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_TTL_MS })
  ).toString("base64url");
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== "string") return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

export const SESSION_MAX_AGE_SEC = SESSION_TTL_MS / 1000;

export function isAuthed() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

// 簡易記憶體內失敗次數限制（每 IP，重啟後歸零；規模小的問卷後台夠用）
const attempts = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export function isRateLimited(ip) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.start > WINDOW_MS) return false;
  return rec.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(ip) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.start > WINDOW_MS) {
    attempts.set(ip, { start: now, count: 1 });
  } else {
    rec.count += 1;
  }
}

export function clearAttempts(ip) {
  attempts.delete(ip);
}
