import { getDb } from "../../../lib/firebaseAdmin";
import { sanitizeIncoming } from "../../../lib/responseFields";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ ok: false, error: "invalid body" }, { status: 400 });
  }

  const record = sanitizeIncoming(body);

  try {
    const db = getDb();
    const ref = db.ref("svt_survey_responses").push();
    await ref.set({
      ...record,
      created_at: Date.now(),
    });
    return Response.json({ ok: true, id: ref.key });
  } catch (err) {
    console.error("write response failed", err);
    return Response.json({ ok: false, error: "write failed" }, { status: 500 });
  }
}
