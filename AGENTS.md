# Sim Cinema Deluxe (web) — Agent Guidelines

## Project Overview

Modern browser reimagining of the 1999 classic Mac game *Sim Cinema Deluxe*
(Hollywood film production sim). Static site: vanilla HTML/CSS/JS, no build
tools, no package.json. GitHub Pages deploy target. See `README.md` for the
research background and player-facing docs.

## Architecture

| File | Role |
|---|---|
| `index.html` | All 10 screens (title, studio, script, budget, casting, production, **HQ**, box office, results, game over) + one shared modal |
| `styles.css` | Cinematic theme (marquee gold/velvet red, film grain, responsive) |
| `js/data.js` | Content pools + procedural generators (genres, names, loglines, taglines, events, ads, rivals, critics, **award/razzie pools + industry headlines + advisory execs & hint templates** (`ADVISORS`/`HINTS`/`pickHint`)) + box office math (`weekGross`). Humor layer: parody personas (`PARODY_STARS`/`PARODY_DIRECTORS`, ~1/2 of casting draws), tongue-in-cheek loglines/events, title templates (The X / Infinite X / sequels) |
| `js/audio.js` | WebAudio synth SFX (no audio files); `SFX.play.*`, `SFX.toggle()` |
| `js/poster.js` | Procedural poster art on canvas → dataURL (genre motifs, corner sticker badges, micro credit block, grain) |
| `js/game.js` | **The simulation**: state machine + all game rules; exposes flat `GAME.*` API |
| `js/ui.js` | UI layer: screen router, all 10 screens (incl. 5-tab HQ: `RENDERERS.hq` + `HQ_RENDER`), modals (event/tagline/screening/reviews/help), autoplay timers, Top-10 table + SVG curve, save/continue, highlighted message feed, **advisory note bars** (`.hint-slot` per screen + `renderHint` + top-bar 📎 toggle) |
| `tools/balance-test.js` | Headless smoke + 300-film random + 200-film skilled simulations (Node VM) |
| `tools/career-test.js` | 100 careers × 8 films with a strong strategy |
| `tools/browser-test.js` | Real-browser verification in headless Chrome via CDP (no deps, Node ≥ 22): full 2-film career, both autoplay speeds, event/tagline/screening/reviews modals, terminate + bankruptcy + game-over branches, save/continue across a page reload. `PHASE=<screen>` mode stops at a screen and saves a PNG (needs Chrome installed) |

### State machine (game.js)

`title → studio → script → budget → casting → production ⇄(event modals) →
boxoffice → results → hq → script …` with `gameover` reachable from anywhere
(two types: `bank` and `fired` — different game-over titles).
Release keeps `state: "production"` while the critic-reviews modal is open;
`GAME.release()` then flips to `boxoffice` (the UI drives the two steps
separately: `GAME.critique()` → modal → `GAME.release()`).

### The HQ metagame (between-films hub, `S.state = "hq"`)

Persistent career state in the save blob: `prestige` 0–100, `bank { trust }`,
`board { approval, reprieved, lastNote }`, `trends` (per-genre heat 0.75–1.3),
`awards []` (trophy room), `repHistory []`, `news []`.
- **Credit line** = `4 + bank.trust*0.2` (trust, not rep, sets the line).
- **Board** (fire branch): `G.boardMeeting()` runs in `finishBoxOffice` **before**
  the results state; approval 0 → fired game over, **but** a one-time
  reprieve (→ 15) if rep ≥ 40 or bestGross ≥ 20 or any honors.
- `enterHQ` skips the HQ entirely (straight to game over) if funds < 0.
- **Prestige** = casting lever (fees ×(1 − ≤15%)); past honors add release buzz.
- **Trends** multiply openings for player **and** rivals (`makeRivals(…, heatOf)`);
  drift ±0.13 per film in `enterHQ`. UI: `RENDERERS.hq` with 5 tabs in `js/ui.js`.

### The Boardroom (advisory hint system)

A toggle-able bench of six parodic execs (`D.ADVISORS`: Gerald Fitch studio
head, Dot Quince CFO, Babs Merriweather development, Percival Loam casting,
Vivienne St. Clair PR, Mona Delacroix distribution — each with name, title,
monogram, and accent color) who pass sticky notes on every screen.
- **Content** (`data.js`): `HINTS` — ~55 templates, each
  `{ id, topic, exec, when?(ctx), t(ctx) }`; `*stars*` in a note render as
  `<em>` in the UI. `D.pickHint(topic, ctx, avoidIds)` gates on `when`,
  rotates (avoid the last few template ids), and picks pure-gossip `flavor`
  templates ~15% of the time. Topics: `script|budget|casting|production|
  boxoffice|results|hq`.
- **Engine** (`game.js`, DOM-free): `G._hintCtx(topic)` builds the ctx an exec
  "sees" (funds/limit/fundable, rep, prestige, talentOff, bank trust, board
  approval, hot/cold genre + heat, plus per-topic fields — budget ratio,
  cast picks + valueLoss, buzz/week/progress/screened, bo rank/week/critics,
  results P&L, hq tab). `G.hint(topic)` is the only public entry: returns
  `{ exec, text, tid }` or null (null on title/studio/gameover, or when
  advisors are off); tracks recent tids in `G._hintSeen` per topic.
- **Toggle**: `G.toggleAdvisors()` → `S.advisorsOn` (in the v3 save blob) +
  `simcinema_advisors` pref key that survives careers; `GAME.advisorsOn`
  getter falls back to the pref on the title screen. UI: 📎 top-bar button.
- **UI** (`ui.js`): one `.hint-slot[data-topic=…]` per screen (7 in
  `index.html`); `renderHint(topic)` re-rolls a note only when a per-topic
  "signature" changes (selected script + rewrites, budget tier, cast picks,
  week + buzz/screen/release bands, bo week; static for results/hq);
  a changed situation re-rolls immediately, an unchanged one at most
  every 1.1s so autoplay doesn't machine-gun notes. Notes are purely informational — **never
  add mechanical effects to them without rebalancing**.

`GAME.S` holds mutable state; the flat API is flattened getters
(`GAME.state`, `GAME.film`, `GAME.studio`, …) plus actions: `newStudio`,
`selectScript`, `setBudget`/`confirmBudget`, `pickTalent`/`confirmCasting`,
`passWeek`, `resolveEvent`, `buyAd`, `setTagline`, `testScreen`, `reshoot`,
`critique`, `release`, `nextBoWeek`, `finishBoxOffice`, `nextFilm`, `terminateFilm`,
`save`/`load`/`hasSave`/`clearSave`, `canAfford`, `creditLimit`,
and the boardroom: `hint(topic)`, `toggleAdvisors`, `advisorsOn`,
`advisorsPref`.

Save format: localStorage key `simcinema_save_v3` (whole state blob; bumped
when the HQ metagame landed, then the advisors setting — safe to bump again if
the shape changes).

### Key game constants (balance is sensitive — re-run tools/ after changes)

- Starting funds $15M; credit line `4 + bank.trust*0.2` ($M, trust starts 50);
  bankruptcy at 120% over the limit; debt repaid from gross in `finishBoxOffice`.
  Board approval 0 = fired (one reprieve per career; see HQ section).
- Quality = `(0.55*scriptQuality + 0.45*castScore) * budgetFactor` (±event
  deltas, +8 reshoot).
- Opening = `audience * max(0.35, 1 + 5.5*netBuzz/100) * (0.55 + 0.55*R)
  * rand(0.9,1.1)` — net buzz can genuinely hurt (see dual-buzz bullet);
  weekly decay `0.62 + 0.32*R + genre.legs` (clamped 0.5–0.9); curve ends at
  gross < $1M or week 14.
- **Dual buzz meters** (`f.buzzPos`/`f.buzzNeg`, 0–150 each): each mean-reverts to
  an ambient baseline of ~4 with ±1.5 noise, plus 20%/week chance of an outside
  blip (`DATA.OUTSIDE_BUZZ`) — the drift must *not* carry a positive expected
  increment (3%/week decay ratchets it to ~30+ and crushes every opening).
  Ads feed only positive (+4..+14 ×(1+social/200)); **PR Cleanup** is the lever
  for the negative meter (−12, unlocks at buzzNeg ≥ 10); events can move either
  (scandals often both). Net = pos − neg; opening buzz factor
  `max(0.35, 1 + 5.5*net/100)`; critics (`GAME.critique`) shift ±5..10 by
  consensus on release. Old saves with a single `buzz` are migrated on load.
- Production: `totalWeeks = clamp(round(3 + budget/4), 4, 12)`; four phases
  with genre-dependent schedule windows (`G.phaseProfile`).

## Current Status (as of this writing)

- **Done**: research; all data/audio/poster/simulation code; headless tests;
  balance tuning (strong play ≈ 87% profitable films, 93% of 8-film careers
  survive; sloppy play loses and can go bankrupt — verified via `tools/`);
  `js/ui.js` (complete UI layer); browser verification of every screen and
  flow via `tools/browser-test.js` (title, studio, script, budget, casting,
  production, box office, results, game over, help, save/continue);
  git repo + initial push (`mgonzalvez`, main/gh-pages);
  career features: `filmLog` (up to 12 films, incl. cancelled) persisted in the
  save blob; `simcinema_legacy_v1` all-time-best career record ("hall of fame"
  line on title screen, "CAREER" note on results, full recap table on game
  over);
  advance reviews — 4 critics with individual biases (`D.makeReviews`) weigh in
  on release (consensus shifts buzz ±5..10 before opening); message feed
  hierarchy ("story"/"gold" kinds → big ★ gold cards, regular dimmed) so
  production weeks read as a visible procedural story;
  dual buzz meters (positive/negative with drift, outside blips, PR Cleanup
  lever) — see the buzz bullet under Key game constants before touching it;
  **Studio Headquarters metagame** — between-films hub (dashboard, trophy room,
  board w/ fire branch + one reprieve, genre trends, gossip feed) backed by
  `prestige`/`bank`/`board`/`trends`/`awards`/`repHistory`/`news` state;
  **The Boardroom** advisory hint system — six parodic execs (Gerald Fitch
  studio head, Dot Quince CFO, Babs Merriweather development, Percival Loam
  casting, Vivienne St. Clair PR, Mona Delacroix distribution) pass
  context-aware sticky notes on every screen (`data.js` `ADVISORS`/`HINTS`/
  `pickHint`, engine `GAME.hint(topic)`, UI `renderHint`); notes re-roll on a
  per-topic "signature" change so they comment live, ~15% are pure gossip;
  📎 top-bar toggle → `S.advisorsOn` + `simcinema_advisors` pref key;
  save key bumped to `simcinema_save_v3`. Purely informational — zero balance
  impact.
- **Balance note**: the newest risk axes are the critic step and the HQ layer
  (bank trust, fired branch, trends). Current strong play measures ≈ 83–86%
  hit films / 78–86% of 8-film careers survive with $110–125M avg final funds
  (baseline before those was 87%/93%) — still within design intent (strong
  play wins, sloppy loses). Re-measure after any balance change.
- **Note**: `styles.css` needs `[hidden] { display: none !important; }` —
  author `display` rules (`.topbar`, `.modal-backdrop`) override the UA
  stylesheet's `[hidden]` rule, so the topbar/modal render on every screen
  without it.

## Next Steps (ordered)

1. ~~UI layer + browser verification~~ done; ~~git init + push~~ done;
   ~~career log + hall of fame + game-over recap~~ done (commit 396d44a);
   ~~humor pass (parody personas, 12 events, title templates, poster stickers)
   + advance reviews + story-message highlighting~~ done;
   ~~Studio Headquarters metagame (5 tabs, fire branch, trends, prestige)~~ done.
   ~~The Boardroom advisory hint system (six execs, live notes, 📎 toggle)~~
   done (commit b4055dc).
2. Optional polish: dedupe actor quips/director names, persist box-office
   movement baseline across reloads, mobile pass.

## Enhancement Suggestions (backlog)

Design guardrail for everything below: keep the balance targets
(~85% hit / 75–80% career survival / $100–130M avg) and the loving-parody
tone; run `tools/balance-test.js --smoke && tools/career-test.js &&
tools/browser-test.js` after each build; bump the save key on shape changes.

### Ready to build (small, mostly cosmetic-safe)

1. **Office toys** (your deferred point 8): one-time HQ purchases persisted as
   `S.toys []`, shown on the dashboard as a little shelf — publicist (negative
   buzz blips −10–20%), espresso machine (weekly production quality +0.5),
   office plant (bad-event odds −10–15%). $1–3M each; 2–3 toys is plenty.
   Keep effects gentle so the board/buzz levers stay primary.
2. **Bank rescue injection**: at bank trust ≥ 85, the HQ offers a one-time
   $20M infusion in exchange for ~10% of next gross — a comeback lever that
   rewards good stewardship, never exploitable twice.
3. **Sequel rights / IP flag**: an S or A+ film sets a sequellable IP; the next
   dev roll can offer the franchise slot (audience +20% but quality capped,
   one use per IP). Deepens the trophy-room payoff.
4. **Retire button**: HQ action to end the career on your own terms →
   game-over ("you walked away rich") + legacy line. Gives a non-defeat exit
   and a reason to stop at peak prestige.
5. **Career awards ceremony**: at the 8-film career end, an extra game-over
   beat tallying honors/popcorns of the run (Best Picture, Popcorn of the
   Year) — a satisfying cap on the trophy room.
6. **Rival deep-dive**: gossip lines that reveal which rival title will collide
   with your release window (and its genre heat), making the chart strategic
   rather than decorative.
7. **Trend forecaster**: the trends tab shows next-film projected heat (±
   uncertainty band) so players can plan — watch that it doesn't flatten the
   risk of guessing.

### Bigger ideas (later)

- **First-time soft difficulty** (higher starting trust, gentle board) with a
  normal-difficulty toggle after the first career.
- **Shareable career reel**: a canvas card of your 8 posters + stats for the
  game-over screen (poster.js machinery already exists).
- **Accessibility pass**: keyboard flow through casting grids, ARIA on meters,
  reduced-motion grain.
- **Sound design pass**: HQ stinger, a boardroom gavel for the firing.
- **"Same season" challenge**: URL-encoded rival-board import/export for a
  shared 10-slot chart matchup.

## Conventions

- Vanilla JS only; no frameworks, no package.json, no build step.
- Keep `js/game.js` DOM-free (it runs headless in `tools/` via a Node VM);
  all DOM belongs in `js/ui.js`.
- Keep headless tests green after any game.js/data.js change:
  `node tools/balance-test.js --smoke && node tools/career-test.js`
  (smoke also exercises the hint engine across a full game: note volume,
  exec variety, and the advisor toggle).
- New hint templates: give them a unique `id`, a `topic`, and reference only
  ctx fields that `G._hintCtx` builds for that topic; keep at least one
  always-true template per topic so the pool never empties.
- Keep browser test green after any ui.js/index.html/styles.css change:
  `node tools/browser-test.js` (drives the real UI in headless Chrome;
  `PHASE=production|boxoffice|script|casting|reviews|results|title` captures a
  screenshot of that screen and exits).
