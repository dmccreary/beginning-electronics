#!/usr/bin/env python3
"""Render a source-path-load circuit system.

Prompt:
    Draw one complete circuit loop containing a 3 V battery source, a closed
    switch and wiring path, a 220 Ω current-limiting resistor and LED load,
    and the return path. Label SOURCE, CONTROL/PATH, LOAD, RETURN PATH, energy
    flow, and conventional-current direction.

Topology: 3V battery->closed switch->220Ω resistor->LED->battery return.
Assumptions: The LED forward voltage is suitable for the 3 V source.
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
    save_cli,
    text,
    wire,
)


def build_drawing():
    d = drawing()
    b = d.add(elm.BatteryCell().up().at((1, 1.5)).to((1, 5.2)).color(RED))
    sw = d.add(elm.Switch(nc=True).right().at(b.end).to((3.3, 5.2)))
    r = d.add(elm.Resistor().right().at(sw.end).to((6.2, 5.2)))
    led = d.add(elm.LED().down().at((7.5, 5.2)).to((7.5, 1.5)).color(ORANGE))
    wire(d, r.end, led.start)
    wire(d, led.end, b.start)
    text(d, "SOURCE\n3 V battery", (2.0, 3.35), color=RED, fontsize=9)
    text(
        d,
        "CONTROL / PATH\nclosed switch + conductors",
        (3.1, 6.2),
        color=BLUE,
        fontsize=9,
    )
    text(d, "LOAD\nR1 220 Ω + LED", (6.1, 3.35), color=ORANGE, fontsize=9)
    text(d, "RETURN PATH", (4.2, 0.85), color=GREEN, fontsize=9)
    arrow(d, (1.5, 6.8), (7, 6.8), color=BLUE)
    text(
        d,
        "conventional current and energy flow →",
        (4.25, 7.35),
        color=BLUE,
        fontsize=9,
    )
    arrow(d, (6.8, 0.7), (1.5, 0.7), color=GREEN)
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
