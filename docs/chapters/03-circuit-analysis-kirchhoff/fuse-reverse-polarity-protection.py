#!/usr/bin/env python3
"""Render fuse and reverse-polarity protection circuits.

Prompt:
    Draw two low-voltage protection panels. OVERCURRENT shows a fuse in the
    positive lead immediately beside a battery, before the wiring and load,
    so downstream faults are disconnected. REVERSE POLARITY shows a series
    Schottky diode after the fuse, oriented to pass correctly connected
    battery current and block a reversed battery. Label protected load,
    current path, diode anode/cathode, and the diode's small forward drop.

Topology: panel1 battery+->F1->load->battery-; panel2 battery+->F1->D1(A to K)
->load->battery-. D1 blocks a reversed input.
Assumptions: Low-voltage, sub-amp teaching circuit; fuse rating is selected for
the wire and load, and a Schottky diode is acceptable despite voltage drop.
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


def loop(d, x, diode=False):
    b = d.add(elm.BatteryCell().up().at((x, 1.4)).to((x, 5.2)).color(RED))
    f = d.add(elm.Fuse().right().at(b.end).to((x + 2.0, 5.2)).color(ORANGE))
    end = f.end
    if diode:
        dd = d.add(elm.Diode().right().at(end).to((x + 4.0, 5.2)).color(BLUE))
        end = dd.end
        text(d, "D1 Schottky\nA → K", (x + 3.0, 6.0), color=BLUE, fontsize=8.5)
    loadx = x + (5.2 if diode else 3.5)
    load = d.add(elm.Resistor().down().at((loadx, 5.2)).to((loadx, 1.4)))
    wire(d, end, load.start)
    wire(d, load.end, b.start)
    text(d, "BATTERY", (x + 1.0, 2.6), color=RED, fontsize=8.5)
    text(d, "F1 close\nto source", (x + 1.0, 6.0), color=ORANGE, fontsize=8.5)
    text(d, "PROTECTED\nLOAD", (loadx + 1.3, 3.3), color=GREEN, fontsize=8.5)
    arrow(d, (x + 0.2, 6.8), (loadx - 0.2, 6.8), color=GREEN)


def build_drawing():
    d = drawing()
    text(d, "OVERCURRENT PROTECTION", (3.0, 7.7), color=ORANGE, fontsize=11)
    loop(d, 0.8)
    text(d, "REVERSE-POLARITY PROTECTION", (10.5, 7.7), color=BLUE, fontsize=11)
    loop(d, 7.2, True)
    text(d, "fault downstream → fuse opens", (2.6, 0.55), color=ORANGE, fontsize=8.5)
    text(
        d,
        "correct polarity passes; reversed battery is blocked",
        (10.2, 0.55),
        color=BLUE,
        fontsize=8.5,
    )
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
