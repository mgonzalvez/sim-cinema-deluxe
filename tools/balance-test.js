/* Headless smoke + balance test for Sim Cinema Deluxe (Node).
   Loads the browser scripts into a VM and plays full games with random decisions. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

function loadWorld() {
  const sandbox = { console, Math, Date, Set, localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} } };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for (const f of ["js/data.js", "js/game.js"]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
  }
  vm.runInContext("globalThis.__DATA = DATA; globalThis.__GAME = GAME;", sandbox);
  sandbox.D = sandbox.__DATA;
  sandbox.GAME = sandbox.__GAME;
  return sandbox;
}

function dataSmoke() {
  const ctx = loadWorld();
  const D = ctx.D;
  const opts = D.makeScriptOptions(25);
  if (opts.length !== 3) throw new Error("expected 3 script options");
  const a = D.makeActor(0);
  if (!(a.draw >= 0 && a.draw <= 100)) throw new Error("bad draw");
  const r = D.makeRivals(0.5, "Action");
  if (r.length !== 9) throw new Error("expected 9 rivals");
  D.weekGross(r[0], 0, 1);
  if (!(r[0].last > 0)) throw new Error("bad weekGross");
  console.log("data smoke OK");
}

function fullGame(seedLog) {
  const ctx = loadWorld();
  const G = ctx.GAME;
  G.newStudio("Test Pictures", seedLog ? { log: seedLog } : undefined);
  let guard = 0;
  while (G.state !== "results" && G.state !== "gameover" && guard++ < 500) {
    switch (G.state) {
      case "script":
        G.selectScript(0, 1);
        break;
      case "budget":
        G.setBudget(Math.round(G.studio.funds > 30 ? 12 : 8));
        G.confirmBudget();
        break;
      case "casting": {
        const S = G.S;
        const cheap = (arr) => arr.reduce((a, x, i) => x.cost < arr[a].cost ? i : a, 0);
        G.confirmCasting(cheap(S.castOptions.lead), cheap(S.castOptions.co), cheap(S.castOptions.sup), cheap(S.castOptions.dir));
        break;
      }
      case "production":
        if (G.pendingEvent) G.randomDecider();
        else if (G.canRelease()) { if (!G.film.screened) G.testScreen(); G.release(); }
        else G.passWeek();
        break;
      case "boxoffice":
        G.nextBoWeek();
        if (G.boDone) G.finishBoxOffice();
        break;
      case "results":
        seedLog && seedLog.push(["results", G.lastFilmSummary]);
        G.nextFilm();
        break;
    }
  }
  if (guard >= 500) throw new Error("game did not terminate (guard)");
  return ctx;
}

if (process.argv.includes("--smoke")) {
  dataSmoke();
  fullGame();
  console.log("full game smoke OK");
} else {
  // balance: play 300 games, log outcomes
  const N = 300;
  let hits = 0, losses = 0, breaks = 0, bankrupt = 0, sums = [];
  let qSum = 0, grossSum = 0, costSum = 0, profitSum = 0, weeksProd = 0;
  for (let i = 0; i < N; i++) {
    const ctx = loadWorld();
    const G = ctx.GAME;
    G.newStudio("Test Pictures");
    let guard = 0;
    while (G.state !== "results" && G.state !== "gameover" && guard++ < 500) {
      switch (G.state) {
        case "script": G.selectScript(Math.floor(Math.random() * 3), Math.floor(Math.random() * 4)); break;
        case "budget":
          // random budget around estimate: 0.6x to 1.4x
          G.setBudget(Math.max(2, Math.round(G.pendingScript.estBudget * (0.6 + Math.random() * 0.8))));
          G.confirmBudget();
          break;
        case "casting":
          // random picks; sometimes pick the most expensive
          const pick = () => (Math.random() < 0.3 ? 2 : Math.floor(Math.random() * 3));
          G.confirmCasting(pick(), pick(), pick(), pick());
          break;
        case "production":
          if (G.pendingEvent) G.randomDecider();
          else if (G.canRelease() && Math.random() < 0.9) {
            if (!G.film.screened && Math.random() < 0.7) G.testScreen();
            G.release();
          } else G.passWeek();
          break;
        case "boxoffice":
          G.nextBoWeek();
          if (G.boDone) G.finishBoxOffice();
          break;
        case "results":
          G.nextFilm();
          break;
      }
    }
    const s = G.lastFilmSummary;
    if (!s) { bankrupt++; continue; }
    qSum += s.quality; grossSum += s.gross; costSum += s.totalCosts; profitSum += s.profit;
    weeksProd += s.weeks;
    if (s.profit > 0) hits++; else if (s.profit < -s.totalCosts * 0.25) losses++; else breaks++;
  }
  console.log(`games finished with results: ${N - bankrupt}  bankruptcies mid-game: ${bankrupt}`);
  console.log(`hit rate: ${(100 * hits / N).toFixed(0)}%  rough break-even: ${(100 * breaks / N).toFixed(0)}%  hard losses: ${(100 * losses / N).toFixed(0)}%`);
  console.log(`avg quality: ${(qSum / (N || 1)).toFixed(0)}  avg gross: $${(grossSum / (N || 1)).toFixed(1)}M  avg cost: $${(costSum / (N || 1)).toFixed(1)}M  avg profit: $${(profitSum / (N || 1)).toFixed(1)}M`);
  console.log(`avg production weeks: ${(weeksProd / (N || 1)).toFixed(1)}`);
}

// competent player: best script, ~1.0x budget, value casting, steady advertising
if (process.argv.includes("--skilled")) {
  const N = 200;
  let hits = 0, bankrupt = 0, qSum = 0, grossSum = 0, costSum = 0, profitSum = 0, weeksProd = 0;
  for (let i = 0; i < N; i++) {
    const ctx = loadWorld();
    const G = ctx.GAME;
    G.newStudio("Skilled Pictures");
    let guard = 0;
    while (G.state !== "results" && G.state !== "gameover" && guard++ < 500) {
      switch (G.state) {
        case "script": {
          const S = G.S;
          const best = S.scriptOptions.reduce((a, b, idx) => b.quality > S.scriptOptions[a].quality ? idx : a, 0);
          G.selectScript(best, 2);
          break;
        }
        case "budget":
          G.setBudget(Math.round(G.pendingScript.estBudget));
          G.confirmBudget();
          break;
        case "casting": {
          const S = G.S;
          const value = (a) => a.draw / Math.max(0.2, a.cost);
          const pick = (arr) => arr.reduce((best, x, i) => value(x) > value(arr[best]) ? i : best, 0);
          const dv = (d) => d.score / Math.max(0.5, d.cost);
          const dd = S.castOptions.dir;
          const dir = dd.reduce((best, x, i) => dv(x) > dv(dd[best]) ? i : best, 0);
          G.confirmCasting(pick(S.castOptions.lead), pick(S.castOptions.co), pick(S.castOptions.sup), dir);
          break;
        }
        case "production":
          if (G.pendingEvent) G.randomDecider();
          else if (G.canRelease()) {
            if (!G.film.screened && G.canScreen()) G.testScreen();
            G.release();
          } else {
            // advertise while funds allow
            const f = G.film;
            if (f.buzz < 65 && G.canAfford(4)) G.buyAd("social");
            if (f.buzz < 85 && f.phases.filming >= 45 && G.canAfford(6)) G.buyAd("trailer");
            G.passWeek();
          }
          break;
        case "boxoffice":
          G.nextBoWeek();
          if (G.boDone) G.finishBoxOffice();
          break;
        case "results":
          G.nextFilm();
          break;
      }
    }
    const s = G.lastFilmSummary;
    if (!s) { bankrupt++; continue; }
    if (s.profit > 0) hits++;
    qSum += s.quality; grossSum += s.gross; costSum += s.totalCosts; profitSum += s.profit; weeksProd += s.weeks;
  }
  console.log(`[skilled] games: ${N}  bankruptcies: ${bankrupt}  hit rate: ${(100 * hits / N).toFixed(0)}%`);
  console.log(`[skilled] avg quality: ${(qSum / N).toFixed(0)}  avg gross: $${(grossSum / N).toFixed(1)}M  avg cost: $${(costSum / N).toFixed(1)}M  avg profit: $${(profitSum / N).toFixed(1)}M`);
}
