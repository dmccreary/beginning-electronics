---
title: Typical Parts in a $50 Beginning Electronics Kit
description: A complete bill of materials for the roughly $50 solderless breadboard kit used throughout this course, with quantities, typical values, approximate costs, and the parts we deliberately left out.
---

# Typical Parts in a $50 Beginning Electronics Kit

Every lab, project, and MicroSim in this book was designed around a single
box of parts that costs about **$50**. This appendix is that box, written
out item by item: what goes in it, how many of each, roughly what it costs,
and which chapter you will finally get to use it in.

!!! mascot-welcome "Your Whole Toolbox on One Page"
    ![Volt waving welcome](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Fifty dollars. That's it. Everything you need to blink, buzz, sense,
    switch, and spin your way through this entire course fits in one small
    plastic box — and by the end you'll know every part in it by name.
    Let's light it up!

## How to Read This List

Each table below uses the same four columns:

| Column | What It Tells You |
|--------|-------------------|
| **Qty** | How many you want on hand for one student or one pair of students |
| **Part** | The name to search for when you buy it |
| **Typical Value or Spec** | The size, rating, or part number that works for this course |
| **Where You Use It** | The first chapter or lab that needs it |

Prices are approximate US prices for small online quantities and change
constantly. Buying an assortment (a bag of 300 mixed resistors, a bag of
50 mixed LEDs) is almost always cheaper than buying single values.

## Breadboard and Wiring

| Qty | Part | Typical Value or Spec | Where You Use It |
|-----|------|----------------------|------------------|
| 1–2 | Solderless breadboard | 400 tie-point (half size) or 830 tie-point (full size) | Chapter 6, [Breadboard Lab](../../labs/08-breadboard/) |
| 1 set | Male-to-male jumper wires | 65-piece pre-formed set, or 20 cm flexible wires | Chapter 7 |
| 1 spool | Solid-core hookup wire (optional) | 22 AWG, for cutting custom-length jumpers | Chapter 7 |

A solid-core wire is required for breadboards — stranded wire frays and
will not push into a tie point. Keep a spare breadboard around; at roughly
$2 each, a dead board is cheaper to replace than to debug.

## Power

| Qty | Part | Typical Value or Spec | Where You Use It |
|-----|------|----------------------|------------------|
| 1 | **MB102 breadboard power supply module** | 5 V / 3.3 V, plugs straight onto the power rails | Chapter 5, [Power Lab](../../labs/09-power/) |
| 1 | 7.5 V or 9 V wall adapter | 5.5 × 2.5 mm barrel plug, to feed the module (avoid 12 V — see below) | Chapter 5 |
| 5 | PTC resettable fuse | 500 mA hold / 1 A trip, in series with the +5 V rail | Chapter 5 |
| 1 | USB wall charger (alternative) | 5 V, 500 mA or more | Chapter 5 |
| 1 | USB A male-to-male cable | For the USB charger option | Chapter 5 |
| 1 | AA battery holder with leads | 4 × AA, gives about 6 V | Chapter 5 |
| 4 | AA batteries | Alkaline or rechargeable NiMH | Chapter 5 |

Every circuit in this course runs on safe, low-voltage DC — 5 V from a
module or charger, or about 6 V from batteries. Nothing in this kit ever
touches wall voltage.

### Why the Power Module Is Worth the Extra Two Dollars

For a classroom, the MB102 module is the recommended way to power a
breadboard, and the reason is not convenience — it is **what happens when a
student shorts their circuit**. Sooner or later one will, and something
downstream takes the hit. When that something is a $2 module that unplugs
from the power rails, you swap it in fifteen seconds and the student keeps
building. When it is a wall charger, you have lost a more expensive part and
possibly the rest of the class period.

Treat the module as a consumable. Buy a couple of spares up front and keep
them in the same box as the breadboards.

### Does the Module Have Overload Protection?

Partly. The AMS1117 regulator inside is genuinely protected — its datasheet
specifies a 900 mA–1.5 A current limit and self-resetting thermal shutdown
above 165 °C. But the board around it has **no fuse**, and the regulator
survives a short by overheating rather than by interrupting anything: at 9 V
in, a shorted rail asks it to dissipate about 10 W in a package rated for
1.2 W.

Two cheap changes fix this — use a 7.5 V or 9 V adapter rather than a 12 V
one, and add a PTC resettable fuse to the + rail. Both are covered in full,
with wiring schematics, on **[Safe Power for
Learning](../../setup/safe-power-for-learning/)**.

**Power it through the barrel jack, not the USB socket.** The MB102's
documented input is a 5.5 × 2.5 mm barrel jack wanting 6.5–12 V DC — pair it
with a 7.5 V or 9 V wall adapter, or a 9 V battery clip ending in a barrel
plug. The USB-A socket is not a reliable input: on some board revisions it
feeds the regulator, on others it is an *output* for charging a phone, and
even where USB input works, 5 V in for 5 V out leaves the regulator in
dropout where it is barely regulating at all. Check what your board does
before depending on it.

!!! mascot-warning "Never Wire to Wall Voltage"
    ![Volt pointing out a common mistake](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    A USB charger is safe because it does the dangerous part *inside its own
    sealed case*. Your breadboard only ever sees the 5 volts that come out
    the other end. Never, ever wire a breadboard circuit to a wall outlet,
    an extension cord, or a lamp socket.

## Resistors

| Qty | Part | Typical Value or Spec | Where You Use It |
|-----|------|----------------------|------------------|
| 1 bag | Resistor assortment | ~300 pieces, 1/4 watt, 5% tolerance | Chapter 9 |

A good assortment gives you at least 10 of each of these values, which
covers every circuit in the book:

| Value | Color Bands | Typical Job |
|-------|-------------|-------------|
| 100 Ω | brown-black-brown | LED current limiting on lower voltages |
| **220 Ω** | red-red-brown | **The standard LED resistor in this course** |
| **330 Ω** | orange-orange-brown | **The other standard LED resistor** |
| 470 Ω | yellow-violet-brown | Dimmer LEDs, RGB LED channels |
| 1 kΩ | brown-black-red | Transistor base resistor |
| 2.2 kΩ | red-red-red | Transistor base resistor, dividers |
| 4.7 kΩ | yellow-violet-red | Voltage dividers, 555 timing |
| 10 kΩ | brown-black-orange | **Pull-up and pull-down resistors, 555 timing** |
| 22 kΩ | red-red-orange | Slower 555 timing |
| 47 kΩ | yellow-violet-orange | Slower 555 timing |
| 100 kΩ | brown-black-yellow | Very slow RC timing |
| 1 MΩ | brown-black-green | Long-delay RC circuits |

Many pre-packed assortments skip 330 Ω and 2.2 kΩ. That is not a
deal-breaker: a 220 Ω or a 470 Ω resistor will light every LED in this book,
and a 2 kΩ substitutes for a 2.2 kΩ anywhere it appears. Check the value
list before you buy, and top up the gaps for a few cents.

!!! mascot-tip "Buy the Big Bag"
    ![Volt offering a helpful tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    A 300-piece resistor assortment costs about the same as 30 individually
    purchased resistors. Sort them into a labeled box the day you get them —
    future-you, halfway through a dark detector build, will be very grateful.

## Capacitors

| Qty | Part | Typical Value or Spec | Where You Use It |
|-----|------|----------------------|------------------|
| 10 | Ceramic capacitor | 0.01 µF (10 nF), marked `103` | Chapter 10 |
| 10 | Ceramic capacitor | 0.1 µF (100 nF), marked `104` | Chapter 14 (555 pin 5 bypass) |
| 5 | Electrolytic capacitor | 1 µF, 16 V or higher | Chapter 10 |
| 5 | Electrolytic capacitor | 10 µF, 16 V or higher | [RC Circuit Lab](../../labs/80-rc-circuit/) |
| 5 | Electrolytic capacitor | 47 µF, 16 V or higher | Chapter 10 |
| 5 | Electrolytic capacitor | 100 µF, 16 V or higher | Chapter 22 |
| 2 | Electrolytic capacitor | 220 µF or 470 µF, 16 V or higher | Chapter 22 |

Electrolytic capacitors are **polarized** — the stripe marks the negative
lead, and installing one backwards can make it fail loudly. Ceramic
capacitors have no polarity and go in either way.

## Switches and Buttons

| Qty | Part | Typical Value or Spec | Where You Use It |
|-----|------|----------------------|------------------|
| **10** | **Momentary push button (tactile switch)** | **6 mm × 6 mm, 4-pin, through-hole** | **Chapter 16, [Buttons Lab](../../labs/11-buttons/)** |
| 2 | Momentary push button with colored cap | 12 mm, 4-pin, easier for small hands | Chapter 16 |
| 2 | Slide switch (SPDT) | 3-pin, latching on/off | Chapter 16 |
| 1 | Toggle or rocker switch (optional) | SPDT, for capstone project enclosures | Chapter 26 |

Momentary push buttons are the single most-used input part in this book.
You need plenty of them: the AND-logic lab and the OR-logic lab each use
two at once, the combination-lock project uses four, and they are small
enough to lose. Ten is the right number.

!!! mascot-thinking "Why Four Pins for a Two-Wire Switch?"
    ![Volt thinking about a key concept](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    A 4-pin tactile button really is just one switch. The two pins along the
    *same* side of the body are permanently wired together inside — the
    extra pair is there so the button sits down firmly and doesn't wobble.
    Pressing the button connects one side to the other side. The foolproof
    rule: **use two pins that are diagonally opposite each other**, and
    straddle the button across the center channel of the breadboard.

## Variable Resistance and Sensors

| Qty | Part | Typical Value or Spec | Where You Use It |
|-----|------|----------------------|------------------|
| 3 | Trim potentiometer (trimpot) | 10 kΩ, 3-pin, screwdriver-adjusted | [Dark Detector Lab](../../labs/20-dark-detector/) |
| 1 | Panel potentiometer with knob | 10 kΩ linear taper | Chapter 11, LED Dimmer kit |
| 1 | Trim potentiometer | 100 kΩ, for slow 555 timing | Chapter 14 |
| 5 | Photoresistor (LDR / photocell) | 5 mm, roughly 5 kΩ lit to 1 MΩ dark | Chapter 17 |
| 2 | NTC thermistor | 10 kΩ at 25 °C | Chapter 11 |

Photoresistors and thermistors have no polarity and no brain inside them —
they are simply resistors whose material responds to light or heat. That is
what makes them the perfect first sensors in a course with no code.

## Semiconductors

| Qty | Part | Typical Value or Spec | Where You Use It |
|-----|------|----------------------|------------------|
| 10 | NPN transistor | BC547 | Chapter 13, [Transistors Lab](../../labs/30-transistors/) |
| 10 | NPN transistor | 2N2222 (or PN2222A) | [BC547 vs. 2N2222 Lab](../../labs/31-bc547-vs-2n2222/) |
| 5 | PNP transistor | 2N3906 | Chapter 13 |
| 5 | NPN transistor | 2N3904 (a common BC547 substitute) | Chapter 13 |
| 10 | Small-signal diode | 1N4148 | Chapter 12 |
| 10 | Rectifier / flyback diode | 1N4007 | Chapter 19 (motor protection) |

The BC547 and the 2N2222 do the same job but have their pins in **opposite
order** — the whole point of the comparison lab. Sort them into separate
compartments and label both.

## LEDs

| Qty | Part | Typical Value or Spec | Where You Use It |
|-----|------|----------------------|------------------|
| 1 bag | Assorted 5 mm LEDs | ~50 pieces: red, green, yellow, blue, white | Chapter 12, [LED Circuit Lab](../../labs/10-led-circuit/) |
| 8+ | Red 5 mm LEDs | Diffused, for the shift register bar graph | Chapter 15 |
| **2–4** | **RGB LED** | **5 mm, common cathode, 4 pins** | **[RGB LED Lab](../../labs/14-rgb-led/)** |
| 1 | LED "noodle" / filament LED (optional) | 3 V flexible filament | [LED Noodle Lab](../../labs/40-noodle-led-circuit/) |

Blue and white LEDs need more forward voltage than red ones, so the same
resistor gives you a dimmer result. Chapter 12 explains why.

**Never accept a kit without RGB LEDs.** One four-pin part that mixes any
color you ask for is the single most memorable component in the whole box,
and the color-mixing lab is one of the moments students remember months
later. Many budget kits ship a single RGB LED, or none at all. If a kit you
are considering leaves them out, either pick a different kit or buy a bag of
ten separately — they cost only a few cents each, and having spares means
students can keep one wired up while they experiment with another.

## The Two Integrated Circuits

| Qty | Part | Typical Value or Spec | Where You Use It |
|-----|------|----------------------|------------------|
| 2 | 555 timer IC | NE555 or LM555, 8-pin DIP | Chapter 14, [LED Flasher](../../labs/90-led-flasher/) |
| 2 | 74HC595 shift register IC | 16-pin DIP | Chapter 15 |
| 2 | 8-pin DIP socket | For the 555 | Chapter 14 |
| 2 | 16-pin DIP socket | For the 74HC595 | Chapter 15 |

These are the **only two chips** in the course, and both are chosen because
they can be fully understood without a microcontroller. Buy the DIP
(through-hole) versions — surface-mount packages will not fit a breadboard.

## Output Devices

| Qty | Part | Typical Value or Spec | Where You Use It |
|-----|------|----------------------|------------------|
| 1 | Active buzzer | 5 V, beeps on its own when powered | Chapter 19 |
| 1 | Passive buzzer / piezo element | 5 V, needs a signal to make tone | Chapter 19 |
| 1–2 | Small DC motor | 3–6 V hobby motor with a paper propeller | Chapter 18 |

## Storage and Basic Tools

| Qty | Part | Typical Value or Spec | Where You Use It |
|-----|------|----------------------|------------------|
| 1 | Compartment storage box | 18–24 compartments with a latching lid | Day one |
| 1 | Small flat-blade screwdriver | 2 mm, for trimpots and terminal blocks | Chapter 11 |
| 1 | Needle-nose pliers (optional) | For bending and straightening leads | Chapter 7 |

## Approximate Budget

| Category | Approximate Cost |
|----------|-----------------|
| Breadboard and wiring | $5 |
| Power (MB102 module, 9 V adapter, battery holder) | $7 |
| Resistor assortment | $5 |
| Capacitor assortment | $4 |
| LEDs and RGB LEDs | $4 |
| Push buttons and switches | $2.50 |
| Potentiometers, photoresistors, thermistors | $3.50 |
| Transistors and diodes | $5 |
| 555 timer, 74HC595, and DIP sockets | $3 |
| Buzzers and DC motor | $4.50 |
| Storage box and small tools | $5.50 |
| **Total** | **About $49** |

Buying pre-assembled "electronics starter kits" often beats this total —
see [Purchasing Component Kits](../../setup/breadboard-kits/) for listings.
Check the kit contents against this appendix before you buy, since some kits
skip the 74HC595 or ship only two or three push buttons.

## Cross-Check: A Real Off-the-Shelf Kit

To show what this looks like in practice, here is the **WayinTop Electronics
Component Fun Kit** (part number WYTP-EC01), a widely sold starter kit that
runs about **$33 with free shipping**. It is a good, honest match for this
course — but not a complete one. Use this comparison as a template for
evaluating whatever kit you find.

### What It Already Covers

| Course Requirement | What the Kit Ships |
|--------------------|-------------------|
| Solderless breadboard | Full-size (830-tie) breadboard |
| Jumper wires | Three kinds: U-shape preformed, flexible, and 20-pin M-M / M-F / F-F ribbon |
| **Momentary push buttons** | **10 mini tactile push buttons — exactly the quantity this course wants** |
| Latching switch | Slide switches |
| 5 mm LEDs | 50 total: 10 each of red, green, yellow, blue, white |
| RGB LED | Included, but only one — buy a bag of spares (see below) |
| Resistors | 10 each of 10 Ω, 100 Ω, 220 Ω, 470 Ω, 1 kΩ, 2 kΩ, 4.7 kΩ, 10 kΩ, 47 kΩ, 100 kΩ, 470 kΩ, 1 MΩ |
| Ceramic capacitors | 0.1 µF ×10, 0.01 µF ×10, 220 pF ×10 |
| Electrolytic capacitors | 10 µF ×5, 100 µF ×5 |
| NPN transistor | 2N2222 ×3 and S8050 ×3 |
| PNP transistor | SS8550 ×3 |
| Diodes | 1N4148 and 1N4007 |
| 555 timer | NE555 |
| 74HC595 shift register | Included |
| Buzzers | Both active and passive |
| Potentiometer | One panel potentiometer with a shaft |
| Photoresistor and thermistor | One of each |
| Power | MB102 power supply module — the recommended module — plus a 9 V battery clip with a barrel plug |
| Perfboard | Two boards, single- and double-sided |

### What You Still Need to Buy

| Missing Part | Why the Course Needs It | Approx. Cost |
|--------------|------------------------|--------------|
| RGB LEDs ×10, common cathode | The kit ships only one, and the color-mixing lab deserves spares | $2 |
| Spare MB102 power modules ×2 | The first student short-circuit costs you a module, not a class period | $4 |
| Small DC motor (3–6 V) | Chapters 18 and 19 have no substitute for a spinning load | $3 |
| 10 kΩ trim potentiometer ×3 | The [Dark Detector Lab](../../labs/20-dark-detector/) calls for a screwdriver-adjusted trimpot, not a knob | $2 |
| BC547 transistors ×10 | The [BC547 vs. 2N2222 Lab](../../labs/31-bc547-vs-2n2222/) compares two specific pinouts | $2 |
| 330 Ω resistors ×10 | Used throughout as an LED resistor (220 Ω or 470 Ω will substitute) | $1 |
| 9 V wall adapter, 5.5 × 2.5 mm barrel plug | To run the power module from the wall instead of a battery | $5 |
| Compartment storage box | 200+ loose parts will not survive a school year in a bag | $4 |
| Small flat-blade screwdriver | For the trimpots | $1.50 |

At about **$33 for the kit plus $24.50 in top-ups**, you land at roughly $58 —
a little over the target, but that includes ten RGB LEDs and two spare power
modules, which are exactly the parts worth having extras of.

!!! mascot-warning "Use the Barrel Jack, Not the USB Socket"
    ![Volt pointing out a common mistake](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    This one trips up almost everyone, because the USB socket does different
    things on different boards — on WayinTop's own diagram it is an *output*
    for charging a phone, while other MB102s accept power in through it. Skip
    the guessing: feed it 6.5–12 V through the round barrel jack, using the
    included 9 V battery clip or a 7.5–9 V wall adapter.

### Extras You Can Ignore

This kit includes parts this course deliberately leaves out. None of them
will hurt anything, but do not go looking for a lesson that uses them:

- **1-digit and 4-digit 7-segment displays** — interesting, but they really
  want a microcontroller to drive
- **5 V relay** — Chapter 19 explains how a relay works and notes it is not
  a kit part; if you have one, you now have a bonus demo
- **4N35 optocoupler** — not used in any lab in this course, and rarely
  useful in beginning STEM electronics generally; put it aside
- **Tilt switches and screw terminals** — handy for capstone projects
- **Solder wire and pin headers** — this kit is also sold as a soldering
  practice kit; none of the core labs require soldering, and any soldering
  should be adult-supervised

The kit is marketed "for Arduino, Raspberry Pi, ESP32, ESP8266," but **no
microcontroller is included** — that is a description of what you *could*
plug it into, and it makes no difference to this course.

### Two Things to Verify on Arrival

Neither of these is stated in the listing, so check them when the box opens:

1. **Is the RGB LED common cathode or common anode?** Lab 14 assumes common
   cathode. With a common-anode part, the wiring flips.
2. **Are the quantities per student or per class?** Three transistors, one
   potentiometer, one photoresistor, and one thermistor is thin for a
   classroom. For a group of students, buy multiples of the sensors or a
   separate bulk bag.

## Nice to Have, But Not Required

These are not counted in the $50 and are not needed to finish any core
lesson:

| Part | Why You Might Want It | Where It Appears |
|------|----------------------|------------------|
| Digital multimeter | Measuring voltage, resistance, and continuity yourself | Chapter 20 |
| Perfboard and headers | Making a favorite circuit permanent | [Perf Boards Lab](../../labs/70-using-perf-boards/) |
| 7805 voltage regulator kit | Building a fixed 5 V supply | Chapter 22 |
| Buck converter module | Building an adjustable supply | Chapter 22 |
| XR2206 signal generator kit | Generating waveforms | Chapter 23 |
| Small solar panel | Solar night light capstone | Chapter 23 |

## Parts We Deliberately Left Out

Part of designing a good beginner kit is deciding what *not* to put in it.
Every item below is genuinely useful in electronics, and every one of them
would pull this course away from what makes it work: circuits a student can
build, break, rewire, and understand in a single sitting, with no code.

| Left Out | Why |
|----------|-----|
| Microcontrollers (Arduino, Raspberry Pi Pico, ESP32) | This course is deliberately code-free. They are the subject of the companion course, [Learning MicroPython and Physical Computing](https://dmccreary.github.io/learning-micropython/). |
| 7400-series logic gate chips (7400, 7402, 7408, 7432) | You *build* AND, OR, and NOT gates out of buttons and transistors here. Pre-made gate chips would skip the whole lesson. |
| Flip-flop, counter, and decoder chips (74LS74, CD4017, CD4511) | Sequential logic beyond a single RS latch belongs to the [Digital Electronics](https://dmccreary.github.io/digital-electronics/) course. |
| 7-segment displays, LED matrices, and LCD modules | These need either many more pins or a microcontroller driver to be interesting. |
| I2C and SPI sensor breakout boards | A digital bus sensor cannot be read without code. |
| Servo motors | A servo needs a timed pulse train from a microcontroller. |
| Relays and relay modules | Chapter 19 explains how a relay works, but a transistor already covers every switching job in this kit. |
| Optocouplers / photocouplers (4N35, PC817) | Never used in any lab in this course. Kits often include one; it will sit in the box unused. |
| Op-amps (LM358, LM741) | Analog amplifier design is a course of its own. |
| Anything above 12 volts, or any mains-powered part | Every lab here is safe, low-voltage DC. |

!!! mascot-celebration "You Know Every Part in the Box"
    ![Volt celebrating an achievement](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    Here's something worth noticing, builder: there are fewer than thirty
    different parts on this whole page, and they are enough to build a night
    light, a logic gate, a flasher, and an eight-LED display. Knowing a small
    set of parts *deeply* beats owning a huge box you can't explain — and
    that's your superpower in action!

## Related Pages

- [Safe Power for Learning](../../setup/safe-power-for-learning/) — choosing a supply, and adding a PTC fuse to the + rail
- [Purchasing Component Kits](../../setup/breadboard-kits/) — where to buy
- [Purchasing Breadboards](../../setup/purchasing-breadboards/) — buying in bulk for a classroom
- [Power Supplies](../../setup/power-supplies/) — the full catalog of supply options
- [Identifying Parts Lab](../../labs/05-part-identification/) — the hands-on version of this list
- [List of Circuit Symbols](../list-of-symbols/) — the schematic symbol for each part
