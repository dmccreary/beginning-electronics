#!/usr/bin/env python3
"""Render a series and parallel circuit comparison.

Prompt:
    Draw side-by-side circuits with identical 6 V sources and two identical
    lamps. Put both lamps in one current path in the SERIES panel. Put the
    lamps on separate branches across the source in the PARALLEL panel. Label
    current arrows, the single path, branch currents, and the common nodes.

Topology: series source->L1->L2->return; parallel source->(L1 || L2)->return.
Assumptions: Both lamps are identical resistive teaching loads.
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
    save_cli,
    text,
    wire,
)


def build_drawing():
    d = drawing()
    text(d, "SERIES: ONE PATH", (3.2, 7.1), color=BLUE, fontsize=12)
    b = d.add(elm.BatteryCell().up().at((0.8, 1.4)).to((0.8, 5.2)))
    l1 = d.add(elm.Lamp2().right().at((2.0, 5.2)).to((4.0, 5.2)))
    l2 = d.add(elm.Lamp2().down().at((5.2, 5.2)).to((5.2, 1.4)))
    wire(d, b.end, l1.start, color=RED)
    wire(d, l1.end, l2.start)
    wire(d, l2.end, b.start)
    text(d, "6 V", (0.3, 3.3))
    text(d, "L1", (3.0, 4.45))
    text(d, "L2", (5.8, 3.3))
    arrow(d, (1.2, 6), (4.7, 6), color=BLUE)
    text(d, "same current I everywhere", (3.0, 0.55), color=BLUE, fontsize=9)
    text(d, "PARALLEL: TWO BRANCHES", (10.5, 7.1), color=GREEN, fontsize=12)
    b2 = d.add(elm.BatteryCell().up().at((7.7, 1.4)).to((7.7, 5.2)))
    wire(d, b2.end, (13.4, 5.2), color=RED)
    wire(d, b2.start, (13.4, 1.4))
    dot(d, (9, 5.2))
    dot(d, (9, 1.4))
    dot(d, (12, 5.2))
    dot(d, (12, 1.4))
    p1 = d.add(elm.Lamp2().down().at((9, 5.2)).to((9, 1.4)))
    p2 = d.add(elm.Lamp2().down().at((12, 5.2)).to((12, 1.4)))
    text(d, "6 V", (7.2, 3.3))
    text(d, "L1", (9.6, 3.3))
    text(d, "L2", (12.6, 3.3))
    arrow(d, (8.5, 4.7), (8.5, 2.0), color=GREEN)
    arrow(d, (11.5, 4.7), (11.5, 2.0), color=GREEN)
    text(d, "I₁", (8.45, 3.3), color=GREEN)
    text(d, "I₂", (11.45, 3.3), color=GREEN)
    text(d, "common supply and return nodes", (10.5, 0.55), color=GREEN, fontsize=9)
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
