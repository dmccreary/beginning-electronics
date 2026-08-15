# Schemdraw program and layout patterns

Use these patterns as guardrails, then adapt them to the requested topology. Schemdraw's current documented `Drawing` accepts `show=False`; the Matplotlib backend supports SVG and raster exports.

## Required program contract

Write a standalone script with a `build_drawing()` function and a positional output argument. Render through the Matplotlib backend so the identical program can produce the primary SVG and the PNG inspection copy.

```python
#!/usr/bin/env python3
"""Render the described circuit.

Prompt:
    <Complete canonical description of the circuit currently requested,
    including all active revisions and presentation requirements.>

Topology: <one concise netlist-like summary>.
Assumptions: <state any inferred electrical details, or "none">.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import schemdraw
import schemdraw.elements as elm

schemdraw.use("matplotlib")


def build_drawing() -> schemdraw.Drawing:
    drawing = schemdraw.Drawing(show=False)
    drawing.config(unit=3.0, fontsize=12, lw=1.8)

    # Add the circuit here. Prefer explicit `drawing += ...` statements.

    return drawing


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="Output .svg or .png path")
    args = parser.parse_args()
    if args.output.suffix.lower() not in {".svg", ".png"}:
        parser.error("output must end in .svg or .png")
    args.output.parent.mkdir(parents=True, exist_ok=True)

    drawing = build_drawing()
    drawing.save(
        args.output,
        transparent=args.output.suffix.lower() == ".svg",
        dpi=180,
    )


if __name__ == "__main__":
    main()
```

## Prompt synchronization rule

Treat the `Prompt:` block in the first module docstring as the source program's human-readable contract. Write it as a self-contained description of the circuit that should be rendered now. Include topology, component values, important labels, orientation, and user-requested presentation details.

After every user revision, update this block before modifying the implementation. Fold the revision into one canonical prompt; do not append a chat history. Remove requirements that the user replaced or reversed. Before delivery, compare the prompt, Python implementation, and rendered image in both directions: every prompt requirement must appear in the implementation and image, and every material circuit or presentation choice in the implementation must be represented in the prompt or `Assumptions:` block.

## Topology-first planning

Before coding, reduce prose to nets. Example: “A 9 V source feeds R1=1 kΩ, then node OUT; C1=1 µF connects OUT to ground” becomes:

```text
VCC: V1+ — R1.1
OUT: R1.2 — C1.1 — output terminal
GND: C1.2 — V1-
```

This prevents a visually plausible but electrically wrong drawing. Use one `elm.Dot()` per multiway junction. A bend does not need a dot unless it is also a branch. At a crossing, route around the other wire or use an explicit crossover/gap so the connection intent is unmistakable.

## Layout selection

- Use left-to-right flow for signal chains, filters, amplifiers, and logic.
- Use a vertical source at the left and a return rail below for simple closed-loop instructional circuits.
- Use top supply and bottom ground conventions for transistor and op-amp circuits.
- Align parallel branches on a simple orthogonal grid. Make branches long enough that symbols and labels cannot collide.
- Prefer anchors, `.at(...)`, `.tox(...)`, and `.toy(...)` to guessed line lengths when closing branches.
- Store important elements: `source = drawing.add(...)`, then connect to `source.start`, `source.end`, or device-specific anchors.
- Use `with drawing.hold():` for a temporary branch when supported; otherwise pair every `push()` with one `pop()`.

## Core patterns

### Simple closed series loop

```python
source = drawing.add(elm.SourceV().up().label("V1\n9 V"))
drawing += elm.Line().right().length(1).at(source.end)
drawing += elm.Resistor().right().label("R1  1 kΩ")
drawing += elm.Capacitor().down().label("C1  1 µF")
drawing += elm.Line().left().tox(source.start)
drawing += elm.Ground()
```

Ensure the final cursor actually reaches `source.start`; avoid redundant zero-length lines.

### Shunt branch and output

```python
drawing += elm.Resistor().right().label("R1  1 kΩ")
out_node = drawing.add(elm.Dot())
with drawing.hold():
    drawing += elm.Capacitor().down().label("C1  100 nF")
    drawing += elm.Ground()
drawing += elm.Line().right().length(1.2).label("Vout", loc="right")
```

Use the dot because three conductors meet at `out_node`. Keep an output stub short and clearly terminal-like.

### Parallel branches

Save the split coordinate, draw each branch from it, and terminate both branches at the same merge coordinate. Add dots at split and merge when three or more conductors meet. Prefer `.at(split.end)` and `.toy(merge_point)` over cursor-state tricks for nontrivial networks.

### Multi-terminal devices

Place the device first, store it, then wire to named anchors such as `opamp.in1`, `opamp.in2`, `opamp.out`, `transistor.base`, `transistor.collector`, and `transistor.emitter`. Confirm anchor names with `help(type(element))`, `element.anchors`, or the official documentation for the installed version.

## Labels and styling

- Give each component a unique conventional designator: R1, C1, L1, D1, Q1, U1, V1, and so on.
- Put the designator and value together; split long labels with `\n`.
- Let Schemdraw choose label placement first. Specify `loc` only after visual inspection shows a need.
- Use one font size and line width throughout. Use color only when it conveys meaning requested by the user.
- Keep annotations outside wires and symbols. Avoid titles inside the schematic canvas unless requested.

## Quality traps

- `push()`/`pop()` restores the cursor; it does not create a wire or merge nets.
- Two wire endpoints at different coordinates are disconnected even if they look close.
- A ground symbol labels a reference net; scattering unrelated grounds can hide an unintended missing return path.
- A line crossing another line is visually ambiguous unless connection intent is explicit.
- A successful Python process proves only renderability, not correct topology.
- Export SVG and PNG from the same `build_drawing()` function; never maintain two circuit implementations.
