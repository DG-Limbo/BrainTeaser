# Brainteaser

A daily 5-minute workout for your brain: one set of "Real or AI?" reps, one set of logic reps, each going light (1×) → medium (2×) → heavy (3×).

Live at: https://dg-limbo.github.io/BrainTeaser/

## Files
- `index.html` – page layout and styles
- `js/content_roa.js` – Real or AI library: human excerpts (`H`, with sources in `SRC`), AI singles, pairs, paragraphs
- `js/content_logic.js` – logic puzzle library, grouped into 10 families
- `js/generators.js` – puzzles generated fresh each day (rotation, memory, clock angles, directions, patterns, mental math)
- `js/engine.js` – daily workout picker, scoring, streaks, brain profile, screens

## Adding content
- Human excerpt: add an entry to `H` in `content_roa.js` (text copied exactly, published before Dec 2022, public domain or open licence, with its source).
- Logic puzzle: add `{fam, diff, q, opts, a, why}` to `LOGIC_TEXT`. `a` is the index of the correct option, `diff` is 1–3.
