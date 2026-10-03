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
| `js/data.js` | Content pools + procedural generators (genres, names, loglines, taglines, events, ads, rivals, critics, **award/razzie pools + industry headlines + advisory execs & hint templates** (`ADVISORS`/`HINTS`/`pickHint`), **trade-paper headlines** (`trendHeadlines`), **casting pools** (`makeActorOfTier`/`makeActorPool`/`makeCastingRound`/`makeDirectorPool`)) + box office math (`weekGross`). Humor layer: parody personas (`PARODY_STARS`/`PARODY_DIRECTORS`, ~1/2 of casting draws), tongue-in-cheek loglines/events, title templates (The X / Infinite X / sequels) |
| `js/audio.js` | WebAudio synth SFX (no audio files); `SFX.play.*`, `SFX.toggle()` |
| `js/poster.js` | Procedural poster art on canvas → dataURL (genre motifs, corner sticker badges, micro credit block, grain) |
| `js/game.js` | **The simulation**: state machine + all game rules; exposes flat `GAME.*` API (incl. `G.trendPaper()` — the trade paper, transient `S.paper`, and `G.projection()` — the dashboard bundle) |
| `js/ui.js` | UI layer: screen router, all 10 screens (incl. 5-tab HQ: `RENDERERS.hq` + `HQ_RENDER`), modals (event/tagline/screening/reviews/help), autoplay timers, Top-10 table + SVG curve, save/continue, highlighted message feed, **advisory note bars** (`.hint-slot` per screen + `renderHint` + top-bar 📎 toggle), **trade paper** (`renderTradePaper` on the script screen), **production dashboard** (`renderDashboard`, 4th prod-grid column), **casting sort controls** (session-only) |
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
- **Content** (`data.js`): `HINTS` — 74 templates (67 decision-grade + 7 flavor), each
  `{ id, topic, exec, pri, when?(ctx), t(ctx), flavor? }`; `*stars*` render as
  `<em>` in the UI. Notes quote live numbers from ctx (fees vs. draw, projected
  quality, opening, run totals, P&L lines), never adjectives. `pri` tiers the
  pool: **3 = critical** (the thing that will F the picture — star-for-value,
  silent buzz meters, red winning, cash bleed, unaffordable cast, debt the
  film can't cover), **2 = important**, **1 = routine**. `D.pickHint(topic,
  ctx, avoidIds)`: if any pri-3 gate is live it is served (never diluted by
  small talk) and is **exempt from the anti-repetition rotation** — while the
  problem exists the office keeps pointing at it; otherwise it draws the
  weighted 85% from *informational* templates only, with pure-gossip `flavor`
  templates as the 15% lottery / thin-week fallback. Topics: `script|budget|
  casting|production|boxoffice|results|hq`.
- **Engine** (`game.js`, DOM-free): `G._hintCtx(topic)` builds the ctx an exec
  "sees" — signed money (`sM`), funds/limit/fundable, rep, prestige, bank
  trust, board approval, hot/cold genre + heat, plus per-topic decision
  fields: script per-option quality/estBudget/devCost/audience + `bestIdx`/
  `smartIdx`/`devCost`; budget `ratio`/`proj`; casting per-slot picks +
  `bestLead`/`cheapLead`/`bestDir`/`cheapDir`/`valueLoss`/`afterFees`/`projQ`;
  production `opening`/`projTotal`/`decay`/`socialGain`/buzz + `runTotal`
  projection (same math as `release()`); boxoffice `last`/`prev`/`decay`/
  `projTotal`/`costs`/rank/critics; results P&L breakdown + `biggest` cost
  line + `margin`. `G.hint(topic)` is the only public entry: returns
  `{ exec, text, tid }` or null (null on title/studio/gameover, or when
  advisors are off); tracks recent tids in `G._hintSeen` per topic.
- **Toggle**: `G.toggleAdvisors()` → `S.advisorsOn` (in the v4 save blob) +
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

Save format: localStorage key `simcinema_save_v5` (whole state blob; bumped
when the HQ metagame landed, then the advisors setting, then the P&L debt fix
+ `pendingScript`, then the wider casting pool — a 3-card `castOptions` index
would dangle against a 6-card array, so old blobs are invalidated on purpose).
`S.paper` (the trade paper) is transient: rebuilt in `offerScripts()`, nulled
on `load()`/`restart()`/`newStudio()`, never in the blob.

### Key game constants (balance is sensitive — re-run tools/ after changes)

- Starting funds $15M; credit line `4 + bank.trust*0.2` ($M, trust starts 50);
  bankruptcy at **100%** of the limit (no grace — tightened from 120% when the
  wider casting pool made value plays' cash paths shallower; the help screen
  says "there is no grace"). **Debt is a funding source, not an extra
  cost**: the P&L is `gross − totalCosts` (the borrowed dollars are already
  inside totalCosts); repayment is a cash-flow event, and the *price* of the
  line is a −9 bank-trust nudge for every film that used it (the dial that
  keeps strong play inside the balance band). Board approval 0 = fired (one
  reprieve per career; see HQ section).
- Casting pool: 6 candidates per actor slot + 8 directors (was 3+5), built by
  `D.makeCastingRound()`. The spread is guaranteed at the **round** level (≥1
  Unknown + ≥1 A-List/Bankable *somewhere* in the 3 slots) plus a per-slot
  "at least one end of the spectrum" pass — **never** a per-slot both-ends
  guarantee: that triples the value play's cheap options, halves its fees, and
  flattens career cash risk until strong play barely died (see Balance note).
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
- **Projection** (`G.projection()`, DOM-free): built from the *same*
  `openingOf`/`decayOf`/`runTotal` math as `_hintCtx`/`release()` (referenced,
  never duplicated). Composite `success` = `0.45*marginScore + 0.30*quality +
  0.25*buzzScore` (margin −20%→0/+110%→100, buzz −10→0/+40→100), banded
  hit ≥70 / viable ≥45 / rough ≥25 / cliff. Measured against 5,800 career-test
  films: strong play reads 100% hit in the viable/hit bands, 85% in rough,
  and never in cliff — correlated, never a promise (critics + buzz drift still
  decide the outcome). `runTotal` counts the opening week even under $1M
  (the game always logs week 1).

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
   **Decision-grade hint redesign + P&L debt fix** — the notes were elliptical
   and generic, and a structural bug (debt double-counted in the P&L) made
   *every* credit-funded film read as a loss, so first films F'd or the studio
   went bankrupt no matter how well the player actually played. Now:
   `G._hintCtx` quotes live decision numbers (fees vs. draw, projected quality,
   opening, run totals, P&L lines);    `HINTS` are 74 priority-tiered templates (67 informational + 7 flavor)
   where critical (pri-3) notes fire first and persist while the problem does;
   `pickHint` never pads a thin week with small talk; `finishBoxOffice` P&L is
   `gross − totalCosts` (debt is a funding source; the −9 trust nudge prices
   the line); save key bumped to `simcinema_save_v4` (+`pendingScript` in the
   blob). Skilled first film went from 40% hit/−$2.2M avg to ≈68–71% hit/
   +$5–6M avg; the office now names the mistake ("the value card is Otis Vale
   at $1.3M for 54") instead of sighing about weather.
   **The trade paper, projection dashboard, and wider casting pool** (this
   batch, in order): ① a "Variety"-style industry newspaper on the script
   screen (`D.trendHeadlines` + `G.trendPaper()`, transient `S.paper` rebuilt
   when the 3 pages re-roll) surfaces the genre trend `release()` already
   applies — all 8 genres with heat bars, the 3 offered pages tagged, plus the
   honest footnote that heat multiplies rivals' openings too; ② an always-on
   PROJECTION sidebar on the production screen (`G.projection()`, 4th prod-grid
   column) with a hero success composite + 6 gauges (quality, net buzz,
   opening, run-vs-costs with break-even tick, cash at wrap, schedule);
   ③ the casting pool widened 3→6 per actor slot and 5→8 directors
   (`D.makeCastingRound`), with a **round-level** spread guarantee (≥1 Unknown
   + ≥1 big name somewhere in the three slots — see the pool bullet under Key
   game constants for why not per-slot) and session-only sort controls. Both
   ① and ② are purely informational and DOM-free in `game.js`; ③ changed the
   `castOptions` shape → save key bumped to `simcinema_save_v5`.
- **Balance note**: the newest risk axes are the critic step and the HQ layer
  (bank trust, fired branch, trends), plus the **P&L debt fix** — `finishBoxOffice`
  used to compute `profit = gross − totalCosts − debt`, double-counting the
  credit line (the borrowed dollars are already inside `totalCosts`), which
  structurally failed ~1 in 3 strong films. It is now `gross − totalCosts`,
  with the −9 bank-trust nudge for line use as the counterweight. Current
  strong play measures ≈ 90–94% hit films / 79–88% of 8-film careers survive
  with $115–132M avg final funds (pre-fix was 83–86% / 78–86% / $110–125M —
  the fix lifts skilled play; the −9 dial holds survival in the 75–80 band) —
  within design intent (strong play wins, sloppy loses; sloppy still 0% hit).
  Re-measure after any balance change.
- **Balance note (wider pool)**: the 6+8 casting pool let the value strategy
  shave ~$3.3M off per film (it now finds a genuine $0.2–0.5M unknown for
  every slot), which shallowed career cash risk and pushed survival to 95–97%
  (out of band). Tier re-pricing and the −9→−11 trust dial both under-cut; the
  lever that held the band was **bankruptcy at 100% of the limit** (no 20%
  grace — and the bank fiction always said "no grace anyway"). Current strong
  play measures ≈ 84–92% of 8-film careers survive / 93–95% hit / $125–138M
  avg final funds (mean ≈ 87% — in the 79–88% band); sloppy random play is
  0% hit and dies ~45% mid-career; the `--skilled` single-film bot is 74% hit
  with ~5–7% bankruptcies (aggressive spending; a careful human reads the
  CASH AT WRAP gauge). Re-measure after any balance change.
- **Note (projection calibration)**: the dashboard composite was validated
  against 5,800+ career-test films — strong play reads 100% actual hit in the
  viable/hit bands, 85% in rough, and never in cliff. Don't tighten the
  margin/buzz weights toward a "perfect" predictor: the critic step and buzz
  drift must keep the last ~10% of the variance honest.
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
   done (commit b4055dc);
   ~~Decision-grade hint redesign + P&L debt double-count fix~~ done
   (priority-tiered `HINTS`, `G._hintCtx` live numbers, `finishBoxOffice`
   `gross − totalCosts`, −9 trust dial, save v4) — see Current Status;
   ~~trade paper + production projection dashboard + wider casting pool~~
   done (see Current Status; save v5, bankruptcy 100%).
2. Optional polish: dedupe actor quips/director names, persist box-office
   movement baseline across reloads, mobile pass (the 4-column production grid
   with the dashboard sidebar is dense on phones).

## Enhancement Suggestions (backlog)

Design guardrail for everything below: keep the balance targets
(~85% hit / 75–80% career survival / $100–130M avg) and the loving-parody
tone; run `tools/balance-test.js --smoke && tools/career-test.js &&
tools/browser-test.js` after each build; bump the save key on shape changes.

### ~~Planned next (this batch)~~ — DONE (see Current Status; the design
briefs below are the as-built record)

Three features agreed with the player, built in risk order **trade-paper →
dashboard → wider casting**. As-built deltas vs. the briefs: the spread
guarantee landed at the *round* level (not per slot — the brief's per-slot
version broke the balance band), the dashboard gained a 6th cash gauge, the
bankruptcy rule tightened 120%→100% as the balance lever, and save is v5.

1. ~~**Trade-paper genre trends on the script screen**~~ (lowest risk) — done.
   The script screen offers 3 pages but the genre trend (`S.trends`, 0.75–1.3,
   which already multiplies the opening) is invisible there — the player picks
   blind. Add a "Variety"-style **industry newspaper** panel: a dated masthead,
   1–3 hot/cold headlines (reuse/extend `D.makeHeadlines`), and a ranked heat
   list of **all 8 genres** with the 3 offered pages tagged "on offer."
   - Purely informational — it surfaces the trend the sim already applies; do
     not make the trend more influential than the existing multiplier.
   - The heat shown must be the *actual* `S.trends` value `release()` uses
     (honest: what the paper says is what you get).
   - Re-generate the paper when the 3 scripts re-roll (a fresh page, a fresh
     week); keep it stable if the player re-enters without re-rolling.
   - Files: `data.js` (`trendPaper(trends, offeredGenres)`), `game.js`
     (`G.trendPaper()`, DOM-free), `ui.js` (`#trade-paper` in `RENDERERS.script`),
     `index.html` + `styles.css` (newspaper styling). No save-blob shape change.
   - Show a heat **bar** + hot/cool/flat label rather than the raw `1.13`
     number (reads like a trade paper; bar length encodes the value).

2. ~~**Production mini-dashboard — readiness & projected-success gauges**~~ (medium) — done.
   An **always-on right-hand sidebar** of color-coded gauges (SimCity R/C/I
   style) giving a glanceable read of the film in the making: one hero
   **"success likelihood"** composite + six metric bars — projected quality,
   buzz/awareness (net), projected opening ($/week), projected run vs. costs,
   budget/cash left, phase completion.
   - **Reuse the game's own math** — extend/reuse `G._hintCtx("production")`,
     which already computes `quality`, `net`, `opening`, `projTotal`,
     `projCost`, `weekCost`, `progress`, `funds` from `openingOf`/`runTotal`/
     `decayOf` (the same math `release()`/`finishBoxOffice` use). Add a
     DOM-free `G.projection()` returning that bundle. Do **not** duplicate the
     formulas.
   - The composite `success` (0–100) derives from expected margin + quality +
     net buzz; tune it to *correlate* with the eventual grade but **not**
     perfectly reveal it (the critic step, buzz noise, and `rand(0.9,1.1)`
     must still land the real outcome). Frame it as a projection, not a promise.
   - Re-render after every `passWeek`/`buyAd`/event/`testScreen`/`reshoot` so
     it stays live. Normalization: quality & buzz are already 0–100-ish;
     define a sane display max for opening/cash (relative, not absolute $).
   - Purely informational — no mechanical effect (the guardrail holds).
   - Files: `game.js` (`G.projection()`), `ui.js` (`renderDashboard()` called
     from `renderProduction()`), `index.html` (`#prod-dashboard` sidebar),
     `styles.css`. No save-blob shape change.
   - 7 gauges is dense on mobile — pair with the existing "mobile pass" item.

3. ~~**Wider casting pool**~~ (highest risk — balance + save bump) — done.
   Casting offers 3 candidates per actor slot (lead/co-lead/sup) + 5 directors,
   drawn from a 5-tier table (Unknown $0.1–0.5M → A-List $4.5–8M, ~½ parody
   personas). The 1999 original presented a **wide pool** across the full fee
   range; widen ours to open the decision space.
   - **Size:** 6 each for lead/co-lead/sup, 8 for director.
   - **Composition — guarantee a spread:** always ≥1 low-cost **Unknown** and
     ≥1 big star (**A-List/Bankable**) per actor slot, rest random — so the
     value-vs-name tradeoff is *always* real (never three mid-tier or three
     stars). Open: whether the director slot (a separate `makeDirector`
     generator, no actor tiers) gets the same guarantee.
   - **UI:** add **sort controls** (fee / draw / name) + a longer list so 6–8
     cards stay navigable. Sort is session UI-state (not saved).
   - Files: `game.js` (`offerCasting` pool build ~line 232 → 6/6/6/8 + spread
     pass), `data.js` (`makeActor`), `ui.js` (grid reflow for 26 cards + sort
     row). `castOptions` shape changes (6 not 3) → **bump the save key
     (v4 → v5)**.
   - **Balance:** a guaranteed cheap unknown *helps* the value play and a
     guaranteed star *adds* a (bad) temptation — re-run `--skilled` +
     `career-test`; expect hit rate to stay in-band, tune the spread if
     survival drifts. `browser-test` picks the first card / re-picks cheapest,
     so it should stay green — verify.
   - The casting hints (`bestLead`/`cheapLead`/`valueLoss` in `_hintCtx`)
     get *richer* automatically (the "value card is X" note now has a real
     target) — no hint change needed.

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
- New hint templates: give them a unique `id`, a `topic`, a `pri` tier (3 =
  will-F-the-picture, 2 = important, 1 = routine; leave `pri` off only for
  `flavor` small talk), and reference only ctx fields that `G._hintCtx` builds
  for that topic; keep at least one always-true *informational* template per
  topic so the weighted pool never empties.
- Keep browser test green after any ui.js/index.html/styles.css change:
  `node tools/browser-test.js` (drives the real UI in headless Chrome;
  `PHASE=production|boxoffice|script|casting|reviews|results|title` captures a
  screenshot of that screen and exits).
