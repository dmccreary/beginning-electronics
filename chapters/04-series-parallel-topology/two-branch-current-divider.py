#!/usr/bin/env python3
"""Render a two-branch current divider.

Prompt:
    Draw a 10 mA current source feeding two parallel resistors, R1=1 kΩ and
    R2=2 kΩ, between common input and return nodes. Label source current,
    branch currents I1 and I2, their directions, and I_TOTAL = I1 + I2. Show
    the approximate branch values 6.67 mA and 3.33 mA.

Topology: 10mA source feeds node IN; R1 and R2 connect from IN to RETURN.
Assumptions: Ideal source and nominal resistor values.
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
import schemdraw.elements as elm
from docs.schematic_utils import (
    BLUE,
    GREEN,
    INK,
    RED,
    arrow,
    dot,
    drawing,
    ground,
    save_cli,
    text,
    wire,
)


def build_drawing():
    d = drawing()
    src = d.add(elm.SourceI().up().at((1.2, 1.2)).to((1.2, 5.8)).color(RED))
    wire(d, src.end, (8.2, 5.8), color=RED)
    wire(d, src.start, (8.2, 1.2))
    ground(d, src.start)
    r1 = d.add(elm.Resistor().down().at((4, 5.8)).to((4, 1.2)))
    r2 = d.add(elm.Resistor().down().at((7, 5.8)).to((7, 1.2)))
    for p in [(4, 5.8), (7, 5.8), (4, 1.2), (7, 1.2)]:
        dot(d, p)
    text(d, "I_TOTAL\n10 mA", (0.15, 3.5), color=RED, fontsize=9)
    text(d, "COMMON INPUT NODE", (5.6, 6.55), color=RED, fontsize=10)
    text(d, "COMMON RETURN NODE", (5.6, 0.45), fontsize=10)
    text(d, "R1  1 kΩ", (3.15, 3.5))
    text(d, "R2  2 kΩ", (7.85, 3.5))
    arrow(d, (4.65, 5.25), (4.65, 2.0), color=BLUE)
    arrow(d, (6.35, 5.25), (6.35, 2.0), color=GREEN)
    text(d, "I1 ≈ 6.67 mA", (3.3, 1.75), color=BLUE, fontsize=9)
    text(d, "I2 ≈ 3.33 mA", (7.65, 1.75), color=GREEN, fontsize=9)
    text(d, "I_TOTAL = I1 + I2", (5.5, 7.25), fontsize=11)
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
