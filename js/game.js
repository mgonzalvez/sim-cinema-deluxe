/* ============================================================
   SIM CINEMA DELUXE — game.js
   Core simulation: the state machine + all game math.
   Chunk A: state, dates, save/load, studio, script, budget.
   ============================================================ */
"use strict";

const GAME = (() => {
  const D = DATA;
  const SAVE_KEY = "simcinema_save_v2"; // bumped: HQ metagame state added
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
    news: []                  // [{ date, text }] industry headlines for the HQ
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
    S.state = "script";
    log(`The ${S.studio.name} lot opens with $15M and a dream.`, "gold");
    offerScripts();
    save();
  }

  function save() {
    try {
      const blob = { studio: S.studio, state: S.state, date: S.date, messages: S.messages,
        scriptOptions: S.scriptOptions, selectedScript: S.selectedScript, rewrites: S.rewrites,
        budget: S.budget, castOptions: S.castOptions, castPicks: S.castPicks, film: S.film,
        boxoffice: S.boxoffice, lastFilmSummary: S.lastFilmSummary, filmLog: S.filmLog,
        prestige: S.prestige, bank: S.bank, board: S.board, trends: S.trends,
        awards: S.awards, repHistory: S.repHistory, news: S.news, gameOverType: S.gameOverType };
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
      // migration: old single-buzz saves → dual meters (positive keeps the value)
      if (S.film && S.film.buzz != null && S.film.buzzPos == null) {
        S.film.buzzPos = S.film.buzz;
        S.film.buzzNeg = 0;
        delete S.film.buzz;
      }
      S.pendingEvent = null;
      S.eventPool = [];
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
    save();
  }

  function setRewrites(n) { S.rewrites = D.clamp(n, 0, 4); save(); }

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
    S.castOptions = {
      lead: [D.makeActor(0), D.makeActor(0), D.makeActor(0)].map(discount),
      co: [D.makeActor(1), D.makeActor(1), D.makeActor(1)].map(discount),
      sup: [D.makeActor(2), D.makeActor(2), D.makeActor(2)].map(discount),
      dir: [D.makeDirector(), D.makeDirector(), D.makeDirector(), D.makeDirector(), D.makeDirector()].map(discount)
    };
    S.castPicks = { lead: null, co: null, sup: null, dir: null };
    S.state = "casting";
    save();
  }

  return { S, newStudio, save, load, hasSave, clearSave, offerScripts, setRewrites, confirmScript,
    setBudget, budgetFactor, projectedQuality, productionWeeks, confirmBudget, dateStr, addDays, log, spend, weeklyProdCost, creditLimit, canAfford,
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
    const profit = Math.round((gross - totalCosts - debt) * 10) / 10;
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
    if (debt > 0) G.log(`The studio repays $${debt}M of the credit line from the box office.`, "bad");
    G.log(`"${f.title}" closes: ${D.money(gross)}${profit >= 0 ? " in the black." : " in the red."}`, "story");
    G.logFilm(f, { gross, profit, grade, weeks: bo.week });

    // ---- metagame updates ----
    S.bank.trust = Math.round(D.clamp(S.bank.trust
      + (margin > 1 ? 12 : margin > 0.3 ? 6 : margin > 0 ? 3 : margin > -0.3 ? -4 : -10)
      - (debt > 0 ? 5 : 0), 0, 100) * 10) / 10;
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
    if (S.studio.funds < -G.creditLimit() * 1.2 && ["production", "casting", "budget", "script", "boxoffice"].includes(S.state)) {
      S.state = "gameover";
      S.gameOverReason = "The credit line ran dry. The bank repossessed the lot.";
      G.log("The credit line hits its limit. The bank sends a letter, and it is not a good letter.", "bad");
      G.save();
    }
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
    pendingScript: { get: () => G.S.pendingScript, enumerable: true }
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
  };

})(GAME);
