#!/usr/bin/env python3
"""Render the schematic for the "555 Timer Buzzer and Siren" lab.

Prompt:
    Draw a complete NE555 astable buzzer-driver circuit for an 8th-grade
    electronics lab: an 8-pin 555 timer IC with pin 8 (VCC) and pin 4
    (RESET) tied to +5 V, pin 1 (GND) to ground, R1 = 1 kΩ from +5 V to
    pin 7 (DISCHARGE), R2 = 6.8 kΩ from pin 7 to the joined pins 2
    (TRIGGER) and 6 (THRESHOLD), a 0.1 µF ceramic timing capacitor C1 from
    that joined node to ground, and pin 3 (OUTPUT) wired directly to one
    lead of a piezo buzzer BZ1, with the buzzer's other lead returned to
    ground - no series resistor between pin 3 and the buzzer. Mark the
    buzzer's + and - leads clearly, since reversed polarity is the most
    common reason the circuit stays silent. Label every component with its
    reference designator and value, and annotate the resulting frequency
    (f = 1.44 / ((R1 + 2R2) C) ~ 990 Hz) and duty cycle (D ~ 53%). Use
    compact multiline labels, about 0.15 drawing units of visible
    symbol-to-label clearance, and no label, wire, or symbol collisions.

Topology: +5V -> pin8, pin4, R1.1. R1.2 -> pin7/R2.1. R2.2 -> pins2+6/C1.1.
C1.2 -> GND. pin1 -> GND. pin3 -> BZ1(+); BZ1(-) -> GND.
Assumptions: BZ1 is the kit's small two-terminal piezo buzzer, drawn with
Schemdraw's generic speaker/transducer symbol. Pin 5 (CONTROL) is left
unconnected, matching the chapter's own note that simple projects usually
leave it disconnected or bridged with a small stabilizing capacitor.

Usage:
    python3 555-timer-buzzer-schematic.py 555-timer-buzzer-schematic.png
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
    dot,
    drawing,
    ground,
    save_cli,
    text,
    wire,
)


def build_drawing():
    d = drawing()

    timer = d.add(elm.Ic555().at((5.0, 2.0)).color(INK))

    # +5 V supply rail feeds VCC and RESET, tied high so RESET never
    # interferes with the timing cycle.
    supply_y = 9.0
    wire(d, (1.8, supply_y), (9.5, supply_y), color=RED)
    wire(d, timer.Vcc, (timer.Vcc[0], supply_y), color=RED)
    wire(d, timer.RST, (timer.RST[0], supply_y), color=RED)
    dot(d, (timer.Vcc[0], supply_y), color=RED)
    dot(d, (timer.RST[0], supply_y), color=RED)
    text(d, "+5 V", (1.8, supply_y + 0.48), color=RED, fontsize=13)
    text(d, "pin 4 RESET\ntied high", (timer.RST[0] - 0.15, supply_y + 0.85),
         color=RED, fontsize=8.5)

    # Pin 1 GND.
    wire(d, timer.GND, (timer.GND[0], 0.55))
    ground(d, (timer.GND[0], 0.55))

    # Timing network: R1, R2, and C1 set the astable frequency and duty cycle.
    timing_x = 1.8
    r1 = d.add(
        elm.Resistor().down().at((timing_x, supply_y)).to((timing_x, 6.0)).color(BLUE)
    )
    discharge_node = r1.end
    wire(d, discharge_node, timer.DIS, color=BLUE)
    dot(d, discharge_node, color=BLUE)

    r2 = d.add(
        elm.Resistor().down().at(discharge_node).to((timing_x, 3.75)).color(BLUE)
    )
    timing_node = r2.end
    pin_tie_x = 3.45
    wire(d, timing_node, (pin_tie_x, timing_node[1]), color=BLUE)
    wire(d, (pin_tie_x, timer.TRG[1]), timer.TRG, color=BLUE)
    wire(d, (pin_tie_x, timer.THR[1]), timer.THR, color=BLUE)
    wire(d, (pin_tie_x, timer.TRG[1]), (pin_tie_x, timer.THR[1]), color=BLUE)
    dot(d, (pin_tie_x, timing_node[1]), color=BLUE)

    c1 = d.add(elm.Capacitor().down().at(timing_node).to((timing_x, 0.8)).color(BLUE))
    ground(d, c1.end)

    text(d, "R1\n1 kΩ", (0.55, 7.5), color=BLUE, fontsize=10)
    text(d, "R2\n6.8 kΩ", (0.55, 4.9), color=BLUE, fontsize=10)
    text(d, "C1  0.1 µF\nceramic, timing", (0.15, 1.95), color=BLUE, fontsize=9.5)
    text(d, "pins 2 + 6\ntied together", (2.75, 2.55), color=BLUE, fontsize=8.5)

    # Pin 3 OUTPUT drives the piezo buzzer directly - no series resistor.
    output_y = timer.OUT[1]
    buzzer_x = 12.0
    wire(d, timer.OUT, (buzzer_x, output_y), color=GREEN)
    dot(d, timer.OUT, color=GREEN)
    buzzer = d.add(elm.Speaker().right().at((buzzer_x, output_y)).color(GREEN))
    wire(d, buzzer.in2, (buzzer_x, 1.0), color=GREEN)
    ground(d, (buzzer_x, 1.0))

    text(d, "direct drive -\nno resistor needed",
         (10.75, output_y + 0.85), color=GREEN, fontsize=8.5)
    text(d, "BZ1\npiezo buzzer", (buzzer_x + 2.35, output_y + 0.05), color=GREEN, fontsize=10)
    text(d, "+", (buzzer_x - 0.45, output_y + 0.28), color=GREEN, fontsize=13)
    text(d, "−", (buzzer_x - 0.45, output_y - 0.85), color=GREEN, fontsize=13)
    text(d, "polarity matters -\nswap leads if silent",
         (buzzer_x + 2.35, output_y - 1.05), color=GRAY, fontsize=8.5)

    text(
        d,
        "f = 1.44 / ((R1 + 2R2) C) ≈ 990 Hz      D ≈ 53%",
        (5.9, -0.7),
        color=GRAY,
        fontsize=10.5,
    )

    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
