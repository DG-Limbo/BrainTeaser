/* ================= PUZZLE GENERATORS =================
   Each returns a rep for difficulty d (1–3) using the seeded random r(). */
const pickOne = (arr, r) => arr[Math.floor(r() * arr.length)];
const randInt = (lo, hi, r) => lo + Math.floor(r() * (hi - lo + 1));

/* ---- Rotation: polyomino "same shape, only rotated" ---- */
const normCells = cells => {
  const mx = Math.min(...cells.map(c => c[0])), my = Math.min(...cells.map(c => c[1]));
  return cells.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
};
const keyOf = cells => JSON.stringify(normCells(cells));
const rotCW = cells => cells.map(([x, y]) => [-y, x]);      // 90° clockwise on screen (y points down)
const mirror = cells => cells.map(([x, y]) => [-x, y]);
function rotations(cells){ const out = [normCells(cells)]; let c = cells; for(let i=0;i<3;i++){ c = rotCW(c); out.push(normCells(c)); } return out; }
function connected(cells){
  const set = new Set(cells.map(c => c + "")); const seen = new Set([cells[0] + ""]); const stack = [cells[0]];
  while(stack.length){ const [x, y] = stack.pop(); for(const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const k = [x+dx, y+dy] + ""; if(set.has(k) && !seen.has(k)){ seen.add(k); stack.push([x+dx, y+dy]); } } }
  return seen.size === cells.length;
}
function grow(n, r){
  const cells = [[0,0]], set = new Set(["0,0"]);
  while(cells.length < n){
    const [x, y] = pickOne(cells, r), [dx, dy] = pickOne([[1,0],[-1,0],[0,1],[0,-1]], r);
    const k = [x+dx, y+dy] + "";
    if(!set.has(k)){ set.add(k); cells.push([x+dx, y+dy]); }
  }
  return cells;
}
function polySvg(cells, unit){
  unit = unit || 20;
  const c = normCells(cells), w = Math.max(...c.map(p => p[0])) + 1, h = Math.max(...c.map(p => p[1])) + 1;
  const rects = c.map(([x, y]) => `<rect x="${x*unit+2}" y="${y*unit+2}" width="${unit}" height="${unit}" rx="2"/>`).join("");
  return `<svg viewBox="0 0 ${w*unit+4} ${h*unit+4}" width="${w*unit+4}" height="${h*unit+4}" aria-hidden="true"><g fill="var(--accent)" stroke="var(--surface)" stroke-width="2">${rects}</g></svg>`;
}
function genRotate(d, r){
  const n = [4, 5, 6][d - 1];
  for(let t = 0; t < 400; t++){
    const base = grow(n, r);
    const rots = rotations(base), rk = rots.map(x => JSON.stringify(x));
    const mrots = rotations(mirror(base)), mk = mrots.map(x => JSON.stringify(x));
    if(rk.some(k => mk.includes(k))) continue;               // must look different from its mirror image
    const turns = [1, 2, 3].filter(k => rk[k] !== rk[0]);
    if(!turns.length) continue;
    const turn = pickOne(turns, r);
    const mUnique = [...new Set(mk)];
    if(mUnique.length < 2) continue;
    const mirrors = mUnique.sort(() => r() - .5).slice(0, 2).map(k => JSON.parse(k));
    // "near miss": move one square
    let near = null;
    for(let u = 0; u < 60 && !near; u++){
      const cells = normCells(base).map(c => c.slice());
      cells.splice(Math.floor(r() * cells.length), 1);
      if(!connected(cells)) continue;
      const [x, y] = pickOne(cells, r), [dx, dy] = pickOne([[1,0],[-1,0],[0,1],[0,-1]], r);
      if(cells.some(c => c[0] === x+dx && c[1] === y+dy)) continue;
      cells.push([x+dx, y+dy]);
      const all = [...rotations(cells), ...rotations(mirror(cells))].map(x => JSON.stringify(x));
      if(all.some(k => rk.includes(k) || mk.includes(k))) continue;
      near = cells;
    }
    if(!near) continue;
    const opts = [{c: rots[turn], ok: true}, {c: mirrors[0]}, {c: mirrors[1]}, {c: near}].sort(() => r() - .5);
    const a = opts.findIndex(o => o.ok);
    return {kind:"pick", q:"Which one is the same shape, only rotated?\nNo flipping allowed.", ref: polySvg(base, 22),
      opts: opts.map(o => polySvg(o.c, 18)), a,
      why:`Option ${"ABCD"[a]} is the shape turned ${turn * 90}° clockwise. Two of the others are its mirror image, and one has a square moved.`};
  }
  return genRotate(Math.max(1, d - 1), r);
}

/* ---- Memory: flash grid ---- */
function genMemGrid(d, r){
  const size = [4, 4, 5][d - 1], count = [4, 5, 6][d - 1], ms = [3000, 2500, 2500][d - 1];
  const all = [...Array(size * size).keys()].sort(() => r() - .5);
  return {kind:"memgrid", size, cells: all.slice(0, count).sort((a, b) => a - b), ms,
    q:`Memorise the ${count} lit squares. You get ${ms / 1000} seconds.`};
}

/* ---- Memory: flash number ---- */
function genDigits(d, r){
  const len = [5, 6, 7][d - 1];
  let s = ""; while(s.length < len){ const c = String(randInt(0, 9, r)); if(c !== s[s.length - 1]) s += c; }
  const variants = new Set([s]);
  const swap = i => s.slice(0, i) + s[i+1] + s[i] + s.slice(i+2);
  let guard = 0;
  while(variants.size < 4 && guard++ < 50){
    const mode = randInt(0, 1, r), i = randInt(1, len - 2, r);
    const v = mode === 0 ? swap(i) : s.slice(0, i) + String((+s[i] + randInt(1, 8, r)) % 10) + s.slice(i + 1);
    variants.add(v);
  }
  const opts = [...variants].sort(() => r() - .5);
  return {kind:"flash", show: s.replace(/(\d{3})(?=\d)/g, "$1 "), ms: 3000,
    q:`Memorise this ${len}-digit number. You get 3 seconds.`, ask:"Which number did you see?",
    opts: opts.map(o => o.replace(/(\d{3})(?=\d)/g, "$1 ")), a: opts.indexOf(s),
    why:"The wrong options swap two neighbouring digits or change one. Chunking the number into groups of three makes it easier to hold."};
}

/* ---- Clocks: estimate the angle ---- */
function genClock(d, r){
  const H = randInt(1, 11, r);
  let M = d === 1 ? 0 : d === 2 ? pickOne([15, 30, 45], r) : randInt(1, 59, r);
  if(d === 3 && M % 5 === 0) M += 2;
  let ang = Math.abs(30 * H - 5.5 * M); if(ang > 180) ang = 360 - ang;
  const tol = d === 3 ? 12 : 10;
  return {kind:"slider", q:`Estimate the smaller angle between the clock hands at ${H}:${String(M).padStart(2, "0")}.\nNo clock to look at. Picture it.`,
    min:0, max:180, step:1, ans: ang, tol, unit:"°",
    why:`The minute hand moves 6° per minute (${M * 6}° from 12). The hour hand moves 0.5° per minute (${(30 * H + 0.5 * M) % 360}° from 12). The gap is ${ang}°. Within ${tol}° counts as a clean rep.`};
}

/* ---- Directions: chain of turns ---- */
function genTurns(d, r){
  const names8 = ["north","north-east","east","south-east","south","south-west","west","north-west"];
  const startIdx = pickOne([0, 2, 4, 6], r);
  const pool = d === 3 ? [45, -45, 90, -90, 135, -135, 180] : d === 2 ? [90, -90, 180, 270, -270] : [90, -90, 180];
  const n = d === 1 ? 3 : 4;
  let heading = startIdx * 45, trace = [names8[startIdx]];
  const steps = [];
  for(let i = 0; i < n; i++){
    const t = pickOne(pool, r);
    steps.push(t === 180 ? "turn around" : `turn ${Math.abs(t)}° ${t > 0 ? "right" : "left"}`);
    heading = ((heading + t) % 360 + 360) % 360;
    trace.push(names8[heading / 45]);
  }
  const ans = names8[heading / 45];
  let opts = d === 3 ? [ans, ...names8.filter(x => x !== ans).sort(() => r() - .5).slice(0, 3)] : ["north","east","south","west"];
  opts = opts.sort(() => r() - .5);
  const cap = s => s[0].toUpperCase() + s.slice(1);
  return {kind:"mc", q:`You face ${trace[0]}. You ${steps.join(", then ")}.\nWhich way are you facing now?`,
    opts: opts.map(cap), a: opts.indexOf(ans), why:`Step by step: ${trace.map(cap).join(" → ")}.`};
}

/* ---- Patterns: number sequences ---- */
function numOpts(ans, r, spread){
  const set = new Set([ans]); let g = 0;
  while(set.size < 4 && g++ < 50){ const v = ans + pickOne([-2, -1, 1, 2, 3], r) * spread; if(v > 0) set.add(v); }
  return [...set].sort(() => r() - .5);
}
function genSeq(d, r){
  let terms, ans, why, spread;
  if(d === 1){
    const a = randInt(2, 20, r), k = randInt(3, 9, r);
    terms = [0,1,2,3,4].map(i => a + k * i); ans = a + 5 * k; spread = Math.max(1, Math.round(k / 2)); why = `It adds ${k} every time.`;
  } else if(d === 2){
    if(r() < 0.5){
      const a = randInt(2, 9, r), d0 = randInt(1, 4, r), s = randInt(1, 3, r);
      terms = [a]; let gap = d0; for(let i = 0; i < 4; i++){ terms.push(terms[i] + gap); gap += s; }
      ans = terms[4] + gap; spread = s; why = `The gaps grow by ${s} each time (+${d0}, +${d0 + s}, +${d0 + 2*s}…), so the next gap is +${gap}.`;
    } else {
      const a = randInt(1, 5, r), c = randInt(1, 3, r);
      terms = [a]; for(let i = 0; i < 4; i++) terms.push(terms[i] * 2 + c);
      ans = terms[4] * 2 + c; spread = c + 1; why = `Each term is double the last plus ${c}.`;
    }
  } else {
    const a = randInt(1, 9, r), p = randInt(2, 5, r), b = randInt(30, 60, r), q = randInt(3, 7, r);
    terms = []; for(let i = 0; i < 3; i++){ terms.push(a + p * i, b - q * i); }
    ans = a + p * 3; spread = p; why = `Two sequences are woven together: ${a}, ${a+p}, ${a+2*p}… going up by ${p}, and ${b}, ${b-q}, ${b-2*q}… going down by ${q}. Next is the rising one.`;
  }
  const opts = numOpts(ans, r, spread);
  return {kind:"mc", q:`What comes next? ${terms.join(", ")}, …`, opts: opts.map(String), a: opts.indexOf(ans), why};
}

/* ---- Mental math ---- */
function genMath(d, r){
  if(d === 1){
    const p = pickOne([10, 20, 25, 50, 75], r), N = randInt(2, 20, r) * 20, ans = p * N / 100;
    const opts = numOpts(ans, r, Math.max(1, ans / 10 | 0));
    return {kind:"mc", q:`What is ${p}% of ${N}?`, opts: opts.map(String), a: opts.indexOf(ans),
      why: p === 25 ? `25% is a quarter: ${N} ÷ 4 = ${ans}.` : p === 75 ? `Find a quarter (${N/4}), then triple it: ${ans}.` : `${p}% means ${p/10} tenths of ${N}: ${ans}.`};
  }
  if(d === 2){
    const sh = randInt(19, 23, r), sm = pickOne([0, 15, 20, 35, 40, 50], r), dh = randInt(1, 6, r), dm = pickOne([25, 35, 40, 45, 50, 55], r);
    const tot = (sh * 60 + sm + dh * 60 + dm) % 1440;
    const fmt = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    const set = new Set([tot, (tot + 60) % 1440, (tot + 1430) % 1440, (tot + 1380) % 1440]);
    const opts = [...set].sort(() => r() - .5);
    return {kind:"mc", q:`A night bus leaves at ${fmt(sh * 60 + sm)} and the trip takes ${dh} h ${dm} min.\nWhat time does it arrive?`,
      opts: opts.map(fmt), a: opts.indexOf(tot), why:`Add the hours first, then the minutes, and carry past 60 and past midnight: ${fmt(tot)}.`};
  }
  const start = randInt(12, 48, r) * 2, add = randInt(7, 19, r), mul = 3, sub = randInt(10, 30, r);
  const ans = (start / 2 + add) * mul - sub;
  const opts = numOpts(ans, r, 3);
  return {kind:"mc", q:`Start with ${start}. Halve it, add ${add}, multiply by ${mul}, then subtract ${sub}.\nWhat do you get?`,
    opts: opts.map(String), a: opts.indexOf(ans), why:`${start} → ${start/2} → ${start/2 + add} → ${(start/2 + add) * mul} → ${ans}.`};
}

const GENERATORS = {
  "Rotation":[genRotate], "Clocks & mirrors":[genClock], "Directions":[genTurns],
  "Patterns":[genSeq], "Mental math":[genMath], "Memory":[genMemGrid, genDigits]
};
