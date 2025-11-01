# Learning Graph Quality Analysis Report

## Graph Statistics

- **Total Nodes**: 200
- **Total Edges**: 268
- **Average Edges per Node**: 1.34
- **Root Nodes** (no dependencies): 6
- **Leaf Nodes** (no dependents): 121
- **Orphaned Nodes** (isolated): 0

## Root Nodes (Foundation Concepts)

- Boolean Logic
- Component Lead
- Electric Current
- Multimeter
- Resistance
- Voltage
## Orphaned Nodes

No orphaned nodes. ✓

## Cycles Detected

No cycles detected. Graph is a valid DAG. ✓

## Connected Components

- **Number of Components**: 1

Graph is fully connected. ✓

## In-Degree Distribution

| In-Degree | Node Count |
|-----------|------------|
| 0 | 121 |
| 1 | 31 |
| 2 | 24 |
| 3 | 4 |
| 4 | 4 |
| 5 | 3 |
| 6 | 2 |
| 7 | 1 |
| 9 | 3 |
| 10 | 1 |
| 11 | 3 |
| 13 | 1 |
| 20 | 1 |
| 24 | 1 |

## Most Depended-Upon Concepts (High In-Degree)

| Concept | Dependents |
|---------|------------|
| Voltage | 24 |
| Electric Current | 20 |
| Resistor | 13 |
| Circuit | 11 |
| Polarity | 11 |
| Component Lead | 11 |
| Transistor | 10 |
| Capacitor | 9 |
| Solderless Breadboard | 9 |
| Multimeter | 9 |
| Boolean Logic | 7 |
| Light Emitting Diode | 6 |
| Digital Input | 6 |
| Voltage Regulator | 5 |
| Resistance | 5 |

## Depth Distribution

| Depth | Node Count |
|-------|------------|
| 0 | 6 |
| 1 | 43 |
| 2 | 62 |
| 3 | 46 |
| 4 | 23 |
| 5 | 15 |
| 6 | 5 |

**Maximum Depth**: 6

## Overall Assessment

✓ **PASS**: Graph is a valid, connected DAG with no orphaned nodes.
