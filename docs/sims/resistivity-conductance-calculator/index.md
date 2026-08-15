---
title: Resistivity and Conductance Calculator
description: Calculate a wire's resistance from its resistivity, length, and cross-sectional area, and calculate its conductance as the reciprocal of that resistance, by adjusting a material dropdown and length/thickness sliders and reading the live-updated results.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: calculate.
---

# Resistivity and Conductance Calculator



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 5: "Conductors, Batteries, and Circuit Vocabulary Review"](../../chapters/05-conductors-batteries-review/index.md).

```text
Type: microsim
**sim-id:** resistivity-conductance-calculator<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students calculate how a wire's resistance and conductance change with material, length, and cross-sectional area, building an intuitive, hands-on feel for the resistivity formula.

Bloom Taxonomy: Apply (L3). Bloom Verb: calculate.

Learning objective: Calculate a wire's resistance from its resistivity, length, and cross-sectional area, and calculate its conductance as the reciprocal of that resistance, by adjusting a material dropdown and length/thickness sliders and reading the live-updated results.

Canvas layout:
- Left (60%): a schematic wire whose visible length and thickness redraw live as the sliders move
- Right (40%, stacking below on narrow screens): material dropdown, two sliders, and a results readout

Visual elements:
- A wire that stretches/shrinks (length) and thickens/thins (area) as sliders change, tinted by material
- A readout showing resistivity (Ω·m), calculated resistance (Ω, auto-scaled), and calculated conductance (S, auto-scaled)
- An animated dot-stream inside the wire, moving faster at high conductance and slower at low conductance

Interactive controls:
- Dropdown: "Material" — copper, aluminum, nichrome, or rubber, each pre-loaded with its real resistivity value
- Slider: "Length (cm)" — 1 to 100 cm
- Slider: "Thickness / Cross-Sectional Area (mm²)" — 0.1 to 10 mm²
- Display: resistance and conductance recalculated live on every change

Default parameters:
- Material: Copper
- Length: 20 cm
- Cross-sectional area: 1 mm²

Behavior: Changing the material swaps the resistivity value and updates wire tint and dot-stream speed. Increasing length increases displayed resistance and decreases conductance proportionally; increasing cross-sectional area does the opposite. Selecting rubber shows a stalled dot-stream and a "practically an insulator!" callout.

Data Visibility Requirements:
  Stage 1 (default): Copper wire at default dimensions with resistance and conductance both visible
  Stage 2 (slider moved): Wire redraws at new dimensions alongside updated numbers, so cause and effect are visible together
  Stage 3 (material changed): Dramatic jump in resistance/conductance switching from a metal to rubber, making the resistivity range concrete

Instructional Rationale: An Apply-level calculation objective calls for a parameter-exploration calculator rather than a passive diagram, so learners manipulate all three formula inputs and see both outputs respond immediately — the fastest way to build fluency with a three-variable formula.

Color scheme: Copper/orange tint for copper, silver-gray for aluminum, red-orange for nichrome, dull green for rubber, on a light background.

Responsive behavior: Wire drawing and control panel stack vertically on narrow screens; all controls remain touch-usable.

Implementation: p5.js, with resistivity values in a lookup table keyed by material; wire dimensions and dot-stream speed recalculated every frame from slider values.
```

## Related Resources

- [Chapter 5: "Conductors, Batteries, and Circuit Vocabulary Review"](../../chapters/05-conductors-batteries-review/index.md)
