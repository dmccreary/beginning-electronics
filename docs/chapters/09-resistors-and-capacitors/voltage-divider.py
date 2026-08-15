#!/usr/bin/env python3
"""Render a 5 V voltage divider made from two equal 10 kΩ resistors.

Prompt:
    Draw a voltage-divider circuit with 5 V at the top and ground at the
    bottom. Put two vertically oriented 10 kΩ resistors in series, add a
    center tap labeled 2.5 V, and leave a small clear space between each
    resistor label and its symbol.

Topology: 5 V -> R1 (10 kΩ) -> Vout (2.5 V) -> R2 (10 kΩ) -> GND.
Assumptions: the center tap is unloaded, so equal resistors divide 5 V in half.
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
    """Build and return the voltage-divider schematic."""
    drawing = schemdraw.Drawing(show=False)
    drawing.config(unit=3.0, fontsize=13, lw=1.8)

    # Supply terminal and upper resistor.
    drawing += elm.Dot().label("5 V", loc="top")
    drawing += elm.Line().down().length(0.6)
    drawing += elm.Resistor().down()

    # Midpoint output tap. Three conductors meet at this junction.
    drawing += elm.Dot()
    with drawing.hold():
        drawing += elm.Line().right().length(1.5).label("2.5 V", loc="right")

    # Lower resistor and ground reference.
    drawing += elm.Resistor().down()
    drawing += elm.Line().down().length(0.6)
    drawing += elm.Ground()

    # Place compact labels beside the geometric center of each resistor.
    drawing.add(elm.Label("R1\n10 kΩ").at((-1.15, -2.1)))
    drawing.add(elm.Label("R2\n10 kΩ").at((-1.15, -5.1)))

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
