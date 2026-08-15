#!/usr/bin/env python3
"""Render a protected NPN low-side DC motor driver.

Prompt:
    Create a clear instructional schematic of a protected transistor motor
    driver for Chapter 19. Show a 2N2222 NPN transistor as a low-side switch,
    a base resistor from a control or PWM input, a DC motor connected to +5 V,
    a flyback diode directly across the motor with its cathode toward +5 V,
    and an optional 100 nF noise-suppression capacitor directly across the
    motor terminals. Explain the normal motor-current path and the safe
    switch-off path provided by the diode, with generously spaced component
    labels that do not overlap symbols or wires. Place the C1 label farther
    to the right of the capacitor so that the right side is not cramped, and
    shift the diode labels and transistor label half that distance to the
    right for balanced spacing.

Topology: +5 V -> M1 -> Q1 collector; Q1 emitter -> GND; control -> R1 -> Q1
base; D1 and C1 are each parallel with M1 between +5 V and Q1 collector.
Assumptions: M1 is a small 3–6 V hobby motor and Q1 is a 2N2222 suitable for
the motor's measured running and stall current.
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
BLUE = "#1565c0"
GREEN = "#2e7d32"
ORANGE = "#d35400"
RED = "#b71c1c"
GRAY = "#5f6b73"


def add_text(
    drawing: schemdraw.Drawing,
    text: str,
    xy: tuple[float, float],
    *,
    color: str = INK,
    fontsize: float = 12,
) -> None:
    """Add a positioned annotation without changing circuit topology."""
    drawing.add(elm.Label(text, fontsize=fontsize).at(xy).color(color))


def add_wire(
    drawing: schemdraw.Drawing,
    start: tuple[float, float],
    end: tuple[float, float],
    *,
    color: str = INK,
) -> None:
    """Add an explicit wire between two coordinates."""
    drawing.add(elm.Line().at(start).to(end).color(color))


def build_drawing() -> schemdraw.Drawing:
    """Build and return the protected motor-driver schematic."""
    drawing = schemdraw.Drawing(show=False)
    drawing.config(unit=3.0, fontsize=12, lw=1.8, color=INK)

    # Main switched-current path: supply -> motor -> NPN transistor -> ground.
    transistor = drawing.add(elm.BjtNpn(circle=True).at((4.0, 0.0)).color(INK))
    motor_x = transistor.collector[0]
    motor = drawing.add(elm.Motor().down().at((motor_x, 4.0)).color(BLUE))
    switch_node = motor.end

    add_wire(drawing, switch_node, transistor.collector)
    add_wire(drawing, transistor.emitter, (transistor.emitter[0], -1.25))
    drawing.add(elm.Ground().at((transistor.emitter[0], -1.25)).color(INK))

    # Control/PWM input and base-current limiting resistor.
    control_terminal = (-0.2, transistor.base[1])
    drawing.add(elm.Dot(open=True).at(control_terminal).color(BLUE))
    base_resistor = drawing.add(
        elm.Resistor().right().at((0.25, transistor.base[1])).length(2.5).color(BLUE)
    )
    add_wire(drawing, control_terminal, base_resistor.start, color=BLUE)
    add_wire(drawing, base_resistor.end, transistor.base, color=BLUE)

    # Flyback diode: anode at the switched node, cathode at the positive rail.
    diode_x = motor_x + 2.6
    flyback = drawing.add(elm.Diode().up().at((diode_x, switch_node[1])).color(ORANGE))
    add_wire(drawing, switch_node, flyback.start, color=ORANGE)
    add_wire(drawing, motor.start, flyback.end, color=ORANGE)

    # Optional suppression capacitor directly across the motor terminals.
    capacitor_x = motor_x + 5.2
    suppression_cap = drawing.add(
        elm.Capacitor().down().at((capacitor_x, motor.start[1])).color(GREEN)
    )
    add_wire(drawing, flyback.end, suppression_cap.start, color=GREEN)
    add_wire(drawing, suppression_cap.end, flyback.start, color=GREEN)

    # Junctions and supply reference.
    drawing.add(elm.Dot().at(motor.start).color(INK))
    drawing.add(elm.Dot().at(switch_node).color(INK))
    drawing.add(elm.Dot().at(flyback.end).color(INK))
    drawing.add(elm.Dot().at(flyback.start).color(INK))

    add_text(drawing, "+5 V MOTOR SUPPLY", (motor_x + 2.6, 4.55), color=RED, fontsize=14)
    add_text(drawing, "M1\nDC motor", (motor_x - 1.35, 2.5), color=BLUE, fontsize=12)
    add_text(drawing, "Q1\n2N2222\nlow-side switch", (motor_x + 1.70, -0.15), fontsize=11)
    add_text(drawing, "CONTROL / PWM", (-0.2, -0.55), color=BLUE, fontsize=11)
    add_text(drawing, "R1\nbase resistor", (1.5, 0.65), color=BLUE, fontsize=10)

    add_text(drawing, "K  cathode", (diode_x + 1.10, 3.72), color=ORANGE, fontsize=9)
    add_text(drawing, "D1\nflyback\ndiode", (diode_x + 1.20, 2.5), color=ORANGE, fontsize=11)
    add_text(drawing, "A  anode", (diode_x + 1.00, 1.25), color=ORANGE, fontsize=9)
    add_text(
        drawing,
        "C1  100 nF\noptional noise\nsuppression",
        (capacitor_x + 1.65, 2.5),
        color=GREEN,
        fontsize=10,
    )

    add_text(
        drawing,
        "MOTOR ON: current flows +5 V → M1 → Q1 → GND",
        (motor_x + 2.6, -1.95),
        color=BLUE,
        fontsize=11,
    )
    add_text(
        drawing,
        "SWITCH-OFF: D1 carries the collapsing motor current in a safe loop",
        (motor_x + 2.6, -2.45),
        color=ORANGE,
        fontsize=11,
    )
    add_text(
        drawing,
        "D1 and C1 connect directly across the same two motor terminals.",
        (motor_x + 2.6, -2.95),
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
