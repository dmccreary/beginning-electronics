---
title: Circuit Diagram and Schematic Symbol Explorer
description: Identify the schematic symbols for a battery, resistor, LED, switch, and ground connection, and label the positive terminal, negative terminal, and component leads on a simple circuit diagram.
status: scaffold
library: p5.js
bloom_level: Remember (L1). Bloom Verb: identify.
---

# Circuit Diagram and Schematic Symbol Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 1: "Electricity Basics: Voltage, Current, and Resistance"](../../chapters/01-electricity-basics/index.md).

```text
Type: infographic
**sim-id:** schematic-symbol-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Template:** https://github.com/dmccreary/circuits/tree/main/docs/sims/circuit-symbol-flashcards

Purpose: Help students recognize the schematic symbols and terminal/lead vocabulary introduced in this chapter, and connect each symbol to the real component it represents.

Bloom Taxonomy: Remember (L1). Bloom Verb: identify.

Learning objective: Identify the schematic symbols for a battery, resistor, LED, switch, and ground connection, and label the positive terminal, negative terminal, and component leads on a simple circuit diagram.

Canvas layout:
- Left/center (roughly 70% of width): a simple closed-loop circuit diagram drawn with standard schematic symbols — a battery, a resistor, an LED, and a switch, connected by wire lines into one loop, with a separate ground symbol shown off to the side
- Right side (roughly 30% of width, stacking below the diagram on narrow screens): an infobox panel that displays information about whichever symbol was last clicked

Visual elements:
- Battery symbol drawn with a long line (positive terminal) and a short line (negative terminal), each labeled with + and − when clicked
- Resistor symbol drawn as a zigzag line with two leads
- LED symbol drawn as a diode triangle-and-bar with two small arrows for emitted light, with the flat bar side (cathode) labeled as the negative lead when clicked
- Switch symbol shown in its open position, with a small toggle control that lets the learner click the switch itself to flip it open/closed and see the wire gap appear or close
- Ground symbol (three horizontal lines shrinking in width, or an inverted-triangle style symbol) shown connected to the circuit's negative reference point
- A small "real component photo" thumbnail that appears in the infobox alongside each symbol's explanation, so learners connect the abstract symbol to the physical part

Interactive controls:
- Click any symbol (battery, resistor, LED, switch, ground) to open its infobox
- Click the switch specifically to toggle it open/closed; when open, an animated gap appears in the wire and a small "no current flowing" indicator appears; when closed, a subtle animated flow indicator moves around the loop
- Hover over any wire segment to see a tooltip confirming whether current flows through it in the current switch state
- Button: "Reset View" to close all infoboxes and return the switch to its default open position

Default parameters:
- Switch starts open (circuit is an open circuit, no flow indicator)
- No symbol pre-selected; infobox shows a "Click a symbol to learn about it" placeholder message

Behavior when a symbol is clicked:
- Battery: infobox shows "Battery — the power source. The long line is the positive terminal; the short line is the negative terminal. Polarity matters!"
- Resistor: infobox shows "Resistor — limits current flow. Has two component leads; no polarity, so it can be wired either way."
- LED: infobox shows "LED (light-emitting diode) — converts electrical power into light. Has two component leads. Polarity matters: the flat-bar side is the negative lead."
- Switch: infobox shows "Switch — opens or closes the circuit. Click me to toggle between an open circuit and a closed circuit."
- Ground: infobox shows "Ground — the shared reference point that every voltage in the circuit is measured against."

Data Visibility Requirements:
  Stage 1 (default): Show the full circuit diagram with the switch open and no symbol selected, so the learner sees the whole "blueprint" first
  Stage 2 (symbol clicked): Show the selected symbol highlighted in the diagram plus its matching infobox text and thumbnail photo, side by side, so the learner can directly compare the abstract symbol to the real part
  Stage 3 (switch toggled closed): Show the animated flow indicator appear, tying the open/closed circuit vocabulary from earlier in the chapter back to a visible, concrete diagram

Instructional Rationale: This is a Remember-level objective (identify symbols and label terminals), so the interaction is deliberately a labeling/click-to-reveal pattern rather than a complex simulation. Progressive disclosure (click a symbol, see its definition and photo) matches how a beginner actually builds symbol recognition — one part at a time, with the option to revisit any symbol as often as needed.

Color scheme: Blue circuit lines and symbols on a light background; the positive terminal marked in warm orange, the negative terminal marked in a cool gray, matching the color logic used throughout the book so "positive" and "negative" are visually consistent everywhere a learner encounters them.

Responsive behavior: The circuit diagram and infobox panel must reflow into a stacked (diagram on top, infobox below) layout on narrow screens, and all symbols must remain clickable at any window width.

Implementation: p5.js, using clickable regions defined around each symbol's bounding box; infobox rendered as an HTML panel positioned beside (or below, on narrow screens) the p5.js canvas.
```

## Related Resources

- [Chapter 1: "Electricity Basics: Voltage, Current, and Resistance"](../../chapters/01-electricity-basics/index.md)
