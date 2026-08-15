---
title: Circuit Topology Explorer
description: Identify the nodes, branches, and loops in a series-parallel circuit (one battery, one series resistor, and two parallel resistors) by clicking each part of the diagram and reading its definition in an infobox.
status: scaffold
library: p5.js
bloom_level: Remember (L1). Bloom Verb: identify.
---

# Circuit Topology Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 4: "Series, Parallel, and Circuit Topology"](../../chapters/04-series-parallel-topology/index.md).

```text
Type: diagram
**sim-id:** circuit-topology-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Help students recognize and label nodes, branches, and loops on a real series-parallel circuit diagram, and see that topology describes electrical connection, not physical position.

Bloom Taxonomy: Remember (L1). Bloom Verb: identify.

Learning objective: Identify the nodes, branches, and loops in a series-parallel circuit (one battery, one series resistor, and two parallel resistors) by clicking each part of the diagram and reading its definition in an infobox.

Canvas layout:
- Left/center (roughly 70% of width): a series-parallel circuit diagram — a battery, one resistor in series, then two resistors in parallel, forming a closed loop — with four labeled node dots (A, B, C, D)
- Right side (roughly 30%, stacking below on narrow screens): an infobox panel showing information about whichever element was last clicked

Visual elements:
- Four node dots, drawn as filled circles at every junction point, each labeled A–D
- Three branches, drawn as distinct colored line segments: the series-resistor branch, and the two parallel-resistor branches
- A toggle-highlighted loop overlay that traces one full loop around the circuit when the "Loop" button is active
- A small "same node!" pulse effect that flashes both ends of a node whenever a node with multiple visual connection points is clicked, reinforcing that spread-out points can share one electrical identity

Interactive controls:
- Click any node dot to open an infobox defining "node" and confirming how many branches meet there
- Click any branch to open an infobox defining "circuit branch" and listing which components lie along it
- Button: "Highlight a Loop" traces one closed loop in a pulsing outline and opens an infobox defining "loop"
- Button: "Reset View" clears all highlights and infobox content

Default parameters:
- No element pre-selected; infobox shows a "Click a node, a branch, or the Loop button to explore this circuit's topology" placeholder

Behavior when an element is clicked:
- Node: infobox shows "Node — a connection point where two or more components meet. This node connects N branches." (N calculated from the actual diagram)
- Branch: infobox shows "Circuit Branch — a single path between two nodes. This branch contains: [component list]."
- Loop button: infobox shows "Loop — a closed path that returns to its starting node without reusing a branch. This circuit has more than one possible loop!"

Data Visibility Requirements:
  Stage 1 (default): Show the full series-parallel diagram with all four nodes and three branches visible but unselected
  Stage 2 (node or branch clicked): Show the selected element highlighted in the diagram plus its matching infobox definition
  Stage 3 (Highlight a Loop clicked): Show one complete loop traced in an animated outline, so "loop" becomes a visible path rather than an abstract word

Instructional Rationale: This is a Remember-level objective (identify and label topology vocabulary), so the interaction is a straightforward click-to-reveal labeling pattern rather than a calculation tool — matching how a beginner actually learns new vocabulary: point at something, learn its name, repeat.

Color scheme: Blue circuit lines and node dots on a light background, with the currently selected element highlighted in warm orange, consistent with the color logic used throughout this book.

Responsive behavior: The diagram and infobox panel reflow into a stacked layout on narrow screens; all nodes, branches, and buttons remain clickable at any window width.

Implementation: p5.js, using clickable regions defined around each node and branch; infobox rendered as an HTML panel beside (or below, on narrow screens) the canvas.
```

## Related Resources

- [Chapter 4: "Series, Parallel, and Circuit Topology"](../../chapters/04-series-parallel-topology/index.md)
