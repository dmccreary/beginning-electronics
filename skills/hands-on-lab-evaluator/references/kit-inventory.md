# The $50 Kit Inventory

Every lab in this book must be buildable by an 8th grader sitting at a desk
with one solderless breadboard, a USB power supply, and the parts below. That
constraint is the whole point: a lab that needs an oscilloscope or a
microcontroller is a lab most classrooms cannot run, no matter how good the
writing is.

`scripts/evaluate_lab.py` parses this file. Each bullet is one part, with
pipe-separated aliases the script matches against the lab's materials list. The
first alias is the canonical name. Edit this file when the reference kit
changes - do not hard-code parts into the script.

## In-Kit Parts

### Board and wiring

- breadboard | solderless breadboard | half-size breadboard | 830 tie point | protoboard
- jumper wire | jumper wires | jumpers | hookup wire | dupont | male-to-male wire
- alligator clip | alligator clips | test lead

### Power

- USB power supply | usb wall charger | 5v power | 5 volt power | usb cable | usb a male
- battery pack | aa battery | aaa battery | 9v battery | battery holder | coin cell
- breadboard power supply module | power rail module | mb102

### Passive components

- resistor | resistors | ohm resistor | current-limiting resistor | current limiting resistor | 220 ohm | 330 ohm | 1k | 10k | 100k | Ω
- potentiometer | trim pot | trimpot | trimmer | variable resistor | pot
- capacitor | ceramic capacitor | electrolytic capacitor | µf | uf | nf | pf | microfarad
- photoresistor | photocell | light dependent resistor | ldr | light sensor
- thermistor | temperature sensor resistor

### Semiconductors

- LED | light emitting diode | leds | red led | green led | blue led | yellow led
- RGB LED | rgb led | tri-color led | common cathode led | common anode led
- diode | 1n4001 | 1n4148 | rectifier diode | flyback diode
- zener diode | zener
- transistor | npn | pnp | 2n2222 | bc547 | bc337 | s8050 | 2n3904
- 555 timer | ne555 | 555 chip | timer ic
- shift register | 74hc595 | 595
- voltage regulator | 7805 | lm7805 | ams1117

### Input and output

- push button | pushbutton | push-button | tactile switch | momentary switch | button
- slide switch | toggle switch | spdt | dip switch | latching switch
- buzzer | piezo | active buzzer | passive buzzer | speaker
- DC motor | small motor | hobby motor | vibration motor | fan motor
- servo | sg90 | micro servo

### Tools the classroom already has

- multimeter | dmm | volt meter | voltmeter | ohm meter | ohmmeter | continuity tester
- needle nose pliers | wire stripper | wire cutter | tweezers | small screwdriver
- printed circuit diagram | printed handout | printout | worksheet | lab notebook | pencil
- computer | tablet | browser | projector | phone camera

## Out-of-Kit Parts

Anything here should be flagged. It is not automatically fatal - a lab may
legitimately mention an oscilloscope in a "what the pros use" aside, or offer a
kit part as an optional upgrade. What it must never be is a *required* item in
the materials list with no in-kit substitute.

- oscilloscope | scope probe | logic analyzer | spectrum analyzer
- function generator | signal generator bench | bench power supply | lab supply
- Arduino | raspberry pi | esp32 | microcontroller | micro:bit | pico | microbit
- soldering iron | solder | flux | desoldering | perfboard | perf board | protoboard soldering
- op-amp | lm358 | operational amplifier | comparator ic | lm393
- relay | solenoid | stepper motor | h-bridge | l293d | motor driver board
- seven segment display | 7-segment | lcd display | oled | i2c display | led matrix
- ultrasonic sensor | hc-sr04 | infrared sensor | pir sensor | dht11 | dht22
- mains power | 120 volt | 240 volt | wall outlet wiring | ac line voltage
- 3d printer | laser cutter | pcb fabrication | cnc

## Substitution Rules

When a lab needs something the kit lacks, the lab is only acceptable if it says
what to do instead, in the materials list itself and not buried in a footnote:

| Situation | Acceptable handling |
|-----------|---------------------|
| Exact resistor value unavailable | Give a range that works and explain the tradeoff ("220Ω-470Ω; higher = dimmer") |
| Specific transistor unavailable | Name at least two interchangeable parts (2N2222 or BC547) and note pinouts differ |
| Bench supply implied | Specify the 5V USB supply or battery pack instead |
| Oscilloscope implied | Point to the MicroSim's scope panel as the stand-in, and say so |
| Multimeter required | Mark it optional with a "what you'd see" value printed in the lab, so a student without one can still finish |

## Cost and Count Discipline

- A lab should use the **fewest parts that still teach the concept**. Extra
  parts cost bench time, invite wiring mistakes, and dilute what the student is
  supposed to notice. If a part can be removed without losing the learning
  objective, the lab is better without it.
- Quantities matter as much as part names. "Resistors" is not a materials list;
  "two 220Ω resistors (red-red-brown)" is, because a student pulling parts from
  a bag needs the count and the color band.
- Total build time for one lab should fit a single class period: roughly 10
  minutes of setup, 20-30 minutes of building, 10 minutes of review.
