---
title: Transistor as a Switch — Breadboard Demo
description: Given a rendered breadboard circuit with an NPN transistor, a base-current push button, a base resistor, and a collector LED, predict and observe whether the LED lights when the base switch is open (cutoff) versus closed (saturation), and identify the base, collector, and emitter leads on the rendered part.
status: scaffold
library: p5.js
bloom_level: Understand (L2) / Apply (L3). Bloom Verb: demonstrate, predict, identify.
---

# Transistor as a Switch — Breadboard Demo



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 13: "Meet the Transistor"](../../chapters/13-meet-the-transistor/index.md).

```text
Type: microsim
**sim-id:** transistor-switch-breadboard-demo<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students flip a small base-current switch on and off in a rendered breadboard circuit and directly observe how that tiny current controls a much larger collector current lighting an LED, while also identifying the base, collector, and emitter leads and seeing the transistor's cutoff and saturation states.

Bloom Taxonomy: Understand (L2) / Apply (L3). Bloom Verb: demonstrate, predict, identify.

Learning objective: Given a rendered breadboard circuit with an NPN transistor, a base-current push button, a base resistor, and a collector LED, predict and observe whether the LED lights when the base switch is open (cutoff) versus closed (saturation), and identify the base, collector, and emitter leads on the rendered part.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Transistor as a Switch Breadboard Demo | Topic: NPN transistor base current controlling collector current to an LED, transistor switching, saturation and cutoff | Subjects: Electronics, Beginning Electronics | Grade Level: Junior High | Learning Objectives: Demonstrate how a small base current switches a much larger collector current on and off in a breadboard transistor circuit" returned a top match of "LED Dimmer Circuit" (dmccreary/moving-rainbow, WHAT score 0.6394, recommendation "template") — in the 0.60-0.75 template band, but built around PWM brightness dimming rather than a base-switches-collector breadboard circuit, and from a Mathematics-tagged repo rather than Electronics. The second match, "Breadboard" (dmccreary/microsims, 0.6093, "template"), is a generic empty breadboard renderer with no transistor logic. Given the topical mismatch, this is written as a new specification rather than a reuse, noting the LED Dimmer Circuit and the generic Breadboard sim as loose structural templates. This is an excellent fit for the breadboard-sim-generator skill, and should extend this repository's existing `breadboard-lib.js` (already used by `button-led-breadboard` and `light-dark-detector` in Chapters 7 and 17) with a rendered TO-92 transistor component.

Canvas layout: Main area shows a rendered half breadboard with a battery pack, an NPN transistor (TO-92 package, flat side visible, three labeled leads), a base resistor, a push-button base switch, and a collector-side LED with its own resistor; right side panel holds a "Base Switch: ON/OFF" toggle button, an NPN/PNP mode toggle, and an infobox.

Components/elements involved: A rendered breadboard with power and ground rails; a battery pack; a TO-92 transistor with base, collector, and emitter leads individually labeled and hoverable; a base resistor and push-button switch feeding the base; a collector resistor and LED; connecting wires; an animated current-flow indicator showing a thin trickle on the base wire and a thick flow on the collector-emitter path when conducting.

Required interactivity:
- Clicking the "Base Switch" button toggles base current on or off; when on, animated current flows into the base, the transistor's internal path opens, thick animated current flows collector-to-emitter, and the LED lights at full brightness (saturation); when off, no base current flows, the collector path is blocked, and the LED stays dark (cutoff)
- Hovering the base, collector, or emitter lead opens an infobox naming that lead and stating its role, reinforcing the base/collector/emitter definitions from the chapter text
- Toggling NPN/PNP mode redraws the transistor's schematic symbol arrow and flips the current direction and switch polarity, reinforcing the NPN vs. PNP comparison table
- Button "Reset" returns to the default off (cutoff) state with NPN mode selected

Default state: NPN mode, base switch off, transistor in cutoff, LED dark, infobox reads "Cutoff — no base current, no collector current. The transistor acts like an open switch."

Data Visibility Requirements:
Stage 1: Show whether the base switch is open or closed
Stage 2: Show the resulting operating state label ("Cutoff" or "Saturation")
Stage 3: Show the animated current on the base wire (thin, on/off) versus the collector-emitter path (thick, on/off)
Stage 4: Show the LED's lit/dark state matching the collector current

Instructional Rationale: An Understand/Apply "demonstrate/predict" objective calls for a manipulable breadboard simulation with a clear before-and-after state, so students directly connect a tiny base current to a much larger collector current rather than reading the relationship as an abstract statement.

Color scheme: Thin green current-flow dots on the base wire, thick green current-flow dots on the collector-emitter path when conducting, gray and dim when off, consistent with the palette used in Chapter 12's diode bias demo.

Responsive behavior: Breadboard view and the control/infobox panel stack vertically on narrow screens; the Base Switch and NPN/PNP toggle buttons remain full-width and touch-friendly.

Implementation: p5.js, built using the breadboard-sim-generator skill's rendered tie-point approach, extending this repository's existing `breadboard-lib.js` with a new transistor component and base-switch logic.
```

## Related Resources

- [Chapter 13: "Meet the Transistor"](../../chapters/13-meet-the-transistor/index.md)
