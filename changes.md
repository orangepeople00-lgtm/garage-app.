# Changes

## 2026-10-31 — Arlington Heights code years (adopted ordinance, future effective date)
- Source: Village of Arlington Heights Ord. 2026-49, adopted 9/22/2026 (CivicClerk fileId=9139; minutes fileId=9183).
- Status: adopted ordinance with a FUTURE effective date — Jan 1, 2027.
- Now shown as: 2024 IRC / 2023 NEC (effective Jan 1, 2027; 2018 IRC / 2017 NEC until then).
- Files: estimator.html, Carpenter.html (PC_CODE_* maps), GaragePlans.html (CODE_* maps):
  - CODE_YEARS: (none, defaulted 2018) → "2024"
  - CODE_NEC_YEARS: "2017" → "2023"
  - CODE_YEAR_INFO: "CONFIRM: … new code years unconfirmed — 2018 IRC / 2017 NEC kept on file…" → ordinance note with 1/1/2027 effective date
  - CODE_YEAR_UPCOMING: added "adopted upcoming edition — 2024 IRC / 2023 NEC (effective Jan 1, 2027; 2018 IRC / 2017 NEC until then)"
- Not applied (not approved): other Jan 1, 2027 Arlington Heights rule findings (32x78 walk-in door, gutters, 7/16" sheathing, etc.).

## 2026-10-31 — Lyons added to Garage Plans city dropdown
- GaragePlans.html `<select id="city">`: added `<option>Lyons</option>` (was missing from the dropdown).
- Lyons data already present in GaragePlans.html and identical to estimator.html (CITY_CODE_SHEETS, CODE_YEARS "2021", CODE_YEAR_STATUS "confirmed", checklist, electrical, sheathing) — no data copied/changed.
- Lyons NEC left blank. PENDING (not approved): 10/31 code check found Lyons adopted 2023 NEC (Ord. 11-18-25-02, 11/18/2025) with conduit-only wiring rules.

## 2026-11-10 — City code check backlog applied (10/29 – 11/10 reports, 63 cities)
- Approved by the owner on 11/10/2026 ("Do everything except 5 explain 5"): apply the whole backlog in one batch.
- Sources: daily city code check reports 2026-10-29 through 2026-11-10 (later report wins over an earlier one). Every code-sheet note added is labeled "CODE CHECK 11/10/2026 (source)".
- Files: estimator.html, GaragePlans.html, Carpenter.html (code sheets, notes, code-year maps, sheathing codes), estimator.html only: frost auto-tick rules; GaragePlans.html only: plan checklist items and electrical rules.
- Heights: every height is now labeled mean or peak where the source says so; where the source does not say, it stays "unspecified" with a confirm note.
- Supabase URL/keys, schema and the GC license # are untouched.

### Rules with a FUTURE effective date (marked with the date)
- **Arlington Heights — 1/1/2027** (Ord. 2026-49, adopted 9/22/2026): 2024 IRC / 2023 NEC; new local amendments listed on the sheet as "EFFECTIVE 1/1/2027" (32"x78" walk-in door, thickened-edge slab 200 SF+, 7/16" wall panels, gutters/downspouts for roof planes over 100 SF — turn Gutters ON for permits issued on/after 1/1/2027, ridge board 2" deeper, NEC 625 panelboard). Code years were already set 10/31.
- **Glenview — 1/1/2027** (Board approved 11/5/2026): 2024 ICC + 2024 Illinois Energy Code + 2023 NEC. Status changed intended → confirmed, NEC 2020 → 2023, upcoming flag "adopted upcoming edition". The 2020 NEC and the prior edition apply to permits issued before 1/1/2027.
- **Chicago — 12/1/2026** (DOB Code Memo 2026-001): the 2026 Chicago Construction Codes become mandatory for permit applications STARTED on/after 12/1/2026 ("started" = $600 deposit + zoning fee paid); and **3/1/2027** — applications using the 2026 Ordinance and started before 3/1/2027 must label the first drawing page, index sheets and code-compliance pages "2026 Chicago Mechanical & Energy Codes" in bold 24-pt type. Notes only; no garage-specific rule was found in the memo.

### Left as "confirm with the village/city" (value on file kept, note added; nothing guessed)
- **Lyons** 576 SF (village handout re-issued 11/2025) vs 676 SF (zoning §13-6A-3(E)) — 576 kept.
- **Evergreen Park** 816 SF (code §5-301) vs 850 SF (garage package) — 850 kept.
- **Crestwood** 12' "overall" vs "building height = mean" — basis left unspecified.
- **Lansing** two height definitions (mean vs highest point) — basis left unspecified.
- **Libertyville** 2024 codes not adopted yet (2018 IRC / 2017 NEC) — info flag only; **Braidwood** (2024 lead only); **Calumet City** (2020 NEC vs 2018 Chicago Electrical Code), **Glenwood** (2017 NEC from search index), **Berwyn / Elmwood Park** (auto-adopt clauses may make the 2026 NEC apply), **Elmhurst** NEC 2020 (Municode text via search index), **Gurnee** NEC 2002 (very old), **Cicero** (local amendments not reviewed).
- **Bloomingdale** rear setback 3' (handout) vs 5' (code); **Forest View** rear 4' (code) vs 5' (construction sheet, 5' used); **Evanston** 20' (application form) vs 28' (district regs) — 20' used; **Des Plaines** height basis ("mean" on file, guide does not say); **Elk Grove Village** topo "NO" vs checklist's topographic elevations; **Deer Park** 8"x18" footing vs monolithic slab; **Forest Park** 20"x10" grade beam cites the old 2009 amendment; **Franklin Park** 12" grade-beam width as a minimum; **Mundelein** footing vs 42" frost depth for 601-676 SF; **Northbrook** 10'-from-house rule (old Part I-A) vs new zoning table; **Addison** 5' vs 10' from house (10' used); **Flossmoor** fact sheet is titled "Storage Shed Permit".
- Not in the Garage Plans city dropdown (data stored for when they are added or typed in manually): Joliet, Libertyville, Villa Park, Waukegan, Westmont.

### Per-city changes (old → new)
- **Addison** — height: 17 → 17' (ONE STORY; RIDGE NOT ABOVE HOUSE RIDGE); heightBasis: unspecified → peak; setHouse: 5' → 10'; 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Alsip** — maxSize: 576 → 624; height: 13' → 16'; electrical rules added; 3 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Antioch** — height: 18' → 15' (EAVES + 1/2 EAVE-TO-RIDGE RISE, FROM TOP OF FOUNDATION); heightBasis: unspecified → mean; 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Arlington Heights** — maxSize: 700 MINIMUM 22 X 22 → 720 MINIMUM 22 X 22; height: 15' → 15' (NO PORTION IN REAR YARD OVER 15' ABOVE GRADE); heightBasis: unspecified → peak; 4 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Aurora** — NEC year: (blank) → 2023; year note: updated
- **Bannockburn** — height: 15' (CONFIRM MEAN VS. PEAK) → 15' (GRADE TO HIGHEST POINT); heightBasis: unspecified → peak
- **Bensenville** — height: 12' (CONFIRM MEAN VS. PEAK) → 12'; heightBasis: unspecified → mean
- **Berkeley** — maxSize: 24 x 26 → 700; height: 15' → 15' (TOP OF SLAB TO PEAK); SIDE WALLS MAX 9'; heightBasis: unspecified → peak; setHouse: 25' → 10'; bond: CONFIRM - $1,000 CASH BOND (2010 HANDOUT) → $1,000 CASH BOND (2022 HANDOUT); electrical rules updated; 3 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Bloomingdale** — maxSize: 3 CAR → 800; height: 21' → 15' (ONE STORY, OR HOUSE HEIGHT IF LESS); setSide: (blank) → 3'; setRearAlley: (blank) → 5' (ALLEY); setRearNoAlley: (blank) → 3' HANDOUT / 5' CODE TEXT - CONFIRM; setbackNotes: REAR (ALLEY): DEPENDS ON ZONING; REAR (NO ALLEY): DEPENDS ON ZONING; SIDE: DEPENDS ON ZONING… → REAR: HANDOUT 3' / CODE §11-5-12 5' (CONFIRM); SIDE: 3'; 10' FROM HOUSE AND NEIGHBOR'S STRUC…; 3 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Blue Island** — NEC year: 2005 → (blank); year note: added; electrical rules updated; 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Braidwood** — year note: added
- **Buffalo Grove** — height: 15' & NOT TALLER THAN HOUSE, ONE STORY (CONFIRM MEAN VS. PEAK) → 15' (GRADE TO HIGHEST POINT); ONE STORY; NOT TALLER THAN HOUSE; heightBasis: unspecified → peak; setRearAlley: 5' → 3'; 1 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Calumet City** — year note: added
- **Carpentersville** — maxSize: OPEN → R-1 1,000 SF / R-2 864 SF / R-2-A & ALL OTHER SINGLE-FAMILY 576 SF; electrical rules updated; 4 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Cary** — maxSize: OPEN → 600; height: 16' → 15'; setSide: 8' → 5'; setRearAlley: 8' → 5'; setRearNoAlley: 8' → 5'; setHouse: 10' → 10' (FROM OTHER STRUCTURES); 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Chicago** — 4 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Chicago Heights** — height: 14' → 15' (ONE STORY / ONE STORY LOWER THAN HOUSE); heightBasis: unspecified → mean; setSide: 3' → 5'; setRearAlley: 3' → 5'; setRearNoAlley: 3' → 5'; 1 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Chicago Ridge** — year note: added; 1 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Cicero** — IRC year: (blank) → 2024; year status: not_found → confirmed; NEC year: 2008 → 2023; year note: updated
- **Country Club Hills** — maxSize: OPEN → ALL OUTBUILDINGS ≤ 1,000 SF (MIN GARAGE 11' X 22'); height: 15' → 17' (ONE STORY OR 17', WHICHEVER LESS); setSide: 3' → 3' IN REAR HALF OF REAR YARD; ELSE 10% OF LOT WIDTH; setRearAlley: 5' → 10' OR 1' PAST EASEMENT; setRearNoAlley: 5' → 10' OR 1' PAST EASEMENT; IRC year: (blank) → 2018; NEC year: (blank) → 2017; year note: added; 1 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Crestwood** — 1 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Deer Park** — 3 code-check note item(s) added to the code sheet, estimator note and plan checklist; roof sheathing code: 1/2" CDX on 16" centers / 5/8" on 24" (was none)
- **Deerfield** — height: 20' → 20' OR HOUSE HEIGHT, WHICHEVER LESS (TO HIGHEST RIDGE); heightBasis: unspecified → peak; 1 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Des Plaines** — electrical rules updated; 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Downers Grove** — height: 20' → 23' TO HIGHEST POINT; heightBasis: unspecified → peak; setSide: 5' → 6' (5' IN R-4); setRearAlley: 5' → 6' (5' IN R-4); setRearNoAlley: 5' → 6' (5' IN R-4); maxSize: OPEN → ALL ACCESSORY ≤ 1,000 SF OR HOUSE GFA, WHICHEVER LESS; 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **East Dundee** — heightBasis: unspecified → mean; 1 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Elburn** — height: 15' → 15' (TOP OF STRUCTURE); heightBasis: unspecified → peak; setFront: 25' → 30'; setCorner: 25' → 30' MIN FROM FRONT/CORNER-SIDE LOT LINE; electrical rules added; 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Elk Grove Village** — setSide: (blank) → 6'; setbackNotes: SIDE: DEPENDS ON LOT → SIDE: 6' (MORE IF AN EASEMENT REQUIRES IT); 60' FROM FRONT/STREET LOT LINE; NOT IN REQUIRED …; 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Elmhurst** — heightBasis: unspecified → peak; NEC year: (blank) → 2020; year note: added; 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Elmwood Park** — year note: added; 1 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Elwood** — maxSize: (blank) → 750; height: (blank) → NOT TALLER THAN HOUSE; setHouse: (blank) → 10' (CLOSER = HOUSE SETBACKS APPLY); setRearAlley: (blank) → 10' FROM ALLEY RIGHT-OF-WAY; setRearNoAlley: (blank) → 5'; setSide: (blank) → 5'; setCorner: (blank) → NOT NEARER THE STREET THAN THE HOUSE; 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Evanston** — height: OPEN → 20' TO RIDGE OF SLOPED ROOF (14'-6" TO HIGHEST POINT OF FLAT/SHED ROOF); heightBasis: unspecified → peak; estimator frost auto-tick: over 600 SF; electrical rules added; 3 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Evergreen Park** — height: 15' OVERALL → 15' OR HOUSE HEIGHT IF LESS (12' ALWAYS ALLOWED); setFront: (blank) → 20' FROM STREET ROW UNLESS ACCESSED FROM ALLEY; 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Flossmoor** — footings: WIDTH: 12" DEPTH: 16" → WIDTH: 18" DEPTH: 10"; maxSize: OPEN → ALL ACCESSORY ≤ 5% OF LOT; height: 15' → 15' FROM TOP OF FOUNDATION; setSide: 5' → 15' (R-1 TO R-3); 7.5' (R-4); 5' (R-5 TO R-7); setRearAlley: 5' → 15' (R-1 TO R-3); 7.5' (R-4); 5' (R-5 TO R-7); setRearNoAlley: 5' → 15' (R-1 TO R-3); 7.5' (R-4); 5' (R-5 TO R-7); 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Ford Heights** — maxSize: OPEN → ALL ACCESSORY ≤ 25% OF REQUIRED REAR YARD; height: (blank) → 15' (ACCESSORY IN REQUIRED REAR YARD); heightBasis: (blank) → mean; 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Forest Park** — height: ONE STORY OR 16', WHICHEVER LOWER; NOT TALLER THAN HOUSE (CONFIRM MEAN VS. PEAK) → ONE STORY OR 16', WHICHEVER LOWER; NOT TALLER THAN HOUSE; heightBasis: unspecified → mean; NEC year: (blank) → 2023; year note: added; electrical rules added; 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Forest View** — height: 14' → 14.5' (14'-6"); setSide: (blank) → 4'; setRearAlley: (blank) → 5'; setRearNoAlley: (blank) → 5'; setFront: (blank) → 18' MIN (CONSTRUCTION SHEET); setbackNotes: REAR (ALLEY): EVEN WITH NEIGHBOR; REAR (NO ALLEY): EVEN WITH NEIGHBOR; SIDE: 10% OF LOT WIDTH → REAR: CODE 4' / CONSTRUCTION SHEET 5' (5' USED); SIDE: 4'; FRONT: 18' MIN; 4 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Fox Lake** — maxSize: OPEN → 834; height: 15' → 15' TO HIGHEST POINT; heightBasis: unspecified → peak; setSide: (blank) → 5'; setCorner: (blank) → REAR YARD ONLY; 10' FROM STREET LINE; setbackNotes: SIDE: 10% OF LOT WIDTH → CORNER/REVERSE-CORNER LOTS: REAR YARD ONLY, 5' SIDE/REAR, 10' FROM STREET LINE; 30' FROM SHO…; 1 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Frankfort** — 1 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Franklin Park** — electrical rules updated; 3 code-check note item(s) added to the code sheet, estimator note and plan checklist; wall sheathing code: min 1/2" plywood or OSB (was none)
- **Glencoe** — maxSize: 400 → ALL ACCESSORY BLDGS ≤ 6% OF LOT (R-A/R-B/R-C); setbackNotes: SIDE: DEPENDS ON ZONING; CORNER SIDE: DEPENDS ON ZONING; FRONT: DEPENDS ON ZONING → SIDE: DISTRICT SIDE YARD (R-A 12', R-B 10', R-C 8', R-D 5'), REDUCED TO 3' (LOT ≤40' WIDE) O…; 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Glenview** — year status: intended → confirmed; NEC year: 2020 → 2023; year note: added; upcoming flag: updated; 1 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Glenwood** — year note: added
- **Grayslake** — NEC year: (blank) → 2011; year note: updated
- **Gurnee** — height: 20' → 20' (NOT TALLER THAN HOUSE); heightBasis: unspecified → peak; setHouse: 12' → 5' (+1' PER FT OF PARALLEL WALL OVER 20'); setSide: 6' → 3' (+1' PER FT OF PARALLEL WALL OVER 22'); setRearAlley: 6' → 5' (+1' PER FT OF WALL OVER 22'); setRearNoAlley: 6' → 5' (+1' PER FT OF WALL OVER 22'); NEC year: (blank) → 2002; year note: added; estimator frost auto-tick: over 600 SF; 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Hoffman Estates** — estimator frost auto-tick: over 600 SF; electrical rules added; 4 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Joliet** — 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Lansing** — 1 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Libertyville** — NEC year: (blank) → 2017; year note: added
- **Lyons** — height: 15' → 15' TO TOP OF RIDGE; heightBasis: unspecified → peak; NEC year: (blank) → 2023; year note: added; electrical rules updated; 4 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Midlothian** — 3 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Mount Prospect** — 1 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Mundelein** — NEC year: (blank) → 2023; year note: added; electrical rules updated; 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Northbrook** — 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Oak Park** — 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Schaumburg** — 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Villa Park** — 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Waukegan** — 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Westmont** — 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Wheaton** — 1 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Wheeling** — 2 code-check note item(s) added to the code sheet, estimator note and plan checklist
- **Zion** — height: 18' → 18' TO HIGHEST POINT (ABOVE AVERAGE FINISHED GRADE OF LOT; NOT TALLER THAN HOUSE); heightBasis: unspecified → peak
- **Berwyn** — year note: added
