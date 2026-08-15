#!/usr/bin/env python3
"""Render a potentiometer used as an adjustable voltage divider.

Prompt:
    Draw a 10 kΩ potentiometer with its two end terminals connected across
    +5 V and ground and its wiper producing VOUT. Label terminals 1, 2, and 3,
    identify terminal 2 as the moving wiper, show the two resistance sections
    on either side of the wiper, and indicate that VOUT varies continuously
    from 0 to 5 V as the wiper moves. Use a vertical divider and a horizontal
    output lead with clear spacing.

Topology: terminal3->+5V; terminal1->GND; terminal2(wiper)->VOUT.
Assumptions: The potentiometer is linear taper and 10 kΩ total.
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
    pot = d.add(elm.Potentiometer().down().at((5.0, 7.0)).to((5.0, 1.5)).color(BLUE))
    wire(d, pot.start, (5.0, 7.45), color=RED)
    text(d, "+5 V", (5.0, 7.85), color=RED, fontsize=12)
    ground(d, pot.end)
    wire(d, pot.tap, (8.0, pot.tap[1]), color=GREEN)
    dot(d, (8.0, pot.tap[1]), open=True, color=GREEN)
    text(d, "VOUT\n0–5 V adjustable", (9.05, pot.tap[1]), color=GREEN, fontsize=10)
    text(d, "R3→2", (3.9, 5.65), color=BLUE, fontsize=9)
    text(d, "R2→1", (3.9, 3.0), color=BLUE, fontsize=9)
    text(d, "terminal 3\nupper end", (6.1, 6.85), fontsize=9)
    text(d, "terminal 2\nWIPER", (6.9, pot.tap[1] + 0.65), color=GREEN, fontsize=9)
    text(d, "terminal 1\nlower end", (6.1, 1.85), fontsize=9)
    text(d, "P1  10 kΩ linear potentiometer", (5.0, 0.65), color=BLUE, fontsize=11)
    arrow(d, (7.3, pot.tap[1] + 1.35), (7.3, pot.tap[1] + 0.8), color=GREEN)
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
