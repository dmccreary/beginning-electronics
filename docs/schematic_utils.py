"""Shared rendering helpers for the textbook's Schemdraw circuit programs."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Callable

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
PURPLE = "#6a4c93"
GRAY = "#5f6b73"
LIGHT_GRAY = "#c8cdd1"


def drawing(*, fontsize: float = 10.5, unit: float = 3.0) -> schemdraw.Drawing:
    """Return a non-GUI drawing with the textbook's standard style."""
    result = schemdraw.Drawing(show=False)
    result.config(unit=unit, fontsize=fontsize, lw=1.8, color=INK)
    return result


def text(
    d: schemdraw.Drawing,
    value: str,
    xy: tuple[float, float],
    *,
    color: str = INK,
    fontsize: float = 10,
) -> None:
    """Add positioned text without changing the circuit cursor."""
    d.add(elm.Label(value, fontsize=fontsize).at(xy).color(color))


def wire(
    d: schemdraw.Drawing,
    start: tuple[float, float],
    end: tuple[float, float],
    *,
    color: str = INK,
    lw: float | None = None,
    ls: str | None = None,
) -> None:
    """Add an explicit wire or annotation line."""
    line = elm.Line().at(start).to(end).color(color)
    if lw is not None:
        line = line.linewidth(lw)
    if ls is not None:
        line = line.linestyle(ls)
    d.add(line)


def arrow(
    d: schemdraw.Drawing,
    start: tuple[float, float],
    end: tuple[float, float],
    *,
    color: str = BLUE,
    lw: float = 2.1,
) -> None:
    """Add a current, voltage, or signal-flow annotation arrow."""
    d.add(elm.Arrow().at(start).to(end).color(color).linewidth(lw))


def dot(
    d: schemdraw.Drawing,
    xy: tuple[float, float],
    *,
    color: str = INK,
    open: bool = False,
) -> None:
    """Add a closed junction or open terminal dot."""
    d.add(elm.Dot(open=open).at(xy).color(color))


def ground(d: schemdraw.Drawing, xy: tuple[float, float], *, color: str = INK) -> None:
    """Add a ground symbol at an explicit return point."""
    d.add(elm.Ground().at(xy).color(color))


def save_cli(build: Callable[[], schemdraw.Drawing], description: str | None) -> None:
    """Parse a positional output path, build the drawing, and save it."""
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument("output", type=Path, help="Output .svg or .png path")
    args = parser.parse_args()
    if args.output.suffix.lower() not in {".svg", ".png"}:
        parser.error("output must end in .svg or .png")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    build().save(
        args.output,
        transparent=args.output.suffix.lower() == ".svg",
        dpi=180,
    )
