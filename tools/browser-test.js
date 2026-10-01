/* Headless browser verification for Sim Cinema Deluxe.
   Drives the real UI in headless Chrome via CDP (no deps, Node >= 22).
   Run: node tools/browser-test.js
   Exits 0 when the full flow passes with no page errors. */
"use strict";
const { spawn } = require("child_process");
const http = require("http");
const os = require("os");
const path = require("path");
const fs = require("fs");

const ROOT = path.join(__dirname, "..");
const PORT = 9300 + Math.floor(Math.random() * 500); // random: avoid stale headless instances
const PAGE_URL = "file://" + path.join(ROOT, "index.html");

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  process.env.CHROME_PATH
].filter(Boolean);

// ---------- CDP helpers ----------
function httpJson(p) {
  return new Promise((resolve, reject) => {
    http.get({ host: "127.0.0.1", port: PORT, path: p }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
    }).on("error", reject);
  });
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitTarget(urlSub) {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await httpJson("/json/list");
      const t = list.find((x) => x.type === "page" && x.url.includes(urlSub));
      if (t) return t;
    } catch (e) { /* not up yet */ }
    await sleep(200);
  }
  throw new Error("no page target");
}

function connectCdp(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    const events = [];
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
      } else if (msg.method) events.push(msg);
    };
    ws.onerror = (e) => reject(new Error("ws error"));
    ws.onopen = () => resolve({
      send(method, params = {}) {
        return new Promise((res, rej) => {
          const mid = ++id;
          pending.set(mid, { res, rej });
          ws.send(JSON.stringify({ id: mid, method, params }));
        });
      },
      close: () => ws.close(),
      drain: () => { const e = events.splice(0); return e; }
    });
  });
}

// ---------- the in-page driver (runs in the browser) ----------
// __PHASE__ is substituted by the harness: "" = full run, or "production"/"boxoffice" = stop after that screen renders (for screenshots)
const DRIVER = `
(async () => {
  const PHASE = __PHASE__;
  const stopAt = (name) => {
    if (PHASE === name) return JSON.stringify({ pass: true, log, funds: GAME.studio ? GAME.studio.funds : null, films: GAME.studio ? GAME.studio.films : 0, rep: GAME.studio ? GAME.studio.reputation : 0, phase: name });
  };  const log = [];
  const ok = (n) => log.push("ok " + n);
  const fail = (m) => { throw new Error(m); };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const visible = (id) => !document.getElementById(id).hidden;
  window.confirm = () => true;
  try {
    if (!visible("screen-title")) fail("title screen not visible");
    ok("title");
    if (stopAt("title")) return stopAt("title");

    $("#btn-new").click();
    if (!visible("screen-studio")) fail("studio screen");
    const inp = $("#input-studio-name");
    inp.value = "Testhouse Films";
    $("#btn-studio-go").click();
    if (GAME.state !== "script") fail("state=" + GAME.state);
    await sleep(500); // let document.fonts.ready resolve + posters draw
    ok("new studio + script");

    const cards = $$("#script-grid .script-card");
    if (cards.length !== 3) fail("script cards=" + cards.length);
    if (!$(".sc-poster") || !($(".sc-poster").src || "").startsWith("data:")) fail("no poster art");
    if (stopAt("script")) return stopAt("script");
    cards[0].click();
    const r = $("#rewrite-slider"); r.value = "2"; r.dispatchEvent(new Event("input"));
    if ($("#btn-script-go").disabled) fail("sign deal disabled");
    $("#btn-script-go").click();
    if (GAME.state !== "budget") fail("state=" + GAME.state);
    ok("script select + sign");

    const b = $("#budget-slider"); b.value = "8"; b.dispatchEvent(new Event("input"));
    if (!$("#budget-stats").innerHTML.includes("Ideal")) fail("budget stats");
    $("#btn-budget-go").click();
    if (GAME.state !== "casting") fail("state=" + GAME.state);
    ok("budget");

    for (const slot of ["lead", "co", "sup", "dir"]) {
      const c = $('.talent-card[data-slot="' + slot + '"]');
      if (!c) fail("no talent card for " + slot);
      c.click();
    }
    if ($("#btn-cast-go").disabled) fail("cast go still disabled");
    if (stopAt("casting")) return stopAt("casting");
    $("#btn-cast-go").click();
    if (GAME.state !== "production") fail("state=" + GAME.state);
    await sleep(500);
    ok("casting");

    if ($$("#ad-list .ad-item").length !== 7) fail("ad list");
    if ($$("#phase-list .phase-row").length !== 4) fail("phase list");
    if (!$("#prod-poster").src) fail("no production poster");
    if (!$("#messages").children.length) fail("no messages");
    ok("production renders");
    if (stopAt("production")) return stopAt("production");

    const adBtn = $('#ad-list button[data-ad="tv"]');
    const funds0 = GAME.studio.funds;
    if (adBtn.disabled) fail("tv ad locked");
    adBtn.click();
    if (GAME.studio.funds >= funds0) fail("ad did not spend");
    ok("buy ad");

    $("#btn-tagline").click();
    if ($("#modal").hidden) fail("tagline modal");
    $(".tagline-opt").click();
    if (GAME.film.tagline == null) fail("tagline not set");
    ok("tagline modal");

    // autoplay speed wiring: 2x should advance weeks by itself
    const weekBefore = GAME.film.week;
    $(".speed-btn[data-speed='300']").click();
    await sleep(1500);
    $(".speed-btn[data-speed='300']").click(); // toggle off (or re-arm; loop below converges either way)
    if (!(GAME.film.week > weekBefore || GAME.pendingEvent || GAME.state !== "production")) fail("autoplay 2x did not advance");
    ok("autoplay 2x");

    let guard = 0;
    while (GAME.state === "production" && guard++ < 40) {
      if (GAME.pendingEvent) {
        const btns = $$("#modal-body .event-choice:not([disabled])");
        if (!btns.length) fail("event modal has no affordable choice");
        btns[0].click();
      } else if (GAME.canScreen()) {
        $("#btn-screen").click();
        const rb = $("#btn-reshoot");
        if (rb && !rb.disabled) rb.click();
        else $("#modal-x").click();
      } else if (GAME.canRelease()) {
        $("#btn-release").click();
        if (!$("#modal").hidden === false) fail("reviews modal did not open");
        if ($$("#modal-body .review-card").length !== 4) fail("review cards: " + $$("#modal-body .review-card").length);
        if (stopAt("reviews")) return stopAt("reviews");
        $("#btn-theaters").click();
        break;
      } else {
        $("#btn-pass-week").click();
      }
      await sleep(20);
    }
    if (GAME.state !== "boxoffice") fail("not boxoffice: " + GAME.state);
    ok("production loop (" + guard + " steps)");

    $("#btn-bo-next").click(); // first box office week
    await sleep(30);
    if ($$("#bo-rows tr").length !== 10) fail("bo rows=" + $$("#bo-rows tr").length);
    if (!$("#bo-chart").innerHTML.includes("polyline")) fail("no chart");
    if (stopAt("boxoffice")) return stopAt("boxoffice");
    // release-speed autoplay wiring
    const boWeekBefore = GAME.boxoffice.week;
    $(".bo-speed-ctl .speed-btn[data-speed='bo-300']").click();
    await sleep(1200);
    $(".bo-speed-ctl .speed-btn[data-speed='bo-300']").click();
    if (!(GAME.boxoffice.week > boWeekBefore || GAME.boxoffice.done)) fail("bo autoplay 2x did not advance");
    ok("bo autoplay 2x");
    let g2 = 0;
    while (GAME.state === "boxoffice" && g2++ < 20) {
      if (GAME.boDone) { await sleep(2600); break; }
      $("#btn-bo-next").click();
      await sleep(30);
    }
    await sleep(2600);
    if (GAME.state !== "results") fail("not results: " + GAME.state);
    const pnl = $("#pnl-table").innerHTML;
    if (!pnl.includes("PROFIT") && !pnl.includes("LOSS")) fail("no pnl total");
    ok("box office + results (" + g2 + " weeks)");
    if (!$("#res-notes").innerHTML.includes("CAREER")) fail("no career note");
    if (stopAt("results")) return stopAt("results");

    $("#btn-help").click();
    if ($("#modal").hidden) fail("help modal");
    $("#modal-x").click();
    if (!$("#modal").hidden) fail("help modal did not close");
    ok("help modal");

    // branch: studio in debt -> bankruptcy path
    let branch = null;
    if (GAME.studio.funds < 0) {
      $("#btn-next-film").click();
      if (GAME.state !== "gameover") fail("expected gameover: " + GAME.state);
      if (!$("#go-stats").children.length) fail("no go stats");
      if (!$("#go-films tr")) fail("no career recap");
      if (stopAt("gameover")) return stopAt("gameover");
      $("#btn-restart").click();
      if (GAME.state !== "title") fail("restart: " + GAME.state);
      ok("bankruptcy -> gameover -> restart");
      branch = "bankrupt-after-film-1";
    } else {
      // branch: healthy studio -> career loop + film 2
      $("#btn-next-film").click();
      if (GAME.state !== "script") fail("next film: " + GAME.state);
      if ($$("#script-grid .script-card").length !== 3) fail("reroll scripts");
      ok("career loop -> next film");

      $$(".script-card")[1].click();
      $("#btn-script-go").click();
      const bb = $("#budget-slider"); bb.value = "40"; bb.dispatchEvent(new Event("input"));
      $("#btn-budget-go").click();
      for (const slot of ["lead", "co", "sup", "dir"]) $('.talent-card[data-slot="' + slot + '"]').click();
      if ($("#btn-cast-go").disabled) {
        // total fee over fundable: re-pick the cheapest candidate per slot through the UI
        const o = GAME.S.castOptions;
        for (const slot of ["lead", "co", "sup", "dir"]) {
          const cheapest = o[slot].reduce((a, c, i) => c.cost < o[slot][a].cost ? i : a, 0);
          $('.talent-card[data-slot="' + slot + '"][data-i="' + cheapest + '"]').click();
        }
      }
      if ($("#btn-cast-go").disabled) fail("cast gate stuck");
      $("#btn-cast-go").click();

      if (GAME.state === "production") {
        $("#btn-terminate").click();
        if ($("#modal").hidden) fail("terminate modal");
        $("#term-yes").click();
        if (GAME.state !== "script" && GAME.state !== "gameover") fail("terminate: " + GAME.state);
        if (GAME.state === "gameover") {
          if (!$("#go-stats").children.length) fail("no go stats");
          if (!$("#go-films tr")) fail("no career recap");
          if (stopAt("gameover")) return stopAt("gameover");
          $("#btn-restart").click();
          if (GAME.state !== "title") fail("restart: " + GAME.state);
          ok("terminate -> bankruptcy -> restart");
          branch = "terminated-into-debt";
        } else {
          ok("terminate flow");
        }
      } else if (GAME.state === "gameover") {
        if (!$("#go-stats").children.length) fail("no go stats");
        if (!$("#go-films tr")) fail("no career recap");
        if (stopAt("gameover")) return stopAt("gameover");
        $("#btn-restart").click();
        if (GAME.state !== "title") fail("restart: " + GAME.state);
        ok("gameover + restart (bank ran dry on film 2)");
        branch = "gameover-on-film-2";
      } else {
        fail("unexpected state: " + GAME.state);
      }
    }

    // end in a deterministic saved state for the continue test
    if (GAME.state === "title") {
      $("#btn-new").click();
      $("#input-studio-name").value = "Testhouse Films";
      $("#btn-studio-go").click();
      if (GAME.state !== "script") fail("post-restart: " + GAME.state);
    }
    ok("saved state for continue");

    return JSON.stringify({ pass: true, log, branch, funds: GAME.studio ? GAME.studio.funds : null, films: GAME.studio ? GAME.studio.films : 0, rep: GAME.studio ? GAME.studio.reputation : 0 });
  } catch (e) {
    const st = (typeof GAME !== "undefined" && GAME.state) || "?";
    return JSON.stringify({ pass: false, error: e.message, log, state: st });
  }
})();
`;

// ---------- phase 2 driver: continue from save after reload ----------
const DRIVER_CONTINUE = `
(async () => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  try {
    await sleep(600);
    const leg = GAME.legacy();
    if (!leg || leg.films < 1) throw new Error("legacy missing after career: " + JSON.stringify(leg));
    if (document.getElementById("ho-line").hidden || !document.getElementById("ho-line").textContent.trim()) throw new Error("ho-line not shown on title");
    if (document.getElementById("btn-continue").hidden) throw new Error("continue hidden");
    document.getElementById("btn-continue").click();
    await sleep(300);
    if (GAME.state !== "script") throw new Error("state after continue: " + GAME.state);
    if ($$("#script-grid .script-card").length !== 3) throw new Error("script cards after continue");
    if (document.getElementById("topbar").hidden) throw new Error("topbar hidden");
    return JSON.stringify({ pass: true, state: GAME.state });
  } catch (e) {
    return JSON.stringify({ pass: false, error: e.message, state: GAME.state });
  }
})();
`;

// ---------- main ----------
(async () => {
  const chrome = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
  if (!chrome) { console.error("no chrome binary found"); process.exit(2); }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "simsd-"));
  const child = spawn(chrome, [
    "--headless=new", `--remote-debugging-port=${PORT}`,
    "--user-data-dir=" + tmpDir, "--no-first-run", "--no-default-browser-check",
    "--disable-gpu", "--window-size=1280,900", PAGE_URL
  ], { stdio: "ignore" });

  let exitCode = 1;
  try {
    const target = await waitTarget("index.html");
    const cdp = await connectCdp(target.webSocketDebuggerUrl);
    await cdp.send("Runtime.enable");
    await cdp.send("Page.enable");
    await sleep(1200); // let the app boot + fonts load

    const pageErrors = [];
    const flush = () => {
      for (const ev of cdp.drain()) {
        if (ev.method === "Runtime.exceptionThrown")
          pageErrors.push((ev.params.exceptionDetails.exception || {}).description || "exception");
        if (ev.method === "Runtime.consoleAPICalled" && ev.params.type === "error")
          pageErrors.push(ev.params.args.map((a) => a.value || a.description).join(" "));
      }
    };
    flush();

    const res = await cdp.send("Runtime.evaluate", { expression: DRIVER.replace("__PHASE__", JSON.stringify(process.env.PHASE || "")), awaitPromise: true, returnByValue: true });
    if (res.exceptionDetails) throw new Error("driver threw: " + JSON.stringify(res.exceptionDetails.exception && res.exceptionDetails.exception.description));
    flush();
    const result = JSON.parse(res.result.value);

    console.log(result.log.join("\n"));
    if (!result.pass) console.error("\ndriver error: " + (result.error || "unknown") + " (state: " + (result.state || "?") + ")");
    if (result.pass) console.log(`\nresult: funds=$${result.funds}M films=${result.films} rep=${result.rep}`);

    let contPass = false;
    if (process.env.PHASE) {
      // screenshot mode: capture the current screen and exit
      const shot = await cdp.send("Page.captureScreenshot", { format: "png" });
      const out = process.env.SHOT_OUT || "/tmp/simsd-" + process.env.PHASE + ".png";
      fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
      console.log("screenshot: " + out);
    } else if (result.pass) {
      await cdp.send("Page.reload", { ignoreCache: true });
      let booted = false;
      for (let i = 0; i < 60; i++) {
        await sleep(300);
        try {
          const r = await cdp.send("Runtime.evaluate", { expression: "document.readyState + '|' + (typeof GAME !== 'undefined' ? 'G' : 'n')", returnByValue: true });
          if (i < 3) console.log("  reload poll: " + r.result.value);
          if (r.result.value && r.result.value.startsWith("complete|G")) { booted = true; break; }
        } catch (e) { if (i % 5 === 0) console.log("  reload poll err: " + e.message); }
      }
      if (!booted) throw new Error("reload did not come back up");
      flush();
      const res2 = await cdp.send("Runtime.evaluate", { expression: DRIVER_CONTINUE, awaitPromise: true, returnByValue: true });
      if (res2.exceptionDetails) throw new Error("continue driver threw");
      flush();
      const cont = JSON.parse(res2.result.value);
      if (!cont.pass) throw new Error("continue: " + (cont.error || "unknown") + " (state: " + cont.state + ")");
      contPass = true;
      console.log("ok continue after reload (resumed at " + cont.state + ")");
    }

    if (pageErrors.length) {
      console.error("\nPAGE ERRORS:");
      for (const e of pageErrors) console.error("  - " + e);
    }
    exitCode = result.pass && (process.env.PHASE ? true : contPass) && !pageErrors.length ? 0 : 1;
    console.log(exitCode === 0 ? "\nBROWSER TEST: PASS" : "\nBROWSER TEST: FAIL");
    cdp.close();
  } catch (e) {
    console.error("harness error:", e.message);
  } finally {
    child.kill();
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) { /* chrome still flushing files; OS reaps tmp */ }
    process.exit(exitCode);
  }
})();
