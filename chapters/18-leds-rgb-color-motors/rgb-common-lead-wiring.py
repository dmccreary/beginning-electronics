#!/usr/bin/env python3
"""Render common-cathode and common-anode RGB LED wiring.

Prompt:
    Draw side-by-side common-cathode and common-anode RGB LED circuits. Each
    package has red, green, and blue LED channels with one 330 Ω resistor per
    channel. Clearly show the shared cathode tied to ground and driven HIGH,
    versus the shared anode tied to +5 V and channels driven LOW. Label the
    common lead and opposite current directions.

Topology: CC outputs->resistors->LED anodes, common cathode->GND. CA +5V->
common anode->LED cathodes->resistors->sinking outputs.
Assumptions: Symbol groups represent a four-lead RGB LED package.
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
    dot,
    drawing,
    ground,
    save_cli,
    text,
    wire,
)

COLORS = [("#c62828", "RED"), ("#2e7d32", "GREEN"), ("#1565c0", "BLUE")]


def build_drawing():
    d = drawing()
    text(d, "COMMON CATHODE", (3.4, 8.3), color=BLUE, fontsize=12)
    text(d, "drive channel HIGH", (3.4, 7.65), color=BLUE, fontsize=9)
    for i, (c, n) in enumerate(COLORS):
        x = 1.4 + i * 2
        r = d.add(elm.Resistor().down().at((x, 5.8)).to((x, 4.2)).color(c))
        led = d.add(elm.LED().down().at(r.end).to((x, 2.1)).color(c))
        wire(d, (x, 6.3), r.start, color=c)
        text(d, f"{n}\n330 Ω", (x, 6.85), color=c, fontsize=8)
        wire(d, led.end, (3.4, 1.55), color=INK)
    dot(d, (3.4, 1.55))
    ground(d, (3.4, 1.55))
    text(d, "SHARED K\n(common cathode)", (5.4, 1.35), fontsize=8.5)
    text(d, "COMMON ANODE", (10.8, 8.3), color=RED, fontsize=12)
    text(d, "drive channel LOW", (10.8, 7.1), color=RED, fontsize=9)
    for i, (c, n) in enumerate(COLORS):
        x = 8.8 + i * 2
        led = d.add(elm.LED().down().at((x, 5.6)).to((x, 3.5)).color(c))
        r = d.add(elm.Resistor().down().at(led.end).to((x, 1.8)).color(c))
        wire(d, r.end, (x, 1.25), color=c)
        text(d, f"{n}\n330 Ω", (x, 1.0), color=c, fontsize=8)
        wire(d, (10.8, 6.2), led.start, color=INK)
    dot(d, (10.8, 6.2))
    wire(d, (10.8, 6.2), (10.8, 6.6), color=RED)
    text(d, "+5 V  SHARED A", (10.8, 7.65), color=RED, fontsize=9)
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
