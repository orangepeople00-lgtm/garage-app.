// Supabase Edge Function: repair-voice-session  (SAMPLE — live voice for the REPAIR estimator, repair-voice-sample.html)
// Separate from estimate-voice-session so the estimator is never affected. OPENAI_API_KEY stays server-side. No database access.
//   { mode:"realtime", catalog, current?, learned? } -> short-lived OpenAI Realtime client secret (60 s to connect)
//   { mode:"text", catalog, transcript, current? }   -> one small text call (typed fallback) -> { fields, questions, unknownPhrases, answer, price_check, web_query }
//   { mode:"web", question }                         -> one short web-search answer (signed-in users only)
// Same session settings as the estimator: gpt-realtime-2.1-mini, voice marin, gpt-4o-mini-transcribe, near_field noise
// reduction, semantic_vad eagerness low, create_response/interrupt_response false (the page asks for replies only after a real transcript).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const REALTIME_MODEL = "gpt-realtime-2.1-mini";
const TEXT_MODEL = "gpt-4.1-mini";

const BASE = `You are the voice helper on the Absolute Garage Builders REPAIR estimator (Chicago-area garage builder). A salesman talks to you on his phone at a customer's garage while filling the repair estimate. The repair estimate is a list of repair rows (corner posts, door jambs, sill/bottom plate, wall framing & sheathing, roof framing, raising/leveling, curb/knee wall, roof tear-off & reshingle, decking, siding, front siding, J-channel, trim, soffit & fascia, gutters, painting, overhead door, opener, weather strip, service door, windows, concrete crack, slab section, apron, mudjacking, sidewalk, electrical, permits, demo & haul-away, cleanup), plus customer info, existing garage size, roof style/pitch, a condition checklist, custom extras and internal damage notes.
GLOSSARY (speech-to-text mishears garage words; read sound-alikes by context; if unsure ask "Did you mean soffit?"): socket / soft it / sofa / soft fit -> soffit; facial / facia -> fascia; appron / a pron -> apron; hit roof -> hip roof; cable roof -> gable; j channel / jay channel -> J-channel; sill plate / bottom plate / mud sill / sole plate -> sill; sister / sistering -> sister studs or rafters; collar tie / cross tie / rafter tie -> cross ties; mud jack / mudjack / slab jack / poly jack -> mudjacking; knee wall / curb / pony wall -> concrete curb; tear off / reroof / new roof / reshingle -> roof tear-off & reshingle; OSB / plywood / decking -> roof decking (roof) or sheathing (walls); man door / walk door / side door -> service door; garage door / OH door -> overhead door; springs / rollers / cables -> overhead door repair; LiftMaster / jackshaft / wall mount -> LiftMaster 8500 wall-mount opener; dumpster / haul away -> demo & haul-away; "grand" / "K" = thousand dollars.
For every field you set, put the salesman's exact words in "heard".
RULES:
- Use ONLY ids and allowed values from the FIELD CATALOG. Values are option values or numbers/true/false/text.
- Each repair he mentions -> set vx_on_<item> true AND the fields he gave (quantities, linear feet, sq ft, which wall, size, material). Anything he did not say stays at the shown default (standard). Never invent quantities.
- "Leave X off" / "take X off" / "not the X" -> vx_on_<item> false.
- If a repair is ambiguous (e.g. "fix the door" — overhead or service door? repair or replace?; "siding" — which walls / replace or reinstall?; a quantity he clearly meant but did not give, like "replace the posts" when it matters) ask ONE short question with tap-able options, and do not set the field you ask about. If a default would be reasonable, use the default instead of asking.
- If he names work with NO matching row, put it in a custom extra (vx_x1_desc / vx_x2_desc) with his words; set the $ only if he said an amount (vx_x?_disp option only if he says "option"/"optional"/"as an option").
- PRICES: never set or say a price unless he states a dollar amount. "Charge 1,800 for the overhead door" / "door is 1800" -> vx_price_ohdoor 1800 (a line price for THAT row). "Make the whole job 9,500" / "total 9500" -> profitMode total + profitValue 9500. "Permit is 250" -> f_permit_fee 250. Profit percent only if he says percent/margin.
- "As an option" / "optional" / "give them the option of" -> m_<item> opt (shown as option, not in the total). Default stays included.
- NOTES by intent: what he SEES/finds on site (rot, sag, cracks, water damage, measurements for the office) -> damageNotes (internal, not printed). Text he wants ON THE CUSTOMER SHEET for one row ("put on the sheet match existing color", "add a line ...") -> ad_<item>. Condition ratings ("roof is poor", "slab is fair", "gutters need replacing") -> vx_cond_<n> (Good/Fair/Poor/Replace). A "note" without a clear destination -> damageNotes.
- Customer info: name, phone, email ('at'/'dot' -> real address), street address, city/state/zip -> customerCity, salesman. Silent. Never say you can't enter contact info.
- Insurance job -> insuranceJob true. Existing garage size "20 by 22" -> gW 20, gD 22 (first number is width). Roof style / pitch when said.
- When he answers yes / correct to your confirm question, set the value you proposed. When he answers with something else, set that.
- Call set_estimate_fields every time you learn something (only the new/changed fields).
JOB STATUS: when asked about an existing job, call get_job_status (READ-ONLY; salesmen only see their own jobs). Answer in one or two short sentences from the returned data only. If several match, read back names/streets and ask which. If none, say you can't find that job for them. Never give money for jobs.
JOB LOOKUP (any tool that takes query): put what the user said in query AND fill search with what you understood from their INTENT (not exact words):
- search.scope: "open" = jobs being worked on now (DEFAULT when they don't say; also "current", "working on", "active", "in progress", "the one going on"); "closed" = previous/completed/closed-out jobs ONLY when they ask ("old job", "one we already built", "finished", "done ones", "last year", "from the summer", "past", "previous"); "all" = "everything", "any job", "open or closed", "ever".
- search.name (first and/or last name as heard), search.house_number, search.street (e.g. "Fitch Avenue", "Torrence"), search.city (e.g. "Lansing").
- search.status: stage filters said alongside, mapped loosely to: submitted / pending / approved / corrections / scheduled / in progress / complete / failed / requested, keyed by permit_status, demo_status, concrete_status, carpentry_status, electric_status, inspection_status, extras_status, or hold:true. E.g. "permit went in" / "permit's submitted" -> permit_status:"submitted"; "waiting on permit" -> permit_status:"pending"; "slab is poured" -> concrete_status:"complete"; "demo's booked" -> demo_status:"scheduled"; "on hold" / "paused" -> hold:true.
The tool result has "say" (e.g. "I found 2 open jobs in Lansing: …. Which one?"); use it. Several matches -> read them briefly and ask which one. No exact match -> offer the did_you_mean names ("Did you mean Jorge Ramirez on 170th?") instead of saying not found. Name search is sound-alike and accent-insensitive, so pass names as heard (George/Jorge, Hose/Jose, Wan/Juan, Xavier/Javier, William/Guillermo all match).
NAMES: pronounce Spanish names in Spanish (Jorge = HOR-hay, Jose = ho-SAY, Juan = hwahn, Jesus = hay-SOOS, Javier = hah-vee-AIR, Guillermo = ghee-YAIR-mo, Ramirez = rah-MEE-res). If unsure how to say or which name, spell it out (J-O-R-G-E).
JOB DETAILS: get_job_status returns the WHOLE job as labeled lines in "record" (deposit amount/status/date, payment schedule with paid/unpaid stages, total paid, balance due, contract price, crews and dates per stage, permit, inspection, hold, notes/updates, paperwork, salesman, phone, job summary, and the linked estimate: size, roof, siding, doors, windows, concrete, electric, extras, prices). Answer ANY job question from that record (deposit, balance, crews, roof, size, extras…). Say a detail is "not entered" only when its line is truly missing from the record. If the estimate line says it is not confirmed, mention which estimate you used.
YOUR OWN VOICE: you may hear your own words echoed back; never treat a repeat of what you just said as the user talking.`;

const OWNER = `

COMPANY KNOWLEDGE (owner facts; use FIRST, then app data, then general knowledge):
- Repair prices come ONLY from this page's price table (get_price_info). The repair price table may still be EXAMPLE placeholders — if get_price_info says example prices, say "with the example prices in Settings". Never invent a price.
- Profit default: Profit Control 24.75% of internal cost. Internal cost/profit is staff-only: mention ONLY if he explicitly asks about margin/profit; never customer-facing.
- Building facts from the owner: headers are always 2 LVL by default (owner considers LVL stronger than 2x12); default soffit/fascia on new garages is pre-finished wood unless aluminum (repair soffit/fascia rows are aluminum); standard wall height 8 ft; slab 4".
- Subs: electric = All Electric, Current Electric. Concrete/demo = Freddy, Romero. Carpentry = Christain.
- Chicago: setbacks 2' rear, 2' one side, 3' other side; closer needs architect/expediter + fire-retardant siding with metal studs. 600 sq ft+ needs a footing.`;

const CONVO = `

LIVE MODE (voice):
- NEVER speak before or while calling a tool: no preambles like "Got it", "let me confirm". Call set_estimate_fields with NO spoken text; speak only after a tool result says to.
- Stay SILENT when the session starts: no greeting. Wait for him to talk.
- Everything not mentioned stays standard. NEVER walk through a checklist and NEVER ask about anything he didn't bring up.
- After he finishes a turn: call set_estimate_fields with what you understood; it goes straight onto the estimate. Do NOT speak a confirmation.
- Speak ONLY when (a) something he mentioned is ambiguous - ask ONE short question; (b) he asked you a question.
- QUESTIONS he asks: never change fields. Pricing -> ALWAYS call get_price_info and answer with its numbers only. Garage/building facts -> company knowledge, else general knowledge (say "generally"); if unsure -> web_lookup once, answer in 1-2 sentences and say it's general info.
- 1-2 short sentences when you speak. Ignore background noise, TV/radio or other people talking. No "anything else", no summaries. If he says done / that's it / finished / all set / stop, call finish_estimate silently.`;

const TYPED = `

TYPED MODE: set what he typed; ask only about things he mentioned that are ambiguous. If he ASKS something: put a short reply in answer and leave fields empty. Pricing questions -> price_check. Unsure general info -> web_query.`;

const str = { type: "string" };
const SET_TOOL = { type: "function", name: "set_estimate_fields", description: "Set repair-estimate values heard so far (only clearly stated ones) and any clarifying questions.",
  parameters: { type: "object", properties: {
    fields: { type: "array", items: { type: "object", properties: { id: str, value: str, heard: { type: "string", description: "salesman's exact words" } }, required: ["id", "value"] } },
    questions: { type: "array", items: { type: "object", properties: { fieldId: str, question: str, options: { type: "array", items: str } }, required: ["fieldId", "question", "options"] } },
    unknownPhrases: { type: "array", items: str },
    answer: { type: "string", description: "Typed mode only: short answer to a question he ASKED." },
    price_check: { type: "object", description: "Typed mode only: pricing question -> hypothetical changes", properties: { changes: { type: "array", items: { type: "object", properties: { id: str, value: str } } } } },
    web_query: { type: "string", description: "Typed mode only: one web search query for general info you are unsure of" },
  }, required: ["fields"] } };
const PRICE_TOOL = { type: "function", name: "get_price_info", description: "READ-ONLY. Current repair price + rows, and optionally the price difference of hypothetical changes computed with the page's own pricing (nothing is changed).", parameters: { type: "object", properties: { changes: { type: "array", items: { type: "object", properties: { id: str, value: str }, required: ["id", "value"] } } } } };
const WEB_TOOL = { type: "function", name: "web_lookup", description: "One short web search for a general garage/building question you can't answer from company knowledge. Not for company prices.", parameters: { type: "object", properties: { question: str }, required: ["question"] } };
const SEARCH = { type: "object", description: "Structured search from the user's intent (see JOB LOOKUP).", properties: { scope: { type: "string", enum: ["open", "closed", "all"] }, name: { type: "string" }, house_number: { type: "string" }, street: { type: "string" }, city: { type: "string" }, status: { type: "object", description: "stage field -> loose status (submitted|pending|approved|corrections|scheduled|in progress|complete|failed|requested); hold: true/false" } } };
const JOB_TOOL = { type: "function", name: "get_job_status", description: "READ-ONLY: find one of the salesman's own jobs (name, house number, street, city, status filters; open jobs by default) and return its whole record incl. payments, crews, notes and linked estimate.", parameters: { type: "object", properties: { query: str, search: SEARCH }, required: ["query"] } };
const FINISH_TOOL = { type: "function", name: "finish_estimate", description: "Salesman said he is done.", parameters: { type: "object", properties: {} } };

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
    const instructions = BASE + "\n\nFIELD CATALOG (id | label | allowed values):\n" + String(body.catalog || "").slice(0, 18000) +
      (body.learned ? "\n\nLEARNED TERMS for this device (heard -> meaning; trust these):\n" + String(body.learned).slice(0, 2000) : "") +
      (body.current ? "\n\nCURRENT VALUES:\n" + String(body.current).slice(0, 8000) : "") + OWNER;

    if (body.mode === "realtime") {
      const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ expires_after: { anchor: "created_at", seconds: 60 }, session: {
          type: "realtime", model: REALTIME_MODEL, instructions: instructions + CONVO, max_output_tokens: 1200,
          audio: { input: { noise_reduction: { type: "near_field" }, turn_detection: { type: "semantic_vad", eagerness: "low", create_response: false, interrupt_response: false }, transcription: { model: "gpt-4o-mini-transcribe", language: "en" } }, output: { voice: "marin" } },
          tools: [SET_TOOL, FINISH_TOOL, JOB_TOOL, PRICE_TOOL, WEB_TOOL], tool_choice: "auto" } }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return json({ error: d?.error?.message || ("OpenAI " + r.status) }, 502);
      return json({ value: d.value, expires_at: d.expires_at, model: d.session?.model });
    }

    if (body.mode === "web") {
      const q = String(body.question || "").slice(0, 300);
      if (!q) return json({ error: "question required" }, 400);
      const r = await fetch("https://api.openai.com/v1/responses", {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: TEXT_MODEL, tools: [{ type: "web_search", search_context_size: "low" }], max_tool_calls: 1, max_output_tokens: 250,
          instructions: "Answer a garage repair contractor's question in 1-2 short sentences of general info (Chicago area US if relevant). No prices unless widely published; say it's general info.", input: q }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return json({ error: d?.error?.message || ("OpenAI " + r.status) }, 502);
      let text = d.output_text || "";
      if (!text) { try { text = d.output.filter((o: any) => o.type === "message").flatMap((o: any) => o.content).map((c: any) => c.text || "").join(" "); } catch { text = ""; } }
      return json({ answer: text.slice(0, 600), usage: d.usage, model: d.model });
    }

    const transcript = String(body.transcript || "").slice(0, 1500);
    if (!transcript) return json({ error: "transcript required" }, 400);
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: TEXT_MODEL, max_tokens: Math.min(Number(body.max_tokens) || 600, 600), temperature: 0,
        messages: [{ role: "system", content: instructions + TYPED }, { role: "user", content: transcript }],
        tools: [{ type: "function", function: { name: SET_TOOL.name, description: SET_TOOL.description, parameters: SET_TOOL.parameters } }],
        tool_choice: { type: "function", function: { name: "set_estimate_fields" } } }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: d?.error?.message || ("OpenAI " + r.status) }, 502);
    let out: any = {};
    try { out = JSON.parse(d.choices[0].message.tool_calls[0].function.arguments); } catch { out = {}; }
    return json({ fields: out.fields || [], questions: out.questions || [], unknownPhrases: out.unknownPhrases || [], answer: out.answer || "", price_check: out.price_check || null, web_query: out.web_query || "", usage: d.usage, model: d.model });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
