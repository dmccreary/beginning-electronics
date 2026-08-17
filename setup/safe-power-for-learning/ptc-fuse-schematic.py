#!/usr/bin/env python3
"""Render the "add a PTC fuse to the +5 V rail" schematic (header-pin method).

Prompt:
    Draw Method 1 from the Safe Power for Learning page so a teacher can trace
    the wiring from the diagram alone. Show the MB102's internal split: the
    regulator's 5 V node runs straight out to the middle header pin, and
    separately toward the + rail pin through the 5V/OFF/3.3V jumper - drawn as
    an OPEN switch, because the cap has been removed, leaving that pin dead.
    Then follow the external path: a female-to-male jumper from the 5 V header
    into a terminal-strip row, a PTC fuse bridging to a second row, a
    male-to-male jumper up to the red rail, the student's load, and ground
    returning through the module's - rail pin, unfused.

Topology: DC in -> AMS1117 -> 5 V node -> {5 V header pin, open jumper -> dead
+ rail pin}; 5 V header -> row A -> F1 -> row B -> + rail -> R1 -> D1 -> - rail
-> module - rail pin.
Assumptions: jumper caps removed on both sides, a 500 mA hold / 1 A trip radial
PTC, and one representative LED branch standing in for the student's circuit.

Usage:
    python3 ptc-fuse-schematic.py ptc-fuse-schematic.png
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
    LIGHT_GRAY,
    ORANGE,
    PURPLE,
    RED,
    arrow,
    dot,
    drawing,
    save_cli,
    text,
    wire,
)

# ---- Module body ----
BOX_L, BOX_R = 0.4, 5.0
BOX_B, BOX_T = 1.1, 7.0

REG_L, REG_R = 1.1, 3.0
REG_B, REG_T = 5.1, 6.2
GND_X = 1.7                  # internal ground drop from the regulator

BUS_X = 3.7                  # internal +5 V bus column
SW_R = 4.7                   # right end of the jumper-cap switch

Y_HDR_5V = 5.6               # middle header, 5 V pin
Y_RAIL_PIN = 4.2             # + rail pin, dead with the cap removed
Y_NEG = 1.8                  # - rail pin, and the breadboard - rail

# ---- External wiring ----
X_ROW_A = 7.5                # terminal-strip row the 5 V jumper lands in
X_ROW_B = 11.2               # terminal-strip row on the far side of the fuse
Y_FUSE = 3.2
Y_FAULT = 4.5                # optional fault-indicator branch, parallel to F1
X_FAULT_MID = (X_ROW_A + X_ROW_B) / 2
Y_POS = 6.8                  # breadboard + rail
X_LOAD = 13.9
X_RAIL_END = 16.2


def build_drawing():
    d = drawing()

    # ================= The MB102 module =================
    d.add(elm.Rect(corner1=(BOX_L, BOX_B), corner2=(BOX_R, BOX_T)).color(GRAY))
    text(d, "MB102 module", ((BOX_L + BOX_R) / 2, 6.62), color=INK, fontsize=12)

    d.add(elm.Rect(corner1=(REG_L, REG_B), corner2=(REG_R, REG_T)).color(GRAY))
    text(d, "AMS1117-5.0", ((REG_L + REG_R) / 2, 5.65), color=GRAY, fontsize=9.5)

    # DC input
    arrow(d, (BOX_L - 2.5, Y_HDR_5V), (BOX_L, Y_HDR_5V), color=ORANGE)
    text(d, "7.5–9 V DC", (BOX_L - 2.5, Y_HDR_5V + 0.5), color=ORANGE, fontsize=10)
    text(d, "barrel jack", (BOX_L - 2.5, Y_HDR_5V - 0.45), color=GRAY, fontsize=9)
    wire(d, (BOX_L, Y_HDR_5V), (REG_L, Y_HDR_5V), color=ORANGE)

    # +5 V node leaving the regulator
    wire(d, (REG_R, Y_HDR_5V), (BUS_X, Y_HDR_5V), color=RED)
    wire(d, (BUS_X, Y_RAIL_PIN), (BUS_X, Y_HDR_5V), color=RED)
    dot(d, (BUS_X, Y_HDR_5V))
    dot(d, (BUS_X, Y_RAIL_PIN))

    # Branch 1 -- straight out to the middle header's 5 V pin, always live
    wire(d, (BUS_X, Y_HDR_5V), (BOX_R, Y_HDR_5V), color=RED)
    dot(d, (BOX_R, Y_HDR_5V))
    text(d, "5 V header pin", (BOX_R + 1.25, Y_HDR_5V + 0.45), color=RED, fontsize=9.5)

    # Branch 2 -- toward the + rail pin through the jumper cap, drawn OPEN
    sw = d.add(
        elm.Switch(action=None)
        .at((BUS_X, Y_RAIL_PIN))
        .to((SW_R, Y_RAIL_PIN))
        .color(PURPLE)
    )
    # Kept left of BOX_R so the label never crosses the module outline.
    text(d, "jumper cap", (3.55, Y_RAIL_PIN - 0.62), color=PURPLE, fontsize=9.5)
    text(d, "REMOVED", (3.55, Y_RAIL_PIN - 1.02), color=PURPLE, fontsize=9.5)
    wire(d, sw.end, (BOX_R + 1.2, Y_RAIL_PIN), color=LIGHT_GRAY)
    dot(d, (BOX_R + 1.2, Y_RAIL_PIN), color=GRAY, open=True)
    text(d, "+ rail pin (dead)", (BOX_R + 1.2, Y_RAIL_PIN + 0.45), color=GRAY, fontsize=9)

    # Ground -- straight out of the regulator to the module's - rail pin
    wire(d, (GND_X, REG_B), (GND_X, Y_NEG), color=INK)
    wire(d, (GND_X, Y_NEG), (BOX_R, Y_NEG), color=INK)
    dot(d, (BOX_R, Y_NEG))
    text(d, "− rail pin", (BOX_R + 0.85, Y_NEG + 0.42), color=INK, fontsize=9)

    # ================= External wiring =================
    # Female-to-male jumper: 5 V header across to the terminal strip
    wire(d, (BOX_R, Y_HDR_5V), (X_ROW_A, Y_HDR_5V), color=RED)
    text(d, "female-to-male jumper", (6.5, Y_HDR_5V + 0.95), color=RED, fontsize=9)
    wire(d, (X_ROW_A, Y_HDR_5V), (X_ROW_A, Y_FUSE), color=RED)
    dot(d, (X_ROW_A, Y_FUSE))
    text(d, "row A", (X_ROW_A - 0.78, Y_FUSE + 0.45), color=GRAY, fontsize=9)

    # The fuse, bridging two terminal-strip rows
    d.add(elm.Fuse().at((X_ROW_A, Y_FUSE)).to((X_ROW_B, Y_FUSE)).color(GREEN))
    text(d, "F1  PTC resettable fuse", ((X_ROW_A + X_ROW_B) / 2, Y_FUSE - 0.68), color=GREEN, fontsize=10)
    text(d, "500 mA hold / 1 A trip", ((X_ROW_A + X_ROW_B) / 2, Y_FUSE - 1.12), color=GREEN, fontsize=9)
    dot(d, (X_ROW_B, Y_FUSE))
    text(d, "row B", (X_ROW_B + 0.78, Y_FUSE + 0.45), color=GRAY, fontsize=9)

    # Optional fault indicator, wired straight across F1. While the fuse is
    # behaving there is almost no voltage across it, so D2 stays dark; once it
    # trips, nearly the whole rail voltage appears here and D2 lights.
    dot(d, (X_ROW_A, Y_FAULT))
    dot(d, (X_ROW_B, Y_FAULT))
    d.add(
        elm.Resistor()
        .at((X_ROW_A, Y_FAULT))
        .to((X_FAULT_MID, Y_FAULT))
        .color(ORANGE)
    )
    d.add(
        elm.LED().at((X_FAULT_MID, Y_FAULT)).to((X_ROW_B, Y_FAULT)).color(ORANGE)
    )
    # Labels sit clear of the LED's emission arrows and of the row B column.
    text(d, "optional fault indicator", (X_FAULT_MID, Y_FAULT + 1.55), color=ORANGE, fontsize=10)
    text(d, "R2 1 kΩ", ((X_ROW_A + X_FAULT_MID) / 2, Y_FAULT + 1.05), color=ORANGE, fontsize=9.5)
    text(d, "D2", ((X_FAULT_MID + X_ROW_B) / 2 + 0.45, Y_FAULT + 1.05), color=ORANGE, fontsize=9.5)
    text(d, "dark until F1 trips", (X_FAULT_MID, Y_FAULT - 0.62), color=ORANGE, fontsize=9)

    # Male-to-male jumper up onto the red rail
    wire(d, (X_ROW_B, Y_FUSE), (X_ROW_B, Y_POS), color=RED)
    text(d, "male-to-male", (X_ROW_B + 1.25, Y_POS - 0.55), color=RED, fontsize=9)
    text(d, "jumper", (X_ROW_B + 0.95, Y_POS - 0.95), color=RED, fontsize=9)
    dot(d, (X_ROW_B, Y_POS))

    # Breadboard + rail
    wire(d, (X_ROW_B, Y_POS), (X_RAIL_END, Y_POS), color=RED)
    text(d, "breadboard + rail", (X_RAIL_END - 1.7, Y_POS + 0.45), color=RED, fontsize=9.5)

    # The student's circuit
    dot(d, (X_LOAD, Y_POS))
    res = d.add(elm.Resistor().down().at((X_LOAD, Y_POS)).to((X_LOAD, 5.4)).color(BLUE))
    text(d, "R1 220 Ω", (X_LOAD + 1.6, 6.1), color=BLUE, fontsize=9.5)
    wire(d, res.end, (X_LOAD, 4.9))
    led = d.add(elm.LED().down().at((X_LOAD, 4.9)).to((X_LOAD, 3.5)).color(RED))
    text(d, "D1", (X_LOAD + 1.15, 4.2), color=RED, fontsize=9.5)
    text(d, "student's circuit", (X_LOAD + 1.95, 3.05), color=GRAY, fontsize=9)
    wire(d, led.end, (X_LOAD, Y_NEG))
    dot(d, (X_LOAD, Y_NEG))

    # Breadboard - rail
    wire(d, (BOX_R, Y_NEG), (X_RAIL_END, Y_NEG), color=INK)
    text(d, "breadboard − rail — never fused", (10.4, Y_NEG - 0.55), color=INK, fontsize=9.5)

    # Footnote explaining the dead pin
    text(
        d,
        "The + rail pin stays plugged into the rail — with the cap off it simply carries nothing,",
        (7.9, 0.62),
        color=GRAY,
        fontsize=9,
    )
    text(
        d,
        "so every amp the students draw has to pass through F1.",
        (6.55, 0.18),
        color=GRAY,
        fontsize=9,
    )

    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
