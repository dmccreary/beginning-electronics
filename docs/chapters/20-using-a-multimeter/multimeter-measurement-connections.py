#!/usr/bin/env python3
"""Render safe multimeter connection patterns for voltage, current, and resistance.

Prompt:
    Create a three-panel instructional circuit diagram for Chapter 20. Show a
    voltmeter connected in parallel across a powered load, an ammeter inserted
    in series after opening the circuit, and an ohmmeter connected across an
    isolated, unpowered resistor. Label probe polarity for voltage and current,
    note that resistance probe order does not matter, and clearly emphasize
    that an ammeter must never be connected directly across a voltage source.

Topology: V panel = source with load and voltmeter in parallel; A panel =
source, ammeter, and load in one series loop; Ω panel = isolated resistor and
ohmmeter in parallel with no external source.
Assumptions: the example source is safe 5 V DC and each load is 1 kΩ.
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
    """Add a positioned annotation without affecting circuit topology."""
    drawing.add(elm.Label(text, fontsize=fontsize).at(xy).color(color))


def add_wire(
    drawing: schemdraw.Drawing,
    start: tuple[float, float],
    end: tuple[float, float],
) -> None:
    """Add an explicit wire between two circuit coordinates."""
    drawing.add(elm.Line().at(start).to(end).color(INK))


def add_voltage_panel(drawing: schemdraw.Drawing, x: float) -> None:
    """Draw a powered load with the voltmeter connected in parallel."""
    add_text(drawing, "1  VOLTAGE (V)", (x + 2.5, 4.35), color=BLUE, fontsize=14)
    add_text(drawing, "POWER ON", (x + 2.5, 3.85), color=GREEN, fontsize=11)

    source = drawing.add(elm.SourceV().up().at((x, 0)).color(INK))
    load = drawing.add(elm.Resistor().down().at((x + 3.0, 3.0)).color(INK))
    voltmeter = drawing.add(elm.MeterV().down().at((x + 5.0, 3.0)).color(BLUE))

    add_wire(drawing, source.end, load.start)
    add_wire(drawing, load.end, source.start)
    add_wire(drawing, load.start, voltmeter.start)
    add_wire(drawing, voltmeter.end, load.end)
    drawing.add(elm.Dot().at(load.start).color(INK))
    drawing.add(elm.Dot().at(load.end).color(INK))

    add_text(drawing, "5 V\nsource", (x - 0.85, 1.5), fontsize=11)
    add_text(drawing, "LOAD\n1 kΩ", (x + 2.1, 1.5), fontsize=11)
    add_text(drawing, "+ red probe", (x + 5.75, 2.75), color=RED, fontsize=9)
    add_text(drawing, "− black probe", (x + 5.85, 0.25), color=INK, fontsize=9)
    add_text(drawing, "Connect ACROSS the load\n(parallel — circuit stays closed)", (x + 2.5, -0.75), color=GRAY, fontsize=10)


def add_current_panel(drawing: schemdraw.Drawing, x: float) -> None:
    """Draw an ammeter inserted into one opened series path."""
    add_text(drawing, "2  CURRENT (A or mA)", (x + 2.5, 4.35), color=BLUE, fontsize=14)
    add_text(drawing, "POWER ON", (x + 2.5, 3.85), color=GREEN, fontsize=11)

    source = drawing.add(elm.SourceV().up().at((x, 0)).color(INK))
    ammeter = drawing.add(elm.MeterA().right().at((x + 1.0, 3.0)).color(BLUE))
    load = drawing.add(elm.Resistor().down().at((x + 5.0, 3.0)).color(INK))

    add_wire(drawing, source.end, ammeter.start)
    add_wire(drawing, ammeter.end, load.start)
    add_wire(drawing, load.end, source.start)

    add_text(drawing, "5 V\nsource", (x - 0.85, 1.5), fontsize=11)
    add_text(drawing, "LOAD\n1 kΩ", (x + 5.9, 1.5), fontsize=11)
    add_text(drawing, "red", (x + 0.85, 3.5), color=RED, fontsize=9)
    add_text(drawing, "black", (x + 4.15, 3.5), color=INK, fontsize=9)
    add_text(drawing, "OPEN the circuit here; insert meter\n(series — all current flows through A)", (x + 2.5, -0.75), color=GRAY, fontsize=10)


def add_resistance_panel(drawing: schemdraw.Drawing, x: float) -> None:
    """Draw an ohmmeter across a disconnected, unpowered resistor."""
    add_text(drawing, "3  RESISTANCE (Ω)", (x + 2.5, 4.35), color=BLUE, fontsize=14)
    add_text(drawing, "POWER OFF", (x + 2.5, 3.85), color=RED, fontsize=11)

    resistor = drawing.add(elm.Resistor().down().at((x + 1.5, 3.0)).color(INK))
    ohmmeter = drawing.add(elm.MeterOhm().down().at((x + 4.5, 3.0)).color(BLUE))

    add_wire(drawing, resistor.start, ohmmeter.start)
    add_wire(drawing, ohmmeter.end, resistor.end)
    drawing.add(elm.Dot(open=True).at(resistor.start).color(INK))
    drawing.add(elm.Dot(open=True).at(resistor.end).color(INK))

    add_text(drawing, "R1\n1 kΩ", (x + 0.55, 1.5), fontsize=11)
    add_text(drawing, "No battery or supply", (x + 3.0, 3.35), color=RED, fontsize=9)
    add_text(drawing, "Probe order\ndoes not matter", (x + 3.0, 0.65), color=GRAY, fontsize=9)
    add_text(drawing, "Isolate the component\n(remove it or lift one lead)", (x + 2.5, -0.75), color=GRAY, fontsize=10)


def build_drawing() -> schemdraw.Drawing:
    """Build and return the three-panel multimeter schematic."""
    drawing = schemdraw.Drawing(show=False)
    drawing.config(unit=3.0, fontsize=12, lw=1.8, color=INK)

    add_voltage_panel(drawing, 0.0)
    add_current_panel(drawing, 8.5)
    add_resistance_panel(drawing, 17.0)

    add_text(
        drawing,
        "⚠  NEVER connect an ammeter directly across a voltage source — that creates a short circuit.",
        (11.0, -1.75),
        color=RED,
        fontsize=13,
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
