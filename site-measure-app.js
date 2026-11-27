/* Absolute Garage Builders — Site Measure sample app (no prices, no Supabase writes). */
(function () {
  "use strict";
  var M = window.AGBMeasure;
  if (!M) { document.body.innerHTML = "<p style='padding:20px'>site-measure-lib.js failed to load.</p>"; return; }

  var STORE = "agb-site-measure-v1";
  var PHONE = 900;
  var MODES_MOBILE = [
    { id: "visit", label: "Visit", ico: "⌂" },
    { id: "photo", label: "Photo", ico: "📷" },
    { id: "edge", label: "Edge", ico: "↔" },
    { id: "pads", label: "Pads", ico: "▭" },
    { id: "notes", label: "Notes", ico: "✦" }
  ];
  var MODES_DESK = [
    { id: "visit", label: "Visit" },
    { id: "photo", label: "Photo" },
    { id: "pads", label: "Pads & concrete" },
    { id: "edge", label: "Edge to edge" },
    { id: "ar", label: "AR" },
    { id: "layout", label: "Layout" },
    { id: "notes", label: "Notes & AI" }
  ];

  var state = loadState();
  var mode = "visit";
  var photo = {
    img: null,
    points: [],
    refMode: "two",
    refId: "oh16",
    customFt: 16,
    customIn: 0,
    doorH: 7,
    pendingLabel: "Width",
    finding: false
  };
  var edge = { sub: "one", stitchSide: "a", stitchLabel: "Edge to edge", laserFt: "", laserIn: "", laserVoice: "", laserLabel: "Laser / tape" };
  var stitch = {
    a: { recId: null, points: [], refId: "oh16", refMode: "four", customFt: 16, customIn: 0, doorH: 7 },
    b: { recId: null, points: [], refId: "oh16", refMode: "four", customFt: 16, customIn: 0, doorH: 7 }
  };
  var cam = { scale: 1, x: 0, y: 0 };
  var pointers = {};
  var pinch = { active: false, startDist: 0, startScale: 1, startX: 0, startY: 0 };
  var pendingPt = null;
  var ar = { supported: false, session: null, points: [], lastHit: null, feet: null };
  var toastTimer = 0;

  function defaultState() {
    return {
      jobName: "", village: "", fields: {}, notes: "", photos: [], pads: [], walks: [], stitches: [], tapes: [],
      proposedW: null, proposedD: null, lotW: null, lotD: null,
      setL: null, setR: null, setRear: null, setFront: null,
      limits: {}, layoutPlace: "center", voiceLog: []
    };
  }
  function loadState() {
    try {
      var raw = localStorage.getItem(STORE);
      if (!raw) return defaultState();
      return Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) { return defaultState(); }
  }
  function saveState() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
  }
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[c];
    });
  }
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.add("hidden"); }, 2800);
  }
  function isMobile() { return window.innerWidth < PHONE; }

  function visitFromState() {
    var f = Object.assign({}, state.fields);
    return {
      jobName: state.jobName, village: state.village,
      width: f.width, depth: f.depth, height: f.height,
      ohDoor: f.ohDoor, svcDoor: f.svcDoor,
      setL: f.setL != null ? f.setL : state.setL,
      setR: f.setR != null ? f.setR : state.setR,
      setRear: f.setRear != null ? f.setRear : state.setRear,
      setFront: f.setFront != null ? f.setFront : state.setFront,
      proposedW: state.proposedW, proposedD: state.proposedD,
      pads: state.pads, notes: state.notes,
      photos: state.photos, photoCount: (state.photos || []).length,
      fields: f, measurements: collectMeasurements()
    };
  }
  function collectMeasurements() {
    var out = [];
    (state.photos || []).forEach(function (p) {
      (p.measures || []).forEach(function (m) { out.push(m); });
    });
    (state.stitches || []).forEach(function (m) { out.push(m); });
    (state.tapes || []).forEach(function (m) { out.push(m); });
    return out;
  }
  function setMode(id) {
    if (id === "walk") id = "edge";
    if (id === "edge" && edge.sub === "one") photo.refMode = "four";
    mode = id;
    render();
  }

  function renderChrome() {
    $("jobName").value = state.jobName || "";
    $("village").value = state.village || "";
    $("dashLink").href = "index.html?v=" + Date.now();
    $("modeTabs").innerHTML = MODES_DESK.map(function (m) {
      return "<button type='button' class='mode" + (mode === m.id ? " on" : "") + "' data-mode='" + m.id + "'>" + esc(m.label) + "</button>";
    }).join("");
    $("bottomNav").innerHTML = MODES_MOBILE.map(function (m) {
      return "<button type='button' class='" + (mode === m.id ? "on" : "") + "' data-mode='" + m.id + "'><span class='ico'>" + m.ico + "</span><span>" + esc(m.label) + "</span></button>";
    }).join("");
  }

  function render() {
    renderChrome();
    var root = $("viewRoot");
    try {
      if (mode === "visit") root.innerHTML = viewVisit();
      else if (mode === "photo") root.innerHTML = viewPhoto();
      else if (mode === "edge") root.innerHTML = viewEdge();
      else if (mode === "pads") root.innerHTML = viewPads();
      else if (mode === "ar") root.innerHTML = viewAR();
      else if (mode === "layout") root.innerHTML = viewLayout();
      else root.innerHTML = viewNotes();
      bindView();
      if (mode === "photo" || (mode === "edge" && edge.sub !== "laser")) drawPhoto();
      if (mode === "layout") drawLayout();
      applyCam();
    } catch (err) {
      console.error("render failed", mode, err);
      root.innerHTML = "<div class='card'><h2>Couldn’t open this section</h2><p class='small'>" + esc(String(err && err.message ? err.message : err)) + "</p></div>";
      bindView();
    }
  }

  function viewVisit() {
    var v = visitFromState();
    var miss = M.missingMeasurements(v);
    var have = M.CHECKLIST.length - miss.length;
    var measN = collectMeasurements().length + state.pads.length;
    var tiles = [
      { mode: "photo", t: "Photo measure", d: "Take a picture, tap a known door or tape, then measure." },
      { mode: "edge", t: "Edge to edge", d: "Wide straight-on photo, 4 door corners, then the two wall corners. Or stitch two photos, or enter a laser/tape reading." },
      { mode: "pads", t: "Pads & concrete", d: "Existing or proposed pads, aprons, driveways — SF and yards." },
      { mode: "ar", t: "Live AR (Android)", d: "Tap points in the camera on Android Chrome. iPhone uses photo measure." },
      { mode: "layout", t: "Quick layout", d: "See which garage sizes fit the lot you measured." },
      { mode: "notes", t: "Voice & AI notes", d: "Talk in measurements, get a visit summary and missing-item check." }
    ];
    return (
      "<div class='card'><h2>On-site visit</h2>" +
      "<p class='small muted'>Measure an existing garage, the site, or a proposed pad. Nothing here sets a price. Confirm a number before it goes on an estimate.</p>" +
      "<div class='tiles'>" + tiles.map(function (t) {
        return "<button type='button' class='tile' data-go='" + t.mode + "'><b>" + esc(t.t) + "</b><span>" + esc(t.d) + "</span></button>";
      }).join("") + "</div></div>" +
      "<div class='card'><h3>Status</h3>" +
      "<p class='small'>" + measN + " saved measurement" + (measN === 1 ? "" : "s") + " · " + (state.photos || []).length + " photo" + ((state.photos || []).length === 1 ? "" : "s") + " · " + have + " of " + M.CHECKLIST.length + " usual items filled.</p>" +
      (miss.length ? "<div class='warn'><strong>Still need:</strong> " + esc(miss.map(function (m) { return m.label; }).join(", ")) + ".</div>" : "<div class='okbox'>Core on-site items are filled in.</div>") +
      (v.width && v.depth ? "<p><strong>Existing:</strong> " + M.formatFeetInches(v.width) + " × " + M.formatFeetInches(v.depth) + (v.ohDoor ? " · " + M.formatFeetInches(v.ohDoor) + " door" : "") + "</p>" : "") +
      (v.proposedW && v.proposedD ? "<p><strong>Proposed:</strong> " + M.formatFeetInches(v.proposedW) + " × " + M.formatFeetInches(v.proposedD) + " (" + M.round1(v.proposedW * v.proposedD) + " SF)</p>" : "") +
      "<div class='btns'><button type='button' class='btn light' data-go='notes'>Visit summary</button>" +
      "<button type='button' class='btn light' id='btnSamplePhoto'>Load sample photo</button></div></div>"
    );
  }

  function refKnownWidth() {
    if (photo.refId === "tape") return (Number(photo.customFt) || 0) + (Number(photo.customIn) || 0) / 12;
    var r = M.REFS.find(function (x) { return x.id === photo.refId; });
    return r && r.widthFt ? r.widthFt : 0;
  }
  function refKnownHeight() { return Number(photo.doorH) || 7; }
  function currentPhotoRecord() {
    if (!photo.img || !photo.img._recId) return null;
    return (state.photos || []).find(function (p) { return p.id === photo.img._recId; }) || null;
  }

  function viewPhoto() {
    var rec = currentPhotoRecord();
    var measures = rec && rec.measures ? rec.measures : [];
    var doorChips = M.REFS.filter(function (r) { return r.kind === "door" || r.id === "tape"; }).map(function (r) {
      return "<button type='button' class='chip" + (photo.refId === r.id ? " on" : "") + "' data-ref='" + r.id + "'>" + esc(r.short) + "</button>";
    }).join("");
    var smallChips = M.REFS.filter(function (r) { return r.kind === "small"; }).map(function (r) {
      return "<button type='button' class='chip" + (photo.refId === r.id ? " on" : "") + "' data-ref='" + r.id + "'>" + esc(r.short) + "</button>";
    }).join("");
    var hChips = M.DOOR_HEIGHTS.map(function (h) {
      return "<button type='button' class='chip" + (photo.doorH === h.ft ? " on" : "") + "' data-dh='" + h.ft + "'>" + esc(h.label) + "</button>";
    }).join("");
    var need = photo.refMode === "four" ? 4 : 2;
    var small = isSmallRef();
    var hint;
    if (!photo.img) hint = small ? "Get close and square-on. Keep the ruler, tape, or brick in the same picture as what you are measuring." : "Take or upload a photo of the garage or site.";
    else if (photo.points.length < need) {
      hint = photo.refMode === "four"
        ? "Tap all 4 corners of the door, starting at the top left, then top right, bottom right, bottom left."
        : "Zoom in if you need to, then tap the two ends of your " + (M.REFS.find(function (r) { return r.id === photo.refId; }) || { label: "reference" }).label + ".";
    } else hint = "Reference is set. Tap two points to measure anything on the same plane.";

    var custom = photo.refId === "tape" ? (
      "<div class='row row-2' style='margin:8px 0'><div class='field'><label class='lbl'>Tape feet</label><input id='tapeFt' type='number' inputmode='decimal' min='0' step='0.01' value='" + esc(photo.customFt) + "'></div>" +
      "<div class='field'><label class='lbl'>Inches</label><input id='tapeIn' type='number' inputmode='decimal' min='0' max='11.99' step='0.125' value='" + esc(photo.customIn) + "'></div></div>"
    ) : "";

    var list = measures.length ? measures.map(function (m, i) {
      return "<div class='meas-row'><div class='meta'><strong>" + esc(m.label) + "</strong><br>" + esc(m.method === "plane" ? "Same-wall plane" : "2-point scale") +
        (m.confidenceLabel ? " · " + esc(m.confidenceLabel) : "") +
        (m.rough ? " · rough" : "") + "</div><div><div class='val'>" + M.formatFeetInches(m.feet) + "</div>" +
        "<div class='btns'><button type='button' class='btn light sm' data-apply-meas='" + i + "'>Use in visit</button>" +
        "<button type='button' class='btn light sm' data-del-meas='" + i + "'>Delete</button></div></div></div>";
    }).join("") : "<p class='small muted'>No distances saved on this photo yet.</p>";

    var conf = lastConfidence();
    var acc = small ? M.ACCURACY.small : (photo.refMode === "four" ? M.ACCURACY.photoPlane : M.ACCURACY.photoScale);

    return (
      "<div class='card'><h2>Photo measure</h2>" +
      "<p class='small muted'>Best method on iPhone and every other phone. Use something you already know the size of — a door, a tape, a 12\" ruler, or a brick. For 6\" or 1½\', get close and keep the reference in the same picture.</p>" +
      "<div class='photo-tools'>" +
      "<label class='btn primary sm'>Take photo<input id='camInput' class='sr-only' type='file' accept='image/*' capture='environment'></label>" +
      "<label class='btn light sm'>Upload<input id='fileInput' class='sr-only' type='file' accept='image/*'></label>" +
      "<button type='button' class='btn light sm' id='btnSamplePhoto'>Sample photo</button>" +
      "</div>" +
      stageHtml(hint) +
      "<div class='photo-tools'>" +
      "<button type='button' class='btn light sm' id='btnFindDoor'>Find door edges</button>" +
      "<button type='button' class='btn light sm' id='btnResetPts'>Reset points</button>" +
      "<button type='button' class='btn light sm' id='btnNewPhotoMeas'>New measurement</button>" +
      "</div>" +
      "<p class='small muted'>Doors and known sizes</p><div class='chips'>" + doorChips + "</div>" +
      "<p class='small muted'>Short references, for 6\" or 1½\'</p><div class='chips'>" + smallChips + "</div>" + custom +
      (small ? "<div class='okbox'>Close-up tip: hold the phone square to the wall or slab, fill the frame with the reference and the short distance, then zoom in to tap the edges.</div>" : "") +
      "<div class='chips'>" +
      "<button type='button' class='chip" + (photo.refMode === "two" ? " on" : "") + "' data-refmode='two'>2-point reference</button>" +
      "<button type='button' class='chip" + (photo.refMode === "four" && !small ? " on" : "") + "' data-refmode='four'>4 corners of the door (better)</button>" +
      "</div>" +
      (photo.refMode === "four" && !small ? "<p class='small muted'>Door height used for the wall plane:</p><div class='chips'>" + hChips + "</div>" : "") +
      "<div class='warn'><strong>Accuracy:</strong> " + esc(acc) + "</div>" +
      confHtml(conf) +
      (photo.points.length >= need + 2 ? (
        "<div class='row row-2' style='margin-top:10px'><div class='field'><label class='lbl'>Label this distance</label>" +
        "<select id='measLabel'>" + M.MEASURE_LABELS.map(function (l) {
          return "<option" + (photo.pendingLabel === l ? " selected" : "") + ">" + esc(l) + "</option>";
        }).join("") + "</select></div>" +
        "<div class='field'><label class='lbl'>Then</label><button type='button' class='btn gold' id='btnSaveMeas'>Save last two points</button></div></div>"
      ) : "") +
      "</div>" +
      "<div class='card'><h3>Saved from this photo</h3><div class='meas-list'>" + list + "</div></div>"
    );
  }

  function confHtml(conf) {
    if (!conf) return "";
    return "<div class='conf " + esc(conf.level) + "'><strong>" + esc(conf.label) + "</strong> — " + esc(conf.detail) + "</div>";
  }
  function lastConfidence() {
    var m = lastOpenMeasure();
    var cal = calibration();
    if (!m || !cal || !cal.H) return null;
    return M.planeConfidence(cal.H, photo.points.slice(0, 4), m.p1, m.p2, cal.widthFt, cal.heightFt);
  }
  function isSmallRef(id) {
    var r = M.REFS.find(function (x) { return x.id === (id || photo.refId); });
    return !!(r && r.kind === "small");
  }
  function refChipsHtml(kind) {
    return M.REFS.filter(function (r) { return !kind || r.kind === kind || (kind === "door" && r.kind === "custom") || (kind === "door" && r.id === "tape"); }).map(function (r) {
      return "<button type='button' class='chip" + (photo.refId === r.id ? " on" : "") + "' data-ref='" + r.id + "'>" + esc(r.short) + "</button>";
    }).join("");
  }
  function stageHtml(hint) {
    return "<div class='zoom-bar'>" +
      "<button type='button' class='btn light sm' id='btnZoomOut' aria-label='Zoom out'>−</button>" +
      "<button type='button' class='btn light sm' id='btnZoomIn' aria-label='Zoom in'>+</button>" +
      "<button type='button' class='btn light sm' id='btnZoomReset'>Reset zoom</button>" +
      "<span class='small muted'>Pinch to zoom. Hold a point, then lift to place it.</span></div>" +
      "<div class='stage' id='photoStage'><div class='stage-inner' id='stageInner'><canvas id='photoCanvas'></canvas></div>" +
      "<div class='hint' id='photoHint'>" + esc(hint) + "</div>" +
      "<div class='loupe' id='loupe'><canvas id='loupeCanvas'></canvas></div></div>";
  }

  function viewEdge() {
    var tabs = [
      { id: "one", label: "One photo" },
      { id: "stitch", label: "Two-photo stitch" },
      { id: "laser", label: "Laser / tape" }
    ];
    var tabHtml = "<div class='chips'>" + tabs.map(function (t) {
      return "<button type='button' class='chip" + (edge.sub === t.id ? " on" : "") + "' data-edge-sub='" + t.id + "'>" + esc(t.label) + "</button>";
    }).join("") + "</div>";
    var body = edge.sub === "laser" ? viewLaser() : (edge.sub === "stitch" ? viewStitch() : viewEdgeOne());
    return "<div class='card'><h2>Edge to edge</h2>" +
      "<p class='small muted'>For a long wall or the full width of a garage. Take a wide, straight-on photo, mark the 4 corners of a known door, then tap the two wall corners. If the run won’t fit in one straight-on shot, stitch two photos at a shared landmark. If you already have the number from a laser or tape, enter it here.</p>" +
      tabHtml + body + "</div>" + savedEdgeList();
  }

  function edgeStepIndex() {
    if (!photo.img) return 0;
    if (photo.points.length < 4) return 1;
    if (photo.points.length < 6) return 2;
    return 3;
  }
  function stepsHtml(idx, labels) {
    return "<div class='steps'>" + labels.map(function (lab, i) {
      var cls = i === idx ? " on" : (i < idx ? " done" : "");
      return "<span class='step-pill" + cls + "'>" + (i + 1) + ". " + esc(lab) + "</span>";
    }).join("") + "</div>";
  }

  function viewEdgeOne() {
    photo.refMode = "four";
    var hChips = M.DOOR_HEIGHTS.map(function (h) {
      return "<button type='button' class='chip" + (photo.doorH === h.ft ? " on" : "") + "' data-dh='" + h.ft + "'>" + esc(h.label) + "</button>";
    }).join("");
    var hint;
    if (!photo.img) hint = "Stand back and take a wide, straight-on photo of the whole wall, with a known door in the frame.";
    else if (photo.points.length < 4) hint = "Tap all 4 corners of the door: top left, top right, bottom right, bottom left.";
    else if (photo.points.length === 4) hint = "Door plane is set. Tap one wall corner (the first edge).";
    else if (photo.points.length === 5) hint = "Tap the other wall corner (the far edge).";
    else hint = "Edge-to-edge is ready. Check the confidence, then save.";
    var m = lastOpenMeasure();
    var conf = lastConfidence();
    var custom = photo.refId === "tape" ? (
      "<div class='row row-2' style='margin:8px 0'><div class='field'><label class='lbl'>Door width, feet</label><input id='tapeFt' type='number' inputmode='decimal' min='0' step='0.01' value='" + esc(photo.customFt) + "'></div>" +
      "<div class='field'><label class='lbl'>Inches</label><input id='tapeIn' type='number' inputmode='decimal' min='0' max='11.99' step='0.125' value='" + esc(photo.customIn) + "'></div></div>"
    ) : "";
    return stepsHtml(edgeStepIndex(), ["Wide straight-on photo", "4 door corners", "Two wall corners", "Save"]) +
      "<div class='photo-tools'>" +
      "<label class='btn primary sm'>Take photo<input id='camInput' class='sr-only' type='file' accept='image/*' capture='environment'></label>" +
      "<label class='btn light sm'>Upload<input id='fileInput' class='sr-only' type='file' accept='image/*'></label>" +
      "<button type='button' class='btn light sm' id='btnSamplePhoto'>Sample photo</button></div>" +
      stageHtml(hint) +
      "<div class='photo-tools'>" +
      "<button type='button' class='btn light sm' id='btnFindDoor'>Find door edges</button>" +
      "<button type='button' class='btn light sm' id='btnResetPts'>Reset points</button>" +
      "<button type='button' class='btn light sm' id='btnNewPhotoMeas'>Retake corners</button></div>" +
      "<p class='small muted'>Known door on this wall:</p><div class='chips'>" + refChipsHtml("door") + "</div>" + custom +
      "<p class='small muted'>Door height:</p><div class='chips'>" + hChips + "</div>" +
      "<div class='warn'><strong>Accuracy:</strong> " + esc(M.ACCURACY.edge) + "</div>" +
      (m ? (confHtml(conf) + "<div class='live-num'>" + M.formatFeetInches(m.feet) + "</div>" +
        "<div class='row row-2' style='margin-top:10px'><div class='field'><label class='lbl'>Label</label>" +
        "<select id='measLabel'>" + M.MEASURE_LABELS.map(function (l) {
          return "<option" + ((photo.pendingLabel || "Edge to edge") === l ? " selected" : "") + ">" + esc(l) + "</option>";
        }).join("") + "</select></div>" +
        "<div class='field'><label class='lbl'>Then</label><button type='button' class='btn gold' id='btnSaveMeas'>Save edge to edge</button></div></div>") : "");
  }

  function viewStitch() {
    var side = edge.stitchSide;
    rememberStitchSide(false);
    var aFt = stitchSegmentFeet(stitch.a);
    var bFt = stitchSegmentFeet(stitch.b);
    var total = (aFt != null && bFt != null) ? M.stitchSegments([{ feet: aFt }, { feet: bFt }]) : null;
    var hint;
    if (!photo.img) hint = "Photo " + side.toUpperCase() + ": take a straight-on shot of this half of the wall, with a known door and the shared landmark in the frame.";
    else if ((photo.refMode === "four" ? photo.points.length < 4 : photo.points.length < 2)) hint = "Set the reference on photo " + side.toUpperCase() + " first.";
    else if ((photo.refMode === "four" ? photo.points.length === 4 : photo.points.length === 2)) hint = side === "a" ? "Tap the start corner, then the shared landmark (door edge or downspout)." : "Tap the shared landmark, then the end corner.";
    else if ((photo.refMode === "four" ? photo.points.length === 5 : photo.points.length === 3)) hint = side === "a" ? "Tap the shared landmark." : "Tap the end corner.";
    else hint = "Segment " + side.toUpperCase() + " is ready. Switch photos or save the total.";
    var custom = photo.refId === "tape" ? (
      "<div class='row row-2' style='margin:8px 0'><div class='field'><label class='lbl'>Reference feet</label><input id='tapeFt' type='number' inputmode='decimal' min='0' step='0.01' value='" + esc(photo.customFt) + "'></div>" +
      "<div class='field'><label class='lbl'>Inches</label><input id='tapeIn' type='number' inputmode='decimal' min='0' max='11.99' step='0.125' value='" + esc(photo.customIn) + "'></div></div>"
    ) : "";
    var hChips = M.DOOR_HEIGHTS.map(function (h) {
      return "<button type='button' class='chip" + (photo.doorH === h.ft ? " on" : "") + "' data-dh='" + h.ft + "'>" + esc(h.label) + "</button>";
    }).join("");
    return "<p class='small'>Take photo A and photo B of the same wall. Each photo needs its own door or tape reference, plus a shared landmark you can tap in both — a door edge or a downspout. The app adds the two segments.</p>" +
      "<div class='chips'>" +
      "<button type='button' class='chip" + (side === "a" ? " on" : "") + "' data-stitch-side='a'>Photo A" + (aFt != null ? " · " + M.formatFeetInches(aFt) : "") + "</button>" +
      "<button type='button' class='chip" + (side === "b" ? " on" : "") + "' data-stitch-side='b'>Photo B" + (bFt != null ? " · " + M.formatFeetInches(bFt) : "") + "</button></div>" +
      "<div class='photo-tools'>" +
      "<label class='btn primary sm'>Take photo " + side.toUpperCase() + "<input id='camInput' class='sr-only' type='file' accept='image/*' capture='environment'></label>" +
      "<label class='btn light sm'>Upload<input id='fileInput' class='sr-only' type='file' accept='image/*'></label></div>" +
      stageHtml(hint) +
      "<div class='photo-tools'>" +
      "<button type='button' class='btn light sm' id='btnFindDoor'>Find door edges</button>" +
      "<button type='button' class='btn light sm' id='btnResetPts'>Reset points</button></div>" +
      "<div class='chips'>" + refChipsHtml("door") + "</div>" + custom +
      "<div class='chips'>" +
      "<button type='button' class='chip" + (photo.refMode === "two" ? " on" : "") + "' data-refmode='two'>2-point reference</button>" +
      "<button type='button' class='chip" + (photo.refMode === "four" ? " on" : "") + "' data-refmode='four'>4 corners of the door (better)</button></div>" +
      (photo.refMode === "four" ? "<p class='small muted'>Door height:</p><div class='chips'>" + hChips + "</div>" : "") +
      "<div class='warn'><strong>Accuracy:</strong> " + esc(M.ACCURACY.stitch) + "</div>" +
      (total ? "<div class='okbox'><strong>Total edge to edge:</strong> " + M.formatFeetInches(total.feet) + " <span class='small muted'>(" + M.formatFeetInches(aFt) + " + " + M.formatFeetInches(bFt) + ")</span></div>" +
        "<div class='row row-2' style='margin-top:10px'><div class='field'><label class='lbl'>Label</label><select id='stitchLabel'>" +
        M.MEASURE_LABELS.map(function (l) {
          return "<option" + ((edge.stitchLabel || "Edge to edge") === l ? " selected" : "") + ">" + esc(l) + "</option>";
        }).join("") + "</select></div>" +
        "<div class='field'><label class='lbl'>Then</label><button type='button' class='btn gold' id='btnSaveStitch'>Save stitched length</button></div></div>" : "");
  }

  function viewLaser() {
    return "<p class='small'>Type the exact reading from a laser or tape, or say it — “twenty two feet four inches,” “6 inches,” or “a foot and a half.” This is an exact entry, not a photo estimate.</p>" +
      "<div class='row row-2'><div class='field'><label class='lbl'>Feet</label><input id='laserFt' type='number' inputmode='decimal' min='0' step='0.01' value='" + esc(edge.laserFt) + "'></div>" +
      "<div class='field'><label class='lbl'>Inches</label><input id='laserIn' type='number' inputmode='decimal' min='0' step='0.125' value='" + esc(edge.laserIn) + "'></div></div>" +
      "<div class='field'><label class='lbl'>Or say / type the length</label><input id='laserVoice' type='text' placeholder='22 feet 4 inches' value='" + esc(edge.laserVoice) + "'></div>" +
      "<div class='btns'><button type='button' class='btn primary' id='btnLaserTalk'>Talk the number</button>" +
      "<button type='button' class='btn light' id='btnLaserTalkStop'>Stop</button></div>" +
      "<p class='small' id='laserTalkStatus'></p>" +
      "<div class='field'><label class='lbl'>Label</label><select id='laserLabel'>" +
      M.MEASURE_LABELS.map(function (l) {
        return "<option" + ((edge.laserLabel || "Laser / tape") === l ? " selected" : "") + ">" + esc(l) + "</option>";
      }).join("") + "</select></div>" +
      "<div id='laserPreview'></div>" +
      "<div class='warn'><strong>Accuracy:</strong> " + esc(M.ACCURACY.laser) + "</div>" +
      "<div class='btns'><button type='button' class='btn gold' id='btnSaveLaser'>Save exact length</button></div>";
  }

  function savedEdgeList() {
    var rows = [];
    (state.stitches || []).forEach(function (s, i) {
      rows.push("<div class='meas-row'><div class='meta'><strong>" + esc(s.label) + "</strong><br>Two-photo stitch · " + M.formatFeetInches(s.aFeet) + " + " + M.formatFeetInches(s.bFeet) + "</div><div><div class='val'>" + M.formatFeetInches(s.feet) + "</div>" +
        "<div class='btns'><button type='button' class='btn light sm' data-apply-stitch='" + i + "'>Use in visit</button>" +
        "<button type='button' class='btn light sm' data-del-stitch='" + i + "'>Delete</button></div></div></div>");
    });
    (state.tapes || []).forEach(function (s, i) {
      rows.push("<div class='meas-row'><div class='meta'><strong>" + esc(s.label) + "</strong><br>Laser / tape entry</div><div><div class='val'>" + M.formatFeetInches(s.feet) + "</div>" +
        "<div class='btns'><button type='button' class='btn light sm' data-apply-tape='" + i + "'>Use in visit</button>" +
        "<button type='button' class='btn light sm' data-del-tape='" + i + "'>Delete</button></div></div></div>");
    });
    (state.photos || []).forEach(function (p) {
      (p.measures || []).forEach(function (m, i) {
        if (m.label === "Edge to edge" || m.kind === "edge") {
          rows.push("<div class='meas-row'><div class='meta'><strong>" + esc(m.label) + "</strong><br>One-photo plane" + (m.confidenceLabel ? " · " + esc(m.confidenceLabel) : "") + "</div><div><div class='val'>" + M.formatFeetInches(m.feet) + "</div></div></div>");
        }
      });
    });
    return "<div class='card'><h3>Saved edge-to-edge and tape readings</h3><div class='meas-list'>" +
      (rows.length ? rows.join("") : "<p class='small muted'>None yet.</p>") + "</div></div>";
  }

  function sideKnownWidth(s) {
    if (s.refId === "tape") return (Number(s.customFt) || 0) + (Number(s.customIn) || 0) / 12;
    var r = M.REFS.find(function (x) { return x.id === s.refId; });
    return r && r.widthFt ? r.widthFt : 0;
  }
  function stitchSegmentFeet(s) {
    if (!s) return null;
    var w = sideKnownWidth(s);
    if (w <= 0) return null;
    if (s.refMode === "four") {
      if (!s.points || s.points.length < 6) return null;
      var plane = M.planeFromDoor(s.points.slice(0, 4), w, Number(s.doorH) || 7);
      if (!plane) return null;
      return M.measureOnPlane(plane.H, s.points[4], s.points[5]);
    }
    if (!s.points || s.points.length < 4) return null;
    var scale = M.scaleFromReference(s.points[0], s.points[1], w);
    if (!scale) return null;
    return M.measureScaled(s.points[2], s.points[3], scale);
  }
  function rememberStitchSide(writePhoto) {
    if (writePhoto === false && !photo.img && !(stitch[edge.stitchSide] && stitch[edge.stitchSide].recId)) {
      /* nothing to remember yet */
    }
    var s = stitch[edge.stitchSide];
    if (!s) return;
    s.points = photo.points.slice();
    s.refId = photo.refId;
    s.refMode = photo.refMode;
    s.customFt = photo.customFt;
    s.customIn = photo.customIn;
    s.doorH = photo.doorH;
    if (photo.img && photo.img._recId) s.recId = photo.img._recId;
  }
  function activateStitchSide(side) {
    rememberStitchSide();
    edge.stitchSide = side;
    var s = stitch[side];
    photo.refId = s.refId || "oh16";
    photo.refMode = s.refMode || "four";
    photo.customFt = s.customFt;
    photo.customIn = s.customIn;
    photo.doorH = s.doorH || 7;
    photo.points = (s.points || []).slice();
    cam.scale = 1; cam.x = 0; cam.y = 0;
    if (s.recId) loadPhotoRecord(s.recId, false);
    else { photo.img = null; render(); }
  }
  function loadPhotoRecord(id, resetPts) {
    var rec = (state.photos || []).find(function (p) { return p.id === id; });
    if (!rec) { photo.img = null; render(); return; }
    var image = new Image();
    image.onload = function () {
      image._recId = id;
      photo.img = image;
      if (resetPts) photo.points = [];
      render();
    };
    image.src = rec.dataUrl;
  }


  function viewPads() {
    var tot = M.totalYards(state.pads);
    var rows = state.pads.length ? state.pads.map(function (p, i) {
      var cy = p.thicknessIn ? M.cubicYards(p.areaSqFt, p.thicknessIn, p.wastePct) : null;
      var typeName = (M.PAD_TYPES.find(function (t) { return t.id === p.type; }) || {}).label || p.type;
      var title = (p.label && p.label !== typeName) ? (p.label + " · " + typeName) : (p.label || typeName);
      return "<div class='meas-row'><div class='meta'><strong>" + esc(title) + "</strong>" +
        "<br>" + M.formatFeetInches(p.lengthFt) + " × " + M.formatFeetInches(p.widthFt) + " = " + M.round1(p.areaSqFt) + " SF" +
        (p.thicknessIn ? ", " + p.thicknessIn + "\" thick" : "") +
        (p.wastePct ? ", " + p.wastePct + "% extra" : "") + "</div>" +
        "<div><div class='val'>" + (cy != null ? M.round2(cy) + " CY" : "—") + "</div>" +
        "<button type='button' class='btn light sm' data-del-pad='" + i + "'>Delete</button></div></div>";
    }).join("") : "<p class='small muted'>No pads or areas yet.</p>";
    var types = M.PAD_TYPES.map(function (t) { return "<option value='" + t.id + "'>" + esc(t.label) + "</option>"; }).join("");
    return (
      "<div class='card'><h2>Existing &amp; proposed concrete</h2>" +
      "<p class='small muted'>Dimensions, square footage, and cubic yards. This does not price concrete. Enter thickness before yards are shown.</p>" +
      "<div class='row row-2'><div class='field'><label class='lbl'>Type</label><select id='padType'>" + types + "</select></div>" +
      "<div class='field'><label class='lbl'>Label</label><input id='padLabel' placeholder='Proposed pad'></div></div>" +
      "<div class='row row-2'><div class='field'><label class='lbl'>Length (ft)</label><input id='padL' type='number' inputmode='decimal' min='0' step='0.01'></div>" +
      "<div class='field'><label class='lbl'>Width (ft)</label><input id='padW' type='number' inputmode='decimal' min='0' step='0.01'></div></div>" +
      "<div class='row row-2'><div class='field'><label class='lbl'>Thickness (inches)</label><input id='padThk' type='number' inputmode='decimal' min='0' step='0.25' placeholder='e.g. 4'></div>" +
      "<div class='field'><label class='lbl'>Extra / waste % (optional)</label><input id='padWaste' type='number' inputmode='decimal' min='0' step='1' placeholder='0'></div></div>" +
      "<div class='btns'><button type='button' class='btn gold' id='btnAddPad'>Add area</button>" +
      "<button type='button' class='btn light' id='btnPadFromMeas'>Use last two photo measures</button></div>" +
      "<p class='small muted' id='padPreview'></p></div>" +
      "<div class='card'><h3>Areas on this visit</h3><div class='meas-list'>" + rows + "</div>" +
      (tot.count ? "<p><strong>Total area</strong> " + M.round1(tot.areaSqFt) + " SF" + (tot.yards ? " · <strong>Total concrete</strong> " + M.round2(tot.yards) + " CY" : "") + "</p>" : "") +
      "<p class='small muted'>Yards are L × W × thickness ÷ 27, plus any extra % you entered. Confirm before an estimate.</p></div>"
    );
  }

  function viewAR() {
    var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var body;
    if (ar.supported) {
      body = "<p>This phone can do live AR measuring in the camera (WebXR hit-test). Tap a start point, then an end point, to get a true 3-D distance.</p>" +
        "<div class='warn'>" + esc(M.ACCURACY.arWebXR) + "</div>" +
        "<div class='btns'><button type='button' class='btn gold' id='btnStartAR'>Start AR measure</button></div>";
    } else if (ios) {
      body = "<div class='warn'><strong>iPhone Safari can't do live AR measuring.</strong> " + esc(M.ACCURACY.arIos) + "</div>" +
        "<p>Use <strong>Photo measure</strong> or <strong>Edge to edge</strong> on this phone — those are the accurate web methods.</p>" +
        "<div class='btns'><button type='button' class='btn primary' data-go='photo'>Go to photo measure</button></div>";
    } else {
      body = "<p>Live AR measuring runs in <strong>Android Chrome</strong> when the phone supports WebXR. This device or browser does not.</p>" +
        "<div class='warn'>" + esc(M.ACCURACY.arWebXR) + "</div>" +
        "<div class='btns'><button type='button' class='btn primary' data-go='photo'>Use photo measure</button></div>";
    }
    return "<div class='card'><h2>Live AR measure</h2>" + body + "</div>";
  }

  function viewLayout() {
    var availW, availD;
    if (state.lotW && state.lotD) {
      availW = state.lotW - (Number(state.setL) || 0) - (Number(state.setR) || 0);
      availD = state.lotD - (Number(state.setFront) || 0) - (Number(state.setRear) || 0);
    }
    var fits = (availW > 0 && availD > 0) ? M.sizesThatFit(availW, availD) : [];
    var chips = fits.map(function (s) {
      var on = state.proposedW === s.width && state.proposedD === s.depth;
      return "<button type='button' class='chip" + (on ? " on" : "") + "' data-size='" + s.width + "x" + s.depth + "'>" + s.width + "×" + s.depth + " · " + s.sf + " SF</button>";
    }).join("");
    return (
      "<div class='card'><h2>Quick layout</h2>" +
      "<p class='small muted'>See which standard garage sizes fit the space you measured. This is a fit check, not a price and not a permit drawing.</p>" +
      "<div class='row row-2'><div class='field'><label class='lbl'>Lot / available width (ft)</label><input id='lotW' type='number' inputmode='decimal' value='" + (state.lotW || "") + "'></div>" +
      "<div class='field'><label class='lbl'>Lot / available depth (ft)</label><input id='lotD' type='number' inputmode='decimal' value='" + (state.lotD || "") + "'></div></div>" +
      "<div class='row row-2'><div class='field'><label class='lbl'>Left setback</label><input id='laySL' type='number' inputmode='decimal' value='" + (state.setL || "") + "'></div>" +
      "<div class='field'><label class='lbl'>Right setback</label><input id='laySR' type='number' inputmode='decimal' value='" + (state.setR || "") + "'></div></div>" +
      "<div class='row row-2'><div class='field'><label class='lbl'>From house / front</label><input id='laySF' type='number' inputmode='decimal' value='" + (state.setFront || "") + "'></div>" +
      "<div class='field'><label class='lbl'>Rear setback</label><input id='laySRe' type='number' inputmode='decimal' value='" + (state.setRear || "") + "'></div></div>" +
      "<div class='row row-2'><div class='field'><label class='lbl'>Proposed width</label><input id='propW' type='number' inputmode='decimal' value='" + (state.proposedW || "") + "'></div>" +
      "<div class='field'><label class='lbl'>Proposed depth</label><input id='propD' type='number' inputmode='decimal' value='" + (state.proposedD || "") + "'></div></div>" +
      "<div class='chips'><button type='button' class='chip" + (state.layoutPlace === "left" ? " on" : "") + "' data-place='left'>Left</button>" +
      "<button type='button' class='chip" + (state.layoutPlace === "center" ? " on" : "") + "' data-place='center'>Center</button>" +
      "<button type='button' class='chip" + (state.layoutPlace === "right" ? " on" : "") + "' data-place='right'>Right</button></div>" +
      "<p class='small muted'>Sizes that fit this envelope:</p><div class='chips' id='fitChips'>" + (chips || "<span class='small muted'>Enter lot size and setbacks to see options.</span>") + "</div>" +
      "<div class='layout-stage'><svg id='layoutSvg' viewBox='0 0 100 80' aria-label='Lot layout'></svg></div>" +
      "<div class='btns'><button type='button' class='btn gold' id='btnSaveLayout'>Save proposed size to this visit</button></div></div>"
    );
  }

  function viewNotes() {
    var v = visitFromState();
    var summary = M.buildVisitSummary(v);
    var est = M.buildEstimateNotes(v);
    var perm = M.buildPermitNotes(v);
    var miss = M.missingMeasurements(v);
    var cmp = M.compareToLimits({
      width: state.proposedW || v.width, depth: state.proposedD || v.depth, height: v.height,
      setLeft: v.setL, setRight: v.setR, setRear: v.setRear, setFront: v.setFront
    }, {
      maxSf: numOrNull(state.limits.maxSf), maxHeight: numOrNull(state.limits.maxHeight),
      minLeft: numOrNull(state.limits.minLeft), minRight: numOrNull(state.limits.minRight),
      minRear: numOrNull(state.limits.minRear), minFront: numOrNull(state.limits.minFront)
    });
    var cmpHtml = cmp.length ? cmp.map(function (c) {
      return "<div class='" + (c.ok ? "okbox" : "rough") + "'>" + (c.ok ? "OK — " : "Check — ") + esc(c.detail) + "</div>";
    }).join("") : "<p class='small muted'>Enter village limits from your code sheet to compare. This sample does not invent city rules.</p>";
    var checks = M.CHECKLIST.map(function (c) {
      var done = !miss.some(function (m) { return m.id === c.id; });
      return "<div class='item" + (done ? " done" : "") + "'><div class='dot'></div><div>" + esc(c.label) + "</div></div>";
    }).join("");
    return (
      "<div class='card'><h2>Voice &amp; AI assist</h2>" +
      "<p class='small muted'>Talk the way you would on site — “22 by 24, 16 foot door, left setback 5, 4 inch slab.” Review the fields, then confirm. No paid AI calls in this sample; the assist runs on your phone.</p>" +
      "<div class='btns'><button type='button' class='btn primary' id='btnTalk'>Talk</button>" +
      "<button type='button' class='btn light' id='btnTalkStop'>Stop</button></div>" +
      "<p class='small' id='talkStatus'></p>" +
      "<div class='field'><label class='lbl'>Transcript</label><textarea id='talkText' placeholder='Or type a note here'></textarea></div>" +
      "<div class='btns'><button type='button' class='btn gold' id='btnParseTalk'>Preview fields</button></div>" +
      "<div id='parseOut'></div></div>" +
      "<div class='card'><h3>Walkaround summary</h3><p id='sumText'>" + esc(summary) + "</p>" +
      "<div class='btns'><button type='button' class='btn light sm' data-copy='sumText'>Copy summary</button></div></div>" +
      "<div class='card'><h3>Missing measurements</h3><div class='check-list'>" + checks + "</div></div>" +
      "<div class='card'><h3>Compare to village limits you enter</h3>" +
      "<div class='row row-2'><div class='field'><label class='lbl'>Max SF</label><input id='limSf' type='number' value='" + (state.limits.maxSf || "") + "'></div>" +
      "<div class='field'><label class='lbl'>Max height (ft)</label><input id='limH' type='number' inputmode='decimal' value='" + (state.limits.maxHeight || "") + "'></div></div>" +
      "<div class='row row-2'><div class='field'><label class='lbl'>Min left / right</label><div class='row row-2' style='grid-template-columns:1fr 1fr'><input id='limL' type='number' inputmode='decimal' placeholder='L' value='" + (state.limits.minLeft || "") + "'><input id='limR' type='number' inputmode='decimal' placeholder='R' value='" + (state.limits.minRight || "") + "'></div></div>" +
      "<div class='field'><label class='lbl'>Min front / rear</label><div class='row row-2'><input id='limF' type='number' inputmode='decimal' placeholder='Front' value='" + (state.limits.minFront || "") + "'><input id='limRe' type='number' inputmode='decimal' placeholder='Rear' value='" + (state.limits.minRear || "") + "'></div></div>" +
      "<div class='btns'><button type='button' class='btn light' id='btnLimApply'>Compare</button></div>" + cmpHtml + "</div>" +
      "<div class='card'><h3>Job notes (copy into estimate or permit)</h3>" +
      "<p class='small muted'>Read these and confirm before they go on a sheet. They do not change prices.</p>" +
      "<div class='field'><label class='lbl'>Estimate note</label><textarea id='estNote' readonly>" + esc(est) + "</textarea></div>" +
      "<div class='btns'><button type='button' class='btn light sm' data-copy='estNote'>Copy estimate note</button></div>" +
      "<div class='field'><label class='lbl'>Permit note</label><textarea id='permNote' readonly>" + esc(perm) + "</textarea></div>" +
      "<div class='btns'><button type='button' class='btn light sm' data-copy='permNote'>Copy permit note</button></div>" +
      "<div class='field'><label class='lbl'>Your notes</label><textarea id='freeNotes'>" + esc(state.notes || "") + "</textarea></div>" +
      "<div class='btns'><button type='button' class='btn light' id='btnSaveNotes'>Save notes</button></div></div>" +
      "<div class='card'><h3>Ideas for later</h3><ul class='small' style='margin:0;padding-left:18px;line-height:1.5'>" +
      "<li>A real iPhone app with LiDAR / RoomPlan for Apple Measure–level accuracy, for later.</li>" +
      "<li>One-tap “send to Estimator” after you confirm each number.</li>" +
      "<li>Drop the proposed garage onto a plat or site photo.</li>" +
      "<li>Auto-check height, SF, and setbacks against the village sheet once those code updates are applied.</li>" +
      "<li>Hook up a Bluetooth laser tape.</li>" +
      "<li>Grade / retaining-wall inches from a level shot or future LiDAR.</li>" +
      "<li>A customer-facing recap of the visit, photos and sizes only, no prices unless you add them.</li>" +
      "<li>Send setbacks and the pad into the Drawing app site plan.</li>" +
      "</ul></div>" +
      "<div class='card'><h3>This visit</h3><div class='btns'>" +
      "<button type='button' class='btn light' id='btnExport'>Download JSON</button>" +
      "<button type='button' class='btn danger' id='btnResetVisit'>Clear visit</button></div></div>"
    );
  }

  function numOrNull(v) { var n = parseFloat(v); return isFinite(n) ? n : null; }

  function bindView() {
    document.querySelectorAll("[data-mode]").forEach(function (b) {
      b.onclick = function () { setMode(b.getAttribute("data-mode")); };
    });
    document.querySelectorAll("[data-go]").forEach(function (b) {
      b.onclick = function () { setMode(b.getAttribute("data-go")); };
    });
    $("jobName").oninput = function () { state.jobName = this.value; saveState(); };
    $("village").oninput = function () { state.village = this.value; saveState(); };
    if ($("btnSamplePhoto")) $("btnSamplePhoto").onclick = function () { loadSamplePhoto(); };
    if (mode === "photo") bindPhoto();
    if (mode === "edge") bindEdge();
    if (mode === "pads") bindPads();
    if (mode === "ar") bindAR();
    if (mode === "layout") bindLayout();
    if (mode === "notes") bindNotes();
  }

  function bindPhoto() {
    function onFile(input) {
      var f = input.files && input.files[0];
      if (f) ingestFile(f);
      input.value = "";
    }
    if ($("camInput")) $("camInput").onchange = function () { onFile(this); };
    if ($("fileInput")) $("fileInput").onchange = function () { onFile(this); };
    document.querySelectorAll("[data-ref]").forEach(function (b) {
      b.onclick = function () {
        photo.refId = b.getAttribute("data-ref");
        if (isSmallRef(photo.refId)) photo.refMode = "two";
        photo.points = [];
        render();
      };
    });
    document.querySelectorAll("[data-refmode]").forEach(function (b) {
      b.onclick = function () { photo.refMode = b.getAttribute("data-refmode"); photo.points = []; render(); };
    });
    document.querySelectorAll("[data-dh]").forEach(function (b) {
      b.onclick = function () { photo.doorH = parseFloat(b.getAttribute("data-dh")); render(); };
    });
    if ($("tapeFt")) $("tapeFt").oninput = function () { photo.customFt = parseFloat(this.value) || 0; };
    if ($("tapeIn")) $("tapeIn").oninput = function () { photo.customIn = parseFloat(this.value) || 0; };
    if ($("measLabel")) $("measLabel").onchange = function () { photo.pendingLabel = this.value; };
    bindZoomAndLoupe();
    if ($("btnResetPts")) $("btnResetPts").onclick = function () { photo.points = []; render(); };
    if ($("btnNewPhotoMeas")) $("btnNewPhotoMeas").onclick = function () {
      var need = photo.refMode === "four" ? 4 : 2;
      photo.points = photo.points.slice(0, need);
      render();
    };
    if ($("btnFindDoor")) $("btnFindDoor").onclick = function () { findDoorEdges(); };
    if ($("btnSaveMeas")) $("btnSaveMeas").onclick = saveLastMeasure;
    document.querySelectorAll("[data-del-meas]").forEach(function (b) {
      b.onclick = function () {
        var rec = currentPhotoRecord();
        if (!rec) return;
        rec.measures.splice(parseInt(b.getAttribute("data-del-meas"), 10), 1);
        saveState(); render();
      };
    });
    document.querySelectorAll("[data-apply-meas]").forEach(function (b) {
      b.onclick = function () {
        var rec = currentPhotoRecord();
        if (!rec) return;
        confirmApplyMeasure(rec.measures[parseInt(b.getAttribute("data-apply-meas"), 10)]);
      };
    });
  }

  function onPhotoPointer(ev) {
    ev.preventDefault();
    if (!photo.img) return;
    var canvas = $("photoCanvas");
    var r = canvas.getBoundingClientRect();
    var x = (ev.clientX - r.left) * (canvas.width / r.width);
    var y = (ev.clientY - r.top) * (canvas.height / r.height);
    photo.points.push({ x: x, y: y });
    drawPhoto();
    var hint = $("photoHint");
    var need = photo.refMode === "four" ? 4 : 2;
    if (hint) {
      if (photo.points.length < need) hint.textContent = "Point " + photo.points.length + " of " + need + " for the reference.";
      else if (photo.points.length === need) hint.textContent = "Reference set. Tap two points to measure.";
      else if (photo.points.length === need + 1) hint.textContent = "Tap the end point.";
      else {
        var m = lastOpenMeasure();
        hint.textContent = m != null ? ("Last distance: " + M.formatFeetInches(m.feet) + " — save it below, or keep tapping pairs.") : "Tap two points to measure.";
        if (photo.points.length === need + 2) render();
      }
    }
  }

  function lastOpenMeasure() {
    var cal = calibration();
    if (!cal) return null;
    var need = photo.refMode === "four" ? 4 : 2;
    if (photo.points.length < need + 2) return null;
    var a = photo.points[photo.points.length - 2];
    var b = photo.points[photo.points.length - 1];
    var feet, method;
    if (cal.H) { feet = M.measureOnPlane(cal.H, a, b); method = "plane"; }
    else { feet = M.measureScaled(a, b, cal.scale); method = "scale"; }
    if (feet == null) return null;
    return { feet: feet, method: method, p1: a, p2: b };
  }

  function calibration() {
    var w = refKnownWidth();
    if (w <= 0) return null;
    if (photo.refMode === "four") {
      if (photo.points.length < 4) return null;
      var plane = M.planeFromDoor(photo.points.slice(0, 4), w, refKnownHeight());
      if (!plane) return null;
      return { H: plane.H, widthFt: w, heightFt: refKnownHeight() };
    }
    if (photo.points.length < 2) return null;
    var scale = M.scaleFromReference(photo.points[0], photo.points[1], w);
    if (!scale) return null;
    return { scale: scale, widthFt: w };
  }

  function saveLastMeasure() {
    var m = lastOpenMeasure();
    if (!m) { toast("Tap two points after the reference first."); return; }
    var rec = currentPhotoRecord();
    if (!rec) { toast("Photo is not saved yet."); return; }
    rec.measures = rec.measures || [];
    var conf = null;
    if (m.method === "plane") {
      var cal = calibration();
      if (cal && cal.H) conf = M.planeConfidence(cal.H, photo.points.slice(0, 4), m.p1, m.p2, cal.widthFt, cal.heightFt);
    }
    rec.measures.push({
      label: ($("measLabel") && $("measLabel").value) || photo.pendingLabel || "Other",
      feet: m.feet, method: m.method, p1: m.p1, p2: m.p2, planeWarn: true,
      kind: mode === "edge" ? "edge" : "photo",
      confidence: conf && conf.level,
      confidenceLabel: conf && conf.label,
      confidenceDetail: conf && conf.detail
    });
    saveState();
    toast("Saved " + M.formatFeetInches(m.feet));
    render();
  }

  function confirmApplyMeasure(m) {
    openModal("Use this measurement?",
      "<p>Apply <strong>" + esc(M.formatFeetInches(m.feet)) + "</strong> to a visit field. This does not change any price.</p>" +
      "<div class='field'><label class='lbl'>Field</label><select id='applyField'>" +
      [["width", "Existing width"], ["depth", "Existing depth"], ["height", "Height"],
        ["ohDoor", "Overhead door"], ["svcDoor", "Service door"],
        ["setL", "Left setback"], ["setR", "Right setback"], ["setRear", "Rear setback"], ["setFront", "From house"],
        ["proposedW", "Proposed width"], ["proposedD", "Proposed depth"]
      ].map(function (p) { return "<option value='" + p[0] + "'>" + p[1] + "</option>"; }).join("") +
      "</select></div>",
      function () {
        var key = $("applyField").value;
        if (key === "proposedW" || key === "proposedD") state[key] = m.feet;
        else { state.fields = state.fields || {}; state.fields[key] = m.feet; }
        saveState();
        toast("Saved to visit — confirm before pricing.");
        closeModal();
      });
  }

  function drawPhoto() {
    var canvas = $("photoCanvas");
    if (!canvas || !photo.img) return;
    var img = photo.img;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var need = photo.refMode === "four" ? 4 : 2;
    var rec = currentPhotoRecord();
    if (rec && rec.measures) {
      rec.measures.forEach(function (m) { strokeSeg(ctx, m.p1, m.p2, "#1e4a8c", M.formatFeetInches(m.feet), 6); });
    }
    if (photo.points.length >= 2 && need === 2) {
      strokeSeg(ctx, photo.points[0], photo.points[1], "#c9a227", "ref " + M.formatFeetInches(refKnownWidth()), 7);
    }
    if (photo.points.length >= 4 && need === 4) {
      ctx.beginPath();
      ctx.moveTo(photo.points[0].x, photo.points[0].y);
      for (var i = 1; i < 4; i++) ctx.lineTo(photo.points[i].x, photo.points[i].y);
      ctx.closePath();
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 7;
      ctx.stroke();
    }
    var cal = calibration();
    var extra = photo.points.slice(need);
    for (var j = 0; j + 1 < extra.length; j += 2) {
      var feet = cal && cal.H ? M.measureOnPlane(cal.H, extra[j], extra[j + 1]) : (cal ? M.measureScaled(extra[j], extra[j + 1], cal.scale) : null);
      strokeSeg(ctx, extra[j], extra[j + 1], "#38bdf8", feet != null ? M.formatFeetInches(feet) : "", 6);
    }
    photo.points.forEach(function (p, i) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = i < need ? "#c9a227" : "#38bdf8";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  }

  function strokeSeg(ctx, a, b, color, label, width) {
    if (!a || !b) return;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 6;
    ctx.stroke();
    if (label) {
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      ctx.font = "bold 36px Inter, sans-serif";
      ctx.fillStyle = "rgba(11,31,58,.85)";
      var tw = ctx.measureText(label).width + 24;
      ctx.fillRect(mx - tw / 2, my - 28, tw, 48);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, mx, my);
    }
  }

  function ingestFile(file) {
    var img = new Image();
    var url = URL.createObjectURL(file);
    img.onload = function () {
      var maxW = 1600;
      var scale = Math.min(1, maxW / img.naturalWidth);
      var c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(img.naturalHeight * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      var data = c.toDataURL("image/jpeg", 0.86);
      URL.revokeObjectURL(url);
      addPhoto(data, c.width, c.height);
    };
    img.src = url;
  }

  function addPhoto(dataUrl, w, h, preset) {
    var id = "ph-" + Date.now();
    var rec = { id: id, dataUrl: dataUrl, width: w, height: h, measures: [], created: Date.now() };
    state.photos.push(rec);
    saveState();
    var image = new Image();
    image.onload = function () {
      image._recId = id;
      photo.img = image;
      photo.points = (preset && preset.points) ? preset.points.slice() : [];
      cam.scale = 1; cam.x = 0; cam.y = 0;
      if (preset) {
        if (preset.refMode) photo.refMode = preset.refMode;
        if (preset.refId) photo.refId = preset.refId;
        if (preset.doorH) photo.doorH = preset.doorH;
        if (preset.measures) rec.measures = preset.measures;
        saveState();
      }
      if (mode === "edge") {
        if (edge.sub === "one") photo.refMode = "four";
        if (edge.sub === "stitch") {
          stitch[edge.stitchSide].recId = id;
          if (!preset) stitch[edge.stitchSide].points = [];
        }
        setMode("edge");
      } else setMode("photo");
    };
    image.src = dataUrl;
  }

  function loadSamplePhoto(withDemoMeas) {
    var image = new Image();
    image.onload = function () {
      var c = document.createElement("canvas");
      c.width = image.naturalWidth;
      c.height = image.naturalHeight;
      c.getContext("2d").drawImage(image, 0, 0);
      var data = c.toDataURL("image/jpeg", 0.86);
      var corners = [
        { x: 608, y: 498 }, { x: 1348, y: 508 }, { x: 1352, y: 830 }, { x: 610, y: 828 }
      ];
      var preset = null;
      if (withDemoMeas) {
        var plane = M.planeFromDoor(corners, 16, 7);
        var dw = M.measureOnPlane(plane.H, corners[0], corners[1]);
        var dh = M.measureOnPlane(plane.H, corners[1], corners[2]);
        preset = {
          refMode: "four", refId: "oh16", doorH: 7, points: corners,
          measures: [
            { label: "Overhead door", feet: dw, method: "plane", p1: corners[0], p2: corners[1], planeWarn: true },
            { label: "Height", feet: dh, method: "plane", p1: corners[1], p2: corners[2], planeWarn: true }
          ]
        };
      }
      addPhoto(data, c.width, c.height, preset);
    };
    image.onerror = function () { toast("Could not load the sample photo."); };
    image.src = "garage_001.jpg";
  }

  function findDoorEdges() {
    if (!photo.img) { toast("Load a photo first."); return; }
    var img = photo.img;
    var maxW = 360;
    var s = Math.min(1, maxW / img.naturalWidth);
    var c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.naturalWidth * s));
    c.height = Math.max(1, Math.round(img.naturalHeight * s));
    var ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0, c.width, c.height);
    var data = ctx.getImageData(0, 0, c.width, c.height).data;
    var w = c.width, h = c.height;
    var bright = new Uint8Array(w * h);
    var i, x, y, idx, Y, n;
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        idx = (y * w + x) * 4;
        Y = 0.3 * data[idx] + 0.59 * data[idx + 1] + 0.11 * data[idx + 2];
        bright[y * w + x] = Y > 200 ? 1 : 0;
      }
    }
    for (y = 0; y < Math.floor(h * 0.3); y++) {
      for (x = 0; x < w; x++) bright[y * w + x] = 0;
    }
    var col = new Array(w).fill(0);
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) col[x] += bright[y * w + x];
    }
    function smooth(arr, k) {
      var out = new Array(arr.length).fill(0), j, sum, cnt, hlf = Math.floor(k / 2);
      for (i = 0; i < arr.length; i++) {
        sum = 0; cnt = 0;
        for (j = i - hlf; j <= i + hlf; j++) { if (j >= 0 && j < arr.length) { sum += arr[j]; cnt++; } }
        out[i] = sum / cnt;
      }
      return out;
    }
    col = smooth(col, 9);
    var maxC = Math.max.apply(null, col);
    var runs = [], on = false, a0 = 0;
    for (i = 0; i < w; i++) {
      if (col[i] > maxC * 0.35) { if (!on) { on = true; a0 = i; } }
      else if (on) { runs.push([a0, i - 1]); on = false; }
    }
    if (on) runs.push([a0, w - 1]);
    var x0 = 0, x1 = w - 1;
    if (runs.length) {
      runs.sort(function (A, B) { return (B[1] - B[0]) - (A[1] - A[0]); });
      x0 = runs[0][0]; x1 = runs[0][1];
    }
    var row2 = new Array(h).fill(0);
    for (y = 0; y < h; y++) {
      n = 0;
      for (x = x0; x <= x1; x++) n += bright[y * w + x];
      row2[y] = n;
    }
    row2 = smooth(row2, 7);
    var maxR2 = Math.max.apply(null, row2);
    on = false; runs = [];
    for (i = 0; i < h; i++) {
      if (row2[i] > maxR2 * 0.35) { if (!on) { on = true; a0 = i; } }
      else if (on) { runs.push([a0, i - 1]); on = false; }
    }
    if (on) runs.push([a0, h - 1]);
    var y0 = 0, y1 = h - 1;
    if (runs.length) {
      runs.sort(function (A, B) { return (B[1] - B[0]) - (A[1] - A[0]); });
      y0 = runs[0][0]; y1 = runs[0][1];
    }
    var inv = 1 / s;
    photo.refMode = "four";
    photo.points = [
      { x: x0 * inv, y: y0 * inv },
      { x: x1 * inv, y: y0 * inv },
      { x: x1 * inv, y: y1 * inv },
      { x: x0 * inv, y: y1 * inv }
    ];
    toast("Suggested door corners — reset and tap if it’s off.");
    render();
  }

  function bindZoomAndLoupe() {
    if ($("btnZoomIn")) $("btnZoomIn").onclick = function () { cam.scale = Math.min(6, cam.scale * 1.4); applyCam(); };
    if ($("btnZoomOut")) $("btnZoomOut").onclick = function () { cam.scale = Math.max(1, cam.scale / 1.4); if (cam.scale === 1) { cam.x = 0; cam.y = 0; } applyCam(); };
    if ($("btnZoomReset")) $("btnZoomReset").onclick = function () { cam.scale = 1; cam.x = 0; cam.y = 0; applyCam(); };
    var stage = $("photoStage");
    if (!stage) return;
    stage.addEventListener("pointerdown", onStagePointerDown);
    stage.addEventListener("pointermove", onStagePointerMove);
    stage.addEventListener("pointerup", onStagePointerUp);
    stage.addEventListener("pointercancel", onStagePointerUp);
    stage.addEventListener("wheel", onStageWheel, { passive: false });
    applyCam();
  }
  function applyCam() {
    var inner = $("stageInner");
    if (!inner) return;
    if (cam.scale <= 1) { cam.scale = 1; cam.x = 0; cam.y = 0; }
    inner.style.transform = "translate(" + cam.x + "px," + cam.y + "px) scale(" + cam.scale + ")";
  }
  function pointerList() {
    var out = [], k;
    for (k in pointers) { if (Object.prototype.hasOwnProperty.call(pointers, k)) out.push(pointers[k]); }
    return out;
  }
  function ptrDist(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function imagePointFromEvent(ev) {
    var canvas = $("photoCanvas");
    if (!canvas || !canvas.width) return null;
    var r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    return {
      x: (ev.clientX - r.left) * (canvas.width / r.width),
      y: (ev.clientY - r.top) * (canvas.height / r.height)
    };
  }
  function onStageWheel(ev) {
    ev.preventDefault();
    var before = cam.scale;
    cam.scale = Math.max(1, Math.min(6, cam.scale * (ev.deltaY < 0 ? 1.12 : 1 / 1.12)));
    if (cam.scale === 1) { cam.x = 0; cam.y = 0; }
    else if (before !== cam.scale) {
      /* keep zoom centered on pointer later if needed */
    }
    applyCam();
  }
  function onStagePointerDown(ev) {
    if (!photo.img) return;
    if (ev.target && ev.target.closest && ev.target.closest(".hint")) return;
    ev.preventDefault();
    var stage = $("photoStage");
    try { stage.setPointerCapture(ev.pointerId); } catch (e) {}
    pointers[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
    var pts = pointerList();
    if (pts.length >= 2) {
      pendingPt = null;
      hideLoupe();
      pinch.active = true;
      pinch.startDist = ptrDist(pts[0], pts[1]);
      pinch.startScale = cam.scale;
      pinch.startX = cam.x;
      pinch.startY = cam.y;
      return;
    }
    pendingPt = imagePointFromEvent(ev);
    if (pendingPt) showLoupe(ev, pendingPt);
  }
  function onStagePointerMove(ev) {
    if (pointers[ev.pointerId]) pointers[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
    var pts = pointerList();
    if (pinch.active && pts.length >= 2) {
      var d = ptrDist(pts[0], pts[1]);
      if (pinch.startDist > 8) {
        cam.scale = Math.max(1, Math.min(6, pinch.startScale * (d / pinch.startDist)));
        if (cam.scale === 1) { cam.x = 0; cam.y = 0; }
        applyCam();
      }
      return;
    }
    if (pendingPt) {
      pendingPt = imagePointFromEvent(ev) || pendingPt;
      showLoupe(ev, pendingPt);
    }
  }
  function onStagePointerUp(ev) {
    var wasPinch = pinch.active;
    delete pointers[ev.pointerId];
    if (pointerList().length < 2) pinch.active = false;
    if (wasPinch) { pendingPt = null; hideLoupe(); return; }
    if (pendingPt && photo.img) commitPhotoPoint(pendingPt);
    pendingPt = null;
    hideLoupe();
  }
  function hideLoupe() {
    var loupe = $("loupe");
    if (loupe) loupe.classList.remove("show");
  }
  function showLoupe(ev, pt) {
    var loupe = $("loupe");
    var lc = $("loupeCanvas");
    var canvas = $("photoCanvas");
    var stage = $("photoStage");
    if (!loupe || !lc || !canvas || !stage || !pt) return;
    var sr = stage.getBoundingClientRect();
    var r = canvas.getBoundingClientRect();
    var lx = ev.clientX - sr.left - 56;
    var ly = ev.clientY - sr.top - 128;
    if (ly < 4) ly = ev.clientY - sr.top + 28;
    lx = Math.max(4, Math.min(sr.width - 116, lx));
    loupe.style.left = lx + "px";
    loupe.style.top = ly + "px";
    loupe.classList.add("show");
    lc.width = 112;
    lc.height = 112;
    var ctx = lc.getContext("2d");
    var cssPerImg = r.width / canvas.width;
    var src = 112 / (2.6 * cssPerImg);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, pt.x - src / 2, pt.y - src / 2, src, src, 0, 0, 112, 112);
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(56, 0); ctx.lineTo(56, 112);
    ctx.moveTo(0, 56); ctx.lineTo(112, 56);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(56, 56, 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  function commitPhotoPoint(pt) {
    photo.points.push({ x: pt.x, y: pt.y });
    drawPhoto();
    var hint = $("photoHint");
    var need = photo.refMode === "four" ? 4 : 2;
    if (hint) {
      if (photo.points.length < need) hint.textContent = "Point " + photo.points.length + " of " + need + " for the reference.";
      else if (photo.points.length === need) hint.textContent = mode === "edge" ? "Reference set. Tap the first edge or landmark." : "Reference set. Tap two points to measure.";
      else if (photo.points.length === need + 1) hint.textContent = mode === "edge" ? "Tap the other edge or landmark." : "Tap the end point.";
      else {
        var m = lastOpenMeasure();
        hint.textContent = m != null ? ("Last distance: " + M.formatFeetInches(m.feet) + " — save it below, or keep tapping pairs.") : "Tap two points to measure.";
      }
    }
    if (mode === "edge" && edge.sub === "stitch") rememberStitchSide();
    if (photo.points.length === need + 2) render();
  }

  function bindEdge() {
    document.querySelectorAll("[data-edge-sub]").forEach(function (b) {
      b.onclick = function () {
        var prev = edge.sub;
        if (prev === "stitch") rememberStitchSide();
        edge.sub = b.getAttribute("data-edge-sub");
        if (edge.sub === "one") photo.refMode = "four";
        if (edge.sub === "stitch") {
          var s = stitch[edge.stitchSide];
          if (!s.recId && photo.img) {
            rememberStitchSide();
          } else {
            photo.refId = s.refId || photo.refId;
            photo.refMode = s.refMode || "four";
            photo.customFt = s.customFt;
            photo.customIn = s.customIn;
            photo.doorH = s.doorH || photo.doorH;
            photo.points = (s.points || []).slice();
            if (s.recId && (!photo.img || photo.img._recId !== s.recId)) { loadPhotoRecord(s.recId, false); return; }
          }
        }
        render();
      };
    });
    document.querySelectorAll("[data-stitch-side]").forEach(function (b) {
      b.onclick = function () { activateStitchSide(b.getAttribute("data-stitch-side")); };
    });
    function onFile(input) {
      var f = input.files && input.files[0];
      if (f) ingestFile(f);
      input.value = "";
    }
    if ($("camInput")) $("camInput").onchange = function () { onFile(this); };
    if ($("fileInput")) $("fileInput").onchange = function () { onFile(this); };
    document.querySelectorAll("[data-ref]").forEach(function (b) {
      b.onclick = function () {
        photo.refId = b.getAttribute("data-ref");
        if (isSmallRef(photo.refId)) photo.refMode = "two";
        photo.points = [];
        render();
      };
    });
    document.querySelectorAll("[data-refmode]").forEach(function (b) {
      b.onclick = function () { photo.refMode = b.getAttribute("data-refmode"); photo.points = []; render(); };
    });
    document.querySelectorAll("[data-dh]").forEach(function (b) {
      b.onclick = function () { photo.doorH = parseFloat(b.getAttribute("data-dh")); render(); };
    });
    if ($("tapeFt")) $("tapeFt").oninput = function () { photo.customFt = parseFloat(this.value) || 0; };
    if ($("tapeIn")) $("tapeIn").oninput = function () { photo.customIn = parseFloat(this.value) || 0; };
    if ($("measLabel")) $("measLabel").onchange = function () { photo.pendingLabel = this.value; };
    if ($("btnResetPts")) $("btnResetPts").onclick = function () { photo.points = []; render(); };
    if ($("btnNewPhotoMeas")) $("btnNewPhotoMeas").onclick = function () {
      var need = photo.refMode === "four" ? 4 : 2;
      photo.points = photo.points.slice(0, need);
      render();
    };
    if ($("btnFindDoor")) $("btnFindDoor").onclick = function () { findDoorEdges(); };
    if ($("btnSaveMeas")) $("btnSaveMeas").onclick = function () {
      if (mode === "edge") photo.pendingLabel = ($("measLabel") && $("measLabel").value) || "Edge to edge";
      saveLastMeasure();
    };
    if ($("stitchLabel")) $("stitchLabel").onchange = function () { edge.stitchLabel = this.value; };
    if ($("btnSaveStitch")) $("btnSaveStitch").onclick = saveStitch;
    if ($("laserFt")) $("laserFt").oninput = function () { edge.laserFt = this.value; updateLaserPreview(); };
    if ($("laserIn")) $("laserIn").oninput = function () { edge.laserIn = this.value; updateLaserPreview(); };
    if ($("laserVoice")) $("laserVoice").oninput = function () { edge.laserVoice = this.value; updateLaserPreview(); };
    if ($("laserLabel")) $("laserLabel").onchange = function () { edge.laserLabel = this.value; };
    if ($("btnLaserTalk")) $("btnLaserTalk").onclick = startLaserTalk;
    if ($("btnLaserTalkStop")) $("btnLaserTalkStop").onclick = stopTalk;
    if ($("btnSaveLaser")) $("btnSaveLaser").onclick = saveLaser;
    document.querySelectorAll("[data-del-stitch]").forEach(function (b) {
      b.onclick = function () { state.stitches.splice(parseInt(b.getAttribute("data-del-stitch"), 10), 1); saveState(); render(); };
    });
    document.querySelectorAll("[data-del-tape]").forEach(function (b) {
      b.onclick = function () { state.tapes.splice(parseInt(b.getAttribute("data-del-tape"), 10), 1); saveState(); render(); };
    });
    document.querySelectorAll("[data-apply-stitch]").forEach(function (b) {
      b.onclick = function () { confirmApplyMeasure(state.stitches[parseInt(b.getAttribute("data-apply-stitch"), 10)]); };
    });
    document.querySelectorAll("[data-apply-tape]").forEach(function (b) {
      b.onclick = function () { confirmApplyMeasure(state.tapes[parseInt(b.getAttribute("data-apply-tape"), 10)]); };
    });
    bindZoomAndLoupe();
    updateLaserPreview();
  }
  function currentLaserFeet() {
    if (edge.laserVoice && String(edge.laserVoice).trim()) {
      var parsed = M.parseExactLength(edge.laserVoice);
      if (parsed && isFinite(parsed.feet)) return parsed.feet;
    }
    var ft = parseFloat(edge.laserFt);
    var inch = parseFloat(edge.laserIn);
    if (!isFinite(ft) && !isFinite(inch)) return null;
    return (isFinite(ft) ? ft : 0) + (isFinite(inch) ? inch : 0) / 12;
  }
  function updateLaserPreview() {
    var el = $("laserPreview");
    if (!el) return;
    var f = currentLaserFeet();
    if (f == null || f < 0) { el.innerHTML = "<p class='small muted'>Enter a length to preview.</p>"; return; }
    el.innerHTML = "<div class='okbox'>Will save <strong>" + M.formatFeetInches(f) + "</strong> as an exact laser/tape reading.</div>";
  }
  function startLaserTalk() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast("Voice isn’t available in this browser. Type the length instead."); return; }
    stopTalk();
    recognizer = new SR();
    recognizer.lang = "en-US";
    recognizer.interimResults = true;
    recognizer.continuous = false;
    recognizer.onresult = function (ev) {
      var out = "", i;
      for (i = ev.resultIndex; i < ev.results.length; i++) out += ev.results[i][0].transcript;
      edge.laserVoice = out;
      if ($("laserVoice")) $("laserVoice").value = out;
      if ($("laserTalkStatus")) $("laserTalkStatus").textContent = "Heard: " + out;
      updateLaserPreview();
    };
    recognizer.onerror = function (e) { if ($("laserTalkStatus")) $("laserTalkStatus").textContent = "Voice error: " + (e.error || "unknown"); };
    recognizer.onend = function () { if ($("laserTalkStatus")) $("laserTalkStatus").textContent = "Stopped. Check the preview, then save."; };
    recognizer.start();
    if ($("laserTalkStatus")) $("laserTalkStatus").textContent = "Listening… say the length.";
  }
  function saveStitch() {
    rememberStitchSide();
    var aFt = stitchSegmentFeet(stitch.a);
    var bFt = stitchSegmentFeet(stitch.b);
    var total = (aFt != null && bFt != null) ? M.stitchSegments([{ feet: aFt }, { feet: bFt }]) : null;
    if (!total) { toast("Set a reference and two points on both photos first."); return; }
    state.stitches = state.stitches || [];
    state.stitches.push({
      label: ($("stitchLabel") && $("stitchLabel").value) || edge.stitchLabel || "Edge to edge",
      feet: total.feet, aFeet: aFt, bFeet: bFt, method: "stitch", t: Date.now(),
      aRecId: stitch.a.recId, bRecId: stitch.b.recId
    });
    saveState();
    toast("Saved stitched length " + M.formatFeetInches(total.feet));
    render();
  }
  function saveLaser() {
    var f = currentLaserFeet();
    if (f == null || f < 0) { toast("Enter or say a length first."); return; }
    state.tapes = state.tapes || [];
    state.tapes.push({
      label: ($("laserLabel") && $("laserLabel").value) || edge.laserLabel || "Laser / tape",
      feet: f, method: "laser", exact: true, raw: edge.laserVoice || "", t: Date.now()
    });
    saveState();
    toast("Saved exact length " + M.formatFeetInches(f));
    edge.laserFt = ""; edge.laserIn = ""; edge.laserVoice = "";
    render();
  }


  function bindPads() {
    function preview() {
      var L = parseFloat($("padL").value), W = parseFloat($("padW").value), T = parseFloat($("padThk").value), waste = parseFloat($("padWaste").value) || 0;
      var area = M.rectangleArea(L, W);
      var msg = "";
      if (area) {
        msg = M.round1(area) + " SF";
        var cy = M.cubicYards(area, T, waste);
        if (cy != null) msg += " · " + M.round2(cy) + " CY";
        else msg += " · enter thickness for yards";
      }
      $("padPreview").textContent = msg;
    }
    ["padL", "padW", "padThk", "padWaste"].forEach(function (id) { if ($(id)) $(id).oninput = preview; });
    $("btnAddPad").onclick = function () {
      var L = parseFloat($("padL").value), W = parseFloat($("padW").value);
      var area = M.rectangleArea(L, W);
      if (!area) { toast("Enter length and width."); return; }
      var T = parseFloat($("padThk").value);
      var waste = parseFloat($("padWaste").value) || 0;
      state.pads.push({
        type: $("padType").value,
        label: $("padLabel").value || ($("padType").options[$("padType").selectedIndex].text),
        lengthFt: L, widthFt: W, areaSqFt: area,
        thicknessIn: isFinite(T) && T > 0 ? T : null,
        wastePct: waste
      });
      saveState();
      render();
    };
    $("btnPadFromMeas").onclick = function () {
      var meas = collectMeasurements();
      if (meas.length < 2) { toast("Save two photo measurements first (length and width)."); return; }
      var a = meas[meas.length - 2], b = meas[meas.length - 1];
      $("padL").value = M.round2(a.feet);
      $("padW").value = M.round2(b.feet);
      preview();
      toast("Filled from the last two photo measures. Check them, then add.");
    };
    document.querySelectorAll("[data-del-pad]").forEach(function (b) {
      b.onclick = function () { state.pads.splice(parseInt(b.getAttribute("data-del-pad"), 10), 1); saveState(); render(); };
    });
  }

  function bindAR() {
    detectAR();
    if ($("btnStartAR")) $("btnStartAR").onclick = startAR;
    $("arEnd").onclick = endAR;
    $("arUndo").onclick = function () { ar.points.pop(); updateARReadout(); };
    $("arSave").onclick = saveARConfirm;
  }
  function detectAR() {
    ar.supported = false;
    if (navigator.xr && navigator.xr.isSessionSupported) {
      navigator.xr.isSessionSupported("immersive-ar").then(function (ok) {
        if (ok !== ar.supported) { ar.supported = !!ok; if (mode === "ar") render(); }
      }).catch(function () {});
    }
  }
  async function startAR() {
    try {
      var canvas = $("arCanvas");
      var gl = canvas.getContext("webgl", { xrCompatible: true });
      await gl.makeXRCompatible();
      var session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["dom-overlay", "local-floor"],
        domOverlay: { root: $("arOverlay") }
      });
      ar.session = session;
      ar.points = [];
      ar.lastHit = null;
      ar.gl = gl;
      canvas.style.display = "block";
      $("arOverlay").classList.remove("hidden");
      var refSpace = await session.requestReferenceSpace("local");
      var viewerSpace = await session.requestReferenceSpace("viewer");
      var hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
      session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });
      session.addEventListener("select", function () {
        if (!ar.lastHit) return;
        ar.points.push(ar.lastHit);
        updateARReadout();
      });
      session.addEventListener("end", function () { cleanupAR(); });
      var onFrame = function (t, frame) {
        if (!ar.session) return;
        session.requestAnimationFrame(onFrame);
        var pose = frame.getViewerPose(refSpace);
        var layer = session.renderState.baseLayer;
        if (pose && layer) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        var hits = frame.getHitTestResults(hitTestSource);
        if (hits.length) {
          var hp = hits[0].getPose(refSpace);
          if (hp) {
            ar.lastHit = { x: hp.transform.position.x, y: hp.transform.position.y, z: hp.transform.position.z };
          }
        }
      };
      session.requestAnimationFrame(onFrame);
    } catch (e) {
      toast("Could not start AR: " + (e && e.message ? e.message : "unsupported"));
      cleanupAR();
    }
  }
  function arDistanceFeet() {
    if (ar.points.length < 2) return null;
    var a = ar.points[ar.points.length - 2], b = ar.points[ar.points.length - 1];
    var m = Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y) + (b.z - a.z) * (b.z - a.z));
    return m * 3.28084;
  }
  function updateARReadout() {
    var f = arDistanceFeet();
    ar.feet = f;
    $("arReadout").textContent = f != null ? M.formatFeetInches(f) : (ar.points.length === 1 ? "Tap the end point" : "Tap a start point");
  }
  function saveARConfirm() {
    var f = arDistanceFeet();
    if (f == null) { toast("Tap two points first."); return; }
    openModal("Save AR measure?",
      "<p>AR distance: <strong>" + M.formatFeetInches(f) + "</strong></p><p class='small muted'>" + esc(M.ACCURACY.arWebXR) + "</p>" +
      "<div class='field'><label class='lbl'>Label</label><select id='arLabel'>" + M.MEASURE_LABELS.map(function (l) { return "<option>" + esc(l) + "</option>"; }).join("") + "</select></div>" +
      "<label class='small' style='display:flex;gap:8px;align-items:flex-start'><input id='arOk' type='checkbox' style='width:22px;height:22px;min-height:0;flex:0 0 22px'> I’ve checked this number and want it on the visit. It still should be confirmed before any price.</label>",
      function () {
        if (!$("arOk").checked) { toast("Check the box to confirm."); return; }
        state.walks.push({ feet: f, label: $("arLabel").value, method: "webxr", rough: false, confirmed: true, t: Date.now() });
        saveState();
        toast("Saved AR measure.");
        closeModal();
      });
  }
  function endAR() { if (ar.session) { try { ar.session.end(); } catch (e) { cleanupAR(); } } else cleanupAR(); }
  function cleanupAR() {
    ar.session = null;
    $("arCanvas").style.display = "none";
    $("arOverlay").classList.add("hidden");
  }

  function bindLayout() {
    function sync() {
      state.lotW = numOrNull($("lotW").value);
      state.lotD = numOrNull($("lotD").value);
      state.setL = numOrNull($("laySL").value);
      state.setR = numOrNull($("laySR").value);
      state.setFront = numOrNull($("laySF").value);
      state.setRear = numOrNull($("laySRe").value);
      state.proposedW = numOrNull($("propW").value);
      state.proposedD = numOrNull($("propD").value);
      saveState();
    }
    ["lotW", "lotD", "laySL", "laySR", "laySF", "laySRe", "propW", "propD"].forEach(function (id) {
      if ($(id)) $(id).onchange = function () { sync(); render(); };
    });
    document.querySelectorAll("[data-place]").forEach(function (b) {
      b.onclick = function () { state.layoutPlace = b.getAttribute("data-place"); saveState(); render(); };
    });
    document.querySelectorAll("[data-size]").forEach(function (b) {
      b.onclick = function () {
        var p = b.getAttribute("data-size").split("x");
        state.proposedW = parseFloat(p[0]); state.proposedD = parseFloat(p[1]);
        saveState(); render();
      };
    });
    if ($("btnSaveLayout")) $("btnSaveLayout").onclick = function () {
      sync();
      if (!state.proposedW || !state.proposedD) { toast("Enter or pick a proposed size first."); return; }
      toast("Proposed " + state.proposedW + "×" + state.proposedD + " saved to this visit.");
    };
  }

  function drawLayout() {
    var svg = $("layoutSvg");
    if (!svg) return;
    var lotW = state.lotW || 40, lotD = state.lotD || 50;
    var gw = state.proposedW || 0, gd = state.proposedD || 0;
    var lay = M.layoutRect({
      lotW: lotW, lotD: lotD,
      setLeft: state.setL || 0, setRight: state.setR || 0,
      setFront: state.setFront || 0, setRear: state.setRear || 0,
      garageW: gw || 0, garageD: gd || 0,
      placement: state.layoutPlace || "center"
    });
    var sx = (100 - 16) / lotW, sy = (80 - 16) / lotD;
    var s = Math.min(sx, sy);
    var ox = (100 - lotW * s) / 2, oy = (80 - lotD * s) / 2;
    function R(x, y, w, d) { return { x: ox + x * s, y: oy + y * s, w: w * s, d: d * s }; }
    var lot = R(0, 0, lotW, lotD);
    var g = gw && gd ? R(lay.garage.x, lay.garage.y, gw, gd) : null;
    var sl = state.setL || 0, sr = state.setR || 0, sf = state.setFront || 0, sre = state.setRear || 0;
    var inner = R(sl, sf, lotW - sl - sr, lotD - sf - sre);
    var html = "";
    html += "<rect x='0' y='0' width='100' height='80' fill='#f8fafc'/>";
    html += "<rect x='" + lot.x + "' y='" + lot.y + "' width='" + lot.w + "' height='" + lot.d + "' fill='#fff' stroke='#0b1f3a' stroke-width='1.2'/>";
    html += "<rect x='" + inner.x + "' y='" + inner.y + "' width='" + Math.max(0, inner.w) + "' height='" + Math.max(0, inner.d) + "' fill='none' stroke='#c9a227' stroke-dasharray='2 2' stroke-width='0.7'/>";
    html += "<text x='" + (lot.x + lot.w / 2) + "' y='" + (lot.y + 4) + "' text-anchor='middle' font-size='3' fill='#6f7a8d' font-family='Inter,sans-serif'>House / front</text>";
    if (g && gw && gd) {
      html += "<rect x='" + g.x + "' y='" + g.y + "' width='" + g.w + "' height='" + g.d + "' fill='" + (lay.fits ? "#1e4a8c" : "#b91c1c") + "' opacity='0.9'/>";
      html += "<text x='" + (g.x + g.w / 2) + "' y='" + (g.y + g.d / 2) + "' text-anchor='middle' dominant-baseline='middle' font-size='3.2' fill='#fff' font-weight='800' font-family='Inter,sans-serif'>" + gw + "×" + gd + (lay.fits ? "" : " won’t fit") + "</text>";
    }
    html += "<text x='" + (lot.x + lot.w / 2) + "' y='" + (lot.y + lot.d + 4) + "' text-anchor='middle' font-size='3' fill='#6f7a8d' font-family='Inter,sans-serif'>Lot " + lotW + " × " + lotD + " ft</text>";
    svg.innerHTML = html;
  }

  function bindNotes() {
    document.querySelectorAll("[data-copy]").forEach(function (b) {
      b.onclick = function () {
        var n = $(b.getAttribute("data-copy"));
        var text = n ? (n.tagName === "TEXTAREA" || n.tagName === "INPUT" ? n.value : n.textContent) : "";
        copyText(text);
      };
    });
    if ($("btnTalk")) $("btnTalk").onclick = startTalk;
    if ($("btnTalkStop")) $("btnTalkStop").onclick = stopTalk;
    if ($("btnParseTalk")) $("btnParseTalk").onclick = function () { showParse($("talkText").value); };
    if ($("btnLimApply")) $("btnLimApply").onclick = function () {
      state.limits = {
        maxSf: numOrNull($("limSf").value), maxHeight: numOrNull($("limH").value),
        minLeft: numOrNull($("limL").value), minRight: numOrNull($("limR").value),
        minFront: numOrNull($("limF").value), minRear: numOrNull($("limRe").value)
      };
      saveState(); render();
    };
    if ($("btnSaveNotes")) $("btnSaveNotes").onclick = function () { state.notes = $("freeNotes").value; saveState(); toast("Notes saved."); };
    if ($("btnExport")) $("btnExport").onclick = exportJSON;
    if ($("btnResetVisit")) $("btnResetVisit").onclick = function () {
      openModal("Clear this visit?", "<p>This removes photos, measurements, and notes stored in this browser. It does not change the dashboard or any estimate.</p>", function () {
        state = defaultState();
        photo.img = null; photo.points = [];
        saveState(); closeModal(); render();
      });
    };
  }

  var recognizer = null;
  function startTalk() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast("Voice isn’t available in this browser. Type the note instead."); return; }
    stopTalk();
    recognizer = new SR();
    recognizer.lang = "en-US";
    recognizer.interimResults = true;
    recognizer.continuous = true;
    var acc = $("talkText").value || "";
    recognizer.onresult = function (ev) {
      var out = acc, i;
      for (i = ev.resultIndex; i < ev.results.length; i++) {
        out += ev.results[i][0].transcript;
        if (ev.results[i].isFinal) out += " ";
      }
      $("talkText").value = out;
      $("talkStatus").textContent = "Listening…";
    };
    recognizer.onerror = function (e) { $("talkStatus").textContent = "Voice error: " + (e.error || "unknown"); };
    recognizer.onend = function () { $("talkStatus").textContent = "Stopped. Preview the fields, then confirm."; };
    recognizer.start();
    $("talkStatus").textContent = "Listening… speak now.";
  }
  function stopTalk() {
    try { if (recognizer) recognizer.stop(); } catch (e) {}
    recognizer = null;
  }
  function showParse(text) {
    var p = M.parseVoice(text);
    var keys = Object.keys(p.fields);
    if (!keys.length && !p.notes.length) { $("parseOut").innerHTML = "<p class='small muted'>No fields found. Try “22 by 24, 16 foot door.”</p>"; return; }
    var rows = keys.map(function (k) {
      return "<div class='meas-row'><div class='meta'>" + esc(k) + "</div><div class='val'>" + M.formatFeetInches(p.fields[k]) + "</div></div>";
    }).join("");
    $("parseOut").innerHTML = rows + (p.notes.length ? "<p class='small'>" + esc(p.notes.join(" ")) + "</p>" : "") +
      "<div class='btns'><button type='button' class='btn gold' id='btnApplyParse'>Confirm and apply to visit</button></div>";
    $("btnApplyParse").onclick = function () {
      state.fields = Object.assign({}, state.fields, p.fields);
      if (p.fields.proposedW) state.proposedW = p.fields.proposedW;
      if (p.fields.proposedD) state.proposedD = p.fields.proposedD;
      if (p.fields.padL && p.fields.padW) {
        state.pads.push({
          type: "proposed-pad", label: "From voice",
          lengthFt: p.fields.padL, widthFt: p.fields.padW,
          areaSqFt: p.fields.padL * p.fields.padW,
          thicknessIn: p.fields.padThk || null, wastePct: 0
        });
      } else if (p.fields.padThk && state.pads[0] && !state.pads[0].thicknessIn) {
        state.pads[0].thicknessIn = p.fields.padThk;
      }
      if (p.notes.length) state.notes = (state.notes ? state.notes + " " : "") + p.notes.join(" ");
      state.voiceLog.push({ raw: p.raw, t: Date.now() });
      saveState();
      toast("Applied — confirm numbers before any price.");
      render();
    };
  }

  function copyText(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("Copied."); }).catch(function () { fallbackCopy(text); });
    } else fallbackCopy(text);
  }
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast("Copied."); } catch (e) { toast("Copy failed."); }
    ta.remove();
  }
  function exportJSON() {
    var blob = new Blob([JSON.stringify({ visit: state, exported: new Date().toISOString() }, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "agb-site-measure.json";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function openModal(title, body, onOk) {
    closeModal();
    var root = $("modalRoot");
    root.innerHTML = "<div class='modalbg' id='modalBg'><div class='modal'><div class='modalhead'><h3>" + esc(title) + "</h3>" +
      "<button type='button' class='btn light sm' id='modalX'>✕</button></div><div class='body'>" + body +
      "<div class='btns'><button type='button' class='btn light' id='modalCancel'>Cancel</button>" +
      "<button type='button' class='btn primary' id='modalOk'>Confirm</button></div></div></div></div>";
    $("modalX").onclick = $("modalCancel").onclick = closeModal;
    $("modalBg").addEventListener("click", function (e) { if (e.target.id === "modalBg") closeModal(); });
    $("modalOk").onclick = onOk;
  }
  function closeModal() { $("modalRoot").innerHTML = ""; }

  window.addEventListener("resize", function () {
    renderChrome();
    if (mode === "photo" || (mode === "edge" && edge.sub !== "laser")) { drawPhoto(); applyCam(); }
    if (mode === "layout") drawLayout();
  });


  document.addEventListener("click", function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    var modeBtn = t.closest("[data-mode]");
    if (modeBtn && (modeBtn.closest("#modeTabs") || modeBtn.closest("#bottomNav"))) {
      ev.preventDefault();
      setMode(modeBtn.getAttribute("data-mode"));
      return;
    }
    var goBtn = t.closest("[data-go]");
    if (goBtn) {
      ev.preventDefault();
      setMode(goBtn.getAttribute("data-go"));
    }
  });

  detectAR();
  render();


  if (/[?&]demo=1/.test(location.search)) {
    state.jobName = state.jobName || "Sample visit";
    state.village = state.village || "Brookfield";
    state.proposedW = state.proposedW || 24;
    state.proposedD = state.proposedD || 24;
    state.lotW = state.lotW || 50;
    state.lotD = state.lotD || 60;
    state.setL = state.setL || 5;
    state.setR = state.setR || 5;
    state.setFront = state.setFront || 10;
    state.setRear = state.setRear || 5;
    state.fields = Object.assign({ width: 22, depth: 22, ohDoor: 16, setL: 5, setR: 5 }, state.fields);
    if (!state.pads.length) {
      state.pads.push({ type: "proposed-pad", label: "Proposed pad", lengthFt: 24, widthFt: 24, areaSqFt: 576, thicknessIn: 4, wastePct: 0 });
      state.pads.push({ type: "apron", label: "Apron", lengthFt: 16, widthFt: 4, areaSqFt: 64, thicknessIn: 4, wastePct: 0 });
    }
    saveState();
    loadSamplePhoto(true);
  }
})();
