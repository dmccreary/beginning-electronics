#!/usr/bin/env python3
"""Render a safe solar-panel-to-LiPo charging path.

Prompt:
    Create a safety-focused instructional schematic for Chapter 23 titled by
    the chapter heading "Solar Panel LiPo Charging Circuit." Show a 5–6 V
    hobby solar panel feeding a solar-rated single-cell LiPo charge-controller
    module. Put a Schottky blocking diode in the positive input path, with its
    anode toward the panel and cathode toward the controller, and label it as
    conditional when the selected module does not already provide equivalent
    reverse-current protection. Label the controller as a CC/CV charger with
    battery-appropriate current limiting, 4.2 V charge cutoff, and a protected
    load output. Use separate paired BAT+/BAT− connections to a one-cell LiPo
    battery and LOAD+/LOAD− connections to a night-light load. Make the safe
    left-to-right energy path obvious and separately show a large red crossed-
    out path stating that a solar panel must never connect directly to a bare
    LiPo cell. Keep all wiring orthogonal, explicitly orient every two-terminal
    symbol, avoid unnecessary crossings or skewed lines, and maintain about
    0.15 drawing units of visible spacing between symbols and labels. Split
    the PV1 "solar panel" label across separate lines so it remains clearly
    spaced from the panel symbol.

Topology: PV1+ -> D1 anode; D1 cathode -> U1 IN+; PV1- -> U1 IN-;
U1 BAT+/BAT- -> B1 single-cell LiPo; U1 LOAD+/LOAD- -> L1 night-light load.
The crossed-out direct-panel path is a warning annotation, not a connection.
Assumptions: U1 is a solar-input-compatible, protection-equipped one-cell
    LiPo charger whose charge-current setting matches B1. D1 is installed only
    when U1 lacks equivalent panel-input reverse-current blocking. A bare TP4056
    IC is not represented as having protected LOAD terminals; use a module that
    actually provides the labeled protected or power-path outputs.
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
SOLAR_BLUE = "#1565c0"
POWER_RED = "#b71c1c"
MODULE_GREEN = "#2e7d32"
BATTERY_PURPLE = "#6a4c93"
LOAD_ORANGE = "#d35400"
GRAY = "#5f6b73"
DANGER = "#c62828"


def add_text(
    drawing: schemdraw.Drawing,
    text: str,
    xy: tuple[float, float],
    *,
    color: str = INK,
    fontsize: float = 10,
) -> None:
    """Add positioned text without changing electrical topology."""
    drawing.add(elm.Label(text, fontsize=fontsize).at(xy).color(color))


def add_wire(
    drawing: schemdraw.Drawing,
    start: tuple[float, float],
    end: tuple[float, float],
    *,
    color: str = INK,
    lw: float | None = None,
) -> None:
    """Draw an explicit connection between two anchors."""
    wire = elm.Line().at(start).to(end).color(color)
    if lw is not None:
        wire = wire.linewidth(lw)
    drawing.add(wire)


def build_drawing() -> schemdraw.Drawing:
    """Build the protected solar charging and load-power path."""
    drawing = schemdraw.Drawing(show=False)
    drawing.config(unit=3.0, fontsize=10.5, lw=1.8, color=INK)

    # U1 exposes distinct input, battery, and protected-load terminal pairs.
    charger_pins = [
        elm.IcPin(name="IN+", side="L", pos=0.74, anchorname="in_plus", lblsize=9),
        elm.IcPin(name="IN−", side="L", pos=0.24, anchorname="in_minus", lblsize=9),
        elm.IcPin(name="BAT+", side="R", pos=0.83, anchorname="bat_plus", lblsize=9),
        elm.IcPin(name="BAT−", side="R", pos=0.49, anchorname="bat_minus", lblsize=9),
        elm.IcPin(name="LOAD+", side="R", pos=0.34, anchorname="load_plus", lblsize=8),
        elm.IcPin(name="LOAD−", side="R", pos=0.08, anchorname="load_minus", lblsize=8),
    ]
    charger = drawing.add(
        elm.Ic(size=(5.0, 5.5), pins=charger_pins)
        .at((6.0, 1.6))
        .label("U1\n1-CELL LiPo CHARGER\nCC/CV + current limit\n4.2 V cutoff\nprotected LOAD output")
        .color(MODULE_GREEN)
    )

    # Solar panel and the positive-path blocking stage.
    solar = drawing.add(
        elm.Solar()
        .down()
        .at((1.45, charger.in_plus[1]))
        .to((1.45, charger.in_minus[1]))
        .color(SOLAR_BLUE)
    )
    blocking = drawing.add(
        elm.Diode()
        .right()
        .at((2.65, charger.in_plus[1]))
        .to((4.45, charger.in_plus[1]))
        .color(POWER_RED)
    )
    add_wire(drawing, solar.start, blocking.start, color=POWER_RED)
    add_wire(drawing, blocking.end, charger.in_plus, color=POWER_RED)
    add_wire(drawing, solar.end, charger.in_minus, color=INK)

    add_text(drawing, "+", (1.05, charger.in_plus[1] + 0.18), color=POWER_RED, fontsize=12)
    add_text(drawing, "−", (1.05, charger.in_minus[1] - 0.18), fontsize=12)
    add_text(drawing, "PV1\n5–6 V\nsolar\npanel", (0.10, 4.25), color=SOLAR_BLUE, fontsize=10)
    add_text(
        drawing,
        "D1  Schottky\nblocking diode\n(if U1 requires it)",
        (3.55, charger.in_plus[1] + 0.75),
        color=POWER_RED,
        fontsize=9,
    )
    add_text(
        drawing,
        "SUNLIGHT POWER  →",
        (3.55, charger.in_plus[1] - 0.62),
        color=SOLAR_BLUE,
        fontsize=9,
    )

    # Battery port: both conductors terminate only at U1's dedicated BAT pair.
    battery_x = 13.05
    battery = drawing.add(
        elm.BatteryCell()
        .down()
        .at((battery_x, charger.bat_plus[1]))
        .to((battery_x, charger.bat_minus[1]))
        .color(BATTERY_PURPLE)
    )
    add_wire(drawing, charger.bat_plus, battery.start, color=BATTERY_PURPLE)
    add_wire(drawing, battery.end, charger.bat_minus, color=BATTERY_PURPLE)
    add_text(drawing, "+", (12.65, charger.bat_plus[1] + 0.15), color=BATTERY_PURPLE, fontsize=11)
    add_text(drawing, "−", (12.65, charger.bat_minus[1] - 0.15), color=BATTERY_PURPLE, fontsize=11)
    add_text(
        drawing,
        "B1  ONE-CELL LiPo\n3.7 V nominal\n4.2 V maximum",
        (13.05, charger.bat_plus[1] + 1.05),
        color=BATTERY_PURPLE,
        fontsize=9,
    )

    # Protected load port: the project load does not bypass U1's protection.
    load_x = 15.85
    load = drawing.add(
        elm.Lamp2()
        .down()
        .at((load_x, charger.load_plus[1]))
        .to((load_x, charger.load_minus[1]))
        .color(LOAD_ORANGE)
    )
    add_wire(drawing, charger.load_plus, load.start, color=LOAD_ORANGE)
    add_wire(drawing, load.end, charger.load_minus, color=LOAD_ORANGE)
    add_text(drawing, "+", (15.45, charger.load_plus[1] + 0.15), color=LOAD_ORANGE, fontsize=11)
    add_text(drawing, "−", (15.45, charger.load_minus[1] - 0.15), color=LOAD_ORANGE, fontsize=11)
    add_text(
        drawing,
        "L1\nNIGHT-LIGHT\nLOAD",
        (17.55, (charger.load_plus[1] + charger.load_minus[1]) / 2),
        color=LOAD_ORANGE,
        fontsize=9,
    )

    add_text(
        drawing,
        "SAFE PATH: panel → input protection → charge controller → BAT and protected LOAD ports",
        (8.7, 7.85),
        color=MODULE_GREEN,
        fontsize=11,
    )
    add_text(
        drawing,
        "Use a solar-rated module and set its charge current for the battery.",
        (8.7, 7.35),
        color=GRAY,
        fontsize=9,
    )

    # Strong, non-electrical warning: the broken path is intentionally not wired.
    warning_y = 0.05
    add_text(drawing, "SOLAR PANEL", (2.2, warning_y + 0.45), color=DANGER, fontsize=10)
    add_wire(drawing, (3.25, warning_y), (6.6, warning_y), color=DANGER, lw=2.5)
    add_text(drawing, "✕", (7.15, warning_y), color=DANGER, fontsize=24)
    add_wire(drawing, (7.70, warning_y), (11.05, warning_y), color=DANGER, lw=2.5)
    add_text(drawing, "BARE LiPo CELL", (12.2, warning_y + 0.45), color=DANGER, fontsize=10)
    add_text(
        drawing,
        "NEVER connect a solar panel directly to a bare LiPo — no charge control, current limit, or cutoff.",
        (8.0, -0.75),
        color=DANGER,
        fontsize=11,
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
