# Learning Graph for Beginning Electronics

## Overview

This learning graph represents a comprehensive knowledge structure for the Beginning Electronics course, mapping 200 interconnected concepts with their dependencies and categorical organization.

## Purpose

The learning graph serves as foundational infrastructure for an intelligent textbook that supports:

- **Personalized Learning Pathways**: Students can navigate concepts based on their current knowledge
- **Prerequisite Tracking**: Clear visualization of concept dependencies
- **Progress Monitoring**: Track mastery of concepts across the curriculum
- **Adaptive Content**: Customize learning experiences based on student needs

## Graph Statistics

- **Total Concepts**: 200
- **Total Dependencies**: 268
- **Root Concepts**: 6 (foundation concepts with no prerequisites)
- **Maximum Depth**: 6 levels
- **Taxonomy Categories**: 9

## Files

### Core Data Files

- **concepts-dependencies.csv** - Original two-column CSV (Concept, Dependency)
- **concepts-with-taxonomy.csv** - Enhanced CSV with taxonomy IDs (Concept, Dependency, TaxonomyID)
- **learning-graph.json** - vis.js network format for visualization

### Analysis and Reports

- **step-01-course-assessment.md** - Course description quality analysis
- **step-02-concepts.md** - Complete list of 200 concepts with categorization
- **step-04-quality-analysis.md** - Graph validation report (cycles, orphans, connectivity)
- **step-05-taxonomy.md** - Taxonomy structure and category definitions
- **step-07-distribution-report.md** - Taxonomy balance analysis

### Python Scripts

- **csv-to-json.py** - Convert CSV to vis.js JSON format
- **analyze-graph.py** - Validate graph quality (DAG, connectivity, cycles)
- **add-taxonomy.py** - Add taxonomy IDs to concept CSV
- **taxonomy-distribution.py** - Generate category distribution report

## Taxonomy Categories

| ID | Category | Count | Percentage | Description |
|----|----------|-------|------------|-------------|
| FUND | Fundamentals | 40 | 20.0% | Core electrical concepts and laws |
| PASS | Passive Components | 30 | 15.0% | Resistors, capacitors, diodes |
| IO | Input/Output | 30 | 15.0% | Sensors, buttons, LEDs, motors |
| ACT | Active Components | 25 | 12.5% | Transistors and integrated circuits |
| BREAD | Breadboarding | 25 | 12.5% | Prototyping and circuit construction |
| MEAS | Measurement | 15 | 7.5% | Testing, debugging, multimeter use |
| PWR | Power Systems | 15 | 7.5% | Power supplies, regulation, efficiency |
| DIG | Digital Logic | 12 | 6.0% | Boolean logic, gates, truth tables |
| ADV | Advanced Circuits | 8 | 4.0% | Complex projects and applications |

## Foundation Concepts (Root Nodes)

These 6 concepts have no prerequisites and form the foundation of the curriculum:

1. **Boolean Logic** - Basis for digital logic concepts
2. **Component Lead** - Physical structure of components
3. **Electric Current** - Fundamental electrical phenomenon
4. **Multimeter** - Essential measurement tool
5. **Resistance** - Opposition to current flow
6. **Voltage** - Electrical potential difference

## Most Central Concepts (High In-Degree)

These concepts are depended upon by many other concepts:

1. **Voltage** - 24 dependents
2. **Electric Current** - 20 dependents
3. **Resistor** - 13 dependents
4. **Circuit** - 11 dependents
5. **Polarity** - 11 dependents
6. **Component Lead** - 11 dependents
7. **Transistor** - 10 dependents

## Graph Quality

✓ **Valid DAG**: No cycles detected

✓ **Fully Connected**: Single connected component

✓ **No Orphans**: All concepts integrated into graph

✓ **Balanced Distribution**: All categories < 30%

## Depth Distribution

| Depth Level | Concept Count | Description |
|-------------|---------------|-------------|
| 0 | 6 | Foundation concepts (no dependencies) |
| 1 | 43 | First-level concepts |
| 2 | 62 | Second-level concepts |
| 3 | 46 | Third-level concepts |
| 4 | 23 | Fourth-level concepts |
| 5 | 15 | Fifth-level concepts |
| 6 | 5 | Most advanced concepts |

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

The learning-graph.json file can be visualized using [vis.js](https://visjs.org/) or similar network visualization libraries. The JSON structure includes:

- **Nodes**: Each concept with ID, label, and depth level
- **Edges**: Directed edges showing dependencies (prerequisite → dependent concept)

## Course Alignment

This learning graph aligns with the Beginning Electronics course structure:

- **Bloom's Taxonomy**: Concepts progress from Remember/Understand through Create
- **Hands-On Focus**: Emphasis on practical breadboarding and testing skills
- **Low-Cost Components**: Focus on accessible, affordable parts
- **Interactive Learning**: Integration with MicroSims and simulations

## Maintenance

To update the learning graph:

1. Edit `concepts-dependencies.csv` to add/modify concepts
2. Run `python3 csv-to-json.py` to regenerate JSON
3. Run `python3 analyze-graph.py` to validate quality
4. Run `python3 add-taxonomy.py` to update taxonomy assignments
5. Run `python3 taxonomy-distribution.py` to check balance

## References

- **Course Site**: [Beginning Electronics](https://dmccreary.github.io/beginning-electronics/)
- **Learning Graphs Repository**: [dmccreary/learning-graphs](https://github.com/dmccreary/learning-graphs)
- **Visualization Library**: [vis.js Network](https://visjs.github.io/vis-network/docs/network/)

## Contact

For questions about the learning graph structure or usage, see the main course [contact page](../contact.md).

---

*Generated using the learning-graph-generator skill*
*Last updated: 2025-10-31*
