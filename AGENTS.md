# Sim Cinema Deluxe (web) — Agent Guidelines

## Project Overview

Modern browser reimagining of the 1999 classic Mac game *Sim Cinema Deluxe*
(Hollywood film production sim). Static site: vanilla HTML/CSS/JS, no build
tools, no package.json. GitHub Pages deploy target. See `README.md` for the
research background and player-facing docs.

## Architecture

| File | Role |
|---|---|
| `index.html` | All 9 screens (title, studio, script, budget, casting, production, box office, results, game over) + one shared modal |
| `styles.css` | Cinematic theme (marquee gold/velvet red, film grain, responsive) |
| `js/data.js` | Content pools + procedural generators (genres, names, loglines, taglines, events, ads, rivals, critics) + box office math (`weekGross`). Humor layer: parody personas (`PARODY_STARS`/`PARODY_DIRECTORS`, ~1/2 of casting draws), tongue-in-cheek loglines/events, title templates (The X / Infinite X / sequels) |
| `js/audio.js` | WebAudio synth SFX (no audio files); `SFX.play.*`, `SFX.toggle()` |
| `js/poster.js` | Procedural poster art on canvas → dataURL (genre motifs, corner sticker badges, micro credit block, grain) |
| `js/game.js` | **The simulation**: state machine + all game rules; exposes flat `GAME.*` API |
| `js/ui.js` | UI layer: screen router, all 9 screens, modals (event/tagline/screening/reviews/help), autoplay timers, Top-10 table + SVG curve, save/continue, highlighted message feed |
| `tools/balance-test.js` | Headless smoke + 300-film random + 200-film skilled simulations (Node VM) |
| `tools/career-test.js` | 100 careers × 8 films with a strong strategy |
| `tools/browser-test.js` | Real-browser verification in headless Chrome via CDP (no deps, Node ≥ 22): full 2-film career, both autoplay speeds, event/tagline/screening/reviews modals, terminate + bankruptcy + game-over branches, save/continue across a page reload. `PHASE=<screen>` mode stops at a screen and saves a PNG (needs Chrome installed) |

### State machine (game.js)

`title → studio → script → budget → casting → production ⇄(event modals) →
boxoffice → results → script …` with `gameover` reachable from anywhere.
Release keeps `state: "production"` while the critic-reviews modal is open;
`GAME.release()` then flips to `boxoffice` (the UI drives the two steps
separately: `GAME.critique()` → modal → `GAME.release()`).

`GAME.S` holds mutable state; the flat API is flattened getters
(`GAME.state`, `GAME.film`, `GAME.studio`, …) plus actions: `newStudio`,
`selectScript`, `setBudget`/`confirmBudget`, `pickTalent`/`confirmCasting`,
`passWeek`, `resolveEvent`, `buyAd`, `setTagline`, `testScreen`, `reshoot`,
`critique`, `release`, `nextBoWeek`, `finishBoxOffice`, `nextFilm`, `terminateFilm`,
`save`/`load`/`hasSave`/`clearSave`, `canAfford`, `creditLimit`.

Save format: localStorage key `simcinema_save_v1` (whole state blob; safe to
bump the key if the shape changes).

### Key game constants (balance is sensitive — re-run tools/ after changes)

- Starting funds $15M; credit line `8 + reputation*0.15` ($M); bankruptcy at
  120% over the limit; debt repaid from gross in `finishBoxOffice`.
- Quality = `(0.55*scriptQuality + 0.45*castScore) * budgetFactor` (±event
  deltas, +8 reshoot).
- Opening = `audience * (1 + 5.5*buzz/100) * (0.55 + 0.55*R) * rand(0.9,1.1)`;
  weekly decay `0.62 + 0.32*R + genre.legs` (clamped 0.5–0.9); curve ends at
  gross < $1M or week 14.
- Buzz decays ×0.97/week; ads give +4..+14 buzz ×(1+social/200) (see `DATA.ADS`);
  critics (`GAME.critique`) shift buzz +10/+6/0/−2/−5 by consensus on release.
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
  production weeks read as a visible procedural story.
- **Balance note**: the critic step is the newest risk axis; after adding it,
  strong play measured ≈ 85% hit films / ~75–80% of 8-film careers survive
  (was 87%/93%) — still within design intent (strong play wins, sloppy loses).
- **Note**: `styles.css` needs `[hidden] { display: none !important; }` —
  author `display` rules (`.topbar`, `.modal-backdrop`) override the UA
  stylesheet's `[hidden]` rule, so the topbar/modal render on every screen
  without it.

## Next Steps (ordered)

1. ~~UI layer + browser verification~~ done; ~~git init + push~~ done;
   ~~career log + hall of fame + game-over recap~~ done (commit 396d44a);
   ~~humor pass (parody personas, 12 events, title templates, poster stickers)
   + advance reviews + story-message highlighting~~ done.
2. Optional polish: dedupe actor quips/director names, persist box-office
   movement baseline across reloads, mobile pass.

## Conventions

- Vanilla JS only; no frameworks, no package.json, no build step.
- Keep `js/game.js` DOM-free (it runs headless in `tools/` via a Node VM);
  all DOM belongs in `js/ui.js`.
- Keep headless tests green after any game.js/data.js change:
  `node tools/balance-test.js --smoke && node tools/career-test.js`.
- Keep browser test green after any ui.js/index.html/styles.css change:
  `node tools/browser-test.js` (drives the real UI in headless Chrome;
  `PHASE=production|boxoffice|script|casting|reviews|results|title` captures a
  screenshot of that screen and exits).
