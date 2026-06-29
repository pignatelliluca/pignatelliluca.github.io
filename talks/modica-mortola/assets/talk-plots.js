/* =============================================================================
   talk-plots.js — all canvas figures for the Modica–Mortola talk.

   - Hi-DPI: every canvas is rendered at SS× its CSS size, so it stays crisp when
     reveal scales the slide up to a 16:9 projector / fullscreen.
   - Curves lift the pen when they leave the plot window (no horizontal smear
     along the top edge).
   - Palette: A #2563eb (blue), B #ea7317 (orange), accent #0f766e (teal),
     markers #dc2626 (red).
   ============================================================================= */
(function () {
  "use strict";

  const A_BLUE = "#2563eb", B_ORANGE = "#ea7317", TEAL = "#0f766e",
        RED = "#dc2626", AXIS = "#c7ccd1", GRID = "#eef0f2", INK = "#1f2933", MUTED = "#6b7280";
  const SS = 3;  // supersample factor for crispness

  // hi-dpi context: returns logical {w,h,ctx} with the context pre-scaled by SS.
  function ctx2d(canvas) {
    if (!canvas.dataset.lw) {
      canvas.dataset.lw = canvas.width; canvas.dataset.lh = canvas.height;
      canvas.style.width = canvas.width + "px"; canvas.style.height = canvas.height + "px";
      canvas.width = Math.round(canvas.width * SS); canvas.height = Math.round(canvas.height * SS);
    }
    const w = +canvas.dataset.lw, h = +canvas.dataset.lh;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(SS, 0, 0, SS, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { w, h, ctx };
  }

  function Plot(canvas, xmin, xmax, ymin, ymax, pad) {
    const { w, h, ctx } = ctx2d(canvas);
    pad = Object.assign({ l: 30, r: 12, t: 14, b: 24 }, pad || {});
    const X = x => pad.l + (x - xmin) / (xmax - xmin) * (w - pad.l - pad.r);
    const Y = y => h - pad.b - (y - ymin) / (ymax - ymin) * (h - pad.t - pad.b);
    ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.font = "12px Inter, sans-serif";
    function axes() {
      ctx.strokeStyle = AXIS; ctx.lineWidth = 1;
      const y0 = (ymin <= 0 && ymax >= 0) ? 0 : ymin;
      ctx.beginPath(); ctx.moveTo(X(xmin), Y(y0)); ctx.lineTo(X(xmax), Y(y0)); ctx.stroke();
      const x0 = (xmin <= 0 && xmax >= 0) ? 0 : xmin;
      ctx.beginPath(); ctx.moveTo(X(x0), Y(ymin)); ctx.lineTo(X(x0), Y(ymax)); ctx.stroke();
    }
    function curve(f, color, lw, n) {
      n = n || 700; ctx.strokeStyle = color; ctx.lineWidth = lw || 2.6;
      ctx.beginPath(); let pen = false;
      for (let i = 0; i <= n; i++) {
        const x = xmin + (xmax - xmin) * i / n, y = f(x);
        const inR = isFinite(y) && y >= ymin && y <= ymax;
        if (inR) { if (!pen) { ctx.moveTo(X(x), Y(y)); pen = true; } else ctx.lineTo(X(x), Y(y)); }
        else if (pen) {           // exit: draw to the clamped boundary, then lift
          const yc = Math.max(ymin, Math.min(ymax, y));
          if (isFinite(yc)) ctx.lineTo(X(x), Y(yc));
          ctx.stroke(); ctx.beginPath(); pen = false;
        }
      }
      ctx.stroke();
    }
    function dash(x1, y1, x2, y2, color) {
      ctx.save(); ctx.strokeStyle = color || "#9aa3ad"; ctx.lineWidth = 1.3; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(X(x1), Y(y1)); ctx.lineTo(X(x2), Y(y2)); ctx.stroke(); ctx.restore();
    }
    function dot(x, y, color, r) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X(x), Y(y), (r || 4.5), 0, 2 * Math.PI); ctx.fill(); }
    function text(x, y, s, color, align, px) {
      ctx.fillStyle = color || INK; ctx.font = (px || 12) + "px Inter, sans-serif";
      ctx.textAlign = align || "left"; ctx.fillText(s, X(x), Y(y)); ctx.textAlign = "left";
    }
    function tick(x, s) { ctx.fillStyle = MUTED; ctx.font = "11px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText(s, X(x), h - pad.b + 14); ctx.textAlign = "left"; }
    return { w, h, ctx, X, Y, axes, curve, dash, dot, text, tick };
  }

  // ---- numerics ----------------------------------------------------------
  const xlnx = x => (x <= 1e-12 ? 0 : x * Math.log(x));
  const fFH = (p, chi) => xlnx(p) + xlnx(1 - p) + chi * p * (1 - p);
  function binodalSym(chi) {
    if (chi <= 2) return [0.5, 0.5];
    const df = p => Math.log(p) - Math.log(1 - p) + chi * (1 - 2 * p);
    let lo = 1e-6, hi = 0.5 - 1e-9, prev = df(lo);
    for (let i = 1; i <= 2000; i++) {
      const p = lo + (hi - lo) * i / 2000, cur = df(p);
      if ((prev < 0) !== (cur < 0)) {
        let a = lo + (hi - lo) * (i - 1) / 2000, b = p;
        for (let k = 0; k < 60; k++) { const m = 0.5 * (a + b); if ((df(a) < 0) !== (df(m) < 0)) b = m; else a = m; }
        return [0.5 * (a + b), 1 - 0.5 * (a + b)];
      }
      prev = cur;
    }
    return [0.5, 0.5];
  }

  // =========================================================================
  //  S2 — quartic double well
  // =========================================================================
  function drawWell(cv) {
    const P = Plot(cv, -1.9, 1.9, -0.5, 3.6);
    P.axes();
    P.curve(u => (u * u - 1) * (u * u - 1), A_BLUE, 3.2);
    P.dot(-1, 0, RED, 5); P.dot(1, 0, RED, 5);
  }

  // =========================================================================
  //  S7 — mixing: pure A, pure B, and interactive mix
  // =========================================================================
  let mixCells = null;
  const COLS = 24, ROWS = 32, FRACA = 0.5;
  function ensureCells() {
    if (mixCells) return;
    mixCells = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++)
      mixCells.push({ r, c, sep: (r < ROWS * FRACA) ? "A" : "B", mixed: Math.random() < FRACA ? "A" : "B", thr: Math.random() });
  }
  function paintGrid(cv, labelOf) {
    const { w, h, ctx } = ctx2d(cv);
    ensureCells();
    const mx = 8, my = 8, cw = (w - 2 * mx) / COLS, ch = (h - 2 * my) / ROWS, rad = Math.min(cw, ch) * 0.34;
    for (const cell of mixCells) {
      ctx.fillStyle = labelOf(cell) === "A" ? A_BLUE : B_ORANGE;
      ctx.beginPath(); ctx.arc(mx + (cell.c + 0.5) * cw, my + (cell.r + 0.5) * ch, rad, 0, 2 * Math.PI); ctx.fill();
    }
  }
  const drawPureA = cv => paintGrid(cv, () => "A");
  const drawPureB = cv => paintGrid(cv, () => "B");
  const drawMix   = (cv, mix) => paintGrid(cv, cell => (mix > cell.thr ? cell.mixed : cell.sep));

  // =========================================================================
  //  S9 — binary entropy with marker + dotted lines at φ=1/2
  // =========================================================================
  function drawEntropy(cv) {
    const ln2 = Math.log(2), P = Plot(cv, 0, 1, 0, ln2 * 1.18);
    P.axes();
    P.curve(p => -(xlnx(p) + xlnx(1 - p)), A_BLUE, 3);
    P.dash(0.5, 0, 0.5, ln2, "#9aa3ad");   // vertical at 1/2
    P.dash(0, ln2, 0.5, ln2, "#9aa3ad");   // horizontal to ln2
    P.dot(0.5, ln2, RED, 5);
    P.text(0.015, ln2+0.01, "ln 2", MUTED, "left", 12);
    P.tick(0.5, "1/2"); P.tick(1, "1");
  }

  // =========================================================================
  //  S11 — ΔF(φ) with χ slider
  // =========================================================================
  function drawDF(cv, chi) {
    const P = Plot(cv, 0, 1, -0.9, 0.18);   // headroom so the χ≈3.35 hump never clips
    P.axes();
    P.curve(p => fFH(p, chi), A_BLUE, 3);
    if (chi > 2) { const [a, b] = binodalSym(chi); P.dot(a, fFH(a, chi), RED, 5); P.dot(b, fFH(b, chi), RED, 5); }
    else P.dot(0.5, fFH(0.5, chi), RED, 5);
  }

  // =========================================================================
  //  S12 — χ_c(φ) = ½(1/φ + 1/(1-φ)), tall y to show the asymptote
  // =========================================================================
  function drawChiC(cv) {
    const P = Plot(cv, 0, 1, 0, 10);
    P.axes();
    P.curve(p => 0.5 * (1 / p + 1 / (1 - p)), A_BLUE, 3, 1200);
    P.dash(0.5, 0, 0.5, 2, RED); P.dash(0, 2, 0.5, 2, RED);
    P.dot(0.5, 2, RED, 5);
    P.text(0.015, 2, "2", RED, "left", 13);
    P.tick(0.5, "1/2"); P.tick(1, "1");
  }

  // =========================================================================
  //  S14 — W = F - min F (slider), and bifurcation diagram
  // =========================================================================
  function drawWellW(cv, chi) {
    const P = Plot(cv, 0, 1, -0.02, 0.34);
    P.axes();
    if (chi <= 2) { const m = fFH(0.5, chi); P.curve(p => fFH(p, chi) - m, A_BLUE, 3); P.dot(0.5, 0, RED, 5); }
    else { const [a, b] = binodalSym(chi), m = fFH(a, chi); P.curve(p => fFH(p, chi) - m, A_BLUE, 3); P.dot(a, 0, RED, 5); P.dot(b, 0, RED, 5); }
  }
  function drawPhasePlane(cv) {
    const P = Plot(cv, 0, 1, 1, 5);  // x=φ, y=χ ; stem visible for χ∈[1,2]
    P.axes();
    P.ctx.strokeStyle = A_BLUE; P.ctx.lineWidth = 2.6;
    for (const side of [0, 1]) {
      P.ctx.beginPath(); let started = false;
      for (let i = 0; i <= 240; i++) { const chi = 2 + 3 * i / 240, b = binodalSym(chi)[side];
        if (!started) { P.ctx.moveTo(P.X(b), P.Y(chi)); started = true; } else P.ctx.lineTo(P.X(b), P.Y(chi)); }
      P.ctx.stroke();
    }
    P.ctx.strokeStyle = MUTED; P.ctx.lineWidth = 1.8;
    P.ctx.beginPath(); P.ctx.moveTo(P.X(0.5), P.Y(1)); P.ctx.lineTo(P.X(0.5), P.Y(2)); P.ctx.stroke();
    P.dash(0.5, 2, 0.5, 5, "#9aa3ad");
    P.dot(0.5, 2, RED, 5);
    P.text(0.55, 2.08, "χ_c = 2", RED, "left", 13);
    // axis names + ticks
    P.text(0.03, 4.72, "χ", INK, "left", 16);
    P.text(0.94, 1.2, "φ", INK, "left", 16);
    P.tick(0, "0"); P.tick(0.5, "1/2"); P.tick(1, "1");
    // region annotations
    P.text(0.5, 3.7, "2 phases", MUTED, "center", 12);
    P.text(0.5, 1.45, "1 phase", MUTED, "center", 12);
  }

  // =========================================================================
  //  S15 — polymer mixtures: F + common tangent, W, χ_c spinodal
  // =========================================================================
  const fPoly = (p, chi, nA, nB) => xlnx(p) / nA + xlnx(1 - p) / nB + chi * p * (1 - p);
  function commonTangent(chi, nA, nB) {
    const N = 500, xs = [], ys = [];
    for (let i = 1; i < N; i++) { const p = i / N; xs.push(p); ys.push(fPoly(p, chi, nA, nB)); }
    const hull = [];
    for (let i = 0; i < xs.length; i++) {
      while (hull.length >= 2) { const [x1, y1] = hull[hull.length - 2], [x2, y2] = hull[hull.length - 1];
        if ((x2 - x1) * (ys[i] - y1) - (y2 - y1) * (xs[i] - x1) <= 0) hull.pop(); else break; }
      hull.push([xs[i], ys[i]]);
    }
    let best = null, gap = 0;
    for (let i = 0; i + 1 < hull.length; i++) { const g = hull[i + 1][0] - hull[i][0]; if (g > gap) { gap = g; best = [hull[i], hull[i + 1]]; } }
    if (!best || gap < 0.02) return null;
    const [[p1, F1], [p2, F2]] = best, mu = (F2 - F1) / (p2 - p1), b = F1 - mu * p1;
    return { p1, p2, mu, b };
  }
  function drawPolyF(cv, chi, nA, nB) {
    // adaptive y-range, but ALWAYS containing y=0 so the x-axis is drawn in the
    // correct place (for n_A=n_B=1, F<0 on all of (0,1), so 0 must be forced in).
    let lo = Infinity, hi = -Infinity; for (let i = 1; i < 100; i++) { const v = fPoly(i / 100, chi, nA, nB); if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
    const span = hi - lo + 1e-3, pad = 0.12 * span;
    const P = Plot(cv, 0, 1, Math.min(lo - pad, -0.04 * span), Math.max(hi + pad, 0.08 * span));
    P.axes();
    P.curve(p => fPoly(p, chi, nA, nB), A_BLUE, 3);
    const ct = commonTangent(chi, nA, nB);
    if (ct) { P.ctx.strokeStyle = RED; P.ctx.lineWidth = 1.8;
      P.ctx.beginPath(); P.ctx.moveTo(P.X(ct.p1), P.Y(ct.mu * ct.p1 + ct.b)); P.ctx.lineTo(P.X(ct.p2), P.Y(ct.mu * ct.p2 + ct.b)); P.ctx.stroke();
      P.dot(ct.p1, fPoly(ct.p1, chi, nA, nB), RED, 5); P.dot(ct.p2, fPoly(ct.p2, chi, nA, nB), RED, 5);
    } else { // single minimum: mark it
      let pm = 0.5, fm = Infinity; for (let i = 1; i < 200; i++) { const p = i / 200, v = fPoly(p, chi, nA, nB); if (v < fm) { fm = v; pm = p; } }
      P.dot(pm, fm, RED, 5);
    }
  }
  function drawPolyW(cv, chi, nA, nB) {
    const ct = commonTangent(chi, nA, nB);
    const g = p => ct ? fPoly(p, chi, nA, nB) - (ct.mu * p + ct.b) : null;
    let hi = 0.34;
    if (ct) { hi = 0; for (let i = 1; i < 100; i++) hi = Math.max(hi, g(i / 100)); hi *= 1.15; }
    const P = Plot(cv, 0, 1, -0.02 * (hi || 0.34) - 0.005, (hi || 0.34));
    P.axes();
    if (ct) { P.curve(g, A_BLUE, 3); P.dot(ct.p1, 0, RED, 5); P.dot(ct.p2, 0, RED, 5); }
    else { let pm = 0.5, fm = Infinity; for (let i = 1; i < 200; i++) { const p = i / 200, v = fPoly(p, chi, nA, nB); if (v < fm) { fm = v; pm = p; } }
      P.curve(p => fPoly(p, chi, nA, nB) - fm, A_BLUE, 3); P.dot(pm, 0, RED, 5); }
  }
  function drawChiCpoly(cv, nA, nB) {
    const P = Plot(cv, 0, 1, 0, 8);
    P.axes();
    P.curve(p => 0.5 * (1 / (nA * p) + 1 / (nB * (1 - p))), A_BLUE, 3, 1200);
    const chic = 0.5 * Math.pow(1 / Math.sqrt(nA) + 1 / Math.sqrt(nB), 2);
    const pstar = Math.sqrt(nB) / (Math.sqrt(nA) + Math.sqrt(nB));
    if (chic <= 8) { P.dash(pstar, 0, pstar, chic, RED); P.dash(0, chic, pstar, chic, RED); P.dot(pstar, chic, RED, 5);
      P.text(0.04, Math.min(chic, 7.4), "χ_c=" + chic.toFixed(2), RED, "left", 12); }
  }

  // =========================================================================
  //  S19 — Wulff shapes (precomputed frames)
  // =========================================================================
  function drawWulff(cv, idx) {
    const { w, h, ctx } = ctx2d(cv);
    if (!window.WULFF_FRAMES) { ctx.fillStyle = MUTED; ctx.fillText("Wulff data not loaded", 20, 20); return; }
    const D = window.WULFF_FRAMES, fr = D.frames[idx], cx = w / 2, cy = h / 2, S = Math.min(w, h) * 0.34;
    const XY = (x, y) => [cx + x * S, cy - y * S];
    function poly(a, stroke, fill, dashArr, lw) {
      ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.setLineDash(dashArr || []);
      if (fill) ctx.fillStyle = fill;
      ctx.beginPath(); for (let i = 0; i < a.x.length; i++) { const [px, py] = XY(a.x[i], a.y[i]); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.closePath(); if (fill) ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
    }
    poly(D.circle, "#a9c2f0", null, [5, 5], 1.4);
    poly(D.square, "#f0c9a9", null, [5, 5], 1.4);
    poly(fr, TEAL, "rgba(15,118,110,0.10)", [], 3);
  }

  // =========================================================================
  //  S20 — polar err_nn, err_nnn (each normalised so its max radius = 1)
  // =========================================================================
  function drawPolar(cv, c2) {
    const { w, h, ctx } = ctx2d(cv);
    const C1 = 1, cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42;
    const eNN = th => C1 * (1 - 0.5 * Math.pow(Math.sin(2 * th), 2));
    const eNNN = th => (C1 + 2 * c2) + (2 * c2 - C1 / 2) * Math.pow(Math.sin(2 * th), 2);
    // normalise each curve by its max POSITIVE (plotted) value, so the largest
    // radius is always 1 — including when err_nnn dips negative (C2 < -0.25).
    let mNN = 1e-6, mNNN = 1e-6;
    for (let i = 0; i < 720; i++) { const th = i * Math.PI / 360; mNN = Math.max(mNN, eNN(th)); mNNN = Math.max(mNNN, eNNN(th)); }
    ctx.strokeStyle = GRID_C(); ctx.lineWidth = 1;
    for (const f of [0.5, 1.0]) { ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, 2 * Math.PI); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
    function pc(f, mx, color) {
      ctx.strokeStyle = color; ctx.lineWidth = 2.6; ctx.beginPath();
      for (let i = 0; i <= 720; i++) { const th = i * Math.PI / 360, r = Math.max(0, f(th)) / (mx || 1) * R;
        const px = cx + r * Math.cos(th), py = cy - r * Math.sin(th); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.closePath(); ctx.stroke();
    }
    pc(eNN, mNN, MUTED);
    pc(eNNN, mNNN, TEAL);
    ctx.fillStyle = MUTED; ctx.font = "13px Inter, sans-serif"; ctx.fillText("err_nn", 10, 18);
    ctx.fillStyle = TEAL; ctx.fillText("err_nnn", 10, 36);
  }
  function GRID_C() { return "#e6e9ec"; }

  // =========================================================================
  //  Hierarchy widget: K_{2k}(ν) = Σ_b J_b (b·ν)^{2k} for NN / NN+NNN / NN+NNN+NNNN.
  //  Bonds: NN (1,0),(0,1) coupling C1; NNN (1,1),(1,-1) coupling C2;
  //         NNNN (2,0),(0,2) coupling C3.  Each curve normalised by K_{2k}(0).
  // =========================================================================
  function Kpow(p, theta, model, C1, C2, C3) {
    const c = Math.cos(theta), s = Math.sin(theta);
    let v = C1 * (Math.pow(Math.abs(c), p) + Math.pow(Math.abs(s), p));               // NN
    if (model !== "NN") v += C2 * (Math.pow(Math.abs(c + s), p) + Math.pow(Math.abs(c - s), p)); // NNN
    if (model === "NNNN") v += C3 * (Math.pow(Math.abs(2 * c), p) + Math.pow(Math.abs(2 * s), p)); // NNNN
    return v;
  }
  const K_PURPLE = "#7c3aed";
  // angular mean = constant Fourier term (∫_0^{2π} K dθ)/(2π); exact for these trig polys.
  function Kmean(p, model, C1, C2, C3) {
    let s = 0; const N = 720;
    for (let i = 0; i < N; i++) s += Kpow(p, i * 2 * Math.PI / N, model, C1, C2, C3);
    return (s / N) || 1e-9;
  }
  // C1 fixed = 1. Each K_{2k} normalised by its angular mean ⇒ ∫_0^{2π} = 2π exactly;
  // K_2 ≡ 1 (circle). Plot auto-fits so the largest petal never leaves the frame.
  function drawKplot(cv, model, C2, C3) {
    const C1 = 1;
    const { w, h, ctx } = ctx2d(cv);
    const cx = w / 2, cy = h / 2, half = Math.min(w, h) / 2;
    const orders = model === "NN" ? [2, 4] : model === "NNN" ? [2, 4, 6] : [2, 4, 6, 8];
    const colors = { 2: TEAL, 4: A_BLUE, 6: B_ORANGE, 8: K_PURPLE };
    const names  = { 2: "K₂", 4: "K₄", 6: "K₆", 8: "K₈" };
    const mean = {}; orders.forEach(p => mean[p] = Kmean(p, model, C1, C2, C3));
    // FIXED scale (does NOT change with the sliders): the largest petal that can occur
    // over all models / slider ranges is the order-8 anisotropy, with max normalised
    // radius 64/35 ≈ 1.83.  Sizing to that keeps the zoom constant and never clips.
    const unit = half * 0.93 / 1.86;   // pixels per normalised unit (r = 1 ⇒ the circle)
    // reference circle (r = 1) + faint axes
    ctx.strokeStyle = GRID_C(); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, unit, 0, 2 * Math.PI); ctx.stroke();
    ctx.strokeStyle = "#eef0f2"; const ax = half * 0.95;
    ctx.beginPath(); ctx.moveTo(cx - ax, cy); ctx.lineTo(cx + ax, cy); ctx.moveTo(cx, cy - ax); ctx.lineTo(cx, cy + ax); ctx.stroke();
    orders.forEach(p => {
      ctx.strokeStyle = colors[p]; ctx.lineWidth = 2.4; ctx.beginPath();
      for (let i = 0; i <= 360; i++) {
        const th = i * Math.PI / 180, r = Math.max(0, Kpow(p, th, model, C1, C2, C3) / mean[p]) * unit;
        const px = cx + r * Math.cos(th), py = cy - r * Math.sin(th);
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath(); ctx.stroke();
    });
    ctx.font = "13px Inter, sans-serif";
    orders.forEach((p, idx) => { ctx.fillStyle = colors[p]; ctx.fillText(names[p], 10, 18 + idx * 18); });
  }

  // =========================================================================
  //  S22b — fixed point m = tanh((χ/2) m)
  // =========================================================================
  function drawTanh(cv, chi) {
    const P = Plot(cv, -1, 1, -1, 1);
    P.axes();
    P.curve(m => m, MUTED, 1.8);
    P.curve(m => Math.tanh((chi / 2) * m), A_BLUE, 3);
    if (chi > 2) { let m = 0.9; for (let k = 0; k < 300; k++) m = Math.tanh((chi / 2) * m); if (m > 1e-3) { P.dot(m, m, RED, 5); P.dot(-m, -m, RED, 5); } }
    P.dot(0, 0, RED, 5);
  }

  // =========================================================================
  //  wiring
  // =========================================================================
  const $ = id => document.getElementById(id);
  function slider(id, outId, fmt, fn) {
    const s = $(id); if (!s) return; const out = outId ? $(outId) : null;
    const run = () => { const v = parseFloat(s.value); if (out) out.textContent = fmt(v); fn(v); };
    s.addEventListener("input", run); run();
  }

  function init() {
    if ($("wellQuartic")) drawWell($("wellQuartic"));
    if ($("entropyPlot")) drawEntropy($("entropyPlot"));
    if ($("chicPlot")) drawChiC($("chicPlot"));
    if ($("phasePlane")) drawPhasePlane($("phasePlane"));
    if ($("mixA")) drawPureA($("mixA"));
    if ($("mixB")) drawPureB($("mixB"));
    if ($("mixDemo")) slider("mixSlider", "mixVal", v => v.toFixed(2), v => drawMix($("mixDemo"), v));
    if ($("dFPlot")) slider("chiSlider10", "chiVal10", v => v.toFixed(2), v => drawDF($("dFPlot"), v));
    if ($("wellW13")) slider("chiSlider13", "chiVal13", v => v.toFixed(2), v => drawWellW($("wellW13"), v));

    if ($("polyF")) {
      const redraw = () => {
        const chi = +$("chiSlider14").value, nA = +$("nASlider").value, nB = +$("nBSlider").value;
        if ($("chiVal14")) $("chiVal14").textContent = chi.toFixed(2);
        if ($("nAVal")) $("nAVal").textContent = nA; if ($("nBVal")) $("nBVal").textContent = nB;
        drawPolyF($("polyF"), chi, nA, nB); drawPolyW($("polyW"), chi, nA, nB);
        if ($("chicPoly")) drawChiCpoly($("chicPoly"), nA, nB);   // optional (absent in the short deck)
      };
      ["chiSlider14", "nASlider", "nBSlider"].forEach(id => { const s = $(id); if (s) s.addEventListener("input", redraw); });
      redraw();
    }

    if ($("wulffPlot") && window.WULFF_FRAMES) {
      const s = $("wulffChi"); s.max = String(window.WULFF_FRAMES.frames.length - 1);
      const run = () => { const i = parseInt(s.value, 10), fr = window.WULFF_FRAMES.frames[i];
        if ($("wulffVal")) $("wulffVal").textContent = "χ = " + fr.chi + "   ·   σ(45°)/σ(0°) = " + fr.aniso.toFixed(3);
        drawWulff($("wulffPlot"), i); };
      s.addEventListener("input", run); run();
    } else if ($("wulffPlot")) drawWulff($("wulffPlot"), 0);

    if ($("polarPlot")) slider("c2Slider", "c2Val", v => v.toFixed(2), v => drawPolar($("polarPlot"), v));
    if ($("tanhPlot")) slider("chiSlider21", "chiVal21", v => v.toFixed(2), v => drawTanh($("tanhPlot"), v));

    // hierarchy widget (K_2,K_4,K_6,K_8 for NN / NN+NNN / NN+NNN+NNNN; C_1 fixed = 1)
    if ($("kPlot")) {
      const sel = $("kModel"), c2 = $("kC2"), c3 = $("kC3");
      const HI = { NNN: { c2: 0.25 }, NNNN: { c2: 0.375, c3: 0.03125 } };  // isotropy points
      const placeTick = (input, tickId, val) => {
        const t = $(tickId); if (!t || !input) return;
        const mn = +input.min, mx = +input.max;
        t.style.left = ((val - mn) / (mx - mn) * 100) + "%";
      };
      const upd = () => {
        const model = sel ? sel.value : "NNN";
        if ($("kC2wrap")) $("kC2wrap").style.display = (model === "NN") ? "none" : "";
        if ($("kC3wrap")) $("kC3wrap").style.display = (model === "NNNN") ? "" : "none";
        if ($("kC2v")) $("kC2v").textContent = (+c2.value).toFixed(3);
        if ($("kC3v")) $("kC3v").textContent = (+c3.value).toFixed(4);
        drawKplot($("kPlot"), model, +c2.value, +c3.value);
      };
      const onModel = () => {
        const model = sel.value;
        if (model !== "NN") { c2.value = HI[model].c2; placeTick(c2, "kC2tick", HI[model].c2); }
        if (model === "NNNN") { c3.value = HI.NNNN.c3; placeTick(c3, "kC3tick", HI.NNNN.c3); }
        upd();
      };
      if (sel) sel.addEventListener("change", onModel);
      [c2, c3].forEach(e => { if (e) e.addEventListener("input", upd); });
      placeTick(c2, "kC2tick", HI.NNN.c2);     // initial: model NNN ⇒ C₂ tick at ¼
      placeTick(c3, "kC3tick", HI.NNNN.c3);    // C₃ tick at 1/32 (shown only in NNNN)
      upd();
    }

    // logo: much bigger on title + closing, normal on content slides
    function sizeLogo() {
      const lg = document.querySelector(".slide-logo"); if (!lg) return;
      const cur = (window.Reveal && Reveal.getCurrentSlide) ? Reveal.getCurrentSlide() : null;
      const big = cur && (cur.id === "title-slide" || cur.classList.contains("closing-motif"));
      lg.style.height = lg.style.maxHeight = big ? "185px" : "96px";
    }
    function onSlideChanged(e) {
      sizeLogo();
      // auto-animate leaves its target slide slightly off-centre; re-centre after the morph
      const cur = e && e.currentSlide;
      if (cur && cur.hasAttribute("data-auto-animate")) {
        // reveal pins the auto-animate target's top to match the source; re-centre
        // after reveal's own positioning settles (double rAF), then once more as backstop.
        requestAnimationFrame(() => requestAnimationFrame(() => Reveal.layout()));
        setTimeout(() => Reveal.layout(), 120);
      }
    }
    if (window.Reveal && Reveal.on) { Reveal.on("ready", sizeLogo); Reveal.on("slidechanged", onSlideChanged); }
    sizeLogo();
  }

  if (document.readyState !== "loading") setTimeout(init, 0);
  else document.addEventListener("DOMContentLoaded", init);
})();
