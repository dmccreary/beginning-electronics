#!/usr/bin/env python3
"""Render a complete 555 astable LED circuit.

Prompt:
    Create a clear instructional schematic for Chapter 14 showing a complete
    555 timer astable LED circuit before the frequency equation. Show every
    555 pin connection: pin 8 VCC and pin 4 RESET tied to +5 V; pin 1 GND to
    ground; R1 = 1 kΩ from +5 V to pin 7 DISCHARGE; R2 = 68 kΩ from pin 7 to
    the timing node; pins 2 TRIGGER and 6 THRESHOLD tied to that timing node;
    polarized C1 = 10 µF from the timing node to ground; pin 5 CONTROL bypassed to
    ground by C2 = 10 nF; C3 = 100 nF directly across +5 V and ground as the
    supply bypass; and pin 3 OUTPUT driving an LED through R3 = 330 Ω to
    ground. Use compact multiline labels that fit comfortably, keep roughly
    0.15 drawing units of visible clearance between symbols and labels, and
    space the functional branches so no label overlaps a symbol or wire.

Topology: +5V -> pin8,pin4,R1,C3; R1 -> pin7/R2; R2 -> pins2+6/C1;
pin5 -> C2 -> GND; pin3 -> R3 -> D1 LED -> GND; pin1,C1,C3 -> GND.
Assumptions: The LED is connected to light while pin 3 is high. The selected
timing values match the chapter's approximately 1.1 Hz slow-blink example.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import schemdraw
import schemdraw.elements as elm

schemdraw.use("matplotlib")


INK = "#17202a"
POWER = "#b71c1c"
TIMING = "#1565c0"
OUTPUT = "#2e7d32"
SUPPORT = "#6a4c93"
GRAY = "#5f6b73"


def add_text(
    drawing: schemdraw.Drawing,
    text: str,
    xy: tuple[float, float],
    *,
    color: str = INK,
    fontsize: float = 11,
) -> None:
    """Add an annotation without changing the circuit cursor."""
    drawing.add(elm.Label(text, fontsize=fontsize).at(xy).color(color))


def add_wire(
    drawing: schemdraw.Drawing,
    start: tuple[float, float],
    end: tuple[float, float],
    *,
    color: str = INK,
) -> None:
    """Draw an explicit wire between two coordinates."""
    drawing.add(elm.Line().at(start).to(end).color(color))


def add_ground(drawing: schemdraw.Drawing, xy: tuple[float, float]) -> None:
    """Place a common-ground symbol at a branch return."""
    drawing.add(elm.Ground().at(xy).color(INK))


def build_drawing() -> schemdraw.Drawing:
    """Build and return the complete astable LED schematic."""
    drawing = schemdraw.Drawing(show=False)
    drawing.config(unit=3.0, fontsize=11, lw=1.8, color=INK)

    # Central 555 block exposes and numbers all eight device pins.
    timer = drawing.add(elm.Ic555().at((5.0, 2.0)).color(INK))

    # Positive supply rail, VCC, and active-high RESET.
    supply_y = 9.0
    add_wire(drawing, (1.6, supply_y), (15.0, supply_y), color=POWER)
    add_wire(drawing, timer.Vcc, (timer.Vcc[0], supply_y), color=POWER)
    add_wire(drawing, timer.RST, (timer.RST[0], supply_y), color=POWER)
    drawing.add(elm.Dot().at((timer.Vcc[0], supply_y)).color(POWER))
    drawing.add(elm.Dot().at((timer.RST[0], supply_y)).color(POWER))
    add_text(drawing, "+5 V", (1.6, 9.45), color=POWER, fontsize=14)
    add_text(drawing, "RESET tied high", (timer.RST[0] - 0.15, 9.45), color=POWER, fontsize=9)

    # Pin 1 ground connection.
    add_wire(drawing, timer.GND, (timer.GND[0], 0.55))
    add_ground(drawing, (timer.GND[0], 0.55))

    # Classic astable timing network on the left.
    timing_x = 1.8
    r1 = drawing.add(
        elm.Resistor().down().at((timing_x, supply_y)).to((timing_x, 6.0)).color(TIMING)
    )
    discharge_node = (timing_x, 6.0)
    add_wire(drawing, discharge_node, timer.DIS, color=TIMING)
    drawing.add(elm.Dot().at(discharge_node).color(TIMING))

    r2 = drawing.add(
        elm.Resistor().down().at(discharge_node).to((timing_x, 3.75)).color(TIMING)
    )
    timing_node = r2.end
    pin_tie_x = 3.45
    add_wire(drawing, timing_node, (pin_tie_x, timing_node[1]), color=TIMING)
    add_wire(drawing, (pin_tie_x, timer.TRG[1]), timer.TRG, color=TIMING)
    add_wire(drawing, (pin_tie_x, timer.THR[1]), timer.THR, color=TIMING)
    add_wire(
        drawing,
        (pin_tie_x, timer.TRG[1]),
        (pin_tie_x, timer.THR[1]),
        color=TIMING,
    )
    drawing.add(elm.Dot().at((pin_tie_x, timing_node[1])).color(TIMING))

    timing_cap = drawing.add(
        elm.Capacitor2(polar=True)
        .down()
        .at(timing_node)
        .to((timing_x, 0.8))
        .color(TIMING)
    )
    add_ground(drawing, timing_cap.end)

    add_text(drawing, "R1\n1 kΩ", (0.75, 7.5), color=TIMING, fontsize=10)
    add_text(drawing, "R2\n68 kΩ", (0.70, 4.9), color=TIMING, fontsize=10)
    add_text(drawing, "C1  10 µF\ntiming", (0.55, 2.0), color=TIMING, fontsize=10)
    add_text(
        drawing,
        "pins 2 + 6\ntied together",
        (2.90, 2.55),
        color=TIMING,
        fontsize=9,
    )

    # Pin 5 control-voltage bypass branch.
    control_x = 10.65
    add_wire(drawing, timer.CTL, (control_x, timer.CTL[1]), color=SUPPORT)
    control_cap = drawing.add(
        elm.Capacitor().down().at((control_x, timer.CTL[1])).to((control_x, 1.0)).color(SUPPORT)
    )
    add_ground(drawing, control_cap.end)
    add_text(
        drawing,
        "C2  10 nF\nCONTROL\nbypass",
        (11.80, 2.25),
        color=SUPPORT,
        fontsize=9,
    )

    # Pin 3 output drives a visible LED through its current-limiting resistor.
    output_y = timer.OUT[1]
    output_resistor = drawing.add(
        elm.Resistor().right().at(timer.OUT).to((12.5, output_y)).color(OUTPUT)
    )
    led_x = 13.35
    add_wire(drawing, output_resistor.end, (led_x, output_y), color=OUTPUT)
    led = drawing.add(
        elm.LED().down().at((led_x, output_y)).to((led_x, 1.0)).color(OUTPUT)
    )
    add_ground(drawing, led.end)
    add_text(drawing, "R3  330 Ω", (11.1, 5.85), color=OUTPUT, fontsize=10)
    add_text(drawing, "D1\nLED", (14.45, 3.25), color=OUTPUT, fontsize=10)
    add_text(drawing, "BLINK OUTPUT", (12.65, 6.25), color=OUTPUT, fontsize=10)

    # Supply bypass capacitor connects directly between the power rails.
    bypass_x = 15.0
    supply_bypass = drawing.add(
        elm.Capacitor().down().at((bypass_x, supply_y)).to((bypass_x, 6.65)).color(POWER)
    )
    add_ground(drawing, supply_bypass.end)
    add_text(
        drawing,
        "C3  100 nF\nsupply bypass",
        (16.2, 7.8),
        color=POWER,
        fontsize=9,
    )

    # Compact functional guide beneath the circuit.
    add_text(
        drawing,
        "R1 + R2 + C1 set the blink rate   •   C2 stabilizes pin 5   •   C3 filters supply noise",
        (8.2, -0.65),
        color=GRAY,
        fontsize=10,
    )
    return drawing


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="Output .svg or .png path")
    args = parser.parse_args()
    if args.output.suffix.lower() not in {".svg", ".png"}:
        parser.error("output must end in .svg or .png")
    args.output.parent.mkdir(parents=True, exist_ok=True)

    drawing = build_drawing()
    drawing.save(
        args.output,
        transparent=args.output.suffix.lower() == ".svg",
        dpi=180,
    )


if __name__ == "__main__":
    main()
