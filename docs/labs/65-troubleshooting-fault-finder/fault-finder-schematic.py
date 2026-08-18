#!/usr/bin/env python3
"""Render the schematic for the "Hunt Down a Hidden Fault" lab.

Prompt:
    Draw a single series troubleshooting circuit: a 5 V supply, a slide
    switch SW1, a 330 ohm resistor R1, a 220 ohm resistor R2, a plain
    signal diode D1 (1N4148 or 1N4001), and a red LED D2, all in one
    series loop back to ground. Mark all seven conceptual test points
    TP0 through TP6 at their exact positions in the chain: TP0 at the
    battery's positive terminal (before SW1), TP1 between SW1 and R1,
    TP2 between R1 and the jumper wire that runs to R2, TP3 between
    that jumper wire and R2, TP4 between R2 and D1, TP5 between D1 and
    D2, and TP6 at D2's cathode / ground. Label every component with
    its reference designator and value, and annotate each test point
    with the voltage a healthy circuit should read there, worked out
    with Ohm's Law and the diode/LED forward-voltage drops (0.6 V for
    D1, 1.9 V for the red LED D2). Show the overall loop current.

Topology: +5V -> SW1 -> TP1 -> R1 -> TP2 -> (jumper wire) -> TP3 -> R2
-> TP4 -> D1 -> TP5 -> D2 -> TP6/GND.

Assumptions: 5 V USB supply or equivalent battery pack, a small-signal
diode (1N4148/1N4001) with a 0.6 V forward drop, and a red LED with a
1.9 V forward drop (the same number used since Chapter 12). With
R1 + R2 = 550 ohms, loop current works out to about 4.5 mA. This
matches Chapter 21's own Half-Split Fault Finder MicroSim, which uses
the same six stages (SW1, R1, the R1-R2 wire, R2, D1, D2) and the same
seven test points TP0-TP6, so the real build and the sim line up.

Usage:
    python3 fault-finder-schematic.py fault-finder-schematic.png
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
import schemdraw.elements as elm
from docs.schematic_utils import (
    BLUE,
    GRAY,
    GREEN,
    ORANGE,
    PURPLE,
    RED,
    arrow,
    dot,
    drawing,
    ground,
    save_cli,
    text,
    wire,
)

X = 4.0            # the series branch runs straight down this line
X_TP = X + 2.9      # test-point dots and voltage labels sit to the right
X_VAL = X - 1.55    # component reference/value labels sit to the left

Y0 = 16.4   # TP0 - battery +, before SW1
Y1 = 14.2   # TP1 - after SW1, before R1
Y2 = 12.0   # TP2 - after R1, before the R1-R2 jumper wire
Y3 = 10.6   # TP3 - after the jumper wire, before R2
Y4 = 8.4    # TP4 - after R2, before D1
Y5 = 6.2    # TP5 - after D1, before D2
Y6 = 4.0    # TP6 - after D2 (LED cathode) / ground

# Predicted voltages for a healthy circuit (see docstring assumptions).
# I = (5.0 - 0.6 - 1.9) / (330 + 220) = 2.5 / 550 = 0.00455 A = 4.5 mA
VOLTAGES = {
    "TP0": "5.0 V",
    "TP1": "5.0 V",
    "TP2": "3.5 V",
    "TP3": "3.5 V",
    "TP4": "2.5 V",
    "TP5": "1.9 V",
    "TP6": "0.0 V",
}


def tp(d, name, xy):
    """A labeled test point: a dot on the wire plus its name and predicted voltage."""
    dot(d, xy, color=PURPLE)
    text(d, name, (X_TP, xy[1] + 0.12), color=PURPLE, fontsize=10.5)
    text(d, VOLTAGES[name], (X_TP, xy[1] - 0.42), color=GREEN, fontsize=9.5)


def build_drawing():
    d = drawing()

    # Supply rail into SW1
    wire(d, (X, Y0 + 1.0), (X, Y0), color=RED)
    text(d, "+5 V", (X, Y0 + 1.4), color=RED, fontsize=12)
    text(d, "USB supply or battery pack", (X + 2.9, Y0 + 1.4), color=GRAY, fontsize=8.5)
    tp(d, "TP0", (X, Y0))

    # SW1 - the switch that gates the whole circuit
    sw = d.add(elm.Switch().down().at((X, Y0)).to((X, Y1)).color(BLUE))
    text(d, "SW1", (X_VAL, (Y0 + Y1) / 2), color=BLUE, fontsize=11)
    tp(d, "TP1", (X, Y1))

    # R1 - the first current-limiting resistor
    r1 = d.add(elm.Resistor().down().at((X, Y1)).to((X, Y2)).color(BLUE))
    text(d, "R1\n330 Ω", (X_VAL, (Y1 + Y2) / 2), color=BLUE, fontsize=11)
    tp(d, "TP2", (X, Y2))

    # The jumper wire between R1 and R2 - its own conceptual test-point stage,
    # because a loose jumper is one of the most common real faults.
    wire(d, (X, Y2), (X, Y3), color=ORANGE)
    text(d, "jumper wire\n(R1 → R2)", (X_VAL - 0.15, (Y2 + Y3) / 2), color=ORANGE, fontsize=9)
    tp(d, "TP3", (X, Y3))

    # R2 - the second current-limiting resistor
    r2 = d.add(elm.Resistor().down().at((X, Y3)).to((X, Y4)).color(BLUE))
    text(d, "R2\n220 Ω", (X_VAL, (Y3 + Y4) / 2), color=BLUE, fontsize=11)
    tp(d, "TP4", (X, Y4))

    # D1 - a plain signal diode, forward-biased in the current direction
    d1 = d.add(elm.Diode().down().at((X, Y4)).to((X, Y5)).color(GRAY))
    text(d, "D1\ndiode (1N4148)", (X_VAL - 0.05, (Y4 + Y5) / 2), color=GRAY, fontsize=10)
    tp(d, "TP5", (X, Y5))

    # D2 - the red LED, the final load
    d2 = d.add(elm.LED().down().at((X, Y5)).to((X, Y6)).color(RED))
    text(d, "D2\nred LED", (X_VAL, (Y5 + Y6) / 2), color=RED, fontsize=11)
    text(d, "anode (A)\nlong leg", (X + 1.4, Y5 - 0.38), color=GRAY, fontsize=8)
    text(d, "cathode (K)\nshort leg", (X + 1.4, Y6 + 0.5), color=GRAY, fontsize=8)

    wire(d, d2.end, (X, Y6 - 0.7))
    ground(d, (X, Y6 - 0.7))
    tp(d, "TP6", (X, Y6))
    text(d, "ground", (X + 1.55, Y6 - 0.85), color=GRAY, fontsize=9)

    # Overall loop current, annotated on the far left
    arrow(d, (X - 3.6, Y0 + 0.15), (X - 3.6, Y6 - 0.2), color=GREEN)
    text(d, "I ≈ 4.5 mA", (X - 3.6, Y0 + 0.6), color=GREEN, fontsize=11)
    text(d, "I = (5 V − 0.6 V − 1.9 V) ÷ 550 Ω", (X - 3.6, Y6 - 0.55), color=GREEN, fontsize=8.5)

    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
