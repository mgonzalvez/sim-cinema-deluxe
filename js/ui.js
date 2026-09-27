/* ============================================================
   SIM CINEMA DELUXE — ui.js
   UI layer: screens, rendering, wiring. All DOM lives here;
   game.js stays DOM-free (it runs headless in tools/).
   ============================================================ */
"use strict";

const UI = (() => {
  const $ = (s) => document.querySelector(s);
  const D = DATA;
  const M = D.money;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- fonts: posters need Bebas Neue loaded ----------
  let fontsReady = false;
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { fontsReady = true; refreshPosters(); });
  } else { fontsReady = true; }

  // ---------- timers (autoplay) ----------
  let prodTimer = null, boTimer = null;
  function stopTimers() {
    if (prodTimer) { clearInterval(prodTimer); prodTimer = null; }
    if (boTimer) { clearInterval(boTimer); boTimer = null; }
  }

  // ---------- toast ----------
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  }

  // ---------- topbar ----------
  function updateTopbar() {
    const s = GAME.studio;
    if (!s) return;
    $("#tb-studio").textContent = s.name;
    const f = s.funds;
    $("#tb-funds").textContent = f < 0 ? "\u2212" + M(-f) : M(f);
    $("#tb-rep").textContent = String(Math.round(s.reputation));
    const n = s.films + (GAME.film || GAME.pendingScript ? 1 : 0);
    $("#tb-film").textContent = "#" + n;
  }

  // ---------- modal ----------
  let modalOpen = false, modalClosable = true;
  function openModal(title, bodyHTML, closable = true) {
    $("#modal-title").textContent = title;
    $("#modal-body").innerHTML = bodyHTML;
    $("#modal-x").hidden = !closable;
    $("#modal").hidden = false;
    modalOpen = true;
    modalClosable = closable;
  }
  function closeModal() {
    if (!modalOpen) return;
    $("#modal").hidden = true;
    modalOpen = false;
    $("#modal-body").innerHTML = "";
    SFX.play.click();
    if (GAME.state === "production" && GAME.pendingEvent) openEventModal();
  }

  // ---------- posters ----------
  function refreshPosters() {
    if (GAME.state === "script") scriptPosters();
    const f = GAME.film;
    if (f && !f.poster && fontsReady) {
      f.poster = Poster.build(f.genre, f.title, GAME.studio ? GAME.studio.name : null);
      GAME.save();
      if (GAME.state !== "script") render();
    }
  }

  function syncBoAuto() {
    const shouldRun = boSpeed !== "bo-1" && GAME.state === "boxoffice" && !GAME.boDone && !modalOpen;
    if (shouldRun && !boTimer) boTimer = setInterval(boTick, +boSpeed);
    else if (!shouldRun && boTimer) { clearInterval(boTimer); boTimer = null; }
  }

  // ---------- router ----------
  const SCREENS = {
    title: "screen-title", studio: "screen-studio", script: "screen-script",
    budget: "screen-budget", casting: "screen-casting", production: "screen-production",
    boxoffice: "screen-boxoffice", results: "screen-results", gameover: "screen-gameover"
  };
  const RENDERERS = {};
  function render() {
    stopTimers();
    const st = GAME.state;
    for (const k in SCREENS) {
      const el = document.getElementById(SCREENS[k]);
      if (el) el.hidden = k !== st;
    }
    $("#topbar").hidden = st === "title";
    updateTopbar();
    if (RENDERERS[st]) RENDERERS[st]();
    if (st === "production") syncProdAuto();
    if (st === "boxoffice") syncBoAuto();
    if (st === "production" && GAME.pendingEvent && !modalOpen) openEventModal();
  }


  const $$ = (s) => Array.from(document.querySelectorAll(s));

  // ============================================================
  // TITLE + STUDIO
  // ============================================================
  function buildMarqueeLights() {
    const el = $("#marquee-lights");
    for (let i = 0; i < 22; i++) el.appendChild(document.createElement("span"));
  }

  RENDERERS.title = function () {
    $("#btn-continue").hidden = !GAME.hasSave();
  };

  // ============================================================
  // SCRIPT / DEVELOPMENT
  // ============================================================
  function scriptPosters() {
    const opts = GAME.S.scriptOptions;
    if (!opts || !fontsReady) return;
    let changed = false;
    for (const o of opts) {
      if (!o.poster) { o.poster = Poster.build(o.genre, o.title, GAME.studio ? GAME.studio.name : null); changed = true; }
    }
    if (changed) { GAME.save(); renderScriptGrid(); }
  }

  function renderScriptGrid() {
    const grid = $("#script-grid");
    const opts = GAME.S.scriptOptions;
    if (!opts) return;
    grid.innerHTML = opts.map((o, i) => {
      const g = D.GENRES[o.genre];
      const poster = o.poster
        ? `<img class="sc-poster" src="${o.poster}" alt="">`
        : `<div class="sc-poster" style="display:flex;align-items:center;justify-content:center;background:#1b1b27;font-size:22px">🎬</div>`;
      return `<div class="script-card ${GAME.S.selectedScript === i ? "selected" : ""}" data-i="${i}" role="button" tabindex="0">
        ${poster}
        <span class="sc-genre">${esc(o.genre)}</span>
        <h3 class="sc-title">${esc(o.title)}</h3>
        <p class="sc-logline">${esc(o.logline)}</p>
        <div class="sc-stats">
          <div><span>Script quality</span><b>${o.quality}/100</b></div>
          <div><span>Development cost</span><b>${M(o.devCost)}</b></div>
          <div><span>Ideal budget</span><b>${M(o.estBudget)}</b></div>
          <div><span>Flavor</span><b>${esc(g.desc)}</b></div>
        </div>
      </div>`;
    }).join("");
    $$(".script-card").forEach((c) => {
      c.addEventListener("click", () => {
        GAME.S.selectedScript = +c.dataset.i;
        SFX.play.select();
        $$(".script-card").forEach((x) => x.classList.toggle("selected", x === c));
        $("#btn-script-go").disabled = false;
      });
    });
  }

  function updateRewriteLabel() {
    const n = GAME.S.rewrites;
    $("#rewrite-val").textContent = `${n} week${n === 1 ? "" : "s"} · +${M(n * 0.3)}`;
  }

  RENDERERS.script = function () {
    scriptPosters();
    renderScriptGrid();
    const r = $("#rewrite-slider");
    if (+r.value !== GAME.S.rewrites) r.value = GAME.S.rewrites;
    updateRewriteLabel();
    $("#btn-script-go").disabled = GAME.S.selectedScript == null;
  };

  // ============================================================
  // BUDGET
  // ============================================================
  function drawBudget() {
    const p = GAME.pendingScript;
    if (!p) return;
    const b = GAME.S.budget;
    $("#budget-amount").textContent = M(b);
    const ratio = b / p.estBudget;
    const fundable = GAME.studio.funds + GAME.creditLimit();
    const over = b > fundable;
    const verdict = ratio < 0.8 ? "Under the ideal — the film will struggle"
      : ratio > 1.25 ? "Way over the ideal — the bank will notice"
      : "In the sweet spot";
    $("#budget-stats").innerHTML = `
      <div class="bstat"><div class="k">Ideal budget</div><div class="v">${M(p.estBudget)}</div></div>
      <div class="bstat"><div class="k">Quality factor</div><div class="v">${GAME.budgetFactor().toFixed(2)}×</div></div>
      <div class="bstat"><div class="k">Production time</div><div class="v">${GAME.productionWeeks()} weeks</div></div>
      <div class="bstat"><div class="k">Projected quality</div><div class="v">${GAME.projectedQuality()}/100</div></div>
      <div class="bstat"><div class="k">Funds + credit</div><div class="v" ${over ? 'style="color:var(--red-soft)"' : ""}>${M(Math.round(fundable * 10) / 10)}${over ? " ⚠" : ""}</div></div>
      <div class="bstat"><div class="k">Bank mood</div><div class="v" style="font-size:13px">${esc(verdict)}</div></div>`;
  }

  RENDERERS.budget = function () {
    const p = GAME.pendingScript;
    if (!p) return;
    $("#budget-sub").textContent = `The deal for "${p.title}" is signed. Set the production budget for a ${p.genre.toLowerCase()}.`;
    const slider = $("#budget-slider");
    if (+slider.value !== GAME.S.budget) slider.value = GAME.S.budget;
    drawBudget();
  };

  // ============================================================
  // CASTING
  // ============================================================
  const SLOTS = [
    ["lead", "Lead"],
    ["co", "Co-Lead"],
    ["sup", "Supporting"],
    ["dir", "Director"]
  ];

  function talentHTML(slot, t, idx) {
    const isDir = slot === "dir";
    const sel = GAME.S.castPicks[slot] === idx;
    return `<div class="talent-card ${sel ? "selected" : ""}" data-slot="${slot}" data-i="${idx}" role="button" tabindex="0">
      <div><span class="t-name">${esc(t.name)}</span><span class="t-tier">${esc(isDir ? "Director" : t.tier)}</span></div>
      <div class="t-meta">
        <span>${isDir ? "score" : "draw"} <b>${isDir ? t.score : t.draw}</b></span>
        ${isDir ? "" : `<span>social <b>${t.social}</b></span>`}
        <span>fee <b>${M(t.cost)}</b></span>
      </div>
      <div class="t-quip">${esc(isDir ? t.style : t.quip)}</div>
    </div>`;
  }

  function updateCastSummary() {
    const o = GAME.S.castOptions, p = GAME.S.castPicks;
    const total = GAME.castTotalCost();
    const fundable = Math.round((GAME.studio.funds + GAME.creditLimit()) * 10) / 10;
    const lines = SLOTS.map(([slot, label]) => {
      const t = p[slot] != null ? o[slot][p[slot]] : null;
      return `<div class="cs-row"><span>${label}</span><b>${t ? esc(t.name) + " · " + M(t.cost) : "—"}</b></div>`;
    }).join("");
    const all = GAME.allCastPicked();
    const ok = all && total <= fundable;
    $("#cast-summary").innerHTML = lines +
      `<div class="cs-row" style="margin-top:8px"><span>Total cast fee</span><b${all && !ok ? ' style="color:var(--red-soft)"' : ""}>${M(total)}</b></div>` +
      (all && !ok ? `<div class="cs-row"><span style="color:var(--red-soft)">Funds + credit: ${M(fundable)} — pick cheaper talent.</span><b></b></div>` : "");
    $("#btn-cast-go").disabled = !ok;
  }

  function renderCasting() {
    const o = GAME.S.castOptions;
    if (!o) return;
    $("#casting-grid").innerHTML = SLOTS.map(([slot, label]) => `
      <div class="cast-slot">
        <h3>${label}</h3>
        ${o[slot].map((t, i) => talentHTML(slot, t, i)).join("")}
      </div>`).join("");
    $$("#casting-grid .talent-card").forEach((c) => {
      c.addEventListener("click", () => {
        const slot = c.dataset.slot;
        GAME.pickTalent(slot, +c.dataset.i);
        SFX.play.select();
        $$('#casting-grid .talent-card[data-slot="' + slot + '"]').forEach((x) => x.classList.toggle("selected", x === c));
        updateCastSummary();
      });
    });
    updateCastSummary();
  }

  RENDERERS.casting = renderCasting;

  // ============================================================
  // PRODUCTION
  // ============================================================
  function renderProdHead() {
    const f = GAME.film;
    if (!f) return;
    if (f.poster) $("#prod-poster").src = f.poster;
    $("#prod-title").textContent = f.title;
    $("#prod-meta").textContent = `${f.genre} · ${f.cast.lead.name} leads · ${f.cast.dir.name} directs`;
    $("#prod-date").textContent = GAME.dateStr();
  }

  function renderAds() {
    const f = GAME.film;
    if (!f) return;
    $("#ad-buzz").textContent = "buzz " + Math.round(f.buzz);
    $("#ad-list").innerHTML = D.ADS.map((a) => {
      const unlocked = a.unlock(GAME);
      const affordable = GAME.canAfford(a.cost);
      const gain = Math.round(a.buzz * (1 + f.social / 200) * 10) / 10;
      return `<li class="ad-item ${unlocked ? "" : "locked"}">
        <div class="ad-name">${a.name}<small>${a.sub} · +${gain} buzz</small></div>
        <span class="ad-cost">${M(a.cost)}</span>
        <button data-ad="${a.id}" ${!unlocked || !affordable ? "disabled" : ""}>${unlocked ? "BUY" : "🔒"}</button>
      </li>`;
    }).join("");
    $$("#ad-list button").forEach((b) => b.addEventListener("click", () => {
      GAME.buyAd(b.dataset.ad);
      SFX.play.cash();
      renderProduction();
    }));
  }

  function renderPhases() {
    const f = GAME.film;
    if (!f) return;
    const names = { sets: "Sets & Props", filming: "Filming & Editing", vfx: "Visual Effects", music: "Score" };
    $("#phase-list").innerHTML = Object.keys(f.phases).map((k) => {
      const pct = f.phases[k];
      return `<div class="phase-row">
        <div class="ph-top"><span class="ph-name">${names[k]}</span><span class="ph-pct">${pct}%</span></div>
        <div class="bar"><div class="bar-fill ${pct >= 100 ? "done" : ""}" style="width:${pct}%"></div></div>
      </div>`;
    }).join("");
    $("#prod-total").textContent = "total " + GAME.totalProduction() + "%";
    $("#prod-quality-bar").style.width = f.quality + "%";
    $("#prod-quality-val").textContent = f.quality + "/100";
    $("#prod-cost-line").textContent = `Next week costs ${M(GAME.weeklyProdCost())} · week ${f.week + 1} of ${f.totalWeeks}`;
  }

  function renderMessages() {
    const el = $("#messages");
    el.innerHTML = GAME.messages.map((m) =>
      `<div class="msg ${m.kind || ""}"><div class="m-date">${esc(m.date)}</div>${esc(m.text)}</div>`).join("");
    el.scrollTop = el.scrollHeight;
  }

  function updateProdControls() {
    const f = GAME.film;
    if (!f) return;
    $("#btn-screen").disabled = !GAME.canScreen();
    $("#btn-release").disabled = !GAME.canRelease();
  }

  function renderProduction() {
    const f = GAME.film;
    if (!f) return;
    refreshPosters();
    renderProdHead();
    renderAds();
    renderPhases();
    renderMessages();
    updateProdControls();
  }

  RENDERERS.production = renderProduction;

  // ---------- pass week + autoplay ----------
  let prodSpeed = 1; // 1 = manual, 300/700 = auto interval ms

  function setProdSpeed(ms) {
    prodSpeed = ms;
    $$(".speed-btn[data-speed]").forEach((b) => b.classList.toggle("active", +b.dataset.speed === prodSpeed));
    if (prodTimer) { clearInterval(prodTimer); prodTimer = null; }
    if (prodSpeed > 1) prodTimer = setInterval(prodTick, prodSpeed);
  }

  function prodTick() {
    if (GAME.state !== "production" || GAME.pendingEvent || modalOpen) { setProdSpeed(1); return; }
    passWeekAction();
  }

  function syncProdAuto() {
    const shouldRun = prodSpeed > 1 && GAME.state === "production" && !GAME.pendingEvent && !modalOpen;
    if (shouldRun && !prodTimer) prodTimer = setInterval(prodTick, prodSpeed);
    else if (!shouldRun && prodTimer) { clearInterval(prodTimer); prodTimer = null; }
  }

  function passWeekAction() {
    if (GAME.state !== "production" || GAME.pendingEvent) return;
    SFX.play.camera();
    GAME.passWeek();
    if (GAME.state !== "production") { setProdSpeed(1); render(); return; }
    renderProduction();
    if (GAME.pendingEvent) { setProdSpeed(1); openEventModal(); }
  }

  // ---------- event modal ----------
  function openEventModal() {
    const ev = GAME.pendingEvent;
    if (!ev || modalOpen) return;
    SFX.play.pop();
    const choices = ev.choices.map((c, i) => {
      const disabled = c.cost > 0 && !GAME.canAfford(c.cost);
      const costTxt = c.cost > 0 ? ` · ${M(c.cost)}` : " · no cost";
      return `<button class="event-choice" data-i="${i}" ${disabled ? "disabled" : ""}>
        <div class="ec-title">${c.label}${costTxt}</div>
        <div class="ec-detail">${esc(c.detail)}</div>
      </button>`;
    }).join("");
    openModal(ev.title, `<p>${esc(ev.text)}</p>${choices}`, false);
    $$("#modal-body .event-choice").forEach((b) => b.addEventListener("click", () => {
      if (GAME.pendingEvent) GAME.resolveEvent(+b.dataset.i);
      closeModal();
      render();
    }));
  }

  // ---------- tagline modal ----------
  function openTaglineModal() {
    if (GAME.pendingEvent || modalOpen) return;
    const f = GAME.film;
    const opts = GAME.taglineOptions();
    const lines = opts.map((t, i) =>
      `<button class="tagline-opt" data-i="${i}" ${f.tagline === t.line ? 'style="border-color:var(--gold);background:rgba(240,180,41,0.08)"' : ""}>${esc(t.line)}</button>`).join("");
    openModal("PICK A TAGLINE", `<p style="color:var(--muted);font-size:12.5px">The tagline shapes the audience's expectation. A bad one can sour a good film.</p>${lines}<p style="color:var(--muted);font-size:12px;margin-top:14px">Current: ${f.tagline ? "“" + esc(f.tagline) + "”" : "none yet"}</p>`);
    $$("#modal-body .tagline-opt").forEach((b) => b.addEventListener("click", () => {
      GAME.setTagline(+b.dataset.i);
      SFX.play.select();
      closeModal();
      renderProduction();
    }));
  }

  // ---------- test screening ----------
  function doScreening() {
    if (!GAME.canScreen()) return;
    if (!confirm(`Test screen "${GAME.film.title}"? The audience scores the film. Costs $0.5M.`)) return;
    SFX.play.shutter();
    GAME.testScreen();
    openScreeningModal();
    renderProduction();
  }

  function openScreeningModal() {
    const f = GAME.film;
    if (!f || !f.screened) return;
    const s = f.screenScore;
    const quotes = GAME.screenQuotes().map((q) => `<div class="screen-quote">“${esc(q)}”</div>`).join("");
    let extra = "";
    if (s < 55) {
      const ok = GAME.canAfford(1.5);
      extra = `<div class="btn-row" style="margin-top:16px">
        <button class="btn btn-primary" id="btn-reshoot" ${ok ? "" : "disabled"}>🎬 RESHOOT — ${M(1.5)} (quality +8)</button>
      </div>${ok ? "" : "<p style='color:var(--red-soft);font-size:12px;margin-top:8px'>Not enough funds or credit for reshoots.</p>"}`;
    } else {
      extra = `<p style="color:var(--muted);font-size:12.5px;margin-top:10px">The audience is on board. When production hits 100%, release the film.</p>`;
    }
    openModal("TEST SCREENING", `
      <p style="color:var(--muted);font-size:12.5px">The audience votes out of 100.</p>
      <div class="screen-score" style="color:${s >= 70 ? "var(--green)" : s < 45 ? "var(--red-soft)" : "var(--gold)"}">${s}</div>
      <div class="screen-quotes">${quotes}</div>
      ${extra}`);
    const rb = $("#btn-reshoot");
    if (rb) rb.addEventListener("click", () => {
      SFX.play.cash();
      GAME.reshoot();
      closeModal();
      renderProduction();
    });
  }

  // ============================================================
  // BOX OFFICE
  // ============================================================
  let boSpeed = "bo-1"; // "bo-1" manual, "bo-300" auto

  function setBoSpeed(v) {
    boSpeed = v;
    $$(".bo-speed-ctl .speed-btn").forEach((b) => b.classList.toggle("active", b.dataset.speed === boSpeed));
    if (boTimer) { clearInterval(boTimer); boTimer = null; }
    if (boSpeed !== "bo-1") boTimer = setInterval(boTick, +boSpeed);
  }

  function boTick() {
    if (GAME.state !== "boxoffice" || GAME.boDone || modalOpen) { setBoSpeed("bo-1"); return; }
    boNext();
  }

  function renderBoTable() {
    const bo = GAME.boxoffice;
    if (!bo) return;
    const sorted = [bo.my, ...bo.rivals].slice().sort((a, b) => b.last - a.last);
    const rows = sorted.map((e, i) => {
      const isMe = e === bo.my;
      const was = e._wasPrev == null ? null : e._wasPrev;
      let moveTxt = "new", moveCls = "new";
      if (was != null) {
        if (was > i) { moveTxt = "▲" + (was - i); moveCls = "up"; }
        else if (was < i) { moveTxt = "▼" + (i - was); moveCls = "down"; }
        else moveTxt = "—";
      }
      // no baseline before the first week is tallied (all grosses 0 would fake movement)
      if (bo.week >= 1) e._wasPrev = i;
      return `<tr class="${isMe ? "me" : ""}">
        <td class="bo-rank-cell">${i + 1}</td>
        <td class="bo-move ${moveCls}">${moveTxt}</td>
        <td class="bo-film-name">${esc(e.title)}</td>
        <td>${esc(e.studio)}</td>
        <td class="num">${e.last.toFixed(1)}</td>
        <td class="num">${e.total.toFixed(1)}</td>
      </tr>`;
    }).join("");
    $("#bo-rows").innerHTML = rows;
  }

  function drawBoChart() {
    const bo = GAME.boxoffice;
    if (!bo) return;
    const svg = $("#bo-chart");
    const curve = bo.curve;
    const W = 520, H = 260, padL = 42, padB = 26, padT = 14, padR = 14;
    const maxV = Math.max(1, ...curve);
    const x = (i) => padL + (W - padL - padR) * (curve.length > 1 ? i / (curve.length - 1) : 0.5);
    const y = (v) => H - padB - (H - padB - padT) * (v / maxV);
    let grid = "", xl = "";
    for (let g = 0; g <= 4; g++) {
      const v = maxV * g / 4, yy = y(v);
      grid += `<line x1="${padL}" y1="${yy}" x2="${W - padR}" y2="${yy}" stroke="rgba(255,255,255,0.07)"/>`;
      grid += `<text x="${padL - 6}" y="${yy + 4}" text-anchor="end" font-size="10" fill="#8f8f9f">${v.toFixed(0)}</text>`;
    }
    let area = "", line = "", dots = "";
    if (curve.length) {
      const pts = curve.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
      area = `<polygon points="${x(0).toFixed(1)},${H - padB} ${pts.join(" ")} ${x(curve.length - 1).toFixed(1)},${H - padB}" fill="rgba(240,180,41,0.12)"/>`;
      line = `<polyline points="${pts.join(" ")}" fill="none" stroke="#f0b429" stroke-width="2.5"/>`;
      dots = curve.map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3" fill="#f0b429"/>`).join("");
      curve.forEach((v, i) => {
        if (curve.length <= 14 || i % 2 === 0)
          xl += `<text x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="9" fill="#8f8f9f">${i + 1}</text>`;
      });
    }
    svg.innerHTML = grid + area + line + dots + xl;
    $("#bo-note").textContent = curve.length
      ? `Opens at ${M(curve[0])}. ${bo.done ? "The curve has run its course." : "Watch the legs week by week…"}`
      : "Awaiting the first week of grosses…";
  }

  function renderBoxoffice() {
    const bo = GAME.boxoffice;
    if (!bo) return;
    const f = GAME.film;
    if (f && f.poster) $("#bo-poster").src = f.poster;
    $("#bo-title").textContent = bo.my.title;
    $("#bo-meta").textContent = `${bo.my.genre} · ${bo.my.studio}`;
    $("#bo-gross").textContent = M(bo.my.total);
    $("#bo-week").textContent = String(bo.week);
    $("#bo-rank").textContent = GAME.boRank();
    renderBoTable();
    drawBoChart();
    $("#btn-bo-next").disabled = GAME.boDone;
  }

  function boNext() {
    const bo = GAME.boxoffice;
    if (!bo || bo.done) return;
    SFX.play.tick();
    GAME.nextBoWeek();
    renderBoxoffice();
    if (GAME.boDone) {
      setBoSpeed("bo-1");
      SFX.play.applause();
      toast(`"${bo.my.title}" leaves the top 10 — final gross ${M(bo.my.total)}`);
      setTimeout(() => {
        if (GAME.state === "boxoffice" && GAME.boDone) { GAME.finishBoxOffice(); render(); }
      }, 2200);
    }
  }

  RENDERERS.boxoffice = renderBoxoffice;

  // ============================================================
  // RESULTS
  // ============================================================
  RENDERERS.results = function () {
    const s = GAME.lastFilmSummary;
    if (!s) return;
    if (s.poster) $("#res-poster").src = s.poster;
    $("#res-grade").textContent = s.grade;
    const heads = { S: "A LEGENDARY HIT", "A+": "A BIG HIT", A: "A SOLID HIT", "B+": "IT MADE MONEY", B: "MOSTLY IN THE BLACK", C: "BARELY BREAKEVEN", D: "A LOSS", F: "A DISASTER" };
    $("#res-headline").textContent = heads[s.grade] || "FINANCIALS";
    $("#res-sub").textContent = `"${s.title}" ran ${s.weeks} week${s.weeks === 1 ? "" : "s"} on the box office chart. Quality ${s.quality}/100.`;
    const line = (label, v, cls) => `<tr><td>${label}</td><td class="${cls || ""}">${v < 0 ? "\u2212" + M(-v) : M(v)}</td></tr>`;
    let html = line("Box office gross", s.gross, "pos");
    html += line("Production costs", -s.costs.production);
    html += line("Casting & crew", -s.costs.cast);
    html += line("Development", -s.costs.dev);
    html += line("Advertising", -s.costs.ads);
    if (s.costs.events + s.costs.other > 0) html += line("Events, screenings & reshoots", -(s.costs.events + s.costs.other));
    if (s.debt > 0) html += line("Debt repaid to the bank", -s.debt);
    html += `<tr class="total"><td>${s.profit >= 0 ? "PROFIT" : "LOSS"}</td><td class="${s.profit >= 0 ? "pos" : "neg"}">${s.profit >= 0 ? M(s.profit) : "\u2212" + M(-s.profit)}</td></tr>`;
    $("#pnl-table").innerHTML = html;
    const notes = [];
    if (s.grade === "S" || s.grade === "A+") notes.push(`<div class="res-note award">🏆 The industry takes notice.</div>`);
    if (s.screened) notes.push(`<div class="res-note">The test audience scored it ${s.screenScore}/100 before release.</div>`);
    if (s.tagline) notes.push(`<div class="res-note">The tagline ran in the papers: “${esc(s.tagline)}”</div>`);
    notes.push(`<div class="res-note">Reputation ${s.repDelta >= 0 ? "+" : "−"}${Math.abs(s.repDelta)} → ${Math.round(GAME.studio.reputation)}` +
      (s.profit >= 0 ? " · the bank is friendly now." : " · the bank will mention this at the next review.") + "</div>");
    $("#res-notes").innerHTML = notes.join("");
    if (s.profit >= 0.5) SFX.play.fanfare();
    else if (s.profit < 0) SFX.play.bad();
  };

  // ============================================================
  // GAME OVER
  // ============================================================
  RENDERERS.gameover = function () {
    $("#go-sub").textContent = GAME.gameOverReason || "The bank has sold the lot. The cameras go dark.";
    const s = GAME.studio;
    const stats = [
      ["Films released", s ? String(s.films) : "0"],
      ["Best gross", s ? M(s.bestGross) : "—"],
      ["Reputation", s ? String(Math.round(s.reputation)) : "—"],
      ["Final funds", s ? (s.funds < 0 ? "\u2212" + M(-s.funds) : M(s.funds)) : "—"]
    ];
    $("#go-stats").innerHTML = stats.map(([k, v]) => `<div class="go-stat"><div class="k">${k}</div><div class="v">${v}</div></div>`).join("");
    SFX.play.bad();
  };

  // ============================================================
  // HELP
  // ============================================================
  function openHelpModal() {
    const limit = GAME.studio ? GAME.creditLimit() : 8;
    openModal("HOW TO PLAY", `
      <p style="line-height:1.7">You run a small Hollywood production company. Each film walks five steps:</p>
      <div style="line-height:1.8;font-size:13px">
        1. <b>Development</b> — pick one of three scripts; each rewrite week costs $0.3M for +7 script quality.<br>
        2. <b>Budget</b> — aim near the ideal. Under hurts quality; way over wastes money.<br>
        3. <b>Casting</b> — stars bring draw and social reach, but big fees.<br>
        4. <b>Production</b> — pass weeks, buy ads (buzz decays ~3%/week), resolve on-set events.<br>
        5. <b>Release</b> — track your film on the Top 10 until it drops out.
      </div>
      <p style="margin-top:14px">💡 <b>Test screening</b> (60%+ complete, $0.5M) scores the film; under 55 you can reshoot for $1.5M (+8 quality).</p>
      <p>💰 You start with $15M plus a credit line of ${M(limit)}M (it grows with reputation). Go 20% past the limit and the bank takes the lot.</p>
      <p>🎯 Quality = 55% script + 45% cast, scaled by how well you budgeted. Dramas and documentaries have legs; action opens hot and fades fast.</p>`);
  }

  // ============================================================
  // WIRING + BOOT
  // ============================================================
  function wire() {
    // title
    $("#btn-new").addEventListener("click", () => {
      SFX.play.click();
      if (GAME.hasSave() && !confirm("Start a new studio? The existing save will be overwritten.")) return;
      GAME.restart();
      GAME.S.state = "studio";
      render();
    });
    $("#btn-continue").addEventListener("click", () => {
      SFX.play.click();
      if (GAME.load()) { SFX.play.marquee(); render(); }
      else GAME.clearSave();
    });
    $("#btn-help-title").addEventListener("click", () => { SFX.play.click(); openHelpModal(); });

    // studio
    $("#btn-studio-go").addEventListener("click", () => {
      SFX.play.marquee();
      GAME.newStudio($("#input-studio-name").value.trim() || "Marquee & Vine Pictures");
      render();
    });
    $("#input-studio-name").addEventListener("keydown", (e) => {
      if (e.key === "Enter") $("#btn-studio-go").click();
    });

    // script
    $("#btn-script-go").addEventListener("click", () => {
      if (GAME.S.selectedScript == null) return;
      SFX.play.select();
      GAME.selectScript(GAME.S.selectedScript, GAME.S.rewrites);
      render();
    });
    $("#rewrite-slider").addEventListener("input", (e) => {
      GAME.setRewrites(+e.target.value);
      updateRewriteLabel();
    });

    // budget
    $("#budget-slider").addEventListener("input", (e) => {
      GAME.setBudget(+e.target.value);
      drawBudget();
    });
    $("#btn-budget-back").addEventListener("click", () => {
      SFX.play.click();
      GAME.offerScripts();
      render();
    });
    $("#btn-budget-go").addEventListener("click", () => {
      SFX.play.select();
      GAME.confirmBudget();
      render();
    });

    // casting
    $("#btn-cast-back").addEventListener("click", () => {
      SFX.play.click();
      GAME.S.state = "budget";
      render();
    });
    $("#btn-cast-go").addEventListener("click", () => {
      if (!GAME.allCastPicked()) return;
      const p = GAME.S.castPicks, o = GAME.S.castOptions;
      SFX.play.select();
      GAME.confirmCasting(p.lead, p.co, p.sup, p.dir);
      render();
    });

    // production
    $("#btn-pass-week").addEventListener("click", passWeekAction);
    $$(".speed-btn[data-speed]").forEach((b) => b.addEventListener("click", () => {
      const v = +b.dataset.speed;
      SFX.play.click();
      setProdSpeed(prodSpeed === v ? 1 : v);
    }));
    $("#btn-terminate").addEventListener("click", () => {
      const f = GAME.film;
      if (!f) return;
      SFX.play.click();
      const spent = f.costs.production + f.costs.cast + f.costs.dev + f.costs.ads + f.costs.events + f.costs.other;
      openModal("Terminate the film?", `<p>“${esc(f.title)}” has absorbed ${M(spent)} so far. Pulling the plug loses all of it, and the studio's reputation will feel it.</p>
        <div class="btn-row" style="margin-top:18px"><button class="btn btn-ghost" id="term-no">KEEP MAKING IT</button><button class="btn btn-danger" id="term-yes">✕ TERMINATE FILM</button></div>`, false);
      $("#term-no").addEventListener("click", closeModal);
      $("#term-yes").addEventListener("click", () => {
        SFX.play.bad();
        GAME.terminateFilm();
        closeModal();
        render();
      });
    });
    $("#btn-tagline").addEventListener("click", () => { SFX.play.click(); openTaglineModal(); });
    $("#btn-screen").addEventListener("click", doScreening);
    $("#btn-release").addEventListener("click", () => {
      if (!GAME.canRelease()) return;
      SFX.play.fanfare();
      GAME.release();
      render();
    });

    // box office
    $("#btn-bo-next").addEventListener("click", boNext);
    $("#btn-bo-stop").addEventListener("click", () => {
      SFX.play.click();
      GAME.finishBoxOffice();
      render();
    });
    $$(".bo-speed-ctl .speed-btn").forEach((b) => b.addEventListener("click", () => {
      SFX.play.click();
      setBoSpeed(boSpeed === b.dataset.speed ? "bo-1" : b.dataset.speed);
    }));

    // results / game over
    $("#btn-next-film").addEventListener("click", () => {
      SFX.play.click();
      GAME.nextFilm();
      render();
    });
    $("#btn-restart").addEventListener("click", () => {
      SFX.play.click();
      GAME.restart();
      render();
    });

    // topbar
    $("#btn-sound").addEventListener("click", () => {
      const on = SFX.toggle();
      $("#btn-sound").textContent = on ? "🔊" : "🔇";
    });
    $("#btn-help").addEventListener("click", () => { SFX.play.click(); openHelpModal(); });

    // modal
    $("#modal-x").addEventListener("click", closeModal);
    $("#modal").addEventListener("click", (e) => {
      if (e.target === e.currentTarget && modalClosable) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalOpen && modalClosable) closeModal();
    });

    // audio unlock on first gesture
    document.addEventListener("pointerdown", () => SFX.unlock(), { once: true });
  }

  function boot() {
    buildMarqueeLights();
    wire();
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  return { $, M, esc, toast, render, openModal, closeModal, refreshPosters, RENDERERS,
    openHelpModal, openEventModal, passWeekAction, boNext, renderProduction, renderBoxoffice };
})();
