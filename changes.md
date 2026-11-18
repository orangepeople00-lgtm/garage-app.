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

## 2026-11-18 — City code check reports 11/11 – 11/15 applied (70 cities); 5 cities added to Garage Plans; auto-pick photos retagged
- Approved by the owner 11/18/2026 ("1 y 2 y … 5 y"). Sources: daily city code check reports 2026-11-11 through 2026-11-15 (a later report wins, e.g. Cary Romex). Every note added is labeled "CODE CHECK 11/18/2026 (source)". Only FINDING items were applied; the reports' "Unclear" items are on the sheets as "CONFIRM WITH VILLAGE/CITY" notes.
- Files: estimator.html, GaragePlans.html, Carpenter.html (code sheets, notes, code-year maps, sheathing codes); estimator.html only: frost auto-tick rules and auto-pick photo tags; GaragePlans.html only: plan checklist items, electrical rules and the city dropdown.
- Supabase URL/keys, schema and the GC license # are untouched.

### Code years
- **Grayslake — EFFECTIVE 11/23/2026** (Ord. 2026-0-24, adopted 10/20/2026): 2021 IRC/IBC + 2020 NEC. Added as an "upcoming edition" flag (plans still print the on-file 2018 IRC / 2011 NEC until then); new rules on the sheet are marked "EFFECTIVE 11/23/2026" (floor drains prohibited, permits expire after 1 year, no masonry/stone/wood footings, conduit-only wiring).
- **Elburn**: not_found → confirmed, 2021 IRC (§1420.01) / 2020 NEC (§1428.01).

### Heights / sizes / setbacks (old → new)
- Aurora: size "OPEN (OVER 768 SF NEEDS" → 768 (≤75% of house foundation, max 36' wall); height blank → 21' to PEAK or house height (sidewalls max 9'); house setback blank → 6'.
- Batavia: height blank → 25' MEAN; house setback → 10' (district setbacks listed as a confirm note).
- Belvidere: 15' → 20' MEAN (zoning §150.105 confirms the handout's 20').
- Calumet City: 14' → 13' in a required rear yard (mean).
- Burbank: "816 34W 24L" → 816 (max 34' wide x 25' deep); 15' → 15'/18' by lot width; rear (no alley) 10' → 3'.
- East Hazel Crest: "22X 24 528" → 625 SF (768 on R-1 lots over 7,200 SF); 14' → 14' or one story (15' on larger R-1 lots), PEAK.
- Franklin Park: height blank → 20' MEAN; rear 10' → 3'; house setback blank → 3'.
- Algonquin: house setback blank → 10'; basis MEAN.
- Height basis set (was "unspecified"/"confirm mean vs. peak"): MEAN — Algonquin, Bartlett (average roof height), Batavia, Bellwood (zoning measures from curb; datum confirm note kept), Belvidere, Bloomingdale, Calumet City, Carol Stream, Carpentersville, Cary, Franklin Park, Glendale Heights, Golf, Wheeling; PEAK — Aurora, Barrington, East Hazel Crest, Midlothian.

### Frost auto-tick (estimator)
- East Dundee: frost footing over 600 SF (slab-on-grade grade beam only allowed at 600 SF or less, §151.009).
- Clarendon Hills: frost footing over 660 SF (frost exemption only for one-story accessory buildings ≤660 SF).

### Sheathing
- Zion wall 1/2" min (R703.2.1); Niles roof 1/2" min with H-clips when rafters are over 16" OC; Barrington Hills wall and roof 1/2" min.

### Electrical rules / notes (Garage Plans electrical box + sheets)
- Conduit/no-Romex rules added for: Carol Stream, East Hazel Crest (EMT), Glen Ellyn, Riverside, Algonquin, Wheaton, Frankfort (main breaker in every subpanel), Glenview, Aurora, Joliet, Westmont, Lansing, Addison (GFCI per bay, switched lights at the service door, underground feed), Bartlett (two 20A GFCI circuits incl. EV), Bannockburn, Bensenville (MC-AC confirm), Belvidere, Deerfield, Zion, Arlington Heights, Barrington Hills, Bellwood, Brookfield (NM clause confirm), Clarendon Hills, Cicero, Buffalo Grove, Carpentersville, Alsip (30" burial), Grayslake (from 11/23/2026), Elgin, Niles (EV raceway), Mount Prospect, Palatine, Skokie, Downers Grove, Elk Grove Village, East Dundee, Northbrook, Hoffman Estates, Gurnee, Elmhurst, Park Ridge, South Holland, Forest View, Crestwood, Elwood, Crest Hill, Crystal Lake, Schaumburg (EV conduit), Waukegan, Villa Park, Westchester, Wheeling, Cary (Romex not permitted — corrects 11/12 "NM kept"), Oak Park (outside receptacle).

### Construction notes (sheets/checklists)
- Slab/footing specs added: Glen Ellyn (R403.5 monolithic, 6x6 W1.4 WWF, 20" edge 12" below grade, #4 top & bottom), Riverside (4" stone + 4" reinforced, 18" footing), Algonquin (WWF top third, CA-6, 16x8 footing, soil test, service door required), Wheaton (10" foundation, 1/2" gypsum <10' from house, snow 36), Elgin (16" OC over 490 SF, grade beam 16"/20"/10" 2 #4), Palatine (14"x20" edge at the OH door, 2 #5), Waukegan (16" OC studs, 4,000 psi floor), Elburn (WWF mid-depth, footing 2x wall/18"), East Dundee, Bellwood, Bloomingdale (3,500 psi), Berkeley (WWM mid-depth), Brookfield (6x6 10 ga mesh), Clarendon Hills (mesh), Big Rock (16x8), Zion, Barrington Hills, Joliet (cold-weather pour, 16" OC with vinyl), Bolingbrook (28°F rising), Aurora (8" footing, 1" deadbolt), Westchester (36" side-hinged door), Villa Park (5' roof discharge), Downers Grove (roof drainage ≥400 SF), Evanston (spot survey in 5 days), Libertyville (one garage per lot; detention over 400 SF net impervious), snow loads (Deerfield 36, Oak Park 36.4, Frankfort 34, Glen Ellyn/Riverside/Glenview/Evanston/Palatine/Skokie 30, East Dundee/Downers Grove 25).

### Left as "confirm with the village/city" (nothing guessed)
- Wheeling 528 SF/30% vs 800 SF; Waukegan R403.1.1 trench + R702.3.2 gypsum for small slab garages; Joliet 10"x20" footing; Skokie R403.1.1 vs handout; Downers Grove R703.2; Buffalo Grove 42" footing vs handout; Brookfield NM clause; Belvidere NM in U occupancy; Bensenville MC-AC; Batavia §9-5-2 conduit; Bartlett footprint vs floor area; Bellwood curb datum; Calumet City R806.1 vents; Barrington Hills winter flatwork; Westchester frost 42" vs 48" (48" kept); East Hazel Crest code edition; Arlington Heights rules now in force.
- Not applied (unverified): DeKalb County 21'/30' accessory height (PDF behind captcha), Alsip height basis.

### Garage Plans city dropdown
- Added Joliet, Libertyville, Villa Park, Waukegan and Westmont (their checklist items, code years and electrical rules were already on file; this batch added more).

### Estimator auto-pick photos (AI photos off)
- GARAGE_PHOTO_LIBRARY entries for every photo in the picker now carry the picker's tags (EXAMPLE_PHOTO_TAGS): roof (garage_003/004 are reverse gables and are no longer used for standard gables), service-door spot and side, overhead-door windows, side windows, door off-center, color where the picker names one. All picker photos are approved for auto-pick (was only garage_001–008). Reverse-gable (garage_001) and basic-hip (garage_002) preferred rules unchanged. Entries for missing files (garage_012–064, 108) untouched per owner.

## 2026-11-18 — Voice estimate: city list trimmed (estimate-voice-session v28)
- Owner approved "Yes, trim the voice city list". The estimator's voice knowledge pack no longer sends the ALL CITIES table (about 4-5k tokens); it sends Chicago + the estimate's current city only. For any other city (or after the city changes mid-call) the instructions now require a get_city_info lookup before answering. The page search (search_page_info) still searches every city.
- get_city_info results now start with the city's key fields (size, height, basis, setbacks) so typed and spoken answers lead with them.
- Function change is one sentence in the knowledge header; everything else in v27 is unchanged. Rollback copy of v27: /workspace/w3/rollback/prod_v27_index.ts (same as commit 4ad16b6).
- Tests (text mode, gpt-4.1-mini, 4 calls on the test function + 1 baseline on v27): "Sam" → sam; 22x24 demo → custom demo size (no 22x24 preset); two car on existing slab → demo 20x20; Berwyn setbacks answered from the current-city block; "max height in Aurora" while the estimate is in Berwyn → get_city_info("Aurora"). Prompt tokens on the same utterance: 15,926 (v27, full pack) → 10,807 (v28).

## 2026-11-18 — Voice estimate: demo cost only from a spoken amount (estimate-voice-session v29)
- Owner approved "Yes, fix the voice demo cost". The voice never sets demoCostInput unless he says a dollar amount for the demo; otherwise the page default ($1,300) stays.
- Knowledge pack no longer lists "demoCostInput $0" as a default (it now says the box defaults to $1,300 and is set only from a spoken demo amount). Function: one DEMO COST sentence added to the PRICES rule. Page guard: a voice demo cost is ignored unless it is $100+, the words mention demo/tear/remove/haul, and the number was actually said.
- Rollback of v28: /workspace/w3/rollback/prod_v28_index.ts.
- Tests (3 capped text-mode calls on the test function): tear-down with no price -> demo cost stays $1,300; "The demo is 1800" -> $1,800; "Sam is the salesman" -> sam. Offline guard: model 0 or 20 -> ignored; "demo is fifteen hundred" -> 1500; a non-demo sentence -> ignored.

## 2026-11-18 — GC license # TGC068760 filled in
- Owner confirmed (11/18/2026) the GC license # is TGC068760.
- GaragePlans.html: GP_PERMIT_CO.license = 'TGC068760'; gpPermitData().contractorLicense now uses it; plan title block contractor cell reads "GC LIC. TGC068760 · ROOFING LIC. 104.016731 · 105.006803"; cover sheet header adds "GC LIC. TGC068760"; permit dialog note updated (village registration numbers stay blank).
- index.html: permit-form data gets contractorLicense 'TGC068760'; the "GC license # left blank" note is removed.
- permit-forms/map.json: Grayslake building permit "Builder's License Number" filled; Villa Park demolition License Number (gc_lic) filled; Evergreen Park garage package p.4 and demolition p.2 Contractor List "General" license cell added and filled. Demolition notes for Burbank, Downers Grove, Geneva, Glenwood and Westchester now say the form has no GC license # box.
- Not filled on purpose: city/village/county registration or business license numbers (e.g. Aurora, Beecher, Bourbonnais, Bedford Park, Burbank), electrician/plumber/roofer license boxes, and office-use columns.
- repair.html already showed LICENSE NUMBER TGC068760; estimator.html sheet shows only the roofing licenses (no GC box, not changed). Carpenter.html, Crew.html and Drawing.html have no license fields.
