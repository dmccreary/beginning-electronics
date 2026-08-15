#!/usr/bin/env python3
"""Render an RC push-button debounce circuit in its two operating states.

Prompt:
    Create a clear instructional diagram for Chapter 16 titled by the chapter
    heading "RC Push-Button Debounce Circuit." Use two matched side-by-side
    panels showing the same active-low pull-up debounce topology in its two
    states. In both panels, connect +5 V through R1 = 10 kΩ to the OUT node;
    connect C1 = 0.1 µF from OUT to ground; and connect a normally-open
    momentary push button S1 from OUT to ground. In the RELEASED panel, show
    S1 open, the capacitor charging through R1, and OUT rising smoothly toward
    +5 V (logic HIGH). In the PRESSED panel, show S1 closed, the capacitor
    discharging through the button to ground, and OUT falling to 0 V (logic
    LOW). Use distinct arrows for the charge and discharge paths. Keep both
    circuits orthogonal, orient every ground branch top-to-bottom, avoid wires
    crossing symbols, avoid accidental skewed lines, keep labels about 0.15
    drawing units from symbols, and state that R1 × C1 = 1 ms.

Topology: +5V -> R1 -> OUT; OUT -> C1 -> GND; OUT -> S1(NO) -> GND.
Released: S1 open and C1 charges through R1. Pressed: S1 closed and C1
discharges through S1. The two panels repeat one circuit to show state change.
Assumptions: OUT feeds a high-impedance digital input. The pressed-state
button uses Schemdraw's closed-contact rendering to depict the normally-open
momentary button while it is being held down.
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
CHARGE = "#1565c0"
DISCHARGE = "#d35400"
GRAY = "#5f6b73"
GREEN = "#2e7d32"


def add_text(
    drawing: schemdraw.Drawing,
    text: str,
    xy: tuple[float, float],
    *,
    color: str = INK,
    fontsize: float = 10,
) -> None:
    """Add a positioned annotation without altering circuit topology."""
    drawing.add(elm.Label(text, fontsize=fontsize).at(xy).color(color))


def add_wire(
    drawing: schemdraw.Drawing,
    start: tuple[float, float],
    end: tuple[float, float],
    *,
    color: str = INK,
) -> None:
    """Draw an explicit orthogonal wire segment."""
    drawing.add(elm.Line().at(start).to(end).color(color))


def add_ground(drawing: schemdraw.Drawing, xy: tuple[float, float]) -> None:
    """Place a common-ground symbol."""
    drawing.add(elm.Ground().at(xy).color(INK))


def add_path_arrow(
    drawing: schemdraw.Drawing,
    start: tuple[float, float],
    end: tuple[float, float],
    *,
    color: str,
) -> None:
    """Add a current-path arrow offset from the electrical wiring."""
    drawing.add(elm.Arrow().at(start).to(end).color(color).linewidth(2.2))


def add_debounce_panel(
    drawing: schemdraw.Drawing,
    *,
    center_x: float,
    pressed: bool,
) -> None:
    """Draw one state of the active-low RC debounce circuit."""
    supply_y = 7.5
    node_y = 4.55
    return_y = 1.15
    resistor_x = center_x - 0.75
    button_x = center_x + 1.85

    # Supply, pull-up resistor, and the shared output node.
    add_wire(drawing, (resistor_x - 0.8, supply_y), (resistor_x + 0.8, supply_y), color=POWER)
    drawing.add(elm.Dot().at((resistor_x, supply_y)).color(POWER))
    pullup = drawing.add(
        elm.Resistor().down().at((resistor_x, supply_y)).to((resistor_x, node_y)).color(INK)
    )
    out_node = pullup.end
    drawing.add(elm.Dot().at(out_node).color(INK))
    add_text(drawing, "+5 V", (resistor_x - 0.8, 7.95), color=POWER, fontsize=12)
    add_text(drawing, "R1\n10 kΩ\npull-up", (resistor_x - 1.30, 6.05), fontsize=9)

    # Capacitor branch uses explicit top-to-bottom terminal orientation.
    debounce_cap = drawing.add(
        elm.Capacitor().down().at(out_node).to((resistor_x, return_y)).color(INK)
    )
    add_ground(drawing, debounce_cap.end)
    add_text(drawing, "C1\n0.1 µF", (resistor_x - 1.15, 2.75), fontsize=9)

    # Normally-open momentary button: open when released, closed while pressed.
    add_wire(drawing, out_node, (button_x, node_y))
    button = drawing.add(
        elm.Button(nc=pressed).down().at((button_x, node_y)).to((button_x, return_y)).color(INK)
    )
    add_ground(drawing, button.end)

    state_color = DISCHARGE if pressed else CHARGE
    state_word = "PRESSED" if pressed else "RELEASED"
    contact_word = "CLOSED" if pressed else "OPEN"
    out_text = "OUT = LOW\nfalls to 0 V" if pressed else "OUT = HIGH\nrises toward +5 V"
    add_text(drawing, state_word, (center_x, 8.55), color=state_color, fontsize=13)
    add_text(drawing, f"S1\nNO button\n{contact_word}", (button_x + 1.05, 3.15), fontsize=9)
    add_text(drawing, out_text, (center_x + 0.75, 5.50), color=GREEN, fontsize=9)

    if pressed:
        # C1's stored charge leaves OUT, passes through closed S1, and reaches ground.
        add_path_arrow(
            drawing,
            (resistor_x + 0.35, node_y + 0.35),
            (button_x - 0.25, node_y + 0.35),
            color=DISCHARGE,
        )
        add_path_arrow(
            drawing,
            (button_x + 0.38, node_y - 0.35),
            (button_x + 0.38, return_y + 0.65),
            color=DISCHARGE,
        )
        add_text(
            drawing,
            "DISCHARGE PATH\nC1 → S1 → GND",
            (center_x, 0.20),
            color=DISCHARGE,
            fontsize=10,
        )
    else:
        # Supply current charges C1 through R1 while the button is open.
        add_path_arrow(
            drawing,
            (resistor_x + 0.42, supply_y - 0.25),
            (resistor_x + 0.42, node_y + 0.65),
            color=CHARGE,
        )
        add_path_arrow(
            drawing,
            (resistor_x - 0.42, node_y - 0.45),
            (resistor_x - 0.42, return_y + 1.05),
            color=CHARGE,
        )
        add_text(
            drawing,
            "CHARGE PATH\n+5 V → R1 → C1",
            (center_x, 0.20),
            color=CHARGE,
            fontsize=10,
        )


def build_drawing() -> schemdraw.Drawing:
    """Build the released/pressed debounce comparison."""
    drawing = schemdraw.Drawing(show=False)
    drawing.config(unit=3.0, fontsize=10.5, lw=1.8, color=INK)

    add_debounce_panel(drawing, center_x=3.75, pressed=False)
    add_debounce_panel(drawing, center_x=11.25, pressed=True)

    # Non-electrical divider separates the repeated-state panels.
    drawing.add(
        elm.Line()
        .down()
        .at((7.55, 8.25))
        .to((7.55, 0.75))
        .color("#c8cdd1")
        .linestyle("--")
        .linewidth(1.2)
    )
    add_text(
        drawing,
        "Same circuit, two button states   •   R1 × C1 = 1 ms",
        (7.55, -0.60),
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
