import { getDb } from "../../../../../lib/firebaseAdmin";
import { isAuthed } from "../../../../../lib/adminAuth";
import { toCsv } from "../../../../../lib/responseFields";

export async function GET() {
  if (!isAuthed()) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const snap = await db.ref("svt_survey_responses").once("value");
    const val = snap.val() || {};
    const records = Object.values(val).sort(
      (a, b) => (a.created_at || 0) - (b.created_at || 0)
    );
    const csv = toCsv(records);

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="svt-survey.csv"',
      },
    });
  } catch (err) {
    console.error("csv export failed", err);
    return Response.json({ ok: false, error: "export failed" }, { status: 500 });
  }
}
