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
- If you ask a question about a field, do NOT also set that field (exception: "two car" with no size -> set width 20 and depth 20 AND ask "Confirm the size — 20 by 20?" with fieldId width). Demo without a stated old-slab size: ask the old slab size (offer the new garage size first); never set demoSlabPreset to none when demo was requested.
- Old slab sizes that match a demoSlabPreset option (20x20, 22x22, 24x24...) use that exact option; use custom + oldConcreteOverride only for other sizes.
- Do not ask about extras the salesman did not mention (patio, windows, electric...). Only ask about something he said that is unclear, or the essentials if missing: size, roof style, city.
- When he says done / that's it / fill it, call finish_estimate right away.
- carCapacity only when "oversized two car" or "three car" is said.
- Use ONLY the field ids and allowed values from the catalog. Values are option values (left of '=') or numbers/true/false.
- NEVER say or set prices or money except demoCostInput when the salesman says a demo dollar amount. Prices come from the calculator.
- Call set_estimate_fields every time you learn something (only the new/changed fields). Call finish_estimate when the salesman says done / fill it / that's it.
- Keep spoken replies very short (one sentence), in English, friendly, like a coworker. Confirm briefly, then ask the next missing important thing (size, roof, city, siding, doors) only if not given.`;

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
    },
    required: ["fields"],
  },
};
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
            instructions,
            max_output_tokens: 1200,
            audio: {
              input: { turn_detection: { type: "semantic_vad", eagerness: "high" }, transcription: { model: "gpt-4o-mini-transcribe", language: "en" } },
              output: { voice: "marin" },
            },
            tools: [SET_TOOL, FINISH_TOOL, JOB_TOOL],
            tool_choice: "auto",
          },
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return json({ error: d?.error?.message || ("OpenAI " + r.status) }, 502);
      return json({ value: d.value, expires_at: d.expires_at, model: d.session?.model });
    }

    // typed fallback: one small call
    const transcript = String(body.transcript || "").slice(0, 1500);
    if (!transcript) return json({ error: "transcript required" }, 400);
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: TEXT_MODEL, max_tokens: 500, temperature: 0,
        messages: [{ role: "system", content: instructions }, { role: "user", content: transcript }],
        tools: [{ type: "function", function: { name: SET_TOOL.name, description: SET_TOOL.description, parameters: SET_TOOL.parameters } }],
        tool_choice: { type: "function", function: { name: "set_estimate_fields" } },
      }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: d?.error?.message || ("OpenAI " + r.status) }, 502);
    let out: any = {};
    try { out = JSON.parse(d.choices[0].message.tool_calls[0].function.arguments); } catch { out = {}; }
    return json({ fields: out.fields || [], side_doors: out.side_doors, questions: out.questions || [], unknownPhrases: out.unknownPhrases || [], usage: d.usage, model: d.model });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
