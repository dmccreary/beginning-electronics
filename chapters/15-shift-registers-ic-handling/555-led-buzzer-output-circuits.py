#!/usr/bin/env python3
"""Render shared 555 astable wiring with LED and piezo output options.

Prompt:
    Create a clear Chapter 15 schematic titled by the chapter heading "555
    LED Blinker and Buzzer Driver Circuits." Draw one shared 555 astable
    timing core with +5 V on pins 8 and 4, ground on pin 1, R1 = 1 kΩ from
    +5 V to pin 7, R2 from pin 7 to the joined pins 2 and 6, timing capacitor
    C1 from pins 2 and 6 to ground, and a 10 nF CONTROL-pin bypass capacitor.
    Show the chapter's two timing choices: R2 = 68 kΩ and C1 = 10 µF for an
    approximately 1.1 Hz LED blink, or R2 = 6.8 kΩ and C1 = 0.1 µF for an
    approximately 990 Hz piezo tone. To the right, show two safe, independent
    output options side by side and make clear that pin 3 connects to only one
    option: (A) pin 3 through a 330 Ω current-limiting resistor to an LED and
    ground, with anode and cathode polarity marked; (B) pin 3 directly across
    a small piezo buzzer and ground, with positive and negative terminals
    marked. Orient the piezo symbol with its connectors at the top and bottom
    so the ground return is a straight vertical line that does not cross the
    symbol. State that the small piezo needs no transistor, while a motor or
    high-current load does require a transistor driver. Use compact labels,
    about 0.15 drawing units of visible symbol-to-label clearance, and no
    label, wire, or symbol collisions.

Topology: +5V -> pin8,pin4,R1; R1 -> pin7/R2; R2 -> pins2+6/C1;
pin5 -> C2 -> GND; pin1,C1 -> GND. Alternative A: pin3 -> R3 -> D1 -> GND.
Alternative B: pin3 -> BZ1 -> GND. The alternatives are not simultaneous.
Assumptions: BZ1 is the chapter's small two-terminal piezo transducer and is
drawn with Schemdraw's generic two-terminal audible-transducer symbol.
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
LED_COLOR = "#2e7d32"
PIEZO = "#6a4c93"
GRAY = "#5f6b73"
WARNING = "#a64b00"


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
) -> None:
    """Add an explicit electrical connection."""
    drawing.add(elm.Line().at(start).to(end).color(color))


def add_ground(drawing: schemdraw.Drawing, xy: tuple[float, float]) -> None:
    """Place a common-ground symbol at a branch return."""
    drawing.add(elm.Ground().at(xy).color(INK))


def build_drawing() -> schemdraw.Drawing:
    """Build the shared astable core and two alternative output circuits."""
    drawing = schemdraw.Drawing(show=False)
    drawing.config(unit=3.0, fontsize=10.5, lw=1.8, color=INK)

    # Shared astable timing core.
    timer = drawing.add(elm.Ic555().at((4.2, 2.0)).color(INK))
    supply_y = 9.0
    add_wire(drawing, (1.35, supply_y), (7.6, supply_y), color=POWER)
    add_wire(drawing, timer.RST, (timer.RST[0], supply_y), color=POWER)
    add_wire(drawing, timer.Vcc, (timer.Vcc[0], supply_y), color=POWER)
    drawing.add(elm.Dot().at((timer.RST[0], supply_y)).color(POWER))
    drawing.add(elm.Dot().at((timer.Vcc[0], supply_y)).color(POWER))
    add_text(drawing, "+5 V", (1.35, 9.45), color=POWER, fontsize=13)
    add_text(drawing, "pin 4 RESET tied high", (5.65, 9.45), color=POWER, fontsize=9)

    add_wire(drawing, timer.GND, (timer.GND[0], 0.55))
    add_ground(drawing, (timer.GND[0], 0.55))

    timing_x = 1.55
    r1 = drawing.add(
        elm.Resistor().down().at((timing_x, supply_y)).to((timing_x, 6.0)).color(TIMING)
    )
    discharge_node = r1.end
    add_wire(drawing, discharge_node, timer.DIS, color=TIMING)
    drawing.add(elm.Dot().at(discharge_node).color(TIMING))

    r2 = drawing.add(
        elm.Resistor().down().at(discharge_node).to((timing_x, 3.75)).color(TIMING)
    )
    timing_node = r2.end
    pin_tie_x = 2.95
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
        elm.Capacitor().down().at(timing_node).to((timing_x, 0.85)).color(TIMING)
    )
    add_ground(drawing, timing_cap.end)

    add_text(drawing, "R1\n1 kΩ", (0.55, 7.5), color=TIMING, fontsize=9)
    add_text(drawing, "R2", (0.70, 4.9), color=TIMING, fontsize=9)
    add_text(drawing, "C1", (0.75, 2.15), color=TIMING, fontsize=9)
    add_text(drawing, "pins 2 + 6\ntied", (2.35, 2.55), color=TIMING, fontsize=8.5)

    # Pin 5 bypass is shared by both builds.
    control_x = 9.25
    add_wire(drawing, timer.CTL, (control_x, timer.CTL[1]), color=GRAY)
    control_cap = drawing.add(
        elm.Capacitor().down().at((control_x, timer.CTL[1])).to((control_x, 1.0)).color(GRAY)
    )
    add_ground(drawing, control_cap.end)
    add_text(drawing, "C2  10 nF\nCONTROL bypass", (10.35, 2.4), color=GRAY, fontsize=8.5)

    # Pin 3 is a source terminal. The two panels below are alternatives.
    pin3_terminal = (9.45, timer.OUT[1])
    add_wire(drawing, timer.OUT, pin3_terminal, color=INK)
    drawing.add(elm.Dot(open=True).at(pin3_terminal).color(INK))
    add_text(drawing, "PIN 3 OUTPUT", (9.45, 6.0), fontsize=9)
    add_text(
        drawing,
        "Connect pin 3 to ONE option below",
        (13.05, 8.45),
        color=WARNING,
        fontsize=11,
    )

    # Compact timing-value key keeps the shared topology readable.
    add_text(
        drawing,
        "LED timing: R2  68 kΩ  •  C1  10 µF (+ at timing node)  •  ≈1.1 Hz",
        (4.75, -0.65),
        color=TIMING,
        fontsize=9,
    )
    add_text(
        drawing,
        "PIEZO timing: R2  6.8 kΩ  •  C1  0.1 µF  •  ≈990 Hz",
        (4.75, -1.10),
        color=PIEZO,
        fontsize=9,
    )

    # Option A: current-limited LED, oriented to light while pin 3 is high.
    led_input = (11.0, 6.2)
    drawing.add(elm.Dot(open=True).at(led_input).color(LED_COLOR))
    led_resistor = drawing.add(
        elm.Resistor().right().at(led_input).to((13.25, 6.2)).color(LED_COLOR)
    )
    led_x = 13.25
    led = drawing.add(
        elm.LED().down().at(led_resistor.end).to((led_x, 3.0)).color(LED_COLOR)
    )
    add_ground(drawing, led.end)
    add_text(drawing, "A  LED BLINKER", (12.1, 7.25), color=LED_COLOR, fontsize=11)
    add_text(drawing, "from pin 3", (11.0, 5.72), color=LED_COLOR, fontsize=8)
    add_text(drawing, "R3\n330 Ω", (12.15, 6.85), color=LED_COLOR, fontsize=8.5)
    add_text(drawing, "A  anode", (14.05, 5.55), color=LED_COLOR, fontsize=8)
    add_text(drawing, "D1\nLED", (14.50, 4.55), color=LED_COLOR, fontsize=9)
    add_text(drawing, "K  cathode", (14.10, 3.55), color=LED_COLOR, fontsize=8)

    # Option B: small piezo directly driven by pin 3; no transistor is needed.
    piezo_input = (15.05, 6.2)
    drawing.add(elm.Dot(open=True).at(piezo_input).color(PIEZO))
    piezo = drawing.add(elm.Speaker().right().at((16.65, 6.2)).color(PIEZO))
    add_wire(drawing, piezo_input, piezo.in1, color=PIEZO)
    add_wire(drawing, piezo.in2, (16.65, 3.0), color=PIEZO)
    add_ground(drawing, (16.65, 3.0))
    add_text(drawing, "B  PIEZO TONE", (16.2, 7.25), color=PIEZO, fontsize=11)
    add_text(drawing, "from pin 3", (15.05, 5.72), color=PIEZO, fontsize=8)
    add_text(drawing, "+  positive", (15.80, 6.62), color=PIEZO, fontsize=8)
    add_text(drawing, "−  negative", (15.75, 5.18), color=PIEZO, fontsize=8)
    add_text(drawing, "BZ1\nsmall piezo", (18.65, 5.75), color=PIEZO, fontsize=9)
    add_text(drawing, "Direct drive:\nno transistor needed", (16.8, 2.15), color=PIEZO, fontsize=8.5)

    add_text(
        drawing,
        "Motor or high-current load? Use a transistor driver—not pin 3 directly.",
        (13.75, 0.15),
        color=WARNING,
        fontsize=9,
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
