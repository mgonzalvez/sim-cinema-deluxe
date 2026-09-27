# Sim Cinema Deluxe — Modern Web Edition

A modern browser reimagining of **Sim Cinema Deluxe**, the 1999 classic Mac game
by Shannon Schroeder — a simulation of the Hollywood film-making process.

## The Original (research)

Sim Cinema Deluxe (final release v2.5, 1999) ran on System 7 / PPC Macs. You
played a Hollywood producer who owns a small production company. Each film walks
a pipeline: **script development → casting → filming → (test screening) →
release → box office tracking week by week**. Your casting, filming, budgeting,
and advertising decisions decide how the film performs at the box office,
competing on a Box Office Top-Ten list alongside other studios' films.

Features of the original (from the v2.5 release notes and archives at
Info-Mac, Applefritter, MacTrove, and Macintosh Repository):

- Box Office Top-Ten list the player's film competes on
- Test-screen the film before release
- Explicit budget control
- A more detailed development phase
- Advertising builds "buzz" (TV commercials, trailers, press, posters)
- Tagline selection
- In-game cast & crew editor

Archives: `info-mac.org/viewtopic.php?t=4039` · `mactrove.com/software/simcinemad` ·
`macintoshrepository.org/2819-sim-cinema-deluxe` · `applefritter.com/node/14149`

## The Modern Version

A static, no-build, vanilla HTML/CSS/JS game (GitHub Pages ready). Same soul,
modern body: a dark marquee/cinema aesthetic, procedurally generated movie
posters, WebAudio sound, weekly production events, a drawdown credit line,
and a full career loop where reputation compounds film to film.

### How to run

Open `index.html` directly, or:

```bash
npx serve .   # or any static server
```

Headless balance tests (Node, no deps):

```bash
node tools/balance-test.js --smoke
node tools/balance-test.js        # 300 random-play films
node tools/balance-test.js --skilled
node tools/career-test.js         # 100 careers x 8 films
node tools/browser-test.js        # drives the real UI in headless Chrome (Node >= 22)
```

`browser-test.js` plays a full two-film career through the actual DOM — all
screens, modals, both autoplay speeds, the terminate/bankruptcy/game-over
branches, and save/continue across a real page reload. `PHASE=<screen>
node tools/browser-test.js` stops at that screen and writes a PNG.

### How to play

1. **Name your studio** — you start with $15M and a credit line.
2. **Development** — pick one of three scripts (genre, quality, ideal budget);
   pay for rewrite weeks if you like.
3. **Budget** — set the production budget. Under the ideal and the film suffers;
   way over and the bank frowns. The budget also sets how many weeks production
   takes.
4. **Casting & crew** — lead, co-lead, supporting, and director. Big names bring
   audience draw and social reach; unknowns are cheap and risky.
5. **Production (the weekly loop)** — each week: buy advertising (buzz decays
   slowly, ads rebuild it), pass the week, and resolve random on-set events
   (stunt rigs, sick leads, tabloids, studio calls…). Watch the four production
   phases fill: sets/props, filming/editing, visual effects, music.
6. **Test screen** (60%+ complete, $0.5M) — the audience scores the film;
   a bad score offers a $1.5M reshoot.
7. **Release** (100% complete) — your film opens on the Top-10 chart against
   nine rival studio releases. Track the weekly curve until it drops out.
8. **Results** — gross vs. every cost (production, cast, development, ads,
   events, debt), a grade, and a reputation change. Make the next film — or,
   if the credit line runs dry, the bank repossesses the lot.

### What's deliberate

- **Credit line, not soft money**: the studio can draw down (8M + reputation
  scaling), debt is repaid from box office at the end, and going 20% past the
  limit ends the game. This is how a small studio makes a big picture.
- **Genres have personalities**: Action opens hot but decays fast; Dramas and
  Documentaries open small but have "legs"; Animation has family audiences.
- **Everything is procedural**: titles, cast, taglines, rivals, even the
  posters are generated. No two careers look alike.

See `AGENTS.md` for architecture, current status, and next steps.
