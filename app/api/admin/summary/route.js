import { getDb } from "../../../../lib/firebaseAdmin";
import { isAuthed } from "../../../../lib/adminAuth";
import { buildTallies } from "../../../../lib/responseFields";

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
      .sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

    return Response.json({
      ok: true,
      total: records.length,
      tallies: buildTallies(records),
      records,
    });
  } catch (err) {
    console.error("summary failed", err);
    return Response.json({ ok: false, error: "read failed" }, { status: 500 });
  }
}
