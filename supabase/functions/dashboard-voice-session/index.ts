// Supabase Edge Function: dashboard-voice-session  (SAMPLE — live voice for the production dashboard)
// Separate from estimate-voice-session so the estimator is never affected. OPENAI_API_KEY stays server-side.
//   { mode:"realtime", role, catalog, learned? } -> short-lived OpenAI Realtime client secret (60s to connect)
//   { mode:"text", role, catalog, transcript }  -> one small text call (typed fallback) -> { calls:[{name,args}], say }
// Requires a signed-in user. The model only PROPOSES; the dashboard shows a confirm card and the browser writes with the
// user's own session (RLS applies). No database access here.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const REALTIME_MODEL = "gpt-realtime-2.1-mini";
const TEXT_MODEL = "gpt-4.1-mini";

const BASE = `You are the voice helper on the Absolute Garage Builders production dashboard (Chicago-area detached garage builder). Users: salesmen, and the managers Randy and Sam.
GLOSSARY (speech-to-text mishears garage words; read sound-alikes by context): demo / demolition / tear down -> demo stage; concrete / slab / pour / poured -> concrete stage; carpentry / framing / build / built / carpenters -> carpentry stage; electric / electrician / sparky -> electric stage; permit / permits / per mitt -> permit; inspection / final -> inspection; gutters / extras -> extras; soffit (socket / soft it), fascia (facial), apron (appron), hip roof (hit roof), gable (cable), LP smart side (el pee), Hardie (hardy), service door (man door / walk door), party door, French doors; deposit / down payment -> Deposit stage; "check", "cash", "card", "Zelle", "financing" -> payment method; "grand" / "K" = thousand dollars ("three grand" = 3000). Crews: Freddy / Freddie, Romero (concrete/demo), Christain / Christian (carpentry), All Electric, Current Electric.
JOB LOOKUP: jobs are found by customer last name or street. Always pass what was said as query; if a tool result lists several matches, read the names/streets back and ask which one.
STATUS QUESTIONS: call get_job_status and answer in one or two short natural sentences from the returned data only. Never invent. Read-only.
GENERAL: never speak before calling a tool. Stay silent at session start. One or two short sentences when you speak. Never say anything was saved unless the tool result says saved; writes happen only after the user taps Confirm on the screen, so after proposing say "Check the card and tap Confirm" (one short line).`;

const SALES = `
ROLE: SALESMAN. He can only see and ask about his own jobs.
- New job he describes -> propose_new_job with what he clearly said (customer, address, city, phone, email, price, garage size, roof, notes). It goes to Randy or Sam as PENDING until they approve. Ask once for the customer name or address if missing.
- Changes to one of his jobs -> request_job_edit (it is a REQUEST that Randy or Sam approve; nothing changes until then). Never claim a job was changed.
- He cannot record payments, change statuses or close jobs: say Randy or Sam handle that, and offer to send it as an edit request.`;

const MGR = `
ROLE: MANAGER (Randy or Sam). They see all jobs.
- Status changes ("demo is done", "concrete poured Tuesday", "permit approved") -> update_job with stage fields using ONLY the allowed values in the catalog, plus dates (YYYY-MM-DD; today's date is given). 
- Summary notes ("add a note ...") -> update_job with note.
- Events with money ("demo done and we collected 5 grand") -> update_job for the status AND record_payment for the money (stage = the matching payment stage, e.g. Demolition), as two calls.
- Payments ("got the deposit, 3000 check", "collected 8,500 for concrete") -> record_payment: amount (number), stage (Deposit, Permit, Demolition, Concrete, Carpentry, Electric, or the stage name said), method if said, paid_date if said.
- "job is completed / ready to close out" -> open_closeout. Never close the job yourself.
- A new job they describe -> propose_new_job (it lands in the pending list for approval).`;

const CONVO = `
LIVE VOICE: silent until spoken to; no greetings, no summaries, no "anything else". Ignore background noise, TV/radio or other people talking. Only when he clearly says done / that's it / finished / stop, call finish silently.`;

const CATALOG_INTRO = "\n\nJOB STAGE FIELDS (id | allowed values):\n";
const str = { type: "string" };
const JOB_TOOL = { type: "function", name: "get_job_status", description: "READ-ONLY job status lookup by customer name or address.", parameters: { type: "object", properties: { query: str }, required: ["query"] } };
const NEW_TOOL = { type: "function", name: "propose_new_job", description: "Propose a NEW job. Becomes a PENDING item for Randy/Sam to approve after the user confirms the card.", parameters: { type: "object", properties: { customer: str, address: str, city: str, phone: str, email: str, price: { type: "number" }, garage_size: str, notes: str, heard: str }, required: ["notes"] } };
const EDIT_TOOL = { type: "function", name: "request_job_edit", description: "Salesman requests an edit to one of HIS jobs. Pending until approved.", parameters: { type: "object", properties: { query: str, request: { type: "string", description: "what should change, in plain words" }, fields: { type: "object", description: "optional structured changes (stage field ids from the catalog -> value)" } }, required: ["query", "request"] } };
const UPD_TOOL = { type: "function", name: "update_job", description: "MANAGER: change job stage statuses/dates and/or add a summary note. Shown as a confirm card first.", parameters: { type: "object", properties: { query: str, fields: { type: "object", description: "stage field id -> allowed value or YYYY-MM-DD date" }, note: str, heard: str }, required: ["query"] } };
const PAY_TOOL = { type: "function", name: "record_payment", description: "MANAGER: record money collected as a real payment on the job's payment schedule. Shown as a confirm card first.", parameters: { type: "object", properties: { query: str, amount: { type: "number" }, stage: str, method: str, paid_date: str, heard: str }, required: ["query", "amount"] } };
const CLOSE_TOOL = { type: "function", name: "open_closeout", description: "MANAGER: job is complete / ready to close out -> open that job's close-out section (does not close it).", parameters: { type: "object", properties: { query: str }, required: ["query"] } };
const FIN_TOOL = { type: "function", name: "finish", description: "User is done talking.", parameters: { type: "object", properties: {} } };

function roleOf(req: Request) {
  try { const t = (req.headers.get("authorization") || "").split(" ")[1] || ""; return JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).role || ""; } catch { return ""; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    if (roleOf(req) !== "authenticated") return json({ error: "Sign in to use voice" }, 403);
    const key = Deno.env.get("OPENAI_API_KEY");
    if (!key) return json({ error: "OPENAI_API_KEY secret not set" }, 500);
    const body = await req.json().catch(() => ({}));
    const mgr = body.role === "manager"; // UI hint only; the browser + RLS enforce what is actually allowed
    const tools = mgr ? [JOB_TOOL, UPD_TOOL, PAY_TOOL, CLOSE_TOOL, NEW_TOOL, FIN_TOOL] : [JOB_TOOL, NEW_TOOL, EDIT_TOOL, FIN_TOOL];
    const instructions = BASE + (mgr ? MGR : SALES) + "\nToday: " + String(body.today || "").slice(0, 10) +
      CATALOG_INTRO + String(body.catalog || "").slice(0, 6000) +
      (body.learned ? "\n\nLEARNED TERMS (heard -> meaning; trust these):\n" + String(body.learned).slice(0, 2000) : "");

    if (body.mode === "realtime") {
      const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ expires_after: { anchor: "created_at", seconds: 60 }, session: {
          type: "realtime", model: REALTIME_MODEL, instructions: instructions + CONVO, max_output_tokens: 800,
          audio: { input: { noise_reduction: { type: "near_field" }, turn_detection: { type: "semantic_vad", eagerness: "low", create_response: false, interrupt_response: false }, transcription: { model: "gpt-4o-mini-transcribe", language: "en" } }, output: { voice: "marin" } },
          tools, tool_choice: "auto" } }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return json({ error: d?.error?.message || ("OpenAI " + r.status) }, 502);
      return json({ value: d.value, expires_at: d.expires_at, model: d.session?.model });
    }

    const transcript = String(body.transcript || "").slice(0, 1500);
    if (!transcript) return json({ error: "transcript required" }, 400);
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: TEXT_MODEL, max_tokens: 400, temperature: 0,
        messages: [{ role: "system", content: instructions + "\nTYPED MODE: call the right tool(s). If you only need to say something, reply with a short text." }, { role: "user", content: transcript }],
        tools: tools.map((t) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.parameters } })) }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: d?.error?.message || ("OpenAI " + r.status) }, 502);
    const m = d.choices?.[0]?.message || {};
    const calls = (m.tool_calls || []).map((c: any) => { let a = {}; try { a = JSON.parse(c.function.arguments); } catch { a = {}; } return { name: c.function.name, args: a }; });
    return json({ calls, say: m.content || "", usage: d.usage, model: d.model });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
