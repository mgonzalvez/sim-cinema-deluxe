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
  const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);
  const pct = (h) => (h >= 1 ? "+" : "\u2212") + Math.abs(Math.round((h - 1) * 100)) + "%";

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

  // ---------- parody personas (affectionate, one-off from real industry figures) ----------
  const PARODY_STARS = [
    { name: "Meryl Strayp",          tier: "A-List Star",   draw: 88, social: 45, cost: 6.5, quip: "Plays 11 characters in one film. It was 3 people." },
    { name: "Johnny Depts",          tier: "A-List Star",   draw: 82, social: 90, cost: 7.5, quip: "Owns an island. The island denies it." },
    { name: "Leonardo DiCarpio",     tier: "A-List Star",   draw: 90, social: 55, cost: 6.0, quip: "His 28th supporting role, and his best yet. Allegedly." },
    { name: "Brad Pitfalls",         tier: "A-List Star",   draw: 78, social: 85, cost: 8.0, quip: "Still does the same red-carpet walk. It still works." },
    { name: "Tom Hankins",           tier: "A-List Star",   draw: 76, social: 40, cost: 5.5, quip: "Will always be that guy. That is the point." },
    { name: "Denzal W. Carington",   tier: "A-List Star",   draw: 85, social: 30, cost: 6.0, quip: "Accepts every award with the same 20 words." },
    { name: "Will Smeth",            tier: "A-List Star",   draw: 80, social: 88, cost: 7.0, quip: "Will clap at the camera if you say the wrong word." },
    { name: "Scarlett Johanssen",    tier: "A-List Star",   draw: 84, social: 75, cost: 6.5, quip: "A third of her films are sequels. She is not sorry." },
    { name: "George Clooney Jr. II", tier: "A-List Star",   draw: 79, social: 82, cost: 6.2, quip: "Half his dialogue is an ad. He calls it synergy." },
    { name: "Julia Robberts",        tier: "A-List Star",   draw: 83, social: 66, cost: 5.9, quip: "Smiles so hard the script rewrote itself." },
    { name: "Angelina Jolie-Hart",   tier: "A-List Star",   draw: 81, social: 58, cost: 5.8, quip: "Speaks four languages. None of them are budget." },
    { name: "Emma Stonesworth",      tier: "Bankable Star", draw: 70, social: 62, cost: 4.0, quip: "Will do a tiny indie for free, but only if there is a horse." },
    { name: "Caitlin Blancher",      tier: "Bankable Star", draw: 72, social: 38, cost: 4.5, quip: "Plays the villain. The villain is justified." },
    { name: "Viola DeCive",          tier: "Bankable Star", draw: 68, social: 35, cost: 3.5, quip: "Does her own stunts, her own makeup, and her own taxes." },
    { name: "Ryan Goslings",         tier: "Bankable Star", draw: 74, social: 70, cost: 4.0, quip: "90 minutes, 30% of it long silences. You will believe them." },
    { name: "Margot Kidman",         tier: "Bankable Star", draw: 71, social: 48, cost: 3.8, quip: "Made six films this year. Four of them her own." },
    { name: "Sandra Bullocke",       tier: "Bankable Star", draw: 69, social: 52, cost: 3.6, quip: "Plays the nice one. Makes the nice one complicated." },
    { name: "Oscar Isaacson",        tier: "Bankable Star", draw: 66, social: 42, cost: 3.2, quip: "Every role is a sequel to the last one. He commits to it." }
  ];

  const PARODY_DIRECTORS = [
    { name: "Christopher Nollan",    style: "No trailers, no ads, a three-hour runtime.",            score: 88, cost: 4.5 },
    { name: "Steven Speigelberg",    style: "Every film ends with a father. Every single one.",     score: 85, cost: 4.0 },
    { name: "Quentin Tarrantino",    style: "Cites fourteen films in one scene. All of them real.", score: 86, cost: 4.2 },
    { name: "Greta Grewing",         style: "The romances run long. The cuts run longer.",          score: 84, cost: 3.8 },
    { name: "Bong Jun-ho",           style: "One scene is nine minutes. You will understand why.",  score: 90, cost: 4.0 },
    { name: "James Camerone",        style: "The budget is 40% over. The budget was right.",        score: 92, cost: 5.0 },
    { name: "Guillermo del Torto",   style: "The monster is only real if the crew believes.",       score: 87, cost: 4.1 },
    { name: "Danni Boyer",           style: "The camera never stops. Neither does the budget.",     score: 82, cost: 3.5 },
    { name: "Martin Scorzesi",       style: "The film is 15 years old. So is the director.",        score: 89, cost: 4.4 },
    { name: "David Finchler",        style: "Shot 47 takes of a door closing. Kept all of them.",   score: 86, cost: 4.3 },
    { name: "Wess Andersson",        style: "Every prop is centered. Emotionally, too.",            score: 85, cost: 3.9 },
    { name: "M. Night Shyamalane",   style: "The twist is the film. The film is the twist.",        score: 80, cost: 3.6 }
  ];

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
      "Two rival heist crews hit the same vault and spend the night stuck inside, sharing a radio.",
      "A decommissioned satellite falls into a small town. The town votes to keep it. The town has a problem.",
      "Two retired hit men are hired to ruin each other's retirements."
    ],
    "Comedy": [
      "A wedding planner who can't be married is hired by her own estranged sister's wedding party.",
      "A small town votes to rename itself after a local cheese, and the PR disaster spirals.",
      "An insurance adjuster must appraise a house where everything is haunted, except the listing agent's enthusiasm.",
      "A motivational speaker must host the very conference she walked out of in 2019.",
      "A family business makes one product, regrets, and demand is up."
    ],
    "Drama": [
      "A retired judge returns to her small hometown to settle her brother's estate and finds the whole town is in it.",
      "Two estranged siblings inherit their father's failing newspaper and its unfinished final column.",
      "A long-married couple decides to spend their last summer vacation pretending they're on their first.",
      "A widow finds a second voicemail account on her late husband's phone. She never opens it. That is the whole film.",
      "A legendary actor returns for a hometown gala where nobody mentions it."
    ],
    "Horror": [
      "A film restorer finds a scene in a classic movie that wasn't there when it was released — and it knows her name.",
      "A rural parish gets a new organ; the congregation starts hearing harmonies that aren't in the score.",
      "A sleep clinic's new insomnia cure works perfectly. No one wakens the same.",
      "A true-crime podcaster investigates a house that has been filming itself for decades.",
      "The new smart mirror works perfectly, except it waves back first."
    ],
    "Sci-Fi": [
      "A deep-space salvage crew finds a station that has been broadcasting the same lullaby for 200 years.",
      "Every citizen gets a twin built from their own backup; this one starts filing taxes first.",
      "A colony ship wakes early to find the destination planet has already developed — and noticed them.",
      "First contact is a one-star review of humanity, posted from the future.",
      "A time traveler arrives ten minutes early to warn everyone about the next nine."
    ],
    "Romance": [
      "Two rival food-truck operators get stuck sharing a parking spot for an entire festival weekend.",
      "A lighthouse keeper receives postcards from a sailor who died in 1962, dated next week.",
      "A matchmaker's app pairs her with the guy her ex keeps bragging about. It's him.",
      "A couple who left each other voicemails for twenty years finally leaves a fourth.",
      "Two people meet in a queue. The queue takes three hours. It is the best three hours."
    ],
    "Animation": [
      "A bakery cat who believes she's a wolf goes on a road trip to find the pack she's never met.",
      "Paper cut-outs escape a child's notebook and stage a musical about the crumpled ones.",
      "A lighthouse beam falls in love with a comet that visits once a century. It's a long-distance relationship.",
      "A sock that falls off the dryer has a one-way ticket and big plans.",
      "The last paper moon in the sky is being recycled. The night is not ready for it."
    ],
    "Documentary": [
      "A follow-the-money portrait of one town's last independent movie theater.",
      "Four generations of one family run the same diner, and the camera follows one ordinary Tuesday.",
      "The last lighthouse keepers of the coast, on automation, weather, and stubbornness.",
      "A three-generation argument about who gets the good chair, told in 74 minutes.",
      "An in-depth portrait of one office's forty-year war with the coffee machine."
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

  // ---------- outside buzz: the internet, acting without your permission ----------
  const OUTSIDE_BUZZ = [
    { pos: 6, neg: 0, text: "A 30-second clip from the film is trending online." },
    { pos: 5, neg: 0, text: "A film critic spots the lead on a late-night show and can't stop smiling." },
    { pos: 4, neg: 2, text: "The poster gets remixed everywhere — including as a hostile meme." },
    { pos: 3, neg: 4, text: "An out-of-context scene is being quoted in the papers, both ways." },
    { pos: 0, neg: 5, text: "A rival studio's PR team plants a rumor that the film was made in a weekend." },
    { pos: 0, neg: 6, text: "A fan account misquotes the logline, and the internet believes it." }
  ];

  // ---------- advance reviews ----------
  const CRITICS = [
    { name: "Roger Ebbs",       outlet: "The Daily Reel",   bias: 9 },
    { name: "Mark Kermodey",    outlet: "Front Row",        bias: -10 },
    { name: "Manolea Dargis",   outlet: "Back Row Weekly",  bias: 2 },
    { name: "A. O. Scottish",   outlet: "The Film Journal", bias: -6 },
    { name: "Leslie Sugg",      outlet: "Popcorn Quarterly", bias: 6 },
    { name: "Peter Travears",   outlet: "The Rotten Reel",  bias: -2 },
    { name: "Peggy Maltin",     outlet: "Celluloid Digest", bias: 0 },
    { name: "David Edelson",    outlet: "The Reel Review",  bias: -4 }
  ];

  const REVIEW_QUOTES = {
    rave: [
      "A masterclass in restraint. I have already recommended it to four people.",
      "I walked out humming the score and apologizing to my own life.",
      "The third act should be studied, framed, and re-released as a standalone feature.",
      "Riveting, funny, and quietly devastating. Rare.",
      "The best film I have seen this year. The rest of the year can take its shoes off."
    ],
    positive: [
      "A confident, well-built picture that respects the audience just a little.",
      "Not flawless, but the good parts are frequent and the bad parts are brief.",
      "I liked it more the second time around, which is the real test.",
      "Solid, warm, and a little braver than its genre allows.",
      "A good time that occasionally believes in itself. Mostly."
    ],
    mixed: [
      "The best 80 minutes and a questionable 40.",
      "It has a pulse, but the heart seems to be elsewhere.",
      "I respect what it tries. I am less certain about what it achieves.",
      "Half of this is a film; the other half is a suggestion.",
      "A film that is constantly nearly there."
    ],
    pan: [
      "It mistakes volume for passion and running time for depth.",
      "I kept checking the time. Then I checked it again, suspiciously.",
      "The trailer was, frankly, the better film.",
      "Somewhere in the mix, the story lost the plot. The plot was fine.",
      "It asks you to lean in. I leaned back."
    ],
    torch: [
      "I have seen better films in airport lounges.",
      "The credits arrived like a fire escape.",
      "My popcorn was more engaging than the second act.",
      "I came for a film. I left with a headache and a refund request.",
      "Somewhere, a good film is being written. It is not this one."
    ]
  };

  // ---------- advertising ----------
  const ADS = [
    { id: "tv",      name: "TV Commercials",      sub: "30s national spots",        cost: 1.5, buzz: 14, unlock: () => true },
    { id: "trailer", name: "Movie Trailer",        sub: "theatrical teaser",        cost: 1.0, buzz: 11, unlock: (g) => g.film.phases.filming >= 45 },
    { id: "social",  name: "Social Media Push",    sub: "clips, memes, red carpet", cost: 0.8, buzz: 9,  unlock: () => true },
    { id: "press",   name: "Magazine / Press Ads", sub: "feature + print",          cost: 0.6, buzz: 6.5, unlock: () => true },
    { id: "billboard", name: "Billboards",         sub: "highways + suburbs",       cost: 0.5, buzz: 5,  unlock: () => true },
    { id: "poster",  name: "Poster Campaign",      sub: "cities & campuses",        cost: 0.4, buzz: 4,  unlock: () => true },
    { id: "pr",      name: "PR Cleanup",           sub: "spin the sour stories",    cost: 1.2, buzz: 0,  neg: 12, unlock: (g) => g.film.buzzNeg >= 10 }
  ];

  // ---------- production events ----------
  const EVENTS = [
    {
      id: "stunt", title: "The Crane Is Singing",
      text: "The jib on the big set piece is bending under load, and frankly, it is making a sound. The stunt coordinator would like a decision — preferably one that does not end in a tabloid headline.",
      choices: [
        { label: "Bring in certified riggers", cost: 1.2, detail: "Safe. Boring, in a good way.", run: (g) => { g.log("Riggers secured the rig. The crane is now boring. Production continues.", "good"); } },
        { label: "Shoot it anyway", cost: 0, detail: "Free. The crane is singing a little louder now.", run: (g) => {
          if (Math.random() < 0.45) { g.film.quality = clamp(g.film.quality - 8, 5, 100); g.film.buzzNeg = clamp(g.film.buzzNeg + 6, 0, 150); g.log("A stuntman sprained his wrist on camera. The footage is shaky and the tabloids are having a very good afternoon. Quality −8, negative buzz +6.", "bad"); }
          else g.log("The stunt landed clean. The coordinator is still shaking, but the take is gold.", "good");
        } }
      ]
    },
    {
      id: "actor-sick", title: "The Lead Ate a Burrito",
      text: "Your lead has food poisoning the morning of the finale shoot. It was a gas station burrito. The day's schedule is a two-week catchup.",
      choices: [
        { label: "Reschedule the day", cost: 0.9, detail: "Costs money. The burrito gets what's coming to it.", run: (g) => { g.log("The finale was rescheduled. The actor ate bland soup and performed flawlessly.", "good"); } },
        { label: "Cannibalize coverage", cost: 0, detail: "Free, but the finale will feel thinner.", run: (g) => { g.film.quality = clamp(g.film.quality - 5, 5, 100); g.log("The finale is held together with B-roll and a lot of faith. Quality −5.", "bad"); } }
      ]
    },
    {
      id: "director-passion", title: "The Orchestra Idea",
      text: "Your director wants to re-shoot the entire third act with a live orchestra in the frame. This is, against all odds, a good idea.",
      choices: [
        { label: "Fund the orchestra", cost: 1.1, detail: "Quality +6. The music is worth it.", run: (g) => { g.film.quality = clamp(g.film.quality + 6, 5, 100); g.log("The orchestra is in the frame. It is, against all odds, a good idea. Quality +6.", "good"); } },
        { label: "Protect the schedule", cost: 0, detail: "Quality −3. The director will remember this fondly, and then not.", run: (g) => { g.film.quality = clamp(g.film.quality - 3, 5, 100); g.log("The director accepts it, but the third act plays it safe. Quality −3.", "bad"); } }
      ]
    },
    {
      id: "weather", title: "A Storm With a Personality",
      text: "A storm front has grounded the exterior sequence for two days. Half the production is idle, but not idle-cheap, and the crew has started a card game.",
      choices: [
        { label: "Rent the soundstage", cost: 0.8, detail: "Shoot indoors on schedule.", run: (g) => { g.log("The storm is a rain effect now. The calendar is intact. The card game is not.", "good"); } },
        { label: "Let the crew rest", cost: 0, detail: "Save money; the schedule slips and morale dips.", run: (g) => { g.film.quality = clamp(g.film.quality - 4, 5, 100); g.log("Two lost days, a card-game debt, and a crew with too much coffee. Quality −4.", "bad"); } }
      ]
    },
    {
      id: "script-hole", title: "The Climax Is Doing a Bit",
      text: "The dailies reveal that the climax is simply not landing. Two departments are waiting on you for an answer, in the silent way that departments do.",
      choices: [
        { label: "Bring in a rewrite team", cost: 1.6, detail: "Quality +8. Costs a fortune.", run: (g) => { g.film.quality = clamp(g.film.quality + 8, 5, 100); g.log("The rewrite team worked the weekend and produced a scene that made people cry in the trucks. Quality +8.", "good"); } },
        { label: "Trust the original draft", cost: 0, detail: "Free, but the climax stays weird.", run: (g) => { g.film.quality = clamp(g.film.quality - 6, 5, 100); g.log("The climax stays, unchanged, faintly smelling of a conference room. Quality −6.", "bad"); } }
      ]
    },
    {
      id: "tabloid", title: "The Cab Photo",
      text: "A rag has a photo of the lead and co-lead 'sharing a cab'. The story is running out of control, and everyone is very interested in what you do about it.",
      choices: [
        { label: "Release a spin statement", cost: 0.5, detail: "They love a scandal. Positive +6, negative +2.", run: (g) => { g.film.buzzPos = clamp(g.film.buzzPos + 6, 0, 150); g.film.buzzNeg = clamp(g.film.buzzNeg + 2, 0, 150); g.log("'Just coworkers' — it works. Positive buzz +6, and a little negative +2. Hollywood runs on this.", "gold"); } },
        { label: "Say nothing", cost: 0, detail: "Let it die... or grow.", run: (g) => {
          if (Math.random() < 0.5) { g.film.buzzPos = clamp(g.film.buzzPos + 4, 0, 150); g.log("The rumor peaked on its own. Positive buzz +4.", "good"); }
          else g.log("The story fizzled. The tabloid is now covering a reality show.", "good");
        } }
      ]
    },
    {
      id: "franchise", title: "The Call From the Studio",
      text: "A distribution executive has called to suggest 'franchise elements'. A lot of them. Some of them CGI. The hand reaching out of the ocean has already been sent over for reference.",
      choices: [
        { label: "Keep the film pure", cost: 0, detail: "Reputation +2, quality +3 if your director is strong.", run: (g) => {
          g.studio.reputation = clamp(g.studio.reputation + 2, 0, 100);
          const bonus = g.film.cast.directorScore >= 55 ? 3 : 1;
          g.film.quality = clamp(g.film.quality + bonus, 5, 100);
          g.log("You hang up on the franchise pitch. The crew notices. The film sharpens.", "gold");
        } },
        { label: "Add the CGI sequel hook", cost: 0.7, detail: "Positive +4, negative +4, quality −3.", run: (g) => { g.film.quality = clamp(g.film.quality - 3, 5, 100); g.film.buzzPos = clamp(g.film.buzzPos + 4, 0, 150); g.film.buzzNeg = clamp(g.film.buzzNeg + 4, 0, 150); g.log("The post-credits shot of a hand reaching out of the ocean is doing something to the test-audience's eyes. The internet is doing something else entirely. Quality −3, buzz +4 and −4.", "bad"); } }
      ]
    },
    {
      id: "equipment", title: "The Lens Set Got Towed",
      text: "A grip truck was towed overnight and the bespoke lens set went with it. The D.P. is quiet, which is the worst kind of quiet.",
      choices: [
        { label: "Rent a matching set", cost: 0.9, detail: "No visual compromise.", run: (g) => { g.log("The replacement lenses are indistinguishable. The D.P. exhales for the first time in two days.", "good"); } },
        { label: "Adapt the look", cost: 0, detail: "Quality −4, but a strange new aesthetic emerges.", run: (g) => { g.film.quality = clamp(g.film.quality - 4, 5, 100); g.log("The D.P. improvises a new look. Critics will either love it or write about it for the next decade.", "bad"); } }
      ]
    },
    {
      id: "catering", title: "The Catering Memo",
      text: "Catering has been described, in a memo, as 'a growth area'. Half the cast is running on gas station coffee and it is showing.",
      choices: [
        { label: "Order the good stuff", cost: 1.0, detail: "Truffle sandwiches by lunch. Quality +5.", run: (g) => { g.film.quality = clamp(g.film.quality + 5, 5, 100); g.log("The truffle sandwich appears on set by lunch. The take improves by 5, and so does the mood.", "good"); } },
        { label: "Trust the gas station coffee", cost: 0, detail: "Free. It has come this far, hasn't it?", run: (g) => {
          if (Math.random() < 0.5) g.log("They somehow make it work. The coffee was fine. Nothing happened.", "good");
          else { g.film.quality = clamp(g.film.quality - 5, 5, 100); g.log("The 3pm energy crash lands squarely in the middle of the emotional climax. Quality −5.", "bad"); }
        } }
      ]
    },
    {
      id: "method", title: "The Method Is Working",
      text: "Your lead is 'in it' in a way the craft services department is not entirely comfortable with. They have started a petition. It is a nice one.",
      choices: [
        { label: "Gently pull them out", cost: 0.8, detail: "Dinner, a warm bath, a kind word. Quality +4.", run: (g) => { g.film.quality = clamp(g.film.quality + 4, 5, 100); g.log("The character returns, gently, on schedule. The petition is quietly shredded.", "good"); } },
        { label: "Let the method method", cost: 0, detail: "It has worked for other people. Probably.", run: (g) => {
          if (Math.random() < 0.5) { g.film.quality = clamp(g.film.quality + 6, 5, 100); g.log("The method pays off. The scene is terrifying, and it is not the character's fault. Quality +6.", "gold"); }
          else { g.film.quality = clamp(g.film.quality - 6, 5, 100); g.log("The method has outlived the film. Wrapping the take takes forty minutes and one lawyer. Quality −6.", "bad"); }
        } }
      ]
    },
    {
      id: "wiki", title: "The Fan Wiki",
      text: "A fan group has launched a 4,000-page 'what we would have changed' wiki. The studio finds this 'interesting'.",
      choices: [
        { label: "Release a calm statement", cost: 0.6, detail: "Kind, measured, and it quotes the wiki once. Buzz +5.", run: (g) => { g.film.buzz = clamp(g.film.buzz + 5, 0, 150); g.log("The statement is calm, kind, and quotes the fan wiki exactly once. Buzz +5.", "good"); } },
        { label: "Read the wiki", cost: 0, detail: "4,000 pages. Someone has to.", run: (g) => {
          if (Math.random() < 0.5) { g.film.quality = clamp(g.film.quality + 3, 5, 100); g.log("One of the 4,000 pages is, shockingly, good advice. Quality +3.", "good"); }
          else { g.film.quality = clamp(g.film.quality - 3, 5, 100); g.log("4,000 pages. The team now sleeps with the notebook closed. Quality −3.", "bad"); }
        } }
      ]
    },
    {
      id: "score-leak", title: "The Score Leak",
      text: "Someone has uploaded a 90-second clip of the score. It is lovely. It is also the entire third act, compressed into 90 seconds.",
      choices: [
        { label: "Lean into it", cost: 0.5, detail: "Let the mystery marinate. Positive +7.", run: (g) => { g.film.buzzPos = clamp(g.film.buzzPos + 7, 0, 150); g.log("The 90 seconds is everywhere now, and everyone wants to know how the movie ends. Positive buzz +7.", "gold"); } },
        { label: "Request a takedown", cost: 0.6, detail: "Legal is confident. Legal is usually confident.", run: (g) => {
          if (Math.random() < 0.5) { g.film.buzzPos = clamp(g.film.buzzPos + 3, 0, 150); g.log("The takedown works and the mystery survives to opening weekend. Positive buzz +3.", "good"); }
          else { g.film.buzzNeg = clamp(g.film.buzzNeg + 4, 0, 150); g.log("The file outlives every takedown, and the discussion turns sour. Negative buzz +4. The film is fine.", "bad"); }
        } }
      ]
    },
    {
      id: "red-carpet", title: "The Red Carpet Slip",
      text: "Your lead is asked about the film and, uncharacteristically, says 'my agent made me do the third act'. The clip is everywhere within the hour.",
      choices: [
        { label: "Hold a humble press conference", cost: 0.8, detail: "The apology lands. Negative buzz −8.", run: (g) => {
          g.film.buzzNeg = Math.max(0, Math.round((g.film.buzzNeg - 8) * 10) / 10);
          g.log("The apology is sincere, a little long, and it lands. Negative buzz −8.", "good");
        } },
        { label: "Let the clip run", cost: 0, detail: "Charming chaos: negative +10, positive +8.", run: (g) => {
          g.film.buzzNeg = clamp(g.film.buzzNeg + 10, 0, 150);
          g.film.buzzPos = clamp(g.film.buzzPos + 8, 0, 150);
          g.log("Unapologetic is a brand these days. The clip becomes a meme and people love it — some don't. Negative +10, positive +8.", "gold");
        } }
      ]
    },
    {
      id: "tzm", title: "The Weekend Photo",
      text: "A celebrity site has published a photo of your lead doing something unscripted over the weekend. It is, depending on who you ask, either a scandal or a masterpiece.",
      choices: [
        { label: "Embrace the chaos", cost: 0, detail: "Positive +12, negative +10. Both.", run: (g) => {
          g.film.buzzPos = clamp(g.film.buzzPos + 12, 0, 150);
          g.film.buzzNeg = clamp(g.film.buzzNeg + 10, 0, 150);
          g.log("The studio's statement: 'They're an artist.' The positive buzz is enormous. So is the negative.", "gold");
        } },
        { label: "Send the lawyers", cost: 1.2, detail: "The photo comes down. Negative buzz −6.", run: (g) => {
          g.film.buzzNeg = Math.max(0, Math.round((g.film.buzzNeg - 6) * 10) / 10);
          g.log("The photo is gone, the lawyers are billable, and the story mostly dies. Negative buzz −6.", "good");
        } }
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

  // ---------- awards & golden popcorns (trophy room) ----------
  const AWARDS = [
    "Golden Reel — Best Picture",
    "Bronze Balloon — Best Director",
    "Academy of Celluloid — Best Ensemble",
    "Silver Marquee — Critics' Pick of the Year",
    "The Weeping Screen — Best Film to Call Your Mother About",
    "Popcorn Society — Best Good Time"
  ];

  const RAZZIES = [
    "Rotten Reel Golden Popcorn — Worst Picture",
    "Golden Ticket — Most Disappointing Post-Credits Shot",
    "The Empty Auditorium — Audience of One",
    "Brass Candle — Best Film Nobody Asked For"
  ];

  const RIVAL_STUDIOS = ["Apex Features", "Crimson Reel", "Northlight", "Gilded Gate", "Pioneer Lot", "Silverline", "Blue Harbor", "Fifth & Vine", "Redline", "Halo Pictures", "Westport", "Marble Arch", "Kestrel", "Bastion", "Lantern Row"];

  // ---------- industry headlines (HQ news tab) ----------
  const HEADLINE_GLOSS = [
    (s) => `${s} is 'open to the right project'. The wrong project has a waiting list.`,
    (s) => `${s} is reportedly 'taking a break'. The internet disagrees with the break.`,
    (s) => `A ${s} interview is doing the rounds. The clips are more entertaining than the film they promote.`,
    (s) => `${s} was seen at a rival studio lot. Which lot is the better story.`
  ];

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

  function makeHeadlines(studioName, last, trends) {
    const gs = Object.keys(GENRES);
    const ranked = gs.slice().sort((a, b) => trends[b] - trends[a]);
    const hot = ranked[0], cold = ranked[ranked.length - 1];
    const h = [];
    h.push(trends[hot] >= 1.1 ? `${hot} is the new word in the town. Everyone has a ${hot.toLowerCase()} idea.`
      : trends[hot] > 0.95 ? `${hot} is quietly having a moment, which in this town is a headline.`
      : `Even ${hot} is struggling. The town is having a weird week.`);
    h.push(trends[cold] <= 0.9 ? `Trade memo: ${cold} films opening into empty auditoriums.`
      : `${cold} is finding a weird second life on streaming. The studios are pretending not to care.`);
    if (last) {
      if (last.grade === "S" || last.grade === "A+") h.push(`The trades say ${studioName} is 'to watch' this season. All of them, suspiciously.`);
      else if (last.grade === "F" || last.grade === "D") h.push(`A ${studioName} picture is the subject of a viral thread. Nobody is smiling. Everyone is.`);
      else h.push(`${studioName}'s last release did exactly what the numbers suggested. Boring, in a good way.`);
    }
    h.push(`${pick(RIVAL_STUDIOS)} greenlights a ${pick(gs)} event picture. The word is: big. The other word is: maybe.`);
    h.push(pick(HEADLINE_GLOSS)(pick(PARODY_STARS).name));
    return h;
  }

  // ---------- the boardroom: advisory execs + their notes ----------
  const ADVISORS = [
    { id: "gerald",    name: "Gerald Fitch",       title: "Studio Head",             mono: "GF", color: "#ff7a6e" },
    { id: "dot",      name: "Dot Quince",         title: "Chief Financial Officer", mono: "DQ", color: "#3ec97e" },
    { id: "babs",     name: "Babs Merriweather",  title: "Head of Development",     mono: "BM", color: "#9b7fe8" },
    { id: "percy",    name: "Percival Loam",      title: "Casting Director",        mono: "PL", color: "#f06bb4" },
    { id: "vivienne", name: "Vivienne St. Clair", title: "Head of Marketing & PR",  mono: "VS", color: "#ffd86b" },
    { id: "mona",     name: "Mona Delacroix",     title: "Head of Distribution",    mono: "MD", color: "#5aa9e6" }
  ];

  // Each hint: topic (script|budget|casting|production|boxoffice|results|hq),
  // which exec delivers it, an optional when(ctx) gate, and t(ctx) → the note.
  // *stars* in a note render as emphasis. flavor = pure character, no advice.
  const HINTS = [
    // Each note: topic, exec, optional when(ctx) gate, pri (3 = will F the
    // picture if ignored, 2 = real lever, 1 = routine), flavor = pure voice.
    // The office's etiquette: a pri-3 note is never diluted by small talk.

    // ---------- DEVELOPMENT ----------
    { id: "scr-dot-spread", topic: "script", exec: "dot", pri: 2, when: (c) => !c.sel,
      t: (c) => `Three pages on the desk: ${c.opts.map((o) => o.quality).join(" / ")} quality. Quality is fifty-five percent of the film; the rest is casting and money. I don't read genres, I read *numbers* — pick with both eyes open.` },
    { id: "scr-dot-gap", topic: "script", exec: "dot", pri: 3, when: (c) => c.sel && c.quality < c.bestQ - 8,
      t: (c) => `You picked quality ${c.quality} when that desk holds ${c.bestQ}. That gap is ${c.bestQ - c.quality} points of film you will never buy back. The *rewrite* button is the only door I can still walk through — or go pick the other page. Both are open.` },
    { id: "scr-babs-hot", topic: "script", exec: "babs", pri: 2, when: (c) => c.sel && c.trend >= 1.12,
      t: (c) => `${cap(c.genre)} is the hottest shelf in town right now (${pct(c.trend)} on the opening weekend). Audiences show up to *that* shelf whether the film is ready for it or not. This window is open; windows close.` },
    { id: "scr-babs-cold", topic: "script", exec: "babs", pri: 3, when: (c) => c.sel && c.trend <= 0.9,
      t: (c) => `Careful. ${cap(c.genre)} is the cold shelf this season (${pct(c.trend)}) — you'd be opening into a room that isn't there. I've buried better scripts on a cold shelf than I've found on a warm one.` },
    { id: "scr-mona-doc", topic: "script", exec: "mona", pri: 3, when: (c) => c.sel && c.audience <= 0.7,
      t: (c) => `Documentaries open at ${c.audience}× the market — less than *half* the room an action film gets. That's not a knock; it's a *scale*. This one has to be cheap to make and viral to pay. Check the budget page before you sign.` },
    { id: "scr-mona-big", topic: "script", exec: "mona", pri: 2, when: (c) => c.sel && c.audience >= 1.3 && c.trend >= 0.95,
      t: (c) => `A big-audience ${cap(c.genre)} (${c.audience}× the market) into a ${pct(c.trend)} shelf. That's the combination I actually *like*: the room is big and the weather is good. Whatever you do next, don't sand this off.` },
    { id: "scr-gerald-debut", topic: "script", exec: "gerald", pri: 2, when: (c) => c.sel && c.filmsMade === 0 && c.quality >= 60,
      t: (c) => `First picture, and the page is ${c.quality}. The board reads that as a *studio*, not a script — and studios, unlike scripts, don't get second drafts. Don't trade it in casting for a famous name. I've seen debuts die of *taste*.` },
    { id: "scr-gerald-debutweak", topic: "script", exec: "gerald", pri: 3, when: (c) => c.sel && c.filmsMade === 0 && c.quality < 50,
      t: (c) => `A ${c.quality} page on a first picture. I'm not saying it can't be saved; I'm saying the *rest* of this film now has to carry its weight. Cast sharp, budget true, and spend the rewrites before the cameras roll — not after.` },
    { id: "scr-babs-rewrite", topic: "script", exec: "babs", pri: 2, when: (c) => c.sel && c.rewrites >= 2,
      t: (c) => `${c.rewrites} rewrite weeks — ${c.M(c.rewrites * 0.3)} total. Development is the only department in this town where money reliably buys quality; after the cameras roll, money only buys *problems*. If the page is worth it, this is where you spend.` },
    { id: "scr-babs-raw", topic: "script", exec: "babs", pri: 2, when: (c) => c.sel && c.rewrites === 0,
      t: (c) => `Zero rewrites. Fine — the page is what it is, and I respect a producer who isn't afraid of it. Just know you're carrying it into casting *unfixed*: whatever wound is in the second act, the film keeps it.` },
    { id: "scr-viv-sentence", topic: "script", exec: "vivienne", pri: 1, when: (c) => c.sel,
      t: (c) => `Whatever you pick, the audience has to be able to sell it to a *stranger* in one sentence. The logline on that card is the only ad copy you get free — read it like the papers will, because they will.` },
    { id: "scr-percy-flavor", topic: "script", exec: "percy", flavor: true,
      t: (c) => `I don't read scripts. I read the *kind* of scripts — some need a star, some need a camera, some just need a room to happen in. Yours will tell me what to bring to the table next week.` },

    // ---------- BUDGET ----------
    { id: "bud-dot-under", topic: "budget", exec: "dot", pri: 3, when: (c) => c.ratio < 0.75,
      t: (c) => `You're at ${Math.round(c.ratio * 100)}% of the ${c.M(c.est)} ideal — projected quality ${c.proj}, which is ${c.projIdeal - c.proj} points below the ${c.projIdeal} this page could be at full budget. Each 10% under the ideal is ~5% of the film. I can defend a *choice*; I cannot defend a drift.` },
    { id: "bud-dot-low", topic: "budget", exec: "dot", pri: 2, when: (c) => c.ratio >= 0.75 && c.ratio < 0.9,
      t: (c) => `${Math.round(c.ratio * 100)}% of ideal. That's the last number I'll defend; below it, quality stops dipping and starts *falling* — and the weeks fall with it. I've seen a "savings" cost a third act. If the money's tight, cut the schedule *on purpose* — or cut the ads; the page is the one thing that doesn't come back.` },
    { id: "bud-dot-sweet", topic: "budget", exec: "dot", pri: 1, when: (c) => c.ratio >= 0.9 && c.ratio <= 1.15,
      t: (c) => `Inside the number. That's the whole trick, actually — budget near the ideal and I go quiet. You just heard it.` },
    { id: "bud-dot-over", topic: "budget", exec: "dot", pri: 2, when: (c) => c.ratio > 1.15 && c.ratio <= 1.35,
      t: (c) => `${c.M(c.budget)} against a ${c.M(c.est)} ideal. Past 115% over, each extra 10% of budget is ~1% of quality — you're paying *fifteen times* what it's worth, and what you're buying is schedule, not film. The bank will lend you the difference and remember your name.` },
    { id: "bud-dot-wayover", topic: "budget", exec: "dot", pri: 3, when: (c) => c.ratio > 1.35,
      t: (c) => `The ideal is ${c.M(c.est)}. You've set ${c.M(c.budget)} — that's ${Math.round(c.ratio * 100)}%. I have the bank on the second line. I am *not* dialing. Yet.` },
    { id: "bud-mona-fx", topic: "budget", exec: "mona", pri: 2, when: (c) => c.ratio < 0.8 && ["Sci-Fi", "Animation", "Action"].includes(c.genre),
      t: (c) => `An underfunded ${cap(c.genre)} is one you can *see* is underfunded — the audience looks straight through the floor at the missing money. If you have to cut, cut where the camera can't reach.` },
    { id: "bud-dot-funds", topic: "budget", exec: "dot", pri: 3, when: (c) => c.budget > c.fundable,
      t: (c) => `Let me save you the button: you can fund ${c.M(c.fundable)}. Set it there, and stop negotiating with a spreadsheet — the bank trims the rest, and what the bank trims, it does not put back.` },
    { id: "bud-dot-weeks", topic: "budget", exec: "dot", pri: 2, when: (c) => c.weeks >= 8,
      t: (c) => `${c.weeks} weeks of production at ${c.M(c.weekly)}/week. Longer isn't better — it's *longer*: every extra week is money, risk, and another event the crew will find for you. If the ideal says fewer weeks, the film *is* fewer weeks.` },
    { id: "bud-gerald-flavor", topic: "budget", exec: "gerald", flavor: true,
      t: (c) => `Budgets are a promise you make to a room of people who *remember*. Make the whole promise — or make a smaller one on purpose. What you cannot do is make the promise and then look surprised at the weather.` },

    // ---------- CASTING ----------
    { id: "cas-percy-value", topic: "casting", exec: "percy", pri: 3, when: (c) => c.lead && c.valueLoss >= 0.3,
      t: (c) => `That lead is ${c.M(c.leadCost)} for ${c.leadDraw} draw — and the *value* card in that slot is ${c.bestLead.name} at ${c.M(c.bestLead.cost)} for ${c.bestLead.draw}. The fee is a *cost*; the draw is a lever, and the lever has a *ceiling*. I don't pay a star for the difference.` },
    { id: "cas-percy-fee", topic: "casting", exec: "percy", pri: 3, when: (c) => c.lead && c.cheapLead && c.lead.cost >= c.cheapLead.cost * 1.6 && c.lead.draw < c.leadMaxDraw,
      t: (c) => `The ${c.lead.name} card is ${c.M(c.leadCost)} — ${c.cheapLead.name} over there does ${Math.round((c.cheapLead.draw / Math.max(1, c.lead.draw)) * 100)}% of that draw for ${c.M(c.cheapLead.cost)}. The name is a *cost*, not a lever. The fee is paid once and remembered *forever*.` },
    { id: "cas-percy-line", topic: "casting", exec: "percy", pri: 3, when: (c) => c.total > 0 && c.total > c.funds,
      t: (c) => `Total fees ${c.M(c.total)}; the studio's cash is ${c.sM(c.funds)}. The difference comes off the credit line, and the line is the bank's *memory* — it remembers what you borrow, and it repossesses what you don't repay. Trim the bench until the fees come out of the building, not the bank.` },
    { id: "cas-percy-total", topic: "casting", exec: "percy", pri: 3, when: (c) => c.total > c.fundable * 0.85,
      t: (c) => `Total fees ${c.M(c.total)} against ${c.M(c.fundable)} of total capacity. Casting is the only column that can *eat the rest of the budget* — and when it does, production is the one that gets quietly starved, and the film feels it in week two. One of these two has to be smaller.` },
    { id: "cas-percy-fine", topic: "casting", exec: "percy", pri: 1, when: (c) => c.total > 0 && c.total <= c.fundable * 0.85,
      t: (c) => `Fees ${c.M(c.total)} with your ${c.talentOff}% studio discount — that's the market doing the budgeting. Keep the *rest* of the budget for the thing that makes the film, not the marquee.` },
    { id: "cas-percy-dir", topic: "casting", exec: "percy", pri: 2, when: (c) => c.dir && c.bestDir && c.dir.score < c.bestDir.score - 4 && c.dir.cost >= c.bestDir.cost,
      t: (c) => `You're paying ${c.M(c.dirCost)} for a ${c.dirScore} when ${c.bestDir.name} is ${c.M(c.bestDir.cost)} for a ${c.bestDir.score}. The takes don't get cheaper because the signature is famous — they get *worse*. The score column is a reason, and this is the reason.` },
    { id: "cas-dot-social", topic: "casting", exec: "dot", pri: 2, when: (c) => c.lead && c.leadSocial >= 60,
      t: (c) => `High social on that lead — ${c.leadSocial}. Every ad you buy in production lands ${(1 + c.leadSocial / 200).toFixed(2)}× harder; the internet is already at the party, and your money just decides how loud. That fee is the only one I ever call an *investment*.` },
    { id: "cas-dot-quiet", topic: "casting", exec: "dot", pri: 2, when: (c) => c.total > c.fundable * 0.5 && c.lead && c.leadSocial < 30,
      t: (c) => `You're paying ${c.M(c.total)} for a crew whose social is ${c.leadSocial}. The meter is going to cost *real money* to move — that draw was supposed to do it for free. The internet is not coming on its own.` },
    { id: "cas-gerald-star", topic: "casting", exec: "gerald", pri: 3, when: (c) => c.lead && c.filmsMade === 0 && (c.lead.tier === "A-List Star" || c.lead.cost >= 4.5),
      t: (c) => `First picture, and the lead's fee is ${c.M(c.leadCost)} — the slot holds ${c.leadMaxDraw} draw at ${c.M(c.leadMaxCost)}, so the name is doing *something*, I'll grant you. But the board doesn't understand taste; it understands *math*. I understand the math. Pick the number, not the name.` },
    { id: "cas-gerald-proj", topic: "casting", exec: "gerald", pri: 3, when: (c) => c.total > 0 && c.projQ < c.valueProjQ - 8,
      t: (c) => `With that bench, this film projects to quality ${c.projQ}. The *value* bench in those same slots projects to ${c.valueProjQ}. You're paying more for *less* film. I've run studios that fell for the name; I have not run one that got back up.` },
    { id: "cas-gerald-flavor", topic: "casting", exec: "gerald", flavor: true,
      t: (c) => `Casting is the only department where the cheapest and the best are sometimes the *same* person. Find that person. I've seen them. It is almost never the one in the first slot.` },

    // ---------- PRODUCTION ----------
    { id: "prod-viv-quiet", topic: "production", exec: "vivienne", pri: 3, when: (c) => c.net <= 5 && c.buzzPos < 15,
      t: (c) => `The meters are at ${c.buzzPos} green / ${c.buzzNeg} red — the internet has stopped talking about you. That's the real danger: not noise, *quiet*. At these meters the film opens ≈${c.M(c.opening)}/week. A social push is ${c.M(0.8)} for +${c.socialGain} — the cheapest reminder in town that you exist. Buy it.` },
    { id: "prod-viv-cancel", topic: "production", exec: "vivienne", pri: 2, when: (c) => c.net <= 5 && c.buzzPos >= 15,
      t: (c) => `The meters are ${c.buzzPos} green and ${c.buzzNeg} red — they're *cancelling* each other, and the opening weekend only sees the difference: +${c.net}. You've bought attention and then argued about it. Clean the red, or push the green — at a wash, the film opens as if nobody made it.` },
    { id: "prod-viv-redwin", topic: "production", exec: "vivienne", pri: 3, when: (c) => c.net < 0,
      t: (c) => `The red meter is *winning* — ${c.buzzPos} green, ${c.buzzNeg} red, net ${c.net}. The opening weekend subtracts all of it: you're opening at ${Math.round(Math.max(0.35, 1 + 5.5 * c.net / 100) * 100)}% of the audience a clean film would get. PR cleanup is ${c.M(1.2)} for −12. Buy the quiet before the marquee.` },
    { id: "prod-viv-loud", topic: "production", exec: "vivienne", pri: 2, when: (c) => c.net >= 25,
      t: (c) => `You're at +${c.net} net buzz — that's the work of three ad buys already on the meter, and the opening is projected at ${c.M(c.opening)}/week *because of it*. Now stop *adding*: it decays 3% a week, and the opening weekend only remembers the difference. Save the money for the red meter.` },
    { id: "prod-viv-redhot", topic: "production", exec: "vivienne", pri: 3, when: (c) => c.buzzNeg >= 20,
      t: (c) => `The red meter is at ${c.buzzNeg}. Every point of it is *eating your opening* — the green is at ${c.buzzPos} and the net is ${c.net}. PR cleanup is ${c.M(1.2)} for −12. In this town that is a *bargain*. Buy the quiet.` },
    { id: "prod-viv-red", topic: "production", exec: "vivienne", pri: 2, when: (c) => c.buzzNeg >= 10 && c.buzzNeg < 20,
      t: (c) => `Red's at ${c.buzzNeg} — PR cleanup just unlocked (${c.M(1.2)} for −12). You can let it drift, and it *will* drift, and the opening weekend subtracts all of it. The statement is cheap. The statement is *cheap*.` },
    { id: "prod-babs-screen", topic: "production", exec: "babs", pri: 2, when: (c) => c.quality < 55 && !c.screened && c.canScreen,
      t: (c) => `Projected quality is ${c.quality}. The test screen is open (${c.M(0.5)}) — the only diagnosis you get *before* the critics do it for you, in public, forever. Sixty percent is the deadline; don't let the critics be the diagnostician.` },
    { id: "prod-babs-reshoot", topic: "production", exec: "babs", pri: 3, when: (c) => c.screened && c.screenScore < 55,
      t: (c) => `The audience voted ${c.screenScore}. Reshoots are ${c.M(1.5)} for +8 quality — after release, that same fix costs *reputation*, and a critic's first sentence. I know which bill is cheaper. Pay it now.` },
    { id: "prod-babs-gold", topic: "production", exec: "babs", pri: 1, when: (c) => c.screened && c.screenScore >= 70,
      t: (c) => `The audience is *in* — ${c.screenScore}. The advice is free and final: stop touching the film. You're welcome.` },
    { id: "prod-viv-tag", topic: "production", exec: "vivienne", pri: 2, when: (c) => !c.taglineSet && c.progress >= 60,
      t: (c) => `You haven't set a tagline. It's the only ad you buy *once* and runs for the life of the film — and the good one is usually the weird one, not the middle one. Read all three like the papers will; the worst one announces itself.` },
    { id: "prod-dot-cash", topic: "production", exec: "dot", pri: 3, when: (c) => c.funds < 3 && c.weekCost > 0.8,
      t: (c) => `Every remaining week is ${c.M(c.weekCost)}. The building has ${c.sM(c.funds)} left in it. I have a *feeling* about the next Tuesday; the bank has a letter. One of us is going to look prophetic — I'd rather it be the bank.` },
    { id: "prod-dot-gap", topic: "production", exec: "dot", pri: 2, when: (c) => c.projTotal < c.projCost * 0.9,
      t: (c) => `The scoreboard: at these meters the film projects ≈${c.M(c.projTotal)} against ${c.M(c.projCost)} committed. That gap is still *decisions* — the buzz, the screen, the reshoot. After release the menu closes. Work the meters.` },
    { id: "prod-dot-cover", topic: "production", exec: "dot", pri: 1, when: (c) => c.projTotal >= c.projCost * 1.3,
      t: (c) => `The scoreboard: ≈${c.M(c.projTotal)} projected against ${c.M(c.projCost)} committed. That margin is *yours to protect* — don't spend it on a fourth ad buy the meter doesn't need. Watch the red meter; that's where it leaks.` },
    { id: "prod-mona-weather", topic: "production", exec: "mona", pri: 1,
      t: (c) => `Week ${c.week + 1} of ${c.totalWeeks}. The film isn't in theaters yet; the *weather* is. At these meters it opens ≈${c.M(c.opening)}/week and decays ${c.decay}% a week — the opening weekend is made here, not at the premiere. Work the meters, not the marquee.` },
    { id: "prod-gerald-flavor", topic: "production", exec: "gerald", flavor: true,
      t: (c) => `I hear it was eventful on the lot this week. *Good*. Pictures that make nothing happen in production make nothing happen in theaters. Nothing is what sells.` },

    // ---------- BOX OFFICE ----------
    { id: "bo-mona-open", topic: "boxoffice", exec: "mona", pri: 2, when: (c) => c.week === 0,
      t: (c) => `The number appears in a moment. After that: watch the *curve*, not the number — the number is a week, the curve is the film. At ${c.decay}% weekly decay this is a ${c.M(c.projTotal)} shape against ${c.M(c.costs)} of costs. Everything after this is *watching*.` },
    { id: "bo-mona-curve", topic: "boxoffice", exec: "mona", pri: 2, when: (c) => c.week >= 1,
      t: (c) => c.decay >= 80
        ? `A ${cap(c.genre)} holding ${c.decay}% of its audience week to week is a *legs* picture — the curve looks small and it's *long*. Don't pull it early; every extra week is the audience finding it on its own. It's at ${c.M(c.last)} and projects to ${c.M(c.projTotal)} against ${c.M(c.costs)}. Let it run.`
        : `A ${cap(c.genre)} holding only ${c.decay}% of its audience dies on weeks two and three; the good part is already banked. ${c.M(c.last)} is ${c.prev > 0 ? pct(c.last / c.prev - 1) : "—"} on last week — that's the *shape*, not a surprise. When the curve says so, pull it and save the marquee.` },
    { id: "bo-mona-low", topic: "boxoffice", exec: "mona", pri: 2, when: (c) => c.week >= 2 && c.rank >= 7,
      t: (c) => `#${c.rank}. I'm not going to dress it up. But a rank is a *photo* and the total is the film: ${c.M(c.gross)} banked, ${c.M(c.projTotal)} projected, ${c.M(c.costs)} of costs. Work the *total*, not the photo.` },
    { id: "bo-dot-cold", topic: "boxoffice", exec: "dot", pri: 2, when: (c) => c.critics > 0 && c.critics < 45 && c.week <= 3,
      t: (c) => `The critics came in cold (${c.critics}). Fine. The internet is louder than the critics and meaner than the audience — and the meters are where the opening *actually* landed. Give it two weeks; the curve decides, not the reviews.` },
    { id: "bo-dot-cover", topic: "boxoffice", exec: "dot", pri: 1, when: (c) => c.projTotal > c.costs * 1.5,
      t: (c) => `At the current decay this runs to ≈${c.M(c.projTotal)} against ${c.M(c.costs)} of costs. That margin is yours to *keep* — don't fund the next picture on the strength of one good week. The trends tab tells you where it actually goes.` },
    { id: "bo-dot-narrow", topic: "boxoffice", exec: "dot", pri: 1, when: (c) => c.projTotal > c.costs && c.projTotal <= c.costs * 1.5,
      t: (c) => `≈${c.M(c.projTotal)} projected against ${c.M(c.costs)} of costs. That's a *real* number — the next picture has to open like this to beat it. That's development work: the page, the bench, the shelf. Do it there, not in the ads.` },
    { id: "bo-gerald-flavor", topic: "boxoffice", exec: "gerald", flavor: true,
      t: (c) => `I'm watching the number, not the film. Don't mistake the two. The number is the only one that sends *invoices*.` },

    // ---------- RESULTS ----------
    { id: "res-dot-good", topic: "results", exec: "dot", pri: 1, when: (c) => c.profit > 0,
      t: (c) => `Profit ${c.M(c.profit)} at a ${pct(1 + c.margin)} margin. Filed. The bank's trust moved the right way, which in this town means *it will lend you more* — read that sentence twice. Stay profitable. Stay boring about it.` },
    { id: "res-dot-line", topic: "results", exec: "dot", pri: 3, when: (c) => c.profit <= 0 && c.debt > 0,
      t: (c) => `The picture cost ${c.M(c.totalCosts)} and did ${c.M(c.gross)}. The line paid the gap, and the bank *files* what the line pays for. Next picture has to cover its own line — that's the whole lesson, and it's a small one.` },
    { id: "res-dot-small", topic: "results", exec: "dot", pri: 2, when: (c) => c.profit <= 0 && c.debt <= 0,
      t: (c) => `The red column: ${c.sM(c.profit)} — and the line was never touched, which is the whole discipline. But small losses don't pay rent either. The next picture has to clear its own costs *with room to spare*; the development page is where you find the room.` },
    { id: "res-percy-cast", topic: "results", exec: "percy", pri: 3, when: (c) => c.castShare >= 45,
      t: (c) => `Casting was ${c.M(c.castCost)} of a ${c.M(c.totalCosts)} picture — ${c.castShare}% of *everything*. That's the whole lesson, and it's a small one: the next lead costs less and draws the same. The name is not the film. It *never* was.` },
    { id: "res-percy-prod", topic: "results", exec: "percy", pri: 2, when: (c) => c.profit <= 0 && c.castShare < 45 && c.biggest === "production",
      t: (c) => `The production column did it — ${c.M(c.prodCost)} of ${c.M(c.totalCosts)}. The next picture budgets *at the ideal*, not above it: past a certain line, money buys schedule, not film. I'll be watching that number.` },
    { id: "res-dot-ads", topic: "results", exec: "dot", pri: 2, when: (c) => c.adsShare >= 20 && c.profit <= 0,
      t: (c) => `Advertising was ${c.M(c.adsCost)} — ${c.adsShare}% of the picture — and it still didn't cover. The meter *decays*; ads are a match, not a furnace. Next time the page and the bench have to carry more, and the ad buy has to be *later* and smaller. The buzz should arrive, not be summoned.` },
    { id: "res-babs-craft", topic: "results", exec: "babs", pri: 2, when: (c) => c.quality >= 75 && c.profit <= 0,
      t: (c) => `The craft was *there* — ${c.quality} quality, and it opened into the wrong weather. A good film that loses money is a *financing* lesson, not a creative one: the budget, the window, the meters. And financing is the part I can fix. The page was fine. The page was *fine*.` },
    { id: "res-babs-page", topic: "results", exec: "babs", pri: 3, when: (c) => c.quality < 50,
      t: (c) => `Quality ${c.quality}. I'm not going to dress it up: the *page* was the wound — everything downstream just carried it. Next development round, the number comes first and the poster comes *second*. I've buried prettier pages than that one.` },
    { id: "res-mona-margin", topic: "results", exec: "mona", pri: 1, when: (c) => c.margin > 1.2,
      t: (c) => `That margin is a *rate card*. Every studio in town will read ${cap(c.genre)} as the weather for your next one — and so should you. The trends tab is open. The coffee's cold. Read it.` },
    { id: "res-mona-window", topic: "results", exec: "mona", pri: 2, when: (c) => c.margin < -0.3,
      t: (c) => `It ran ${c.weeks} weeks for ${c.M(c.gross)} against ${c.M(c.totalCosts)}. ${cap(c.hotGenre)} is at ${pct(c.hotHeat)} next season — the *next* opening is a development decision, not a release one. Pick the shelf with the pulse.` },
    { id: "res-gerald-board", topic: "results", exec: "gerald", pri: 2, when: (c) => c.filmsMade <= 2 && (c.grade === "F" || c.grade === "D"),
      t: (c) => `I run this studio, and I ran *that*. The board is at ${c.boardApproval} and the bank's line is ${c.M(c.limit)} now — both of them just *moved*. One good picture — *one* — is the only medicine I know. The next page starts today.` },
    { id: "res-gerald-flavor", topic: "results", exec: "gerald", flavor: true,
      t: (c) => `That's a picture. Every picture — *especially* that one — is the next one's casting meeting. The fee column just moved. You're welcome in advance.` },

    // ---------- HEADQUARTERS ----------
    { id: "hq-dot-board", topic: "hq", exec: "dot", pri: 3, when: (c) => c.boardApproval < 25,
      t: (c) => `The board is at ${c.boardApproval}. Below zero they vote, and the reprieve — exactly *one* — goes where the history justifies it. The next picture has to move that number: a picture that *clears* its budget is the only vote I know how to win. Fund it to win.` },
    { id: "hq-dot-banklow", topic: "hq", exec: "dot", pri: 3, when: (c) => c.bankTrust <= 35,
      t: (c) => `The line is down to ${c.M(c.limit)} — the bank is lending *less* on purpose, and you can feel it in the budget button. The next picture has to be small and *clean*: it can't cost more than it opens. I'll be watching that number with the bank.` },
    { id: "hq-dot-bankhigh", topic: "hq", exec: "dot", pri: 1, when: (c) => c.bankTrust >= 78,
      t: (c) => `The bank's file on you is now a *compliment* — the line is ${c.M(c.limit)}. That is exactly how people take on debt they can't service. Breathe. Don't let it buy you a habit.` },
    { id: "hq-dot-after", topic: "hq", exec: "dot", pri: 2, when: (c) => (c.lastGrade === "F" || c.lastGrade === "D"),
      t: (c) => `A ${c.lastGrade} moves the board to ${c.boardApproval} and the line to ${c.M(c.limit)}. The good news: the *levers* didn't change — the page, the budget, the bench. The next picture is the antidote. Go start it.` },
    { id: "hq-babs-hungry", topic: "hq", exec: "babs", pri: 1,
      t: (c) => `The development office is already circling. The town is hungry for ${cap(c.hotGenre)} (${pct(c.hotHeat)}) and it has had *enough* of ${cap(c.coldGenre)} (${pct(c.coldHeat)}). The shelf you open *into* is half the opening weekend — the next script page should know that before you do.` },
    { id: "hq-mona-trend", topic: "hq", exec: "mona", pri: 2, when: (c) => c.hotHeat - c.coldHeat > 0.15,
      t: (c) => `Same thing, in my numbers: right now a ${cap(c.hotGenre)} opens at ${pct(c.hotHeat)} *weather* and a ${cap(c.coldGenre)} at ${pct(c.coldHeat)} — all else equal. All else is your job. The shelf is the *free* part; don't pay for what you can get for free.` },
    { id: "hq-gerald-name", topic: "hq", exec: "gerald", pri: 1, when: (c) => c.filmsMade >= 3 && c.prestige >= 55,
      t: (c) => `${c.filmsMade} pictures in, and the fee column is at ${c.talentOff}% off — the market does your budgeting for you. That's what a *name* is. The next picture should be a bigger one; the discount is the invitation.` },
    { id: "hq-gerald-flavor", topic: "hq", exec: "gerald", flavor: true,
      t: (c) => `I ran that picture. I'll run the next one. The only difference will be the number on the budget page — and I have *thoughts* about the number.` }
  ];

  function pickHint(topic, ctx, avoid = []) {
    const all = HINTS.filter((h) => h.topic === topic);
    if (!all.length) return null;
    const gated = (h) => !h.when || h.when(ctx);
    // the office's etiquette: a critical note (the thing that will F the
    // picture) is never diluted by small talk — and it is exempt from the
    // anti-repetition rotation, because while the problem exists the office
    // keeps pointing at it. (The UI only re-rolls on a situation change, so
    // this is the office not letting go, not a loop.)
    const urgent = all.filter((h) => h.pri === 3 && gated(h));
    let pool;
    if (urgent.length) {
      pool = urgent.filter((h) => !avoid.includes(h.id));
      if (!pool.length) pool = urgent;
    } else {
      // the weighted 85% only draws *informational* notes, so the office
      // never pads a thin week with small talk; flavor is the 15% lottery
      // and the fallback when nothing informational is on the table.
      const info = all.filter((h) => gated(h) && !h.flavor && !avoid.includes(h.id));
      const fl = all.filter((h) => gated(h) && h.flavor && !avoid.includes(h.id));
      if (Math.random() < 0.15 && fl.length) {
        pool = fl;
      } else if (info.length) {
        const weighted = [];
        for (const h of info) for (let i = 0; i < (h.pri || 1); i++) weighted.push(h);
        pool = weighted;
      } else {
        pool = fl.length ? fl : all.filter(gated);
        if (!pool.length) pool = all;
      }
    }
    const h = pick(pool);
    return { exec: ADVISORS.find((a) => a.id === h.exec), text: h.t(ctx), tid: h.id };
  }
  return { pick, rand, randInt, clamp, shuffle, money, cap, pct, GENRES, adjectives, nouns, extraWords, loglines, taglineBank, OUTSIDE_BUZZ, CRITICS, REVIEW_QUOTES, AWARDS, RAZZIES, ADS, EVENTS, SCREEN_QUOTES, RIVAL_STUDIOS, RIVAL_GENRE_NOUNS, FIRST_NAMES, LAST_NAMES, DIRECTOR_FIRST, DIRECTOR_STYLE, PARODY_STARS, PARODY_DIRECTORS, makeHeadlines, ADVISORS, pickHint };
})();

// ---------- procedural generators ----------
(function (D) {

  const usedTitles = new Set();

  D.makeTitle = (genre) => {
    for (let i = 0; i < 24; i++) {
      const n = () => D.pick(D.nouns[genre]);
      const r = Math.random();
      let t;
      if (r < 0.35) t = `${D.pick(D.adjectives[genre])} ${n()}`;
      else if (r < 0.5) t = `The ${n()}`;                    // the single-noun title
      else if (r < 0.62) t = `The ${n()} of ${n()}`;
      else if (r < 0.74) t = `${n()}: ${D.pick(D.extraWords)}`;
      else if (r < 0.87) t = `Infinite ${n()}`;             // it is a very big franchise
      else t = `${n()} ${D.randInt(2, 4)}`;                // the sequel nobody asked for
      if (!usedTitles.has(t)) { usedTitles.add(t); return t; }
    }
    return D.pick(D.nouns[genre]) + " II";
  };

  const usedNames = new Set();
  const usedParodies = new Set();
  const usedParodyDirs = new Set();

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
    // recognizable parodies, more likely in bigger roles; each appears at most once per session
    const pChance = roleIndex === 0 ? 0.55 : roleIndex === 1 ? 0.45 : 0.3;
    if (Math.random() < pChance) {
      const free = D.PARODY_STARS.filter(p => !usedParodies.has(p.name));
      if (free.length) {
        const p = D.pick(free);
        usedParodies.add(p.name);
        return { name: p.name, tier: p.tier, draw: p.draw, social: p.social, cost: p.cost, quip: p.quip };
      }
    }
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
    if (Math.random() < 0.55) {
      const free = D.PARODY_DIRECTORS.filter(p => !usedParodyDirs.has(p.name));
      if (free.length) {
        const p = D.pick(free);
        usedParodyDirs.add(p.name);
        return { name: p.name, style: p.style, score: p.score, cost: p.cost };
      }
    }
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

  D.makeRivals = (playerRoughQuality, genre, heatOf) => {
    const rivals = [];
    const studios = D.shuffle(D.RIVAL_STUDIOS);
    const genres = Object.keys(D.GENRES);
    for (let i = 0; i < 9; i++) {
      const rGenre = i < 2 && Math.random() < 0.4 ? genre : D.pick(genres);
      const q = D.clamp(D.rand(0.2, 0.7) + playerRoughQuality * 0.25 + (rGenre === genre ? 0.08 : 0), 0.15, 0.95);
      const buzz = D.rand(15, 95);
      const g = D.GENRES[rGenre];
      const legs = g.legs || 0;
      const heat = heatOf ? heatOf(rGenre) : 1; // genre trend, applied to rivals too
      const potential = g.audience * heat * (1 + 5.5 * (buzz / 100)) * (0.55 + 0.55 * q) * D.rand(0.85, 1.1);
      const title = `${D.pick(D.adjectives[rGenre])} ${D.pick(D.RIVAL_GENRE_NOUNS[rGenre])}`;
      rivals.push({ title, genre: rGenre, studio: studios[i % studios.length], q, legs, buzz, potential, total: 0, last: 0, prev: null });
    }
    return rivals;
  };

  D.makeReviews = (quality, buzz) => {
    const picks = D.shuffle(D.CRITICS).slice(0, 4);
    const list = picks.map((c) => {
      const score = Math.round(D.clamp(quality + (buzz - 50) * 0.25 + c.bias + D.rand(-12, 12), 2, 100));
      const bucket = score >= 85 ? "rave" : score >= 70 ? "positive" : score >= 55 ? "mixed" : score >= 40 ? "pan" : "torch";
      return { name: c.name, outlet: c.outlet, score, quote: D.pick(D.REVIEW_QUOTES[bucket]) };
    });
    const avg = Math.round(list.reduce((s, r) => s + r.score, 0) / list.length);
    return { list, avg };
  };
  D.criticLabel = (avg) => avg >= 80 ? "RAVES" : avg >= 65 ? "POSITIVE" : avg >= 50 ? "MIXED" : avg >= 35 ? "COLD" : "INCENDIARILY NEGATIVE";

  D.weekGross = (rival, weekIndex, repBoost, legs = 0) => {
    const decay = D.clamp(0.62 + 0.32 * rival.q + legs, 0.5, 0.9);
    const v = rival.potential * Math.pow(decay, weekIndex) * D.rand(0.9, 1.1) * repBoost;
    rival.last = Math.round(v * 10) / 10;
    rival.total = Math.round((rival.total + rival.last) * 10) / 10;
    return rival.last;
  };

})(DATA);
