#!/usr/bin/env python3
"""Render the schematic for the "Driving a Motor and a Buzzer Safely" lab.

Prompt:
    Draw the complete protected transistor motor driver: a +5 V rail feeding
    a DC motor M1 and a push button SW1, a 2N2222 NPN transistor Q1 switching
    the motor's return path to ground, a 4.7 kOhm base resistor R1 between
    SW1 and Q1's base, and a flyback diode D1 wired backward directly across
    the motor's two leads with its cathode toward +5 V and its anode toward
    the collector/motor-negative node. Label every component with its
    reference designator and value, mark Q1's base/collector/emitter and
    D1's anode/cathode, and annotate both current paths: the button-pressed
    path that spins the motor, and the switch-off path the diode gives the
    collapsing motor field.

Topology: +5V -> M1 -> Q1 collector; Q1 emitter -> GND; +5V -> SW1 -> R1 ->
Q1 base. D1 is in parallel with M1, between +5V and the collector node,
cathode at +5V.
Assumptions: M1 is a small 3-6 V hobby motor drawing about 100 mA, Q1 is a
2N2222 with worst-case beta = 100, and R1 = 4.7 kOhm is the standard value
above the calculated 4300 ohm (Chapter 14's own worked example).

Usage:
    python3 motor-driver-schematic.py motor-driver-schematic.png
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
    RED,
    drawing,
    ground,
    save_cli,
    text,
    wire,
)

Y_RAIL = 7.0     # +5V bus
X_BUTTON = 0.0   # SW1's far (supply-side) terminal
X_BASE = 6.0     # Q1's base
X_GND = 6.0      # ground drop shares the transistor's x column


def build_drawing():
    d = drawing()

    # Q1 - placed first so its default orientation (base left, collector
    # upper-right, emitter lower-right) is not inherited from any other
    # element's direction.
    q1 = d.add(elm.BjtNpn(circle=True).right().at((X_BASE, 0.0)).color(BLUE))
    motor_x = q1.collector[0]

    # M1 - the switched load, from the +5V rail down to the collector node.
    motor = d.add(elm.Motor().down().at((motor_x, Y_RAIL)).color(RED))
    switch_node = motor.end
    wire(d, switch_node, q1.collector, color=RED)

    # Q1's emitter returns to ground.
    wire(d, q1.emitter, (q1.emitter[0], -2.0), color=BLUE)
    ground(d, (q1.emitter[0], -2.0))
    text(d, "GND", (q1.emitter[0] + 0.7, -2.0), color=GRAY, fontsize=9)

    # SW1 - the push button, then R1 - the base resistor, feeding Q1's base.
    button = d.add(elm.Button().right().at((X_BUTTON, 0.0)).color(BLUE))
    base_resistor = d.add(
        elm.Resistor().right().at(button.end).to((X_BASE, 0.0)).color(BLUE)
    )
    wire(d, base_resistor.end, q1.base, color=BLUE)
    wire(d, (X_BUTTON, 0.0), (X_BUTTON, Y_RAIL), color=BLUE)

    # D1 - the flyback diode, wired backward directly across M1's leads:
    # cathode (K) at +5V, anode (A) at the collector/motor-negative node.
    diode_x = motor_x + 3.0
    flyback = d.add(elm.Diode().up().at((diode_x, switch_node[1])).color(ORANGE))
    wire(d, switch_node, flyback.start, color=ORANGE)
    wire(d, flyback.end, (diode_x, Y_RAIL), color=ORANGE)

    # The shared +5V rail: one horizontal bus feeding SW1, M1, and D1's cathode.
    wire(d, (X_BUTTON, Y_RAIL), (diode_x, Y_RAIL), color=RED)
    text(d, "+5 V", (motor_x - 1.7, Y_RAIL + 0.5), color=RED, fontsize=12)
    text(d, "USB supply or battery pack", (motor_x + 1.7, Y_RAIL + 0.5), color=GRAY, fontsize=9)

    # Junction dots at every real electrical join.
    for pt in ((X_BUTTON, Y_RAIL), (motor_x, Y_RAIL), (diode_x, Y_RAIL),
               switch_node, flyback.start, flyback.end):
        d.add(elm.Dot().at(pt).color(RED if pt[1] == Y_RAIL else ORANGE))

    # Labels.
    text(d, "SW1\npush button", (button.center[0], -0.75), color=BLUE, fontsize=10)
    text(d, "R1\n4.7 kΩ", (base_resistor.center[0], -0.75), color=BLUE, fontsize=10)
    text(d, "M1\nDC motor", (motor_x - 1.3, (Y_RAIL + switch_node[1]) / 2), color=RED, fontsize=11)
    text(d, "Q1\n2N2222", (q1.center[0] + 1.15, -0.05), color=BLUE, fontsize=11)
    text(d, "B", (q1.base[0] - 0.15, q1.base[1] - 0.4), color=GRAY, fontsize=9)
    text(d, "C", (q1.collector[0] + 0.35, q1.collector[1] + 0.15), color=GRAY, fontsize=9)
    text(d, "E", (q1.emitter[0] + 0.35, q1.emitter[1] - 0.15), color=GRAY, fontsize=9)

    text(d, "K  cathode", (diode_x + 1.1, Y_RAIL - 0.55), color=ORANGE, fontsize=9)
    text(d, "D1\nflyback diode", (diode_x + 1.35, (Y_RAIL + switch_node[1]) / 2), color=ORANGE, fontsize=11)
    text(d, "A  anode", (diode_x + 1.0, switch_node[1] + 0.55), color=ORANGE, fontsize=9)

    text(d, "MOTOR ON: +5 V → M1 → Q1 (C→E) → GND, while SW1 keeps R1 feeding Q1's base",
         (motor_x + 0.3, -2.9), color=GREEN, fontsize=10)
    text(d, "SWITCH-OFF: D1 gives the motor's collapsing field a safe loop instead of hitting Q1",
         (motor_x + 0.3, -3.4), color=ORANGE, fontsize=10)

    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
