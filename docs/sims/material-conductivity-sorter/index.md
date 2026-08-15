---
title: Material Conductivity Sorter
description: Classify everyday materials — copper wire, aluminum foil, rubber, glass, plastic, wood, a silicon chip, pencil graphite, salt water, and a steel paperclip — as a conductor, insulator, or semiconductor material, by dragging each material card into the correct one of three labeled bins and receiving immediate right/wrong feedback.
status: scaffold
library: p5.js
bloom_level: Understand (L2). Bloom Verb: classify.
---

# Material Conductivity Sorter



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 4: "Series, Parallel, and Circuit Topology"](../../chapters/04-series-parallel-topology/index.md).

```text
Type: microsim
**sim-id:** material-conductivity-sorter<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Help students classify common, everyday materials as conductors, insulators, or semiconductor materials, reinforcing the comparison table with hands-on sorting practice.

Bloom Taxonomy: Understand (L2). Bloom Verb: classify.

Learning objective: Classify everyday materials — copper wire, aluminum foil, rubber, glass, plastic, wood, a silicon chip, pencil graphite, salt water, and a steel paperclip — as a conductor, insulator, or semiconductor material, by dragging each material card into the correct one of three labeled bins and receiving immediate right/wrong feedback.

Canvas layout:
- Top strip: a horizontal row of draggable material cards, each showing an icon and a name
- Bottom: three labeled drop bins side by side — "Conductor," "Insulator," "Semiconductor Material" — each with a distinct background color
- Small score readout in the corner: "Correct: _ / 10"

Visual elements:
- Ten material cards: copper wire, aluminum foil, rubber, glass, plastic, wood, silicon chip, pencil graphite, salt water, and steel paperclip
- Each bin glows green briefly when a correct card is dropped in, and glows red with a gentle shake animation when an incorrect card is dropped in, then the card returns to the top row to try again
- A small info icon on each card that, when hovered, shows a one-line reason for its correct classification

Interactive controls:
- Drag-and-drop: move each material card into one of the three bins
- Hover any card for a tooltip explaining why it belongs where it does (shown even before sorting, as an optional hint)
- Button: "Reset" returns all cards to the top row and clears the score
- Button: "Reveal All" (after at least one attempt) shows every card correctly sorted, for review

Default parameters:
- All ten cards start in the top row, unsorted; score starts at 0/10

Data Visibility Requirements:
  Stage 1 (default): Show all ten unsorted cards and three empty bins
  Stage 2 (card dropped): Show immediate color feedback (green/red) plus the card's one-line explanation, and update the running score
  Stage 3 (Reveal All): Show the fully sorted board with every material in its correct bin, so learners can review any they missed

Instructional Rationale: This is an Understand-level classification objective, so the design uses a drag-and-drop sorter with immediate corrective feedback rather than a passive diagram. Sorting concrete, familiar objects (a paperclip, a pencil, a glass) builds the category boundaries faster than reading definitions alone, and the always-visible hint tooltip keeps the activity encouraging rather than purely a test.

Color scheme: Green bin highlight for conductor-friendly feedback, cool gray for insulator, warm orange for semiconductor material (echoing this book's accent color for anything related to switching or control), on a light neutral background.

Responsive behavior: The three bins stack vertically on narrow screens with the card row scrolling horizontally above them; drag-and-drop gestures work with touch as well as mouse.

Implementation: p5.js, with each material card as a draggable object checked against a lookup table of correct bins on drop; bins rendered as fixed drop-target regions.
```

## Related Resources

- [Chapter 4: "Series, Parallel, and Circuit Topology"](../../chapters/04-series-parallel-topology/index.md)
