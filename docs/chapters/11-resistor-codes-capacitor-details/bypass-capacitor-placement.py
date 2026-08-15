#!/usr/bin/env python3
"""Render correct and poor IC bypass-capacitor placement.

Prompt:
    Compare a 100 nF ceramic bypass capacitor placed directly beside an IC's
    VCC and GND pins with the same capacitor placed remotely on long wires.
    Mark the close, short-loop arrangement as correct and the long-loop remote
    arrangement with a red X. Label VCC, GND, C1, loop length, and the reason
    close placement catches fast supply noise. Keep all routes orthogonal and
    avoid labels over symbols.

Topology: Each panel connects C1=100nF from the IC VCC net to its GND net.
Only physical placement and conductor length differ.
Assumptions: The generic IC represents a 555 or 74HC595 and uses a 5 V supply.
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
import schemdraw.elements as elm
from docs.schematic_utils import (
    GREEN,
    GRAY,
    INK,
    RED,
    drawing,
    ground,
    save_cli,
    text,
    wire,
)


def make_ic(d, at, label):
    pins = [
        elm.IcPin(name="VCC", side="T", pos=0.5, anchorname="vcc"),
        elm.IcPin(name="GND", side="B", pos=0.5, anchorname="gnd"),
    ]
    return d.add(
        elm.Ic(size=(3.2, 3.0), pins=pins).right().at(at).label(label).color(INK)
    )


def build_drawing():
    d = drawing()
    good = make_ic(d, (1.8, 2.2), "U1\n555 / 74HC595")
    text(d, "GOOD: capacitor close", (3.6, 7.4), color=GREEN, fontsize=13)
    wire(d, good.vcc, (good.vcc[0], 6.3), color=RED)
    wire(d, good.gnd, (good.gnd[0], 1.0))
    cap1 = d.add(elm.Capacitor().down().at((5.8, 6.3)).to((5.8, 1.0)).color(GREEN))
    wire(d, (good.vcc[0], 6.3), cap1.start, color=RED)
    wire(d, good.gnd, (good.gnd[0], 1.0))
    wire(d, (good.gnd[0], 1.0), cap1.end)
    ground(d, (good.gnd[0], 1.0))
    text(d, "C1\n100 nF\nceramic", (6.7, 3.7), color=GREEN, fontsize=9)
    text(
        d,
        "short current loop\ncatches fast noise",
        (4.5, 0.05),
        color=GREEN,
        fontsize=9,
    )

    bad = make_ic(d, (9.1, 2.2), "U2\n555 / 74HC595")
    text(d, "POOR: capacitor remote", (12.2, 7.4), color=RED, fontsize=13)
    wire(d, bad.vcc, (bad.vcc[0], 6.3), color=RED)
    wire(d, bad.gnd, (bad.gnd[0], 1.0))
    cap2 = d.add(elm.Capacitor().down().at((16.0, 6.3)).to((16.0, 1.0)).color(GRAY))
    wire(d, (bad.vcc[0], 6.3), cap2.start, color=RED)
    wire(d, bad.gnd, (bad.gnd[0], 1.0))
    wire(d, (bad.gnd[0], 1.0), cap2.end)
    ground(d, (bad.gnd[0], 1.0))
    text(d, "C1\n100 nF\ntoo far away", (14.95, 3.65), color=GRAY, fontsize=9)
    text(d, "✕", (14.1, 4.0), color=RED, fontsize=28)
    text(
        d,
        "long wires add unwanted\ninductance and delay",
        (12.6, 0.35),
        color=RED,
        fontsize=9,
    )
    wire(d, (7.7, 7.0), (7.7, 0.7), color="#c8cdd1", ls="--")
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
