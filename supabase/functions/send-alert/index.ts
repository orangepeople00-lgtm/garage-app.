// send-alert: forwards AGB alerts to the Apps Script web app. URL + token live in Supabase secrets.
// kind "new_job": any active signed-in staff user. kind "test" (or any source containing "test"): only ramsey.
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const TESTERS = ["ramsey"];
const clip = (v: unknown, n = 200) => String(v ?? "").replace(/[\r\n]+/g, " ").slice(0, n);
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const SB = Deno.env.get("SUPABASE_URL"), AK = Deno.env.get("SUPABASE_ANON_KEY");
  const URL_ = Deno.env.get("ALERT_URL"), TOK = Deno.env.get("ALERT_TOKEN");
  if (!SB || !AK || !URL_ || !TOK) return json({ error: "Alerts not configured" }, 500);
  const authz = req.headers.get("Authorization") || "";
  if (!/^Bearer\s+\S+/i.test(authz)) return json({ error: "Sign in required" }, 401);
  const tok = authz.replace(/^Bearer\s+/i, "");
  if (tok === AK || /^sb_(publishable|secret)_/.test(tok)) return json({ error: "Sign in required" }, 401);
  const u = await fetch(SB + "/auth/v1/user", { headers: { Authorization: authz, apikey: AK } }).catch(() => null);
  const uj = u && u.ok ? await u.json().catch(() => null) : null;
  if (!uj || !uj.id) return json({ error: "Sign in required" }, 401);
  const pr = await fetch(SB + "/rest/v1/staff_profiles?select=username,active&id=eq." + encodeURIComponent(uj.id), { headers: { Authorization: authz, apikey: AK } }).catch(() => null);
  const rows = pr && pr.ok ? await pr.json().catch(() => []) : [];
  const p = rows && rows[0];
  if (!p || !p.active) return json({ error: "Not allowed" }, 403);
  let d: Record<string, unknown> = {};
  try { d = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const kind = (d.kind === "test" || /test/i.test(String(d.source ?? ""))) ? "test" : "new_job";
  const uname = String(p.username || "").toLowerCase();
  if (kind === "test" && !TESTERS.includes(uname)) return json({ error: "Not allowed" }, 403);
  const payload: Record<string, unknown> = {
    source: kind === "test" ? "test button" : clip(d.source, 40) || "dashboard",
    customer: clip(d.customer), address: clip(d.address), size: clip(d.size, 40), salesman: clip(d.salesman, 60),
    price: Number(d.price) || 0, deposit: Number(d.deposit) || 0, sold_date: clip(d.sold_date, 20), by: uname,
  };
  const send = async (t: string) => {
    const r = await fetch(URL_, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ ...payload, token: t }), redirect: "follow" }).catch(() => null);
    return r ? (await r.text().catch(() => "")).trim() : "network error";
  };
  const res = await send(TOK);
  const ok = !/bad token|bad json|network error/i.test(res);
  return json({ ok, result: res.slice(0, 80) }, ok ? 200 : 502);
});
