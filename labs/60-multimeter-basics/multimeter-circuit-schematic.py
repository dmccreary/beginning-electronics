#!/usr/bin/env python3
"""Render the schematic for the "Meet Your Multimeter" lab.

Prompt:
    Draw the switched LED circuit from Lab 10 with a switch added: a 5 V
    supply, a slide switch SW1, a 220 ohm current-limiting resistor R1 in
    series with a red LED D1, and a return to ground. Label every component
    with its reference designator and value, mark the LED's anode and
    cathode, and annotate the conventional current direction with its
    measured value of about 14 mA once SW1 is closed. Off to the right,
    separately, draw a second resistor R2 (470 ohm) with both leads left
    floating (not wired to anything else in the drawing), inside a dashed
    box clearly labeled "R2 - NOT part of the circuit - used for
    resistance-measurement practice only."

Topology: +5V -> SW1 -> R1 -> D1(anode..cathode) -> GND. R2 is drawn
electrically isolated, both leads terminating in open (unconnected) dots.
Assumptions: red LED with a measured ~1.9 V forward voltage (Chapter 20),
5 V USB supply, a 220 ohm resistor (the same R1 value as Lab 10), and a
470 ohm resistor for R2 (yellow-violet-brown), which is never wired in.

Usage:
    python3 multimeter-circuit-schematic.py multimeter-circuit-schematic.png
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
import schemdraw.elements as elm
from docs.schematic_utils import (
    BLUE,
    GRAY,
    GREEN,
    INK,
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
Y_TOP = 8.6         # supply rail
Y_SW_TOP = 8.0
Y_SW_BOT = 6.9
Y_RES_TOP = 6.3
Y_RES_BOT = 4.5
Y_LED_TOP = 3.7
Y_LED_BOT = 1.9
Y_GND = 1.1

X_R2 = 9.6           # the isolated practice resistor, off to the side
Y_R2_TOP = 6.3
Y_R2_BOT = 4.5


def build_drawing():
    d = drawing()

    # Supply rail into the switch
    wire(d, (X, Y_TOP), (X, Y_SW_TOP), color=RED)
    text(d, "+5 V", (X, Y_TOP + 0.42), color=RED, fontsize=12)
    text(d, "USB supply or battery pack", (X + 2.7, Y_TOP + 0.42), color=GRAY, fontsize=9)

    # SW1 - the slide switch, drawn closed (current is flowing)
    sw = d.add(
        elm.Switch().down().at((X, Y_SW_TOP)).to((X, Y_SW_BOT)).color(INK)
    )
    text(d, "SW1\nslide switch", (X - 1.55, (Y_SW_TOP + Y_SW_BOT) / 2), color=INK, fontsize=11)
    text(d, "shown closed", (X + 1.65, (Y_SW_TOP + Y_SW_BOT) / 2), color=GRAY, fontsize=8.5)
    wire(d, sw.end, (X, Y_RES_TOP))

    # R1 - the current-limiting resistor, same value as Lab 10
    res = d.add(
        elm.Resistor().down().at((X, Y_RES_TOP)).to((X, Y_RES_BOT)).color(BLUE)
    )
    text(d, "R1\n220 Ω", (X - 1.35, (Y_RES_TOP + Y_RES_BOT) / 2), color=BLUE, fontsize=11)
    text(d, "red-red-brown", (X - 1.4, (Y_RES_TOP + Y_RES_BOT) / 2 - 0.72), color=GRAY, fontsize=8.5)
    text(d, "drops ~3.1 V", (X + 1.6, (Y_RES_TOP + Y_RES_BOT) / 2), color=GREEN, fontsize=10)

    wire(d, res.end, (X, Y_LED_TOP))

    # D1 - the LED, drawn with its polarity spelled out
    led = d.add(elm.LED().down().at((X, Y_LED_TOP)).to((X, Y_LED_BOT)).color(RED))
    text(d, "D1\nred LED", (X - 1.35, (Y_LED_TOP + Y_LED_BOT) / 2), color=RED, fontsize=11)
    text(d, "drops ~1.9 V", (X + 1.68, (Y_LED_TOP + Y_LED_BOT) / 2), color=GREEN, fontsize=10)
    text(d, "anode (A)\nlong leg", (X + 1.5, Y_LED_TOP - 0.42), color=GRAY, fontsize=8.5)
    text(d, "cathode (K)\nshort leg, flat edge", (X + 2.05, Y_LED_BOT + 0.42), color=GRAY, fontsize=8.5)

    wire(d, led.end, (X, Y_GND))
    ground(d, (X, Y_GND))
    text(d, "ground", (X + 1.15, Y_GND - 0.18), color=GRAY, fontsize=9)

    # Conventional current: out of the +, through the parts, back to ground.
    # Only flows once SW1 is closed, which is how this schematic is drawn.
    arrow(d, (X - 3.5, Y_SW_TOP + 0.15), (X - 3.5, Y_LED_BOT + 0.35), color=GREEN)
    text(d, "I ≈ 14 mA", (X - 3.5, Y_SW_TOP + 0.75), color=GREEN, fontsize=11)
    text(d, "I = (5 V − 1.9 V) ÷ 220 Ω", (X - 3.5, Y_LED_BOT - 0.25), color=GREEN, fontsize=9)

    # R2 - drawn isolated, both leads floating, for the resistance-practice
    # exercise. It is never connected to the circuit above.
    r2 = d.add(
        elm.Resistor().down().at((X_R2, Y_R2_TOP)).to((X_R2, Y_R2_BOT)).color(GRAY)
    )
    dot(d, (X_R2, Y_R2_TOP), color=GRAY, open=True)
    dot(d, (X_R2, Y_R2_BOT), color=GRAY, open=True)
    text(d, "R2\n470 Ω", (X_R2 + 1.35, (Y_R2_TOP + Y_R2_BOT) / 2), color=GRAY, fontsize=11)
    text(d, "yellow-violet-brown", (X_R2 + 1.4, (Y_R2_TOP + Y_R2_BOT) / 2 - 0.72), color=GRAY, fontsize=8.5)

    # Dashed box around R2 to make the isolation unmistakable at a glance.
    # The caption block is placed relative to box_top (not Y_R2_TOP) with a
    # clear gap, so its lowest line never touches the dashed edge.
    box_pad_x, box_top, box_bot = 1.15, Y_R2_TOP + 0.65, Y_R2_BOT - 0.65
    box_x0, box_x1 = X_R2 - box_pad_x, X_R2 + box_pad_x
    for (sx, sy), (ex, ey) in (
        ((box_x0, box_top), (box_x1, box_top)),
        ((box_x1, box_top), (box_x1, box_bot)),
        ((box_x1, box_bot), (box_x0, box_bot)),
        ((box_x0, box_bot), (box_x0, box_top)),
    ):
        wire(d, (sx, sy), (ex, ey), color=GRAY, lw=1.1, ls="--")

    text(d, "R2 — NOT part of the circuit", (X_R2, box_top + 0.78), color=GRAY, fontsize=10)
    text(d, "both leads unconnected —", (X_R2, box_top + 0.48), color=GRAY, fontsize=9)
    text(d, "used for resistance practice only", (X_R2, box_top + 0.21), color=GRAY, fontsize=9)

    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
