import { getDb } from "../../../../../lib/firebaseAdmin";
import { isAuthed } from "../../../../../lib/adminAuth";

export async function GET() {
  if (!isAuthed()) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const snap = await db.ref("svt_survey_responses").once("value");
    const val = snap.val() || {};
    const records = Object.entries(val)
      .map(([id, r]) => ({ id, ...r }))
      .sort((a, b) => (a.created_at || 0) - (b.created_at || 0));

    return new Response(JSON.stringify(records, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="svt-survey.json"',
      },
    });
  } catch (err) {
    console.error("json export failed", err);
    return Response.json({ ok: false, error: "export failed" }, { status: 500 });
  }
}
