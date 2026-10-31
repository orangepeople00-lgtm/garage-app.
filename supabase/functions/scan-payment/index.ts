// Supabase Edge Function: scan-payment (SAMPLE, branch paperwork-tab)
// { image: "data:image/jpeg;base64,..." } -> { amount, method, check_number, date, payer, confidence }
// Reads a photo of a check / payment receipt with OpenAI vision (gpt-4.1-mini). Signed-in users only. No database access;
// the dashboard shows an editable review and records nothing until the user taps Confirm.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
function role(req: Request) { try { const t = (req.headers.get("authorization") || "").split(" ")[1] || ""; return JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).role || ""; } catch { return ""; } }
const SCHEMA = { type: "object", additionalProperties: false, required: ["amount", "method", "check_number", "date", "payer", "confidence"], properties: {
  amount: { type: ["number", "null"], description: "payment amount in US dollars (check: the numeric box, cross-checked with the written amount)" },
  method: { type: ["string", "null"], enum: ["check", "cash", "card", "zelle", "financing", "other", null] },
  check_number: { type: ["string", "null"] }, date: { type: ["string", "null"], description: "YYYY-MM-DD" }, payer: { type: ["string", "null"] },
  confidence: { type: "number", description: "0-1 confidence that amount is exactly right" } } };
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    if (role(req) !== "authenticated") return json({ error: "Sign in first" }, 403);
    const key = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("AI_API_KEY"); if (!key) return json({ error: "OPENAI_API_KEY secret not set" }, 500);
    const base = Deno.env.get("AI_BASE_URL") || "https://api.openai.com/v1";
    const { image } = await req.json().catch(() => ({}));
    if (typeof image !== "string" || !/^data:image\/(jpeg|png|webp);base64,/.test(image) || image.length > 4_000_000) return json({ error: "image (data URL, under ~3 MB) required" }, 400);
    const r = await fetch(`${base}/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4.1-mini", temperature: 0, max_tokens: 200,
        response_format: { type: "json_schema", json_schema: { name: "payment", strict: true, schema: SCHEMA } },
        messages: [{ role: "system", content: "Read a photo of a customer's payment to a garage builder (usually a personal check). Return only what is clearly visible. If the amount is unreadable or the numeric and written amounts disagree, set amount null and confidence low. Never guess." },
          { role: "user", content: [{ type: "text", text: "Extract the payment." }, { type: "image_url", image_url: { url: image, detail: "high" } }] }] }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: d?.error?.message || ("OpenAI " + r.status) }, 502);
    let out: any = {}; try { out = JSON.parse(d.choices[0].message.content); } catch { out = {}; }
    return json({ ...out, usage: d.usage, model: d.model });
  } catch (e) { return json({ error: String((e as Error)?.message || e) }, 500); }
});
