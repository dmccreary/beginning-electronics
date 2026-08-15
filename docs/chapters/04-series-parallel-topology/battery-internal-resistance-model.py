#!/usr/bin/env python3
"""Render a real battery EMF and internal-resistance model.

Prompt:
    Draw an ideal 9 V EMF source in series with internal resistance r=2 Ω
    feeding a 100 Ω load. Mark the battery's external terminals, show an
    open-circuit voltmeter reading 9 V and a loaded terminal-voltage voltmeter
    reading below 9 V, label load current, and distinguish EMF from terminal
    voltage without crossing wires.

Topology: E=9V source->r=2Ω->positive terminal->RL=100Ω->return terminal.
Assumptions: Meters are ideal; loaded voltage is approximately 8.82 V.
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
    bat = d.add(elm.BatteryCell().up().at((1, 1.5)).to((1, 5.2)).color(RED))
    r = d.add(elm.Resistor().right().at(bat.end).to((4.5, 5.2)))
    dot(d, r.end, color=GREEN)
    load = d.add(elm.Resistor().down().at((8, 5.2)).to((8, 1.5)))
    dot(d, load.end, color=GREEN)
    wire(d, r.end, load.start)
    wire(d, load.end, bat.start)
    text(d, "ideal EMF\nE = 9.00 V", (0.15, 3.35), color=RED, fontsize=9)
    text(d, "internal r = 2 Ω", (2.8, 5.9), fontsize=9)
    text(d, "RL = 100 Ω", (8.85, 3.35), fontsize=9)
    text(d, "BATTERY MODEL", (2.8, 6.9), color=BLUE, fontsize=12)
    arrow(d, (4.9, 6), (7.4, 6), color=BLUE)
    text(d, "load current I ≈ 88 mA", (6.15, 6.55), color=BLUE, fontsize=9)
    text(d, "+ terminal", (4.65, 4.65), color=GREEN, fontsize=8)
    text(d, "− terminal", (6.7, 1.0), color=GREEN, fontsize=8)
    text(d, "OPEN CIRCUIT: VTERM = 9.00 V", (3.0, 0.25), color=GREEN, fontsize=9)
    text(d, "LOADED: VTERM ≈ 8.82 V", (7.4, 0.25), color=BLUE, fontsize=9)
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
