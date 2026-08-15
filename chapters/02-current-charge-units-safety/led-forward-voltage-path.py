#!/usr/bin/env python3
"""Render an LED forward-voltage and current-limiting path.

Prompt:
    Draw a 5 V source, 330 Ω current-limiting resistor, and red LED in one
    complete series loop. Label source voltage, approximate resistor drop,
    LED forward voltage VF≈2 V, LED anode and cathode, ground, conventional
    current direction, and explain that the resistor controls current.

Topology: +5V->R1=330Ω->D1 LED anode->cathode->GND.
Assumptions: Red LED VF is approximately 2 V at about 9 mA.
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
import schemdraw.elements as elm
from docs.schematic_utils import (
    BLUE,
    GREEN,
    INK,
    ORANGE,
    RED,
    arrow,
    drawing,
    ground,
    save_cli,
    text,
    wire,
)


def build_drawing():
    d = drawing()
    wire(d, (1, 6.3), (1, 5.7), color=RED)
    text(d, "+5 V", (1, 6.75), color=RED, fontsize=12)
    r = d.add(elm.Resistor().right().at((1, 5.7)).to((4.4, 5.7)))
    led = d.add(elm.LED().down().at((4.4, 5.7)).to((4.4, 2.0)).color(ORANGE))
    ground(d, led.end)
    text(d, "R1  330 Ω", (2.7, 6.35), fontsize=10)
    text(d, "VR ≈ 3 V", (2.15, 4.9), color=BLUE, fontsize=9)
    text(d, "D1 red LED", (5.75, 4.55), color=ORANGE, fontsize=10)
    text(d, "VF ≈ 2 V", (5.75, 3.75), color=ORANGE, fontsize=10)
    text(d, "ANODE (A)", (5.65, 5.25), color=GREEN, fontsize=8)
    text(d, "CATHODE (K)", (3.15, 2.55), color=GREEN, fontsize=8)
    arrow(d, (1.2, 7.35), (4.2, 7.35), color=BLUE)
    text(d, "I ≈ 9 mA", (2.7, 7.85), color=BLUE, fontsize=10)
    text(
        d,
        "The resistor absorbs the extra voltage and limits current.",
        (3.2, 0.75),
        fontsize=9,
    )
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
