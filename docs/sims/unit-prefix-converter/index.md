---
title: Unit Prefix Value Converter
description: Calculate the equivalent value of a current, resistance, or power reading across microampere/milliampere/ampere, ohm/kilohm/megohm, and milliwatt/watt scales, by entering a number and switching its prefix on an interactive ladder.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: calculate.
---

# Unit Prefix Value Converter



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 3: "Circuit Analysis, Kirchhoff's Laws, and Energy"](../../chapters/03-circuit-analysis-kirchhoff/index.md).

```text
Type: microsim
**sim-id:** unit-prefix-converter<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Template:** https://github.com/dmccreary/intro-to-physics-course/tree/main/docs/sims/metric-scale-zoom

Purpose: Help learners build fluency converting a single quantity across the micro-, milli-, base, kilo-, and mega- prefixes used throughout the course.

Bloom Taxonomy: Apply (L3). Bloom Verb: calculate.

Learning objective: Calculate the equivalent value of a current, resistance, or power reading across microampere/milliampere/ampere, ohm/kilohm/megohm, and milliwatt/watt scales, by entering a number and switching its prefix on an interactive ladder.

Canvas layout:
- Top: a dropdown to choose the quantity type (Current, Resistance, or Power)
- Center: a vertical "prefix ladder" showing five rungs — micro, milli, base, kilo, mega — each rendered as a horizontal bar
- Bottom: a numeric input box and a live equivalent-value readout for every rung

Visual elements:
- Five rungs, one per prefix, labeled with symbol (µ, m, none, k, M) and full name
- The rung matching the entered value highlighted in orange
- A readout beside every rung showing the same quantity at that rung's scale (e.g., entering "20" at milliamps shows "0.02 A" on the base rung and "20,000 µA" on the micro rung)

Interactive controls:
- Dropdown: quantity type (Current, Resistance, or Power)
- Numeric input: the value to convert, plus a selector for which rung it represents
- Button: "Try a Real Example" cycles through preset values from this chapter (20 mA LED current, 1 kΩ resistor, 60 mW LED power, 5 µA sleep current, 1 MΩ pull-up resistor)

Default parameters:
- Quantity type: Current; entered value: 20, at the milli- rung (a typical LED)

Data Visibility Requirements:
  Stage 1 (default): Show 20 mA entered, with every rung's equivalent value displayed at once
  Stage 2 (value or rung changed): Recalculate every rung's readout immediately, so the connection between them is obvious
  Stage 3 ("Try a Real Example" clicked): Drop a real component value from this chapter into the ladder

Instructional Rationale: This Apply-level objective calls for a parameter-exploration tool, not an animation. Updating all five rungs at once, instead of one conversion at a time, builds the mental model needed to read any label in the kit at a glance.

Color scheme: Blue rungs on a light background, with the active rung in warm orange, matching the book's theme colors.

Responsive behavior: Rungs stack vertically at any width; controls stay full-width and touch-friendly on narrow screens.

Implementation: p5.js, with a simple multiply/divide-by-1000 conversion function shared across all three quantity types, and rung bars redrawn each frame from the current input value.
```

## Related Resources

- [Chapter 3: "Circuit Analysis, Kirchhoff's Laws, and Energy"](../../chapters/03-circuit-analysis-kirchhoff/index.md)
