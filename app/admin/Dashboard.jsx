"use client";

import { useEffect, useState } from "react";
import styles from "./admin.module.css";

function QuestionBar({ label, counts }) {
  const entries = Object.entries(counts);
  const total = entries.reduce((sum, [, n]) => sum + n, 0);
  if (total === 0) return null;
  const max = Math.max(...entries.map(([, n]) => n));
  return (
    <div className={styles.question}>
      <h3>{label}</h3>
      {entries.map(([opt, n]) => (
        <div key={opt} className={styles.barRow}>
          <div className={styles.barLabel}>{opt}</div>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: (n / max) * 100 + "%" }} />
          </div>
          <div className={styles.barCount}>{n}</div>
        </div>
      ))}
    </div>
  );
}

function RecordCard({ record, onDeleted }) {
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!window.confirm("確定要刪除這筆回覆嗎？此動作無法復原。")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/responses/${record.id}`, { method: "DELETE" });
    if (res.ok) {
      onDeleted(record.id);
    } else {
      setBusy(false);
      alert("刪除失敗，請再試一次。");
    }
  }

  return (
    <div className={styles.record}>
      <div className={styles.recordHead}>
        <div className={styles.recordMeta}>
          {record.created_at ? new Date(record.created_at).toLocaleString("zh-TW") : ""}
          {" · "}
          {record.version || "—"}
          {record.is_carat ? "・CARAT" : ""}
        </div>
        <button className={styles.deleteBtn} onClick={del} disabled={busy}>
          {busy ? "刪除中…" : "刪除"}
        </button>
      </div>

      {record.sex && (
        <p>
          <b>生理性別：</b>
          {record.sex}
          {record.sex === "其他" && record.sex_other ? `（${record.sex_other}）` : ""}
        </p>
      )}
      {record.orient && (
        <p>
          <b>性取向：</b>
          {record.orient}
          {record.orient === "其他" && record.orient_other ? `（${record.orient_other}）` : ""}
        </p>
      )}
      {record.q1 && (
        <p>
          <b>是否關注配對詮釋：</b>
          {record.q1}
        </p>
      )}
      {record.cp_orient?.length > 0 && (
        <p>
          <b>關注的角色戀愛性向關係：</b>
          {record.cp_orient.join(" / ")}
          {record.cp_orient.includes("其他") && record.cp_orient_other ? `（${record.cp_orient_other}）` : ""}
        </p>
      )}
      {record.q2 && (
        <p>
          <b>是否持續關注 KPOP 男性偶像團體：</b>
          {record.q2}
        </p>
      )}
      {record.q2b?.length > 0 && (
        <p>
          <b>主要關注的團體：</b>
          {record.q2b.join(" / ")}
          {record.q2b_other ? `（其他：${record.q2b_other}）` : ""}
        </p>
      )}
      {record.q3 && (
        <p>
          <b>韓國影視／韓語接觸程度：</b>
          {record.q3}
        </p>
      )}
      {record.cp && (
        <p>
          <b>配對：</b>
          {record.cp}
        </p>
      )}
      {record.fields?.length > 0 && (
        <p>
          <b>領域：</b>
          {record.fields.join(" / ")}
          {record.fields_other ? `（其他：${record.fields_other}）` : ""}
        </p>
      )}
      {record.factors?.length > 0 && (
        <p>
          <b>因素：</b>
          {record.factors.join(" / ")}
          {record.fac_other ? `（其他：${record.fac_other}）` : ""}
        </p>
      )}
      {record.cross_yn && (
        <p>
          <b>是否具有共通特質：</b>
          {record.cross_yn}
          {record.cross_yn === "是" && record.cross ? `（${record.cross}）` : ""}
        </p>
      )}
      {record.reject && (
        <p>
          <b>嗑不下去的配對：</b>
          {record.reject}
        </p>
      )}
      {record.real && (
        <p>
          <b>互動安排性對吸引力的影響：</b>
          {record.real}
        </p>
      )}
      {record.acc && (
        <p>
          <b>得知粉絲詮釋後的感受：</b>
          {record.acc}
        </p>
      )}
      {record.why && (
        <p>
          <b>理由：</b>
          {record.why}
        </p>
      )}
      {[0, 1, 2].map((i) => {
        const amb = record["amb" + i];
        const day = record["day" + i];
        const open = record["open" + i];
        if (!amb && !day && !open) return null;
        return (
          <p key={i}>
            <b>情境{"一二三"[i]}：</b>
            {amb ? `曖昧 ${amb}／7　` : ""}
            {day ? `日常 ${day}／7　` : ""}
            {open}
          </p>
        );
      })}
      {record.define && (
        <p>
          <b>對官方定義的感受：</b>
          {record.define}
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    load();
  }, []);

  function load() {
    fetch("/api/admin/summary")
      .then((res) => res.json())
      .then((d) => {
        if (!d.ok) {
          setErr(d.error || "讀取失敗");
          return;
        }
        setData(d);
      })
      .catch(() => setErr("網路發生問題"));
  }

  function onDeleted(id) {
    setData((prev) => ({
      ...prev,
      total: prev.total - 1,
      records: prev.records.filter((r) => r.id !== id),
    }));
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.dashboard}>
        <h1 className={styles.title}>回收狀況</h1>

        {err && <p className={styles.err}>{err}</p>}

        {data && (
          <>
            <div className={styles.statRow}>
              <div className={styles.stat}>
                <div className={styles.n}>{data.total}</div>
                <div className={styles.label}>總回覆數</div>
              </div>
            </div>

            <div className={styles.actions}>
              <a href="/api/admin/export/csv">匯出 CSV</a>
              <a href="/api/admin/export/json">匯出 JSON</a>
            </div>

            <h2 className={styles.sectionTitle}>初步統計</h2>
            {Object.values(data.tallies).map((t) => (
              <QuestionBar key={t.label} label={t.label} counts={t.counts} />
            ))}

            <h2 className={styles.sectionTitle}>原始回覆（{data.records.length} 筆）</h2>
            {data.records.map((r) => (
              <RecordCard key={r.id} record={r} onDeleted={onDeleted} />
            ))}
          </>
        )}

        <button className={`${styles.button} ${styles.logout}`} onClick={logout}>
          登出
        </button>
      </div>
    </div>
  );
}
