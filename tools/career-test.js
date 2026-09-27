/* Career simulation: play consecutive films with a skilled strategy. */
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
  sandbox.GAME = sandbox.__GAME;
  return sandbox;
}

const CAREERS = 100, MAX_FILMS = 8;
const AUDIENCE = { "Action": 1.5, "Comedy": 1.3, "Drama": 1.0, "Horror": 1.1, "Sci-Fi": 1.35, "Romance": 1.0, "Animation": 1.4, "Documentary": 0.6 };
let survivors = 0, totals = [], maxFilms = 0, hitFilms = 0, filmCount = 0;

for (let c = 0; c < CAREERS; c++) {
  const ctx = loadWorld();
  const G = ctx.GAME;
  G.newStudio("Career Pictures");
  let films = 0, guard = 0;
  while (G.state !== "gameover" && films < MAX_FILMS && guard++ < 2000) {
    switch (G.state) {
      case "script": {
        const S = G.S;
        // prefer high quality AND high-audience genre
        const score = (o) => o.quality * (1 + (AUDIENCE[o.genre] - 0.6));
        const best = S.scriptOptions.reduce((a, b, i) => score(S.scriptOptions[i]) > score(S.scriptOptions[a]) ? i : a, 0);
        G.selectScript(best, 2);
        break;
      }
      case "budget":
        G.setBudget(Math.round(G.pendingScript.estBudget * 0.9));
        G.confirmBudget();
        break;
      case "casting": {
        const S = G.S;
        const value = (a) => a.draw / Math.max(0.2, a.cost);
        const pick = (arr) => arr.reduce((b, x, i) => value(x) > value(arr[b]) ? i : b, 0);
        const dv = (d) => d.score / Math.max(0.5, d.cost);
        const dd = S.castOptions.dir;
        const dir = dd.reduce((b, x, i) => dv(x) > dv(dd[b]) ? i : b, 0);
        G.confirmCasting(pick(S.castOptions.lead), pick(S.castOptions.co), pick(S.castOptions.sup), dir);
        break;
      }
      case "production":
        if (G.pendingEvent) G.randomDecider();
        else if (G.canRelease()) {
          if (!G.film.screened && G.canScreen()) G.testScreen();
          G.release();
        } else {
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
        films++;
        filmCount++;
        if (G.lastFilmSummary.profit > 0) hitFilms++;
        G.nextFilm();
        break;
    }
  }
  if (G.state !== "gameover") survivors++; // finished all 8 films (or loop guard)
  totals.push(G.studio.funds);
  if (films > maxFilms) maxFilms = films;
}

const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;
console.log(`careers: ${CAREERS}  survived to 8 films: ${survivors}  avg final funds: $${avg(totals).toFixed(1)}M`);
console.log(`films made: ${filmCount}  hit films: ${(100 * hitFilms / filmCount).toFixed(0)}%  max films in a career: ${maxFilms}`);
console.log(`worst ending: $${Math.min(...totals).toFixed(1)}M  best ending: $${Math.max(...totals).toFixed(1)}M`);
