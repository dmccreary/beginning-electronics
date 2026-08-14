# Step 5: Concept Taxonomy

## Overview

This taxonomy organizes the 500 concepts into 10 balanced categories to facilitate navigation, color-coded graph visualization, and curriculum planning. The categories are the same 10 groupings used when the concept list was generated (see [Concept Enumeration](step-02-concepts.md)), now formalized with short TaxonomyID codes for use in the dependency CSV and JSON graph. No category exceeds 30% of the total — see the full per-category concept listing and balance analysis in the [Taxonomy Distribution Report](step-07-distribution-report.md).

## Taxonomy Categories

| TaxonomyID | Category Name | Description | Actual % |
|------------|---------------|-------------|----------|
| FOUND | Foundational Concepts | Core electrical theory: voltage, current, resistance, power, circuit topology, units, and safety — the vocabulary every later topic depends on | 19.0% |
| PASV | Passive Components | Resistors, capacitors, diodes, LEDs, and potentiometers — components that don't switch or amplify on their own | 15.0% |
| ACTV | Active Components & ICs | Transistors (BC547/2N2222), the 555 timer IC, and the 74HC595 shift register, including pin-level detail | 12.6% |
| BRDG | Breadboarding & Assembly | Hands-on skills for wiring a solderless breadboard, troubleshooting, and the optional perfboard/solder packaging step | 11.6% |
| INPT | Input Components | Switches, buttons, wired AND/OR switch logic, and light sensing (photoresistor, dark detector) | 8.0% |
| OUTP | Output Components | LEDs, RGB color mixing, LED strips, motors, and buzzers — anything a circuit uses to produce an effect | 8.0% |
| PWR | Power Systems | Batteries, USB power, voltage regulators, buck converters, the XR2206 signal generator, and solar cells | 8.0% |
| MEAS | Measurement & Testing | Using a multimeter and systematic troubleshooting procedures | 7.6% |
| DLOG | Digital Logic & Boolean | Boolean reasoning and building AND/OR/NOT/NAND/NOR/XOR gates from transistors, plus a simple RS latch | 6.0% |
| CAPS | Advanced Circuits & Capstone Projects | Timing/memory circuits and named real-world projects (busy board, solar night light, LED noodle), culminating in capstone planning | 4.2% |

## Design Notes

- **Category order doubles as a dependency safeguard.** Every concept's dependencies were required to reference only concept IDs *lower* than its own ID (IDs 1-500 were assigned in this same category order). This guarantees the dependency graph is a valid DAG by construction — no separate cycle-repair pass was needed, and `analyze-graph.py` confirmed zero cycles and zero self-dependencies (see [Graph Quality Analysis](step-04-quality-analysis.md)).
- **Category order is a concept-knowledge order, not a strict lesson-teaching order.** For example, Output Components (LEDs, motors) are ID-numbered after Active Components (transistors) because some output-driving concepts genuinely need transistor knowledge — but individual concepts like "Light Emitting Diode" still resolve to a *shallow* position in the actual dependency graph (few, foundational prerequisites), so the graph-viewer's computed levels — not the raw category order — are what determine pedagogical sequencing for chapter planning.
- **taxonomy-names.json** maps each TaxonomyID to its human-readable name for the graph viewer legend, and **color-config.json** assigns each a distinct named CSS color from the recommended palette (see [learning-graph.json](learning-graph.json)).

Full concept listings for each category are in [Concept Enumeration](step-02-concepts.md) (by topic) and [Taxonomy Distribution Report](step-07-distribution-report.md) (by taxonomy, with balance analysis).
