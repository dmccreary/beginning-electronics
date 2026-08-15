#!/usr/bin/env python3
"""Render series and parallel LED wiring with open-failure behavior.

Prompt:
    Draw a two-LED series string and two parallel LED branches. In series use
    one resistor and one shared current path; mark that one LED failing open
    turns the whole string off. In parallel use one resistor per branch; mark
    that one open branch leaves the other lit. Label source, current arrows,
    LED voltage drops, and resistor placement.

Topology: series +9V->R1->LED1->LED2->GND. Parallel +5V feeds two branches,
each resistor->LED->GND.
Assumptions: Each LED has approximately 2 V forward voltage.
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
    ground,
    save_cli,
    text,
    wire,
)


def build_drawing():
    d = drawing()
    text(d, "SERIES STRING", (3, 7.5), color=BLUE, fontsize=12)
    wire(d, (3, 6.8), (3, 6.3), color=RED)
    text(d, "+9 V", (3, 7.05), color=RED)
    r = d.add(elm.Resistor().down().at((3, 6.3)).to((3, 5)))
    a = d.add(elm.LED().down().at(r.end).to((3, 3.4)).color(ORANGE))
    b = d.add(elm.LED().down().at(a.end).to((3, 1.8)).color(ORANGE))
    ground(d, b.end)
    text(d, "R1", (3.8, 5.65))
    text(d, "LED1 ≈ 2 V", (4.9, 4.25), color=ORANGE)
    text(d, "LED2 ≈ 2 V", (4.9, 2.65), color=ORANGE)
    arrow(d, (1.5, 6.1), (1.5, 2.2), color=BLUE)
    text(d, "one current path", (1.25, 4.2), color=BLUE, fontsize=8.5)
    text(d, "one open LED → both OFF", (3, 0.65), color=RED, fontsize=9)
    text(d, "PARALLEL BRANCHES", (10.2, 7.5), color=GREEN, fontsize=12)
    wire(d, (7.5, 6.3), (13, 6.3), color=RED)
    text(d, "+5 V", (7.5, 6.85), color=RED)
    wire(d, (7.5, 1.7), (13, 1.7))
    ground(d, (10.2, 1.7))
    for x, n, c in [(8.8, "branch 1", GREEN), (11.8, "branch 2", BLUE)]:
        dot(d, (x, 6.3))
        rr = d.add(elm.Resistor().down().at((x, 6.3)).to((x, 4.7)))
        ll = d.add(elm.LED().down().at(rr.end).to((x, 2.3)).color(ORANGE))
        wire(d, ll.end, (x, 1.7))
        dot(d, (x, 1.7))
        arrow(d, (x + 0.7, 5.9), (x + 0.7, 2.4), color=c)
        text(d, "R 330 Ω", (x - 0.75, 5.5), fontsize=8)
        text(d, n, (x, 1.05), color=c, fontsize=8.5)
    text(d, "one resistor per branch", (10.2, 6.9), color=GREEN, fontsize=9)
    text(
        d, "one open LED → other branch stays ON", (10.2, 0.35), color=GREEN, fontsize=9
    )
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
