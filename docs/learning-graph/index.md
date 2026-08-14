# Learning Graph for Beginning Electronics

[Open Learning Graph Viewer Fullscreen](../sims/graph-viewer/main.html){ .md-button .md-button--primary }

<iframe src="../sims/graph-viewer/main.html" width="100%" height="600px" frameborder="0"></iframe>

## Overview

This learning graph represents a comprehensive knowledge structure for the Beginning Electronics course, mapping 500 interconnected concepts with their dependencies and categorical organization. It was regenerated in 2026 against a revised course description (5th-12th grade, $50 solderless-breadboard kit, no microcontrollers/programming) and then expanded from 200 to 500 concepts for maximum depth.

## Purpose

The learning graph serves as foundational infrastructure for an intelligent textbook that supports:

- **Personalized Learning Pathways**: Students can navigate concepts based on their current knowledge
- **Prerequisite Tracking**: Clear visualization of concept dependencies
- **Progress Monitoring**: Track mastery of concepts across the curriculum
- **Adaptive Content**: Customize learning experiences based on student needs

## Graph Statistics

- **Total Concepts**: 500
- **Total Dependencies (edges)**: 973
- **Average Dependencies per Concept**: 1.95
- **Root Concepts**: 7 (foundation concepts with no prerequisites)
- **Maximum Dependency Chain Length**: 19 concepts deep (18 levels)
- **Taxonomy Categories**: 10
- **Orphaned Nodes**: 0
- **Connected Components**: 1 (fully connected)

## Files

### Core Data Files

- **learning-graph.csv** - `ConceptID,ConceptLabel,Dependencies,TaxonomyID` (pipe-delimited dependency IDs)
- **learning-graph.json** - vis.js network format for visualization, includes metadata, groups, nodes, and edges
- **taxonomy-names.json** - Maps each TaxonomyID to its human-readable category name
- **color-config.json** - Maps each TaxonomyID to a distinct display color
- **metadata.json** - Title, description, creator, version, and license for the graph

### Analysis and Reports

- **step-01-course-assessment.md** - Course description quality analysis (score: 98/100)
- **step-02-concepts.md** - Complete list of 500 concepts with categorization
- **step-04-quality-analysis.md** - Graph validation report (cycles, orphans, connectivity)
- **step-05-taxonomy.md** - Taxonomy structure and category definitions
- **step-07-distribution-report.md** - Taxonomy balance analysis

### Python Scripts

- **csv-to-json.py** (v0.04) - Convert CSV to vis.js JSON format
- **analyze-graph.py** - Validate graph quality (DAG, connectivity, cycles)
- **add-taxonomy.py** - Add taxonomy IDs to concept CSV
- **taxonomy-distribution.py** - Generate category distribution report
- **validate-learning-graph.py** / **validate-learning-graph.sh** - Validate `learning-graph.json` against the schema

## Taxonomy Categories

| TaxonomyID | Category | Count | Percentage | Description |
|------------|----------|-------|------------|-------------|
| FOUND | Foundational Concepts | 95 | 19.0% | Core electrical theory, units, and safety |
| PASV | Passive Components | 75 | 15.0% | Resistors, capacitors, diodes, LEDs |
| ACTV | Active Components & ICs | 63 | 12.6% | Transistors, 555 timer, 74HC595 shift register |
| BRDG | Breadboarding & Assembly | 58 | 11.6% | Wiring skills, troubleshooting, optional perfboard packaging |
| INPT | Input Components | 40 | 8.0% | Switches, buttons, wired logic, light sensing |
| OUTP | Output Components | 40 | 8.0% | LEDs, RGB mixing, motors, buzzers |
| PWR | Power Systems | 40 | 8.0% | Batteries, regulators, buck converters, solar |
| MEAS | Measurement & Testing | 38 | 7.6% | Multimeter use, systematic troubleshooting |
| DLOG | Digital Logic & Boolean | 30 | 6.0% | Transistor-built logic gates, RS latch |
| CAPS | Advanced Circuits & Capstone Projects | 21 | 4.2% | Timing/memory circuits, named real-world projects, capstone planning |

## Foundation Concepts (Root Nodes)

These 7 concepts have no prerequisites and form the foundation of the curriculum:

1. **Electric Current** - Fundamental electrical phenomenon
2. **Voltage** - Electrical potential difference
3. **Resistance** - Opposition to current flow
4. **Circuit** - A closed path for current to flow
5. **Ground** - The reference point for a circuit
6. **Component Lead** - Physical structure of components
7. **Electric Charge** - The underlying property that creates current and voltage

## Most Central Concepts (High In-Degree)

These concepts are depended upon by many other concepts:

1. **Voltage** - 29 dependents
2. **Electric Current** - 28 dependents
3. **Resistance** - 23 dependents
4. **Resistor** - 20 dependents
5. **Capacitor** - 20 dependents
6. **Diode** - 19 dependents
7. **Circuit** - 17 dependents
8. **Push Button** - 16 dependents
9. **Transistor** - 14 dependents
10. **Light Emitting Diode** - 14 dependents

## Graph Quality

✓ **Valid DAG**: No cycles detected, no self-dependencies

✓ **Fully Connected**: Single connected component

✓ **No Orphans**: All 500 concepts integrated into the graph

✓ **Balanced Distribution**: All 10 categories under the 30% threshold (range: 4.2%-19.0%)

## Depth Distribution

| Level | Concept Count | Description |
|-------|---------------|--------------|
| 0 | 7 | Foundation concepts (no dependencies) |
| 1 | 24 | First-level concepts |
| 2 | 55 | Second-level concepts |
| 3 | 75 | Third-level concepts |
| 4 | 54 | Fourth-level concepts |
| 5 | 61 | Fifth-level concepts |
| 6 | 49 | Sixth-level concepts |
| 7 | 61 | Seventh-level concepts |
| 8 | 39 | Eighth-level concepts |
| 9 | 29 | Ninth-level concepts |
| 10 | 21 | Tenth-level concepts |
| 11-18 | 25 | Deepest, most advanced/integrative concepts (capstone-adjacent) |

## Using the Learning Graph

### For Students

The learning graph helps you:

- Understand what concepts you need to master first
- See how concepts build upon each other
- Track your progress through the curriculum
- Find gaps in your knowledge

### For Instructors

The learning graph enables you to:

- Design optimal learning sequences
- Identify prerequisite knowledge for each lesson
- Create customized learning paths for different students
- Assess student readiness for advanced topics

### For Developers

The graph data can be used to:

- Build interactive visualization tools
- Create adaptive learning systems
- Generate personalized study plans
- Track learning analytics

## Visualization

The `learning-graph.json` file can be visualized using [vis.js](https://visjs.org/) or similar network visualization libraries. The JSON structure includes:

- **Nodes**: Each concept with ID, label, and group (TaxonomyID)
- **Edges**: Directed edges showing dependencies (prerequisite → dependent concept)
- **Groups**: Taxonomy categories with `classifierName` and display `color`

To install an interactive graph-viewer MicroSim for this data, run the `book-installer` skill's "install learning graph viewer" guide.

## Course Alignment

This learning graph aligns with the Beginning Electronics course structure:

- **Bloom's Taxonomy**: Concepts progress from Remember/Understand through Create
- **Hands-On Focus**: Emphasis on practical breadboarding and testing skills
- **$50 Kit, No Soldering Required**: Focus on accessible, affordable, solderless parts
- **No Microcontrollers or Programming**: Complements the companion [Learning MicroPython and Physical Computing](https://dmccreary.github.io/learning-micropython/) course
- **Interactive Learning**: Integration with MicroSims and simulations

## Maintenance

To update the learning graph:

1. Edit `learning-graph.csv` to add/modify concepts (columns: `ConceptID,ConceptLabel,Dependencies,TaxonomyID`)
2. Run `python3 analyze-graph.py learning-graph.csv step-04-quality-analysis.md` to validate quality
3. Run `python3 taxonomy-distribution.py learning-graph.csv step-07-distribution-report.md taxonomy-names.json` to check balance
4. Run `python3 csv-to-json.py learning-graph.csv learning-graph.json color-config.json metadata.json taxonomy-names.json` to regenerate the JSON
5. Run `./validate-learning-graph.sh learning-graph.json` to validate against the schema

## References

- **Course Site**: [Beginning Electronics](https://dmccreary.github.io/beginning-electronics/)
- **Learning Graphs Repository**: [dmccreary/learning-graphs](https://github.com/dmccreary/learning-graphs)
- **Visualization Library**: [vis.js Network](https://visjs.github.io/vis-network/docs/network/)

## Contact

For questions about the learning graph structure or usage, see the main course [contact page](../contact.md).

---

*Generated using the learning-graph-generator skill (v0.05)*
*Last updated: 2026-08-14*
