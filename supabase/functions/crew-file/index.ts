// crew-file: crews (not signed in) open an assignment attachment. Checks crew + PIN + that the file is attached to
// one of that crew's assignments (crew_doc_path RPC), then returns a 5-minute signed URL. Deploy with --no-verify-jwt.
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const SB = Deno.env.get("SUPABASE_URL"), SK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SB || !SK) return json({ error: "not configured" }, 500);
  let d: Record<string, unknown> = {};
  try { d = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const crew = String(d.crew || "").slice(0, 80), pin = String(d.pin || ""), doc = String(d.doc_id || "");
  if (!crew || !/^\d{4}$/.test(pin) || !/^[0-9a-f-]{36}$/i.test(doc)) return json({ error: "not_allowed" }, 403);
  const h = { apikey: SK, Authorization: "Bearer " + SK, "Content-Type": "application/json" };
  const r = await fetch(SB + "/rest/v1/rpc/crew_doc_path", { method: "POST", headers: h, body: JSON.stringify({ p_crew: crew, p_pin: pin, p_doc: doc }) }).catch(() => null);
  const path = r && r.ok ? await r.json().catch(() => null) : null;
  if (!path || typeof path !== "string") return json({ error: "not_allowed" }, 403);
  const enc = path.split("/").map(encodeURIComponent).join("/");
  const s = await fetch(SB + "/storage/v1/object/sign/job-documents/" + enc, { method: "POST", headers: h, body: JSON.stringify({ expiresIn: 300 }) }).catch(() => null);
  const sj = s && s.ok ? await s.json().catch(() => null) : null;
  const u = sj && (sj.signedURL || sj.signedUrl);
  if (!u) return json({ error: "not_found" }, 404);
  return json({ ok: true, url: SB + "/storage/v1" + u });
});
