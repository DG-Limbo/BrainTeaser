const AI_NOTE = "Written by an AI for this game. Any facts or numbers in it are made up.";
/* ================= ENGINE ================= */
const KG = {1:1, 2:2, 3:3};  // rep multipliers
const LEVEL = {1:"Light", 2:"Medium", 3:"Heavy"};
const LAUNCH = new Date(2026, 10, 5); // 5 Nov 2026 = workout #1
function todayIndex(){
  const now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((mid - LAUNCH) / 86400000) + 1;
}
function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(arr, r){ const a = arr.slice(); for(let i=a.length-1;i>0;i--){ const j = Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");

/* ---------- Build Set 1: Real or AI, light → medium → heavy ---------- */
function humanRep(k){ const h = H[k], s = SRC[h.s]; return {fmt:h.fmt, text:h.text, why:h.why, src:s.name, url:s.url}; }
function buildSet1(day){
  const r = rng(day * 7919 + 211), reps = [], usedH = new Set(), usedAI = new Set(), usedFmt = new Set();
  for(const d of [1, 2, 3]){
    const singles = SINGLES.filter(x => x.diff === d && !(x.h && usedH.has(x.h)) && !usedAI.has(x.text));
    const pairs = PAIRS.filter(x => x.diff === d && !usedH.has(x.h) && !usedAI.has(x.ai));
    const paras = PARAS.filter(x => x.diff === d && !x.parts.some(p => p.h && usedH.has(p.h)));
    // singles are the core format; pairs and paragraphs appear at most once a day
    const weighted = [["single", singles, 3], ["pair", pairs, 2], ["para", paras, 1]]
      .filter(f => f[1].length && !(f[0] !== "single" && usedFmt.has(f[0])))
      .flatMap(f => Array(f[2]).fill(f));
    const [fmt, pool] = weighted[Math.floor(r() * weighted.length)];
    usedFmt.add(fmt);
    if(fmt === "single"){
      const who = r() < 0.5 ? "human" : "ai";
      const side = pool.filter(x => x.who === who);
      const it = (side.length ? side : pool)[Math.floor(r() * (side.length ? side : pool).length)];
      if(it.who === "human"){ usedH.add(it.h); reps.push({set:1, kind:"single", diff:d, who:"human", ...humanRep(it.h)}); }
      else { usedAI.add(it.text); reps.push({set:1, kind:"single", diff:d, who:"ai", fmt:it.fmt, text:it.text, why:it.why}); }
    } else if(fmt === "pair"){
      const it = pool[Math.floor(r() * pool.length)]; usedH.add(it.h); usedAI.add(it.ai);
      const h = humanRep(it.h), humanFirst = r() < 0.5;
      reps.push({set:1, kind:"pair", diff:d, fmt:h.fmt, texts: humanFirst ? [h.text, it.ai] : [it.ai, h.text], a: humanFirst ? 0 : 1, why:it.why, src:h.src, url:h.url});
    } else {
      const it = pool[Math.floor(r() * pool.length)];
      it.parts.forEach(p => p.h && usedH.add(p.h));
      const s = SRC[it.s];
      reps.push({set:1, kind:"para", diff:d, fmt:"Find the AI sentence", sents: it.parts.map(p => p.h ? H[p.h].text : p.ai), a: it.parts.findIndex(p => p.ai), why:it.why, src: it.srcName || s.name, url: s.url});
    }
  }
  return reps;
}

/* ---------- Build Set 2: Logic, 3 different families, light → medium → heavy ---------- */
function buildSet2(day){
  const r = rng(day * 104729 + 7);
  const fams = shuffle(Object.keys(FAMILIES), r).slice(0, 3);
  return fams.map((fam, i) => {
    const d = i + 1, rr = rng(day * 1009 + i * 97 + 3);
    let pool = LOGIC_TEXT.filter(x => x.fam === fam && x.diff === d);
    if(!pool.length) pool = LOGIC_TEXT.filter(x => x.fam === fam && Math.abs(x.diff - d) === 1);
    const gens = GENERATORS[fam] || [];
    let rep;
    if(gens.length && (!pool.length || rr() < 0.5)) rep = gens[Math.floor(rr() * gens.length)](d, rr);
    else { const it = pool[Math.floor(rr() * pool.length)]; rep = {kind:"mc", q:it.q, opts:it.opts, a:it.a, why:it.why, svg:it.svg}; }
    return {set:2, fam, muscle: FAMILIES[fam], diff:d, ...rep};
  });
}

const DAY = todayIndex();
const REPS = [...buildSet1(DAY), ...buildSet2(DAY)];

/* ---------- Storage (per-viewer, optional) ---------- */
const store = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};
const KEY = "bt4-day-" + DAY;
let state = store.get(KEY, null) || {phase:"start", idx:0, answers:[], times:[], extra:[]};
const MUSCLES = ["AI radar", "Spatial", "Logic", "Numbers", "Memory"];
const stats = Object.assign({streak:0, last:0, best:0, played:0, perfect:0, freezes:1, kg:0, bestTime:0, m:{}}, store.get("bt4-stats", {}));
MUSCLES.forEach(m => stats.m[m] = stats.m[m] || {c:0, n:0});
function liveStreak(){
  if(!stats.last || stats.last >= DAY - 1) return stats.streak;
  return (DAY - stats.last - 1) <= stats.freezes ? stats.streak : 0;
}
function save(){ store.set(KEY, state); }

const $ = s => document.querySelector(s);
const screen = $("#screen");
const kgOf = (from, to) => REPS.slice(from, to).reduce((t, rep, i) => t + (state.answers[from + i] ? KG[rep.diff] : 0), 0);
const hits = (from, to) => state.answers.slice(from, to).filter(Boolean).length;
const mmss = ms => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

function header(){
  const d = new Date();
  $("#dayChip").textContent = "Workout #" + DAY + " · " + d.toLocaleDateString(undefined, {weekday:"short", day:"numeric", month:"short"});
  $("#streakChip").textContent = "Streak " + liveStreak() + (stats.freezes ? " · ❄" + stats.freezes : "");
  $("#streakChip").title = stats.freezes ? `${stats.freezes} streak freeze${stats.freezes > 1 ? "s" : ""}: covers a missed day` : "";
}

/* ---------- Barbell ---------- */
function plate(i){
  const a = state.answers[i], rep = REPS[i];
  let cls = "plate d" + rep.diff;
  if(a === true) cls += " ok"; else if(a === false) cls += " no"; else if(state.phase === "rep" && i === state.idx) cls += " cur";
  return `<span class="${cls}" aria-label="${LEVEL[rep.diff]} rep, worth ${KG[rep.diff]} points${a === true ? ", lifted" : a === false ? ", missed" : ""}">${KG[rep.diff]}×</span>`;
}
function drawBar(){
  $("#bar").innerHTML = '<span class="collar"></span>' + plate(2) + plate(1) + plate(0) +
    '<span class="grip"></span>' + plate(3) + plate(4) + plate(5) + '<span class="collar"></span>';
}

/* ---------- Timer (time under tension) ---------- */
let repStart = 0, tickT = 0;
function startTimer(){
  repStart = performance.now();
  clearInterval(tickT);
  tickT = setInterval(() => { const el = $("#tut"); if(el) el.textContent = mmss(performance.now() - repStart); }, 500);
}
function stopTimer(){ clearInterval(tickT); return performance.now() - repStart; }

/* ---------- Screens ---------- */
function startScreen(){
  screen.innerHTML = `
    <span class="eyebrow">Today's workout</span>
    <h1>Two sets.<br>Six reps.</h1>
    <p class="muted">Each set goes light, medium, heavy. Get a light rep right for 1×, medium for 2×, heavy for 3×. Max score 12. About 5 minutes.</p>
    <ul class="plan">
      <li><span><b>Set 1 · Real or AI?</b><br><span class="muted">Spot machine-written research and news.</span></span><span class="muted">3 reps</span></li>
      <li><span><b>Set 2 · Logic</b><br><span class="muted">A different mix of puzzles every day.</span></span><span class="muted">3 reps</span></li>
    </ul>
    <button class="primary" id="go">Start set 1</button>`;
  $("#go").onclick = () => { state.phase = "rep"; state.idx = 0; save(); drawBar(); repScreen(); };
}

function breakScreen(){
  screen.innerHTML = `
    <span class="eyebrow">Set 1 done · ${kgOf(0,3)} / 6</span>
    <h2>Rest. Then logic.</h2>
    <p class="muted">No pen, no calculator. Three different kinds of puzzle, worked out in your head.</p>
    <button class="primary" id="go">Start set 2</button>`;
  $("#go").onclick = () => { state.phase = "rep"; state.idx = 3; save(); drawBar(); repScreen(); };
}

function repHead(rep){
  const n = rep.set === 1 ? state.idx + 1 : state.idx - 2;
  const label = rep.set === 1 ? rep.fmt : rep.fam;
  return `<div class="rephead"><span class="eyebrow">Set ${rep.set} · Rep ${n} · ${LEVEL[rep.diff]} ${KG[rep.diff]}× · ${esc(label)}</span><span class="tut" id="tut" aria-label="Time on this rep">0:00</span></div>`;
}

function repScreen(){
  const rep = REPS[state.idx];
  startTimer();
  const render = {single, pair, para, mc, pick, memgrid, flash, slider}[rep.kind];
  render(rep);
}

function single(rep){
  screen.innerHTML = `${repHead(rep)}
    <p class="q">Did a human write this, or an AI?</p>
    <blockquote class="quote">${esc(rep.text)}</blockquote>
    <div class="choices"><button class="btn big" data-v="human">Human</button><button class="btn big" data-v="ai">AI</button></div>
    <div id="fb"></div>`;
  wire(btn => btn.dataset.v === rep.who, `.btn[data-v="${rep.who}"]`, () =>
    [(rep.who === "human" ? "Human. " : "AI. ") + rep.why, rep.who === "human" ? srcLine(rep) : AI_NOTE]);
}

function pair(rep){
  screen.innerHTML = `${repHead(rep)}
    <p class="q">One was written by a human, one by AI. Which is human?</p>
    <div class="choices list">${rep.texts.map((t, j) => `<button class="btn txt" data-j="${j}"><span class="lbl">${"AB"[j]}</span><span class="quote-in">${esc(t)}</span></button>`).join("")}</div>
    <div id="fb"></div>`;
  wire(btn => +btn.dataset.j === rep.a, `.btn[data-j="${rep.a}"]`, () =>
    [`${"AB"[rep.a]} is human. ${rep.why}`, srcLine(rep) + ` ${AI_NOTE.replace("Written", "The other was written")}`]);
}

function para(rep){
  screen.innerHTML = `${repHead(rep)}
    <p class="q">One sentence in this paragraph was written by AI. Tap it.</p>
    <div class="choices list para">${rep.sents.map((t, j) => `<button class="btn sent" data-j="${j}">${esc(t)}</button>`).join("")}</div>
    <div id="fb"></div>`;
  wire(btn => +btn.dataset.j === rep.a, `.btn[data-j="${rep.a}"]`, () =>
    [`Sentence ${rep.a + 1} is AI. ${rep.why}`, `The other sentences: ${srcLine(rep)}. We stitched them around the AI line.`]);
}

function mc(rep){
  screen.innerHTML = `${repHead(rep)}
    <p class="q">${esc(rep.q)}</p>
    ${rep.svg ? `<div class="fig">${rep.svg}</div>` : ""}
    <div class="choices list">${rep.opts.map((o, j) => `<button class="btn" data-j="${j}">${esc(o)}</button>`).join("")}</div>
    <div id="fb"></div>`;
  wire(btn => +btn.dataset.j === rep.a, `.btn[data-j="${rep.a}"]`, () => [rep.why, null]);
}

function pick(rep){
  screen.innerHTML = `${repHead(rep)}
    <p class="q">${esc(rep.q)}</p>
    <div class="fig ref">${rep.ref}</div>
    <div class="choices shapes">${rep.opts.map((o, j) => `<button class="btn shape" data-j="${j}" aria-label="Option ${"ABCD"[j]}"><span class="lbl">${"ABCD"[j]}</span>${o}</button>`).join("")}</div>
    <div id="fb"></div>`;
  wire(btn => +btn.dataset.j === rep.a, `.btn[data-j="${rep.a}"]`, () => [rep.why, null]);
}

function flash(rep){
  screen.innerHTML = `${repHead(rep)}
    <p class="q">${esc(rep.q)}</p>
    <div class="flashbox" id="fl"><button class="primary" id="show">Show number</button></div>
    <div id="after"></div><div id="fb"></div>`;
  $("#show").onclick = () => {
    $("#fl").innerHTML = `<div class="digits">${rep.show}</div><div class="drain" style="animation-duration:${rep.ms}ms"></div>`;
    setTimeout(() => {
      $("#fl").innerHTML = `<div class="digits hidden" aria-hidden="true">••• •••</div>`;
      $("#after").innerHTML = `<p class="q">${esc(rep.ask)}</p><div class="choices list">${rep.opts.map((o, j) => `<button class="btn mono" data-j="${j}">${o}</button>`).join("")}</div>`;
      wire(btn => +btn.dataset.j === rep.a, `.btn[data-j="${rep.a}"]`, () => [`It was ${rep.show}. ${rep.why}`, null]);
    }, rep.ms);
  };
}

function memgrid(rep){
  const cells = [...Array(rep.size * rep.size).keys()];
  screen.innerHTML = `${repHead(rep)}
    <p class="q">${esc(rep.q)}</p>
    <div class="mgrid" id="mg" style="--n:${rep.size}">${cells.map(i => `<button class="cell" data-i="${i}" disabled aria-label="Square ${i + 1}"></button>`).join("")}</div>
    <div id="ctl"><button class="primary" id="show">Show grid</button></div>
    <div id="fb"></div>`;
  $("#show").onclick = () => {
    rep.cells.forEach(i => screen.querySelector(`.cell[data-i="${i}"]`).classList.add("lit"));
    $("#ctl").innerHTML = `<div class="drain" style="animation-duration:${rep.ms}ms"></div>`;
    setTimeout(() => {
      screen.querySelectorAll(".cell").forEach(c => { c.classList.remove("lit"); c.disabled = false; });
      let picked = new Set();
      const upd = () => $("#ctl").innerHTML = `<p class="muted">Tap the squares that were lit. ${picked.size} / ${rep.cells.length}</p>`;
      upd();
      screen.querySelectorAll(".cell").forEach(c => c.onclick = () => {
        const i = +c.dataset.i;
        if(picked.has(i)){ picked.delete(i); c.classList.remove("sel"); } else { picked.add(i); c.classList.add("sel"); }
        upd();
        if(picked.size === rep.cells.length){
          const right = rep.cells.every(i => picked.has(i));
          screen.querySelectorAll(".cell").forEach(x => {
            x.disabled = true; const i = +x.dataset.i;
            if(rep.cells.includes(i)) x.classList.add(picked.has(i) ? "good" : "miss");
            else if(picked.has(i)) x.classList.add("bad");
          });
          const got = rep.cells.filter(i => picked.has(i)).length;
          $("#ctl").innerHTML = "";
          feedback(right, right ? "Every square in the right place." : `You found ${got} of ${rep.cells.length}. Outlined squares are the ones you missed.`, null,
            "Tip: group the squares into shapes (a line, an L, a corner) instead of remembering them one by one.");
        }
      });
    }, rep.ms);
  };
}

function slider(rep){
  const mid = Math.round((rep.min + rep.max) / 2);
  screen.innerHTML = `${repHead(rep)}
    <p class="q">${esc(rep.q)}</p>
    <div class="est"><output id="ev" for="sl">${mid}${rep.unit}</output>
      <input type="range" id="sl" min="${rep.min}" max="${rep.max}" step="${rep.step}" value="${mid}" aria-label="Your estimate">
      <div class="scale"><span>${rep.min}${rep.unit}</span><span>${rep.max}${rep.unit}</span></div></div>
    <button class="primary" id="lock">Lock it in</button>
    <div id="fb"></div>`;
  const sl = $("#sl");
  sl.oninput = () => $("#ev").textContent = sl.value + rep.unit;
  $("#lock").onclick = () => {
    sl.disabled = true; $("#lock").remove();
    const off = Math.abs(+sl.value - rep.ans), right = off <= rep.tol;
    state.extra[state.idx] = off;
    feedback(right, `Exact answer: ${rep.ans}${rep.unit}. You were off by ${Math.round(off * 10) / 10}${rep.unit}. ${rep.why}`, null);
  };
}

function srcLine(rep){ return `${esc(rep.src)}${rep.url ? ` · <a href="${rep.url}" target="_blank" rel="noopener">Read the source</a>` : ""}`; }

function wire(isRight, correctSel, explain){
  const btns = screen.querySelectorAll(".choices .btn");
  btns.forEach(b => b.onclick = () => {
    const right = isRight(b), correct = screen.querySelector(correctSel);
    btns.forEach(x => { x.disabled = true; if(x !== b && x !== correct) x.classList.add("dim"); });
    correct.classList.add("ok"); if(!right) b.classList.add("no");
    const [why, src] = explain();
    feedback(right, why, src);
  });
}

function feedback(right, why, src, tip){
  state.times[state.idx] = stopTimer();
  state.answers[state.idx] = right; save(); drawBar();
  const rep = REPS[state.idx], endSet1 = state.idx === 2, last = state.idx === 5;
  const cheers = right ? (rep.diff === 3 ? "Heavy lift. Clean." : rep.diff === 2 ? "Solid rep." : "Clean rep.") : "Missed rep.";
  $("#fb").outerHTML = `
    <div class="verdict ${right ? 'ok' : 'no'}">
      <strong>${cheers} <span class="kg">${right ? "+" + KG[rep.diff] : "+0"}</span></strong>
      <p>${why}</p>
      ${tip ? `<p class="src">${tip}</p>` : ""}
      ${src ? `<p class="src">${src}</p>` : ""}
      <p class="src">Time on rep ${mmss(state.times[state.idx])}</p>
    </div>
    <button class="primary" id="next">${last ? "Finish workout" : endSet1 ? "Finish set 1" : "Next rep"}</button>`;
  const nb = $("#next"); nb.focus({preventScroll:true});
  nb.scrollIntoView({block:"nearest", behavior:"smooth"});
  nb.onclick = () => {
    if(last) finish();
    else if(endSet1){ state.phase = "break"; save(); drawBar(); breakScreen(); }
    else { state.idx++; save(); drawBar(); repScreen(); }
  };
}

/* ---------- Finish: streak, freezes, records, brain profile ---------- */
let newRecords = [];
function finish(){
  if(state.phase !== "done"){
    state.phase = "done"; save();
    if(stats.last !== DAY){
      const gap = stats.last ? DAY - stats.last - 1 : 0;
      if(!stats.last || gap === 0) stats.streak = stats.last ? stats.streak + 1 : 1;
      else if(gap <= stats.freezes){ stats.freezes -= gap; stats.streak += 1; newRecords.push(`Used ${gap} streak freeze${gap > 1 ? "s" : ""}`); }
      else stats.streak = 1;
      if(stats.streak % 7 === 0 && stats.freezes < 2){ stats.freezes++; newRecords.push("Earned a streak freeze ❄"); }
      stats.last = DAY; stats.played++;
      const total = kgOf(0, 6), time = state.times.reduce((a, b) => a + (b || 0), 0);
      if(total === 12){ stats.perfect++; }
      stats.kg += total;
      if(stats.streak > stats.best){ stats.best = stats.streak; if(stats.played > 1) newRecords.push("Longest streak"); }
      if(hits(0, 6) >= 5 && (!stats.bestTime || time < stats.bestTime)){ if(stats.bestTime) newRecords.push("Fastest strong workout"); stats.bestTime = time; }
      REPS.forEach((rep, i) => { const m = rep.set === 1 ? "AI radar" : rep.muscle; stats.m[m].n++; if(state.answers[i]) stats.m[m].c++; });
      store.set("bt4-stats", stats);
    }
  }
  header(); drawBar(); resultScreen();
}

function shareText(){
  const g = (a, b) => state.answers.slice(a, b).map(x => x ? "🟩" : "🟥").join("");
  const time = state.times.reduce((a, b) => a + (b || 0), 0);
  return `Brainteaser #${DAY} 🏋️ ${kgOf(0,6)}/12 · ${mmss(time)}\nReal or AI ${g(0,3)}\nLogic      ${g(3,6)}`;
}

function profileHtml(){
  return MUSCLES.map(m => {
    const {c, n} = stats.m[m], pct = n ? Math.round(c / n * 100) : 0, lv = 1 + Math.floor(c / 5);
    return `<div class="muscle"><div class="mtop"><b>${m}</b><span class="muted">${n ? `Lv ${lv} · ${pct}%` : "Not trained yet"}</span></div>
      <div class="mbar"><span style="width:${pct}%"></span></div></div>`;
  }).join("");
}

function resultScreen(){
  const total = kgOf(0, 6), time = state.times.reduce((a, b) => a + (b || 0), 0);
  const line = total === 12 ? "Max lift. Every rep clean." : total >= 8 ? "Strong session. Come back tomorrow." : total >= 4 ? "Good work. The heavy reps get lighter with practice." : "Tough day. That's how the reps get easier.";
  screen.innerHTML = `
    <span class="eyebrow">Workout complete</span>
    <div class="score"><span class="n">${total}</span><span class="d">/ 12 points</span></div>
    <p class="muted">${line}</p>
    ${newRecords.length ? `<div class="pr">${newRecords.map(x => `<span>🏆 ${x}</span>`).join("")}</div>` : ""}
    <div class="split">
      <div class="stat"><span class="v">${kgOf(0,3)}<small> / 6</small></span><span class="l">Real or AI</span></div>
      <div class="stat"><span class="v">${kgOf(3,6)}<small> / 6</small></span><span class="l">Logic</span></div>
    </div>
    <div class="stats">
      <div class="stat"><span class="v">${stats.streak}</span><span class="l">Streak${stats.freezes ? " · ❄" + stats.freezes : ""}</span></div>
      <div class="stat"><span class="v">${mmss(time)}</span><span class="l">Time${stats.bestTime ? " · PR " + mmss(stats.bestTime) : ""}</span></div>
      <div class="stat"><span class="v">${stats.kg}</span><span class="l">Total points</span></div>
    </div>
    <pre class="share" id="shareBox">${shareText()}</pre>
    <div class="row">
      <button class="primary" id="copy">Copy result</button>
      <button class="btn big" id="review">Review reps</button>
    </div>
    <div class="profile">
      <span class="eyebrow">Brain profile</span>
      ${profileHtml()}
      <p class="src">Accuracy across all your workouts. Level up every 5 clean reps in a muscle.</p>
    </div>
    <p class="muted" id="countdown"></p>
    <div class="locked">
      <span class="eyebrow">Brainteaser Pro · coming soon</span>
      <div class="lock"><span><b>Archive</b> · replay every past workout</span><span class="tag">Pro</span></div>
      <div class="lock"><span><b>Extra sets</b> · train your weakest muscle</span><span class="tag">Pro</span></div>
      <div class="lock"><span><b>Theme packs</b> · Spatial gym, Spot the scam</span><span class="tag">Pro</span></div>
    </div>`;
  $("#copy").onclick = async (e) => {
    try{ await navigator.clipboard.writeText(shareText()); e.target.textContent = "Copied"; }
    catch(err){ const r = document.createRange(); r.selectNodeContents($("#shareBox")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); e.target.textContent = "Selected. Copy it"; }
  };
  $("#review").onclick = reviewScreen;
  countdown();
}

function reviewScreen(){
  const items = REPS.map((rep, i) => {
    const ok = state.answers[i] ? "✓" : "✗";
    let ans;
    if(rep.kind === "single") ans = rep.who === "human" ? "Human" : "AI";
    else if(rep.kind === "pair") ans = `${"AB"[rep.a]} was human`;
    else if(rep.kind === "para") ans = `Sentence ${rep.a + 1} was AI`;
    else if(rep.kind === "memgrid") ans = "Memory grid";
    else if(rep.kind === "slider") ans = `${rep.ans}${rep.unit}`;
    else if(rep.kind === "pick") ans = `Option ${"ABCD"[rep.a]}`;
    else ans = rep.opts[rep.a];
    return `<li><span><b>${ok} ${esc(ans)}</b><br><span class="muted">${rep.set === 1 ? esc(rep.fmt) : esc(rep.fam)} · ${LEVEL[rep.diff]}</span></span><span class="muted">+${state.answers[i] ? KG[rep.diff] : 0}</span></li>`;
  }).join("");
  screen.innerHTML = `<span class="eyebrow">Today's reps</span><h2>Answers</h2><ul class="plan">${items}</ul><button class="primary" id="back">Back to results</button>`;
  $("#back").onclick = resultScreen;
}

let cdT;
function countdown(){
  clearTimeout(cdT);
  const el = $("#countdown"); if(!el) return;
  const now = new Date(), next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1), ms = next - now;
  el.textContent = `Next workout in ${Math.floor(ms / 3600000)}h ${Math.floor(ms % 3600000 / 60000)}m.`;
  cdT = setTimeout(countdown, 30000);
}

/* ---------- Boot ---------- */
header(); drawBar();
if(state.phase === "done") resultScreen();
else if(state.phase === "break") breakScreen();
else if(state.phase === "rep") repScreen();
else startScreen();
