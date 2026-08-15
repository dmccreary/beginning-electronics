#!/usr/bin/env python3
"""Render solar cells connected in series and parallel.

Prompt:
    Draw two identical pairs of solar cells. Connect the first pair in series
    and label that voltages add while current capacity stays about one cell's
    rating. Connect the second pair in parallel with matched polarity and label
    that current capacity adds while voltage stays about one cell's rating.
    Mark plus/minus terminals, output nodes, sunlight, and current arrows.

Topology: series CELL1+ output, CELL1- to CELL2+, CELL2- return. Parallel both
positive terminals join positive output and both negative terminals join return.
Assumptions: Matched, equally illuminated nominal 0.5 V / 100 mA cells.
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
    dot,
    drawing,
    save_cli,
    text,
    wire,
)


def build_drawing():
    d = drawing()
    text(d, "SERIES", (3.2, 7.3), color=BLUE, fontsize=12)
    c1 = d.add(elm.Solar().down().at((3.2, 6.1)).to((3.2, 4.1)).color(ORANGE))
    c2 = d.add(elm.Solar().down().at(c1.end).to((3.2, 2.1)).color(ORANGE))
    wire(d, (3.2, 6.1), (3.2, 6.65), color=RED)
    wire(d, c2.end, (3.2, 1.55))
    text(d, "+ OUT", (4.0, 6.5), color=RED)
    text(d, "− OUT", (4.0, 1.7))
    text(d, "cell 1\n0.5 V", (1.8, 5.1), fontsize=8)
    text(d, "cell 2\n0.5 V", (1.8, 3.1), fontsize=8)
    arrow(d, (5.0, 5.9), (5.0, 2.2), color=BLUE)
    text(d, "≈1.0 V\n≈100 mA capacity", (6.35, 4.1), color=BLUE, fontsize=9)
    text(d, "PARALLEL", (10.8, 7.3), color=GREEN, fontsize=12)
    wire(d, (8.5, 6), (13.1, 6), color=RED)
    wire(d, (8.5, 2), (13.1, 2))
    for x in (9.4, 12.2):
        cell = d.add(elm.Solar().down().at((x, 6)).to((x, 2)).color(ORANGE))
        dot(d, (x, 6))
        dot(d, (x, 2))
        text(d, "0.5 V\n100 mA", (x, 4), fontsize=8)
    text(d, "+ OUT", (13.8, 6), color=RED)
    text(d, "− OUT", (13.8, 2))
    arrow(d, (8.2, 5.6), (8.2, 2.4), color=GREEN)
    text(d, "≈0.5 V\n≈200 mA capacity", (10.8, 1.05), color=GREEN, fontsize=9)
    text(d, "matched cells + equal light", (7.0, 0.3), fontsize=8.5)
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
