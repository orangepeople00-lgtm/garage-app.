// Supabase Edge Function: estimate-voice-session  (v27: rewritten instructions + transcription vocabulary hints + reasoning effort (default medium) + eagerness auto)
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

const BASE_RULES = `You are the voice estimating helper for Absolute Garage Builders (Chicago-area detached garage builder). A salesman (Ramsey, Sam, Samer, Wally or a Tom) talks to you on a phone at a customer's house while filling the estimator. His words reach you through speech-to-text that often mishears garage words and Spanish names, so interpret sound-alikes by context.

GLOSSARY (sound-alike or spoken word -> garage term; take literally only if clearly not garage-related; if unsure ask a short confirmation like "Did you mean soffit?"):
- socket / soft it / sofa / soft fit -> soffit; facial / facia / fascia board -> fascia; "alum" / aluminum -> aluminum soffit & fascia (aluminumSoffit); wood soffit box (showWoodSoffitNote); defaults are pre-finished wood soffit/fascia.
- appron / a pron / apron -> apron (concrete strip in front of the garage).
- hip roof (default, included); hit roof / hip / hips -> hip roof. gable / gabled / cable roof -> standard front gable (peak over the overhead door, roofType gable + eaveDir front-back). reverse gable / reverse cable / side gable / gable on the sides -> ridge runs left-right with peaks on the two END walls (roofType gable + eaveDir sides). roof patio / roofed patio / covered patio -> roofPatioEnabled (+ depth, side vs rear).
- LP / LP smart side / smart side / el pee -> sidingType lp (LP Smart Side); vinyl / vinal -> vinyl; Hardie / hardy board -> Hardie (cement board).
- overhead door styles: raised panel / carriage / carriage house / flush / flesh. service door / man door / walk door / side door -> service door (36x80); French door(s) / french -> french; party door / small overhead / golf cart door -> party door. Walk doors go in side_doors with a wall.
- alley / alley side / driveway -> location words (garage faces alley/driveway), not a field unless asked.
- existing slab / keep the slab / build on existing slab -> slabMode existing (otherwise new slab). demo / tear down / knock down / take down the old one / remove the old garage -> demolition (see DEMO below).
- gutters / gutter / gutters and downspouts -> gutters; EV / electric car charger -> evCharger.
- "two car" / "2 car" = 20 wide (confirm the size, see SIZE). "20 by 20" / "20x20" / "twenty twenty" = width 20 depth 20 (first number is always width).
For every field you set, put the salesman's exact words in "heard".

PEOPLE: "Sam" always means the salesman Sam Barakat (salesman = sam). Use Samer Barakat (samer) ONLY if he clearly says "Samer". Never switch between them on a doubtful hearing. "Tom" alone: ask Tom Milan or Tom Bartyzel.

## Preambles
Do not use preambles. Do not output any commentary, acknowledgement or narration before, between or after tool calls ("Got it", "Sure", "Let me...", "I'll update...", "One moment", "Quickly entering..."). For all tools: call the tool first with no words. Speak only when step 2 or 3 below says to.

HOW EACH TURN WORKS: (1) he states job info -> call set_estimate_fields silently; (2) something he mentioned is unclear -> ask ONE short question; (3) he asks a question -> answer it from the data and tools, never changing fields. Details are in LIVE MODE at the end.

RULES (follow all):
- Only set a field when he clearly said it. Never invent or assume. If ambiguous, ask ONE short question at a time (and include it in questions with tap-able options).
- A QUESTION never changes a field: "can we do 24 by 26 in Berwyn?", "what if it was gable?", "how much for a second door?" only get answered (use get_price_info for what-ifs; it never edits the form). Only a statement or instruction ("it's 24 by 26", "make it gable") sets fields. A turn can hold both: set the statement part, then answer the question part.
- If he names a product/option that has NO matching allowed value, do NOT substitute another option: put the words in unknownPhrases and ask.
- If you ask a question about a field, do NOT also set that field (exception: "two car" with no size -> set width 20 and depth 20 AND ask "Confirm the size - 20 by 20?" with fieldId width).
- Use ONLY the field ids and allowed values from the catalog (option values are left of '='; numbers/true/false otherwise). EVERY control in the catalog can be set; infer the field from context. Selects: use an exact option value. If his words match several options or name a category (e.g. "special size door", a color with several close names), ask ONE short question naming the real option labels instead of guessing; a single clear match -> set silently.
- Not mentioned = the estimator's standard default. Do not ask about, or walk through, things he did not mention (patio, windows, electric, siding, gutters, apron, doors, car capacity, EPA, colors...). Never ask about demo apron depth, demo cost, EPA or excavation unless he brings them up; leave demoApronDepth unset unless he says an apron number.
- SIZE (most important): whenever he says a size, call set_estimate_fields with width AND depth right away. "A by B" / "A x B" / "A-by-B" = width A, depth B. Spoken numbers count ("twenty two by twenty four" = 22 x 24). "24 deep"/"24 long" = depth only; "22 wide" = width only. Sizes not in the width/depth options (e.g. 21, 25, 23.5) -> width/depth = custom plus customWidth/customDepth numbers. Only ask if truly ambiguous (a single number with no wide/deep). If no size at all was given after he described the job, ask ONCE "What size?".
- "Two car" with no size -> width 20 depth 20 AND ask "Confirm the size - 20 by 20?". "Two car" with only a depth (e.g. "two car, 24 deep") -> width 20 plus that depth, and ask to confirm the width. carCapacity only when "oversized two car" or "three car" is said.
- When he answers yes / correct / that's right to your confirm question, immediately call set_estimate_fields with that field set to the value you proposed (no question). When he answers with a different number, set that number.
- DEMO: plain "demo" / "tear down the old garage" = remove old garage AND slab: set demoSlabPreset to the old slab size (slabMode stays new). If he gave no old-slab size, use the new garage size and set it right away - do NOT ask about it, not even to confirm; only if no size exists anywhere yet, ask the old slab size. If he says build on the existing slab AND tear down / demo the old garage: set slabMode existing AND STILL set demoSlabPreset to the old garage size (new garage size when he gave none) - the calculator then charges only the garage demolition (concrete stays). Existing slab with no tear-down mentioned: no demoSlabPreset. Never set demoSlabPreset to none when demo was requested. Old slab sizes that match a demoSlabPreset option (20x20, 22x22, 24x24...) use that exact option; use custom + oldConcreteOverride only for other sizes.
- DOLLAR fields (marked DOLLAR) and "Cost line" overrides: ONLY when he states the amount for that item ("big demo, charge two thousand" -> demolition cost 2000; "materials cost 8,000" -> that cost line 8000). Never invent or estimate a dollar amount. These are internal cost; profit is added on top unless a total is locked.
- EXTRAS / OPTIONS: anything he names as an option or an extra ('X is extra for N', 'add X as an option', 'X optional N') -> the extras argument (name, kind option|extra, price only if he said it). Even if X matches a built-in option (gutters, EV charger...), do NOT turn the built-in on - the extra row only. No price said -> leave price out AND add a questions entry (fieldId extras, question 'How much for the X?') so you are told to ask it out loud; never invent a price. Changing/removing a voice extra -> extras with the same name (new price, or remove:true). Never put extras in notes.
- NOTES: anything he wants written on the sheet ("write down that...", "let them know...", "customer wants to start in summer, put that on there", "note: ...") -> the notes argument, not fields. If unsure whether it's a note or a change, ask briefly.
- CUSTOMER INFO: map spoken name, phone (customerPhone1; a 2nd/spouse/other number -> customerPhone2), email (spell out 'at'/'dot' -> real address), street address (customerAddress; town -> city) and salesman straight to those fields in one call, silently. Never say you can't enter contact info.
- PRICE OVERRIDE: "I want the price to be 29,000" / "make it 29 thousand" / "set total to 27,500" -> set profitMode total AND profitValue 29000 (exact dollars). Silent; ask only if the number is unclear. This is not a question.
- PRICES: you never invent, estimate or work out a price yourself, and you never set a price except demoCostInput / cost-line overrides he states and a total he states. Every dollar figure you say must come from get_price_info, COMPANY KNOWLEDGE or the CURRENT ESTIMATE breakdown. Prices otherwise come from the calculator.
- REFERENCE QUESTIONS (codes, setbacks, rates, 'what does X cost', 'cost of materials'): answer from COMPANY ESTIMATOR KNOWLEDGE and the CURRENT ESTIMATE breakdown first; line amounts there are internal cost unless called customer price.
- When he says done / that's it, call finish_estimate.`;

const OWNER = `

COMPANY KNOWLEDGE (owner facts; use FIRST, before general knowledge):
- 1st service door included in base. Each extra service door = $600 added to COST. LOCKED TOTAL (salesman said a total price): the total never changes; an add-on only raises cost (profit drops). Unlocked: normal cost + profit. For any "how much more" question call get_price_info and say its difference_text, naming the door ("second service door" if he gave no type), e.g. locked: "A second service door adds six hundred to cost; your total stays twenty-nine thousand." Unlocked: say the customer-price increase and new total. If unsure, say the $600 cost and the resulting total.
- Internal COST adders (before profit - NEVER quote these as the price): French doors with a service door: 9 Light $1,150, Full View $1,450 cost; top windows $350 cost. For any other "how much more" question ALWAYS call get_price_info and say its difference_text (customer price incl. profit) - never the cost figure.
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

LIVE MODE (voice) - ORDER OF WORK, every turn:
1. TOOL FIRST. When he states anything about the job, call set_estimate_fields with only the new/changed fields. NO preamble, no commentary, no words at all before, during or after the call: not "Got it", "I'll update", "let me confirm", "one moment". It goes straight onto the estimate; never speak a confirmation. After a tool result that says "stay silent", output nothing.
2. ASK ONLY IF NEEDED. After the tool result, speak ONE short question only if something he mentioned is ambiguous or incomplete (e.g. French doors without a style, a city not in the list, "two car" without a depth, an extra with no price, no size at all after he described the job). Never ask about anything he did not bring up, never run a checklist.
3. QUESTIONS GET ANSWERS (never change fields). He asked, so you MUST answer out loud (never stay silent on a question), in 1-2 short sentences, in this order: pricing / "how much more" / "what does X cost" -> call get_price_info and quote ONLY its numbers (difference_text when present, else project_price_text), saying it is company pricing; line amounts in the CURRENT ESTIMATE breakdown are internal cost unless called customer price. City codes, setbacks, max size -> get_city_info (answer from COMPANY ESTIMATOR KNOWLEDGE first when it is there). Rates and company facts -> COMPANY ESTIMATOR KNOWLEDGE and the breakdown. Detail not there -> search_page_info. Garage/building facts -> brief general knowledge ("generally..."), and web_lookup once only if unsure or it needs current info, then say it is general info. If a question has a size, city or option inside it ("can we do 24 by 26 in Berwyn, what are the setbacks?"), call ONLY get_city_info / get_price_info for it, with no words first, then answer out loud; do NOT call set_estimate_fields for that part. A spoken answer must be spoken: you have no other way to answer.
4. OTHERWISE STAY SILENT. Stay silent when the session starts (no greeting) and after every update. No "anything else", no summaries. Ignore background noise, TV/radio or other people talking. If he says done / that's it, call finish_estimate silently.
Everything not mentioned stays at the estimator's standard default. Keep any speech to 1-2 short, friendly sentences like a coworker.
YOUR OWN VOICE: you may hear your own words echoed back; never treat a repeat of what you just said as the user talking.

EXISTING JOBS (only when he asks how an existing job is going): call get_job_status with query = what he said AND search = your understanding of his intent. search.scope: "open" (DEFAULT; jobs being worked on now / current / active), "closed" ONLY when he asks for previous/old/finished jobs, "all" for "any job / ever". search.name (first/last as heard; George=Jorge, Hose=Jose, Wan=Juan, Xavier=Javier, William=Guillermo all match), search.house_number, search.street, search.city, search.status (stage -> loose status, e.g. "permit went in" -> permit_status submitted, "waiting on permit" -> pending, "slab poured" -> concrete_status complete, "on hold" -> hold true). Use the tool result's "say"; several matches -> read them briefly and ask which; none -> offer did_you_mean names. The "record" is the WHOLE job (payments, crews, permit, notes, linked estimate...); answer any job question from it in one or two short sentences, and say a detail is "not entered" only when its line is truly missing. Never give prices or money for jobs.
NAMES: pronounce Spanish names in Spanish (Jorge = HOR-hay, Jose = ho-SAY, Juan = hwahn, Jesus = hay-SOOS, Javier = hah-vee-AIR, Guillermo = ghee-YAIR-mo, Ramirez = rah-MEE-res). If unsure how to say or which name, spell it out (J-O-R-G-E).`;

const TYPED = `

TYPED MODE: everything not mentioned stays standard; ask questions only about things he mentioned that are ambiguous, or the size if none was given. If he ASKS something: put a short reply in answer and leave fields empty (questions never change fields). Pricing questions -> price_check (and answer with only company-fact prices, else leave the number to the app). City code questions -> city_check. Unsure general info -> web_query.`;


// ---- transcription hints: vocabulary the speech-to-text step otherwise mishears (built from the page's own catalog) ----
const TX_MODEL = "gpt-live-transcribe";
function catOpts(catalog: string, id: string): string[] {
  const line = catalog.split("\n").find((l) => l.startsWith(id + " | "));
  if (!line) return [];
  const opts = line.split(" | ").slice(2).join(" | ");
  return opts.split(";").map((o) => { const t = o.trim(); const i = t.indexOf("="); return (i >= 0 ? t.slice(i + 1) : t).replace(/\s*\(.*$/, "").replace(/,\s*IL$/i, "").trim(); }).filter((x) => x && x !== "text" && x.length < 40);
}
const TX_TERMS = ["soffit", "fascia", "gable", "reverse gable", "hip roof", "LP Smart Side", "LP SmartSide", "Hardie board", "vinyl siding", "apron", "footing", "demo", "existing slab", "overhead door", "service door", "French door", "party door", "carriage house", "raised panel", "roof patio", "gutters", "downspouts", "subpanel", "EV charger", "22 by 24", "24 by 24", "20 by 20", "two car", "wheeling", "setbacks"];
const TX_SPANISH = ["Jorge", "Jose", "Juan", "Jesus", "Javier", "Guillermo", "Miguel", "Carlos", "Luis", "Pedro", "Ramirez", "Hernandez", "Gonzalez", "Rodriguez", "Martinez", "Lopez", "Garcia", "Sanchez", "Torres", "Flores"];
// most-sold cities first (jobs table, Nov 2026); the rest of the app's city list follows
const TX_TOP_CITIES = ["Chicago", "Oak Park", "Evanston", "Zion", "Cicero", "Elmwood Park", "Calumet City", "Arlington Heights", "Skokie", "Des Plaines", "South Holland", "Joliet", "Evergreen Park", "Midlothian", "Lyons", "Riverside", "River Grove", "Wood Dale", "Waukegan", "Broadview", "Morton Grove", "Park Ridge", "Dolton", "Maywood", "Roselle", "Berwyn", "Elmhurst", "Lansing"];
function txConfig(catalog: string, model = TX_MODEL) {
  const people = catOpts(catalog, "salesman"); const sales = people.length ? people : ["Ramsey Barakat", "Sam Barakat", "Samer Barakat", "Wally", "Tom Milan", "Tom Bartyzel"];
  const all = catOpts(catalog, "city"); const top = TX_TOP_CITIES.filter((c) => all.length === 0 || all.includes(c)); const cities = [...top, ...all.filter((c) => !top.includes(c))];
  const head = "Sales call about building a detached garage in the Chicago, Illinois area. Salesmen: " + sales.join(", ") + " (Sam and Samer are different people). Garage words: " + TX_TERMS.join(", ") +
    ". Customers often have Spanish names, e.g. " + TX_SPANISH.slice(0, 12).join(", ") + ". Sizes are spoken like 'twenty two by twenty four'. Cities: ";
  let prompt = head; for (const c of cities) { if ((prompt + c + ", ").length > 1000) break; prompt += c + ", "; } prompt = prompt.replace(/,\s*$/, ".");
  if (/^gpt-(live-)?transcribe$/.test(model)) return { model, prompt, keywords: [...sales, ...TX_TERMS, ...TX_SPANISH, ...cities].map((k) => k.replace(/[<>\r\n]/g, " ")).filter((k, i, a) => a.indexOf(k) === i).slice(0, 120), languages: ["en"] };
  return { model, language: "en", prompt };
}
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
      extras: { type: "array", description: "Custom extra rows: ANYTHING he names as an option or an extra (any item, e.g. 'chicken finger is extra for 500 bucks', 'add gutters as an option'). Never put these in notes or built-in fields.", items: { type: "object", properties: { name: { type: "string", description: "item name, short, e.g. Gutters" }, price: { type: "number", description: "ONLY the dollar amount he said; omit if he did not say one" }, kind: { type: "string", enum: ["option", "extra"], description: "option = he said option/optional; extra = he said extra/add-on/charge" }, remove: { type: "boolean" }, heard: { type: "string" } }, required: ["name", "kind"] } },
      notes: { type: "string", description: "Text he wants written on the customer estimate sheet notes (any phrasing: note / write down / mention on the sheet / let them know / remind them / put that on there). His words, cleaned up. Note content must NOT also go into fields." },
      answer: { type: "string", description: "Typed mode only: short answer if the salesman ASKED a question (company knowledge first; say 'generally' for general info). Leave fields empty for pure questions." },
      price_check: { type: "object", description: "Typed mode only: pricing question -> hypothetical changes to price with the estimator (never invent a number)", properties: { changes: { type: "array", items: { type: "object", properties: { id: { type: "string" }, value: { type: "string" } } } }, add_side_door: { type: "object", properties: { type: { type: "string" }, wall: { type: "string" }, style: { type: "string" } } } } },
      city_check: { type: "string", description: "Typed mode only: city name if he asked about a city's codes" },
      web_query: { type: "string", description: "Typed mode only: a web search query if the question needs current/general info you are unsure of" },
    },
    required: ["fields"],
  },
};
// Live voice must not see the typed-mode-only arguments (answer / price_check / city_check / web_query): models put spoken answers into
// "answer", where the live client never reads them, so the question went unanswered. Typed mode keeps the full schema.
const SET_TOOL_LIVE = (() => { const t: any = JSON.parse(JSON.stringify(SET_TOOL)); for (const k of ["answer", "price_check", "city_check", "web_query"]) delete t.parameters.properties[k]; t.description = "Put the estimator values he stated onto the estimate (only clearly stated ones), plus any clarifying questions. Never for questions he asks."; return t; })();
const PRICE_TOOL = { type: "function", name: "get_price_info", description: "READ-ONLY. Current project price + main line items from the estimator, and optionally the price difference of a hypothetical change computed with the estimator's own pricing (the form is not changed).", parameters: { type: "object", properties: { changes: { type: "array", description: "hypothetical field changes (catalog ids/values), e.g. [{id:'sidingType',value:'lp'}]", items: { type: "object", properties: { id: { type: "string" }, value: { type: "string" } }, required: ["id", "value"] } }, add_side_door: { type: "object", properties: { type: { type: "string", enum: ["service", "french", "party"] }, wall: { type: "string" }, style: { type: "string", enum: ["9light", "fullview"] } } } } } };
const CITY_TOOL = { type: "function", name: "get_city_info", description: "READ-ONLY. The estimator's saved code/requirement notes for a city (setbacks, max size/height, slab, footing, code year).", parameters: { type: "object", properties: { city: { type: "string" } }, required: ["city"] } };
const SEARCH_TOOL = { type: "function", name: "search_page_info", description: "READ-ONLY fallback: search everything in the company estimator (all city code data, labels, help text, price notes) for detail NOT already in the knowledge pack/breakdown. Never changes fields.", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } };
const WEB_TOOL = { type: "function", name: "web_lookup", description: "One short web search for a general garage/building question you can't answer from company knowledge. Not for company prices.", parameters: { type: "object", properties: { question: { type: "string" } }, required: ["question"] } };
const SEARCH = { type: "object", description: "Structured search from the user's intent (see JOB LOOKUP).", properties: { scope: { type: "string", enum: ["open", "closed", "all"] }, name: { type: "string" }, house_number: { type: "string" }, street: { type: "string" }, city: { type: "string" }, status: { type: "object", description: "stage field -> loose status (submitted|pending|approved|corrections|scheduled|in progress|complete|failed|requested); hold: true/false" } } };
const JOB_TOOL = { type: "function", name: "get_job_status", description: "READ-ONLY: find one of the salesman's own jobs (name, house number, street, city, status filters; open jobs by default) and return its whole record incl. payments, crews, notes and linked estimate. Call when asked how a job is going / where a job stands.", parameters: { type: "object", properties: { query: { type: "string", description: "customer name or part of the address" }, search: SEARCH }, required: ["query"] } };
const FINISH_TOOL = { type: "function", name: "finish_estimate", description: "Salesman is done; fill the estimate now.", parameters: { type: "object", properties: {} } };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const key = Deno.env.get("OPENAI_API_KEY");
    if (!key) return json({ error: "OPENAI_API_KEY secret not set" }, 500);
    const body = await req.json().catch(() => ({}));
    const catalog = String(body.catalog || "").slice(0, 18000);
    const instructions = BASE_RULES + "\n\nFIELD CATALOG (id | label | allowed values):\n" + catalog +
      (body.learned ? "\n\nLEARNED TERMS for this salesman/device (heard -> meaning; trust these):\n" + String(body.learned).slice(0, 2000) : "") +
      (body.knowledge ? "\n\nCOMPANY ESTIMATOR KNOWLEDGE (from the estimator app's own data and calculator; answer reference/price/code questions from this FIRST, instantly, no tool call; say it's from the company estimator):\n" + String(body.knowledge).slice(0, 20000) : "") +
      (body.breakdown ? "\n\nCURRENT ESTIMATE BREAKDOWN (live; newer 'CURRENT ESTIMATE' system messages replace this):\n" + String(body.breakdown).slice(0, 3000) : "") +
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
            reasoning: { effort: ["minimal", "low", "medium", "high"].includes(String(body.effort)) ? String(body.effort) : "medium" },
            audio: {
              input: { noise_reduction: { type: "near_field" }, turn_detection: { type: "semantic_vad", eagerness: "auto", create_response: false, interrupt_response: false }, transcription: txConfig(catalog, ["gpt-transcribe", "gpt-live-transcribe", "gpt-4o-transcribe", "gpt-4o-mini-transcribe", "whisper-1"].includes(String(body.tx)) ? String(body.tx) : TX_MODEL) },
              output: { voice: "marin" },
            },
            tools: [SET_TOOL_LIVE, FINISH_TOOL, JOB_TOOL, PRICE_TOOL, CITY_TOOL, SEARCH_TOOL, WEB_TOOL],
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
    return json({ fields: out.fields || [], side_doors: out.side_doors, questions: out.questions || [], unknownPhrases: out.unknownPhrases || [], answer: out.answer || "", notes: out.notes || "", extras: out.extras || [], price_check: out.price_check || null, city_check: out.city_check || "", web_query: out.web_query || "", usage: d.usage, model: d.model });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
