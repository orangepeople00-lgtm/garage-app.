// Supabase Edge Function: read-contract  (deploy: supabase functions deploy read-contract --use-api)
// Body: { image: dataURL, tiles?: dataURL[] }  (tiles = high-res crops of the same page, e.g. top/bottom halves)
// Returns { readable, page_type, fields:{k:string|null}, confidence:{k:'high'|'low'}, alternates:{k:string}, payment_schedule:[...] }
// Pass 1 transcribes; pass 2 independently re-reads the numbers/identity fields. Disagreement => confidence 'low'.
// Secret: OPENAI_API_KEY (or AI_API_KEY + AI_BASE_URL). Model: READ_CONTRACT_MODEL (default gpt-4o).
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const FIELDS: Record<string, string> = {
  customer: "Buyer / customer name(s) exactly as handwritten",
  phone: "All customer phone numbers (home, mobile, work), comma separated, each read digit by digit",
  email: "Customer email",
  address: "JOB ADDRESS street line (house number + street), digit by digit",
  city: "Job city / village",
  state_zip: "State and ZIP if written",
  garage_size: "Garage width x length, e.g. 20x22",
  wall_height: "Wall height ONLY if written in",
  roof: "Roof STYLE = the circled/checked choice on the ROOF STYLE line (e.g. HIP or GABLE) plus its pitch, then shingle type/color if written. Do NOT copy printed lumber lines like '2x6 HIP AND RIDGE'",
  doors: "Overhead door(s). SIZE comes ONLY from the handwritten numbers on the 'GARAGE DOOR: WIDTH __ HEIGHT __' row (Carpenter Specifications column): width = number written beside WIDTH, height = number beside HEIGHT, e.g. '16x7'. Then style/color written on the STYLE/COLOR lines under it. Never take a door size from any other row",
  windows: "Windows: the CIRCLED window type(s) on the 'SINGLE HUNG / PICTURE-JALOUSIE / SLIDER' line (crossed-out types are ignored). A number handwritten in the BLANK just before/after a type is the QUANTITY of that type: return e.g. 'single hung: 2' or 'single hung: 1, slider: 1'. If the type is circled and its blank is empty return just the type (e.g. 'single hung'). Never take a count from another row (e.g. stud counts) and never invent a size",
  service_doors: "Service / entry door details only if checked/written",
  siding: "Siding type and color as written",
  trim: "Soffit / fascia / eaves / trim as written (the '6\" BOXED EAVES - 4 SIDES' row: circled material e.g. Realwood/Aluminum, and the COLOR written under it)",
  shingles: "Shingles: type (circled or written, e.g. Architectural / 3 tab) and the COLOR handwritten on the SHINGLES / COLOR lines",
  studs: "2x4 STUDS row: the on-center spacing handwritten/circled beside it (e.g. 16\" O.C.)",
  rafters: "2x6 RAFTERS row: the circled/handwritten on-center spacing (e.g. 16\" O.C.); a struck-through spacing is ignored",
  header: "OVERHEAD DOOR HEADERS row: what is handwritten/circled beside it (e.g. '(2) LVL')",
  cross_ties: "2x6 CROSS TIES row: handwritten spacing (e.g. 48\" O.C.)",
  sheathing: "Sheathing line: material handwritten (e.g. OSB)",
  gutters: "Gutters/downspouts. If 'NO GUTTERS' is circled/checked, return 'NO GUTTERS'. Null if nothing marked.",
  concrete: "Floor / slab details as written",
  concrete_thickness: "Slab thickness only if a number is written by hand or a thickness option is marked",
  apron: "ONLY the 'SIZE OF APRON' line: the apron size handwritten there (e.g. 30x3). Never take it from the ADD-ON SLAB line",
  extra_slab: "ONLY the 'ADD-ON SLAB SIZE' line (the extra / add-on slab next to the garage, NOT the apron): the size handwritten there (e.g. 8x22) plus any word on the line below it (e.g. steps)",
  demo: "Demolition: only the marked option(s) (e.g. 'Wreck & haul existing garage' if checked, with the written size)",
  electrical: "Electrical work. HANDWRITTEN electrical notes (lights, outlets, switches, GFI, coach lights) OVERRIDE the printed NO ELECTRIC option: if any handwritten electric work is listed, electric IS included — return those items (e.g. 'Included: 2 lights, 2 outlets, 1 switch'), never 'NO ELECTRIC'. Return 'NO ELECTRIC' only if it is marked and no electric work is handwritten",
  permit: "Permit: which option is circled/checked (by seller or by buyer)",
  extras: "Extras / add-ons / allowances written in, separated by '; '",
  notes: "Handwritten special notes / instructions",
  price: "Total / cash price, digits only",
  deposit: "Deposit with this contract, digits only",
  balance: "Balance due if written, digits only",
  sold_date: "Contract Date at the TOP RIGHT, printed as 'Date: ____ , 20__': the month-day is handwritten before the comma (e.g. 7-28) and the last two digits of the year are handwritten after the printed '20' (e.g. 26 -> 2026). Return YYYY-MM-DD (e.g. 2026-07-28). Read each digit separately; a handwritten 8 is often loop-shaped, do not read it as 2",
  signature_date: "Date beside the buyer signature, YYYY-MM-DD, only if written",
  party_door_wall: "Wall the OVERHEAD (party) door is on, in ALLEY terms (never drawing directions like top/bottom): alley side / house side / left / right (as viewed standing in the alley) or front / rear if written, plus a short position note if shown. Sources: site plan labels (e.g. 'overhead door faces alley'), door marks on a drawing, or the spec-sheet sketch",
  service_door_wall: "Wall the SERVICE (entry) door is on, in ALLEY terms (never drawing directions like top/bottom): alley side / house side / left / right (as viewed standing in the alley facing the garage) or front / rear if written, plus a short position note. Sources: service door symbol on a site plan / sketch, or written notes",
  customer_signed: "'yes' if buyer signature present, 'no' if blank line, null if no line",
  other: "Any other handwritten text not covered above, verbatim, '; ' separated",
};
const KEYS = Object.keys(FIELDS);
const VERIFY = ["customer", "phone", "address", "price", "deposit", "sold_date", "garage_size"];
const nullable = { type: ["string", "null"] };
const schema = { name: "contract", strict: true, schema: { type: "object", additionalProperties: false, required: ["page_type", "readable", "fields", "payment_schedule", "sketch"], properties: {
  sketch: { type: "object", additionalProperties: false, required: ["alley_side", "openings"], properties: { alley_side: { type: "string", enum: ["top", "bottom", "left", "right", "none"] }, openings: { type: "array", items: { type: "object", additionalProperties: false, required: ["kind", "side", "pos", "note"], properties: { kind: { type: "string", enum: ["overhead_door", "service_door", "window"] }, side: { type: "string", enum: ["top", "bottom", "left", "right"] }, pos: { type: ["number", "null"] }, note: nullable } } } } },
  page_type: { type: "string", enum: ["contract", "site_plan", "drawing", "photo", "other"] },
  readable: { type: "boolean" },
  fields: { type: "object", additionalProperties: false, required: KEYS, properties: Object.fromEntries(KEYS.map(k => [k, { type: "object", additionalProperties: false, required: ["value", "confidence", "source", "circled"], properties: { circled: { type: "boolean", description: "true when the value is a printed option that is CIRCLED/checked on the form (the definitive answer)" }, value: { ...nullable, description: FIELDS[k] }, confidence: { type: "string", enum: ["high", "low"] }, source: { ...nullable, description: "printed label / line / drawing note the value was read from" } } }])) },
  payment_schedule: { type: "array", items: { type: "object", additionalProperties: false, required: ["stage", "amount", "percent", "due", "confidence"], properties: { stage: { type: "string" }, amount: { type: ["number", "null"] }, percent: { type: ["number", "null"] }, due: nullable, confidence: { type: "string", enum: ["high", "low"] } } } },
} } };
const vschema = { name: "verify", strict: true, schema: { type: "object", additionalProperties: false, required: [...VERIFY, "payment_amounts"], properties: {
  ...Object.fromEntries(VERIFY.map(k => [k, nullable])), payment_amounts: { type: "array", items: { type: "object", additionalProperties: false, required: ["stage", "amount"], properties: { stage: { type: "string" }, amount: { type: ["number", "null"] } } } } } } };
const PROMPT = `You transcribe ONE page of a garage-builder contract / spec sheet (pre-printed form filled in by hand) into JSON.
You get the full page plus zoomed crops of the same page; use the crops to read handwriting.
First classify page_type. On site plans / drawings / sketches read ONLY party_door_wall and service_door_wall (from door marks, symbols and labels such as 'overhead door faces alley'); every other field null. Photos: all null.
For every value give source = the printed label or drawing note it came from (e.g. 'GARAGE DOOR: WIDTH/HEIGHT row', 'site plan: OVERHEAD DOOR FACES ALLEY').
FORM LAYOUT HINT (The Garage Guy / Absolute Garage Builders "Specification Sheet / Retail Contract"):
- Handwriting belongs to the printed label it sits beside on the same row (just left or right of the label, or on the blank after it).
- Header: Buyer -> customer; Home Phone / Mobile No. / Work No. -> phone; JOB ADDRESS -> address (city may be written after it); Email; Date (top right, 'Date: M-DD , 20YY' with month-day and the two year digits handwritten) -> sold_date.
- CARPENTER SPECIFICATIONS column: SIZE: WIDTH __ LENGTH __ -> garage_size; GARAGE DOOR: WIDTH __ HEIGHT __ -> the ONLY source of overhead door size; STYLE / COLOR lines under it -> door style/color; ROOF STYLE: HIP OR GABLE __/12 Pitch -> roof (circled word = choice: a hand-drawn loop AROUND the word; struck-through word = a straight line drawn THROUGH the letters = rejected, ignore it. Look closely at the zoomed crop: the circled word and the struck word are different words); SHINGLES / COLOR; TYPE OF SIDING / COLOR -> siding.
- CONSTRUCTION SPECIFICATIONS column: printed lumber specs (2x4 studs, 2x6 rafters, HIP AND RIDGE, primed service door, single hung / picture / slider windows) are NOT data unless circled or written beside; WRECK & HAUL / BREAK & HAUL ... SIZE __ -> demo; circled "NO ELECTRIC", "NO GUTTERS", etc. -> those negatives.
- CONCRETE SPECIFICATIONS column: SIZE OF FLOOR -> concrete slab size; SIZE OF APRON -> apron (e.g. 30x3); ADD-ON SLAB SIZE -> extra_slab (e.g. 8x22, a DIFFERENT slab from the apron); WALKS / PATIO -> extras.
- Handwritten electric notes (lights, outlets, switches, coach lights, GFI, "Electric ...") anywhere on the page mean electric IS included.
- SKETCH: if the page has a hand-drawn garage sketch (a rectangle = the garage), describe it purely as drawn on the paper, in DRAWING directions (top / bottom / left / right of the page as you look at it): sketch.alley_side = the side of the garage rectangle where the word 'Alley' (or the alley / apron / overhead door marks facing the alley) is drawn, 'none' if no alley is marked. sketch.openings = every overhead door, service door (small door symbol, often with a swing line / the letters S.D.) and window (small box with a cross, often marked 'W' or with a size) drawn ON the rectangle: side = which side of the rectangle it is drawn on, pos = where its CENTER sits along that side as a fraction 0..1 (top/bottom sides measured from the LEFT end, left/right sides measured from the TOP end). Do not convert to compass or alley terms. No sketch => alley_side 'none' and no openings.
- Payment block: Cash Price $ -> price; each "Deposit with this Contract / 2nd Deposit / After Wreck & Haul / on Completion of Concrete / After Built / on Completion after electric" line -> one payment_schedule item with the amount written on that line.
CRITICAL RULES:
1. A CIRCLED (or checked) printed option is the DEFINITIVE answer: set circled=true and confidence high. A struck-through option is ignored entirely (never report it, never mention it). Pre-printed form text is NOT data. A printed option counts ONLY if it is circled, checked, ticked, underlined, or has handwriting next to it. Unmarked printed options => null.
2. Respect negatives: if an option like "NO GUTTERS", "NO ELECTRIC", "NO PAINTING" is circled/checked, report that negative (e.g. gutters="NO GUTTERS"). Crossed-out text is NOT data.
3. Read handwritten numbers digit by digit (prices, phones, house numbers, dates, payment amounts). Do not round, do not compute, do not "fix" totals.
4. Never guess or infer. Not written or not legible => value null.
5. confidence: "high" only when the handwriting is clearly legible and unambiguous; otherwise "low". Any value you hesitated on => "low".
6. Money digits only. Dates YYYY-MM-DD only when day, month and year are all written (a 2-digit year 26 means 2026).
7. payment_schedule: one item for EVERY printed payment line in the payment section, top to bottom, INCLUDING blank lines (amount null). stage = the printed label on that line. amount = the handwritten amount sitting on THAT SAME line (follow the dotted leader across to the $). Handwriting that sits between two lines belongs to the line whose $ it follows. Never shift an amount to a neighbouring line.`;
const VPROMPT = `Independently re-read ONLY these handwritten values on this contract page, digit by digit, ignoring any previous reading:
customer (buyer name), phone (all customer phones, comma separated), address (JOB ADDRESS street line), price (cash/total price), deposit (deposit with this contract), sold_date (top-right 'Date: __-__ , 20__' line: month-day before the comma, year = '20' + the two handwritten digits after the printed 20; YYYY-MM-DD), garage_size (width x length),
payment_amounts (EVERY printed payment line, stage = the printed label exactly, amount = the handwritten amount ON THAT SAME LINE or null if that line is blank). Null if not legible. Never guess.`;

// ---------- physical-fit checks (feet unless the numbers only make sense as inches) ----------
const num = (x: string) => { const m = x.match(/(\d+(?:\.\d+)?)\s*(?:'|ft|feet)?\s*(?:(\d+(?:\.\d+)?)\s*(?:"|in))?/i); if (!m) return NaN; return Number(m[1]) + (m[2] ? Number(m[2]) / 12 : 0); };
function dims(s: string | null): { c: number; a: number; b: number; raw: string; inch: boolean }[] {
  if (!s) return [];
  const out: any[] = []; const re = /(?:(\d+)\s*(?:-|,|\bpcs?\b|@|\))\s*(?=\d+(?:\.\d+)?\s*['"]?\s*(?:\d+\s*"?\s*)?[x×]))?(\d+(?:\.\d+)?\s*(?:'\s*\d+(?:\.\d+)?\s*"?|"|')?)\s*[x×]\s*(\d+(?:\.\d+)?\s*(?:'\s*\d+(?:\.\d+)?\s*"?|"|')?)/gi;
  let m; while ((m = re.exec(s))) { const a = num(m[2]), b = num(m[3]); const inch = /"/.test(m[2] + m[3]) && !/'/.test(m[2] + m[3]); out.push({ c: m[1] ? Number(m[1]) : 1, a, b, raw: m[0].trim(), inch }); }
  return out;
}
const toFt = (v: number, inchHint: boolean, maxFt: number) => (inchHint || v > maxFt) ? v / 12 : v;
function fitChecks(f: Record<string, string | null>) {
  const bad: Record<string, string> = {};
  const g = dims(f.garage_size)[0]; let W = NaN, D = NaN;
  if (f.garage_size) { if (!g) bad.garage_size = "could not read a W x L size"; else { W = g.a; D = g.b; if (W < 8 || W > 60 || D < 8 || D > 80) { bad.garage_size = `${g.raw} is not a plausible garage size in feet`; W = D = NaN; } } }
  let H = NaN;
  if (f.wall_height) { const h = num(f.wall_height); if (!isFinite(h)) bad.wall_height = "no number"; else { H = h >= 60 && h <= 200 ? h / 12 : h; if (H < 6 || H > 16) { bad.wall_height = `${f.wall_height} is not a plausible wall height`; H = NaN; } } }
  const ds = dims(f.doors);
  if (f.doors && ds.length) {
    let sum = 0; const r: string[] = [];
    for (const d of ds) { const dw = toFt(d.a, d.inch, 24), dh = toFt(d.b, d.inch, 16); sum += dw * (d.c || 1);
      if (dw < 6 || dw > 20 || dh < 6 || dh > 14) r.push(`${d.raw}: not a plausible overhead door size`);
      if (isFinite(H) && dh > H) r.push(`${d.raw}: door ${dh.toFixed(1)}' tall is taller than the ${H.toFixed(1)}' wall`);
      if (isFinite(W) && dw > W) r.push(`${d.raw}: door wider than the ${W}' front`); }
    if (isFinite(W) && sum > W - 1) r.push(`door widths add up to ${sum.toFixed(1)}' but the front is only ${W}' (needs ~1' of jambs)`);
    if (r.length) bad.doors = r.join("; ");
  }
  // window SIZE is not checked (Ramsey: not needed for job entry); only an implausible count is flagged
  const wc = f.windows ? Number((f.windows.match(/^\s*(\d+)\b(?!\s*["'x×])/) || [])[1]) : NaN;
  if (isFinite(wc) && (wc < 1 || wc > 8)) bad.windows = `${wc} windows is unusual — count misread?`;
  const sd = dims(f.service_doors);
  if (f.service_doors && sd.length) { const d = sd[0]; const w = toFt(d.a, d.inch, 4), h = toFt(d.b, d.inch, 8.5);
    if (w < 2 || w > 4 || h < 6 || h > 8.5) bad.service_doors = `${d.raw} is not a plausible service door`; else if (isFinite(H) && h > H) bad.service_doors = `${d.raw} is taller than the wall`; }
  const sl = dims(f.concrete);
  if (f.concrete && sl.length && isFinite(W)) { const s0 = sl[0]; const same = (s0.a === W && s0.b === D) || (s0.a === D && s0.b === W);
    if (!same && !/add|apron|walk|pad/i.test(f.concrete.slice(0, f.concrete.indexOf(s0.raw)))) bad.concrete = `slab ${s0.raw} does not match the ${W}x${D} garage`; }
  const t = f.concrete_thickness ? num(f.concrete_thickness) : NaN;
  if (f.concrete_thickness && !(t >= 3 && t <= 8)) bad.concrete_thickness = `${f.concrete_thickness} is not a plausible slab thickness (3–8")`;
  const ap = dims(f.apron)[0];
  if (f.apron && ap) { const big = Math.max(ap.a, ap.b), small = Math.min(ap.a, ap.b);
    const doorW = ds.length ? Math.max(...ds.map(d => toFt(d.a, d.inch, 24))) : NaN;
    if (big > 40 || small < 2) bad.apron = `${ap.raw} is not a plausible apron`;
    else if (isFinite(doorW) && big < doorW) bad.apron = `apron ${ap.raw} is narrower than the ${doorW}' overhead door`;
  }
  return bad;
}
const DIMS = ["garage_size", "wall_height", "doors", "service_doors", "concrete", "concrete_thickness", "apron"];
const digits = (s: unknown) => String(s ?? "").replace(/[^0-9]/g, "");
const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
async function ai(key: string, base: string, model: string, system: string, imgs: string[], fmt: unknown) {
  const content: any[] = [{ type: "text", text: "Page image, then zoomed crops of the same page." }, ...imgs.map(u => ({ type: "image_url", image_url: { url: u, detail: "high" } }))];
  const r = await fetch(base + "/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
    body: JSON.stringify({ model, temperature: 0, response_format: { type: "json_schema", json_schema: fmt }, messages: [{ role: "system", content: system }, { role: "user", content }] }) });
  const j = await r.json(); if (!r.ok) throw new Error(j?.error?.message || "AI request failed");
  return JSON.parse(j.choices?.[0]?.message?.content || "{}");
}
const DATE_PROMPT = `This is a zoomed crop of the TOP-RIGHT header of a contract. Find the printed 'Date:' line, printed as 'Date: ________ , 20___'.
Transcribe EXACTLY the handwriting: month_day = the handwritten month and day written BEFORE the comma (e.g. '7-28'), year2 = the TWO handwritten digits written AFTER the printed '20' (e.g. '26'). The printed '20' is part of the form, never one of the handwritten digits.
First describe the pen strokes of EVERY handwritten character in 'shapes' (e.g. '1st: straight slanted stroke with top bar = 7; 2nd: dot/dash separator; 3rd: curve with flat base = 2; 4th: loop on top with a tail/second loop = 8'), then decide. In this handwriting an 8 is often drawn like a 'P' or an 'R' / 'L' with a loop (a loop on top plus a stroke), and a 6 like a 'C' or 'G' with a small closed loop at the bottom; a 2 has a curved top and a FLAT base stroke and NO loop. Never read a looped character as 2 or 3. Null if not legible.`;
const dschema = { name: "date", strict: true, schema: { type: "object", additionalProperties: false, required: ["shapes", "month_day", "year2"], properties: { shapes: { type: "string" }, month_day: nullable, year2: nullable } } };
function ymd(md: string | null, y2: string | null): string | null {
  const m = String(md || "").match(/(\d{1,2})\s*[-\/.]\s*(\d{1,2})/); const y = digits(y2);
  if (!m || y.length !== 2) return null; const mo = Number(m[1]), d = Number(m[2]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null; return `20${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const t0 = Date.now(); const timing: Record<string, number> = {};
  try {
    // 2026-10-15: only a REAL signed-in staff user may spend AI credits — the public anon/publishable key is rejected
    const authz = req.headers.get("authorization") || "";
    if (!/^Bearer\s+\S+/i.test(authz)) return json({ error: "Sign in required" }, 401);
    { const SB = Deno.env.get("SUPABASE_URL"), AK = Deno.env.get("SUPABASE_ANON_KEY");
      if (!SB || !AK) return json({ error: "Server auth not configured" }, 500);
      const tok = authz.replace(/^Bearer\s+/i, "");
      if (tok === AK || /^sb_(publishable|secret)_/.test(tok)) return json({ error: "Sign in required" }, 401);
      const u = await fetch(SB + "/auth/v1/user", { headers: { Authorization: authz, apikey: AK } }).catch(() => null);
      const uj = u && u.ok ? await u.json().catch(() => null) : null;
      if (!uj || !uj.id) return json({ error: "Sign in required" }, 401);
      const pr = await fetch(SB + "/rest/v1/staff_profiles?select=active&id=eq." + encodeURIComponent(uj.id), { headers: { Authorization: authz, apikey: AK } }).catch(() => null);
      const pj = pr && pr.ok ? await pr.json().catch(() => null) : null;
      if (!Array.isArray(pj) || !pj[0] || pj[0].active === false) return json({ error: "Staff account required" }, 403); }
    const { image, tiles, header, crops } = await req.json();
    const ok = (u: unknown) => typeof u === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(u);
    const imgs = [image, ...(Array.isArray(tiles) ? tiles : [])].filter(ok).slice(0, 5);
    const headerImg = ok(header) ? header as string : ok(crops?.header) ? crops.header as string : null;
    const payAmtImg = ok(crops?.payAmt) ? crops.payAmt as string : null; const payImg = ok(crops?.pay) ? crops.pay as string : null, roofImg = ok(crops?.roof) ? crops.roof as string : null;
    if (!imgs.length || imgs.join("").length + (headerImg || "").length + (payImg || "").length + (payAmtImg || "").length + (roofImg || "").length > 22_000_000) return json({ error: "Send JPEG/PNG page images under 14 MB total" }, 400);
    const key = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("AI_API_KEY");
    if (!key) return json({ error: "AI key not configured on the server" }, 500);
    const base = Deno.env.get("AI_BASE_URL") || "https://api.openai.com/v1";
    const model = Deno.env.get("READ_CONTRACT_MODEL") || "gpt-4.1";
    const vmodel = Deno.env.get("READ_CONTRACT_VERIFY_MODEL") || "gpt-4o";
    const tilesOnly = imgs.slice(1).length ? imgs.slice(1) : imgs;
    // independent passes that do not depend on pass 1 run in PARALLEL with it (speed)
    const verifyP = ai(key, base, vmodel, VPROMPT, imgs, vschema).catch(() => null);
    const dateP = ai(key, base, model, DATE_PROMPT, headerImg ? [headerImg] : [imgs[2] || imgs[0]], dschema).catch(() => null);
    const dateP2 = ai(key, base, vmodel, DATE_PROMPT, headerImg ? [headerImg] : [imgs[2] || imgs[0]], dschema).catch(() => null);
    const zs = { name: "payz", strict: true, schema: { type: "object", additionalProperties: false, required: ["lines"], properties: { lines: { type: "array", items: { type: "object", additionalProperties: false, required: ["stage", "amount"], properties: { stage: { type: "string" }, amount: { type: ["number", "null"] } } } } } } };
    const payP = ai(key, base, model, "ZOOMED crops of a contract page. If there is a payment block (Cash Price, Deposit with this Contract, 2nd Deposit, After Wreck & Haul, on Completion of Concrete, After Built, on Completion after electric, ...), give for EVERY printed payment line the handwritten amount on THAT line, digit by digit; null if blank. Look closely at the first digit of each amount (1 vs 2 vs 7) and at every zero. No payment block => empty list.", payImg ? [payImg, ...tilesOnly.slice(2)] : tilesOnly, zs).catch(() => null);
    const roofP = ai(key, base, model, "Zoomed crop(s) of a garage contract. Find the printed line 'ROOF STYLE: HIP OR GABLE __/12 Pitch'. Exactly one of the words HIP / GABLE may have a hand-drawn LOOP drawn AROUND it (circled = chosen). A word with a straight line drawn THROUGH its letters is struck out (rejected). Report which word is circled, which (if any) is struck through, and the handwritten pitch number. Null if you cannot tell.", roofImg ? [roofImg, imgs[1] || imgs[0]] : [imgs[1] || imgs[0]],
      { name: "roof", strict: true, schema: { type: "object", additionalProperties: false, required: ["circled", "struck", "pitch"], properties: { circled: { type: ["string", "null"], enum: ["HIP", "GABLE", null] }, struck: { type: ["string", "null"], enum: ["HIP", "GABLE", null] }, pitch: nullable } } }).catch(() => null);
    const concImg = ok(crops?.concrete) ? crops.concrete as string : null;
    const concP = concImg ? ai(key, base, model, "Zoomed crop of the CONCRETE SPECIFICATIONS column of a garage contract. Read the handwriting on these printed lines, digit by digit (write sizes as WxL, e.g. 30x3): floor = SIZE OF FLOOR; apron = SIZE OF APRON; extra_slab = ADD-ON SLAB SIZE (plus a word written under it, e.g. '1 step'). First describe each handwritten digit's strokes in 'shapes'. In this handwriting an 8 often looks like a 'P' or a looped 'l' (loop on top + tail), a 3 is two open bumps, a 0 / o is a small closed oval; ' marks feet. Null if blank / not legible.", [concImg],
      { name: "conc", strict: true, schema: { type: "object", additionalProperties: false, required: ["shapes", "floor", "apron", "extra_slab"], properties: { shapes: { type: "string" }, floor: nullable, apron: nullable, extra_slab: nullable } } }).catch(() => null) : Promise.resolve(null);
    const skImg = ok(crops?.sketch) ? crops.sketch as string : null;
    const skSchema = { name: "sketch", strict: true, schema: { type: "object", additionalProperties: false, required: ["describe", "alley_side", "openings"], properties: { describe: { type: "string" }, alley_side: { type: "string", enum: ["top", "bottom", "left", "right", "none"] }, openings: (schema.schema.properties as any).sketch.properties.openings } } };
    const skP = skImg ? ai(key, base, model, `Zoomed crop of a hand-drawn site sketch on a garage contract. Work in DRAWING directions only (top / bottom / left / right of this image).
Step 1 (describe): find the GARAGE = the main closed rectangle (it may share lines with the yard / lot lines). Say where the word 'Alley' is written and which side of the garage rectangle faces it (the apron, e.g. "3' apron", sits between the garage and the alley). Then list every mark ON the rectangle's sides: overhead door (a long opening, often with its width and the 2' returns written beside it, on the alley side), service door (a short gap with a diagonal swing line or a small '7'-like mark, or 'S.D.'), window (a small square with a cross / '#'). Ignore lines that are outside the rectangle (walks, slabs, steps, the house).
Step 2: alley_side = side of the GARAGE rectangle facing the alley. openings: side = which side of the rectangle each mark is ON; pos = where its center is along that side, 0..1 (top/bottom sides from the LEFT end, left/right sides from the TOP end). A mark at a corner is ~0.05 or ~0.95.`, [skImg], skSchema).catch(() => null) : Promise.resolve(null);
    const out = await ai(key, base, model, PROMPT, imgs, schema); timing.pass1 = Date.now() - t0;
    const PLACE = ["party_door_wall", "service_door_wall"]; const source: Record<string, string> = {}; const circled: Record<string, boolean> = {};
    const fields: Record<string, string | null> = {}, confidence: Record<string, string> = {}, alternates: Record<string, string> = {};
    let checks: Record<string, string> = {}; const reread: Record<string, { value: string | null; agree: boolean }> = {};
    for (const k of KEYS) { const f = out?.fields?.[k] || {}; const v = f.value == null || String(f.value).trim() === "" || /^(n\/?a|none|null|unknown)$/i.test(String(f.value).trim()) ? null : String(f.value).trim(); fields[k] = v; if (v != null) { confidence[k] = f.confidence === "high" ? "high" : "low"; if (f.source) source[k] = String(f.source); if (f.circled) { confidence[k] = "high"; circled[k] = true; } } }
    const skR = await skP; const openings = sketchToWalls(skR && skR.alley_side !== "none" ? skR : out?.sketch);
    let ps = Array.isArray(out?.payment_schedule) ? out.payment_schedule.filter((p: any) => p && p.stage).slice(0, 15) : [];
    const page_type = out?.page_type || "other";
    const readable = page_type === "contract" && KEYS.some(k => fields[k] != null);
    if (!readable && ["site_plan", "drawing"].includes(page_type)) { const pf: Record<string, string | null> = {}, pc: Record<string, string> = {}, psrc: Record<string, string> = {}; for (const k of PLACE) if (fields[k] != null) { pf[k] = fields[k]; pc[k] = confidence[k]; if (source[k]) psrc[k] = source[k]; } return json({ readable: false, page_type, fields: pf, confidence: pc, source: psrc, alternates: {}, checks: {}, reread: {}, payment_schedule: [], openings, timing: { total: Date.now() - t0 } }); }
    if (!readable) return json({ readable: false, page_type, fields: {}, confidence: {}, source: {}, alternates: {}, checks: {}, reread: {}, payment_schedule: [], openings: [], timing: { total: Date.now() - t0 } });
    // zoomed re-read of dimensions that failed a fit check / were unsure (windows are never flagged on size) — starts now, runs while we wait for the parallel passes
    checks = fitChecks(fields);
    const want = DIMS.filter(k => fields[k] != null && !circled[k] && (checks[k] || confidence[k] === "low"));
    const rereadP = want.length ? ai(key, base, model, `These are ZOOMED crops of a contract page. Re-read ONLY these fields digit by digit, at full zoom, ignoring any earlier reading: ${want.map(k => `${k} (${FIELDS[k]})`).join("; ")}. For sizes, write exactly the digits and unit marks (' or ") you see, and the count if written. Null if not legible. Never guess.`, tilesOnly,
      { name: "reread", strict: true, schema: { type: "object", additionalProperties: false, required: want, properties: Object.fromEntries(want.map(k => [k, nullable])) } }).catch(() => "fail") : Promise.resolve(null);
    const [v, dr, zr, rr, rf, cc, dr2] = await Promise.all([verifyP, dateP, payP, rereadP, roofP, concP, dateP2]);
    // ---- concrete column zoom: apron vs add-on slab are different lines; a disagreeing zoomed read flags the value and offers both
    if (cc) for (const [k, z] of [["apron", cc.apron], ["extra_slab", cc.extra_slab], ["concrete", cc.floor]] as [string, string | null][]) {
      if (z == null) continue; const a = fields[k];
      if (a == null) { fields[k] = z; confidence[k] = "low"; source[k] = "CONCRETE column (zoomed read only)"; continue; }
      const da = (String(a).match(/\d+/g) || []).slice(0, 2).join("x"), dz = (String(z).match(/\d+/g) || []).slice(0, 2).join("x");
      if (da === dz) reread[k] = { value: z, agree: true }; else { /* the dedicated zoomed line read becomes the main value; the first read is offered as the 2nd read */ reread[k] = { value: a, agree: false }; alternates[k] = a; fields[k] = z; source[k] = (source[k] || k) + " (zoomed concrete column)"; checks[k] = (checks[k] ? checks[k] + "; " : "") + `first read gave ${a}, zoomed read ${z}`; }
    }
    // ---- roof: the circled word is definitive (never flagged); the focused zoom read of the ROOF STYLE line decides which word that is
    if (rf && rf.circled && rf.circled !== rf.struck) { const w = rf.circled; const cur = (fields.roof || "").match(/\b(hip|gable)\b/i)?.[1];
      if (!cur) fields.roof = w + (rf.pitch ? " " + String(rf.pitch).replace(/\s*\/\s*12.*$/, "") + "/12 Pitch" : "") + (fields.roof ? ", " + fields.roof : "");
      else if (cur.toUpperCase() !== w) { alternates.roof = fields.roof || ""; fields.roof = (fields.roof || "").replace(/\b(hip|gable)\b/i, w); }
      circled.roof = true; confidence.roof = "high"; source.roof = "ROOF STYLE line (circled word, zoomed)"; } timing.passes = Date.now() - t0;
    // ---- verify pass (different model => independent errors). A circled option is definitive and never flagged.
    const va = Array.isArray(v?.payment_amounts) ? v.payment_amounts : [];
    if (v) {
      for (const k of VERIFY) {
        const a = fields[k], b = v?.[k] == null ? null : String(v[k]).trim();
        if (a == null && b == null) continue;
        const groups = (x: unknown) => (String(x ?? "").match(/\d[\d\s().-]{6,}\d/g) || []).map(digits).map(d => d.slice(-10)).sort().join(",");
        const same = k === "phone" ? groups(a) === groups(b)
          : ["price", "deposit", "sold_date", "garage_size"].includes(k) ? digits(a) === digits(b)
          : k === "address" ? (norm(b).startsWith(norm(a)) || norm(a).startsWith(norm(b))) && digits(a) === digits(b)
          : norm(a) === norm(b);
        if (!same && !circled[k]) { confidence[k] = "low"; if (b) alternates[k] = b; }
      }
    } else for (const k of VERIFY) if (fields[k] != null && !circled[k]) confidence[k] = "low";
    // ---- contract date: two independent zoomed reads of the header crop + the two full-page reads. Month-day: the zoomed reads decide (they must agree,
    // or a majority of all reads). Year: the reads must agree; when they split between years, the ONE read year within a year of today wins
    // (a new contract is never years old). Otherwise flagged and left blank — never guessed.
    { const okd = (x: unknown) => typeof x === "string" && /^\d{4}-\d\d-\d\d$/.test(x) ? x as string : null;
      const a = okd(fields.sold_date), b = okd(v?.sold_date), z1 = dr ? ymd(dr.month_day, dr.year2) : null, z2 = dr2 ? ymd(dr2.month_day, dr2.year2) : null;
      const all = [a, b, z1, z2].filter(Boolean) as string[]; const zs = [z1, z2].filter(Boolean) as string[];
      const maj = (xs: string[]) => { const c: Record<string, number> = {}; xs.forEach(x => c[x] = (c[x] || 0) + 1); const top = Object.entries(c).sort((p, q) => q[1] - p[1]); return top.length && (top.length === 1 || top[0][1] > top[1][1]) ? top[0][0] : null; };
      const md = zs.length === 2 && zs[0].slice(5) === zs[1].slice(5) ? zs[0].slice(5) : maj(all.map(x => x.slice(5)));
      const ys = [...new Set(all.map(x => x.slice(0, 4)))]; const nowY = new Date().getFullYear();
      const yr = ys.length === 1 ? ys[0] : (() => { const recent = ys.filter(y => Math.abs(Number(y) - nowY) <= 1); return recent.length === 1 ? recent[0] : null; })();
      const pick = md && yr ? `${yr}-${md}` : null;
      if (pick) { if (a && a !== pick) alternates.sold_date = a; fields.sold_date = pick; confidence.sold_date = "high"; reread.sold_date = { value: z1 || z2, agree: true }; delete checks.sold_date; source.sold_date = "Date line (top right), zoomed header read" + (ys.length > 1 ? ` (readers split ${ys.join("/")}; ${yr} is the only current year)` : ""); }
      else if (all.length) { confidence.sold_date = "low"; const alt = all.find(x => x !== a); if (alt) alternates.sold_date = alt; if (!a) fields.sold_date = all[0]; checks.sold_date = `date readings disagree (${[...new Set(all)].join(", ")})`; } }
    // ---- dimension re-read results
    if (rr === "fail") for (const k of want) checks[k] = (checks[k] ? checks[k] + "; " : "") + "zoomed re-read failed";
    else if (rr) for (const k of want) { const b = rr?.[k] == null ? null : String(rr[k]).trim(); const agree = b != null && digits(b) === digits(fields[k]); reread[k] = { value: b, agree };
      if (!agree) { checks[k] = (checks[k] ? checks[k] + "; " : "") + `zoomed re-read disagrees (${b ?? "not legible"})`; if (b) alternates[k] = b; }
      else if (checks[k]) checks[k] += "; zoomed re-read gives the same digits — still doubtful"; }
    // ---- electric: handwritten notes that mention electric / lights / outlets / switches => electric IS included (beats a printed NO ELECTRIC)
    { const t = [fields.notes, fields.extras, fields.other].filter(Boolean).join("; ");
      const ELEC = /(electric|light|outlet|switch|gfi|coach|receptacle)/i;
      if (ELEC.test(t) && (!fields.electrical || /^\s*no electric/i.test(fields.electrical))) {
        const items = (t.match(/[^;]*(electric|light|outlet|switch|gfi|coach|receptacle)[^;]*/gi) || [t]).map(x => x.trim()).join("; ");
        fields.electrical = "Included (handwritten): " + items; delete circled.electrical; confidence.electrical = "high"; source.electrical = (source.notes || "handwritten notes") + " (electric written by hand)"; delete checks.electrical; }
      else if (fields.electrical && !/^\s*no electric/i.test(fields.electrical) && ELEC.test(fields.electrical)) { /* electric work is written by hand => included, whatever the exact item wording */ if (!/^included/i.test(fields.electrical)) fields.electrical = "Included: " + fields.electrical; confidence.electrical = "high"; delete checks.electrical; } }
    // ---- payments: tag each line with the verify pass; if stages don't sum to the cash price, use the zoomed re-read and prefer the ONE reading that matches
    const lab = (x: unknown) => norm(x).replace(/^(on|the)/, "");
    ps = ps.map((p: any) => { const q = va.find((x: any) => lab(x.stage) === lab(p.stage)) || null; const agree = !!q && digits(q.amount) === digits(p.amount); return { ...p, confidence: agree && p.confidence === "high" ? "high" : "low", alt_amount: !agree && q && q.amount != null ? q.amount : undefined }; });
    let reconcile: any = null;
    const price = Number(digits(fields.price));
    if (ps.length && price) {
      const sumOf = (a: number[]) => a.reduce((x, y) => x + y, 0);
      const cur = ps.map((p: any) => Number(p.amount) || 0);
      const zoom0: any[] = Array.isArray(zr?.lines) ? zr.lines : []; const zA = (p: any) => (zoom0.find((z: any) => lab(z.stage) === lab(p.stage)) || {}).amount;
      const disagree = ps.some((p: any) => { const r = [p.amount, zA(p), p.alt_amount].filter((x: any) => x != null).map(Number); return new Set(r).size > 1; });
      if (sumOf(cur) === price && !disagree) { ps = ps.map((p: any) => ({ ...p, confidence: "high", alt_amount: undefined })); reconcile = { ok: true, sum: price, how: "stages add up to the cash price" }; }
      else {
        const zoom: any[] = Array.isArray(zr?.lines) ? zr.lines : [];
        const zAmt = (p: any) => (zoom.find((z: any) => lab(z.stage) === lab(p.stage)) || {}).amount;
        // candidate readings per line: pass 1, the zoomed re-read, and the verify pass for THE SAME line only
        const cands = ps.map((p: any) => { const set = new Set<number>(); [p.amount, zAmt(p), p.alt_amount].forEach((x: any) => { if (x != null && isFinite(Number(x))) set.add(Number(x)); }); if (!set.size) set.add(0); return [...set]; });
        const search = (cs: number[][]) => { const sols: number[][] = []; const rec = (i: number, acc: number[]) => { if (sols.length > 3) return; if (i === cs.length) { if (sumOf(acc) === price) sols.push(acc.slice()); return; } for (const x of cs[i]) rec(i + 1, [...acc, x]); }; rec(0, []); return sols; };
        // every combination of the readings (plus ONE common first-digit confusion) that sums EXACTLY to the cash price; the one most readers agree with wins
        const CONF: Record<string, string[]> = { "1": ["2", "7"], "2": ["1", "7"], "3": ["8"], "5": ["6"], "6": ["5"], "7": ["1", "2"], "8": ["3", "6"] };
        let sols: number[][] = search(cands);
        cands.forEach((c, i) => c.forEach(x => { if (!x) return; const sv = String(x); (CONF[sv[0]] || []).forEach(d => { const alt = Number(d + sv.slice(1)); search(cands.map((y, j) => j === i ? [alt] : y)).forEach(sol => sols.push(sol)); }); }));
        sols = [...new Map(sols.map(x => [x.join(","), x])).values()];
        const votes = (sol: number[]) => sol.reduce((n, x, i) => { const p = ps[i]; return n + [p.amount, zAmt(p), p.alt_amount].filter((y: any) => Number(y || 0) === x).length; }, 0);
        let how = "stages re-read so they add up to the cash price";
        if (sols.length > 1) { // forced-choice tie-break on the zoomed payment block
          const diff = ps.map((p: any, i: number) => [...new Set(sols.map(s2 => s2[i]))]).map((o, i) => ({ i, o })).filter(x => x.o.length > 1);
          const opts = sols.slice(0, 4); const L = "ABCD";
          const q = `Zoomed crop(s) of the payment block of a contract (the first is a close-up of the amount column). Several readings of the handwritten amounts all add up to the cash price; only ONE matches the handwriting. They differ only on these lines: ${diff.map(x => `"${ps[x.i].stage}"`).join(", ")}.
${opts.map((o, j) => `Option ${L[j]}: ${diff.map(x => `${ps[x.i].stage} = ${o[x.i] || "blank"}`).join(", ")}`).join("\n")}
For each differing line describe the FIRST digit's pen strokes in 'shapes' (a 1 is a single straight stroke, often slanted, sometimes with a small flag at the top; a 2 has a rounded top hook and a flat horizontal base stroke), then answer the option letter that matches.`;
          const tsch = { name: "tb", strict: true, schema: { type: "object", additionalProperties: false, required: ["shapes", "option"], properties: { shapes: { type: "string" }, option: { type: "string", enum: L.slice(0, opts.length).split("") } } } };
          const tbImgs = [payAmtImg, payImg].filter(Boolean) as string[]; if (!tbImgs.length) tbImgs.push(...tilesOnly);
          const [t1, t2] = await Promise.all([ai(key, base, model, q, tbImgs, tsch).catch(() => null), ai(key, base, vmodel, q, tbImgs, tsch).catch(() => null)]);
          if (t1 && t2 && t1.option === t2.option) { sols = [opts[L.indexOf(t1.option)]]; how = "two zoomed tie-break reads picked the same reading that adds up to the cash price"; }
          else { ps = ps.map((p: any) => ({ ...p, confidence: "low" })); reconcile = { ok: false, sum: sumOf(cur), options: opts, how: "more than one reading adds up to the cash price — pick on the paper" }; sols = []; }

        }
        const distinct = [...new Map(sols.map(x => [x.join(","), x])).values()];
        if (reconcile && reconcile.ok === false) { /* ambiguous: already flagged with the options */ }
        else if (distinct.length === 1) { const sol = distinct[0]; ps = ps.map((p: any, i: number) => ({ ...p, amount: p.amount == null && sol[i] === 0 ? null : sol[i], confidence: "reread", alt_amount: undefined, was: Number(p.amount || 0) !== sol[i] ? p.amount : undefined })); reconcile = { ok: true, sum: price, how };
          const di = ps.findIndex((p: any) => /deposit/i.test(p.stage) && p.amount != null); if (di >= 0) { const dv = String(ps[di].amount); if (digits(fields.deposit) !== digits(dv)) alternates.deposit = fields.deposit || ""; fields.deposit = dv; confidence.deposit = "high"; reread.deposit = { value: dv, agree: true }; delete checks.deposit; } }
        else { ps = ps.map((p: any) => ({ ...p, confidence: "low" })); reconcile = { ok: false, sum: sumOf(cur), options: distinct.slice(0, 3), how: distinct.length ? "more than one combination sums to the price" : "no reading of the stages sums to the price" }; (alternates as any)._payments_sum = String(sumOf(cur)); }
      }
    }
    for (const k in circled) { delete checks[k]; confidence[k] = "high"; }
    delete checks.windows; // window sizes are never flagged
    timing.total = Date.now() - t0;
    return json({ readable, page_type, reconcile, circled, source, fields, confidence, alternates, checks, reread, payment_schedule: ps, openings, timing });
  } catch (e) { return json({ error: String((e as Error)?.message || e) }, 500); }
});
// Sketch (drawing directions) -> walls named as viewed STANDING IN THE ALLEY facing the garage, computed here (deterministic) instead of asking the model to rotate.
// fromAlley: 0 = alley end .. 1 = house end (side walls); fromLeft: 0 = viewer's left .. 1 = right (alley/house walls).
// elevX: position from the LEFT edge of that wall's elevation as seen from OUTSIDE that wall (what the Carpenter sheet draws).
function sketchToWalls(sk: any) {
  const D: Record<string, [number, number]> = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] };
  const list = Array.isArray(sk?.openings) ? sk.openings.filter((o: any) => o && o.kind && D[o.side]).slice(0, 12) : [];
  const as = sk?.alley_side; if (!D[as]) return list.map((o: any) => ({ kind: o.kind, wall: "unknown", pos: null, elevX: null, note: o.note || null }));
  const F: [number, number] = [-D[as][0], -D[as][1]]; const L: [number, number] = [F[1], -F[0]];
  return list.map((o: any) => { const p = typeof o.pos === "number" && o.pos >= 0 && o.pos <= 1 ? o.pos : null; const d = D[o.side];
    const wall = d[0] === -F[0] && d[1] === -F[1] ? "alley" : d[0] === F[0] && d[1] === F[1] ? "house" : d[0] === L[0] && d[1] === L[1] ? "left" : "right";
    if (p == null) return { kind: o.kind, wall, pos: null, elevX: null, note: o.note || null };
    const pt: [number, number] = o.side === "top" ? [p, 0] : o.side === "bottom" ? [p, 1] : o.side === "left" ? [0, p] : [1, p];
    const fromAlley = F[0] === 1 ? pt[0] : F[0] === -1 ? 1 - pt[0] : F[1] === 1 ? pt[1] : 1 - pt[1];
    const fromLeft = L[1] === -1 ? pt[1] : L[1] === 1 ? 1 - pt[1] : L[0] === -1 ? pt[0] : 1 - pt[0];
    const pos = wall === "alley" || wall === "house" ? fromLeft : fromAlley;
    const elevX = wall === "alley" ? fromLeft : wall === "house" ? 1 - fromLeft : wall === "left" ? 1 - fromAlley : fromAlley;
    return { kind: o.kind, wall, pos: +pos.toFixed(2), elevX: +elevX.toFixed(2), note: o.note || null }; });
}
function json(b: unknown, status = 200) { return new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } }); }
