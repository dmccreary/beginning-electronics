# Remaining Circuit Schematics Implementation Log

Date: 2026-08-15

## Result

Completed all 24 unchecked static circuit-diagram tasks in the project-root `TODO.md`. Each result includes:

- a maintainable Python Schemdraw source file with a current canonical `Prompt:` block;
- a rendered PNG beside the source;
- deterministic source/image validation;
- visual inspection for topology, polarity, junctions, label clearance, clipping, crossings, and accidental skewed conductors;
- a stable `#### Diagram: ...` chapter anchor;
- Markdown image syntax inside `<figure markdown="span">` with meaningful alt text and a `<figcaption>`.

The separate P3 interactive task, **Chapter 16 — Debounce capacitor value MicroSim**, remains open because it is an interactive simulation rather than a static circuit schematic.

## Added diagrams

| Priority | Chapter | Diagram and placement | Source / image | Final content |
|---|---:|---|---|---|
| P0 | 17 | `Light Detector and Dark Detector Voltage Dividers` before the threshold discussion | `light-dark-detector-dividers.py` / `.png` | Matched LDR-above and LDR-below dividers, output direction, NPN input, and approximate threshold. |
| P0 | 11 | `Bypass Capacitor Across IC Power Pins` in the bypass-capacitor section | `bypass-capacitor-placement.py` / `.png` | Close 100 nF VCC-to-GND placement compared with a crossed-out remote, long-loop placement. |
| P0 | 10 | `RC Charging and Discharging Circuit` before the time-constant section | `rc-charging-discharging.py` / `.png` | Separate charge/discharge paths, switch states, polarized capacitor, current arrows, and a 0.10 s time constant. |
| P0 | 12 | `Rectifier, Flyback, and Zener Diode Circuits` before the comparison table | `rectifier-flyback-zener-circuits.py` / `.png` | Three application panels with anode/cathode orientation, current paths, and the Zener series resistor. |
| P1 | 1 | `Closed, Open, and Short Circuit Paths` before the circuit-state table | `closed-open-short-paths.py` / `.png` | Same battery and lamp in all panels, with the low-resistance short bypass highlighted in red. |
| P1 | 1 | `Series and Parallel Circuit Comparison` before the comparison bullets | `series-parallel-comparison.py` / `.png` | Identical sources and loads showing a single path versus branches and current direction. |
| P1 | 4 | `Two-Branch Current Divider` before the current-divider formula | `two-branch-current-divider.py` / `.png` | 10 mA source, 1 kΩ and 2 kΩ branches, calculated branch currents, shared nodes, and current sum. |
| P1 | 4 | `Battery EMF and Internal Resistance Model` before the terminal-voltage equation | `battery-internal-resistance-model.py` / `.png` | Ideal 9 V EMF plus 2 Ω internal resistance, a load, terminals, current, and open/loaded readings. |
| P1 | 5 | `Source-Path-Load Circuit System` before the system-role list | `source-path-load-system.py` / `.png` | Battery, control/path, resistor-plus-LED load, return, and energy/current direction. |
| P1 | 13 | `NPN Low-Side and PNP High-Side Switches` before the comparison table | `npn-pnp-switches.py` / `.png` | Matched transistor switches with base resistors, terminal labels, load-current arrows, and control polarity. |
| P1 | 18 | `Common-Cathode and Common-Anode RGB LED Wiring` before the comparison table | `rgb-common-lead-wiring.py` / `.png` | Shared lead, three individually resisted channels, and opposite HIGH/LOW drive behavior. |
| P1 | 19 | `Series and Parallel LED Wiring` before the series-voltage equation | `series-parallel-led-wiring.py` / `.png` | One-resistor series string versus per-branch resistors, current arrows, and open-failure behavior. |
| P1 | 23 | `Linear, Buck, and Boost Regulator Topologies` before the efficiency discussion | `regulator-topologies.py` / `.png` | Simplified pass-element, buck, and boost power stages with voltage relationships and key parts labeled. |
| P1 | 25 | `Transistor NOT, NAND, and NOR Gates` before the logic-level explanation | `transistor-not-nand-nor.py` / `.png` | Complete NPN inverter and block-level AND/OR plus inversion derivations. |
| P1 | 25 | `Cross-Coupled NAND RS Latch` before the state table | `cross-coupled-nand-rs-latch.py` / `.png` | Active-low Set/Reset, Q/Q-bar, and two unmistakable orthogonal feedback paths. |
| P2 | 2 | `LED Forward Voltage and Current-Limiting Resistor` in the forward-voltage section | `led-forward-voltage-path.py` / `.png` | 5 V source, 330 Ω resistor, red LED, voltage allocation, A/K polarity, and current. |
| P2 | 3 | `Fuse and Reverse-Polarity Protection Circuits` between overcurrent and polarity sections | `fuse-reverse-polarity-protection.py` / `.png` | Source-adjacent fuse and fused series Schottky protection with correct current direction. |
| P2 | 8 | `Power-to-Load Troubleshooting Test Points` before the power-on checklist | `power-to-load-test-points.py` / `.png` | Numbered TP1–TP5 readings progressing from supply through switch, resistor, LED, and ground. |
| P2 | 11 | `Rheostat and Thermistor Control Circuits` before the application bullets | `rheostat-thermistor-circuits.py` / `.png` | Wiper-to-end safe rheostat wiring and an NTC divider with temperature/output behavior. |
| P2 | 12 | `Potentiometer as an Adjustable Voltage Divider` before the taper section | `potentiometer-voltage-divider.py` / `.png` | All three terminals, two track sections, and an adjustable 0–5 V wiper output. |
| P2 | 19 | `Active and Passive Buzzer Driver Circuits` before the buzzer comparison | `active-passive-buzzer-drivers.py` / `.png` | Vertical top/bottom buzzer connections, switched DC active buzzer, and square-wave passive piezo. |
| P2 | 21 | `Healthy, Open, and Shorted Circuit Measurements` before the reading table | `healthy-open-shorted-measurements.py` / `.png` | One reference topology with consistent test points, substituted faults, predicted voltages, and currents. |
| P2 | 23 | `Solar Cells in Series and Parallel` immediately after the safe charging schematic | `solar-cells-series-parallel.py` / `.png` | Matched cells showing series voltage addition and parallel current-capacity addition. |
| P2 | 26 | `RC Timer, 555 Oscillator, and Signal Generator` before the terminology table | `timing-circuit-families.py` / `.png` | Three simplified families connecting a one-shot RC transition to continuous and controllable oscillation. |

## Shared implementation support

Added `docs/schematic_utils.py` for consistent non-GUI rendering, textbook colors, explicitly routed wires, arrows, junctions, grounds, text placement, and command-line PNG/SVG output. Each chapter program remains self-contained at the topology level and imports only these presentation helpers.

## Technical and safety review

- Kept all teaching circuits in the book's low-voltage context.
- Used a source-adjacent fuse and a forward series Schottky diode for the simple reverse-polarity example. This matches Texas Instruments' *Basics of Ideal Diodes*, which describes a series diode as the simplest reverse-battery protection method and notes its forward-loss tradeoff.
- Used conventional nonsynchronous buck and boost arrangements: buck switch node to inductor/output with a ground-referenced catch diode, and boost input through the inductor to a switch node with a diode to the output. These match TI's published power-topology tutorials.
- Preserved the existing safe solar-controller diagram and placed the new cell-combination comparison immediately after it.

References consulted:

- <https://www.ti.com/lit/an/slvae57b/slvae57b.pdf>
- <https://www.ti.com/video/5028006390001>
- <https://www.ti.com/video/series/designing-flyback-dc-dc-converter.html>

## Verification

- Compiled every Python source with the isolated Schemdraw environment.
- Rendered all 24 PNGs at 180 dpi.
- Ran `skills/draw-schemdraw-circuit/scripts/validate_diagram.py` against every source/image pair: **24 of 24 passed**.
- Visually inspected all 24 images, including a second cleanup pass for label collisions, clipped annotations, remote-capacitor routing, transistor layout, RGB headings, LED labels, latch feedback, and timing-family spacing.
- Confirmed a one-to-one relationship among the 24 chapter Markdown references, PNGs, and Python sources.
- Ran `git diff --check`: **passed**.
- Ran `mkdocs build`: **passed**. The command reports existing unrelated nav/link warnings in learning-graph, kit, lab, and simulation content; no warning references any new schematic or edited chapter figure.

## TODO status

All P0, P1, and P2 static circuit-diagram entries are checked. The only remaining unchecked entry is the P3 Chapter 16 debounce-capacitor MicroSim.
