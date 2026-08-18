#!/usr/bin/env python3
"""Render the dark-detector transistor-switch schematic.

Prompt:
    Redraw docs/img/dark-detector-circuit.png as a Schemdraw schematic. A red
    +5 V rail runs across the top and a GND rail runs across the bottom. On
    the left, a 10 kΩ trim potentiometer is wired as a rheostat from +5 V:
    its wiper feeds a fixed 10 kΩ resistor, whose bottom end is node B. Node
    B connects horizontally to the base of a 2N2222 NPN transistor and drops
    straight down through a photoresistor to the GND rail. On the right, +5 V
    feeds an LED, then a 330 Ω resistor, into the transistor's collector; the
    emitter returns straight down to the GND rail. The transistor keeps
    Schemdraw's default, un-rotated orientation: base at 9 o'clock (left),
    collector at 12 o'clock (top), emitter at 6 o'clock (bottom). Label the
    potentiometer, both resistors with their values, the photoresistor, the
    LED, and the transistor's B/C/E pins and 2N2222 part number, matching the
    source image's label placement (component names beside their symbols,
    pin letters beside the transistor).

Topology: +5V -> Pot(rheostat, wiper tap) -> R1 10k -> nodeB; nodeB -> Q1.base
and nodeB -> LDR1 -> GND; +5V -> D1(LED) -> R2 330 -> Q1.collector;
Q1.emitter -> GND.
Assumptions: The potentiometer's unused fixed terminal is left as a bare lead,
matching the source image, which shows only the wiper feeding the circuit.
"""

import math
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
import schemdraw.elements as elm
from docs.schematic_utils import (
    BLUE,
    GRAY,
    INK,
    RED,
    dot,
    drawing,
    save_cli,
    text,
    wire,
)

Y_TOP = 8.6      # +5 V rail horizontal position
Y_GND = 3.0      # GND rail horizontal position
X_RAIL_L = 1.0
X_RAIL_R = 11.2

X_POT = 3.0
Y_POT_TOP = Y_TOP
Y_POT_BOT = 6.6

Y_RES_BOT = 5.6  # bottom of the fixed 10k resistor == node B

TX_AT = (6.0, Y_RES_BOT)  # transistor base anchor point

Y_ROW = 7.4      # row shared by the 330 ohm resistor and LED bottom
X_LED = 9.5

Y_PHOTO_BOT = 3.0


def toward(point, target, distance):
    """Move a point a fixed distance along the line toward another point."""
    dx, dy = target[0] - point[0], target[1] - point[1]
    length = math.hypot(dx, dy)
    return (point[0] + dx * distance / length, point[1] + dy * distance / length)


def build_drawing():
    d = drawing()

    # Supply and ground rails
    wire(d, (X_RAIL_L, Y_TOP), (X_RAIL_R, Y_TOP), color=RED)
    text(d, "5V", (X_RAIL_L - 0.2, Y_TOP + 0.35), color=RED, fontsize=13)
    wire(d, (X_RAIL_L, Y_GND), (X_RAIL_R, Y_GND), color=INK)
    text(d, "GND", (X_RAIL_L - 0.1, Y_GND - 0.4), color=INK, fontsize=13)

    # Potentiometer wired as a rheostat: top terminal to +5V, wiper feeds R1
    pot = d.add(
        elm.Potentiometer().down().at((X_POT, Y_POT_TOP)).to((X_POT, Y_POT_BOT)).color(BLUE)
    )
    dot(d, pot.start)
    text(d, "10K Ohm Pot.", (X_POT - 1.5, (Y_POT_TOP + Y_POT_BOT) / 2), color=BLUE, fontsize=11)

    x_chain = pot.tap[0]
    y_tap = pot.tap[1]

    # R1 - fixed 10k resistor from the wiper down to node B
    res1 = d.add(
        elm.Resistor().down().at((x_chain, y_tap)).to((x_chain, Y_RES_BOT)).color(INK)
    )
    text(d, "10K Ohm", (x_chain + 1.0, (y_tap + Y_RES_BOT) / 2), color=INK, fontsize=11)

    # Node B: 3-way junction feeding the transistor base and the photoresistor
    node_b = res1.end
    dot(d, node_b)
    wire(d, node_b, TX_AT, color=INK)

    photo = d.add(
        elm.Photoresistor().down().at(node_b).to((x_chain, Y_PHOTO_BOT)).color(GRAY)
    )
    wire(d, photo.end, (x_chain, Y_GND), color=INK)
    dot(d, (x_chain, Y_GND))
    text(d, "Photo\nResistor", (x_chain - 1.2, (node_b[1] + Y_PHOTO_BOT) / 2), color=GRAY, fontsize=11)

    # Q1 - 2N2222 NPN transistor switch. `.right()` is required here, not
    # cosmetic: without an explicit direction the element silently inherits
    # the previous element's .down() and rotates the whole symbol 90 degrees
    # (base ends up at 12 o'clock instead of 9). `.right()` forces the true
    # default geometry: base at 9 o'clock (left), collector at 12 (top),
    # emitter at 6 (bottom) - the same orientation used, unrotated, in
    # docs/appendices/list-of-symbols/generate_symbols.py.
    q1 = d.add(elm.BjtNpn(circle=True).right().at(TX_AT).color("#0d3b4a"))
    text(d, "2N2222", (q1.collector[0] + 0.9, TX_AT[1]), color=INK, fontsize=11)

    # Pin labels sit 0.3 units closer to the transistor's own center than
    # their first-pass positions, so they read as attached to the symbol
    # rather than floating in open space
    text(d, "B", toward((TX_AT[0] - 0.5, TX_AT[1] - 0.5), q1.center, 0.3), color=INK, fontsize=13)
    text(d, "C", toward((q1.collector[0] + 0.3, q1.collector[1] + 0.1), q1.center, 0.3), color=INK, fontsize=13)
    text(d, "E", toward((q1.emitter[0] + 0.22, q1.emitter[1] - 0.35), q1.center, 0.3), color=INK, fontsize=13)

    # Collector branch: Q1.collector up to the row, R2 330 ohm, LED, +5V
    wire(d, q1.collector, (q1.collector[0], Y_ROW), color=INK)
    res2 = d.add(
        elm.Resistor().right().at((q1.collector[0], Y_ROW)).to((X_LED, Y_ROW)).color(INK)
    )
    text(d, "330 Ohm", ((res2.start[0] + res2.end[0]) / 2, Y_ROW - 0.6), color=INK, fontsize=11)

    led = d.add(elm.LED().down().at((X_LED, Y_TOP)).to((X_LED, Y_ROW)).color(RED))
    dot(d, led.start)
    text(d, "LED", (X_LED - .8, (Y_TOP + Y_ROW) / 2 + 0.15), color=RED, fontsize=11)

    # Emitter return to GND
    wire(d, q1.emitter, (q1.emitter[0], Y_GND), color=INK)
    dot(d, (q1.emitter[0], Y_GND))

    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
