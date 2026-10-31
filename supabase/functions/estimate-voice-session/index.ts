// Supabase Edge Function: estimate-voice-session  (SAMPLE — voice-to-estimate)
// OPENAI_API_KEY stays server-side. Two modes:
//   { mode:"realtime", catalog:"<field catalog text>" } -> mints a short-lived OpenAI Realtime client secret
//        (ephemeral ek_..., 60s to connect) with the AGB instructions + set_estimate_fields / finish_estimate tools.
//   { mode:"text", catalog, transcript, current? } -> one cheap text-model call (typed fallback), returns
//        { fields:[{id,value}], side_doors?, questions:[{fieldId,question,options}], unknownPhrases:[] }
// Never sets prices. No database access.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const REALTIME_MODEL = "gpt-realtime-2.1-mini";
const TEXT_MODEL = "gpt-4.1-mini";

const BASE_RULES = `You are the voice estimating helper for Absolute Garage Builders (Chicago-area detached garage builder). A salesman talks to you on a phone at a customer's house while filling the estimator.
Terminology: hip roof (default, included); gable = standard front gable (peak over the overhead door, eaveDir front-back); reverse gable / side gable = ridge runs left-right with peaks on the two END walls (roofType gable + eaveDir sides); roof patio / roofed patio (roofPatioEnabled, depth, side vs rear); apron (concrete strip in front); demo / tear down the old garage (demoSlabPreset = old slab size, demoCostInput only if a dollar amount is said); existing slab (slabMode existing) vs new slab; service door (36x80), French doors, party door (small overhead door) go in side_doors with a wall; overhead door styles raised panel / carriage / flush; alum soffit fascia (aluminumSoffit); wood soffit box (showWoodSoffitNote); vinyl / LP / Hardie siding; "two car" = 20 or 22 wide (ASK, don't guess); "20 by 20" = width 20 depth 20 (first number is width).
GLOSSARY (speech-to-text often mishears garage words; interpret sound-alikes as the garage term by context, take literally only if clearly not garage-related; if unsure ask a short confirmation like "Did you mean soffit?"):
socket / soft it / sofa / soft fit -> soffit; facial / facia / fascia board -> fascia; "alum" / aluminum -> aluminum soffit & fascia (aluminumSoffit); appron / a pron / apron -> apron; hit roof / hip / hips -> hip roof; reverse cable / reverse gable / side gable / gable on the sides -> reverse gable; cable roof / gabled -> gable; LP / LP smart side / smart side / el pee -> sidingType lp (LP Smart Side); vinyl / vinal -> vinyl siding; Hardie / hardy board -> Hardie; raised panel / carriage / carriage house / flush / flesh -> overhead door styles; service door / man door / walk door / side door -> service door; French door(s) / french -> french; party door / small overhead / golf cart door -> party door; alley / alley side / driveway -> location words (garage faces alley/driveway), not a field unless asked; existing slab / keep the slab / build on existing slab -> slabMode existing; demo / tear down / knock down / take down the old one / remove the old garage -> demolition AND removal of the old garage and its slab (demoSlabPreset = old slab size), UNLESS he says build on the existing slab (then slabMode existing and NO demoSlabPreset); two car / 2 car -> width 20 depth 20 only when no size was given, and always ask to confirm the dimensions; "20 by 20" / "20x20" / "twenty twenty" -> width 20 depth 20; roofed patio / covered patio / roof patio -> roofPatioEnabled; gutters / gutter / gutters and downspouts -> gutters; EV / electric car charger -> evCharger.
For every field you set, put the salesman's exact words in "heard".
JOB STATUS: when asked about an existing job, call get_job_status. Answer in one or two short natural sentences from the returned data only (e.g. "Demo was done Tuesday, waiting on concrete from Freddie, scheduled Nov 6" or "Still waiting on permit"). If several jobs match, read back the names/streets and ask which. If none found, say you can't find that job for them. Never give prices or money for jobs.
Rules:
- Only set a field when the salesman clearly said it. Never invent or assume. If ambiguous, ask ONE short question at a time (and include it in questions with tap-able options).
- If the salesman names a product/option that has NO matching allowed value, do NOT substitute another option: put the words in unknownPhrases and ask.
- If you ask a question about a field, do NOT also set that field (exception: "two car" with no size -> set width 20 and depth 20 AND ask "Confirm the size — 20 by 20?" with fieldId width). Demo without a stated old-slab size: use the new garage size if given, otherwise ask the old slab size; never set demoSlabPreset to none when demo was requested.
- DEMO: plain "demo" / "tear down the old garage" = remove old garage AND slab: set demoSlabPreset to the old slab size (slabMode stays new). If he says build on the existing slab AND tear down / demo the old garage: set slabMode existing AND STILL set demoSlabPreset to the old garage size (use the new garage size when he gave none; do NOT ask to confirm it) — the calculator then charges only the garage demolition (concrete stays). Existing slab with no tear-down mentioned: no demoSlabPreset.
- Never ask about demo apron depth, demo cost, EPA, or excavation unless he brings them up; leave demoApronDepth unset unless he says an apron number.
- SIZE (most important): whenever the salesman says a size, call set_estimate_fields with width AND depth right away. "A by B" / "A x B" / "A-by-B" = width A, depth B (first number is ALWAYS width). Spoken numbers count ("twenty two by twenty four" = 22 x 24). "24 deep"/"24 long" = depth only; "22 wide" = width only. Sizes not in the width/depth options (e.g. 21, 25, 23.5) -> width/depth = custom plus customWidth/customDepth numbers. Only ask if truly ambiguous (e.g. a single number with no wide/deep).
- "two car" with only a depth (e.g. "two car, 24 deep") -> width 20 plus that depth, and ask to confirm the width. Do not ask about overhead door count, car capacity or other items he did not mention.
- PRICE OVERRIDE: "I want the price to be 29,000" / "make it 29 thousand" / "set total to 27,500" -> set profitMode total AND profitValue 29000 (exact dollars). Silent; ask only if the number is unclear. This is not a question.
- If no size at all was given, ask for it ONCE ("What size?").
- When the salesman answers yes / correct / that's right to your confirm question, immediately call set_estimate_fields with that field set to the value you proposed (no question). When he answers with a different number, set that number.
- Old slab sizes that match a demoSlabPreset option (20x20, 22x22, 24x24...) use that exact option; use custom + oldConcreteOverride only for other sizes.
- Do not ask about extras the salesman did not mention (patio, windows, electric, siding...). Not mentioned = standard default.
- When he says done / that's it, call finish_estimate.
- carCapacity only when "oversized two car" or "three car" is said.
- Use ONLY the field ids and allowed values from the catalog. Values are option values (left of '=') or numbers/true/false.
- NEVER say or set prices or money except demoCostInput when the salesman says a demo dollar amount. Prices come from the calculator.
- Call set_estimate_fields every time you learn something (only the new/changed fields).
- Keep replies short and friendly, like a coworker. Never say prices.`;

const OWNER = `

COMPANY KNOWLEDGE (owner facts; use FIRST, before general knowledge):
- 1st service door included in base. 2nd service door +$600. French doors with a service door: 9 Light $1,150, Full View $1,450. Top windows +$350.
- Garage-only demo (build on existing slab, old garage torn down) $1,300 (demo cost box default). LP Smart Side = same price as Hardie/cement board.
- All other prices ONLY from get_price_info (the estimator's own tables). Never invent a price; if the tool can't price it, say you don't have that price.
- Internal: Profit Control default 24.75% of internal cost. Internal cost/profit is staff-only: mention ONLY if the salesman explicitly asks about margin/profit, never in a customer-facing way.
- Headers: always 2 LVL by default (owner considers LVL stronger than 2x12), even when city code says 2x12; 2-2x12 with 1/2" flitch plate can be chosen manually.
- Defaults: pre-finished wood soffit/fascia unless aluminum; vinyl siding; standard rough patio/apron (auto-added, one tap to remove for slab-only); wall height 8 ft; slab 4".
- "Two car" = 20 ft wide by default (get dimensions). "Demo" = garage AND slab removal unless building on the existing slab.
- Roofed patios: no slant/lean-to; hip continues roof lines; gable extends flush; side patio ~1/3 garage size, open front/side/back. Gable + roofed patio -> ask about reverse gable.
- Subs: electric = All Electric, Current Electric. Concrete/demo = Freddy, Romero. Carpentry = Christain.
- Chicago: setbacks 2' rear, 2' one side, 3' other side; closer needs architect/expediter + fire-retardant siding with metal studs. 600 sq ft+ needs a footing (auto-added). Other cities: use get_city_info.`;

const CONVO = `

LIVE MODE (voice):
- NEVER speak before or while calling a tool: no preambles like "Got it", "let me confirm", "let me think". Call set_estimate_fields with NO spoken text; speak only after a tool result says to.
- Stay SILENT when the session starts: no greeting. Wait for him to talk.
- Everything not mentioned stays at the estimator's standard default. NEVER walk through a checklist and NEVER ask about anything he didn't bring up (siding, patio, doors, windows, gutters, apron, EPA, colors...).
- After he finishes a turn: call set_estimate_fields with what you understood; it goes straight onto the estimate. Do NOT speak a confirmation.
- Speak ONLY when (a) something he mentioned is ambiguous/incomplete (e.g. French doors without style, a city not in the list, "two car" without a depth) - ask ONE short question; (b) no size at all after he described the job - ask once "What size?"; (c) he asked you a question.
- QUESTIONS he asks: never change fields. Pricing -> call get_price_info (company facts above first) and answer with those numbers only, say it's company pricing. City codes -> get_city_info. Garage/building facts -> answer briefly from company knowledge, else general knowledge (say "generally"); if unsure or needs current info -> web_lookup once, then answer in 1-2 sentences and say it's general info.
- 1-2 short sentences when you do speak. He may interrupt. No "anything else", no summaries. If he says done / that's it, call finish_estimate silently.`;



const TYPED = `

TYPED MODE: everything not mentioned stays standard; ask questions only about things he mentioned that are ambiguous, or the size if none was given. If he ASKS something: put a short reply in answer and leave fields empty (questions never change fields). Pricing questions -> price_check (and answer with only company-fact prices, else leave the number to the app). City code questions -> city_check. Unsure general info -> web_query.`;

const SET_TOOL = {
  type: "function",
  name: "set_estimate_fields",
  description: "Propose estimator values heard so far (only clearly stated ones) and any clarifying questions.",
  parameters: {
    type: "object",
    properties: {
      fields: { type: "array", items: { type: "object", properties: { id: { type: "string" }, value: { type: "string" }, heard: { type: "string", description: "salesman's exact words" } }, required: ["id", "value"] } },
      side_doors: {
        type: "array",
        description: "Full list of side/rear walk doors if mentioned. Omit if not mentioned.",
        items: { type: "object", properties: {
          type: { type: "string", enum: ["service", "french", "party"] },
          wall: { type: "string", enum: ["left", "right", "rear", "front-left", "front-right"] },
          style: { type: "string", enum: ["9light", "fullview"] } }, required: ["type", "wall"] },
      },
      questions: { type: "array", items: { type: "object", properties: {
        fieldId: { type: "string" }, question: { type: "string" }, options: { type: "array", items: { type: "string" } } }, required: ["fieldId", "question", "options"] } },
      unknownPhrases: { type: "array", items: { type: "string" } },
      answer: { type: "string", description: "Typed mode only: short answer if the salesman ASKED a question (company knowledge first; say 'generally' for general info). Leave fields empty for pure questions." },
      price_check: { type: "object", description: "Typed mode only: pricing question -> hypothetical changes to price with the estimator (never invent a number)", properties: { changes: { type: "array", items: { type: "object", properties: { id: { type: "string" }, value: { type: "string" } } } }, add_side_door: { type: "object", properties: { type: { type: "string" }, wall: { type: "string" }, style: { type: "string" } } } } },
      city_check: { type: "string", description: "Typed mode only: city name if he asked about a city's codes" },
      web_query: { type: "string", description: "Typed mode only: a web search query if the question needs current/general info you are unsure of" },
    },
    required: ["fields"],
  },
};
const PRICE_TOOL = { type: "function", name: "get_price_info", description: "READ-ONLY. Current project price + main line items from the estimator, and optionally the price difference of a hypothetical change computed with the estimator's own pricing (the form is not changed).", parameters: { type: "object", properties: { changes: { type: "array", description: "hypothetical field changes (catalog ids/values), e.g. [{id:'sidingType',value:'lp'}]", items: { type: "object", properties: { id: { type: "string" }, value: { type: "string" } }, required: ["id", "value"] } }, add_side_door: { type: "object", properties: { type: { type: "string", enum: ["service", "french", "party"] }, wall: { type: "string" }, style: { type: "string", enum: ["9light", "fullview"] } } } } } };
const CITY_TOOL = { type: "function", name: "get_city_info", description: "READ-ONLY. The estimator's saved code/requirement notes for a city (setbacks, max size/height, slab, footing, code year).", parameters: { type: "object", properties: { city: { type: "string" } }, required: ["city"] } };
const WEB_TOOL = { type: "function", name: "web_lookup", description: "One short web search for a general garage/building question you can't answer from company knowledge. Not for company prices.", parameters: { type: "object", properties: { question: { type: "string" } }, required: ["question"] } };
const JOB_TOOL = { type: "function", name: "get_job_status", description: "READ-ONLY: look up the status of one of the salesman's own sold jobs by customer name or address. Call when asked how a job is going / where a job stands.", parameters: { type: "object", properties: { query: { type: "string", description: "customer name or part of the address" } }, required: ["query"] } };
const FINISH_TOOL = { type: "function", name: "finish_estimate", description: "Salesman is done; fill the estimate now.", parameters: { type: "object", properties: {} } };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const key = Deno.env.get("OPENAI_API_KEY");
    if (!key) return json({ error: "OPENAI_API_KEY secret not set" }, 500);
    const body = await req.json().catch(() => ({}));
    const catalog = String(body.catalog || "").slice(0, 14000);
    const instructions = BASE_RULES + "\n\nFIELD CATALOG (id | label | allowed values):\n" + catalog +
      (body.learned ? "\n\nLEARNED TERMS for this salesman/device (heard -> meaning; trust these):\n" + String(body.learned).slice(0, 2000) : "") +
      (body.current ? "\n\nCURRENT VALUES:\n" + String(body.current).slice(0, 3000) : "");

    if (body.mode === "realtime") {
      const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          expires_after: { anchor: "created_at", seconds: 60 },
          session: {
            type: "realtime",
            model: String(body.model || REALTIME_MODEL).replace(/[^a-z0-9.\-]/gi, ""),
            instructions: instructions + OWNER + CONVO,
            max_output_tokens: 1200,
            audio: {
              input: { turn_detection: { type: "semantic_vad", eagerness: "high" }, transcription: { model: "gpt-4o-mini-transcribe", language: "en" } },
              output: { voice: "marin" },
            },
            tools: [SET_TOOL, FINISH_TOOL, JOB_TOOL, PRICE_TOOL, CITY_TOOL, WEB_TOOL],
            tool_choice: "auto",
          },
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return json({ error: d?.error?.message || ("OpenAI " + r.status) }, 502);
      return json({ value: d.value, expires_at: d.expires_at, model: d.session?.model });
    }

    if (body.mode === "web") {
      const q = String(body.question || "").slice(0, 300);
      if (!q) return json({ error: "question required" }, 400);
      let role = "";
      try { const t = (req.headers.get("authorization") || "").split(" ")[1] || ""; role = JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).role || ""; } catch { role = ""; }
      if (role !== "authenticated") return json({ error: "Web lookup needs a signed-in user" }, 403);
      const r = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: TEXT_MODEL, tools: [{ type: "web_search", search_context_size: "low" }], max_tool_calls: 1, max_output_tokens: 250,
          instructions: "Answer a garage contractor's question in 1-2 short sentences of general info (Chicago area US if relevant). No prices unless widely published; say it's general info.",
          input: q }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return json({ error: d?.error?.message || ("OpenAI " + r.status) }, 502);
      let text = d.output_text || "";
      if (!text) { try { text = d.output.filter((o: any) => o.type === "message").flatMap((o: any) => o.content).map((c: any) => c.text || "").join(" "); } catch { text = ""; } }
      return json({ answer: text.slice(0, 600), usage: d.usage, model: d.model });
    }

    // typed fallback: one small call
    const transcript = String(body.transcript || "").slice(0, 1500);
    if (!transcript) return json({ error: "transcript required" }, 400);
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: TEXT_MODEL, max_tokens: 500, temperature: 0,
        messages: [{ role: "system", content: instructions + OWNER + TYPED }, { role: "user", content: transcript }],
        tools: [{ type: "function", function: { name: SET_TOOL.name, description: SET_TOOL.description, parameters: SET_TOOL.parameters } }],
        tool_choice: { type: "function", function: { name: "set_estimate_fields" } },
      }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: d?.error?.message || ("OpenAI " + r.status) }, 502);
    let out: any = {};
    try { out = JSON.parse(d.choices[0].message.tool_calls[0].function.arguments); } catch { out = {}; }
    return json({ fields: out.fields || [], side_doors: out.side_doors, questions: out.questions || [], unknownPhrases: out.unknownPhrases || [], answer: out.answer || "", price_check: out.price_check || null, city_check: out.city_check || "", web_query: out.web_query || "", usage: d.usage, model: d.model });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
