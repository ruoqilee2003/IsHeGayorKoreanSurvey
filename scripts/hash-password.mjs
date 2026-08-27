import crypto from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("用法：node scripts/hash-password.mjs <密碼>");
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");
console.log(`s2:${salt}:${hash}`);
