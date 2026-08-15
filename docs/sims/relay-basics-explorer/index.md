---
title: Relay Basics Explorer
description: Given a control-side switch driving a relay's coil, predict and observe how energizing the coil pulls the armature to close a separate load-side circuit, and explain why the two sides stay electrically isolated.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: demonstrate, predict.
---

# Relay Basics Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 19: "Driving Outputs: Motors, Buzzers, and More"](../../chapters/19-driving-outputs-motors-buzzers/index.md).

```text
Type: diagram
**sim-id:** relay-basics-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students toggle a relay's control-side switch and observe how energizing the coil pulls the armature to open or close a completely separate, electrically isolated load-side circuit.

Bloom Taxonomy: Apply (L3). Bloom Verb: demonstrate, predict.

Learning objective: Given a control-side switch driving a relay's coil, predict and observe how energizing the coil pulls the armature to close a separate load-side circuit, and explain why the two sides stay electrically isolated.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Relay Basics Explorer | Topic: relay, electromagnetic switch, actuator, load resistance, output device protection | Subjects: Electronics, Electric Circuits | Grade Level: Junior High | Learning Objectives: Explain how a relay uses a small control current to switch a much larger load current through electromagnetic coupling" topped out at "Wire MicroSim" (dmccreary/circuits, WHAT score 0.4824, "generate") — well below the 0.60 template threshold and not relay-specific. New specification. Since a relay isn't in this course's $50 kit, this diagram uses a schematic, non-breadboard layout, styled with the same palette as `breadboard-lib.js` sims.

Canvas layout: Two circuit halves joined only by a dashed "no electrical connection" line: control side (small battery, toggle switch, coil symbol), load side (separate battery, lamp icon, contacts next to a spring-loaded armature); right panel holds a "Control Switch" toggle and an infobox.

Components/elements involved: Control-side battery, switch, coil symbol; load-side battery, lamp icon, armature, movable contact; animated field lines when energized; current-flow dots on the active side.

Required interactivity:
- Clicking the "Control Switch" toggle energizes the coil, shown with animated field lines, pulling the armature down to close the load-side contacts and light the lamp
- Releasing the switch de-energizes the coil; a spring animation pulls the armature back open, turning the lamp off
- Hovering the coil, armature, or contacts opens an infobox explaining that part's role; hovering the dashed line explains the isolation
- Button "Reset" returns the control switch to off

Default state: Control switch off, coil de-energized, contacts open, lamp off, infobox reads "Coil off — no magnetic pull, so the spring holds the contacts open."

Data Visibility Requirements:
Stage 1: Show the control switch's on/off state
Stage 2: Show the coil energized or de-energized, with field-line animation
Stage 3: Show the armature's position
Stage 4: Show the load-side circuit's resulting open/closed and lamp state

Instructional Rationale: An Apply-level "demonstrate/predict" objective calls for a single manipulable switch with an immediate, visible cause-and-effect chain — coil, armature, contacts, lamp.

Color scheme: Blue for the control side, orange for the load side, red field lines when energized.

Responsive behavior: The two halves stack vertically on narrow screens; the toggle stays full-width and touch-friendly.

Implementation: p5.js, schematic-style diagram styled consistently with `breadboard-lib.js`'s palette, even though it does not render an actual breadboard.
```

## Related Resources

- [Chapter 19: "Driving Outputs: Motors, Buzzers, and More"](../../chapters/19-driving-outputs-motors-buzzers/index.md)
