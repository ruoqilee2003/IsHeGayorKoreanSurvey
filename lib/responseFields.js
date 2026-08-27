// 問卷回覆的欄位定義，寫入與匯出共用，避免兩邊欄位兜不起來。

export const ARRAY_FIELDS = ["q2b", "fields", "factors"];

export const FIELD_KEYS = [
  "consent",
  "version",
  "is_carat",
  "skipped",
  "q1",
  "q2",
  "q2b",
  "q2b_other",
  "q3",
  "cp",
  "fields",
  "fields_other",
  "factors",
  "fac_other",
  "cross_yn",
  "cross",
  "reject",
  "real",
  "acc",
  "why",
  "amb0",
  "day0",
  "open0",
  "amb1",
  "day1",
  "open1",
  "amb2",
  "day2",
  "open2",
  "define",
];

const NUMBER_FIELDS = ["amb0", "day0", "amb1", "day1", "amb2", "day2"];

export const CSV_COLUMNS = [
  "created_at",
  "consent",
  "version",
  "is_carat",
  "q1",
  "q2",
  "q2b",
  "q2b_other",
  "q3",
  "cp",
  "fields",
  "fields_other",
  "factor1",
  "factor2",
  "factor3",
  "fac_other",
  "cross_yn",
  "cross",
  "reject",
  "real",
  "acc",
  "why",
  "amb0",
  "day0",
  "open0",
  "amb1",
  "day1",
  "open1",
  "amb2",
  "day2",
  "open2",
  "define",
  "skipped",
];

// 只保留允許清單裡的欄位，避免客戶端塞入任意資料寫進資料庫。
export function sanitizeIncoming(body) {
  const out = {};
  for (const key of FIELD_KEYS) {
    if (body[key] === undefined) continue;
    if (ARRAY_FIELDS.includes(key)) {
      out[key] = Array.isArray(body[key]) ? body[key].filter((v) => typeof v === "string") : [];
    } else if (key === "is_carat" || key === "skipped") {
      out[key] = !!body[key];
    } else if (NUMBER_FIELDS.includes(key)) {
      const n = Number(body[key]);
      out[key] = Number.isFinite(n) ? n : null;
    } else {
      out[key] = typeof body[key] === "string" ? body[key] : String(body[key] ?? "");
    }
  }
  out.client_submitted_at =
    typeof body.submitted_at === "string" ? body.submitted_at : null;
  return out;
}

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsvRow(record) {
  const factors = Array.isArray(record.factors) ? record.factors : [];
  const get = (key) => {
    if (key === "factor1") return factors[0] ?? "";
    if (key === "factor2") return factors[1] ?? "";
    if (key === "factor3") return factors[2] ?? "";
    if (ARRAY_FIELDS.includes(key)) return (record[key] || []).join(" / ");
    if (key === "created_at") {
      return record.created_at ? new Date(record.created_at).toISOString() : "";
    }
    return record[key] ?? "";
  };
  return CSV_COLUMNS.map((k) => csvEscape(get(k))).join(",");
}

export function toCsv(records) {
  const header = CSV_COLUMNS.join(",");
  const rows = records.map(toCsvRow);
  return "\uFEFF" + [header, ...rows].join("\n");
}

// \u5F8C\u53F0\u7D71\u8A08\u8981\u8DD1\u6B21\u6578\u5206\u5E03\u7684\u984C\u76EE\uFF08\u55AE\u9078\uFF0F\u91CF\u8868\u984C\uFF09\uFF0C\u958B\u653E\u984C\u4E0D\u5217\u5728\u9019\u88E1\u3002
export const TALLY_QUESTIONS = [
  { key: "consent", label: "\u662F\u5426\u540C\u610F\u586B\u7B54" },
  { key: "version", label: "\u7248\u672C" },
  { key: "is_carat", label: "\u662F\u5426\u70BA CARAT" },
  { key: "q1", label: "Q1\uFF0E\u662F\u5426\u95DC\u6CE8\u914D\u5C0D\u8A6E\u91CB" },
  { key: "q2", label: "Q2\uFF0E\u662F\u5426\u6301\u7E8C\u95DC\u6CE8 KPOP \u7537\u6027\u5076\u50CF\u5718\u9AD4" },
  { key: "q3", label: "Q3\uFF0E\u97D3\u570B\u5F71\u8996\uFF0F\u97D3\u8A9E\u63A5\u89F8\u7A0B\u5EA6" },
  { key: "real", label: "\u4E92\u52D5\u771F\u5BE6\u6027\u662F\u5426\u5F71\u97FF\u5438\u5F15\u529B" },
  { key: "acc", label: "\u5F97\u77E5\u7C89\u7D72\u8A6E\u91CB\u5F8C\u7684\u611F\u53D7" },
  { key: "cross_yn", label: "\u4E0D\u540C\u914D\u5C0D\u4E4B\u9593\u662F\u5426\u5177\u5171\u901A\u7279\u8CEA" },
  { key: "amb0", label: "\u60C5\u5883\u4E00\uFF0E\u66D6\u6627\u7A0B\u5EA6\uFF081\u20137\uFF09" },
  { key: "day0", label: "\u60C5\u5883\u4E00\uFF0E\u65E5\u5E38\u7A0B\u5EA6\uFF081\u20137\uFF09" },
  { key: "amb1", label: "\u60C5\u5883\u4E8C\uFF0E\u66D6\u6627\u7A0B\u5EA6\uFF081\u20137\uFF09" },
  { key: "day1", label: "\u60C5\u5883\u4E8C\uFF0E\u65E5\u5E38\u7A0B\u5EA6\uFF081\u20137\uFF09" },
  { key: "amb2", label: "\u60C5\u5883\u4E09\uFF0E\u66D6\u6627\u7A0B\u5EA6\uFF081\u20137\uFF09" },
  { key: "day2", label: "\u60C5\u5883\u4E09\uFF0E\u65E5\u5E38\u7A0B\u5EA6\uFF081\u20137\uFF09" },
];

export function buildTallies(records) {
  const tallies = {};
  for (const q of TALLY_QUESTIONS) {
    const counts = {};
    for (const r of records) {
      let v = r[q.key];
      if (v === undefined || v === null || v === "") continue;
      if (q.key === "is_carat") v = v ? "CARAT" : "\u975E CARAT";
      const label = String(v);
      counts[label] = (counts[label] || 0) + 1;
    }
    tallies[q.key] = { label: q.label, counts };
  }
  const factorCounts = {};
  for (const r of records) {
    for (const f of r.factors || []) {
      factorCounts[f] = (factorCounts[f] || 0) + 1;
    }
  }
  tallies.factors = { label: "\u6700\u5438\u5F15\u4EBA\u7684\u56E0\u7D20\uFF08\u8907\u9078\uFF09", counts: factorCounts };
  return tallies;
}
