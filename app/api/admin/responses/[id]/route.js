import { getDb } from "../../../../../lib/firebaseAdmin";
import { isAuthed } from "../../../../../lib/adminAuth";

export async function DELETE(request, { params }) {
  if (!isAuthed()) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return Response.json({ ok: false, error: "missing id" }, { status: 400 });
  }

  try {
    const db = getDb();
    await db.ref("svt_survey_responses/" + id).remove();
    return Response.json({ ok: true });
  } catch (err) {
    console.error("delete response failed", err);
    return Response.json({ ok: false, error: "delete failed" }, { status: 500 });
  }
}
