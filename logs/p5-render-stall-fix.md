# p5 MicroSim Render Stall — Diagnosis and Fix

Date: 2026-08-17

## Result

A reported ~950 ms freeze recurring every ~6.1 s in the 555-timer MicroSim turned out to
have **nothing to do with the sketch**. It was canvas backing-store size meeting a
saturated macOS compositor. Fix: cap `pixelDensity()` in `setup()` before `createCanvas()`,
applied to all 64 p5 sims under `docs/sims/`.

Density 1 removed the stall but was visibly blurry. **The landing point is
`pixelDensity(1.5)` — confirmed: no stalling, and significantly sharper than 1.**

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

One further data point, measured on the **real sims** rather than the control page:
`pixelDensity(1.5)` puts a 900×500 canvas at ~1.01M pixels/frame and runs clean, with text
significantly sharper than at density 1. So the stall threshold on this machine is
bracketed between **1.01M (clean)** and **1.80M (stalls)** pixels per frame.

Two conclusions fall straight out: **A clean + B stalling exonerates the sketch and p5**,
and **E/F clean isolates the variable to pixels composited per frame**.

## The fix

```js
function setup() {
    // Cap the backing store below the Retina default. At density 2 a full-width
    // canvas asks the compositor for 4x the pixels every frame, which stalls a
    // machine whose compositor has no headroom. 1.5 cuts that ~44% while staying
    // visibly sharper than a full cap to 1.
    pixelDensity(1.5);

    const canvas = createCanvas(canvasWidth, canvasHeight);
    ...
}
```

Applied to all 64 sims. Verified: all parse (`node --check`), and every cap sits inside
`setup()` before `createCanvas()` as live code.

**Why 1.5 and not 1.** The sweep first went in at `pixelDensity(1)`, which fixed the stall
but produced blurriness the author could see. 1.5 was chosen as a middle point from the
measured data — 0.45M pixels/frame runs clean, 1.80M stalls — putting a 900×500 canvas at
~1.01M, inside the then-untested gap. Both questions have since been answered on the
affected machine: **no stalling, and significantly better sharpness.** Do not "simplify"
this to `pixelDensity(1)`; that value was tried and rejected on visual grounds.

Minor artifact to be aware of at fractional density: p5 sets `canvas.width = width *
density`, so an odd canvas width yields a fractional backing store that the DOM truncates.
The effect is at most a half device pixel along the right/bottom edge — harmless, but it
is why integer densities are the safer default when there is no reason to deviate.

**Cost.** At `pixelDensity(1)` the author could see the blurriness directly: text was
noticeably less sharp than in a MicroSim rendering at full density, with small labels
worst (the NE555 pin labels use `textSize(6)`/`textSize(7)`) but the softening apparent
generally. At **1.5 the sharpness is significantly better and judged acceptable**, with no
stalling — which is why 1.5 is the value that shipped.

It remains a workaround for **one machine's** loaded compositor, applied to **every
reader** of the book, and 1.5 is still below native Retina density. If WindowServer is ever
repaired, the sweep can be dropped entirely: `git checkout -- docs/sims/`.

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
- **The cap is still a workaround, not a repair.** 1.5 is below native Retina density, and
  it is applied to every reader to accommodate one machine's saturated compositor. If
  WindowServer is fixed, dropping the sweep entirely (`git checkout -- docs/sims/`) is the
  better end state.
- **`docs/sims/template/template.js` has a pre-existing syntax error** — line 6 reads
  `function setup {`, missing parentheses. It does not parse, predates this session
  (broken at `HEAD`), and was skipped by the sweep. Since it seeds new sims, the typo
  propagates. Tracked as a separate task.
