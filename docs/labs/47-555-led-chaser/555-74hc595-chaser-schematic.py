#!/usr/bin/env python3
"""Render the schematic for the "555-Driven LED Bar Graph" lab.

Prompt:
    Draw the complete two-chip circuit for Lab 47: a 555 timer in astable
    mode driving a 74HC595 shift register that fills eight LEDs one at a
    time. Left block: an NE555 with all eight pins labeled by function.
    Pin 8 (VCC) and pin 4 (RESET) tie to +5 V. Pin 1 (GND) ties to ground.
    R1 (1 kΩ) runs from +5 V down to pin 7 (DISCHARGE). R2 (13 kΩ) runs from
    pin 7 down to the timing node, which is the tied-together pins 2
    (TRIGGER) and 6 (THRESHOLD). A polarized capacitor C1 (10 µF
    electrolytic, + lead up toward the timing node) runs from that timing
    node to ground. Pin 3 (OUTPUT) does NOT drive an LED directly this time
    - it runs across to the 74HC595's SRCLK input (pin 11).

    Right block: a 74HC595 shift register drawn as a generic labeled IC
    block with SRCLR' (pin 10, active low, inverting bubble), OE' (pin 13,
    active low, inverting bubble), RCLK (pin 12), SRCLK (pin 11), and SER
    (pin 14) on the left side, bottom to top; Q0-Q7 (pins 15, 1-7) on the
    right side, bottom to top; VCC (pin 16) on top; GND (pin 8) and QH'
    (pin 9) on the bottom. Wire SER permanently to +5 V. Wire OE'
    permanently to ground. Bridge SRCLK and RCLK together with a short
    jumper labeled to explain every clock pulse both shifts a bit in and
    immediately latches it out. Wire SRCLR' to +5 V through a 10 kΩ pull-up
    resistor R9 (added for safety - a bare wire tie plus a push button
    straight to ground would short the supply on every press) and also to
    ground through a normally-open push button SW1, so pressing SW1 pulls
    SRCLR' low and clears the register. Leave QH' (pin 9) completely
    unconnected with a small "not used - no feedback wire" label, since this
    circuit deliberately does not daisy-chain or feed QH' back to SER.

    For the eight LED outputs, draw full detail - a 330 Ω resistor in series
    with an LED (anode toward the resistor, cathode to ground) - on Q0, Q1,
    Q2, and Q7, staggered sideways so their branches never overlap, then a
    compact bracketed note standing in for Q3-Q6 ("same 330 Ω + LED pattern
    repeats") so the diagram stays legible instead of drawing all eight.
    Label the frequency math f = 1.44 / ((R1 + 2R2) x C1) ≈ 5.3 Hz near the
    timing network. Keep roughly 0.15 drawing units of visible clearance
    between every symbol and its label, and avoid any label-on-label or
    label-on-symbol collision - this is the busiest schematic in the
    three-lab 555 sequence, so budget extra space around the 74HC595.

Topology: +5V -> 555 pin8, pin4, R1; R1 -> pin7/R2; R2 -> timing node
(pins 2+6 tied); timing node -> C1(+) -> C1(-) -> GND; 555 pin1 -> GND;
555 pin3 -> 74HC595 pin11 (SRCLK); 74HC595 pin11 <-> pin12 (RCLK) bridged;
74HC595 pin14 (SER) -> +5V; 74HC595 pin13 (OE') -> GND; 74HC595 pin10
(SRCLR') -> R9 (10k) -> +5V, and -> SW1 -> GND; 74HC595 pin16 (VCC) -> +5V;
74HC595 pin8 (GND) -> GND; 74HC595 pin9 (QH') -> not connected; 74HC595
Q0/Q1/Q2/Q7 -> 330 ohm resistor -> LED anode -> LED cathode -> GND; Q3-Q6
shown as a grouped callout, same pattern, not individually drawn.
Assumptions: R1=1kOhm, R2=13kOhm, C1=10uF give f = 1.44/((R1+2R2)*C) ~= 5.3 Hz
and duty cycle D = (R1+R2)/(R1+2R2) ~= 54%, matching Chapter 14's "fast,
attention-grabbing blink" table row. R9 (10 kOhm pull-up on SRCLR') is a
deliberate safety addition beyond the bare wire-tie described in prose, so
pressing SW1 never shorts the supply. A crossing between two wires with no
dot marker means no connection, per standard schematic convention.

Usage:
    python3 555-74hc595-chaser-schematic.py 555-74hc595-chaser-schematic.png
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
import schemdraw.elements as elm
from docs.schematic_utils import (
    GRAY,
    INK,
    drawing,
    ground,
    save_cli,
    text,
)

POWER = "#b71c1c"
TIMING = "#1565c0"
CLOCK = "#2e7d32"
CHIP = "#17202a"
LED_COLOR = "#2e7d32"
RESET_COLOR = "#6a4c93"
WARNING = "#a64b00"

SUPPLY_Y = 10.0
GND_Y = -2.2


def build_drawing():
    d = drawing(unit=3.0, fontsize=10)

    # ------------------------------------------------------------------
    # 555 astable clock - same wiring pattern as Lab 45, faster R2.
    # ------------------------------------------------------------------
    timer = d.add(elm.Ic555().at((2.0, 2.0)).color(CHIP))
    text(d, "U2", (timer.OUT[0] - 1.3, 2.0), color=CHIP, fontsize=11)

    d.add(elm.Line().at((0.2, SUPPLY_Y)).to((29.5, SUPPLY_Y)).color(POWER))
    d.add(elm.Line().at(timer.Vcc).to((timer.Vcc[0], SUPPLY_Y)).color(POWER))
    d.add(elm.Line().at(timer.RST).to((timer.RST[0], SUPPLY_Y)).color(POWER))
    d.add(elm.Dot().at((timer.Vcc[0], SUPPLY_Y)).color(POWER))
    d.add(elm.Dot().at((timer.RST[0], SUPPLY_Y)).color(POWER))
    text(d, "+5 V", (0.2, SUPPLY_Y + 0.45), color=POWER, fontsize=14)
    text(d, "pin 8\nVCC", (timer.Vcc[0] + 0.15, SUPPLY_Y - 0.95), color=GRAY, fontsize=7.5)
    text(d, "pin 4 RESET\ntied high", (timer.RST[0] - 1.5, SUPPLY_Y - 1.05), color=GRAY, fontsize=7.5)

    d.add(elm.Line().at(timer.GND).to((timer.GND[0], -1.6)).color(INK))
    ground(d, (timer.GND[0], -1.6))
    text(d, "pin 1 GND", (timer.GND[0] + 0.2, -1.15), color=GRAY, fontsize=7.5)

    timing_x = 0.6
    d.add(elm.Resistor().down().at((timing_x, SUPPLY_Y)).to((timing_x, 6.0)).color(TIMING))
    discharge_node = (timing_x, 6.0)
    d.add(elm.Line().at(discharge_node).to(timer.DIS).color(TIMING))
    d.add(elm.Dot().at(discharge_node).color(TIMING))
    text(d, "R1\n1 kΩ", (-0.7, 7.5), color=TIMING, fontsize=10.5)

    r2 = d.add(elm.Resistor().down().at(discharge_node).to((timing_x, 3.6)).color(TIMING))
    timing_node = r2.end
    text(d, "R2\n13 kΩ", (-0.7, 4.85), color=TIMING, fontsize=10.5)

    pin_tie_x = 2.3
    d.add(elm.Line().at(timing_node).to((pin_tie_x, timing_node[1])).color(TIMING))
    d.add(elm.Dot().at((pin_tie_x, timing_node[1])).color(TIMING))
    d.add(elm.Line().at((pin_tie_x, timer.TRG[1])).to(timer.TRG).color(TIMING))
    d.add(elm.Line().at((pin_tie_x, timer.THR[1])).to(timer.THR).color(TIMING))
    d.add(elm.Line().at((pin_tie_x, timer.TRG[1])).to((pin_tie_x, timer.THR[1])).color(TIMING))
    text(d, "pins 2 + 6\ntied together", (2.75, 5.55), color=GRAY, fontsize=7.5)

    cap = d.add(elm.Capacitor2(polar=True).down().at(timing_node).to((timing_x, 0.8)).color(TIMING))
    ground(d, cap.end)
    text(d, "C1  10 µF\nelectrolytic\n(+ lead up)", (-0.95, 1.85), color=TIMING, fontsize=9)

    text(d, "pin 5 CONTROL\nleft unconnected", (6.9, 3.6), color=GRAY, fontsize=7.5)

    text(
        d,
        "f = 1.44 / ((R1 + 2R2) x C1) ≈ 5.3 Hz\nduty cycle D = (R1 + R2) / (R1 + 2R2) ≈ 54%",
        (0.2, -3.6),
        color=GRAY,
        fontsize=10,
    )

    # ------------------------------------------------------------------
    # 74HC595 shift register - generic labeled IC block, generously spaced.
    # ------------------------------------------------------------------
    reg_ic = elm.Ic(
        size=(7.5, 13.5),
        pins=[
            elm.IcPin(name="SRCLR", pin="10", side="L", slot="1/5", invert=True),
            elm.IcPin(name="OE", pin="13", side="L", slot="2/5", invert=True),
            elm.IcPin(name="RCLK", pin="12", side="L", slot="3/5"),
            elm.IcPin(name="SRCLK", pin="11", side="L", slot="4/5"),
            elm.IcPin(name="SER", pin="14", side="L", slot="5/5"),
            elm.IcPin(name="Q0", pin="15", side="R", slot="1/8"),
            elm.IcPin(name="Q1", pin="1", side="R", slot="2/8"),
            elm.IcPin(name="Q2", pin="2", side="R", slot="3/8"),
            elm.IcPin(name="Q3", pin="3", side="R", slot="4/8"),
            elm.IcPin(name="Q4", pin="4", side="R", slot="5/8"),
            elm.IcPin(name="Q5", pin="5", side="R", slot="6/8"),
            elm.IcPin(name="Q6", pin="6", side="R", slot="7/8"),
            elm.IcPin(name="Q7", pin="7", side="R", slot="8/8"),
            elm.IcPin(name="VCC", pin="16", side="T"),
            elm.IcPin(name="GND", pin="8", side="B", slot="1/2"),
            elm.IcPin(name="QH", pin="9", side="B", slot="2/2"),
        ],
        leadlen=1.1,
    ).right()
    reg_ic.side("L", pad=1.3)
    reg_ic.side("R", pad=1.3)
    reg_ic.side("B", leadlen=1.8)
    reg = d.add(reg_ic.at((14.0, -4.6)).color(CHIP))
    text(d, "U1  74HC595", (reg.center[0], reg.center[1] + 0.2), color=CHIP, fontsize=12)

    # VCC (pin 16) and GND (pin 8) to the shared rails.
    d.add(elm.Line().at(reg.VCC).to((reg.VCC[0], SUPPLY_Y)).color(POWER))
    d.add(elm.Dot().at((reg.VCC[0], SUPPLY_Y)).color(POWER))
    text(d, "pin 16 VCC", (reg.VCC[0] + 2.3, SUPPLY_Y + 0.45), color=GRAY, fontsize=8)

    d.add(elm.Line().at(reg.GND).to((reg.GND[0], reg.GND[1] - 1.1)).color(INK))
    ground(d, (reg.GND[0], reg.GND[1] - 1.1))
    text(d, "pin 8 GND", (reg.GND[0] + 0.2, reg.GND[1] - 0.6), color=GRAY, fontsize=7.5)

    d.add(elm.Dot(open=True).at(reg.QH).color(GRAY))
    text(d, "pin 9 QH′\nnot used - no\nfeedback wire", (reg.QH[0] - 0.1, reg.QH[1] - 1.35), color=WARNING, fontsize=7.5)

    # SER (pin 14) tied permanently to +5 V - a 1 is always waiting to shift in.
    ser_x = reg.SER[0] - 1.6
    d.add(elm.Line().at(reg.SER).to((ser_x, reg.SER[1])).color(POWER))
    d.add(elm.Line().at((ser_x, reg.SER[1])).to((ser_x, SUPPLY_Y)).color(POWER))
    d.add(elm.Dot().at((ser_x, SUPPLY_Y)).color(POWER))
    text(d, "pin 14 SER\ntied to +5 V", (ser_x - 2.0, reg.SER[1] + 0.6), color=POWER, fontsize=8)

    # OE' (pin 13) tied permanently to ground - outputs are always enabled.
    oe_x = reg.OE[0] - 0.9
    d.add(elm.Line().at(reg.OE).to((oe_x, reg.OE[1])).color(INK))
    d.add(elm.Line().at((oe_x, reg.OE[1])).to((oe_x, GND_Y)).color(INK))
    ground(d, (oe_x, GND_Y))
    text(d, "pin 13 OE′\ntied to GND", (oe_x - 2.0, reg.OE[1] + 0.55), color=GRAY, fontsize=8)

    # SRCLK (pin 11) <- 555 OUTPUT, routed above the R9/SW1 branch.
    jog_x = 9.3
    d.add(elm.Line().at(timer.OUT).to((jog_x, timer.OUT[1])).color(CLOCK))
    d.add(elm.Line().at((jog_x, timer.OUT[1])).to((jog_x, reg.SRCLK[1])).color(CLOCK))
    d.add(elm.Line().at((jog_x, reg.SRCLK[1])).to(reg.SRCLK).color(CLOCK))
    d.add(elm.Dot().at(reg.SRCLK).color(CLOCK))
    text(d, "pin 3 OUTPUT drives pin 11 SRCLK", (7.4, timer.OUT[1] + 0.5), color=CLOCK, fontsize=9)

    # RCLK (pin 12) bridged straight to SRCLK - shift and latch happen together.
    d.add(elm.Line().at(reg.SRCLK).to((reg.SRCLK[0], reg.RCLK[1])).color(CLOCK))
    text(
        d,
        "pin 11 SRCLK bridged to pin 12 RCLK:\nevery pulse shifts a bit in AND latches it out",
        (reg.RCLK[0] - 0.3, (reg.SRCLK[1] + reg.RCLK[1]) / 2 - 0.55),
        color=CLOCK,
        fontsize=8,
    )

    # SRCLR' (pin 10): 10 kΩ pull-up to +5 V, plus a push button to ground.
    srclr_x = reg.SRCLR[0] - 3.1
    d.add(elm.Line().at(reg.SRCLR).to((srclr_x, reg.SRCLR[1])).color(RESET_COLOR))
    d.add(elm.Dot().at((srclr_x, reg.SRCLR[1])).color(RESET_COLOR))
    r9 = d.add(elm.Resistor().up().at((srclr_x, reg.SRCLR[1])).to((srclr_x, SUPPLY_Y)).color(RESET_COLOR))
    d.add(elm.Dot().at((srclr_x, SUPPLY_Y)).color(RESET_COLOR))
    text(d, "R9\n10 kΩ\npull-up", (srclr_x - 1.55, (reg.SRCLR[1] + SUPPLY_Y) / 2 - 1.0), color=RESET_COLOR, fontsize=8)

    sw = d.add(elm.Button().down().at((srclr_x, reg.SRCLR[1])).to((srclr_x, GND_Y - 1.6)).color(RESET_COLOR))
    ground(d, sw.end)
    text(
        d,
        "SW1 push button\npin 10 SRCLR′ → GND\nclears the register",
        (srclr_x - 3.4, GND_Y - 0.3),
        color=RESET_COLOR,
        fontsize=8,
    )
    text(
        d,
        "Not pressed: R9 holds pin 10 HIGH, register counts normally.\nPressed: pin 10 is pulled to GND, register clears to all zero.",
        (7.4, GND_Y - 3.3),
        color=GRAY,
        fontsize=8.5,
    )

    # ------------------------------------------------------------------
    # LED outputs - full detail on Q0, Q1, Q2, and Q7; grouped note between.
    # ------------------------------------------------------------------
    def led_branch(pin_xy, reach, label, ref, color=LED_COLOR):
        x0, y0 = pin_xy
        res_end = (x0 + reach, y0)
        d.add(elm.Resistor().right().at(pin_xy).to(res_end).color(color))
        led = d.add(elm.LED().down().at(res_end).to((res_end[0], y0 - 2.1)).color(color))
        ground(d, led.end)
        text(d, f"{ref}\n{label}\n330 Ω + LED", (res_end[0] - 0.2, y0 + 0.75), color=color, fontsize=8)
        return led

    led_branch(reg.Q0, 1.6, "Q0  pin 15", "D0")
    led_branch(reg.Q1, 3.3, "Q1  pin 1", "D1")
    led_branch(reg.Q2, 5.0, "Q2  pin 2", "D2")
    led_branch(reg.Q7, 9.0, "Q7  pin 7", "D7")

    # Grouped callout standing in for Q3-Q6 so the diagram stays legible.
    bracket_x = reg.Q3[0] + 0.9
    for q_anchor in (reg.Q3, reg.Q4, reg.Q5, reg.Q6):
        d.add(elm.Line().at(q_anchor).to((bracket_x, q_anchor[1])).linestyle("--").color(GRAY))
    d.add(elm.Line().at((bracket_x, reg.Q3[1])).to((bracket_x, reg.Q6[1])).color(GRAY))
    text(
        d,
        "pins 3-6 → Q3-Q6\nsame 330 Ω + LED\npattern repeats\n(not drawn - see\nbuild table)",
        (bracket_x + 0.3, (reg.Q3[1] + reg.Q6[1]) / 2),
        color=GRAY,
        fontsize=8,
    )

    text(
        d,
        "Every 555 pulse shifts one more 1 into the register -\nQ0, then Q0+Q1, then Q0+Q1+Q2 ... the bar fills up.",
        (14.5, -8.6),
        color=CHIP,
        fontsize=10.5,
    )

    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
