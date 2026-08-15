#!/usr/bin/env python3
"""Render NPN low-side and PNP high-side transistor switches.

Prompt:
    Draw matched side-by-side transistor switch circuits. NPN LOW-SIDE has a
    load from +5 V to the collector, emitter at ground, and an active-high
    control through a 1 kΩ base resistor. PNP HIGH-SIDE has emitter at +5 V,
    collector feeding a grounded load, and an active-low control through a
    1 kΩ base resistor. Label base, collector, emitter, control polarity, and
    conventional load-current arrows with uncluttered labels.

Topology: NPN +5V->load->C-Q1-E->GND; PNP +5V->E-Q2-C->load->GND. Each base is
driven through 1kΩ.
Assumptions: Generic small-signal BJTs and resistive loads.
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
    text(d, "NPN LOW-SIDE", (3.3, 7.6), color=BLUE, fontsize=12)
    q1 = d.add(elm.BjtNpn(circle=True).at((4.2, 2.5)))
    load1 = d.add(elm.Resistor().up().at(q1.collector).to((q1.collector[0], 5.8)))
    wire(d, load1.end, (load1.end[0], 6.3), color=RED)
    text(d, "+5 V", (load1.end[0], 6.75), color=RED)
    ground(d, q1.emitter)
    rb1 = d.add(elm.Resistor().right().at((0.6, q1.base[1])).to(q1.base))
    text(d, "HIGH = ON", (0.9, q1.base[1] + 0.65), color=BLUE, fontsize=9)
    text(d, "RB1 1 kΩ", (2.4, q1.base[1] - 0.55), fontsize=8)
    text(d, "LOAD", (5.35, 4.6))
    text(d, "C", (4.95, 3.4))
    text(d, "B", (3.45, 3.0))
    text(d, "E", (4.95, 1.55))
    arrow(d, (5.8, 5.7), (5.8, 3.1), color=BLUE)
    text(d, "PNP HIGH-SIDE", (10.3, 7.6), color=ORANGE, fontsize=12)
    q2 = d.add(elm.BjtPnp(circle=True).at((9.2, 5.0)))
    wire(d, q2.emitter, (q2.emitter[0], 6.3), color=RED)
    text(d, "+5 V", (q2.emitter[0], 6.75), color=RED)
    load2 = d.add(elm.Resistor().down().at(q2.collector).to((q2.collector[0], 1.4)))
    ground(d, load2.end)
    rb2 = d.add(elm.Resistor().right().at(q2.base).to((12.8, q2.base[1])))
    text(d, "LOW = ON", (12.1, q2.base[1] + 0.7), color=ORANGE, fontsize=9)
    text(d, "RB2 1 kΩ", (11.0, q2.base[1] - 0.55), fontsize=8)
    text(d, "LOAD", (8.0, 2.8))
    text(d, "E", (8.45, 6.0))
    text(d, "B", (9.95, 4.55))
    text(d, "C", (8.45, 3.95))
    arrow(d, (7.6, 5.2), (7.6, 2.0), color=ORANGE)
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
