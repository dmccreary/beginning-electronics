---
title: Course Description for Beginning Electronics
description: A detailed course description for Beginning Electronics including overview, topics covered and learning objectives in the format of the 2001 Bloom Taxonomy
quality_score: 98
---
# Beginning Electronics

**Title:** Beginning Electronics: Breadboards, Circuits, and Real-World Projects

**Target Audience:** Students in 5th through 12th grade (ages ~10–18) in US classrooms, afterschool programs, and maker clubs, as the primary audience — with content written to be accessible to learners of all ages, including hobbyists, makers, parents, mentors, and adult continuing-education students. No strong math background is assumed.

**Prerequisites:** None required. No prior electronics or programming experience is assumed. Comfort with basic reading and simple arithmetic (adding and multiplying small numbers) is helpful for the Ohm's Law activities. Each student, or pair of students, needs a solderless breadboard, a safe low-voltage power source (a 5V USB power supply or a battery pack), and access to a roughly **$50 kit** of beginner electronic components. No microcontroller, computer programming, or coding of any kind is required for this course.

## Course Overview

This course is a hands-on, no-soldering-required introduction to electronics for young makers. Working entirely on a solderless breadboard with about $50 worth of parts, students build real circuits with their own hands — lighting up LEDs, spinning motors, sensing light and darkness, and making buzzers beep — and see the results instantly. There is no waiting for code to compile and no risk of a soldering iron burn: every project in the core curriculum can be built, tested, rewired, and improved in seconds just by moving a wire. Electronics stops being a mystery and becomes something students can see, touch, and control.

The course is carefully sequenced so that every new idea rests on one already mastered. Students begin by simply learning to recognize and name the parts in their kit and by discovering how a breadboard's hidden rows and columns connect components together. From there, the course builds — one small, confidence-boosting step at a time — through power and Ohm's Law, switches, and clever ways of wiring buttons together to create AND and OR logic without writing a single line of code. Students then meet potentiometers and photoresistors to build a light-activated night light, learn how a transistor can act as both a switch and an amplifier, and use that transistor knowledge to build true logic gates. The course closes with 555 timer chips that blink and beep, capacitors and RC timing circuits, a 74HC595 shift register that commands eight LEDs at once, and a set of real-world kits (voltage regulators, buck converters, and signal generators) that show students how the concepts they learned power the gadgets around them. Along the way, interactive browser-based simulations (MicroSims) let students experiment safely before — and after — they wire up the real thing.

Beyond circuits, this course builds the habits of mind that make a great engineer: careful observation, systematic troubleshooting, and the patience to test one change at a time. It is intentionally designed as the companion volume to [Learning MicroPython and Physical Computing](https://dmccreary.github.io/learning-micropython/): this course builds deep, tactile intuition for how electricity and components behave, while the MicroPython course picks up right where this one leaves off, adding microcontrollers and code to bring circuits to life with software. Students who finish both courses leave with a rare combination for their age — real hardware fluency and real programming fluency, built on a foundation of hands-on fun.

## What's in Your $50 Kit?

- A solderless breadboard and an assortment of jumper wires
- Resistors (assorted values), LEDs (assorted colors), and an RGB LED
- Push buttons, a potentiometer (trim pot), and a photoresistor (light sensor)
- One or two small DC motors
- NPN transistors (such as the BC547 and 2N2222)
- A 555 timer IC, a 74HC595 shift register, and a handful of capacitors
- A 5V USB power supply or AA/AAA battery pack

## Main Topics Covered

- **Meet Your Kit** — identifying every part by name and symbol: breadboard, jumper wires, resistors, LEDs, capacitors, buttons, potentiometers, photoresistors, motors, transistors, the 555 timer, and the 74HC595 shift register; reading resistor color codes
- **Breadboard Basics** — how the hidden rows and power rails inside a breadboard connect components, and safely hooking up a battery pack or USB power supply
- **Power, Voltage, and Current** — an intuitive, water-pipe analogy for voltage, current, and resistance, and the safe voltage/current limits used throughout the course
- **Your First LED Circuit and Ohm's Law** — lighting an LED without letting out the "magic smoke," and using a current-limiting resistor with an intuitive, non-algebra-heavy introduction to Ohm's Law (V = I × R)
- **Switches and Buttons** — adding a push button to turn an LED on and off, and the difference between momentary and latching switches
- **Combining Switches: AND & OR Logic (No Code!)** — wiring two buttons in series to build an AND gate and in parallel to build an OR gate, using nothing but wires and switches
- **Variable Resistance: Potentiometers** — using a trim pot to dim an LED by hand and building an intuitive feel for voltage dividers
- **Sensing the World: Photoresistors and the Dark Detector** — building a light-activated "night light" using a photoresistor and a potentiometer
- **RGB LEDs and Color Mixing** — combining red, green, and blue light with three current-limiting resistors to mix custom colors
- **Transistors: Tiny Switches and Amplifiers** — how a transistor lets a small signal from a button or sensor control a much bigger current to a motor or bank of LEDs, comparing the BC547 and 2N2222
- **Building Logic Gates from Transistors** — going beyond wired switches to build true AND, OR, and NOT logic gates from transistors, resistors, and LEDs
- **Timing Circuits with the 555 Timer** — using the classic 555 timer chip to make LEDs blink and buzzers beep on a schedule you design
- **Capacitors and RC Timing** — how capacitors store and release electric charge, and building resistor-capacitor (RC) timing circuits that connect to what the 555 timer is doing internally
- **Shift Registers: Controlling Many LEDs** — using a 74HC595 shift register chip to control eight LEDs from just a few input wires
- **Real-World Kits: Regulators, Converters, and Signal Generators** — assembling and measuring low-cost kits such as a 5V voltage regulator, an adjustable buck converter, and an XR2206 signal generator
- **Capstone Projects and Packaging** — designing an original project (such as a busy board, a solar night light, or a light-up costume "LED noodle"), demonstrating it, and optionally moving it to a perfboard for a permanent, portable build

## Topics Not Covered

- Microcontrollers, programming, or coding of any kind (Arduino, MicroPython, Raspberry Pi Pico, etc.) — this is the focus of the companion course, [Learning MicroPython and Physical Computing](https://dmccreary.github.io/learning-micropython/)
- Soldering and permanent circuit assembly — an optional, adult-supervised enrichment activity for classrooms that want it, not required to complete any core lesson in this no-soldering course
- Advanced digital logic beyond simple gates, an RS latch, and one shift register (flip-flops, counters, state machines, and beyond are covered in our [Digital Electronics](https://dmccreary.github.io/digital-electronics/) course)
- AC mains wiring, mains voltage, or line-powered circuits — every lab uses safe, low-voltage DC power (5V USB or batteries) only
- Calculus-based circuit analysis, complex impedance, AC signal theory, or advanced electromagnetic theory
- Printed-circuit-board (PCB) design and fabrication
- Digital communication buses such as I2C and SPI, and any sensor that requires a microcontroller to read — these are covered in the companion MicroPython course

## Learning Outcomes

After completing this course, students will be able to:

### Remember
*Retrieving, recognizing, and recalling relevant knowledge from long-term memory.*

- Recall the names and schematic symbols of core components: resistor, LED, capacitor, transistor, potentiometer, photoresistor, push button, 555 timer, and 74HC595 shift register
- Identify the power rails and the internally connected rows of a solderless breadboard
- State the standard resistor color-code system and read a resistor's value from its color bands
- Recall Ohm's Law (V = I × R) and the safe voltage and current limits used in this course's kits
- Label the three leads of an NPN transistor (base, collector, emitter) and recognize the BC547 and 2N2222 packages
- List examples of series and parallel switch wiring that create AND-like and OR-like behavior

### Understand
*Constructing meaning from instructional messages, including oral, written, and graphic communication.*

- Explain how electricity flows through a circuit using the water-pipe analogy for voltage, current, and resistance
- Describe why a current-limiting resistor is required to protect an LED from burning out
- Explain how a potentiometer acts as an adjustable voltage divider
- Describe how a photoresistor's resistance changes with light and how that enables a "dark detector"
- Explain how a transistor's small base current can control a much larger current flowing between its collector and emitter
- Summarize how a 555 timer's resistor-capacitor network sets its blinking or beeping rate

### Apply
*Carrying out or using a procedure in a given situation.*

- Build a working LED circuit on a breadboard using a correctly chosen series resistor
- Wire push buttons in series and in parallel to create AND-gate and OR-gate behavior without any code
- Construct a light-activated night light using a photoresistor and a potentiometer
- Use a transistor to let a small button press switch a motor or a bank of LEDs on and off
- Assemble a 555 timer circuit that blinks an LED or sounds a buzzer at a rate the student chooses
- Wire a 74HC595 shift register to control eight LEDs from just a few input connections

### Analyze
*Breaking material into constituent parts and determining how the parts relate to one another and to an overall structure or purpose.*

- Troubleshoot a non-lighting LED circuit by checking polarity, resistor value, and breadboard connections
- Compare the BC547 and 2N2222 transistors and explain when each is the better choice for a project
- Examine an RC timing circuit and predict how changing the resistor or capacitor value speeds up or slows down its timing
- Break down a multi-part kit, such as a buck converter or signal generator, into its input, control, and output stages
- Distinguish which classroom projects require a transistor versus a simple mechanical switch
- Trace how a signal moves from an input component (button, potentiometer, or photoresistor), through a control component (transistor, timer, or shift register), to an output component (LED, motor, or buzzer)

### Evaluate
*Making judgments based on criteria and standards through checking and critiquing.*

- Judge whether a completed circuit meets the course's safety guidelines for voltage and current before powering it on
- Assess two candidate resistor values for an LED circuit and justify which one better balances brightness against component safety
- Critique a partner's breadboard layout for wiring clarity, safety, and ease of troubleshooting
- Evaluate the cost and design trade-offs among the $50 kit's components when planning a capstone project
- Determine whether a project's requirements call for a simple switch, a transistor switch, or a full transistor logic gate
- Review a finished classmate's project against a rubric covering correct function, wiring neatness, and creative design

### Create
*Putting elements together to form a coherent or functional whole; reorganizing elements into a new pattern or structure.*

- Design and build an original circuit that combines at least two input components (button, potentiometer, or photoresistor) with at least two output components (LEDs, motor, or buzzer)
- Develop a working night light, busy board, or LED "noodle" costume project from an initial sketch to a finished breadboard circuit
- Construct a multi-stage project that chains a sensor, a transistor switch, and a timer or shift register together
- Build and test one of the real-world kits (voltage regulator, buck converter, or signal generator) and measure its output
- Package a finished project for demonstration, optionally moving it to a perfboard for a permanent, portable build
- **Capstone project:** Conceive, wire, test, and present an original electronics project of the student's own design, explaining how every component contributes to the whole circuit

## Why This Course Matters

Electronics stops being intimidating the moment a student's own hands make an LED glow for the first time — and that spark of "I built that!" is what this course is designed to deliver, again and again, in small, achievable steps. By using a $50 breadboard kit instead of expensive lab equipment or a soldering iron, this course removes the cost and safety barriers that often keep hands-on electronics out of classrooms and afterschool clubs. Students who complete it gain genuine intuition for how voltage, current, resistance, switching, and timing behave in the physical world — intuition that no amount of reading alone can build. That tactile foundation pays off immediately in science fairs, robotics clubs, and maker projects, and it sets students up to succeed the moment they are ready to add programming: our companion course, [Learning MicroPython and Physical Computing](https://dmccreary.github.io/learning-micropython/), takes students from these same breadboard skills straight into microcontrollers and code. Whether a student stops after building their first night light or goes on to write MicroPython for a robot, this course's progressive, project-driven structure ensures every learner — no matter their math background — can start at the very beginning and build all the way up to a real, working invention of their own.
