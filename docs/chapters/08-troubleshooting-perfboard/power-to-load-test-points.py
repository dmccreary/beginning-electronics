#!/usr/bin/env python3
"""Render power-to-load troubleshooting test points.

Prompt:
    Draw a 5 V source, closed switch, 330 Ω resistor, LED, and ground as a
    simple working circuit. Number voltage test points TP1 through TP5 from
    source to ground, show the expected voltage at each, and include a ground
    reference probe so students troubleshoot progressively from power to load.

Topology: +5V->S1->R1=330Ω->D1 LED->GND; TP1..TP5 follow the signal path.
Assumptions: A red LED has about 2 V forward drop; all voltages reference TP5.
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
    dot,
    drawing,
    ground,
    save_cli,
    text,
    wire,
)


def tp(d, xy, label, value):
    dot(d, xy, open=True, color=BLUE)
    text(d, f"{label}\n{value}", (xy[0], xy[1] + 0.65), color=BLUE, fontsize=8.5)


def build_drawing():
    d = drawing()
    wire(d, (1, 5), (1.6, 5), color=RED)
    sw = d.add(elm.Switch(nc=True).right().at((1.6, 5)).to((3.3, 5)))
    r = d.add(elm.Resistor().right().at(sw.end).to((6.1, 5)))
    led = d.add(elm.LED().down().at((7.2, 5)).to((7.2, 1.6)).color(ORANGE))
    wire(d, r.end, led.start)
    ground(d, led.end)
    tp(d, (1, 5), "TP1", "5.0 V")
    tp(d, (3.3, 5), "TP2", "5.0 V")
    tp(d, (6.1, 5), "TP3", "≈2.0 V")
    tp(d, (7.2, 1.6), "TP4", "0 V")
    tp(d, (8.7, 1.6), "TP5", "GND reference")
    wire(d, (7.2, 1.6), (8.7, 1.6))
    text(d, "S1 closed", (2.45, 4.3))
    text(d, "R1 330 Ω", (4.7, 4.3))
    text(d, "D1 LED", (8.65, 3.65), color=ORANGE)
    text(
        d,
        "Measure in order: TP1 → TP2 → TP3 → TP4",
        (4.7, 0.55),
        color=GREEN,
        fontsize=10,
    )
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
