/* ============================================================
   SIM CINEMA DELUXE — game.js
   Core simulation: the state machine + all game math.
   Chunk A: state, dates, save/load, studio, script, budget.
   ============================================================ */
"use strict";

const GAME = (() => {
  const D = DATA;
  const SAVE_KEY = "simcinema_save_v5"; // bumped: casting pool widened (6/6/6/8) — old card indices would dangle
  const LEGACY_KEY = "simcinema_legacy_v1";
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // ---------- mutable state ----------
  const S = {
    state: "title",           // title|studio|script|budget|casting|production|boxoffice|results|gameover
    studio: null,             // { name, funds, reputation, films, bestGross }
    scriptOptions: [],        // 3 options in the development phase
    selectedScript: null,     // index in scriptOptions
    rewrites: 1,
    budget: 10,
    castPicks: { lead: null, co: null, sup: null, dir: null }, // candidate objects
    castOptions: null,        // { lead: [3], co: [3], sup: [3], dir: [5] }
    film: null,               // current film (see startProduction)
    messages: [],
    boxoffice: null,          // { my, rivals[], week, done }
    lastFilmSummary: null,
    filmLog: [],              // this career's finished/terminated films
    pendingEvent: null,       // event object awaiting a choice
    eventPool: [],            // shuffled event indices for this production
    gameOverReason: "",
    gameOverType: "bank",     // bank | fired — flavors the game-over screen
    prestige: 25,             // studio prestige 0-100: awards + big hits raise it; casting lever
    bank: { trust: 50 },      // bank trust 0-100 → credit line size
    board: { approval: 50, reprieved: false, lastNote: "" }, // board approval 0-100 → fire branch
    trends: {},               // per-genre heat 0.75-1.3, drifts after each film
    awards: [],               // trophy room: { title, poster, name, razzie, date, y }
    repHistory: [],           // [{ rep, date }] for the dashboard curve
    news: [],                 // [{ date, text }] industry headlines for the HQ
    advisorsOn: true,         // the boardroom: toggle-able advisory notes
    paper: null               // transient: the trade paper on the script screen (rebuilt, not saved)
  };
  function defaultTrends() { const t = {}; for (const g of Object.keys(D.GENRES)) t[g] = 1.0; return t; }
  const _defaultTrends = defaultTrends;

  // ---------- dates ----------
  S.date = { day: 1, month: 0, year: 2026 };
  function dateStr() { return `${MONTHS[S.date.month]} ${S.date.day}`; }
  function addDays(n) {
    for (let i = 0; i < n; i++) {
      S.date.day++;
      const dim = new Date(S.date.year, S.date.month + 1, 0).getDate();
      if (S.date.day > dim) { S.date.day = 1; S.date.month = (S.date.month + 1) % 12; if (S.date.month === 0) S.date.year++; }
    }
  }

  // ---------- messages ----------
  function log(text, kind = "") {
    S.messages.push({ date: dateStr(), text, kind });
    if (S.messages.length > 60) S.messages.shift();
  }

  // ---------- helpers ----------
  function creditLimit() {
    // the bank lends on trust, not on the studio's reputation alone
    return Math.round((4 + S.bank.trust * 0.2) * 10) / 10;
  }
  function canAfford(amount) {
    return S.studio.funds + creditLimit() >= amount;
  }
  function spend(amount) {
    S.studio.funds = Math.round((S.studio.funds - amount) * 10) / 10;
  }
  function weeklyProdCost() { return S.film ? Math.round((S.film.budget / S.film.totalWeeks) * 10) / 10 : 0; }

  // ============================================================
  // NEW STUDIO / SAVE
  // ============================================================
  // the advisor toggle persists across careers in its own key
  function advisorsPref() {
    try { const p = localStorage.getItem("simcinema_advisors"); return p != null ? p === "1" : true; }
    catch (e) { return true; }
  }

  function newStudio(name) {
    S.studio = { name: name.trim() || "Marquee & Vine", funds: 15, reputation: 25, films: 0, bestGross: 0 };
    S.date = { day: 1, month: 0, year: 2026 };
    S.messages = [];
    S.film = null;
    S.boxoffice = null;
    S.lastFilmSummary = null;
    S.filmLog = [];
    S.prestige = 25;
    S.bank = { trust: 50 };
    S.board = { approval: 50, reprieved: false, lastNote: "The board approved the business plan. Barely." };
    S.trends = _defaultTrends();
    S.awards = [];
    S.repHistory = [];
    S.news = [];
    S.gameOverType = "bank";
    S.advisorsOn = advisorsPref();
    S.paper = null;
    S.state = "script";
    log(`The ${S.studio.name} lot opens with $15M and a dream.`, "gold");
    offerScripts();
    save();
  }

  function save() {
    try {
      const blob = { studio: S.studio, state: S.state, date: S.date, messages: S.messages,
        scriptOptions: S.scriptOptions, selectedScript: S.selectedScript, rewrites: S.rewrites,
        budget: S.budget, pendingScript: S.pendingScript, castOptions: S.castOptions, castPicks: S.castPicks, film: S.film,
        boxoffice: S.boxoffice, lastFilmSummary: S.lastFilmSummary, filmLog: S.filmLog,
        prestige: S.prestige, bank: S.bank, board: S.board, trends: S.trends,
        awards: S.awards, repHistory: S.repHistory, news: S.news, gameOverType: S.gameOverType,
        advisorsOn: S.advisorsOn };
      localStorage.setItem(SAVE_KEY, JSON.stringify(blob));
    } catch (e) { /* storage full or unavailable — ignore */ }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const b = JSON.parse(raw);
      if (!b.studio) return false;
      Object.assign(S, b);
      S.filmLog = b.filmLog || [];
      S.prestige = b.prestige != null ? b.prestige : 25;
      S.bank = b.bank || { trust: 50 };
      S.board = b.board || { approval: 50, reprieved: false, lastNote: "" };
      S.trends = b.trends && Object.keys(b.trends).length ? b.trends : _defaultTrends();
      S.awards = b.awards || [];
      S.repHistory = b.repHistory || [];
      S.news = b.news || [];
      S.gameOverType = b.gameOverType || "bank";
      S.advisorsOn = b.advisorsOn != null ? b.advisorsOn : advisorsPref();
      // migration: old single-buzz saves → dual meters (positive keeps the value)
      if (S.film && S.film.buzz != null && S.film.buzzPos == null) {
        S.film.buzzPos = S.film.buzz;
        S.film.buzzNeg = 0;
        delete S.film.buzz;
      }
      S.pendingEvent = null;
      S.eventPool = [];
      S.paper = null; // the paper is rebuilt for whatever week the save landed in
      return true;
    } catch (e) { return false; }
  }

  function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
  function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }

  // ---------- persistent career record (hall of fame) ----------
  function legacy() {
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function bumpLegacy() {
    const log = S.filmLog || [];
    if (!S.studio || !log.length) return;
    const profit = Math.round(log.reduce((s, f) => s + (f.profit || 0), 0) * 10) / 10;
    const best = log.reduce((a, f) => (f.gross || 0) > (a.gross || 0) ? f : a, { gross: 0 });
    const rec = { films: log.length, profit, studio: S.studio.name,
      bestFilm: { t: best.t, g: best.gross }, year: S.date.year };
    const L = legacy();
    if (!L || rec.films > L.films || (rec.films === L.films && rec.profit > L.profit)) {
      try { localStorage.setItem(LEGACY_KEY, JSON.stringify(rec)); } catch (e) { /* full */ }
    }
  }

  // ============================================================
  // PHASE 1 — SCRIPT / DEVELOPMENT
  // ============================================================
  function offerScripts() {
    if (S.studio && S.studio.funds < 0) {
      S.state = "gameover";
      S.gameOverReason = "The debt from the last picture proved too heavy. The bank repossessed the lot.";
      log("The bank repossesses the lot. The marquee goes dark.", "bad");
      save();
      return;
    }
    S.state = "script";
    S.scriptOptions = D.makeScriptOptions(S.studio.reputation);
    S.selectedScript = null;
    S.rewrites = 1;
    // a fresh slate of scripts is a fresh week: the trade paper prints a new edition
    S.paper = buildTrendPaper();
    save();
  }

  function setRewrites(n) { S.rewrites = D.clamp(n, 0, 4); save(); }

  // the industry newspaper on the development screen: dated masthead, trend
  // headlines, and the full heat table (the same S.trends release() applies —
  // what the paper says is what you get)
  function buildTrendPaper() {
    const tr = S.trends || _defaultTrends();
    const offered = (S.scriptOptions || []).map((o) => o.genre);
    const heat = Object.keys(D.GENRES)
      .map((g) => ({ genre: g, heat: tr[g] != null ? tr[g] : 1, onOffer: offered.includes(g) }))
      .sort((a, b) => b.heat - a.heat);
    return {
      date: `${dateStr()}, ${S.date.year}`,
      headlines: D.trendHeadlines(tr),
      heat
    };
  }
  function trendPaper() {
    if (!S.paper) S.paper = buildTrendPaper();
    return S.paper;
  }

  function confirmScript(index) {
    const opt = S.scriptOptions[index];
    if (!opt) return;
    const devCost = opt.devCost + S.rewrites * 0.3;
    if (!canAfford(devCost)) { log("Not enough funds or credit for the development deal.", "bad"); return; }
    spend(devCost);
    const sq = D.clamp(opt.quality + S.rewrites * 7, 5, 99);
    S.pendingScript = { ...opt, quality: sq, devCost, rewrites: S.rewrites };
    S.budget = Math.min(40, Math.max(2, Math.round(opt.estBudget)));
    S.state = "budget";
    log(`Development deal signed: "${opt.title}" (${opt.genre}). ${S.rewrites} rewrite week${S.rewrites === 1 ? "" : "s"} funded.`, "gold");
    save();
  }

  // ============================================================
  // PHASE 2 — BUDGET
  // ============================================================
  function setBudget(m) { S.budget = D.clamp(m, 2, 40); }

  function budgetFactor() {
    const est = S.pendingScript.estBudget;
    return 0.5 + 0.5 * Math.min(1, S.budget / est) + 0.1 * Math.min(1, Math.max(0, S.budget / est - 1));
  }

  function projectedQuality() {
    // estimate before casting is known: assume cast score ~45
    return Math.round(D.clamp((0.55 * S.pendingScript.quality + 0.45 * 45) * budgetFactor(), 5, 100));
  }

  function productionWeeks() { return D.clamp(Math.round(3 + S.budget / 4), 4, 12); }

  function confirmBudget() {
    const maxFundable = Math.max(2, Math.floor((S.studio.funds + creditLimit()) * 10) / 10);
    if (S.budget > maxFundable) {
      S.budget = maxFundable;
      log("The bank trims the budget to the size of the credit line.", "bad");
    }
    // prestige is a real lever: famous studios get cheaper talent
    const disc = 1 - Math.min(0.15, S.prestige * 0.0015);
    const discount = (t) => { t.cost = Math.max(0.1, Math.round(t.cost * disc * 10) / 10); return t; };
    // wider pool: 6 actors per slot, 8 directors; the round-level spread pass
    // guarantees the value-vs-name tradeoff is real (see D.makeCastingRound).
    // The round is drawn once so its guarantees apply to the whole slate.
    const round = D.makeCastingRound();
    S.castOptions = {
      lead: round.lead.map(discount),
      co: round.co.map(discount),
      sup: round.sup.map(discount),
      dir: round.dir.map(discount)
    };
    S.castPicks = { lead: null, co: null, sup: null, dir: null };
    S.state = "casting";
    save();
  }

  return { S, newStudio, save, load, hasSave, clearSave, offerScripts, setRewrites, confirmScript,
    setBudget, budgetFactor, projectedQuality, productionWeeks, confirmBudget, dateStr, addDays, log, spend, weeklyProdCost, creditLimit, canAfford,
    trendPaper,
    legacy, bumpLegacy,
    _internal: { D, defaultTrends } };
})();

/* ============================================================
   game.js — chunk B: casting + production loop
   ============================================================ */
(function (G) {
  const D = G._internal.D;

  // ---------- casting ----------
  G.pickTalent = function (slot, idx) {
    G.S.castPicks[slot] = idx;
    G.save();
  };

  G.castTotalCost = function () {
    const o = G.S.castOptions, p = G.S.castPicks;
    if (!o) return 0;
    let t = 0;
    if (p.lead != null) t += o.lead[p.lead].cost;
    if (p.co != null) t += o.co[p.co].cost;
    if (p.sup != null) t += o.sup[p.sup].cost;
    if (p.dir != null) t += o.dir[p.dir].cost;
    return Math.round(t * 10) / 10;
  };

  G.allCastPicked = function () {
    const p = G.S.castPicks;
    return p.lead != null && p.co != null && p.sup != null && p.dir != null;
  };

  G.confirmCasting = function (leadIdx, coIdx, supIdx, dirIdx) {
    const S = G.S;
    if (leadIdx != null) { S.castPicks.lead = leadIdx; S.castPicks.co = coIdx; S.castPicks.sup = supIdx; S.castPicks.dir = dirIdx; }
    if (!G.allCastPicked()) return;
    const o = S.castOptions, p = S.castPicks;
    const lead = o.lead[p.lead], co = o.co[p.co], sup = o.sup[p.sup], dir = o.dir[p.dir];
    const castCost = G.castTotalCost();
    if (!G.canAfford(castCost)) { G.log("The casting deal is bigger than the studio can finance.", "bad"); return; }
    G.spend(castCost);

    const pScript = S.pendingScript;
    const castScore = Math.round(lead.draw * 0.35 + co.draw * 0.30 + sup.draw * 0.20 + dir.score * 0.15);
    const q = Math.round(D.clamp((0.55 * pScript.quality + 0.45 * castScore) * G.budgetFactor(), 5, 100));
    const fx = D.GENRES[pScript.genre].fxWeight;

    S.film = {
      title: pScript.title, genre: pScript.genre, logline: pScript.logline,
      budget: S.budget, totalWeeks: G.productionWeeks(), week: 0,
      phases: { sets: 0, filming: 0, vfx: 0, music: 0 },
      quality: q, castScore, directorScore: dir.score,
      cast: { lead, co, sup, dir },
      social: Math.round((lead.social + co.social + sup.social) / 3),
      buzzPos: 0, buzzNeg: 0, screened: false, screenScore: 0,
      tagline: null, taglineQ: 0,
      poster: null,
      costs: { production: 0, cast: castCost, dev: pScript.devCost, ads: 0, events: 0, other: 0 }
    };
    S.eventPool = D.shuffle(D.EVENTS.map((e, i) => i));
    S.pendingEvent = null;
    S.state = "production";
    G.log(`Casting locked: ${lead.name} (${lead.tier.toLowerCase()}) headlines with ${co.name}. ${dir.name} directs.`, "gold");
    G.log("Production started.");
    G.save();
  };

  // ---------- production loop ----------
  G.phaseProfile = function () {
    const fx = D.GENRES[G.S.film.genre].fxWeight;
    return {
      sets: [0, 0.45],
      filming: [0.25, 0.95],
      vfx: [0.35, 0.35 + 0.65 * fx],
      music: [0.5, 1.0]
    };
  };

  G.totalProduction = function () {
    const f = G.S.film;
    if (!f) return 0;
    return Math.round((f.phases.sets + f.phases.filming + f.phases.vfx + f.phases.music) / 4);
  };

  G.canRelease = function () { return !!G.S.film && G.totalProduction() >= 99; };
  G.netBuzz = function () { const f = G.S.film; return f ? f.buzzPos - f.buzzNeg : 0; };
  G.canScreen = function () {
    const f = G.S.film;
    return !!f && !f.screened && G.totalProduction() >= 60 && G.canAfford(0.5);
  };

  G.passWeek = function () {
    const S = G.S, f = S.film;
    if (!f || S.state !== "production" || S.pendingEvent) return;
    f.week++;
    const wc = G.weeklyProdCost();
    G.spend(wc);
    f.costs.production = Math.round((f.costs.production + wc) * 10) / 10;

    const prof = G.phaseProfile();
    for (const key of Object.keys(f.phases)) {
      const [s, e] = prof[key];
      const start = s * f.totalWeeks;      // schedule position (weeks) where work begins
      const span = (e - s) * f.totalWeeks; // window length in weeks
      const target = D.clamp((f.week - start) / span, 0, 1) * 100;
      f.phases[key] = Math.round(Math.max(f.phases[key], Math.min(100, target)));
    }
    // buzz: two independent meters. Each mean-reverts to a small ambient
    // baseline (there is always some chatter) with noise around it, so the
    // internet wanders without ratcheting — at 3%/week decay, any positive
    // expected increment would accumulate to ~30+ by release. Ads and events
    // are what actually move the meters.
    const base = 4;
    f.buzzPos = Math.round(D.clamp((f.buzzPos - base) * 0.97 + base + D.rand(-1.5, 1.5), 0, 150) * 10) / 10;
    f.buzzNeg = Math.round(D.clamp((f.buzzNeg - base) * 0.97 + base + D.rand(-1.5, 1.5), 0, 150) * 10) / 10;
    if (Math.random() < 0.2) {
      const blip = D.pick(D.OUTSIDE_BUZZ);
      f.buzzPos = Math.round(D.clamp(f.buzzPos + blip.pos, 0, 150) * 10) / 10;
      f.buzzNeg = Math.round(D.clamp(f.buzzNeg + blip.neg, 0, 150) * 10) / 10;
      const net = blip.pos - blip.neg;
      G.log(blip.text + (net > 0 ? ` Positive buzz +${blip.pos}.` : net < 0 ? ` Negative buzz +${blip.neg}.` : ""), net > 0 ? "good" : net < 0 ? "bad" : "");
    }

    if (G.totalProduction() >= 99) {
      f.phases = { sets: 100, filming: 100, vfx: 100, music: 100 };
      G.log("Principal photography wrapped. The film is ready to release.", "story");
    }

    if (!S.pendingEvent && S.eventPool.length > 0 && f.week < f.totalWeeks && Math.random() < 0.55) {
      S.pendingEvent = D.EVENTS[S.eventPool.pop()];
      G.log(S.pendingEvent.title + " — the crew is summoned to a meeting.", "story");
    }
    G.addDays(7);
    G.save();
  };

  G.resolveEvent = function (choiceIdx) {
    const S = G.S;
    const ev = S.pendingEvent;
    if (!ev) return;
    const choice = ev.choices[choiceIdx];
    if (!choice) return;
    if (choice.cost > 0) {
      if (!G.canAfford(choice.cost)) { G.log("Not enough funds or credit for that option.", "bad"); return; }
      G.spend(choice.cost);
      S.film.costs.events = Math.round((S.film.costs.events + choice.cost) * 10) / 10;
    }
    choice.run(G);
    S.pendingEvent = null;
    G.save();
  };

  // ---------- advertising ----------
  G.buyAd = function (adId) {
    const S = G.S, f = S.film;
    const ad = D.ADS.find(a => a.id === adId);
    if (!ad || !f) return;
    if (!ad.unlock(G)) { G.log("That campaign isn't available yet.", "bad"); return; }
    if (S.studio.funds < ad.cost && !G.canAfford(ad.cost)) { G.log("Not enough funds or credit for that campaign.", "bad"); return; }
    G.spend(ad.cost);
    f.costs.ads = Math.round((f.costs.ads + ad.cost) * 10) / 10;
    if (ad.neg) {
      // PR cleanup: the lever for the negative meter
      const before = f.buzzNeg;
      f.buzzNeg = Math.max(0, Math.round((f.buzzNeg - ad.neg) * 10) / 10);
      G.log(`${ad.name}: −${Math.round((before - f.buzzNeg) * 10) / 10} negative buzz.`, "good");
    } else {
      const gain = Math.round(ad.buzz * (1 + f.social / 200) * 10) / 10;
      f.buzzPos = Math.round(D.clamp(f.buzzPos + gain, 0, 150) * 10) / 10;
      G.log(`${ad.name}: +${gain} positive buzz.`, "good");
    }
    G.save();
  };

  G.setTagline = function (idx) {
    const f = G.S.film;
    if (!f || idx == null) return;
    const t = f._taglines[idx];
    if (!t) return;
    f.tagline = t.line;
    f.taglineQ = t.q;
    G.log(`The tagline hits the papers: “${t.line}”`, t.q >= 7 ? "story" : t.q <= 3 ? "bad" : "");
    G.save();
  };

  // ---------- test screening ----------
  G.testScreen = function () {
    const S = G.S, f = S.film;
    if (!G.canScreen()) return false;
    G.spend(0.5);
    f.costs.other = Math.round((f.costs.other + 0.5) * 10) / 10;
    f.screened = true;
    const hype = Math.max(0, (G.netBuzz() / 100) - (f.quality / 100) - 0.5);
    const score = Math.round(D.clamp(f.quality + f.taglineQ * 2 - hype * 15 + D.rand(-8, 8), 5, 100));
    f.screenScore = score;
    G.log(`Test screening: the audience gives it ${score}/100.`, score >= 70 ? "story" : score < 45 ? "bad" : "");
    G.save();
    return true;
  };

  G.reshoot = function () {
    const f = G.S.film;
    if (!f || !f.screened || f.screenScore >= 55 || !G.canAfford(1.5)) return false;
    G.spend(1.5);
    f.costs.other = Math.round((f.costs.other + 1.5) * 10) / 10;
    f.quality = Math.round(D.clamp(f.quality + 8, 5, 100));
    f.buzzPos = Math.max(0, Math.round((f.buzzPos - 10) * 10) / 10);
    f.screenScore = 0;
    G.log("Reshoots completed. The film is sharper; the hype cooled a little.", "good");
    G.save();
    return true;
  };

  G.terminateFilm = function () {
    const S = G.S;
    if (!S.film) return;
    const spent = Math.round((S.film.costs.production + S.film.costs.cast + S.film.costs.dev + S.film.costs.ads + S.film.costs.events + S.film.costs.other) * 10) / 10;
    G.log(`You pulled the plug on "${S.film.title}". Every dollar spent on it is gone.`, "bad");
    G.logFilm(S.film, { cancelled: true, spent });
    S.film = null;
    S.pendingEvent = null;
    S.state = "script";
    G.offerScripts();
    G.save();
  };

  // shared helper: append a finished/terminated film to the career log (capped)
  G.logFilm = function (f, extra) {
    G.S.filmLog.push({ t: f.title, g: f.genre, q: f.quality, poster: f.poster || null, date: G.dateStr(), y: G.S.date.year, ...extra });
    if (G.S.filmLog.length > 12) G.S.filmLog.shift();
  };

})(GAME);

/* ============================================================
   game.js — chunk C: box office, results, game over, API flatten
   ============================================================ */
(function (G) {
  const D = G._internal.D;

  // ---------- advance reviews (the critics weigh in before opening) ----------
  G.critique = function () {
    const S = G.S, f = S.film;
    if (!f || f.reviews) return;
    const r = D.makeReviews(f.quality, G.netBuzz());
    f.reviews = r;
    const delta = r.avg >= 80 ? 10 : r.avg >= 65 ? 6 : r.avg >= 50 ? 0 : r.avg >= 35 ? -2 : -5;
    if (delta > 0) f.buzzPos = Math.round(D.clamp(f.buzzPos + delta, 0, 150) * 10) / 10;
    else if (delta < 0) f.buzzNeg = Math.round(D.clamp(f.buzzNeg - delta, 0, 150) * 10) / 10;
    G.log(`Advance reviews are in: ${D.criticLabel(r.avg)} (avg ${r.avg}/100). ${delta > 0 ? `Buzz +${delta}.` : delta < 0 ? `Buzz ${delta}.` : "Buzz unchanged."}`, delta >= 5 ? "story" : delta < 0 ? "bad" : "");
    G.save();
  };

  // ---------- release & box office ----------
  G.release = function () {
    const S = G.S, f = S.film;
    if (!G.canRelease()) return;
    G.critique();
    // the trophy shelf does its quiet work: past honors add buzz
    const honors = S.awards.filter(a => !a.razzie).length;
    if (honors > 0) {
      const b = Math.min(4, honors) * 1.5;
      f.buzzPos = Math.round(D.clamp(f.buzzPos + b, 0, 150) * 10) / 10;
      G.log(`The studio's shelf of awards did its quiet work: +${b} buzz.`, "good");
    }
    const audience = D.GENRES[f.genre].audience; // reputation boost applied in weekGross
    const heat = S.trends[f.genre] != null ? S.trends[f.genre] : 1; // genre trend
    const R = f.quality / 100;
    // net buzz can now genuinely hurt: floored so a scandal can't zero the opening
    const buzzFactor = Math.max(0.35, 1 + 5.5 * (G.netBuzz() / 100));
    const opening = audience * heat * buzzFactor * (0.55 + 0.55 * R) * D.rand(0.9, 1.1);
    const legs = D.GENRES[f.genre].legs || 0;
    S.boxoffice = {
      my: { title: f.title, genre: f.genre, studio: S.studio.name, q: R, legs, potential: opening, last: 0, total: 0, critics: f.reviews ? f.reviews.avg : 0 },
      rivals: D.makeRivals(R, f.genre, (g) => (S.trends[g] != null ? S.trends[g] : 1)),
      week: 0, done: false, curve: [], firstLogged: false
    };
    S.state = "boxoffice";
    G.log(`"${f.title}" opens in theaters. The marquee lights come on.`, "story");
    G.save();
  };

  G.nextBoWeek = function () {
    const S = G.S, bo = S.boxoffice;
    if (!bo || bo.done) return;
    bo.week++;
    const repBoost = 1 + S.studio.reputation / 250;
    D.weekGross(bo.my, bo.week - 1, repBoost, bo.my.legs || 0);
    for (const r of bo.rivals) D.weekGross(r, bo.week - 1, 1, r.legs || 0);
    bo.curve.push(bo.my.last);
    if (!bo.firstLogged && G.boRank() === "#1") {
      bo.firstLogged = true;
      G.log(`"${bo.my.title}" is number one in the country. The marquee doesn't quite fit it.`, "story");
    }
    G.addDays(7);
    if (bo.my.last < 1.0 || bo.week >= 14) bo.done = true;
    G.save();
  };

  G.boRank = function () {
    const bo = G.S.boxoffice;
    if (!bo) return "—";
    const all = [bo.my, ...bo.rivals].sort((a, b) => b.last - a.last);
    return "#" + (all.findIndex(x => x === bo.my) + 1);
  };

  // ---------- results ----------
  G.finishBoxOffice = function () {
    const S = G.S, f = S.film, bo = S.boxoffice;
    if (!f || !bo) return;
    const gross = bo.my.total;
    const debt = Math.max(0, Math.round(-S.studio.funds * 10) / 10);
    S.studio.funds = Math.round((S.studio.funds + gross) * 10) / 10;
    const totalCosts = Math.round((f.costs.production + f.costs.cast + f.costs.dev + f.costs.ads + f.costs.events + f.costs.other) * 10) / 10;
    // debt is a funding source, not an extra cost: the borrowed dollars are
    // already inside totalCosts. Repayment is a cash-flow event (the gross
    // above absorbs it); the bank's trust nudge below is the cost of the line.
    const profit = Math.round((gross - totalCosts) * 10) / 10;
    const margin = totalCosts > 0 ? profit / totalCosts : 0;
    const R = f.quality / 100;
    let grade;
    if (R > 0.85 && margin > 2.5) grade = "S";
    else if (margin > 2) grade = "A+";
    else if (margin > 1.2) grade = "A";
    else if (margin > 0.8) grade = "B+";
    else if (margin > 0.5) grade = "B";
    else if (margin > 0.15) grade = "C";
    else if (margin > -0.2) grade = "D";
    else grade = "F";
    const repDelta = Math.round(R * 4.5 + Math.min(1.5, Math.max(-1.5, margin)) * 3);
    S.studio.reputation = D.clamp(S.studio.reputation + repDelta, 0, 100);
    S.studio.films++;
    if (gross > S.studio.bestGross) S.studio.bestGross = gross;
    S.lastFilmSummary = {
      title: f.title, genre: f.genre, quality: f.quality, gross, costs: totalCosts,
      profit, margin, grade, repDelta, weeks: bo.week, poster: f.poster,
      screened: f.screened, screenScore: f.screenScore, tagline: f.tagline,
      critics: f.reviews ? f.reviews.avg : null,
      debt: debt, totalCosts: totalCosts, costs: f.costs
    };
    if (debt > 0) {
      if (S.studio.funds < 0) G.log(`The box office cannot cover the ${D.money(debt)} credit line. The bank is circling.`, "bad");
      else G.log(`The studio repays ${D.money(debt)} of the credit line from the box office.`);
    }
    G.log(`"${f.title}" closes: ${D.money(gross)}${profit >= 0 ? " in the black." : " in the red."}`, "story");
    G.logFilm(f, { gross, profit, grade, weeks: bo.week });

    // ---- metagame updates ----
    S.bank.trust = Math.round(D.clamp(S.bank.trust
      + (margin > 1 ? 12 : margin > 0.3 ? 6 : margin > 0 ? 3 : margin > -0.3 ? -4 : -10)
      - (debt > 0 ? 9 : 0), 0, 100) * 10) / 10;
    S.prestige = Math.round(D.clamp(S.prestige + { "S": 14, "A+": 10, "A": 7, "B+": 4, "B": 2, "C": 0, "D": -3, "F": -8 }[grade], 0, 100) * 10) / 10;
    if (grade === "S" || grade === "A+") S.awards.push({ title: f.title, poster: f.poster || null, name: D.pick(D.AWARDS), razzie: false, date: G.dateStr(), y: S.date.year });
    else if (grade === "F") S.awards.push({ title: f.title, poster: f.poster || null, name: D.pick(D.RAZZIES), razzie: true, date: G.dateStr(), y: S.date.year });
    if (S.awards.length > 20) S.awards.shift();
    S.repHistory.push({ rep: S.studio.reputation, date: G.dateStr() });
    if (S.repHistory.length > 20) S.repHistory.shift();

    S.film = null;
    S.boxoffice = null;
    const fired = G.boardMeeting(grade, margin, R);
    S.state = fired ? "gameover" : "results";
    G.bumpLegacy();
    G.save();
  };

  // the board meets after every film; approval 0 is the fire branch,
  // with a one-time dramatic reprieve for studios with something to their name
  G.boardMeeting = function (grade, margin, R) {
    const S = G.S, b = S.board;
    let d = Math.round(R * 8 + Math.min(1, margin) * 12 - Math.max(0, -margin) * 15);
    d = D.clamp(d, -12, 12);
    b.approval = Math.round(D.clamp(b.approval + d, 0, 100) * 10) / 10;
    b.lastNote = d >= 8 ? "The board was 'impressed'. In this room, that is a standing ovation."
      : d >= 3 ? "Nodding. The kind of nodding that means 'we will remember this'."
      : d >= -3 ? "Muted expressions. A spreadsheet is slid across the table."
      : "The silence after the numbers is the message.";
    if (b.approval <= 0) {
      const honors = S.awards.filter(a => !a.razzie).length;
      if (!b.reprieved && (S.studio.reputation >= 40 || S.studio.bestGross >= 20 || honors > 0)) {
        b.reprieved = true;
        b.approval = 15;
        b.lastNote = "An emergency meeting. Someone in the back remembers the good years. One last film. This is the last.";
        G.log("The board votes 4-3 to give you one last picture. The pen is very heavy.", "story");
        return false;
      }
      S.state = "gameover";
      S.gameOverType = "fired";
      S.gameOverReason = "The board hands you a cardboard box. The office plant is your only souvenir.";
      G.log("The board votes. It is not in your favor. You are fired.", "bad");
      return true;
    }
    return false;
  };

  // ---------- headquarters: the between-films metagame ----------
  G.enterHQ = function () {
    const S = G.S;
    if (!S.studio) return;
    // a broke studio doesn't get a boardroom tour
    if (S.studio.funds < 0) {
      S.state = "gameover";
      S.gameOverType = "bank";
      S.gameOverReason = "The debt from the last picture proved too heavy. The bank repossessed the lot.";
      G.log("The bank repossesses the lot. The marquee goes dark.", "bad");
      G.save();
      return;
    }
    S.state = "hq";
    // the industry's mood drifts after every film (gentle swings)
    for (const g of Object.keys(D.GENRES)) {
      S.trends[g] = Math.round(D.clamp(S.trends[g] + D.rand(-0.13, 0.11), 0.75, 1.3) * 100) / 100;
    }
    S.news = D.makeHeadlines(S.studio.name, S.lastFilmSummary, S.trends).map((text) => ({ date: G.dateStr(), text }));
    if (S.news.length > 14) S.news = S.news.slice(-14);
    G.save();
  };
  G.beginNextProject = function () { G.offerScripts(); };

  G.nextFilm = function () { G.enterHQ(); };

  // ---------- bankruptcy watch ----------
  const _spend = G.spend;
  G.spend = function (amount) {
    _spend(amount);
    const S = G.S;
    if (S.studio.funds < -G.creditLimit() && ["production", "casting", "budget", "script", "boxoffice"].includes(S.state)) {
      S.state = "gameover";
      S.gameOverReason = "The credit line ran dry. The bank repossessed the lot.";
      G.log("The credit line hits its limit. The bank sends a letter, and it is not a good letter.", "bad");
      G.save();
    }
  };

  // ---------- the boardroom: advisory notes ----------
  G._hintSeen = {}; // per-topic: recently used template ids (anti-repetition)
  G._hintTab = "";  // ui.js sets the active HQ tab for context

  G.toggleAdvisors = function () {
    G.S.advisorsOn = !G.S.advisorsOn;
    try { localStorage.setItem("simcinema_advisors", G.S.advisorsOn ? "1" : "0"); } catch (e) { /* ignore */ }
    if (G.S.studio) G.save();
    return G.S.advisorsOn;
  };

  G.advisorsPref = function () {
    try { const p = localStorage.getItem("simcinema_advisors"); return p != null ? p === "1" : true; }
    catch (e) { return true; }
  };

  // build the context an exec "sees" for a given decision point
  G._hintCtx = function (topic) {
    const S = G.S, st = S.studio, f = S.film;
    const tr = S.trends || G._internal.defaultTrends();
    const ranked = Object.keys(D.GENRES).sort((a, b) => tr[b] - tr[a]);
    const heatOf = (g) => (tr[g] != null ? tr[g] : 1);
    const c = {
      M: D.money, sM: (v) => (v < 0 ? "−" + D.money(-v) : D.money(v)),
      funds: st.funds, limit: G.creditLimit(),
      fundable: Math.round((st.funds + G.creditLimit()) * 10) / 10,
      rep: Math.round(st.reputation), prestige: Math.round(S.prestige),
      talentOff: Math.min(15, Math.round(S.prestige * 0.15)),
      bankTrust: Math.round(S.bank.trust), boardApproval: Math.round(S.board.approval),
      filmsMade: st.films,
      hotGenre: ranked[0], coldGenre: ranked[ranked.length - 1],
      hotHeat: heatOf(ranked[0]), coldHeat: heatOf(ranked[ranked.length - 1])
    };
    // the same math release() uses, so an exec's projection IS the game's:
    // opening-week gross for a given quality/genre/buzz, and the decay curve
    const openingOf = (quality, genre, net, rep) => {
      const g = D.GENRES[genre];
      if (!g) return 0;
      const R = quality / 100;
      const buzzFactor = Math.max(0.35, 1 + 5.5 * (net / 100));
      return g.audience * heatOf(genre) * buzzFactor * (0.55 + 0.55 * R) * (1 + rep / 250);
    };
    const decayOf = (quality, genre) => {
      const g = D.GENRES[genre];
      return D.clamp(0.62 + 0.32 * (quality / 100) + (g ? g.legs || 0 : 0), 0.5, 0.9);
    };
    const runTotal = (opening, quality, genre) => {
      const d = decayOf(quality, genre);
      let t = 0, w = opening;
      // the game always logs the opening week, even under $1M — count it
      for (let i = 0; i < 14; i++) { t += w; if (w < 1) break; w *= d; }
      return Math.round(t * 10) / 10;
    };
    if (topic === "script") {
      const sel = S.selectedScript != null ? S.scriptOptions[S.selectedScript] : null;
      const opts = (S.scriptOptions || []).map((o) => ({
        genre: o.genre, title: o.title, quality: o.quality, estBudget: o.estBudget, devCost: o.devCost,
        audience: D.GENRES[o.genre].audience, heat: heatOf(o.genre)
      }));
      let bestIdx = null, smartIdx = null, bestQ = 0, smartScore = -1;
      (S.scriptOptions || []).forEach((o, i) => {
        if (bestIdx == null || o.quality > S.scriptOptions[bestIdx].quality) bestIdx = i;
        const s = o.quality * D.GENRES[o.genre].audience * heatOf(o.genre);
        if (smartIdx == null || s > smartScore) { smartIdx = i; smartScore = s; }
      });
      if (bestIdx != null) bestQ = S.scriptOptions[bestIdx].quality;
      Object.assign(c, {
        rewrites: S.rewrites, selIdx: S.selectedScript, sel, opts,
        genre: sel ? sel.genre : "—", title: sel ? sel.title : "—",
        quality: sel ? sel.quality : 0,
        trend: sel ? heatOf(sel.genre) : 1,
        audience: sel ? D.GENRES[sel.genre].audience : 1,
        bestIdx, smartIdx, bestQ,
        devCost: sel ? Math.round((sel.devCost + S.rewrites * 0.3) * 10) / 10 : 0
      });
    } else if (topic === "budget") {
      const p = S.pendingScript || {};
      const est = p.estBudget || 1;
      const qScript = p.quality != null ? p.quality : 55;
      const factorAt = (b) => 0.5 + 0.5 * Math.min(1, b / est) + 0.1 * Math.min(1, Math.max(0, b / est - 1));
      const projAt = (b) => Math.round(D.clamp((0.55 * qScript + 0.45 * 45) * factorAt(b), 5, 100));
      Object.assign(c, {
        budget: S.budget, est, ratio: Math.round((S.budget / Math.max(1, est)) * 100) / 100,
        genre: p.genre || "—", title: p.title || "—",
        proj: projAt(S.budget), projIdeal: projAt(est),
        weeks: G.productionWeeks(), weekly: G.weeklyProdCost()
      });
    } else if (topic === "casting") {
      const o = S.castOptions, p = S.castPicks;
      const get = (slot) => (o && p[slot] != null ? o[slot][p[slot]] : null);
      const lead = get("lead"), co = get("co"), sup = get("sup"), dir = get("dir");
      const val = (t) => (t ? t.draw / Math.max(0.2, t.cost) : 0);
      let valueLoss = 0, bestLead = null, cheapLead = null;
      if (o && o.lead && lead) {
        bestLead = o.lead.reduce((a, x) => val(x) > val(a) ? x : a);
        cheapLead = o.lead.reduce((a, x) => x.cost < a.cost ? x : a);
        valueLoss = Math.max(0, (val(bestLead) - val(lead)) / Math.max(0.001, val(bestLead)));
      }
      const facts = (slot, key) => {
        const arr = (o && o[slot]) || [];
        if (!arr.length) return null;
        return {
          best: arr.reduce((a, x) => x[key] > a[key] ? x : a),
          cheap: arr.reduce((a, x) => x.cost < a.cost ? x : a)
        };
      };
      const leadF = facts("lead", "draw");
      const dirF = facts("dir", "score");
      const pScript = S.pendingScript || {};
      const qScript = pScript.quality != null ? pScript.quality
        : (S.scriptOptions && S.selectedScript != null ? S.scriptOptions[S.selectedScript].quality : 55);
      const wOf = (t, k) => (t ? t[k] / Math.max(0.2, t.cost) : 0);
      const valuePick = (slot, key) => {
        const arr = (o && o[slot]) || [];
        if (!arr.length) return null;
        return arr.reduce((a, x) => wOf(x, key) > wOf(a, key) ? x : a);
      };
      const vLead = valuePick("lead", "draw"), vCo = valuePick("co", "draw"), vSup = valuePick("sup", "draw"), vDir = valuePick("dir", "score");
      const castScore = Math.round((lead ? lead.draw * 0.35 : 0) + (co ? co.draw * 0.30 : 0) + (sup ? sup.draw * 0.20 : 0) + (dir ? dir.score * 0.15 : 0));
      const valueCastScore = Math.round((vLead ? vLead.draw * 0.35 : 0) + (vCo ? vCo.draw * 0.30 : 0) + (vSup ? vSup.draw * 0.20 : 0) + (vDir ? vDir.score * 0.15 : 0));
      const est = pScript.estBudget || 1;
      const bf = 0.5 + 0.5 * Math.min(1, S.budget / est) + 0.1 * Math.min(1, Math.max(0, S.budget / est - 1));
      Object.assign(c, {
        total: G.castTotalCost(), lead, co, sup, dir, valueLoss,
        leadDraw: lead ? lead.draw : 0, leadCost: lead ? lead.cost : 0,
        leadSocial: lead ? lead.social : 0,
        bestLead, cheapLead,
        leadMaxDraw: leadF ? leadF.best.draw : 0, leadMaxCost: leadF ? leadF.best.cost : 0,
        dirScore: dir ? dir.score : 0, dirCost: dir ? dir.cost : 0,
        bestDir: dirF ? dirF.best : null, cheapDir: dirF ? dirF.cheap : null,
        afterFees: Math.round((st.funds + G.creditLimit() - G.castTotalCost()) * 10) / 10,
        projQ: Math.round(D.clamp((0.55 * qScript + 0.45 * castScore) * bf, 5, 100)),
        valueProjQ: Math.round(D.clamp((0.55 * qScript + 0.45 * valueCastScore) * bf, 5, 100))
      });
    } else if (topic === "production" && f) {
      const net = G.netBuzz();
      const opening = openingOf(f.quality, f.genre, net, st.reputation);
      const spent = Math.round((f.costs.production + f.costs.cast + f.costs.dev + f.costs.ads + f.costs.events + f.costs.other) * 10) / 10;
      const projCost = Math.round((spent + G.weeklyProdCost() * Math.max(0, f.totalWeeks - f.week)) * 10) / 10;
      Object.assign(c, {
        week: f.week, totalWeeks: f.totalWeeks, progress: G.totalProduction(),
        quality: Math.round(f.quality), social: f.social,
        buzzPos: Math.round(f.buzzPos), buzzNeg: Math.round(f.buzzNeg),
        net: Math.round(net), genre: f.genre, title: f.title,
        screened: f.screened, screenScore: f.screenScore,
        canScreen: G.canScreen(), canRelease: G.canRelease(),
        taglineSet: !!f.tagline, weekCost: G.weeklyProdCost(),
        spent,
        opening: Math.round(opening * 10) / 10,
        projTotal: runTotal(opening, f.quality, f.genre),
        projCost,
        decay: Math.round(decayOf(f.quality, f.genre) * 1000) / 10,
        socialGain: Math.round(9 * (1 + f.social / 200) * 10) / 10
      });
    } else if (topic === "boxoffice" && S.boxoffice) {
      const bo = S.boxoffice;
      let top = null;
      for (const r of bo.rivals) if (!top || r.last > top.last) top = r;
      const decay = decayOf(Math.round(bo.my.q * 100), bo.my.genre);
      // at week 0 the opening hasn't logged yet, so seed the run with the potential
      let projTotal = bo.my.total + (bo.my.last > 0 ? 0 : bo.my.potential);
      if (!bo.done) {
        let w = bo.my.last > 0 ? bo.my.last : bo.my.potential;
        for (let i = 1; i < 14; i++) { w *= decay; if (w < 1) break; projTotal += w; }
      }
      const costs = f ? Math.round((f.costs.production + f.costs.cast + f.costs.dev + f.costs.ads + f.costs.events + f.costs.other) * 10) / 10 : 0;
      const prev = bo.curve.length >= 2 ? bo.curve[bo.curve.length - 2] : bo.my.last;
      Object.assign(c, {
        week: bo.week, rank: parseInt(String(G.boRank()).replace("#", ""), 10) || 0,
        gross: Math.round(bo.my.total * 10) / 10,
        last: Math.round(bo.my.last * 10) / 10,
        prev: Math.round(prev * 10) / 10,
        genre: bo.my.genre, heat: heatOf(bo.my.genre),
        critics: bo.my.critics || 0, done: bo.done, topRival: top,
        decay: Math.round(decay * 1000) / 10,
        projTotal: Math.round(projTotal * 10) / 10,
        costs
      });
    } else if (topic === "results" && S.lastFilmSummary) {
      const s = S.lastFilmSummary;
      const tc = Math.max(0.01, s.totalCosts);
      const parts = { production: s.costs.production, cast: s.costs.cast, dev: s.costs.dev, ads: s.costs.ads, events: s.costs.events + s.costs.other };
      let biggest = "production";
      for (const k in parts) if (parts[k] > parts[biggest]) biggest = k;
      Object.assign(c, {
        grade: s.grade, profit: s.profit, margin: Math.round(s.margin * 100) / 100,
        quality: s.quality, gross: s.gross, repDelta: s.repDelta,
        screened: s.screened, weeks: s.weeks, genre: s.genre,
        totalCosts: s.totalCosts, debt: s.debt,
        castCost: s.costs.cast, prodCost: s.costs.production, devCost: s.costs.dev, adsCost: s.costs.ads,
        castShare: Math.round((s.costs.cast / tc) * 100),
        adsShare: Math.round((s.costs.ads / tc) * 100),
        biggest
      });
    } else if (topic === "hq") {
      const s = S.lastFilmSummary;
      Object.assign(c, {
        tab: G._hintTab || "dashboard",
        lastGrade: s ? s.grade : null,
        lastMargin: s ? Math.round(s.margin * 100) / 100 : null,
        lastProfit: s ? s.profit : null
      });
    }
    return c;
  };
  // the one public entry point: the UI asks, an exec answers
  G.hint = function (topic) {
    const S = G.S;
    if (!S.studio || S.state === "title" || S.state === "studio" || S.state === "gameover") return null;
    if (!S.advisorsOn) return null;
    let c;
    try { c = G._hintCtx(topic); } catch (e) { return null; }
    const seen = G._hintSeen[topic] = G._hintSeen[topic] || [];
    const h = D.pickHint(topic, c, seen.slice(-3));
    if (!h) return null;
    seen.push(h.tid);
    if (seen.length > 8) seen.shift();
    return h;
  };

  // ---------- the production mini-dashboard: one bundle of projections ----------
  // DOM-free, built from the SAME math as the hint engine and release() — the
  // opening/decay/run formulas are referenced, not duplicated. The composite
  // is a projection, not a promise: the critic step, buzz drift, and the
  // opening-week noise still decide the real outcome.
  G.projection = function () {
    const S = G.S, f = S.film;
    if (!f) return null;
    const c = G._hintCtx("production");
    const margin = c.projCost > 0 ? c.projTotal / c.projCost - 1 : 0;
    // composite: expected margin dominates, quality and net buzz temper it.
    // tuned so strong play reads ~65-80, break-even ~25-40, and F-track low.
    const marginScore = D.clamp((margin - 0.2) / 1.3, 0, 1) * 100; // −20%→0, +110%→100
    const buzzScore = D.clamp((c.net + 10) / 50, 0, 1) * 100;       // −10→0, +40→100
    const success = Math.round(D.clamp(0.45 * marginScore + 0.30 * c.quality + 0.25 * buzzScore, 0, 100));
    const band = success >= 70 ? "hit" : success >= 45 ? "viable" : success >= 25 ? "rough" : "cliff";
    // the genre ceiling: the biggest opening this genre+heat+rep could throw
    // (quality 100, net buzz +60) — the opening bar is relative to it
    const g = D.GENRES[f.genre];
    const heat = S.trends[f.genre] != null ? S.trends[f.genre] : 1;
    const maxOpening = g.audience * heat * (1 + 5.5 * 0.6) * 1.1 * (1 + S.studio.reputation / 250);
    const openingRel = Math.round((c.opening / Math.max(0.1, maxOpening)) * 100) / 100;
    // cash left when the picture wraps (before the box office returns),
    // measured against the whole fundable amount
    const remaining = Math.round((Math.max(0, f.totalWeeks - f.week) * G.weeklyProdCost()) * 10) / 10;
    const cashAfter = Math.round((S.studio.funds - remaining) * 10) / 10;
    const fundable = Math.round((S.studio.funds + G.creditLimit()) * 10) / 10;
    return {
      success, band,
      quality: c.quality, net: c.net, buzzPos: c.buzzPos, buzzNeg: c.buzzNeg,
      opening: c.opening, openingRel,
      projTotal: c.projTotal, projCost: c.projCost, margin,
      cashAfter, fundable,
      week: c.week, totalWeeks: c.totalWeeks, progress: c.progress
    };
  };

  // ---------- small helpers for the UI ----------
  G.taglineOptions = function () {
    const f = G.S.film;
    if (!f) return [];
    if (!f._taglines) f._taglines = D.makeTaglines(f.genre);
    return f._taglines;
  };

  G.screenQuotes = function () {
    const f = G.S.film;
    if (!f || !f.screened) return [];
    const s = f.screenScore;
    const bucket = s >= 80 ? "great" : s >= 60 ? "good" : s >= 40 ? "meh" : "bad";
    return D.shuffle(D.SCREEN_QUOTES[bucket]).slice(0, 3);
  };

  // ---------- flatten the API ----------
  Object.defineProperties(G, {
    state: { get: () => G.S.state, enumerable: true },
    studio: { get: () => G.S.studio, enumerable: true },
    film: { get: () => G.S.film, enumerable: true },
    messages: { get: () => G.S.messages, enumerable: true },
    pendingEvent: { get: () => G.S.pendingEvent, enumerable: true },
    boxoffice: { get: () => G.S.boxoffice, enumerable: true },
    lastFilmSummary: { get: () => G.S.lastFilmSummary, enumerable: true },
    boDone: { get: () => !!(G.S.boxoffice && G.S.boxoffice.done), enumerable: true },
    gameOverReason: { get: () => G.S.gameOverReason, enumerable: true },
    gameOverType: { get: () => G.S.gameOverType, enumerable: true },
    pendingScript: { get: () => G.S.pendingScript, enumerable: true },
    advisorsOn: {
      get: () => (G.S.studio ? (G.S.advisorsOn != null ? G.S.advisorsOn : true) : G.advisorsPref()),
      set: (v) => { G.S.advisorsOn = !!v; },
      enumerable: true
    }
  });

  G.selectScript = function (index, rewrites) {
    G.setRewrites(rewrites == null ? G.S.rewrites : rewrites);
    G.confirmScript(index);
  };

  G.randomDecider = function () {
    const ev = G.S.pendingEvent;
    if (ev) G.resolveEvent(Math.floor(Math.random() * ev.choices.length));
  };

  G.restart = function () {
    G.clearSave();
    const S = G.S;
    S.state = "title";
    S.studio = null;
    S.film = null;
    S.boxoffice = null;
    S.messages = [];
    S.lastFilmSummary = null;
    S.pendingEvent = null;
    S.filmLog = [];
    S.prestige = 25;
    S.bank = { trust: 50 };
    S.board = { approval: 50, reprieved: false, lastNote: "" };
    S.trends = G._internal.defaultTrends();
    S.awards = [];
    S.repHistory = [];
    S.news = [];
    S.gameOverType = "bank";
    S.advisorsOn = G.advisorsPref();
    S.paper = null;
    G._hintSeen = {};
  };

})(GAME);
