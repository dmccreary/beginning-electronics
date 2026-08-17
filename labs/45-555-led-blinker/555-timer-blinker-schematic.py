#!/usr/bin/env python3
"""Render the schematic for the "555 Timer LED Blinker" lab.

Prompt:
    Draw the classic NE555 astable LED-blinker circuit used in Lab 45. Show a
    555 timer block with all eight pins labeled by function. Pin 8 (VCC) and
    pin 4 (RESET) both tie to the +5 V rail. Pin 1 (GND) ties to ground. R1
    (1 kΩ) runs from +5 V down to pin 7 (DISCHARGE). R2 (68 kΩ) runs from pin
    7 down to the timing node, which is the tied-together pins 2 (TRIGGER)
    and 6 (THRESHOLD). A polarized capacitor C1 (10 µF electrolytic, + lead
    up toward the timing node) runs from that timing node to ground. Pin 3
    (OUTPUT) drives a 330 Ω resistor R3, which drives the anode of LED D1;
    the LED's cathode returns to ground. Label every component with its
    reference designator and value, mark the electrolytic capacitor's
    polarity, and annotate the approximate 1.1 Hz blink frequency near the
    timing network. Do not draw the optional pin-5/supply bypass capacitors
    mentioned in the lab text - this schematic shows only the required
    circuit.

Topology: +5V -> pin8, pin4, R1; R1 -> pin7/R2; R2 -> timing node (pins 2+6
tied); timing node -> C1(+) -> C1(-) -> GND; pin1 -> GND; pin3 -> R3 -> D1
anode; D1 cathode -> GND.
Assumptions: R1=1kOhm, R2=68kOhm, C1=10uF give f = 1.44/((R1+2R2)*C) ~= 1.1 Hz
and duty cycle D = (R1+R2)/(R1+2R2) ~= 51%, matching Chapter 14's own table
row. C1 is drawn as a polarized electrolytic capacitor per the lab's parts
list.

Usage:
    python3 555-timer-blinker-schematic.py 555-timer-blinker-schematic.png
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
import schemdraw.elements as elm
from docs.schematic_utils import (
    GRAY,
    GREEN,
    INK,
    RED,
    drawing,
    ground,
    save_cli,
    text,
)

POWER = "#b71c1c"
TIMING = "#1565c0"
OUTPUT = "#2e7d32"


def build_drawing():
    d = drawing(unit=3.0)

    # Central 555 functional block, pins exposed by name (matches the
    # book's Chapter 14 astable-LED schematic conventions).
    timer = d.add(elm.Ic555().at((5.0, 2.0)).color(INK))

    # +5 V supply rail feeds VCC (pin 8) and RESET (pin 4), tied high so
    # RESET never interrupts the oscillation.
    supply_y = 9.0
    d.add(elm.Line().at((1.6, supply_y)).to((12.6, supply_y)).color(POWER))
    d.add(elm.Line().at(timer.Vcc).to((timer.Vcc[0], supply_y)).color(POWER))
    d.add(elm.Line().at(timer.RST).to((timer.RST[0], supply_y)).color(POWER))
    d.add(elm.Dot().at((timer.Vcc[0], supply_y)).color(POWER))
    d.add(elm.Dot().at((timer.RST[0], supply_y)).color(POWER))
    text(d, "+5 V", (1.6, supply_y + 0.45), color=POWER, fontsize=14)
    text(d, "pin 8 VCC", (timer.Vcc[0] + 0.05, supply_y - 0.85), color=POWER, fontsize=8.5)
    text(d, "pin 4 RESET\ntied high", (timer.RST[0] - 1.65, supply_y - 1.05), color=POWER, fontsize=8.5)

    # Pin 1 GND to ground.
    d.add(elm.Line().at(timer.GND).to((timer.GND[0], 0.55)).color(INK))
    ground(d, (timer.GND[0], 0.55))
    text(d, "pin 1 GND", (timer.GND[0] + 0.15, 1.05), color=GRAY, fontsize=8.5)

    # Pin 5 CONTROL is left unconnected in this lab's minimal circuit.
    text(d, "pin 5 CONTROL\n(not used)", (timer.CTL[0] + 0.75, timer.CTL[1] - 0.42), color=GRAY, fontsize=8)

    # Astable timing network: R1 from +5V to DISCHARGE (pin 7), R2 from
    # DISCHARGE to the tied TRIGGER (pin 2) + THRESHOLD (pin 6) node, C1
    # (polarized) from that node to ground.
    timing_x = 1.6
    d.add(elm.Resistor().down().at((timing_x, supply_y)).to((timing_x, 6.0)).color(TIMING))
    discharge_node = (timing_x, 6.0)
    d.add(elm.Line().at(discharge_node).to(timer.DIS).color(TIMING))
    d.add(elm.Dot().at(discharge_node).color(TIMING))
    text(d, "R1\n1 kΩ", (0.35, 7.5), color=TIMING, fontsize=10.5)
    text(d, "pin 7\nDISCHARGE", (timer.DIS[0] - 0.1, timer.DIS[1] + 0.55), color=GRAY, fontsize=8.5)

    r2 = d.add(elm.Resistor().down().at(discharge_node).to((timing_x, 3.6)).color(TIMING))
    timing_node = r2.end
    text(d, "R2\n68 kΩ", (0.3, 4.85), color=TIMING, fontsize=10.5)

    # Bring the timing node over to the TRIGGER/THRESHOLD pins and tie
    # them together with a visible vertical bridge.
    pin_tie_x = 3.3
    d.add(elm.Line().at(timing_node).to((pin_tie_x, timing_node[1])).color(TIMING))
    d.add(elm.Dot().at((pin_tie_x, timing_node[1])).color(TIMING))
    d.add(elm.Line().at((pin_tie_x, timer.TRG[1])).to(timer.TRG).color(TIMING))
    d.add(elm.Line().at((pin_tie_x, timer.THR[1])).to(timer.THR).color(TIMING))
    d.add(elm.Line().at((pin_tie_x, timer.TRG[1])).to((pin_tie_x, timer.THR[1])).color(TIMING))
    text(d, "pins 2 + 6 tied together", (pin_tie_x + 0.15, timing_node[1] + 0.42), color=GRAY, fontsize=8.5)
    text(d, "pin 2 TRIGGER", (timer.TRG[0] + 0.15, timer.TRG[1] - 0.42), color=GRAY, fontsize=7.5)
    text(d, "pin 6 THRESHOLD", (timer.THR[0] + 0.15, timer.THR[1] + 0.42), color=GRAY, fontsize=7.5)

    # C1 - polarized electrolytic timing capacitor. The + lead faces up,
    # toward the timing node, matching the lab's build instructions. The
    # label sits well clear of the tie-point text above and the ground
    # symbol below.
    cap = d.add(
        elm.Capacitor2(polar=True).down().at(timing_node).to((timing_x, 0.8)).color(TIMING)
    )
    ground(d, cap.end)
    text(d, "C1  10 µF electrolytic\n(+ lead toward timing node)", (2.75, 1.55), color=TIMING, fontsize=9.5)

    # Pin 3 OUTPUT drives R3 then D1 to ground.
    output_y = timer.OUT[1]
    text(d, "pin 3\nOUTPUT", (timer.OUT[0] + 0.1, output_y - 0.55), color=GRAY, fontsize=8.5)
    r3 = d.add(elm.Resistor().right().at(timer.OUT).to((11.5, output_y)).color(OUTPUT))
    text(d, "R3  330 Ω", (9.5, output_y + 0.7), color=OUTPUT, fontsize=10.5)

    led_x = 12.3
    d.add(elm.Line().at(r3.end).to((led_x, output_y)).color(OUTPUT))
    led = d.add(elm.LED().down().at((led_x, output_y)).to((led_x, 1.0)).color(OUTPUT))
    ground(d, led.end)
    text(d, "D1\nLED", (13.25, 3.1), color=OUTPUT, fontsize=10.5)
    text(d, "anode (A)", (led_x + 0.85, output_y - 0.55), color=GRAY, fontsize=8)
    text(d, "cathode (K)", (led_x + 0.95, 1.3), color=GRAY, fontsize=8)

    # Frequency callout near the timing network.
    text(
        d,
        "f = 1.44 / ((R1 + 2R2) x C1) ≈ 1.1 Hz\nduty cycle D = (R1 + R2) / (R1 + 2R2) ≈ 51%",
        (4.6, -0.75),
        color=GRAY,
        fontsize=10,
    )

    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
