# Verification record

Verified 2026-09-05. Structural quality score: scaffold frontmatter 0 → completed rubric 100/100.

- PASS: JavaScript syntax and Python compilation.
- PASS: Schemdraw prompt contract, SVG and PNG validator. SVG text is rendered as paths; all labels were visually inspected.
- PASS: Browser console has no page errors; breadboard layout checker returns no problems.
- PASS: No shared physical endpoint holes; no two-terminal component has both pins on one breadboard net.
- PASS: All 101 knob settings satisfy the loaded divider equation, base-resistor current, motor voltage balance, collector-current limit, voltage bounds, and monotonic speed.
- PASS: 0% gives zero motor current. 100% gives 4.3 mA base current, 60 mA motor current and 0.2 V collector voltage under the documented assumptions.
- PASS: Slider input, Start, Reset and flyback playback. Setting the potentiometer directly to 0% sets base current to zero, preserves initial winding current through D1, and clamps collector voltage to 5.7 V; current subsequently decays to zero.
- PASS: Controls contained at 400, 800 and 1200 px widths; shared Playwright iframe tester passes at height 702.
- PASS: MkDocs build to a temporary output directory; no build warnings/errors. Existing unlisted pages reported as informational messages.
- PASS: Navigation and gallery include the new lesson. Relative schematic image exists.

## Visual review

Reviewed the 800×702 screenshot, a 400×702 mobile capture, and 1200×702 scope and flyback captures, plus the schematic PNG.

- PASS: Full breadboard, all rails, supply badge, hole labels, center trench and correctly polarized diode visible.
- PASS: Text is unclipped and free of residual strokes. Controls, readouts and title do not overlap; drawing area is aliceblue and controls are on white.
- PASS: Three potentiometer terminals and transistor C/B/E labels are visible. Small hole labels scale down on mobile; full wiring details remain in the lesson table.
- PASS: Scope units and distinct axes are present. Legend now shows current readings while paused; horizontal axis explicitly reads “samples.”
- PASS: Current direction follows the main path during drive and the diode loop during flyback. Animation and history freeze when paused.
- PASS: Schematic topology matches the breadboard. RV1 label was moved left of its symbol to clear the wiper; all final labels are readable.
- N/A: Pushbutton column rules (this circuit has no switch), LEDs, matrix layouts, maps, Mermaid diagrams.

## Standardization completed

- [x] Complete HTML, schema meta tag and responsive canvas.
- [x] Correct electronics metadata and documented analog/transient assumptions.
- [x] Lesson, schematic, source, assessment questions and manufacturer references.
- [x] Fullscreen/editor links and copyable embed example.
- [x] Screenshot, image frontmatter and synchronized iframe height.

The copied breadboard library has two local presentation changes: its scope axis reads “samples” and its legend uses live getter values. The general digital solver is unchanged and unused by this analog MicroSim. The model omits mechanical acceleration and coast-down; these limits are visible in the simulation and lesson.

## Switch removal verification

Removed the base switch from the board and schematic and connected the wiper through R1 directly to Q1. Updated instructions and flyback triggering to use potentiometer cutoff. Browser checks confirm no switch component, correct layout, 0% flyback and decay, and Reset. Refreshed the schematic and simulation preview.

## Potentiometer wiring simplification

Removed the extra green jumper chain at the left side of the board. RV1 now has exactly three external wires: +5 V to its high terminal, ground to its low terminal, and one green center-tap wire from E4 to F8. R1 now starts at J8, which shares F8's lower-strip connection.

The trim-pot body now spans rows A through D. Its wiper and ground pins remain in E4 and E6 below the body, making the rendered package closer to a square trimmer.

D1's cathode now uses B14, the same upper-strip node as M1's positive terminal. The redundant T+20→B20 power jumper was removed.

Wire-current dots are hidden while paused and appear only after Start is pressed. The solved values remain available in the readouts while paused.

The collector jumper now ends at F10 instead of G10. F10 shares Q1 collector's lower-strip node at H10, while keeping the jumper endpoint visible above the transistor graphic.
