---
title: Jumper Wire Routing Practice
description: Construct a valid connection between two highlighted breadboard tie points by selecting the correct jumper wire type (male-to-male or male-to-female) for the situation and routing a wire between them without crossing the gutter incorrectly or bridging the power rails.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: construct, demonstrate.
---

# Jumper Wire Routing Practice



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 6: "Meet Your Breadboard"](../../chapters/06-meet-your-breadboard/index.md).

```text
Type: microsim
**sim-id:** jumper-wire-routing-practice<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students practice choosing the right jumper wire type and a clean physical path to connect two given tie points on a breadboard, reinforcing jumper wire, male-to-male/male-to-female, and wire-routing concepts before any real current is involved.

Bloom Taxonomy: Apply (L3). Bloom Verb: construct, demonstrate.

Learning objective: Construct a valid connection between two highlighted breadboard tie points by selecting the correct jumper wire type (male-to-male or male-to-female) for the situation and routing a wire between them without crossing the gutter incorrectly or bridging the power rails.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) found no strong match for a jumper-wire or wire-routing sim specifically; the closest hits were general breadboard-anatomy sims ("Breadboard Layout Explorer," score 0.54) flagged "generate." A keyword grep of the project's 3,764-entry MicroSim index for "jumper" returned zero existing entries. This is a new specification.

Breadboard region shown: The same half-size breadboard graphic as the Breadboard Anatomy Explorer above (reuse that rendering approach for visual consistency within the chapter), pre-populated each round with two highlighted target tie points — sometimes on the same side of the gutter, sometimes on opposite sides, sometimes one target on a power rail.

Components/elements involved: No electronic components — only the bare board, two highlighted target tie points per round, and a supply tray showing one male-to-male jumper icon and one male-to-female jumper icon (with a small pin-header module icon shown only when a male-to-female connection is the correct choice).

Labels/values that must be shown: The two target tie points' row-column addresses (e.g., "connect row b, column 5 to the + power rail"), the wire type currently selected, and a running "connections completed" counter.

Required interactivity:
- Click one of the two jumper wire icons (male-to-male or male-to-female) to select it before routing
- Drag from the first highlighted tie point to the second to draw a routed wire; the path snaps along the board's row/column grid rather than a diagonal straight line, visualizing real wire routing
- On a completed connection, immediate feedback: a green confirmation and a one-sentence explanation if correct ("Nice — male-to-male is right for two breadboard holes"); a red explanation if the wrong wire type was chosen or the wire bridges the power rails incorrectly ("That bridges the + and − rails — check Chapter 6's warning about shorting the rails")
- Button: "New Round" generates a fresh pair of target tie points, occasionally including a simulated sensor-module pin header, which requires a male-to-female jumper
- Toggle: "Show Neat vs. Messy Routing" swaps between a tidy, grid-aligned example path and a tangled diagonal path between the same two points, reinforcing the wire-routing concept from the text

Default parameters: Round 1 always uses two ordinary breadboard-hole targets on the same side of the gutter, so the first successful connection is a straightforward male-to-male placement.

Data Visibility Requirements:
  Stage 1 (round starts): Two target tie points highlighted on the board, jumper wire tray shown, no wire drawn yet
  Stage 2 (wire type selected): Chosen wire icon highlighted, ready to route
  Stage 3 (wire routed and released): Completed connection shown snapped to the grid, with immediate correct/incorrect feedback and explanation

Instructional Rationale: An Apply-level "construct a connection" objective calls for a hands-on select-then-act pattern with immediate feedback, rather than passive viewing, so learners rehearse the actual decision (which wire type?) and the routing habit they'll need moments before their first real breadboard build in Chapter 7.

Color scheme: Warm orange for the currently selected jumper wire type, green/red for correct/incorrect feedback, light neutral gray for the unselected board, matching the Breadboard Anatomy Explorer's palette for visual consistency within the chapter.

Responsive behavior: Board and supply tray stack vertically on narrow screens; drag-to-route also supports tap-tap (tap start hole, tap end hole) as a touch-friendly alternative to dragging.

Implementation: p5.js, with the breadboard grid shared from the Breadboard Anatomy Explorer's rendering approach; routing paths computed as orthogonal (grid-aligned) segments between two selected holes; a small rules table checks wire-type validity and power-rail bridging per round.
```

## Related Resources

- [Chapter 6: "Meet Your Breadboard"](../../chapters/06-meet-your-breadboard/index.md)
