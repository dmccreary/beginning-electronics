---
title: Transistor AND and OR Logic Gates with Live Truth Table
description: Given a rendered breadboard with two NPN transistors wired in series (AND) and two NPN transistors wired in parallel (OR), predict and then verify the output LED's state and the corresponding row of a live truth table for every possible combination of two input buttons on each gate.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: demonstrate, predict, verify.
---

# Transistor AND and OR Logic Gates with Live Truth Table



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 24: "Boolean Logic and Transistor Gates"](../../chapters/24-boolean-logic-transistor-gates/index.md).

```text
Type: microsim
**sim-id:** transistor-and-or-logic-gates<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students press independent input buttons on a rendered breadboard holding a series-wired transistor AND gate and a parallel-wired transistor OR gate, and directly watch each gate's output LED and its own self-filling truth table respond to every input combination, so the abstract \( Y = A \cdot B \) and \( Y = A + B \) notation connects to a real, physical circuit built from the exact transistor behavior learned in Chapter 13.

Bloom Taxonomy: Apply (L3). Bloom Verb: demonstrate, predict, verify.

Learning objective: Given a rendered breadboard with two NPN transistors wired in series (AND) and two NPN transistors wired in parallel (OR), predict and then verify the output LED's state and the corresponding row of a live truth table for every possible combination of two input buttons on each gate.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Transistor AND and OR Logic Gates with Live Truth Table | Topic: Transistor AND gate, Transistor OR gate, truth table, boolean logic, NPN transistor switching | Subjects: Electronics, Electric Circuits | Grade Level: Junior High | Learning Objectives: Given a rendered breadboard circuit with two NPN transistors wired as an AND gate and an OR gate, toggle each input switch and observe the output LED and a live, self-filling truth table" returned a top match of "Logic Gates" (dmccreary/microsims, WHAT score 0.6475, recommendation "template"), followed by "Interactive Truth Table Builder" (dmccreary/computer-science, WHAT score 0.5877, "generate") and "Logic Gates MicroSim" (dmccreary/digital-electronics, WHAT score 0.5736, "generate"). All three teach logic gates through abstract IEEE schematic symbols with clickable inputs, not a physical breadboard circuit built from real NPN transistors in series or parallel — exactly the gap this chapter needs to fill, since the whole point of this MicroSim is showing the *same* transistor switching behavior from Chapter 13 arranged into the *same* series/parallel wiring shapes from Chapter 16. A keyword search of the catalog for "transistor logic gate," "truth table," and "boolean AND OR" surfaced the same three schematic-symbol sims and no breadboard-based match. New specification. **Library/Implementation fit:** an excellent, central candidate for the breadboard-sim-generator skill — both gates reuse this repository's existing `bbTransistor()` component (already built for Chapter 13's transistor-switch demo) and extend `breadboard-lib.js` with a small self-filling truth-table panel, directly continuing the reused `wired-logic-and-or` sim's AND-on-top/OR-on-bottom layout from Chapter 16, now with transistors standing in for the switches.

Canvas layout: A rendered breadboard split into two halves stacked vertically — top half labeled "Transistor AND Gate," with two NPN transistors wired in series, a collector-side resistor and LED, and two input push buttons (A, B) each feeding its own base resistor; bottom half labeled "Transistor OR Gate," with two NPN transistors wired in parallel, its own resistor and LED, and two input push buttons (C, D). A right-side panel holds two live truth tables (AND on top, OR on bottom) that highlight and fill in the matching row as buttons are pressed, plus two small clickable schematic gate-symbol icons (D-shaped AND, shield-shaped OR).

Components/elements involved: Rendered breadboard with power and ground rails; two NPN transistors (TO-92 package, base/collector/emitter individually labeled and hoverable) wired in series for the AND circuit; two NPN transistors wired in parallel for the OR circuit; four input push buttons (A, B, C, D), each with its own base resistor; two collector-side resistors and LEDs, one per gate; connecting wires; two live truth-table panels; two clickable IEEE-style gate-symbol icons.

Required interactivity:
- Pressing input button A and/or B toggles that transistor's base current on or off in the AND circuit; the AND LED lights only when both A and B are held down together, and the matching row of the AND truth table highlights and fills in with the live output value
- Pressing input button C and/or D toggles that transistor's base current on or off in the OR circuit; the OR LED lights whenever C, D, or both are held down, and the matching row of the OR truth table highlights and fills in with the live output value
- Hovering any transistor's base, collector, or emitter lead opens an infobox naming that lead, reinforcing Chapter 13's vocabulary
- Clicking the AND or OR schematic gate-symbol icon opens an infobox describing that icon's shape (flat-backed D vs. curved shield) and stating that the same shape is used no matter what is physically switching, reinforcing the Logic Gate Symbol concept
- Animated current dots move only along the completed path, exactly as in Chapter 16's wired-logic-and-or sim, so a learner can see the AND circuit's single series path versus the OR circuit's two parallel paths

Default state: All four buttons released, both LEDs dark, both truth tables empty except a highlighted arrow pointing at the all-LOW row; infobox reads "Press A and B together to fill in the AND gate's last row."

Instructional Rationale: An Apply-level "demonstrate/predict/verify" objective needs a manipulable circuit with an immediate, checkable consequence — pressing each input combination and watching both the LED and the matching truth-table row respond lets students verify their own predictions instead of only reading someone else's finished table, directly continuing the predict-then-verify pattern Chapter 16 used for its own wired-logic-and-or sim.

Color scheme: Same green current-flow dots and dim gray off-state used in Chapter 13's transistor-switch demo; blue highlight on the truth-table row currently being demonstrated; AND/OR panel colors carried over from Chapter 16's reused sim.

Responsive behavior: Breadboard halves and the truth-table/infobox panel stack vertically on narrow screens; all four buttons remain full-width and touch-friendly; both gate-symbol icons scale down but stay tappable.

Implementation: p5.js, built on the breadboard-sim-generator skill's rendered tie-point approach, extending this repository's existing `breadboard-lib.js` `bbTransistor()` component (introduced for Chapter 13) with a new self-filling truth-table panel, reusing the current-path animation logic from Chapter 16's `wired-logic-and-or` sim.
```

## Related Resources

- [Chapter 24: "Boolean Logic and Transistor Gates"](../../chapters/24-boolean-logic-transistor-gates/index.md)
