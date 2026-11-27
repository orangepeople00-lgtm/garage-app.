/* Absolute Garage Builders — Site Measure math and assist helpers.
   No network calls. No prices. Used by site-measure-sample.html and tests. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.AGBMeasure = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var REFS = [
    { id: "oh16", label: "16' overhead door", short: "16' door", widthFt: 16, heightFt: 7, kind: "door" },
    { id: "oh9", label: "9' overhead door", short: "9' door", widthFt: 9, heightFt: 7, kind: "door" },
    { id: "oh8", label: "8' overhead door", short: "8' door", widthFt: 8, heightFt: 7, kind: "door" },
    { id: "service", label: "36\" service door", short: "36\" door", widthFt: 3, heightFt: 80 / 12, kind: "door" },
    { id: "tape", label: "Custom tape length", short: "Tape", widthFt: null, heightFt: null, kind: "tape" }
  ];

  var DOOR_HEIGHTS = [
    { id: "h7", label: "7' tall", ft: 7 },
    { id: "h8", label: "8' tall", ft: 8 },
    { id: "h9", label: "9' tall", ft: 9 },
    { id: "h10", label: "10' tall", ft: 10 },
    { id: "h68", label: "6'-8\" tall", ft: 80 / 12 }
  ];

  var MEASURE_LABELS = [
    "Width",
    "Depth",
    "Height",
    "Overhead door",
    "Service door",
    "Setback — left",
    "Setback — right",
    "Setback — rear",
    "Setback — front / from house",
    "Apron depth",
    "Pad length",
    "Pad width",
    "Driveway width",
    "Overhang / soffit",
    "Other"
  ];

  var PAD_TYPES = [
    { id: "existing-pad", label: "Existing pad", kind: "area" },
    { id: "proposed-pad", label: "Proposed pad", kind: "area" },
    { id: "apron", label: "Apron", kind: "area" },
    { id: "driveway", label: "Driveway", kind: "area" },
    { id: "patio", label: "Patio", kind: "area" },
    { id: "sidewalk", label: "Sidewalk", kind: "area" },
    { id: "footing", label: "Footing (area)", kind: "area" },
    { id: "other", label: "Other area", kind: "area" }
  ];

  var STANDARD_SIZES = [
    [20, 20], [20, 22], [22, 20], [22, 22], [22, 24], [24, 22],
    [24, 24], [24, 26], [24, 28], [24, 30], [26, 24], [26, 26],
    [26, 28], [26, 30], [28, 28], [28, 30], [30, 30], [30, 36], [24, 36]
  ];

  var CHECKLIST = [
    { id: "existW", label: "Existing width", group: "existing" },
    { id: "existD", label: "Existing depth", group: "existing" },
    { id: "existH", label: "Wall / mean height", group: "existing" },
    { id: "ohDoor", label: "Overhead door size", group: "existing" },
    { id: "svcDoor", label: "Service door", group: "existing" },
    { id: "setL", label: "Left setback", group: "setbacks" },
    { id: "setR", label: "Right setback", group: "setbacks" },
    { id: "setRear", label: "Rear setback", group: "setbacks" },
    { id: "setFront", label: "Front / from-house setback", group: "setbacks" },
    { id: "pad", label: "Existing or proposed pad", group: "concrete" },
    { id: "padThk", label: "Slab thickness", group: "concrete" },
    { id: "apron", label: "Apron", group: "concrete" },
    { id: "proposed", label: "Proposed garage size", group: "proposed" },
    { id: "photos", label: "Site photos (front / sides / pad)", group: "photos" },
    { id: "grade", label: "Grade / retaining / drainage notes", group: "notes" },
    { id: "wires", label: "Overhead wires / trees / obstacles", group: "notes" }
  ];

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function almostEqual(a, b, eps) {
    return Math.abs(a - b) <= (eps == null ? 1e-6 : eps);
  }

  function dist(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function formatFeetInches(feet) {
    if (feet == null || !isFinite(feet)) return "—";
    var sign = feet < 0 ? "-" : "";
    var abs = Math.abs(feet);
    var f = Math.floor(abs + 1e-10);
    var inches = Math.round((abs - f) * 12);
    if (inches === 12) {
      f += 1;
      inches = 0;
    }
    return sign + f + "'-" + inches + "\"";
  }

  function formatFeetInchesLong(feet) {
    if (feet == null || !isFinite(feet)) return "—";
    var s = formatFeetInches(feet).replace("\"", " in").replace("'-", " ft ");
    return s;
  }

  function parseFeetInches(str) {
    if (str == null) return NaN;
    if (typeof str === "number") return str;
    var s = String(str).trim().toLowerCase().replace(/,/g, "");
    if (!s) return NaN;
    var m;
    m = s.match(/^(-?\d+)\s*(?:'|ft|feet)\s*-?\s*(\d+(?:\.\d+)?)\s*(?:"|in|inch|inches)?$/);
    if (m) return parseFloat(m[1]) + parseFloat(m[2]) / 12;
    m = s.match(/^(-?\d+(?:\.\d+)?)\s*(?:'|ft|feet)$/);
    if (m) return parseFloat(m[1]);
    m = s.match(/^(-?\d+(?:\.\d+)?)\s*(?:"|in|inch|inches)$/);
    if (m) return parseFloat(m[1]) / 12;
    m = s.match(/^(-?\d+(?:\.\d+)?)\s*(?:x|by)?$/);
    if (m) return parseFloat(m[1]);
    var n = parseFloat(s);
    return isFinite(n) ? n : NaN;
  }

  function scaleFromReference(p1, p2, knownFt) {
    var px = dist(p1, p2);
    if (px < 1e-6 || !isFinite(knownFt) || knownFt <= 0) return null;
    return knownFt / px;
  }

  function measureScaled(p1, p2, scale) {
    if (scale == null || !isFinite(scale)) return null;
    return dist(p1, p2) * scale;
  }

  function solveLinearSystem(A, b) {
    var n = A.length;
    var M = [];
    var i, j, k, p, swap, f, max, row;
    for (i = 0; i < n; i++) {
      M[i] = A[i].slice();
      M[i][n] = b[i];
    }
    for (i = 0; i < n; i++) {
      max = i;
      for (p = i + 1; p < n; p++) {
        if (Math.abs(M[p][i]) > Math.abs(M[max][i])) max = p;
      }
      swap = M[i];
      M[i] = M[max];
      M[max] = swap;
      if (Math.abs(M[i][i]) < 1e-12) return null;
      for (k = i + 1; k < n; k++) {
        f = M[k][i] / M[i][i];
        for (j = i; j <= n; j++) M[k][j] -= f * M[i][j];
      }
    }
    var x = new Array(n);
    for (i = n - 1; i >= 0; i--) {
      row = M[i][n];
      for (j = i + 1; j < n; j++) row -= M[i][j] * x[j];
      x[i] = row / M[i][i];
    }
    return x;
  }

  /* 4 image points → plane feet rectangle (0,0)-(W,0)-(W,H)-(0,H), clockwise or TL-TR-BR-BL */
  function findHomography(src, dst) {
    if (!src || !dst || src.length !== 4 || dst.length !== 4) return null;
    var A = [];
    var b = [];
    var i, s, d;
    for (i = 0; i < 4; i++) {
      s = src[i];
      d = dst[i];
      A.push([s.x, s.y, 1, 0, 0, 0, -d.x * s.x, -d.x * s.y]);
      b.push(d.x);
      A.push([0, 0, 0, s.x, s.y, 1, -d.y * s.x, -d.y * s.y]);
      b.push(d.y);
    }
    var h = solveLinearSystem(A, b);
    if (!h) return null;
    return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
  }

  function applyHomography(H, x, y) {
    var w = H[6] * x + H[7] * y + H[8];
    if (Math.abs(w) < 1e-12) return null;
    return { x: (H[0] * x + H[1] * y + H[2]) / w, y: (H[3] * x + H[4] * y + H[5]) / w };
  }

  function planeFromDoor(imageCorners, widthFt, heightFt) {
    var dst = [
      { x: 0, y: 0 },
      { x: widthFt, y: 0 },
      { x: widthFt, y: heightFt },
      { x: 0, y: heightFt }
    ];
    var H = findHomography(imageCorners, dst);
    if (!H) return null;
    return { H: H, widthFt: widthFt, heightFt: heightFt };
  }

  function measureOnPlane(H, p1, p2) {
    var a = applyHomography(H, p1.x, p1.y);
    var b = applyHomography(H, p2.x, p2.y);
    if (!a || !b) return null;
    return dist(a, b);
  }

  function shoelace(points) {
    if (!points || points.length < 3) return 0;
    var sum = 0;
    var i, j, n = points.length;
    for (i = 0; i < n; i++) {
      j = (i + 1) % n;
      sum += points[i].x * points[j].y - points[j].x * points[i].y;
    }
    return Math.abs(sum) / 2;
  }

  function rectangleArea(lengthFt, widthFt) {
    if (!isFinite(lengthFt) || !isFinite(widthFt) || lengthFt < 0 || widthFt < 0) return null;
    return lengthFt * widthFt;
  }

  function cubicYards(areaSqFt, thicknessIn, wastePct) {
    if (!isFinite(areaSqFt) || areaSqFt < 0) return null;
    if (!isFinite(thicknessIn) || thicknessIn <= 0) return null;
    var yds = (areaSqFt * (thicknessIn / 12)) / 27;
    var w = isFinite(wastePct) && wastePct > 0 ? wastePct : 0;
    return yds * (1 + w / 100);
  }

  function cubicYardsParts(areaSqFt, thicknessIn, wastePct) {
    var raw = cubicYards(areaSqFt, thicknessIn, 0);
    var withWaste = cubicYards(areaSqFt, thicknessIn, wastePct);
    if (raw == null) return null;
    return { yards: withWaste, rawYards: raw, areaSqFt: areaSqFt, thicknessIn: thicknessIn, wastePct: wastePct || 0 };
  }

  function totalYards(items) {
    var area = 0, yards = 0, raw = 0, counted = 0;
    (items || []).forEach(function (it) {
      var r = cubicYardsParts(it.areaSqFt, it.thicknessIn, it.wastePct);
      if (!r) return;
      counted++;
      area += r.areaSqFt;
      yards += r.yards;
      raw += r.rawYards;
    });
    return { count: counted, areaSqFt: area, yards: yards, rawYards: raw };
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  /* Voice / lingo → fields. Returns suggestions only; UI must confirm. */
  function parseVoice(transcript) {
    var raw = String(transcript || "").replace(/\s+/g, " ").trim();
    var t = raw.toLowerCase();
    t = t.replace(/twenty[-\s]?two/g, "22").replace(/twenty[-\s]?four/g, "24")
      .replace(/twenty[-\s]?six/g, "26").replace(/twenty[-\s]?eight/g, "28")
      .replace(/twenty[-\s]?/g, "20 ").replace(/thirty[-\s]?six/g, "36")
      .replace(/thirty[-\s]?/g, "30 ").replace(/eighteen/g, "18")
      .replace(/sixteen/g, "16").replace(/fourteen/g, "14")
      .replace(/twelve/g, "12").replace(/fifteen/g, "15")
      .replace(/ten\b/g, "10").replace(/nine\b/g, "9").replace(/eight\b/g, "8")
      .replace(/seven\b/g, "7").replace(/six\b/g, "6").replace(/five\b/g, "5")
      .replace(/four\b/g, "4").replace(/three\b/g, "3");
    t = t.replace(/(\d+)\s*(?:foot|feet|ft|'|’)/g, "$1'");
    t = t.replace(/(\d+)\s*(?:inch|inches|in|\"|”)/g, "$1\"");
    var fields = {};
    var notes = [];
    var m;

    m = t.match(/(\d+(?:\.\d+)?)\s*(?:'|x|by|×)\s*(?:by\s*)?(\d+(?:\.\d+)?)/);
    if (m && /size|garage|pad|building|proposed|existing|it.?s|measure|wide|deep|by/.test(t) || (m && !/door|slab|thick/.test(t))) {
      if (m) {
        var a = parseFloat(m[1]), b = parseFloat(m[2]);
        if (/proposed/.test(t)) {
          fields.proposedW = a; fields.proposedD = b;
        } else if (/pad|slab/.test(t) && !/door/.test(t)) {
          fields.padL = a; fields.padW = b;
        } else if (/apron/.test(t)) {
          fields.apronL = a; fields.apronW = b;
        } else if (/drive/.test(t)) {
          fields.driveL = a; fields.driveW = b;
        } else {
          fields.width = a; fields.depth = b;
        }
      }
    }

    m = t.match(/(?:width|wide)\s*(?:is|of|at)?\s*(\d+(?:\.\d+)?)/);
    if (m) fields.width = parseFloat(m[1]);
    m = t.match(/(?:depth|deep|long(?:itude)?)\s*(?:is|of|at)?\s*(\d+(?:\.\d+)?)/);
    if (m) fields.depth = parseFloat(m[1]);
    m = t.match(/(?:height|tall|wall height)\s*(?:is|of|at)?\s*(\d+(?:\.\d+)?)/);
    if (m) fields.height = parseFloat(m[1]);

    m = t.match(/(\d+(?:\.\d+)?)\s*'\s*(?:overhead|oh|garage)?\s*door/);
    if (!m) m = t.match(/(?:overhead|oh|garage)\s*door\s*(?:is|of|at)?\s*(\d+(?:\.\d+)?)/);
    if (!m) m = t.match(/(\d+(?:\.\d+)?)\s*(?:foot|ft)?\s*door/);
    if (m) fields.ohDoor = parseFloat(m[1]);

    m = t.match(/(?:service|man|entry|walk)\s*door\s*(?:is|of|at)?\s*(\d+(?:\.\d+)?)/);
    if (m) fields.svcDoor = parseFloat(m[1]);
    if (/\b36\s*\"?\s*service|\bservice door\b/.test(t) && fields.svcDoor == null) fields.svcDoor = 3;

    function setback(side, keys) {
      var re = new RegExp("(?:set\\s*back|setback|from the house|from house)\\s*(?:on the |to the |the )?(?:" + keys + ")\\s*(?:is|of|at)?\\s*(\\d+(?:\\.\\d+)?)", "i");
      var mm = t.match(re);
      if (!mm) mm = t.match(new RegExp("(?:" + keys + ")\\s*(?:set\\s*back|setback)\\s*(?:is|of|at)?\\s*(\\d+(?:\\.\\d+)?)", "i"));
      if (mm) fields[side] = parseFloat(mm[1]);
    }
    setback("setL", "left");
    setback("setR", "right");
    setback("setRear", "rear|back");
    setback("setFront", "front");
    m = t.match(/(?:from the house|from house|off the house)\s*(?:is|of|at)?\s*(\d+(?:\.\d+)?)/);
    if (m) fields.setFront = parseFloat(m[1]);

    m = t.match(/(\d+(?:\.\d+)?)\s*\"?\s*(?:inch )?slab|(?:slab|thickness|thick(?:ness)?)\s*(?:is|of|at)?\s*(\d+(?:\.\d+)?)/);
    if (m) fields.padThk = parseFloat(m[1] || m[2]);

    if (/\bdemo\b|\bdemolition\b/.test(t)) notes.push("Demolition mentioned on site.");
    if (/retain(?:ing)?\s*wall/.test(t)) notes.push("Retaining wall mentioned — record total inches on the estimate (first 6\" free).");
    if (/overhead (?:wire|line|cable)|power line/.test(t)) notes.push("Overhead wires noted.");
    if (/\btree|low limb/.test(t)) notes.push("Trees or limbs noted.");

    return { raw: raw, fields: fields, notes: notes };
  }

  function fieldMapToChecklist(fields, visit) {
    var f = fields || {};
    var v = visit || {};
    var meas = v.measurements || [];
    function hasLabel(re) {
      return meas.some(function (m) { return re.test(m.label || "") && m.feet > 0; });
    }
    function hasPad() {
      return (v.pads || []).length > 0 || f.padL || hasLabel(/pad/i);
    }
    return {
      existW: f.width || hasLabel(/^width$/i) || v.width,
      existD: f.depth || hasLabel(/^depth$/i) || v.depth,
      existH: f.height || hasLabel(/height/i) || v.height,
      ohDoor: f.ohDoor || hasLabel(/overhead/i),
      svcDoor: f.svcDoor || hasLabel(/service/i),
      setL: f.setL || hasLabel(/left/i),
      setR: f.setR || hasLabel(/right/i),
      setRear: f.setRear || hasLabel(/rear/i),
      setFront: f.setFront || hasLabel(/front|house/i),
      pad: hasPad(),
      padThk: f.padThk || (v.pads || []).some(function (p) { return p.thicknessIn > 0; }),
      apron: f.apronL || hasLabel(/apron/i) || (v.pads || []).some(function (p) { return p.type === "apron"; }),
      proposed: (f.proposedW && f.proposedD) || (v.proposedW && v.proposedD),
      photos: (v.photos && v.photos.length > 0) || (v.photoCount > 0),
      grade: !!(v.gradeNote || (v.notes && /grade|retain|drain|slope/i.test(v.notes))),
      wires: !!(v.wiresNote || (v.notes && /wire|tree|limb|obstacle/i.test(v.notes)))
    };
  }

  function missingMeasurements(visit) {
    var present = fieldMapToChecklist((visit && visit.fields) || {}, visit);
    return CHECKLIST.filter(function (c) { return !present[c.id]; }).map(function (c) {
      return { id: c.id, label: c.label, group: c.group };
    });
  }

  /* Compare proposed/measured numbers to limits the user typed. Never invents village code. */
  function compareToLimits(proposed, limits) {
    var out = [];
    if (!limits) return out;
    var sf = proposed && proposed.width > 0 && proposed.depth > 0 ? proposed.width * proposed.depth : null;
    if (limits.maxSf && sf != null) {
      out.push({
        id: "sf",
        ok: sf <= limits.maxSf + 1e-6,
        detail: "Proposed " + round1(sf) + " SF vs max " + limits.maxSf + " SF you entered."
      });
    }
    if (limits.maxHeight && proposed && proposed.height) {
      out.push({
        id: "height",
        ok: proposed.height <= limits.maxHeight + 1e-6,
        detail: "Proposed height " + formatFeetInches(proposed.height) + " vs max " + formatFeetInches(limits.maxHeight) + " you entered."
      });
    }
    ["left", "right", "rear", "front"].forEach(function (side) {
      var min = limits["min" + side.charAt(0).toUpperCase() + side.slice(1)];
      var got = proposed && proposed["set" + side.charAt(0).toUpperCase() + side.slice(1)];
      if (min != null && got != null) {
        out.push({
          id: "set-" + side,
          ok: got + 1e-6 >= min,
          detail: cap(side) + " setback " + formatFeetInches(got) + " vs minimum " + formatFeetInches(min) + " you entered."
        });
      }
    });
    return out;
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function sizesThatFit(availW, availD, sizes) {
    var list = sizes || STANDARD_SIZES;
    return list.filter(function (s) {
      return s[0] <= availW + 1e-6 && s[1] <= availD + 1e-6;
    }).map(function (s) {
      return { width: s[0], depth: s[1], sf: s[0] * s[1] };
    });
  }

  function layoutRect(opts) {
    var lotW = opts.lotW, lotD = opts.lotD;
    var sl = opts.setLeft || 0, sr = opts.setRight || 0, sfront = opts.setFront || 0, srear = opts.setRear || 0;
    var gw = opts.garageW, gd = opts.garageD;
    var place = opts.placement || "center"; /* left, center, right */
    var availW = lotW - sl - sr;
    var availD = lotD - sfront - srear;
    var fits = gw <= availW + 1e-6 && gd <= availD + 1e-6;
    var x = sl;
    if (place === "center") x = sl + (availW - gw) / 2;
    if (place === "right") x = lotW - sr - gw;
    var y = sfront;
    if (opts.towardRear) y = lotD - srear - gd;
    return {
      lot: { x: 0, y: 0, w: lotW, d: lotD },
      setbacks: { left: sl, right: sr, front: sfront, rear: srear },
      available: { w: availW, d: availD },
      garage: { x: x, y: y, w: gw, d: gd },
      fits: fits
    };
  }

  function buildVisitSummary(visit) {
    var v = visit || {};
    var lines = [];
    var name = v.jobName || "Site visit";
    var village = v.village ? " — " + v.village : "";
    lines.push(name + village + ".");
    if (v.width && v.depth) {
      lines.push("Existing garage " + formatFeetInches(v.width) + " x " + formatFeetInches(v.depth) +
        (v.height ? ", wall height " + formatFeetInches(v.height) : "") + ".");
    }
    if (v.ohDoor) lines.push("Overhead door " + formatFeetInches(v.ohDoor) + ".");
    if (v.svcDoor) lines.push("Service door " + formatFeetInches(v.svcDoor) + ".");
    var sets = [];
    if (v.setL) sets.push("left " + formatFeetInches(v.setL));
    if (v.setR) sets.push("right " + formatFeetInches(v.setR));
    if (v.setRear) sets.push("rear " + formatFeetInches(v.setRear));
    if (v.setFront) sets.push("from house " + formatFeetInches(v.setFront));
    if (sets.length) lines.push("Setbacks: " + sets.join(", ") + ".");
    if (v.proposedW && v.proposedD) {
      lines.push("Proposed " + formatFeetInches(v.proposedW) + " x " + formatFeetInches(v.proposedD) +
        " (" + round1(v.proposedW * v.proposedD) + " SF).");
    }
    var pads = v.pads || [];
    if (pads.length) {
      var tot = totalYards(pads);
      pads.forEach(function (p) {
        var bit = (p.label || p.type || "Area") + " " + formatFeetInches(p.lengthFt) + " x " +
          formatFeetInches(p.widthFt) + " = " + round1(p.areaSqFt) + " SF";
        if (p.thicknessIn) bit += ", " + p.thicknessIn + "\" thick ≈ " + round2(cubicYards(p.areaSqFt, p.thicknessIn, p.wastePct)) + " CY";
        lines.push(bit + ".");
      });
      if (tot.count > 1 && tot.yards) lines.push("Concrete total ≈ " + round2(tot.yards) + " CY (not a price).");
    }
    if (v.notes) lines.push(String(v.notes).trim());
    (v.extraNotes || []).forEach(function (n) { if (n) lines.push(n); });
    var missing = missingMeasurements(v);
    if (missing.length) {
      lines.push("Still need: " + missing.map(function (m) { return m.label; }).join(", ") + ".");
    } else {
      lines.push("Core on-site measurements are filled in.");
    }
    return lines.join(" ");
  }

  function buildEstimateNotes(visit) {
    var s = buildVisitSummary(visit);
    return "On-site measure: " + s + " Confirm all figures on the estimate before pricing.";
  }

  function buildPermitNotes(visit) {
    var v = visit || {};
    var parts = [];
    if (v.proposedW && v.proposedD) parts.push("Proposed detached garage " + formatFeetInches(v.proposedW) + " x " + formatFeetInches(v.proposedD));
    else if (v.width && v.depth) parts.push("Garage " + formatFeetInches(v.width) + " x " + formatFeetInches(v.depth));
    if (v.height) parts.push("wall height " + formatFeetInches(v.height));
    if (v.ohDoor) parts.push("OH door " + formatFeetInches(v.ohDoor));
    var sets = [];
    if (v.setL) sets.push("L " + formatFeetInches(v.setL));
    if (v.setR) sets.push("R " + formatFeetInches(v.setR));
    if (v.setRear) sets.push("rear " + formatFeetInches(v.setRear));
    if (v.setFront) sets.push("from house " + formatFeetInches(v.setFront));
    if (sets.length) parts.push("setbacks " + sets.join(", "));
    var pads = (v.pads || []).filter(function (p) { return /pad|proposed/i.test(p.type || "") || /pad/i.test(p.label || ""); });
    if (pads[0] && pads[0].thicknessIn) parts.push("slab " + pads[0].thicknessIn + "\"");
    parts.push("From on-site measure. Confirm against the plat and village sheet before filing.");
    return parts.join("; ") + ".";
  }

  /* Orientation: beta ≈ 0 face-up flat, beta ≈ 90 upright. */
  function phonePose(beta, gamma, opts) {
    opts = opts || {};
    var flatMax = opts.flatMax == null ? 35 : opts.flatMax;
    var uprightMin = opts.uprightMin == null ? 55 : opts.uprightMin;
    var b = Math.abs(Number(beta));
    if (!isFinite(b)) return "unknown";
    if (b <= flatMax) return "flat";
    if (b >= uprightMin) return "upright";
    return "tilted";
  }

  function walkTransition(prevPose, nextPose) {
    if (prevPose !== "flat" && nextPose === "flat") return "start";
    if (prevPose === "flat" && nextPose === "upright") return "stop";
    return "none";
  }

  function estimateWalkSteps(stepCount, strideFt) {
    var stride = strideFt > 0 ? strideFt : 2.4;
    var steps = Math.max(0, stepCount || 0);
    return { feet: steps * stride, steps: steps, strideFt: stride, method: "steps", grade: "rough" };
  }

  function haversineFeet(lat1, lon1, lat2, lon2) {
    var R = 20902231; /* Earth radius in feet */
    var toR = Math.PI / 180;
    var dLat = (lat2 - lat1) * toR;
    var dLon = (lon2 - lon1) * toR;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * toR) * Math.cos(lat2 * toR) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function estimateWalkGps(points) {
    if (!points || points.length < 2) return null;
    var feet = 0;
    for (var i = 1; i < points.length; i++) {
      feet += haversineFeet(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon);
    }
    var acc = points.reduce(function (s, p) { return s + (p.accuracyFt || p.accuracyM * 3.28084 || 0); }, 0) / points.length;
    return { feet: feet, method: "gps", grade: "rough", accuracyFt: acc };
  }

  /* Typical phone IMU double-integration error over a short walk (order-of-magnitude test). */
  function simulateImuDrift(trueFeet, durationSec, accelNoise, accelBias) {
    var dt = 0.02;
    var steps = Math.max(1, Math.round(durationSec / dt));
    var n = accelNoise == null ? 0.12 : accelNoise; /* m/s² white noise */
    var bias = accelBias == null ? 0.06 : accelBias; /* m/s² uncorrected bias, typical phone */
    var trueM = trueFeet * 0.3048;
    var v = 0, p = 0, t, noise, aTrue;
    var speed = trueM / durationSec;
    for (var i = 0; i < steps; i++) {
      t = i * dt;
      aTrue = 0;
      if (t < 0.4) aTrue = speed / 0.4;
      else if (t > durationSec - 0.4) aTrue = -speed / 0.4;
      noise = (pseudo(i + 1 + trueFeet) - 0.5) * 2 * n;
      v += (aTrue + noise + bias) * dt;
      p += v * dt;
    }
    var estFt = p / 0.3048;
    return { trueFeet: trueFeet, estimatedFeet: estFt, errorFeet: estFt - trueFeet, method: "imu-integration" };
  }

  function pseudo(i) {
    var x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function detectSteps(samples, opts) {
    opts = opts || {};
    var minInterval = opts.minIntervalMs || 300;
    var thresh = opts.threshold == null ? 1.1 : opts.threshold;
    var last = -1e9;
    var steps = 0;
    var above = false;
    for (var i = 0; i < samples.length; i++) {
      var s = samples[i];
      var mag = s.mag;
      if (mag >= thresh && !above && (s.t - last) >= minInterval) {
        steps++;
        last = s.t;
        above = true;
      } else if (mag < thresh * 0.6) {
        above = false;
      }
    }
    return steps;
  }

  /* Accuracy copy shown in the UI. */
  var ACCURACY = {
    photoScale: "Photo measure with a 2-point reference is reliable only on the same flat plane as the reference (the door or tape). Expect a few inches of error when the camera is reasonably square to that plane; off-angle shots and anything that recedes in the photo (the side wall, the slab in the same picture) will be off.",
    photoPlane: "Marking all 4 corners of a door of known width and height maps that whole wall. Distances on that wall are much better, including height. It still does not measure the ground or a side wall in the same photo.",
    walkSteps: "Walk mode counts steps and uses your stride. On a 20–24 ft garage, a missed step or a slightly long/short stride is often off by about 2–6 feet. Rough estimate only — never for pricing.",
    walkGps: "GPS on a phone is typically off by 10–16 feet (often more next to a building). It is not useful for garage-length measurements. It may be a rough check only on longer site distances.",
    walkImu: "The phone's motion sensors drift several feet over a short walk when used alone. Not used as the reported distance.",
    arWebXR: "On Android Chrome, live AR hit-test measuring can be within a couple of inches on a textured surface in good light, sometimes closer. Shiny, blank, or dark surfaces are worse. Confirm tight numbers with a tape.",
    arIos: "iPhone Safari cannot run WebXR AR. For true walk-to-corner accuracy like Apple's Measure app, a native iOS app using ARKit (and LiDAR on a 16 Pro Max) would be required. This page uses photo measure instead."
  };

  return {
    REFS: REFS,
    DOOR_HEIGHTS: DOOR_HEIGHTS,
    MEASURE_LABELS: MEASURE_LABELS,
    PAD_TYPES: PAD_TYPES,
    STANDARD_SIZES: STANDARD_SIZES,
    CHECKLIST: CHECKLIST,
    ACCURACY: ACCURACY,
    clamp: clamp,
    almostEqual: almostEqual,
    dist: dist,
    formatFeetInches: formatFeetInches,
    formatFeetInchesLong: formatFeetInchesLong,
    parseFeetInches: parseFeetInches,
    scaleFromReference: scaleFromReference,
    measureScaled: measureScaled,
    solveLinearSystem: solveLinearSystem,
    findHomography: findHomography,
    applyHomography: applyHomography,
    planeFromDoor: planeFromDoor,
    measureOnPlane: measureOnPlane,
    shoelace: shoelace,
    rectangleArea: rectangleArea,
    cubicYards: cubicYards,
    cubicYardsParts: cubicYardsParts,
    totalYards: totalYards,
    round2: round2,
    round1: round1,
    parseVoice: parseVoice,
    fieldMapToChecklist: fieldMapToChecklist,
    missingMeasurements: missingMeasurements,
    compareToLimits: compareToLimits,
    sizesThatFit: sizesThatFit,
    layoutRect: layoutRect,
    buildVisitSummary: buildVisitSummary,
    buildEstimateNotes: buildEstimateNotes,
    buildPermitNotes: buildPermitNotes,
    phonePose: phonePose,
    walkTransition: walkTransition,
    estimateWalkSteps: estimateWalkSteps,
    haversineFeet: haversineFeet,
    estimateWalkGps: estimateWalkGps,
    simulateImuDrift: simulateImuDrift,
    detectSteps: detectSteps
  };
});
