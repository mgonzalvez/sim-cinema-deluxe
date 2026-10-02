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
    // ---------- DEVELOPMENT ----------
    { id: "scr-gerald-know", topic: "script", exec: "gerald", when: (c) => !c.sel,
      t: (c) => `I'll tell you what I think of all three: I'll *know* it when I see it. The quality number matters more than the genre, but a genre the town is hungry for is free money. Check both.` },
    { id: "scr-gerald-yes", topic: "script", exec: "gerald", when: (c) => c.sel && c.quality >= 62,
      t: (c) => `That one. Yes. It has *the shape*. Do not second-guess it, and do not let anyone in this office talk you into the safe page. The safe page is how studios die.` },
    { id: "scr-babs-hi", topic: "script", exec: "babs", when: (c) => c.sel && c.quality >= 62,
      t: (c) => `"${c.title}" is the only one of these three with a second act that isn't a grocery list. Take it before the development intern does.` },
    { id: "scr-babs-lo", topic: "script", exec: "babs", when: (c) => c.sel && c.quality < 45,
      t: (c) => `You have "${c.title}" picked. I have read better first pages in a *waiting room*. One of the other two is less broken. Probably both, actually.` },
    { id: "scr-babs-best", topic: "script", exec: "babs", when: (c) => c.selIdx != null && c.selIdx !== c.bestIdx && c.sel && c.sel.quality < 55,
      t: (c) => `That is not the strongest page on your desk. "Measurably better" is a phrase I have learned to trust, and in this office it is the only phrase that pays.` },
    { id: "scr-mona-hot", topic: "script", exec: "mona", when: (c) => c.sel && c.trend >= 1.12,
      t: (c) => `${cap(c.genre)} is the hottest shelf in town right now (${pct(c.trend)}). Whatever that film becomes, it will open into a full room. Windows close. This one is open.` },
    { id: "scr-mona-cold", topic: "script", exec: "mona", when: (c) => c.sel && c.trend <= 0.9,
      t: (c) => `Careful. ${cap(c.genre)} is the cold shelf this season (${pct(c.trend)}). You would be opening into an *empty theater* — and I can fix a bad film. I cannot fix an empty theater.` },
    { id: "scr-dot-rewrite", topic: "script", exec: "dot", when: (c) => c.sel && c.rewrites >= 2,
      t: (c) => `${c.rewrites} rewrite weeks, ${c.M(c.rewrites * 0.3)}. Development is the *only* stage where money reliably buys quality. After the cameras roll, money only buys problems. Spend it here.` },
    { id: "scr-vivienne-sentence", topic: "script", exec: "vivienne", when: (c) => c.sel,
      t: (c) => `Whatever you pick, the audience should be able to tell a *stranger* about it in one sentence. If the logline can't do that, the film can't — and I am the one who has to print the sentence.` },
    { id: "scr-percy-kind", topic: "script", exec: "percy", flavor: true,
      t: (c) => `I don't read scripts. I read the *kind* of scripts — some need a star, some need a camera, some just need a room to happen in. Yours will tell me what to bring to the table next week.` },

    // ---------- BUDGET ----------
    { id: "bud-dot-under", topic: "budget", exec: "dot", when: (c) => c.ratio < 0.72,
      t: (c) => `You've set ${c.M(c.budget)} against an ideal of ${c.M(c.est)}. The bank and I are looking at the same spreadsheet. The bank is *nodding*. I am not. The film will feel this in week two, on a Tuesday, when nobody is around to explain it.` },
    { id: "bud-dot-low", topic: "budget", exec: "dot", when: (c) => c.ratio >= 0.72 && c.ratio < 0.85,
      t: (c) => `Slightly under the ideal. Defensible. I will defend it *once*. After that I have other numbers to defend, and they are all mine.` },
    { id: "bud-dot-sweet", topic: "budget", exec: "dot", when: (c) => c.ratio >= 0.85 && c.ratio <= 1.12,
      t: (c) => `That's the number. Somewhere around the ideal, and I stop talking. I want you to know how *rare* that is.` },
    { id: "bud-dot-over", topic: "budget", exec: "dot", when: (c) => c.ratio > 1.12 && c.ratio <= 1.3,
      t: (c) => `A little over the ideal. The quality column will notice — barely. The *funds* column will notice it a lot. That is the deal. I'll sign it.` },
    { id: "bud-dot-wayover", topic: "budget", exec: "dot", when: (c) => c.ratio > 1.3,
      t: (c) => `${c.M(c.budget)}? The ideal is ${c.M(c.est)}. I have *not* sent a memo to the bank. But I have the phone in hand, and I do not have a dial tone I respect.` },
    { id: "bud-dot-funds", topic: "budget", exec: "dot", when: (c) => c.budget > c.fundable,
      t: (c) => `Let's say this once, clearly: you do not *have* that money. Funds and credit together, ${c.M(c.fundable)}. The button will trim you anyway. I'm only the one who tells you first.` },
    { id: "bud-mona-fx", topic: "budget", exec: "mona", when: (c) => c.ratio < 0.8 && ["Sci-Fi", "Animation", "Action"].includes(c.genre),
      t: (c) => `An underfunded ${cap(c.genre)} is a ${cap(c.genre)} you can *see* is underfunded. The audience looks through the floor. I've seen it from every window. If you must cut, don't cut where the camera is.` },
    { id: "bud-gerald-promise", topic: "budget", exec: "gerald", flavor: true,
      t: (c) => `Budgets are a promise you make to a room of people who *remember*. Make the whole promise — or make a smaller one on purpose. What you cannot do is make the promise, and then look surprised at the weather.` },

    // ---------- CASTING ----------
    { id: "cas-percy-star", topic: "casting", exec: "percy", when: (c) => c.lead && c.lead.draw >= 80,
      t: (c) => `A ${c.lead.name} picture. The agents will call before you do. Yes, the fee is what it is — the fee is the price of the room *filling*. Draw is the only number on that card that pays rent.` },
    { id: "cas-percy-value", topic: "casting", exec: "percy", when: (c) => c.lead && c.valueLoss >= 0.35,
      t: (c) => `Now — and I say this as a *friend* — there is someone in that lineup whose draw-per-dollar is doing arithmetic you are not. I won't name names. The fee column already knows their name.` },
    { id: "cas-percy-social", topic: "casting", exec: "percy", when: (c) => c.lead && c.lead.social >= 68,
      t: (c) => `High social. Do you know what that buys? It makes *every* ad buy in production pay for itself a little extra. The internet is already at the party. Your money just decides how loud.` },
    { id: "cas-percy-dirhi", topic: "casting", exec: "percy", when: (c) => c.dir && c.dir.score >= 84,
      t: (c) => `That director. That is the only way to get *that many* takes out of that script. The fee is not for the person. The fee is for the takes.` },
    { id: "cas-percy-dirlo", topic: "casting", exec: "percy", when: (c) => c.dir && c.dir.score < 48,
      t: (c) => `I know *exactly* which door you want them to close forty-seven times. That is not a door, that is a *budget*. The score column has a number for a reason.` },
    { id: "cas-dot-total", topic: "casting", exec: "dot", when: (c) => c.total > 0 && c.total > c.fundable * 0.8,
      t: (c) => `Casting fee: ${c.M(c.total)}. You can fund ${c.M(c.fundable)}. I admire the optimism. The spreadsheet does *not*. One of these two has to be smaller.` },
    { id: "cas-dot-mid", topic: "casting", exec: "dot", when: (c) => c.total > 0 && c.total <= c.fundable * 0.8,
      t: (c) => `Total fees ${c.M(c.total)}, with ${c.talentOff}% off for being a studio with a name. That is the market doing your budgeting. Keep it under half of what you *could* spend and nobody ever talks about the fee again.` },
    { id: "cas-gerald-cheapest", topic: "casting", exec: "gerald", flavor: true,
      t: (c) => `Casting is the only department where the cheapest and the best are sometimes the *same* person. Find that person. I've seen them. It is almost never the one in the first slot.` },

    // ---------- PRODUCTION ----------
    { id: "prod-viv-pr", topic: "production", exec: "vivienne", when: (c) => c.buzzNeg >= 10,
      t: (c) => `The red meter is at ${Math.round(c.buzzNeg)}. PR cleanup is unlocked — ${c.M(1.2)} buys you a spin, a statement, and a quiet weekend. In this town, that is a *bargain*. The opening weekend only remembers the difference.` },
    { id: "prod-viv-quiet", topic: "production", exec: "vivienne", when: (c) => c.net <= 5 && c.buzzPos < 25,
      t: (c) => `The internet has stopped talking about you. That is the real danger — not the noise, the *quiet*. Put something on the air. Even the billboards. Billboards are cheap confidence.` },
    { id: "prod-viv-loud", topic: "production", exec: "vivienne", when: (c) => c.buzzPos >= 70 && c.net > 15,
      t: (c) => `The chatter is already loud enough to open a picture. I would stop buying ads and let it *burn* — loud is fuel, and fuel costs money. Save some of it for the tagline.` },
    { id: "prod-viv-tag", topic: "production", exec: "vivienne", when: (c) => !c.taglineSet,
      t: (c) => `You have not picked a tagline. The tagline is the only ad the film buys *once* and runs forever. Don't default to the middle one. None of them is the middle one. Read them like the papers will.` },
    { id: "prod-babs-low", topic: "production", exec: "babs", when: (c) => c.quality < 52 && !c.screened && c.progress >= 45,
      t: (c) => `Projected quality is ${c.quality}. Here is the part nobody likes: that number can still be fixed, once, for ${c.M(1.5)} — but only *after* a test screen tells you where. Sixty percent of the film is the deadline. Don't let the critics be the diagnostician.` },
    { id: "prod-babs-reshoot", topic: "production", exec: "babs", when: (c) => c.screened && c.screenScore < 55,
      t: (c) => `The audience has voted ${c.screenScore}. Reshoots are open and the fix is ${c.M(1.5)}. After release, the price of that same fix is *reputation*. I know which bill is cheaper.` },
    { id: "prod-babs-gold", topic: "production", exec: "babs", flavor: true, when: (c) => c.screened && c.screenScore >= 70,
      t: (c) => `The audience is *in*. Here is the advice, and it is free: stop touching the film. That's it. You're welcome.` },
    { id: "prod-dot-burn", topic: "production", exec: "dot", when: (c) => c.funds < 3 && c.weekCost > 0.8,
      t: (c) => `Every week on the floor is ${c.M(c.weekCost)}. You have ${c.M(c.funds)} left in the building. I have a *feeling* about the next Tuesday. The bank has a letter. One of us is going to look prophetic.` },
    { id: "prod-mona-weather", topic: "production", exec: "mona",
      t: (c) => `Week ${c.week + 1} of ${c.totalWeeks}. The film isn't in theaters yet; the *weather* is. Watch the two meters — that difference is all the opening weekend will remember.` },
    { id: "prod-gerald-nothing", topic: "production", exec: "gerald", flavor: true,
      t: (c) => `I hear it was eventful on the lot this week. *Good*. Pictures that make nothing happen in production make nothing happen in theaters. Nothing is what sells.` },

    // ---------- BOX OFFICE ----------
    { id: "bo-mona-open", topic: "boxoffice", exec: "mona", when: (c) => c.week === 0,
      t: (c) => `The number hasn't appeared yet. It will, in a moment. After that — watch the *curve*, not the number. The number is a snapshot; the curve is the story.` },
    { id: "bo-mona-r1", topic: "boxoffice", exec: "mona", when: (c) => c.week >= 1 && c.week <= 2 && c.rank === 1,
      t: (c) => `Number one. I've read the number a hundred times and I still like it. Now watch week *two* — that is where genres with legs tell you the truth. And that is where your ${cap(c.genre)} makes its case.` },
    { id: "bo-mona-top3", topic: "boxoffice", exec: "mona", when: (c) => c.rank <= 3,
      t: (c) => `Top three — ${c.rank}, in fact. Hold the line: a picture like this either *expands*, or it dies of its own weight. You don't have to do anything. The advice is: don't.` },
    { id: "bo-mona-mid", topic: "boxoffice", exec: "mona", when: (c) => c.rank >= 4 && c.rank <= 6,
      t: (c) => `You're ${c.rank}. It is not a bad week; it is a week *with a curve*. If the decay is gentle, the total outgrows the number. I've watched films that looked dead in week three and were perfectly fine by week nine.` },
    { id: "bo-mona-far", topic: "boxoffice", exec: "mona", when: (c) => c.rank >= 7,
      t: (c) => `${c.rank}. I'm not going to dress it up. But a rank is a snapshot and the total is a *story* — watch the curve, not the number, and pull it when the shape says so.` },
    { id: "bo-mona-legs", topic: "boxoffice", exec: "mona", when: (c) => c.week >= 3 && ["Drama", "Documentary", "Animation", "Romance"].includes(c.genre),
      t: (c) => `A ${cap(c.genre)} is a *legs* picture. The curve looks small but it is long. Don't pull it early — every extra week is a week the audience is finding it on its own.` },
    { id: "bo-mona-decay", topic: "boxoffice", exec: "mona", when: (c) => c.week >= 3 && ["Action", "Comedy"].includes(c.genre),
      t: (c) => `${cap(c.genre)} dies on the second and third weekend; the good part is already banked. If week three is going to be ugly, pulling it *saves the marquee*. I respect a producer who knows the shape.` },
    { id: "bo-mona-critics", topic: "boxoffice", exec: "mona", when: (c) => c.critics > 0 && c.critics < 40 && c.week <= 3,
      t: (c) => `The critics came in cold (${c.critics}). Fine. The internet is louder than the critics and meaner than the audience. Give it *two weeks*; the meters decide, not the reviews.` },
    { id: "bo-gerald-number", topic: "boxoffice", exec: "gerald", flavor: true,
      t: (c) => `I'm watching the number, not the film. Don't mistake the two. The number is the only one that sends *invoices*.` },

    // ---------- RESULTS ----------
    { id: "res-dot-good", topic: "results", exec: "dot", when: (c) => c.profit > 0,
      t: (c) => `Profit: ${c.M(c.profit)}. Filed. The bank is *fond* of you now, which I advise you to read as "they will lend you more" — which is how people get in trouble. Stay profitable. Stay boring about it.` },
    { id: "res-dot-bad", topic: "results", exec: "dot", when: (c) => c.profit <= 0,
      t: (c) => `The red column. I'm a professional, so I won't say *I told you*. But the bank's trust moved, and the board's spreadsheet *noticed*. The next picture has to be funded like it matters. To them, it does.` },
    { id: "res-gerald-meeting", topic: "results", exec: "gerald", flavor: true,
      t: (c) => `That's a picture. Every picture — *especially* that one — is the next one's casting meeting. The fee column just moved. You're welcome in advance.` },
    { id: "res-mona-window", topic: "results", exec: "mona", when: (c) => c.margin > 1.2,
      t: (c) => `That margin. That is not a film, that is a *rate card*. Every studio in town will read that genre as the weather for your next one — and so should you. The trends page is open. It's cold coffee. Read it.` },
    { id: "res-mona-loss", topic: "results", exec: "mona", when: (c) => c.margin < -0.3,
      t: (c) => `It ran ${c.weeks} weeks. The window is closed; the *street* isn't. A small opening in a genre the town has turned against is a message. Next development round, pick a shelf with a pulse.` },
    { id: "res-babs-craft", topic: "results", exec: "babs", when: (c) => c.quality >= 75,
      t: (c) => `A ${c.quality}-quality picture. Wherever it landed financially, the *craft* was there — and craft is the one number that comes back to you in casting rooms. The fee column remembers.` },

    // ---------- HEADQUARTERS ----------
    { id: "hq-dot-board", topic: "hq", exec: "dot", when: (c) => c.boardApproval < 25,
      t: (c) => `I need to tell you something, and I only have to do this *once*. The board is at ${c.boardApproval}. Below zero they vote, and the reprieve — there is exactly one — goes where the history justifies it. The next picture must not be a small one.` },
    { id: "hq-dot-bank", topic: "hq", exec: "dot", when: (c) => c.bankTrust >= 78,
      t: (c) => `The bank's file on you is now a *compliment*. That is exactly how people take on debt they can't service. The credit line is ${c.M(c.limit)} — breathe, and don't let it buy you a habit.` },
    { id: "hq-dot-prestige", topic: "hq", exec: "dot", when: (c) => c.prestige >= 55,
      t: (c) => `The fee column just got cheaper — talent at ${c.talentOff}% off, the market doing your budgeting for you. My advice: spend the *difference* on the script. It is the only column where it comes back double.` },
    { id: "hq-babs-hungry", topic: "hq", exec: "babs",
      t: (c) => `The development office is already circling the next picture. The town is hungry for ${cap(c.hotGenre)} right now — I can *smell* it in the option deals — and it has had enough of ${cap(c.coldGenre)}. The next script page should know that before you do.` },
    { id: "hq-mona-trend", topic: "hq", exec: "mona", when: (c) => c.hotHeat - c.coldHeat > 0.15,
      t: (c) => `Same thing, colder: ${cap(c.hotGenre)} is the hottest shelf (${pct(c.hotHeat)}), ${cap(c.coldGenre)} the coldest (${pct(c.coldHeat)}). Your next opening weekend is made or broken in *development*, not release. I'm the one who has to book the screens.` },
    { id: "hq-gerald-next", topic: "hq", exec: "gerald", flavor: true,
      t: (c) => `I ran that picture. I'll run the next one. The only difference will be the number on the budget page — and I have *thoughts* about the number.` }
  ];

  function pickHint(topic, ctx, avoid = []) {
    const all = HINTS.filter((h) => h.topic === topic);
    if (!all.length) return null;
    const ok = (h) => (!h.when || h.when(ctx)) && !avoid.includes(h.id);
    let pool = all.filter(ok);
    if (!pool.length) pool = all.filter((h) => !avoid.includes(h.id));
    if (!pool.length) pool = all;
    // most of the time the office gives real advice; sometimes it just gossips
    if (Math.random() < 0.15) {
      const fl = pool.filter((h) => h.flavor);
      if (fl.length) pool = fl;
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
