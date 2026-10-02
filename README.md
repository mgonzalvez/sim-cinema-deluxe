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
- Advance reviews — critics weigh in on the film before it opens
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
5. **Production (the weekly loop)** — each week: manage your **two buzz
   meters** (positive green, negative red — both fade, both drift, and the
   internet does things on its own), buy advertising (PR Cleanup deflates the
   red one), pass the week, and resolve random on-set events (stunt rigs, a
   burrito, tabloids, a red-carpet gaffe, a weekend photo, catering memos, the
   method, a 4,000-page fan wiki…). The message feed tells the story of your
   production — the big gold ★ entries are the moments that mattered.
6. **Test screen** (60%+ complete, $0.5M) — the audience scores the film;
   a bad score offers a $1.5M reshoot.
7. **Release** (100% complete) — four critics publish advance reviews first;
   their consensus (raves to *incendiarily negative*) shifts the buzz that
   carries into the opening weekend. What the opening weekend actually sees is
   **positive buzz minus negative buzz** — a beloved film with a festering
   scandal opens smaller than a clean one. Then your film opens on the Top-10
   chart against nine rival studio releases. Track the weekly curve until it
   drops out.
8. **Results** — gross vs. every cost (production, cast, development, ads,
   events, debt), a grade, and a reputation change.
9. **Studio Headquarters** — between films, your office is a metagame hub:
   a **dashboard** (the bank's trust and your credit line, the board's approval,
   your studio's prestige, your reputation curve, and every film's ledger), a
   **trophy room** (honors for your hits, golden popcorns for your bombs),
   **industry trends** (genres get hot and cold — and it changes what opens
   well), and a feed of **gossip and rumors** from the town. Two ways out of
   a career: the bank repossesses the lot, or the board votes you out (they
   have exactly one reprieve in them, and they don't waste it).

### What's deliberate

- **Credit line, not soft money**: the bank's trust (not your reputation) sets
  your credit line — hit films earn it, bombs cost it; debt is repaid from box
  office at the end, and going 20% past the limit ends the game. This is how a
  small studio makes a big picture.
- **Genres have personalities**: Action opens hot but decays fast; Dramas and
  Documentaries open small but have "legs"; Animation has family audiences.
- **Everything is procedural**: titles, cast, taglines, rivals, critics, even
  the posters (with their corner stickers and tiny credit blocks) are generated.
  No two careers look alike.
- **A career, not just a loop**: bank trust sets your credit line, the board
  can fire you, your prestige makes talent cheaper, and the town's moods move
  the genres — eight films can feel like eight different seasons in Hollywood.
- **The tone is loving, not mean**: a lot of the cast and crew are affectionate
  parodies of real film-industry figures (all fictional names), and the events,
  taglines, and critics lean into the industry's best jokes.

### Ideas on the cutting-room floor

The town has room to grow: office toys in your HQ (a publicist who files for
quiet, an espresso machine that helps), a rescue injection from a bank that
trusts you, sequel rights on a big hit, a career awards ceremony at the end of
your run, and the option to retire on your own terms. Full backlog, with the
balance guardrails, lives in `AGENTS.md`.

See `AGENTS.md` for architecture, current status, and the enhancement backlog.
