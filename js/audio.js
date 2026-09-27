/* ============================================================
   SIM CINEMA DELUXE — audio.js
   Tiny WebAudio synth: no audio files, just oscillators.
   ============================================================ */
"use strict";

const SFX = (() => {
  let actx = null;
  let enabled = true;

  function ctx() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === "suspended") actx.resume();
    return actx;
  }

  function tone(freq, dur, { type = "square", vol = 0.08, delay = 0, slide = 0 } = {}) {
    if (!enabled) return;
    const ac = ctx();
    if (!ac) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noise(dur, { vol = 0.06, delay = 0, hp = 0 } = {}) {
    if (!enabled) return;
    const ac = ctx();
    if (!ac) return;
    const t0 = ac.currentTime + delay;
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let node = src;
    if (hp) {
      const f = ac.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = hp;
      src.connect(f);
      node = f;
    }
    node.connect(gain).connect(ac.destination);
    src.start(t0);
  }

  const play = {
    click: () => tone(660, 0.06, { type: "triangle", vol: 0.05 }),
    select: () => { tone(520, 0.07, { type: "triangle", vol: 0.06 }); tone(780, 0.09, { type: "triangle", vol: 0.06, delay: 0.06 }); },
    cash: () => { tone(880, 0.08, { type: "square", vol: 0.05 }); tone(1320, 0.12, { type: "square", vol: 0.05, delay: 0.07 }); },
    camera: () => { noise(0.08, { vol: 0.1, hp: 1200 }); noise(0.06, { vol: 0.08, hp: 1600, delay: 0.11 }); },
    applause: () => { for (let i = 0; i < 14; i++) noise(0.12, { vol: 0.02, hp: 900, delay: i * 0.05 + Math.random() * 0.02 }); },
    pop: () => tone(300, 0.09, { type: "sine", vol: 0.07, slide: 220 }),
    bad: () => { tone(220, 0.18, { type: "sawtooth", vol: 0.05 }); tone(180, 0.25, { type: "sawtooth", vol: 0.05, delay: 0.14 }); },
    marquee: () => { tone(392, 0.1, { type: "triangle", vol: 0.06 }); tone(523, 0.1, { type: "triangle", vol: 0.06, delay: 0.1 }); tone(659, 0.18, { type: "triangle", vol: 0.07, delay: 0.2 }); },
    fanfare: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, { type: "triangle", vol: 0.07, delay: i * 0.13 })); },
    shutter: () => { noise(0.05, { vol: 0.12, hp: 2000 }); tone(1200, 0.04, { type: "square", vol: 0.03, delay: 0.02 }); },
    tick: () => tone(980, 0.03, { type: "square", vol: 0.02 })
  };

  return {
    play,
    toggle() { enabled = !enabled; return enabled; },
    get enabled() { return enabled; },
    unlock() { ctx(); }
  };
})();
