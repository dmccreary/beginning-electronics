---
title: "Breadboard Anatomy Explorer"
description: "Click any region of a half-size solderless breadboard to see which tie points are secretly wired together underneath the plastic."
image: /sims/breadboard-anatomy-explorer/breadboard-anatomy-explorer.png
og:image: /sims/breadboard-anatomy-explorer/breadboard-anatomy-explorer.png
twitter:image: /sims/breadboard-anatomy-explorer/breadboard-anatomy-explorer.png
social:
   cards: false
quality_score: 0
---

# Breadboard Anatomy Explorer

<iframe src="main.html" height="562px" width="100%" scrolling="no"></iframe>

[Run the Breadboard Anatomy Explorer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

A breadboard keeps a secret: certain groups of holes are already wired together
underneath the plastic, and nothing on the surface tells you which ones. This
MicroSim hands you the x-ray vision.

Click any region of a half-size (400 tie point) board and every hole in that
group lights up at once, with an information panel naming the region, defining
it in one sentence, and counting its tie points. Flip on **Show internal
wiring** and the hidden metal clips appear as lines drawn straight through the
connected holes — including the gap at the gutter, where the connection
deliberately stops.

The board is the real thing, dimension for dimension: 30 numbered columns, rows
`a`–`j` split by the center channel, and four power rails whose holes come in
groups of five. Add it up and you get exactly 400 tie points.

| Region | What lights up | Tie points |
|---|---|---|
| Power rail | The whole rail, end to end | 25, all one connection |
| Five-hole row | One group of five, on one side of the gutter | 5, all one connection |
| Whole column | Both halves, in **two different colors** | 10, in 2 unconnected groups |
| Single tie point | One hole, plus the group it belongs to | 1 of 400 |
| Gutter | The center channel | None — nothing here connects |

!!! mascot-thinking "The Big Idea"
    ![Volt thinking about breadboard wiring](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Turn on the internal wiring and click the gutter, builders. Those little
    lines stopping dead at the center channel? That's the whole breadboard in
    one picture — two separate halves that only talk to each other when *you*
    add a jumper wire.

## How to Use

1. Pick what a click should select with the **Click selects** dropdown: a
   five-hole row, a whole column, or a single tie point. Power rails and the
   gutter are always selected by clicking directly on them.
2. Hover the board to preview a region in pale orange; click to lock it in.
   Clicking the same region again clears it.
3. Turn on **Show internal wiring** to reveal the hidden metal clips inside the
   currently selected group.
4. Press **Reset** to clear the highlight and start over.

Try the **Whole column** mode next to a five-hole row and watch what changes:
a column is highlighted in *two* colors because it is *two* separate
connections, while a five-hole row is one color because all five holes really
are one connection. That single contrast is the most common source of
first-week wiring mistakes.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="https://dmccreary.github.io/beginning-electronics/sims/breadboard-anatomy-explorer/main.html"
        height="562px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level, Subject and Topic

Middle school and high school. Electronics. Breadboard internal connections,
tie points, power rails, and grid numbering.

### Duration

10-15 minutes

### Prerequisites

Students should know that a circuit needs a complete path, and that two points
connected by metal are electrically the same point. No components, tools, or
math are required.

### Learning Objective

Students will be able to identify the power rails, terminal-strip rows,
columns, tie points, gutter, and numbering system of a half-size solderless
breadboard, and explain which holes are electrically connected to which.

### Activities

1. **Exploration (5 min)** — Students click each region type with the internal
   wiring turned off and read the definitions. Ask them to find the gutter
   without being told where it is.
2. **Guided Practice (5 min)** — Students turn the internal wiring on and
   compare a five-hole row against a whole column at the *same* column number.
   Ask: "Why does one of these need two colors?"
3. **Prediction Check (5 min)** — Before clicking, have students predict how
   many tie points a power rail has. Most guess 30, one per column. Reveal the
   answer (25) and have them find the gaps between rail groups on the board.

### Assessment

Students can:

- Point to a hole and state its grid address as "row *letter*, column *number*"
- State how many holes are connected together in one terminal-strip row (5)
- Explain why two component leads must not share a five-hole row unless you
  intend to short them together
- Explain why a chip must straddle the gutter rather than sit on one side
- Explain why the top and bottom power rails need a jumper wire to be connected

### Common Misconceptions This Addresses

- *"A whole column is one connection."* It is not — the gutter splits it into
  two groups of five. The two-color highlight in Whole column mode exists
  specifically to break this misconception.
- *"Every column has a power rail hole."* Rail holes come in groups of five
  with a gap between groups, which is why a rail has 25 holes, not 30.
- *"The top and bottom rails are connected."* They are separate until a jumper
  connects them.

## References

1. [Chapter 6: Meet Your Breadboard](../../chapters/06-meet-your-breadboard/index.md) — the chapter this MicroSim supports
2. [Breadboard](https://en.wikipedia.org/wiki/Breadboard) — Wikipedia's overview of solderless breadboard construction and history
3. [Push Button and LED Circuit](../button-led-breadboard/index.md) — the next step: real components in these same holes
4. [How to Use a Breadboard](https://learn.sparkfun.com/tutorials/how-to-use-a-breadboard) — SparkFun's illustrated guide to the same internal connections
