#!/usr/bin/env python3
"""Generate the illustrated list of 100 common electrical circuit symbols.

Prompt:
    Create an alphabetical Markdown list of 100 commonly used electrical and
    electronic circuit symbols. Give each symbol a level-2 heading, a rendered
    image, and one short sentence explaining what the symbol represents and
    when it is used. Render every symbol as an individual SVG, render a matching
    white-background PNG inspection copy, and create a labeled PNG contact sheet.

Topology: This is a symbol reference rather than a connected electrical circuit;
each drawing contains exactly one isolated schematic symbol.
Assumptions: Use ANSI/IEEE-style resistor symbols and conventional Schemdraw
representations; SVG files are the published images and PNG files are previews.
"""

from __future__ import annotations

import argparse
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt

from PIL import Image, ImageDraw, ImageFont
import schemdraw
import schemdraw.elements as elm
import schemdraw.logic as logic

schemdraw.use("matplotlib")


ElementFactory = Callable[[], elm.Element]


@dataclass(frozen=True)
class SymbolSpec:
    name: str
    description: str
    factory: ElementFactory

    @property
    def slug(self) -> str:
        return re.sub(r"[^a-z0-9]+", "-", self.name.lower()).strip("-")


def labeled_source(source: ElementFactory, label: str) -> ElementFactory:
    return lambda: source().label(label, loc="center")


SYMBOLS = sorted(
    [
        SymbolSpec("555 timer", "A 555 timer is used to generate delays, pulses, and oscillating signals.", lambda: elm.Ic555()),
        SymbolSpec("AC current source", "An AC current source supplies a current that periodically reverses direction.", labeled_source(elm.SourceI, "~")),
        SymbolSpec("AC voltage source", "An AC voltage source supplies a voltage that periodically reverses polarity.", lambda: elm.SourceSin()),
        SymbolSpec("Ammeter", "An ammeter is connected in series to measure electric current.", lambda: elm.MeterA()),
        SymbolSpec("Analog meter", "An analog meter uses a moving pointer to display an electrical measurement.", lambda: elm.MeterAnalog()),
        SymbolSpec("AND gate", "An AND gate produces a high output only when all of its inputs are high.", lambda: logic.And()),
        SymbolSpec("Antenna", "An antenna transmits or receives electromagnetic radio-frequency signals.", lambda: elm.Antenna()),
        SymbolSpec("Audio jack", "An audio jack provides a detachable connection for analog audio signals.", lambda: elm.AudioJack(ring=True)),
        SymbolSpec("Battery", "A battery supplies DC electrical energy from two or more cells.", lambda: elm.Battery()),
        SymbolSpec("Battery cell", "A battery cell represents a single electrochemical source of DC voltage.", lambda: elm.BatteryCell()),
        SymbolSpec("Bipolar transistor (NPN)", "An NPN bipolar transistor is used for current-controlled switching and amplification.", lambda: elm.BjtNpn(circle=True)),
        SymbolSpec("Bipolar transistor (PNP)", "A PNP bipolar transistor is used for high-side switching and current-controlled amplification.", lambda: elm.BjtPnp(circle=True)),
        SymbolSpec("Bridge rectifier", "A bridge rectifier converts both halves of an AC waveform into pulsating DC.", lambda: elm.Rectifier()),
        SymbolSpec("Buffer gate", "A buffer gate strengthens or isolates a digital signal without inverting it.", lambda: logic.Buf()),
        SymbolSpec("Bus connection", "A bus connection shows a group of related conductors joining a circuit bus.", lambda: elm.BusConnect()),
        SymbolSpec("Capacitor", "A capacitor stores electric charge and is used for filtering, timing, coupling, and energy storage.", lambda: elm.Capacitor()),
        SymbolSpec("Chassis ground", "Chassis ground marks a connection to a device's conductive frame or enclosure.", lambda: elm.GroundChassis()),
        SymbolSpec("Circuit breaker", "A circuit breaker automatically opens a circuit during an overload and can be reset.", lambda: elm.Breaker()),
        SymbolSpec("Coaxial connector", "A coaxial connector joins a shielded cable while preserving its center conductor and outer shield.", lambda: elm.CoaxConnect()),
        SymbolSpec("Controlled current source", "A controlled current source produces current determined by another circuit voltage or current.", lambda: elm.SourceControlledI()),
        SymbolSpec("Controlled voltage source", "A controlled voltage source produces voltage determined by another circuit voltage or current.", lambda: elm.SourceControlledV()),
        SymbolSpec("Crystal", "A crystal provides a highly stable resonant frequency for oscillators and clocks.", lambda: elm.Crystal()),
        SymbolSpec("Current source", "A current source supplies a specified current largely independent of its load voltage.", lambda: elm.SourceI()),
        SymbolSpec("D flip-flop", "A D flip-flop stores one bit by capturing its data input on a clock transition.", lambda: elm.DFlipFlop()),
        SymbolSpec("DC voltage source", "A DC voltage source maintains a fixed-polarity potential difference.", lambda: elm.SourceV()),
        SymbolSpec("DIAC", "A DIAC conducts in either direction after its breakover voltage is reached and commonly triggers TRIACs.", lambda: elm.Diac()),
        SymbolSpec("DIP switch", "A DIP switch provides a compact bank of manual configuration switches.", lambda: elm.SwitchDIP(n=3)),
        SymbolSpec("Diode", "A diode conducts primarily in one direction and is used for rectification and protection.", lambda: elm.Diode()),
        SymbolSpec("DPDT switch", "A double-pole double-throw switch changes two separate circuits between two paths.", lambda: elm.SwitchDpdt()),
        SymbolSpec("DPST switch", "A double-pole single-throw switch opens or closes two separate circuits together.", lambda: elm.SwitchDpst()),
        SymbolSpec("Earth ground", "Earth ground marks a conductive connection to the physical earth for safety or reference.", lambda: elm.Ground()),
        SymbolSpec("Female connector", "A female connector or jack accepts a mating plug to make a removable connection.", lambda: elm.Jack()),
        SymbolSpec("Fuse", "A fuse melts and permanently opens a circuit when excessive current flows.", lambda: elm.Fuse()),
        SymbolSpec("Galvanometer", "A galvanometer detects or measures small electric currents with a sensitive moving coil.", labeled_source(elm.MeterI, "G")),
        SymbolSpec("Header connector", "A header connector provides an organized row or grid of removable signal and power connections.", lambda: elm.Header(rows=3, cols=2)),
        SymbolSpec("IGBT (N-channel)", "An N-channel IGBT provides gate-controlled switching for high-voltage or high-current loads.", lambda: elm.IgbtN()),
        SymbolSpec("IGBT (P-channel)", "A P-channel IGBT represents a complementary insulated-gate bipolar power switch.", lambda: elm.IgbtP()),
        SymbolSpec("Inductor", "An inductor stores energy in a magnetic field and is used in filters and power converters.", lambda: elm.Inductor()),
        SymbolSpec("Integrated circuit", "An integrated-circuit symbol represents a packaged electronic function with multiple pins.", lambda: elm.Ic(size=(3, 2), pins=[elm.IcPin(name="IN", pin="1", side="L"), elm.IcPin(name="OUT", pin="2", side="R"), elm.IcPin(name="V+", pin="3", side="T"), elm.IcPin(name="GND", pin="4", side="B")])),
        SymbolSpec("Inverter (NOT gate)", "A NOT gate produces the opposite logical state from its input.", lambda: logic.Not()),
        SymbolSpec("JFET (N-channel)", "An N-channel JFET controls current through an N-type channel with a reverse-biased gate.", lambda: elm.JFetN(circle=True)),
        SymbolSpec("JFET (P-channel)", "A P-channel JFET controls current through a P-type channel with a reverse-biased gate.", lambda: elm.JFetP(circle=True)),
        SymbolSpec("Junction", "A junction dot marks conductors that are electrically connected at the same node.", lambda: elm.Dot(radius=0.13)),
        SymbolSpec("Lamp", "A lamp converts electrical energy into light and may also serve as an indicator or load.", lambda: elm.Lamp()),
        SymbolSpec("LED", "A light-emitting diode produces light when forward biased and is used for indication or illumination.", lambda: elm.LED()),
        SymbolSpec("Microphone", "A microphone converts sound into an electrical signal.", lambda: elm.Mic()),
        SymbolSpec("Motor", "A motor converts electrical energy into rotational mechanical motion.", lambda: elm.Motor()),
        SymbolSpec("Multiplexer", "A multiplexer selects one of several inputs and connects it to a single output.", lambda: elm.Multiplexer()),
        SymbolSpec("NAND gate", "A NAND gate produces a low output only when all of its inputs are high.", lambda: logic.Nand()),
        SymbolSpec("Neon lamp", "A neon lamp glows when its gas ionizes and is commonly used as a high-voltage indicator.", lambda: elm.Neon()),
        SymbolSpec("NMOS transistor", "An NMOS transistor is a voltage-controlled device widely used for low-side switching and digital logic.", lambda: elm.NMos(circle=True)),
        SymbolSpec("No connection", "A no-connection mark identifies a pin or wire end that is intentionally left unconnected.", lambda: elm.NoConnect()),
        SymbolSpec("NOR gate", "A NOR gate produces a high output only when all of its inputs are low.", lambda: logic.Nor()),
        SymbolSpec("Operational amplifier", "An operational amplifier amplifies the voltage difference between its two inputs.", lambda: elm.Opamp()),
        SymbolSpec("Optocoupler", "An optocoupler transfers a signal with light to provide electrical isolation.", lambda: elm.Optocoupler()),
        SymbolSpec("Oscilloscope", "An oscilloscope displays how an electrical signal changes over time.", lambda: elm.Oscilloscope()),
        SymbolSpec("Outlet", "An outlet represents a mains receptacle that supplies power to a connected load.", lambda: elm.OutletA()),
        SymbolSpec("Photodiode", "A photodiode converts incident light into current and is used as a light sensor.", lambda: elm.Photodiode()),
        SymbolSpec("Photoresistor", "A photoresistor changes resistance with light level and is used for simple light sensing.", lambda: elm.Photoresistor()),
        SymbolSpec("Phototransistor (NPN)", "An NPN phototransistor uses light to control collector current for sensitive optical detection.", lambda: elm.NpnPhoto(circle=True)),
        SymbolSpec("Phototransistor (PNP)", "A PNP phototransistor uses light to control a complementary transistor current path.", lambda: elm.PnpPhoto(circle=True)),
        SymbolSpec("Plug", "A plug is the male half of a removable electrical connector.", lambda: elm.Plug()),
        SymbolSpec("PMOS transistor", "A PMOS transistor is a voltage-controlled device commonly used for high-side switching and CMOS logic.", lambda: elm.PMos(circle=True)),
        SymbolSpec("Potentiometer", "A potentiometer is an adjustable three-terminal resistor used as a voltage divider.", lambda: elm.Potentiometer()),
        SymbolSpec("Pulse source", "A pulse source produces timed voltage transitions for testing switching and digital circuits.", lambda: elm.SourcePulse()),
        SymbolSpec("Push button (normally closed)", "A normally closed push button opens its contacts only while it is pressed.", lambda: elm.Button(nc=True)),
        SymbolSpec("Push button (normally open)", "A normally open push button closes its contacts only while it is pressed.", lambda: elm.Button()),
        SymbolSpec("Reed switch", "A reed switch changes state in response to a nearby magnetic field.", lambda: elm.SwitchReed()),
        SymbolSpec("Relay", "A relay uses an energized coil to operate electrically isolated switch contacts.", lambda: elm.Relay()),
        SymbolSpec("Resistor", "A resistor limits current, divides voltage, and sets operating conditions in a circuit.", lambda: elm.Resistor()),
        SymbolSpec("Rotary switch", "A rotary switch selects one of several circuit connections by turning a shaft.", lambda: elm.SwitchRotary(n=4)),
        SymbolSpec("Sawtooth source", "A sawtooth source generates a ramp waveform with a rapid return for timing and sweep circuits.", lambda: elm.SourceRamp()),
        SymbolSpec("Schmitt trigger", "A Schmitt trigger adds hysteresis so a noisy or slowly changing input becomes a clean digital signal.", lambda: logic.Schmitt()),
        SymbolSpec("Schottky diode", "A Schottky diode provides fast switching and a low forward-voltage drop.", lambda: elm.Schottky()),
        SymbolSpec("SCR", "A silicon-controlled rectifier latches on after a gate trigger and controls high-power current.", lambda: elm.SCR()),
        SymbolSpec("Seven-segment display", "A seven-segment display combines illuminated bars to show decimal digits.", lambda: elm.SevenSegment(digit=8)),
        SymbolSpec("Signal ground", "Signal ground marks the common reference node used by low-level circuit signals.", lambda: elm.GroundSignal()),
        SymbolSpec("Solar cell", "A solar cell converts light energy directly into electrical energy.", lambda: elm.Solar()),
        SymbolSpec("Spark gap", "A spark gap conducts across an air gap when the voltage exceeds its breakdown level.", lambda: elm.SparkGap()),
        SymbolSpec("Speaker", "A speaker converts an electrical audio signal into sound.", lambda: elm.Speaker()),
        SymbolSpec("SPDT switch", "A single-pole double-throw switch connects one common terminal to either of two paths.", lambda: elm.SwitchSpdt()),
        SymbolSpec("SPST switch", "A single-pole single-throw switch simply opens or closes one circuit path.", lambda: elm.Switch()),
        SymbolSpec("Square-wave source", "A square-wave source alternates sharply between two levels for clocks and switching tests.", lambda: elm.SourceSquare()),
        SymbolSpec("Terminal", "A terminal marks a designated point for connecting a wire, lead, or external circuit.", lambda: elm.Terminal()),
        SymbolSpec("Thermistor", "A thermistor changes resistance with temperature and is used for sensing or current limiting.", lambda: elm.Thermistor()),
        SymbolSpec("Transformer", "A transformer transfers AC energy between windings for voltage conversion or isolation.", lambda: elm.Transformer(core=True)),
        SymbolSpec("TRIAC", "A TRIAC controls AC power by conducting in either direction after a gate trigger.", lambda: elm.Triac()),
        SymbolSpec("Tri-state buffer", "A tri-state buffer can drive high, drive low, or disconnect its output electrically.", lambda: logic.Tristate(outputnot=False)),
        SymbolSpec("Tunnel diode", "A tunnel diode uses negative differential resistance for very fast switching and oscillation.", lambda: elm.DiodeTunnel()),
        SymbolSpec("Vacuum tube diode", "A vacuum tube diode permits electron flow from a heated cathode to an anode for rectification.", lambda: elm.TubeDiode()),
        SymbolSpec("Varactor diode", "A varactor diode acts as a voltage-controlled capacitor in tuning and RF circuits.", lambda: elm.Varactor()),
        SymbolSpec("Variable capacitor", "A variable capacitor adjusts capacitance for tuning resonant and filter circuits.", lambda: elm.CapacitorVar()),
        SymbolSpec("Variable resistor", "A variable resistor provides an adjustable resistance for calibration or control.", lambda: elm.ResistorVar()),
        SymbolSpec("VDD supply", "VDD marks the positive supply rail in MOS and digital circuits.", lambda: elm.Vdd()),
        SymbolSpec("Voltmeter", "A voltmeter is connected in parallel to measure potential difference.", lambda: elm.MeterV()),
        SymbolSpec("VSS supply", "VSS marks the lower or negative supply rail in MOS and digital circuits.", lambda: elm.Vss()),
        SymbolSpec("Wheatstone bridge", "A Wheatstone bridge compares resistances and is used for precise sensing and measurement.", lambda: elm.Wheatstone()),
        SymbolSpec("XNOR gate", "An XNOR gate produces a high output when its inputs have the same logical state.", lambda: logic.Xnor()),
        SymbolSpec("XOR gate", "An XOR gate produces a high output when its inputs have different logical states.", lambda: logic.Xor()),
        SymbolSpec("Zener diode", "A Zener diode maintains a nearly constant reverse voltage for regulation and protection.", lambda: elm.Zener()),
    ],
    key=lambda symbol: symbol.name.casefold(),
)


def build_drawing(spec: SymbolSpec) -> schemdraw.Drawing:
    """Build one consistently styled, isolated symbol drawing."""
    drawing = schemdraw.Drawing(show=False)
    drawing.config(unit=3.0, fontsize=12, lw=2.0, color="#17233b")
    element = spec.factory()
    if isinstance(element, elm.Element2Term):
        element.right().length(3.0)
    drawing += element
    return drawing


def render_symbols(output_dir: Path) -> tuple[Path, Path]:
    svg_dir = output_dir / "symbols"
    preview_dir = output_dir / "previews"
    svg_dir.mkdir(parents=True, exist_ok=True)
    preview_dir.mkdir(parents=True, exist_ok=True)

    for spec in SYMBOLS:
        drawing = build_drawing(spec)
        drawing.save(str(svg_dir / f"{spec.slug}.svg"), transparent=True, dpi=180)
        preview_path = preview_dir / f"{spec.slug}.png"
        drawing.save(str(preview_path), transparent=False, dpi=180)
        plt.close(drawing.fig.fig)
        normalize_preview(preview_path)

    return svg_dir, preview_dir


def normalize_preview(preview_path: Path) -> None:
    """Center a Schemdraw raster export on a consistent inspection canvas."""
    canvas_size = (360, 240)
    with Image.open(preview_path).convert("RGB") as preview:
        preview.thumbnail((320, 200), Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", canvas_size, "white")
        x = (canvas_size[0] - preview.width) // 2
        y = (canvas_size[1] - preview.height) // 2
        canvas.paste(preview, (x, y))
    canvas.save(preview_path, dpi=(180, 180))


def write_markdown(output_dir: Path) -> Path:
    lines = [
        "# List of Electrical Circuit Symbols",
        "",
        "The following alphabetical reference shows 100 common electrical and electronic circuit symbols.",
        "",
    ]
    for spec in SYMBOLS:
        lines.extend(
            [
                f"## {spec.name}",
                "",
                f"![{spec.name} circuit symbol](symbols/{spec.slug}.svg)",
                "",
                spec.description,
                "",
            ]
        )
    index_path = output_dir / "index.md"
    index_path.write_text("\n".join(lines), encoding="utf-8")
    return index_path


def write_gallery_markdown(gallery_dir: Path, symbols_dir: Path) -> Path:
    """Write the five-across visual index of the same 100 symbols.

    The gallery reuses the SVGs rendered for the alphabetical list rather than
    duplicating them, and each caption links back to that symbol's full entry.
    Five cards per row is enforced by the `symbol-grid` class in
    docs/css/extra.css; Material's stock grid would otherwise fit as many
    columns as the viewport allows.
    """
    symbols_rel = Path(os.path.relpath(symbols_dir, gallery_dir)).as_posix()
    detail_rel = Path(os.path.relpath(symbols_dir.parent, gallery_dir)).as_posix()

    lines = [
        "---",
        "title: Circuit Symbol Gallery",
        "hide:",
        "  - toc",
        "---",
        "",
        "# Circuit Symbol Gallery",
        "",
        "The same 100 circuit symbols as the "
        f"[List of Circuit Symbols]({detail_rel}/), laid out five across so you "
        "can find a shape by eye. Select any symbol's name to jump to its full "
        "description.",
        "",
        '<div class="grid cards symbol-grid" markdown>',
        "",
    ]
    for spec in SYMBOLS:
        lines.extend(
            [
                f"-   ![{spec.name} circuit symbol]({symbols_rel}/{spec.slug}.svg)",
                "",
                f"    **[{spec.name}]({detail_rel}/#{spec.slug})**",
                "",
                f"    {spec.description}",
                "",
            ]
        )
    lines.extend(["</div>", ""])

    gallery_dir.mkdir(parents=True, exist_ok=True)
    gallery_path = gallery_dir / "index.md"
    gallery_path.write_text("\n".join(lines), encoding="utf-8")
    return gallery_path


def make_contact_sheet(preview_dir: Path, output_path: Path) -> None:
    columns = 5
    cell_width, cell_height = 300, 220
    rows = (len(SYMBOLS) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * cell_width, rows * cell_height), "white")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=15)

    for index, spec in enumerate(SYMBOLS):
        row, column = divmod(index, columns)
        x0, y0 = column * cell_width, row * cell_height
        with Image.open(preview_dir / f"{spec.slug}.png").convert("RGB") as preview:
            preview.thumbnail((240, 145), Image.Resampling.LANCZOS)
            image_x = x0 + (cell_width - preview.width) // 2
            image_y = y0 + 12 + (145 - preview.height) // 2
            sheet.paste(preview, (image_x, image_y))
        label = f"{index + 1}. {spec.name}"
        label_box = draw.textbbox((0, 0), label, font=font)
        label_width = label_box[2] - label_box[0]
        draw.text((x0 + (cell_width - label_width) / 2, y0 + 170), label, fill="#17233b", font=font)
        draw.rectangle((x0, y0, x0 + cell_width - 1, y0 + cell_height - 1), outline="#d8dee9")

    sheet.save(output_path, dpi=(150, 150))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output_dir", type=Path, help="Appendix directory for index.md and generated assets")
    parser.add_argument(
        "--gallery-dir",
        type=Path,
        default=None,
        help="Appendix directory for the five-across gallery page "
        "(default: a 'symbol-gallery' directory beside output_dir)",
    )
    parser.add_argument(
        "--gallery-only",
        action="store_true",
        help="Write only the gallery page, reusing the SVGs already rendered",
    )
    args = parser.parse_args()

    if len(SYMBOLS) != 100:
        raise RuntimeError(f"Expected exactly 100 symbols, found {len(SYMBOLS)}")

    output_dir = args.output_dir.resolve()
    gallery_dir = (
        args.gallery_dir.resolve()
        if args.gallery_dir is not None
        else output_dir.parent / "symbol-gallery"
    )

    if args.gallery_only:
        write_gallery_markdown(gallery_dir, output_dir / "symbols")
        return

    output_dir.mkdir(parents=True, exist_ok=True)
    _, preview_dir = render_symbols(output_dir)
    write_markdown(output_dir)
    write_gallery_markdown(gallery_dir, output_dir / "symbols")
    make_contact_sheet(preview_dir, output_dir / "symbols-contact-sheet.png")


if __name__ == "__main__":
    main()
