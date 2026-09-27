/* ============================================================
   SIM CINEMA DELUXE — data.js
   Content pools + procedural generators (fictional names only)
   ============================================================ */
"use strict";

const DATA = (() => {

  // ---------- utils ----------
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const rand = (min, max) => min + Math.random() * (max - min);
  const randInt = (min, max) => Math.floor(rand(min, max + 1));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const money = (m) => {
    const v = Math.round(m * 10) / 10;
    return "$" + (Number.isInteger(v) ? v : v.toFixed(1)) + "M";
  };

  // ---------- genres ----------
  const GENRES = {
    "Action":      { base: 8,  audience: 1.5,  legs: -0.04, poster: ["#1a1f3a", "#e2483d", "#f0b429"], fxWeight: 0.30, desc: "explosions, set pieces, stunt budgets" },
    "Comedy":      { base: 6,  audience: 1.3,  legs: -0.03, poster: ["#3a1a3a", "#f06bb4", "#ffd86b"], fxWeight: 0.10, desc: "timings, chemistry, word of mouth" },
    "Drama":       { base: 5,  audience: 1.0,  legs: 0.06,  poster: ["#2a2a2e", "#8f8f9f", "#e8e6e3"], fxWeight: 0.05, desc: "awards bait, acting-first" },
    "Horror":      { base: 3,  audience: 1.1,  legs: 0.02,  poster: ["#0d0d12", "#e2483d", "#3ec97e"], fxWeight: 0.15, desc: "cheap to make, huge margins" },
    "Sci-Fi":      { base: 12, audience: 1.35, legs: 0.01,  poster: ["#0a1a2f", "#5aa9e6", "#9b7fe8"], fxWeight: 0.40, desc: "effects-heavy, ambitious" },
    "Romance":     { base: 4,  audience: 1.0,  legs: 0.03,  poster: ["#3a1a24", "#ff7a6e", "#ffd86b"], fxWeight: 0.05, desc: "heartfelt, niche but loyal" },
    "Animation":   { base: 10, audience: 1.4,  legs: 0.05,  poster: ["#1a3a2f", "#3ec97e", "#ffd86b"], fxWeight: 0.45, desc: "family audience, long legs" },
    "Documentary": { base: 2,  audience: 0.6,  legs: 0.08,  poster: ["#1f2a1a", "#8f9f6b", "#e8e6e3"], fxWeight: 0.02, desc: "tiny budget, viral potential" }
  };

  // ---------- name pools (all fictional) ----------
  const FIRST_NAMES = ["Maxine", "Dexter", "Vivienne", "Colin", "Petra", "Hank", "Lucille", "Boris", "Tessa", "Ravi", "Greta", "Jules", "Otis", "Simone", "Walter", "Nina", "Felix", "Margot", "Ike", "Delia", "Reno", "Cleo", "Stan", "Opal", "Vince", "Harriet", "Buddy", "Lena", "Gus", "Pearl"];
  const LAST_NAMES = ["Vale", "Mercer", "Quinn", "Holloway", "Crane", "Beaumont", "Stark", "Voss", "Kessler", "Whitlock", "Marlowe", "Drummond", "Fox", "Barlow", "Sinclair", "Ashby", "Corliss", "Dane", "Ellery", "Frost", "Gunn", "Hale", "Ives", "Juno", "Kane", "Lark", "Moss", "Nix", "Olsen", "Pike"];
  const DIRECTOR_FIRST = ["Vera", "Sal", "Maren", "Kip", "Ezra", "Dottie", "Rhys", "Iris", "Cole", "Bette", "Murray", "Suki"];
  const DIRECTOR_STYLE = ["method perfectionist", "one-take romantic", "practical-effects purist", "visionary maverick", "efficiency machine"];

  const adjectives = {
    "Action": ["Lethal", "Relentless", "Furious", "Maximum", "Burning", "Iron", "Crimson"],
    "Comedy": ["Awkward", "Ridiculous", "Unhinged", "Sucky", "Mildly Inconvenient", "Chaotic", "Deliciously"],
    "Drama": ["Quiet", "Broken", "Gilded", "Fading", "Honest", "Winter", "Last"],
    "Horror": ["Hollow", "Whispering", "Beneath", "Rotten", "Midnight", "Pale", "Cursed"],
    "Sci-Fi": ["Quantum", "Stellar", "Neon", "Orbital", "Synthetic", "Deep Field", "Event Horizon"],
    "Romance": ["Stolen", "Tender", "Endless", "Second", "Saltwater", "Golden", "Unsent"],
    "Animation": ["Bouncing", "Whiskered", "Bubble", "Paper", "Glowing", "Wobbly", "Infinite"],
    "Documentary": ["Unscripted", "Grainy", "Real", "Unlabeled", "Raw", "Counter", "Open Ledger"]
  };
  const nouns = {
    "Action": ["Reckoning", "Payload", "Extraction", "Afterburn", "Verdict", "Strike Force", "Freefall"],
    "Comedy": ["Bureaucracy", "Wedding Disaster", "Intern", "Road Trip", "Family Reunion", "Open Mic", "Craze"],
    "Drama": ["Inheritance", "Season", "Distance", "Confession", "House", "Letter", "Custody"],
    "Horror": ["Attic", "Signal", "Harvest", "Suburbs", "Choir", "Wells", "Basement"],
    "Sci-Fi": ["Drift", "Colony", "Machine", "Anomaly", "Uprising", "Horizon", "Archive"],
    "Romance": ["Postcards", "Lighthouse", "Season", "Vows", "Orchard", "Diner", "Departure"],
    "Animation": ["Comet", "Kittens", "Circus", "Balloon", "Tides", "Bakery", "Orbit"],
    "Documentary": ["Mill", "Strike", "Archive", "River", "Ballot", "Kitchen", "Front Porch"]
  };
  const extraWords = ["Protocol", "Revelation", "Syndicate", "Lullaby", "Monsoon", "Cathedral", "Overdrive", "Requiem", "Solstice", "Vendetta", "Parade", "Static"];

  const loglines = {
    "Action": [
      "A retired stunt double must finish one last job when the studio he faked his death for comes collecting.",
      "A delivery driver accidentally carries a case of state secrets across the country in a refrigerated truck.",
      "Two rival heist crews hit the same vault and spend the night stuck inside, sharing a radio."
    ],
    "Comedy": [
      "A wedding planner who can't be married is hired by her own estranged sister's wedding party.",
      "A small town votes to rename itself after a local cheese, and the PR disaster spirals.",
      "An insurance adjuster must appraise a house where everything is haunted, except the listing agent's enthusiasm."
    ],
    "Drama": [
      "A retired judge returns to her small hometown to settle her brother's estate and finds the whole town is in it.",
      "Two estranged siblings inherit their father's failing newspaper and its unfinished final column.",
      "A long-married couple decides to spend their last summer vacation pretending they're on their first."
    ],
    "Horror": [
      "A film restorer finds a scene in a classic movie that wasn't there when it was released — and it knows her name.",
      "A rural parish gets a new organ; the congregation starts hearing harmonies that aren't in the score.",
      "A sleep clinic's new insomnia cure works perfectly. No one wakens the same."
    ],
    "Sci-Fi": [
      "A deep-space salvage crew finds a station that has been broadcasting the same lullaby for 200 years.",
      "Every citizen gets a twin built from their own backup; this one starts filing taxes first.",
      "A colony ship wakes early to find the destination planet has already developed — and noticed them."
    ],
    "Romance": [
      "Two rival food-truck operators get stuck sharing a parking spot for an entire festival weekend.",
      "A lighthouse keeper receives postcards from a sailor who died in 1962, dated next week.",
      "A matchmaker's app pairs her with the guy her ex keeps bragging about. It's him."
    ],
    "Animation": [
      "A bakery cat who believes she's a wolf goes on a road trip to find the pack she's never met.",
      "Paper cut-outs escape a child's notebook and stage a musical about the crumpled ones.",
      "A lighthouse beam falls in love with a comet that visits once a century. It's a long-distance relationship."
    ],
    "Documentary": [
      "A follow-the-money portrait of one town's last independent movie theater.",
      "Four generations of one family run the same diner, and the camera follows one ordinary Tuesday.",
      "The last lighthouse keepers of the coast, on automation, weather, and stubbornness."
    ]
  };

  // ---------- taglines ----------
  const taglineBank = {
    "Action": [
      ["Some debts don't expire.", 9], ["Faster than the sequel.", 4], ["You've seen nothing detonate like this.", 7],
      ["The best part? It's fake.", 6], ["Impact is a lifestyle.", 8], ["He said he was done. He was wrong.", 8],
      ["Rated PG for 'Please Go'.", 3], ["Explosions! And a sandwich.", 1], ["The punchline hurts.", 6]
    ],
    "Comedy": [
      ["Nobody is ready. Some of them are on screen.", 9], ["It gets worse. So do the jokes.", 7],
      ["A film about the film about the disaster.", 5], ["Bring snacks. And a doctor.", 8], ["Finally, a comedy with a punchline. Multiple.", 4],
      ["50% less fun than your last family dinner.", 6], ["Starring everyone you tolerate at Thanksgiving.", 8], ["Warning: laughs contain milk.", 2]
    ],
    "Drama": [
      ["The truth has a long memory.", 9], ["What will you do with one honest week?", 8],
      ["You've been keeping score. They've been keeping secrets.", 8], ["A love story, minus the love.", 7],
      ["Some doors stay closed. That's the point.", 7], ["Based on a true feeling.", 6], ["This could be your house.", 9], ["Daddy issues, professionally handled.", 3]
    ],
    "Horror": [
      ["It was in the cut. Now it's in you.", 9], ["Don't look up. Especially don't look up.", 8],
      ["The attic remembers.", 8], ["Sleep is optional. Forever is not.", 9], ["Every house has a second story.", 7],
      ["Critics' pick: 5 stars, unawakened.", 6], ["Your shadow files a claim.", 5], ["It's only a house. Probably.", 6]
    ],
    "Sci-Fi": [
      ["The future is 22 minutes late.", 8], ["We backed up the human. The backup differs.", 9],
      ["Home is a coordinate now.", 8], ["Ask the machine what you really want.", 7], ["One galaxy, no refunds.", 6],
      ["The stars were never quiet. They were counting.", 9], ["Upgrade available. Humanity optional.", 7], ["It's a long way to the next Tuesday.", 5]
    ],
    "Romance": [
      ["Love is a long line. They're in it.", 8], ["Two trucks. One spot. All the time in the world.", 8],
      ["The best love story is the wrong parking spot.", 6], ["He's the only one who knows your order.", 7],
      ["Postmarked from the past. Delivered today.", 9], ["Cupid got a parking ticket.", 5], ["This time, the heart files the right forms.", 7]
    ],
    "Animation": [
      ["Everyone's a star. Even the crumpled ones.", 9], ["A small voice. A very loud journey.", 9],
      ["100% animated, 0% explained.", 7], ["Bigger than the bakery. Bigger than the heart.", 8],
      ["The whole pack is imaginary. The love isn't.", 8], ["Suitable for the whole family, except the cat.", 6], ["Wobbly. Glowing. Infinite.", 7]
    ],
    "Documentary": [
      ["True story. Long lunch.", 8], ["The cameras were already there.", 9],
      ["Unscripted, unpaid, unforgettable.", 8], ["What the headline missed.", 7], ["One Tuesday. One family. One camera.", 9],
      ["The end of an era, 40 minutes of it.", 6], ["No actors were harmed. Several were hired.", 5]
    ]
  };

  // ---------- advertising ----------
  const ADS = [
    { id: "tv",      name: "TV Commercials",      sub: "30s national spots",        cost: 1.5, buzz: 14, unlock: () => true },
    { id: "trailer", name: "Movie Trailer",        sub: "theatrical teaser",        cost: 1.0, buzz: 11, unlock: (g) => g.film.phases.filming >= 45 },
    { id: "social",  name: "Social Media Push",    sub: "clips, memes, red carpet", cost: 0.8, buzz: 9,  unlock: () => true },
    { id: "press",   name: "Magazine / Press Ads", sub: "feature + print",          cost: 0.6, buzz: 6.5, unlock: () => true },
    { id: "billboard", name: "Billboards",         sub: "highways + suburbs",       cost: 0.5, buzz: 5,  unlock: () => true },
    { id: "poster",  name: "Poster Campaign",      sub: "cities & campuses",        cost: 0.4, buzz: 4,  unlock: () => true }
  ];

  // ---------- production events ----------
  const EVENTS = [
    {
      id: "stunt", title: "Stunt Rig Malfunction",
      text: "The crane jib on the big set piece is bending under load. The stunt coordinator wants it fixed before another take.",
      choices: [
        { label: "Hire certified riggers", cost: 1.2, detail: "Safe. Production continues.", run: (g) => { g.log("Riggers secured the rig. Production continues.", "good"); } },
        { label: "Shoot it anyway", cost: 0, detail: "Free, but someone might get hurt.", run: (g) => {
          if (Math.random() < 0.45) { g.film.quality = clamp(g.film.quality - 8, 5, 100); g.film.buzz = Math.max(0, g.film.buzz - 5); g.log("A stuntman sprained his wrist on camera. The footage is shaky and the tabloids are delighted. Quality −8, buzz −5.", "bad"); }
          else g.log("The stunt landed clean. The coordinator is still shaking, but the take is gold.", "good");
        } }
      ]
    },
    {
      id: "actor-sick", title: "The Lead Is Sick",
      text: "Your lead actor has food poisoning the morning of the finale shoot. The day's schedule is a two-week catchup.",
      choices: [
        { label: "Reschedule the day", cost: 0.9, detail: "Costs money, no quality loss.", run: (g) => { g.log("The finale was rescheduled. The actor ate bland soup and performed flawlessly.", "good"); } },
        { label: "Cannibalize coverage from other days", cost: 0, detail: "Free, but the finale will feel thinner.", run: (g) => { g.film.quality = clamp(g.film.quality - 5, 5, 100); g.log("The finale is held together with other takes and a lot of faith. Quality −5.", "bad"); } }
      ]
    },
    {
      id: "director-passion", title: "Creative Ambition",
      text: "Your director wants to re-shoot the entire third act with a live orchestra in the frame. It is, against all odds, a good idea.",
      choices: [
        { label: "Fund the orchestra", cost: 1.1, detail: "Quality +6.", run: (g) => { g.film.quality = clamp(g.film.quality + 6, 5, 100); g.log("The orchestra is in the frame. It is, against all odds, a good idea. Quality +6.", "good"); } },
        { label: "Hold the line on the schedule", cost: 0, detail: "Quality −3. The director will remember this.", run: (g) => { g.film.quality = clamp(g.film.quality - 3, 5, 100); g.log("The director accepts it, but the third act plays it safe. Quality −3.", "bad"); } }
      ]
    },
    {
      id: "weather", title: "Weather Delay",
      text: "A storm front has grounded the exterior sequence for two days. Half the production is idle, but not idle-cheap.",
      choices: [
        { label: "Rent the soundstage", cost: 0.8, detail: "Shoot indoors on schedule.", run: (g) => { g.log("The storm is a rain effect now. The production calendar is intact.", "good"); } },
        { label: "Let the crew rest", cost: 0, detail: "Save money; the schedule slips and morale dips.", run: (g) => { g.film.quality = clamp(g.film.quality - 4, 5, 100); g.log("Two lost days of schedule and a crew with too much coffee. Quality −4.", "bad"); } }
      ]
    },
    {
      id: "script-hole", title: "The Third Act Doesn't Land",
      text: "The dailies reveal the climax simply does not work. Two departments are now waiting on you for an answer.",
      choices: [
        { label: "Bring in a rewrite team", cost: 1.6, detail: "Quality +8. Costs a fortune.", run: (g) => { g.film.quality = clamp(g.film.quality + 8, 5, 100); g.log("The rewrite team worked a weekend and produced a scene everyone cried at in the truck. Quality +8.", "good"); } },
        { label: "Trust the original draft", cost: 0, detail: "Free, but the climax stays weird.", run: (g) => { g.film.quality = clamp(g.film.quality - 6, 5, 100); g.log("The climax stays, unchanged, with the faint smell of a conference table. Quality −6.", "bad"); } }
      ]
    },
    {
      id: "tabloid", title: "Tabloid Rumor Mill",
      text: "A rag has a photo of the lead and co-lead 'sharing a cab'. The story is running out of control.",
      choices: [
        { label: "Release a spin statement", cost: 0.5, detail: "Buzz +6 — they love a scandal.", run: (g) => { g.film.buzz = clamp(g.film.buzz + 6, 0, 150); g.log("'Just coworkers' — the statement works. Buzz +6. Hollywood runs on this.", "gold"); } },
        { label: "Say nothing", cost: 0, detail: "Let it die... or grow.", run: (g) => {
          if (Math.random() < 0.5) { g.film.buzz = clamp(g.film.buzz + 4, 0, 150); g.log("The rumor peaked on its own. Buzz +4.", "good"); }
          else g.log("The story faded. The tabloid moved on to a reality show.", "good");
        } }
      ]
    },
    {
      id: "franchise", title: "The Studio Call",
      text: "A distribution executive has called to suggest 'franchise elements'. A lot of them. Some of them CGI.",
      choices: [
        { label: "Keep the film pure", cost: 0, detail: "Reputation +2, quality +3 if your director is strong.", run: (g) => {
          g.studio.reputation = clamp(g.studio.reputation + 2, 0, 100);
          const bonus = g.film.cast.directorScore >= 55 ? 3 : 1;
          g.film.quality = clamp(g.film.quality + bonus, 5, 100);
          g.log("You hang up on the franchise pitch. The crew notices. The film sharpens.", "gold");
        } },
        { label: "Add the CGI sequel hook", cost: 0.7, detail: "Buzz +4, quality −3, the bank is happy.", run: (g) => { g.film.quality = clamp(g.film.quality - 3, 5, 100); g.film.buzz = clamp(g.film.buzz + 4, 0, 150); g.log("The post-credits shot of a hand reaching out of the ocean is doing something to the test-audience's eyes.", "bad"); } }
      ]
    },
    {
      id: "equipment", title: "The Lens Set Is Lost",
      text: "A grip truck was towed overnight and the bespoke lens set went with it. The D.P. is quiet, which is the worst kind of quiet.",
      choices: [
        { label: "Rent a matching set", cost: 0.9, detail: "No visual compromise.", run: (g) => { g.log("The replacement lenses are indistinguishable. The D.P. exhales for the first time in two days.", "good"); } },
        { label: "Adapt the look", cost: 0, detail: "Quality −4, but a strange new aesthetic emerges.", run: (g) => { g.film.quality = clamp(g.film.quality - 4, 5, 100); g.log("The D.P. improvises a new look. Critics will either love it or write about it in the next decade.", "bad"); } }
      ]
    }
  ];

  // ---------- test screening quotes ----------
  const SCREEN_QUOTES = {
    great: [
      "I didn't stop smiling until the credits. Twice.",
      "My whole family is now emotionally compromised. 10/10.",
      "I've been waiting my whole life for a movie like this. Mildly.",
      "The third act made me call my mother. We're still on the phone.",
      "I laughed at the wrong moments, but I laughed."
    ],
    good: [
      "Really liked it. The middle is a little quiet, but I'd pay to see it again.",
      "Good. Solid. My nephew fell asleep, which is what he does to good films.",
      "I'd recommend it. To my neighbors. With a discount code, maybe.",
      "The ending surprised me in a good way. That's the whole review."
    ],
    meh: [
      "It was fine. The popcorn was better. The popcorn was just fine too.",
      "I don't dislike it, which is doing a lot of work in this sentence.",
      "My kid asked for a refund and I couldn't find it in me to say no.",
      "The second act took a nap. So did most of us."
    ],
    bad: [
      "I counted my money on the way out. Three times. To be sure.",
      "My family has stopped speaking to each other. And me.",
      "There's a scene where the audience leaves in a pattern. I'm in it.",
      "I've decided that 'fine' is a feeling and I don't have it right now."
    ]
  };

  const RIVAL_STUDIOS = ["Apex Features", "Crimson Reel", "Northlight", "Gilded Gate", "Pioneer Lot", "Silverline", "Blue Harbor", "Fifth & Vine", "Redline", "Halo Pictures", "Westport", "Marble Arch", "Kestrel", "Bastion", "Lantern Row"];

  const RIVAL_GENRE_NOUNS = {
    "Action": ["Protocol", "Reckoning", "Freefall", "Payload", "Blackout", "Vendetta", "Afterburn"],
    "Comedy": ["Craze", "Bureaucracy", "Reunion", "Open Mic", "Road Trip", "Disaster"],
    "Drama": ["Inheritance", "Season", "Confession", "Custody", "The House", "Last Letter"],
    "Horror": ["Attic", "Signal", "Harvest", "Wells", "Choir", "Basement"],
    "Sci-Fi": ["Colony", "Anomaly", "Horizon", "Archive", "Uprising", "Static"],
    "Romance": ["Lighthouse", "Postcards", "Vows", "Orchard", "Diner"],
    "Animation": ["Comet", "Kittens", "Circus", "Balloon", "Tides", "Orbit"],
    "Documentary": ["Mill", "Strike", "Ballot", "River", "Ledger", "Front Porch"]
  };

  return { pick, rand, randInt, clamp, shuffle, money, GENRES, adjectives, nouns, extraWords, loglines, taglineBank, ADS, EVENTS, SCREEN_QUOTES, RIVAL_STUDIOS, RIVAL_GENRE_NOUNS, FIRST_NAMES, LAST_NAMES, DIRECTOR_FIRST, DIRECTOR_STYLE };
})();

// ---------- procedural generators ----------
(function (D) {

  const usedTitles = new Set();

  D.makeTitle = (genre) => {
    for (let i = 0; i < 24; i++) {
      let t;
      const r = Math.random();
      if (r < 0.45) t = `${D.pick(D.adjectives[genre])} ${D.pick(D.nouns[genre])}`;
      else if (r < 0.7) t = `The ${D.pick(D.nouns[genre])} ${D.pick(["of", "in", "at", "for"]) === "of" ? "of " + D.pick(D.nouns[genre]) : " " + D.pick(D.nouns[genre])}`;
      else t = `${D.pick(D.nouns[genre])}: ${D.pick(D.extraWords)}`;
      if (!usedTitles.has(t)) { usedTitles.add(t); return t; }
    }
    return D.pick(D.nouns[genre]) + " II";
  };

  const usedNames = new Set();
  D.makePerson = () => {
    for (let i = 0; i < 40; i++) {
      const n = `${D.pick(D.FIRST_NAMES)} ${D.pick(D.LAST_NAMES)}`;
      if (!usedNames.has(n)) { usedNames.add(n); return n; }
    }
    return "Anonymous Extra";
  };

  const TIER_TABLE = [
    { tier: "A-List Star",   drawMin: 75, drawMax: 97, costMin: 4.5, costMax: 8.0,  socialMin: 40, socialMax: 90 },
    { tier: "Bankable Star", drawMin: 58, drawMax: 78, costMin: 2.2, costMax: 4.5, socialMin: 20, socialMax: 60 },
    { tier: "Rising Talent", drawMin: 38, drawMax: 58, costMin: 0.7, costMax: 2.0, socialMin: 15, socialMax: 55 },
    { tier: "Indie Darling", drawMin: 30, drawMax: 52, costMin: 0.3, costMax: 0.9, socialMin: 10, socialMax: 45 },
    { tier: "Unknown",       drawMin: 15, drawMax: 40, costMin: 0.1, costMax: 0.5, socialMin: 0,  socialMax: 30 }
  ];

  const QUIPS = [
    "Known for making every red carpet look like a parking lot.",
    "Has never once been late to a premiere. Allegedly.",
    "Their cat has more social followers than they do. Currently changing that.",
    "Allegedly can perform entire scenes while eating bagels.",
    "Won a minor award last year. The envelope is framed.",
    "Prefers their name in a font, not a voice.",
    "Once apologized to a popcorn machine. It went viral.",
    "Takes acting classes, yoga, and 'vibes seminars'.",
    "The casting director's cousin's friend. Works anyway.",
    "Has a fan club. A small one. They are devoted."
  ];

  D.makeActor = (roleIndex) => {
    // role 0 = lead, 1 = co-lead, 2 = supporting — higher roles skew toward bigger talent
    const tiers = TIER_TABLE.slice();
    const roll = Math.random();
    let tierIdx;
    if (roleIndex === 0) tierIdx = roll < 0.35 ? 0 : roll < 0.65 ? 1 : roll < 0.85 ? 2 : 3;
    else if (roleIndex === 1) tierIdx = roll < 0.15 ? 0 : roll < 0.5 ? 1 : roll < 0.8 ? 2 : 3;
    else tierIdx = roll < 0.05 ? 1 : roll < 0.35 ? 2 : roll < 0.7 ? 3 : 4;
    const t = tiers[tierIdx];
    return {
      name: D.makePerson(),
      tier: t.tier,
      draw: Math.round(D.rand(t.drawMin, t.drawMax)),
      social: Math.round(D.rand(t.socialMin, t.socialMax)),
      cost: Math.round(D.rand(t.costMin, t.costMax) * 10) / 10,
      quip: D.pick(QUIPS)
    };
  };

  D.makeDirector = () => {
    return {
      name: `${D.pick(D.DIRECTOR_FIRST)} ${D.pick(D.LAST_NAMES)}`,
      style: D.pick(D.DIRECTOR_STYLE),
      score: D.randInt(30, 92),
      cost: Math.round((1 + D.rand(0, 4)) * 10) / 10
    };
  };

  D.makeScriptOptions = (reputation) => {
    const options = [];
    const genres = D.shuffle(Object.keys(D.GENRES));
    const chosen = genres.slice(0, 3);
    for (const genre of chosen) {
      const g = D.GENRES[genre];
      const sq = Math.round(D.clamp(35 + D.rand(0, 40) + reputation * 0.25, 15, 95));
      const devCost = Math.round((0.2 + D.rand(0, 1.0)) * 10) / 10;
      const estBudget = Math.round((g.base * D.rand(0.75, 1.3) + D.rand(0, 6)) * 10) / 10;
      options.push({
        genre,
        title: D.makeTitle(genre),
        logline: D.pick(D.loglines[genre]),
        quality: sq,
        devCost,
        estBudget: Math.max(2, estBudget),
        poster: null // filled by UI via Poster.art
      });
    }
    return options;
  };

  D.makeTaglines = (genre) => {
    const pool = D.shuffle(D.taglineBank[genre] || []);
    return pool.slice(0, 3).map(([line, q]) => ({ line, q }));
  };

  D.makeRivals = (playerRoughQuality, genre) => {
    const rivals = [];
    const studios = D.shuffle(D.RIVAL_STUDIOS);
    const genres = Object.keys(D.GENRES);
    for (let i = 0; i < 9; i++) {
      const rGenre = i < 2 && Math.random() < 0.4 ? genre : D.pick(genres);
      const q = D.clamp(D.rand(0.2, 0.7) + playerRoughQuality * 0.25 + (rGenre === genre ? 0.08 : 0), 0.15, 0.95);
      const buzz = D.rand(15, 95);
      const g = D.GENRES[rGenre];
      const legs = g.legs || 0;
      const potential = g.audience * (1 + 5.5 * (buzz / 100)) * (0.55 + 0.55 * q) * D.rand(0.85, 1.1);
      const title = `${D.pick(D.adjectives[rGenre])} ${D.pick(D.RIVAL_GENRE_NOUNS[rGenre])}`;
      rivals.push({ title, genre: rGenre, studio: studios[i % studios.length], q, legs, buzz, potential, total: 0, last: 0, prev: null });
    }
    return rivals;
  };

  D.weekGross = (rival, weekIndex, repBoost, legs = 0) => {
    const decay = D.clamp(0.62 + 0.32 * rival.q + legs, 0.5, 0.9);
    const v = rival.potential * Math.pow(decay, weekIndex) * D.rand(0.9, 1.1) * repBoost;
    rival.last = Math.round(v * 10) / 10;
    rival.total = Math.round((rival.total + rival.last) * 10) / 10;
    return rival.last;
  };

})(DATA);
