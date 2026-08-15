---
title: Transistor Gate Explorer with LED Output
description: Given a rendered breadboard with a transistor-based NOT, NAND, NOR, or XOR gate selected from a dropdown, predict and then verify the output LED's state and the corresponding row of a live truth table for every possible input combination.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: demonstrate, predict, verify.
---

# Transistor Gate Explorer with LED Output



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 25: "NAND, NOR, XOR, and the RS Latch"](../../chapters/25-nand-nor-xor-rs-latch/index.md).

```text
Type: microsim
**sim-id:** transistor-gate-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students click independent input buttons on a rendered breadboard holding a selectable transistor gate — NOT, NAND, NOR, or XOR — and directly watch the gate's Gate Output LED Indicator and its own self-filling truth table respond to every input combination, connecting the abstract truth tables above to a real circuit built from the exact transistor behavior learned in Chapter 13 and reused from Chapter 24.

Bloom Taxonomy: Apply (L3). Bloom Verb: demonstrate, predict, verify.

Learning objective: Given a rendered breadboard with a transistor-based NOT, NAND, NOR, or XOR gate selected from a dropdown, predict and then verify the output LED's state and the corresponding row of a live truth table for every possible input combination.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Transistor Gate Explorer with LED Output | Topic: NOT gate, NAND gate, NOR gate, XOR gate, transistor logic gates, gate output LED indicator, logic level high low | Subjects: Electronics, Electric Circuits | Grade Level: Junior High | Learning Objectives: Given a rendered breadboard circuit with transistor-based NOT, NAND, NOR, and XOR gates, click input buttons and observe the output LED and a live, self-filling truth table" returned a top match of "Logic Gates MicroSim" (dmccreary/digital-electronics, WHAT score 0.5953, recommendation "generate"), followed by "Single Logic Gate MicroSim" (dmccreary/digital-electronics, WHAT score 0.5584, "generate") and "Transistor Driver and Dimmer Circuit" (dmccreary/moving-rainbow, WHAT score 0.5542, "generate"). All three teach gates through standard IEEE schematic symbols or an unrelated dimmer circuit, not a physical breadboard circuit built from real NPN transistors — the same gap Chapter 24's `transistor-and-or-logic-gates` specification identified. A keyword search of the catalog for "NAND gate," "NOR gate," and "XOR gate" surfaced only schematic-symbol sims and the unrelated Flip Flop MicroSim. New specification. **Library/Implementation fit:** an excellent, central candidate for the breadboard-sim-generator skill — reuses this repository's existing `bbTransistor()` component from `breadboard-lib.js` (already built for Chapter 13 and extended for Chapter 24's AND/OR gates) for every gate option, and reuses the self-filling truth-table panel and current-path animation pattern specified for Chapter 24's `transistor-and-or-logic-gates` sim.

Canvas layout: A rendered breadboard with a dropdown at the top selecting the active gate (NOT, NAND, NOR, XOR); one or two input push buttons (A, and B for every gate except NOT); the selected gate's transistor arrangement wired to a collector-side resistor and Gate Output LED Indicator; a right-side panel holding a live, self-filling truth table for the selected gate plus a small clickable schematic gate-symbol icon showing the bubble convention.

Components/elements involved: Rendered breadboard with power and ground rails; one or two NPN transistors (TO-92 package, leads individually labeled and hoverable) wired according to the selected gate, plus an inverting transistor stage for NAND and NOR; one or two input push buttons; a collector-side resistor and LED; connecting wires; a live truth-table panel; a clickable IEEE-style gate-symbol icon with its bubble (or lack of one) visible.

Required interactivity:
- Selecting a gate from the dropdown redraws the breadboard with that gate's transistor wiring and resets the input buttons and truth table
- Pressing each input button toggles that transistor's base current on or off; the output LED updates immediately, and the matching row of the truth table highlights and fills in with the live output value
- Hovering any transistor's base, collector, or emitter lead opens an infobox naming that lead, reinforcing Chapter 13's vocabulary
- Clicking the gate-symbol icon opens an infobox explaining the bubble convention and stating this gate is Combinational Logic — its output only ever depends on the buttons currently pressed
- Animated current dots move only along the completed path, so students can see an inverting stage's path light up separately from the main series or parallel path

Default state: NAND selected, both buttons released, LED dark, truth table empty except a highlighted arrow pointing at the all-LOW row; infobox reads "Press A and B together — this is the one row where NAND disagrees with plain AND."

Instructional Rationale: An Apply-level "demonstrate/predict/verify" objective needs a manipulable circuit with an immediate, checkable consequence. Letting students switch between all four gates in one sim, rather than four separate sims, lets them directly compare how the same two transistors produce different truth tables depending on wiring and inversion — reinforcing the Two-Transistor Gate Circuit concept as one recipe with several outcomes.

Color scheme: Same green current-flow dots and dim gray off-state used in Chapter 13's transistor-switch demo and Chapter 24's gate sim; blue highlight on the truth-table row currently being demonstrated.

Responsive behavior: Breadboard and the truth-table/infobox panel stack vertically on narrow screens; input buttons and the gate dropdown remain full-width and touch-friendly.

Implementation: p5.js, built on the breadboard-sim-generator skill's rendered tie-point approach, extending this repository's existing `breadboard-lib.js` `bbTransistor()` component and the truth-table panel pattern specified for Chapter 24's `transistor-and-or-logic-gates` sim.
```

## Related Resources

- [Chapter 25: "NAND, NOR, XOR, and the RS Latch"](../../chapters/25-nand-nor-xor-rs-latch/index.md)
