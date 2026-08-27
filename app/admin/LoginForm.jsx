"use client";

import { useState } from "react";
import styles from "./admin.module.css";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErr(data.error || "登入失敗");
        setBusy(false);
        return;
      }
      window.location.reload();
    } catch {
      setErr("網路發生問題，請再試一次。");
      setBusy(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>後台登入</h1>
        <form onSubmit={onSubmit}>
          <div className={styles.field}>
            <label htmlFor="pw" className={styles.label}>密碼</label>
            <input
              id="pw"
              type="password"
              autoFocus
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              inputMode="numeric"
            />
          </div>
          <button type="submit" className={styles.button} disabled={busy || !password}>
            {busy ? "登入中…" : "登入"}
          </button>
          <p className={styles.err}>{err}</p>
        </form>
      </div>
    </div>
  );
}
