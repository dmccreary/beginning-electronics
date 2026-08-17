#!/usr/bin/env python3
"""Render the schematic for the "Your First LED Circuit" lab.

Prompt:
    Draw the complete first LED circuit: a 5 V supply, a 220 ohm
    current-limiting resistor R1 in series with a red LED D1, and a return to
    ground. Label every component with its reference designator and value, mark
    the LED's anode and cathode, show the voltage each part drops (3 V across
    the resistor, 2 V across the LED), and annotate the conventional current
    direction with its calculated value of about 14 mA.

Topology: +5V -> R1 -> D1(anode..cathode) -> GND.
Assumptions: red LED with a 2.0 V forward voltage, 5 V USB supply, and a 220 ohm
resistor from the kit (the nearest standard value above the calculated 150 ohm).

Usage:
    python3 led-circuit-schematic.py led-circuit-schematic.png
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
import schemdraw.elements as elm
from docs.schematic_utils import (
    BLUE,
    GRAY,
    GREEN,
    RED,
    arrow,
    drawing,
    ground,
    save_cli,
    text,
    wire,
)

X = 4.0          # the series branch runs straight down this line
Y_TOP = 7.4      # supply rail
Y_RES_TOP = 6.6
Y_RES_BOT = 4.6
Y_LED_TOP = 3.8
Y_LED_BOT = 1.8
Y_GND = 1.0


def build_drawing():
    d = drawing()

    # Supply rail into the resistor
    wire(d, (X, Y_TOP), (X, Y_RES_TOP), color=RED)
    text(d, "+5 V", (X, Y_TOP + 0.42), color=RED, fontsize=12)
    text(d, "USB supply or battery pack", (X + 2.55, Y_TOP + 0.42), color=GRAY, fontsize=9)

    # R1 - the current-limiting resistor
    res = d.add(
        elm.Resistor().down().at((X, Y_RES_TOP)).to((X, Y_RES_BOT)).color(BLUE)
    )
    text(d, "R1\n220 Ω", (X - 1.35, (Y_RES_TOP + Y_RES_BOT) / 2), color=BLUE, fontsize=11)
    text(d, "red-red-brown", (X - 1.4, (Y_RES_TOP + Y_RES_BOT) / 2 - 0.72), color=GRAY, fontsize=8.5)
    text(d, "drops 3 V", (X + 1.5, (Y_RES_TOP + Y_RES_BOT) / 2), color=GREEN, fontsize=10)

    wire(d, res.end, (X, Y_LED_TOP))

    # D1 - the LED, drawn with its polarity spelled out
    led = d.add(elm.LED().down().at((X, Y_LED_TOP)).to((X, Y_LED_BOT)).color(RED))
    text(d, "D1\nred LED", (X - 1.35, (Y_LED_TOP + Y_LED_BOT) / 2), color=RED, fontsize=11)
    text(d, "drops 2 V", (X + 1.62, (Y_LED_TOP + Y_LED_BOT) / 2), color=GREEN, fontsize=10)
    text(d, "anode (A)\nlong leg", (X + 1.45, Y_LED_TOP - 0.42), color=GRAY, fontsize=8.5)
    text(d, "cathode (K)\nshort leg, flat edge", (X + 1.95, Y_LED_BOT + 0.42), color=GRAY, fontsize=8.5)

    wire(d, led.end, (X, Y_GND))
    ground(d, (X, Y_GND))
    text(d, "ground", (X + 1.15, Y_GND - 0.18), color=GRAY, fontsize=9)

    # Conventional current: out of the +, through the parts, back to ground.
    # The labels sit above the tail and below the head rather than beside the
    # shaft, so the arrow never runs through its own text.
    arrow(d, (X - 3.4, Y_RES_TOP + 0.15), (X - 3.4, Y_LED_BOT + 0.35), color=GREEN)
    text(d, "I ≈ 14 mA", (X - 3.4, Y_RES_TOP + 0.75), color=GREEN, fontsize=11)
    text(d, "I = (5 V − 2 V) ÷ 220 Ω", (X - 3.4, Y_LED_BOT - 0.25), color=GREEN, fontsize=9)

    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
