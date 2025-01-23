# 2N2222 Transistor LED Dimmer Circuit

!!! prompt
    Please draw the LED dimmer circuit using SVG on a 10x10 grid pattern with (0,0) in the center, (-5,-5) at the lower left and (5,5) at the upper right.  Draw a grid at integers in light gray.

    The circuit has the following components:

    ## Component List and Orientation

    - A top power rail in red
    - A bottom power rail in black
    - A potentiometer with +5 at the top, tap to the right and GND at the bottom
    - A horizontal 10K base current limiting resistor
    - A 2N2222 transistor with the Base to the left, Collector at the top and Emitter at the bottom and the flat side of the transistor symbol be on the right.
    Draw an LED on the right side at (5, 4).
    - A vertical LED
    - A vertical 330K LED current limiting resistor
    
    ## Component Placement and Labels

    - Place a wide red +5 line at the top from (-5,5) to (5,5).
    - Label the top power "+5 Volts" in red at (-4,4.5)
    - Place a wide black GND line at the bottom from (-5,-5) to (5, -5).
    - Label the ground "GND" at (-4, -4.5)
    - Place the potentiometer symbol to the left + at (-5,0)
    - Label he potentiometer center "Tap" at (-5,.5)
    - Place the 10K ohm base current limiting resistor at (-4, 0).
    - Place the label "10K" at (-4, .5)
    - Place a 2N2222 transistor symbol at (0.0) with the base going to the left, the emitter going to GND at (0, -5) and the collector going up.
    - Place the label "2N2222" at (1,0)
    - Place the label the "Collector" of the 2N2222 at (-.5,1).
    - Place the label the "Base" of the transistor at (-.5,.5)
    - Place the label the "Emitter" of the transistor at (-.5,-1)
    - Place the vertical LED symbol at with the top at (5,5) and the bottom at (5,4)
    - Draw a vertical LED current limiting 330 ohm resistor from (5, 3) to (5, 1)

    ## Connecting Wires

    - Connect the components only vertical or horizontal wires.
    - Using a horizontal wire, connect the tap of the potentiometer from (-5,0) to the 10K resistor at (-4,0)
    - Using a horizontal wire, connect the right side of the 10K resistor at (-3,0) to the base of the transistor at (-1,0)
    - Using a vertical wire, connect the bottom of the LED at (5,4) to the top of the resistor at (5,3)
    - Using a vertical wire, connect the top of the 330 ohm resistor at (5, 3) to the bottom of the LED at (5,4)
    - Using a horizontal wire, connect the bottom of the 330 ohm resistor at (5,1) to the Collector at (0,1)


## Circuit Diagram
```
VCC (5V) ----[10K Potentiometer]----[10K Resistor]----+
                                                      |
                                              [Base]  |
                                            2N2222    |
VCC (5V) ----[LED]----[220Ω]----[Collector]          |
                                            [Emitter] |
                                                      |
GND ----------------------------------------------[GND]
```

## Component Details
- 2N2222 NPN Transistor (TO-92 package)
- 10K ohm potentiometer
- 10K ohm base resistor
- 220 ohm LED current limiting resistor
- Standard LED (20mA rating)

## Operation Principles

1. **Base Current Control**
   - Potentiometer varies voltage at base
   - 10K base resistor limits maximum base current to safe level
   - Base current range: 0 to ~0.5mA

2. **Amplification**
   - Transistor operates in active region
   - Collector current proportional to base current (β ≈ 100)
   - Maximum collector current ~50mA (limited by resistors)

3. **LED Dimming**
   - Smooth transition through active region
   - Minimal dead zone at low pot settings
   - Protected from overcurrent by 220Ω resistor

## Performance Benefits
- More linear control than direct potentiometer dimming
- Reduced minimum brightness threshold
- Better thermal stability
- Protected against component damage

## Common Issues and Solutions
1. **LED Flicker**
   - Add 0.1µF capacitor across pot terminals
   - Ensure clean power supply

2. **Non-linear Response**
   - Adjust base resistor value
   - Consider logarithmic potentiometer