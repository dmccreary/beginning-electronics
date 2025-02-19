# LED Dimmer Project

!!! prompt
    Here is a basic circuit used in our beginning electronics class for high-school students.
    Please create an SVG diagram for this circuit.

    In this project we will create a dimmer circuit for one or more LEDs.
    Our power supply will be 5 volts.
    We will use a potentiometer to change the brightness of the the LEDs.
    We will use a 2N2222 NPN transistor to control the current to the LEDs.
    We will use a 10K resistor to limit current to the base of the 2N2222 NPN transistor.
    We will use a 220 ohm resistor to limit the current flow to the LEDs.

    Please draw a circuit diagram for this circuit with the following placement rules:

    ## Grid Layout and Power Rails

    The layout is a 10x10 grid with (0,0) at the center of the grid with (-5,-5) as the lower-left corner and (5,5) as the upper right corner.
    Provide a 50 pixel margin around the drawing.
    The 5+ is on the top row of a 10x10 grid and is a 5 pixel wide horizontal red line.
    The GND is on the bottom row of a 10x10 grid and is a 5 pixel wide black line.
    Always use horizontal or vertical lines for wires.
    
    ## Component Placement

    The Potentiometer is place on the left at (-5,0).
    The base current limiting 10K resistor is at (-2,0) and is oriented horizontally.
    The 2N2222 NPN transistor is placed at the center at (1,0).
    The LED is in the upper right with the anode at (5, 4) and the cathode at (5,3)
    The current limiting 220 ohm resistor is at (5, 2) and is oriented vertically.

    ## Wiring Instructions
    
    Connect the top lead of the potentiometer to +5 using a vertical line.
    Connect the bottom lead of the potentiometer to GND.
    Connect the center tap of the potentiometer to the left side of the 10K current limiting resistor.
    Connect the right side of the 10K current limiting resistor to the base of the 2N2222 NPN transistor.
    Connect the collector of the 2N2222 NPN transistor to the bottom of the 220 ohm resistor.
    Connect emitter of the 2N2222 NPN vertically to GND.
    Connect the anode of the LED to +5.
    Connect the cathode of the LED to the top of the 220 ohm current limiting resistor.

## ChatGPT o1

[LED Dimmer Circuit in SVG](led-dimmer-circuit.html)

[LED Dimmer Circuit in SVG v2](led-dimmer-circuit-2.html)