# p5 MicroSim Render Stall — Diagnosis and Fix

Date: 2026-08-17

## Result

A reported ~950 ms freeze recurring every ~6.1 s in the 555-timer MicroSim turned out to
have **nothing to do with the sketch**. It was canvas backing-store size meeting a
saturated macOS compositor. Fix: `pixelDensity(1)` in `setup()` before `createCanvas()`,
now applied to all 64 p5 sims under `docs/sims/`.

The diagnosis took far longer than it should have. The section
[What wasted the most time](#what-wasted-the-most-time) is the part worth reading before
debugging anything similar.

## Symptom

- ~950 ms freeze, every ~6.05–6.10 s. The period was **rigid** (6.08, 6.08, 6.07, 6.07, 6.08).
- Reproduced in: Chrome **and** Firefox; incognito; inside the lesson-page iframe **and**
  fullscreen `main.html`; on `mkdocs serve` **and** on deployed GitHub Pages; and in the
  p5.js editor.
- Immune to every change made to the sketch.

## Root cause

p5 defaults `pixelDensity()` to `displayDensity()`, which is **2** on a Retina display. A
900×500 canvas therefore asks the compositor for **1,800×1,000 = 1.8M pixels every frame**.

On this machine macOS **WindowServer was measured at 113% of one core, sustained, with
nothing animating**. With no compositor headroom, a canvas that large drops roughly a
second of frames on a repeating cycle. Plain JavaScript is unaffected, which is why a bare
`requestAnimationFrame` loop stayed perfectly smooth while any painted canvas stalled.

Contributing factor: the built-in Retina panel is running a **scaled** mode (reports
3072×1920), so WindowServer renders to a larger internal buffer and downsamples every
frame, continuously. That is the suspected driver of the baseline load and is **still
unrepaired** — see [Still open](#still-open).

## The measurements that settled it

A control page presented several modes with an identical stall monitor, changing exactly
one variable at a time:

| Mode | What ran | Pixels/frame | Result |
|---|---|---|---|
| A | bare `requestAnimationFrame`, no p5, no canvas | 0 | clean |
| B | p5.js, trivial sketch, 900×500 | 1.80M | **stalls** |
| C | p5.min.js, trivial sketch, 900×500 | 1.80M | **stalls** |
| E | p5.js, trivial sketch, 900×500, `pixelDensity(1)` | 0.45M | clean |
| F | p5.js, trivial sketch, 200×100 | 0.08M | clean |

The "trivial sketch" was one `background()` plus one `ellipse()` — no project code at all.

Two conclusions fall straight out: **A clean + B stalling exonerates the sketch and p5**,
and **E/F clean isolates the variable to pixels composited per frame**.

## The fix

```js
function setup() {
    // Cap the backing store at one device pixel per CSS pixel. At the Retina
    // default a full-width canvas asks the compositor for 4x the pixels every
    // frame, which can stall the compositor on a loaded machine.
    pixelDensity(1);

    const canvas = createCanvas(canvasWidth, canvasHeight);
    ...
}
```

Applied to 64 sims (63 modified in a sweep + `555-timer` done individually). Verified:
all parse (`node --check`), and every cap sits inside `setup()` before `createCanvas()` as
live code.

**Cost:** softer rendering on Retina displays, most visible on small text (the NE555 pin
labels use `textSize(6)`/`textSize(7)`). This is a workaround for one loaded compositor,
imposed on every reader. If WindowServer is repaired, revert with
`git checkout -- docs/sims/`.

## What wasted the most time

Five dead ends. Each one is a reusable lesson.

1. **Garbage collection.** Cut `vertex()` calls from 31,431/s to 2,382/s by emitting
   vertices only at waveform transitions instead of once per sample. The stall period did
   not move *at all*. **A 13× allocation cut producing zero change is disproof — treat it
   as such immediately** instead of moving to the next suspect. Related tell: a *rigid*
   period is a threshold or timer signature. GC intervals drift with allocation rate.

2. **mkdocs livereload.** Plausible (a rebuild-triggered reload freezes ~1 s), but the
   long-poll is held open **60 s**, which cannot produce a 6 s period — and the deployed
   site, which has no livereload, stalled identically.

3. **A "CPU burst every 5.5 s" from `mkdocs serve`.** Pure artifact of sampling `ps` every
   0.5 s with a threshold. At 0.1 s resolution it is a steady ~6%-of-a-core hum with no
   bursts. **Do not infer periodicity from a sampling interval close to the claimed period.**

4. **Browser extensions.** Ruled out by incognito.

5. **Bisecting `draw()` under a synthetic-clock harness.** Driving `window.draw()` in a
   tight loop with a faked `millis()` produced its own multi-second stalls at a fixed
   ~570-iteration interval — present whether the sim was running or paused — because a
   tight loop of full-canvas repaints with no compositing saturates the raster queue. Any
   bisection under that harness merely measures *which part paints the most pixels*.
   It "proved" the analyzer was at fault. It was not.

**The cheap control that cracked it — a page with no p5 and no canvas — should have been
the first move, not the fifth.**

## Tooling notes for future agents

- **The in-app Browser pane cannot measure frame pacing.** It throttles rAF when not
  fronted (measured: 3 frames in 20 s), and its timers get progressively clamped
  (1s → 2s → 6s → 21s → 60s). Stall diagnosis must happen in the user's real browser via a
  control page. It also began refusing `127.0.0.1` by policy mid-session, and `file://`
  URLs render as static snapshots with scripts disabled.
- **p5 global-mode functions live on `window`**, so `millis`, `vertex`, `text`,
  `drawTimeGrid`, `draw`, etc. can all be overridden for instrumentation. Genuinely useful.
- **The synthetic-clock harness is fine for correctness, not for timing.** It reliably
  measured pulse widths off rendered pixels (721.6 ms vs 721 ms expected) and counted
  `vertex()` calls per frame. It is useless for anything involving wall-clock behavior.
- **Comment-masking before regex edits.** The sweep initially matched nothing; the naive
  fix would have been worse, because 38 `breadboard-lib.js` copies contain
  `function setup() {` and `createCanvas` inside JSDoc examples. Blanking comments while
  preserving offsets let those be skipped correctly. Any future bulk edit across
  `docs/sims/` needs the same guard.

## Other changes to `555-timer.js` in the same session

Unrelated to the stall, but the file changed substantially:

- **Slider overlap fix** (the original request): `drawSliderLabels()` was repositioning the
  capacitor slider as a side effect of `draw()`, and nothing moved it back, so a
  monostable→astable round trip left R2 and C stacked on the same row. Layout now derives
  from one shared row table.
- **Buttons moved inside the control area** — they were rendering 10 px below the canvas.
- **Simulation clock.** Timing accumulates through `simTime` with
  `constrain(delta, 0, MAX_FRAME_MS)` instead of restarting each half-cycle from wall
  clock. Previously any late frame permanently lengthened the pulse in flight. Verified:
  period 721.6 ms vs 721 ms expected, zero spread across 6 consecutive cycles.
- **Start/Pause button**, and the sim now **starts paused** (project rule: sims begin only
  on explicit user action).
- **Two perf changes** — the `vertex()` reduction above, and removing ~700 `p5.Color`
  allocations/s from a per-frame loop in `drawTimeGrid()`. Both are real improvements with
  pixel-identical output. **Neither fixed the reported stall.**

## Still open

- **WindowServer at 113% of one core is unrepaired.** A 1.8M-pixel canvas is an
  unremarkable load for a healthy compositor. Suspects: the scaled display resolution
  (biggest lever — return Displays to default), and a running Snagit capture helper. If
  either drops WindowServer materially, the entire density sweep can be reverted.
- **The sweep was verified for syntax and placement, not appearance.** No sim was visually
  checked after the change. Sims with small text will show softness first.
- **`docs/sims/template/template.js` has a pre-existing syntax error** — line 6 reads
  `function setup {`, missing parentheses. It does not parse, predates this session
  (broken at `HEAD`), and was skipped by the sweep. Since it seeds new sims, the typo
  propagates. Tracked as a separate task.
