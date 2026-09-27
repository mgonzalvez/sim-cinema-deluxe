/* ============================================================
   SIM CINEMA DELUXE — poster.js
   Procedural movie-poster art on canvas (no image assets).
   ============================================================ */
"use strict";

const Poster = (() => {
  const W = 300, H = 420;

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 0xff) + amt, b = (n & 0xff) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return `rgb(${r},${g},${b})`;
  }

  function drawMotif(ctx, genre, c) {
    ctx.save();
    const cx = W / 2, cy = H * 0.42;
    switch (genre) {
      case "Action": {
        // burst
        ctx.translate(cx, cy);
        for (let i = 0; i < 12; i++) {
          ctx.rotate(Math.PI / 6);
          ctx.fillStyle = c[1];
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.moveTo(0, -95); ctx.lineTo(14, 0); ctx.lineTo(-14, 0);
          ctx.closePath(); ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = c[2];
        ctx.beginPath(); ctx.arc(0, 0, 34, 0, 7); ctx.fill();
        ctx.fillStyle = c[0];
        ctx.font = '700 40px "Bebas Neue", sans-serif';
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("!", 0, 2);
        break;
      }
      case "Comedy": {
        ctx.strokeStyle = c[1]; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.arc(cx, cy, 78, 0.15, Math.PI - 0.15); ctx.stroke();
        ctx.fillStyle = c[2];
        ctx.beginPath(); ctx.arc(cx - 28, cy - 26, 9, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 28, cy - 26, 9, 0, 7); ctx.fill();
        ctx.fillStyle = c[1];
        ctx.font = '700 60px "Bebas Neue", sans-serif';
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("HA", cx, cy + 20);
        break;
      }
      case "Drama": {
        ctx.fillStyle = shade(c[1], 10);
        ctx.fillRect(cx - 40, cy - 70, 80, 110);
        ctx.fillStyle = c[0];
        ctx.fillRect(cx - 28, cy - 58, 56, 86);
        ctx.fillStyle = c[2];
        ctx.beginPath(); ctx.arc(cx, cy - 135, 22, 0, 7); ctx.fill();
        break;
      }
      case "Horror": {
        ctx.fillStyle = shade(c[1], -60);
        ctx.beginPath();
        ctx.moveTo(cx - 80, cy + 80); ctx.lineTo(cx - 80, cy - 30); ctx.lineTo(cx, cy - 95); ctx.lineTo(cx + 80, cy - 30); ctx.lineTo(cx + 80, cy + 80);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = c[1];
        ctx.fillRect(cx - 46, cy - 20, 24, 24);
        ctx.fillRect(cx + 22, cy - 20, 24, 24);
        ctx.fillRect(cx - 12, cy + 30, 26, 50);
        break;
      }
      case "Sci-Fi": {
        ctx.fillStyle = c[2];
        for (let i = 0; i < 40; i++) { ctx.globalAlpha = 0.3 + Math.random() * 0.7; ctx.beginPath(); ctx.arc(Math.random() * W, Math.random() * H * 0.75, Math.random() * 1.6, 0, 7); ctx.fill(); }
        ctx.globalAlpha = 1;
        ctx.fillStyle = c[1];
        ctx.beginPath(); ctx.arc(cx, cy, 58, 0, 7); ctx.fill();
        ctx.strokeStyle = c[2]; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.ellipse(cx, cy, 92, 26, -0.35, 0, 7); ctx.stroke();
        break;
      }
      case "Romance": {
        ctx.fillStyle = c[1];
        ctx.beginPath(); ctx.arc(cx - 26, cy, 52, 0, 7); ctx.fill();
        ctx.fillStyle = c[2];
        ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.arc(cx + 26, cy, 52, 0, 7); ctx.fill();
        ctx.globalAlpha = 1;
        break;
      }
      case "Animation": {
        ctx.fillStyle = c[1];
        ctx.beginPath(); ctx.arc(cx - 30, cy + 20, 34, 0, 7); ctx.fill();
        ctx.fillStyle = c[2];
        ctx.beginPath(); ctx.arc(cx + 34, cy - 16, 26, 0, 7); ctx.fill();
        ctx.strokeStyle = shade(c[2], 40); ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(cx, cy + 60, 90, -0.4, 0.9); ctx.stroke();
        break;
      }
      default: { // Documentary
        ctx.strokeStyle = c[1]; ctx.lineWidth = 4;
        for (let r = 0; r < 5; r++) for (let col = 0; col < 8; col++) {
          ctx.strokeRect(30 + col * 30, H * 0.16 + r * 34, 24, 26);
        }
        break;
      }
    }
    ctx.restore();
  }

  function build(genre, title, studioName) {
    const c = DATA.GENRES[genre].poster;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");

    // background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, shade(c[0], 18));
    grad.addColorStop(0.55, c[0]);
    grad.addColorStop(1, shade(c[0], -40));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // vignette beams
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W * 0.7, 0); ctx.lineTo(W * 0.2, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    ctx.restore();

    drawMotif(ctx, genre, c);

    // film-strip frame
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, W, 18);
    ctx.fillRect(0, H - 18, W, 18);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    for (let x = 8; x < W - 6; x += 22) { ctx.fillRect(x, 5, 12, 8); ctx.fillRect(x, H - 13, 12, 8); }

    // title
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = '13px "Space Grotesk", sans-serif';
    ctx.fillText("A " + (studioName || "New Studio") + " PICTURE", W / 2, H - 52);
    ctx.fillStyle = "#fff";
    ctx.font = '700 44px "Bebas Neue", sans-serif';
    const words = title.split(" ");
    let lines;
    if (words.length <= 2 || title.length <= 14) lines = [title];
    else if (words.length % 2 === 0) lines = [words.slice(0, words.length / 2).join(" "), words.slice(words.length / 2).join(" ")];
    else lines = [words.slice(0, Math.ceil(words.length / 2) - 1).join(" "), words.slice(Math.ceil(words.length / 2) - 1).join(" ")];
    ctx.textBaseline = "alphabetic";
    lines.forEach((ln, i) => ctx.fillText(ln.toUpperCase(), W / 2, H - 84 + i * 40));

    // grain
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = Math.random() < 0.5 ? "#fff" : "#000";
      ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;
    return canvas.toDataURL("image/png");
  }

  return { build, W, H };
})();
