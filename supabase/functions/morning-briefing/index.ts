// morning-briefing (SAMPLE): reads an already-built briefing text aloud with OpenAI TTS.
// Signed-in owner / business_manager only. Text capped at 1200 chars. Returns audio/mpeg.
// Cost: gpt-4o-mini-tts ≈ $0.015 per minute of audio (~$0.01 for a 40 s briefing).
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const j = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return j({ error: "POST only" }, 405);
  const auth = req.headers.get("Authorization") || "";
  const url = Deno.env.get("SUPABASE_URL")!, anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const u = await fetch(url + "/auth/v1/user", { headers: { apikey: anon, Authorization: auth } });
  if (!u.ok) return j({ error: "Sign in first" }, 401);
  const user = await u.json();
  const p = await fetch(url + "/rest/v1/staff_profiles?select=role&id=eq." + encodeURIComponent(user.id), { headers: { apikey: anon, Authorization: auth } });
  const rows = p.ok ? await p.json() : [];
  const role = String(rows?.[0]?.role || "").toLowerCase();
  if (!["owner", "business_manager"].includes(role)) return j({ error: "Briefing is for owner / business manager" }, 403);
  let text = "";
  try { text = String((await req.json()).text || "").trim().slice(0, 1200); } catch { /* */ }
  if (!text) return j({ error: "No text" }, 400);
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return j({ error: "OPENAI_API_KEY not set" }, 500);
  const r = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini-tts", voice: "ash", input: text, response_format: "mp3",
      instructions: "Friendly, clear, brisk foreman giving a short morning rundown. Do not add words." }),
  });
  if (!r.ok) return j({ error: "TTS failed " + r.status }, 502);
  return new Response(r.body, { headers: { ...CORS, "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
});
