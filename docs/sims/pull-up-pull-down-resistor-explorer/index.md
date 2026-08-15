---
title: Pull-Up and Pull-Down Resistor Explorer
description: Given a rendered breadboard circuit with a push button, a resistor, and a HIGH/LOW state indicator, and a toggle between pull-up and pull-down wiring, predict and then observe the indicator's state in each of the four combinations of wiring style (pull-up or pull-down) and button state (pressed or not pressed).
status: scaffold
library: p5.js
bloom_level: Understand (L2) / Apply (L3). Bloom Verb: explain, demonstrate.
---

# Pull-Up and Pull-Down Resistor Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 9: "Resistors and Capacitors"](../../chapters/09-resistors-and-capacitors/index.md).

```text
Type: microsim
**sim-id:** pull-up-pull-down-resistor-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students toggle between pull-up and pull-down wiring on a rendered breadboard circuit and directly observe how each configuration keeps a wire at a known, defined state whether or not a button is pressed.

Bloom Taxonomy: Understand (L2) / Apply (L3). Bloom Verb: explain, demonstrate.

Learning objective: Given a rendered breadboard circuit with a push button, a resistor, and a HIGH/LOW state indicator, and a toggle between pull-up and pull-down wiring, predict and then observe the indicator's state in each of the four combinations of wiring style (pull-up or pull-down) and button state (pressed or not pressed).

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Pull-Up and Pull-Down Resistor Explorer | Topic: Pull-up resistor and pull-down resistor circuits with a push button on a breadboard, digital HIGH/LOW state | Subjects: Electronics, Beginning Electronics, Digital Logic | Grade Level: Junior High | Learning Objectives: Explain how a pull-up or pull-down resistor keeps a digital input at a known logic level when a button is not pressed" returned a top match of "Breadboard" (dmccreary/microsims, WHAT score 0.5264, recommendation "generate") — below the 0.60 template threshold, so no existing sim is a close enough fit to embed directly. A keyword grep of the microsim catalog for "pull-up" and "pull-down" returned zero matches. This is a new specification, and it is a strong candidate for the breadboard-sim-generator skill since it needs a rendered breadboard with a button and resistor placed in real tie-point positions and animated current flow that changes with the wiring toggle.

Canvas layout: Left/main area shows a rendered half-size breadboard with a battery pack, a resistor, and a push button wired in either a pull-up or pull-down configuration; right side panel holds a "Pull-Up / Pull-Down" toggle switch, a large HIGH/LOW state indicator light, and an infobox.

Components/elements involved: A rendered breadboard with power and ground rails; a battery pack; a resistor and push button with visible leads and wires; a HIGH/LOW indicator LED; a toggle control for wiring mode.

Required interactivity:
- Toggle between "Pull-Up" and "Pull-Down" wiring; the breadboard's rendered wires redraw to show the resistor connected to the supply rail (pull-up) or the ground rail (pull-down)
- Press and hold the button (click-and-hold or tap-and-hold) to see the indicator and animated current flow change in real time
- Release the button to see the wire return to its defined resting state
- Hover the resistor or the button's wire to open an infobox explaining why that specific point sits at HIGH or LOW right now
- Button: "Reset" returns to the default pull-up, button-not-pressed state

Default state: Pull-up mode selected, button not pressed, indicator shows HIGH, infobox reads "The resistor connects this wire to power, so it rests HIGH until the button pulls it to ground."

Instructional Rationale: An Understand/Apply objective that asks students to explain and demonstrate a resting electrical state benefits from a manipulable, cause-and-effect breadboard simulation far more than a static diagram — students must toggle the wiring and operate the button themselves to see why each configuration produces a predictable, non-floating result.

Color scheme: Warm orange for the currently highlighted wire or component, green glow on the indicator for HIGH, blue glow for LOW, consistent with the palette used in this chapter's other diagrams.

Responsive behavior: Breadboard view and the control/indicator panel stack vertically on narrow screens; the button supports tap-and-hold on touch devices as an alternative to click-and-hold.

Implementation: p5.js, built on the breadboard-sim-generator rendering approach (real tie-point hole grid, component placement, and animated current flow); well suited to breadboard-sim-generator since it needs an accurately rendered breadboard, a toggleable wiring configuration, and live current-flow animation tied to button state.
```

## Related Resources

- [Chapter 9: "Resistors and Capacitors"](../../chapters/09-resistors-and-capacitors/index.md)
