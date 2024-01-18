# LED Resistor Calculator

<figure markdown>
   ![Image Name](./image.png){ width="400" }
   <figcaption>Figure caption.</figcaption>
</figure>

[Link to Demo](./template.html){ .md-button .md-button--primary }

## About this MicroSim

This MicroSim will allow us to select the right resistor for an LED circuit.
The user will select:

1. The power supply voltage
2. The LED type
3. The brightness desired (very dim to max brightness)

The MicroSim will then suggest the correct resistor to use.

## Background

When we have an LED circuit, we frequently need to select a fixed resistor to
limit the flow of current through the LED.  Many of our projects use
a 3-volt battery or a 3.3-volt power supply.  Doing an approximate calculation
of the current needed to make a standard LED work in these conditions is pretty
simple.  If we use a standard red LED a 220-ohm resistor will work in most cases.

We can use Ohm's law to calculate the current.  Let's pick a 3.3-volt power supply and
a red LED.

## About this MicroSim

This MicroSim teaches us how to
specify the drawing of a static filled circle.

## Sample Prompt

```linenums="0"
Create a single file p5.js sketch.
Draw a green circle on a 600x400 canvas with a radius of 200.
```

## Sample Response

```javascript
let canvasHeight = 400;
let aspectRatio = 1.91; // Open Graph standard
let canvasWidth = canvasHeight * aspectRatio;
let radius = 200;
function setup() {
const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas-container');
  fill(245);
  rect(0,0, canvasWidth, canvasHeight);
  fill('green');
  circle(canvasWidth/2, canvasHeight/2, radius);
}
```

## Lesson Plan

### Grade Level, Subject and Topic

9th grade geometry. Circle and radius.

### Activities

#### Fill Color

Change the color in the prompt.  You
can specify any one of the [140 named colors](https://www.w3schools.com/tags/ref_colornames.asp).

#### Border Weight

Change the prompt to include a black border of
width 10.

#### Border Color

Change the prompt to make the border purple.

#### Change the Radius

Change the prompt to make the circle smaller
or larger by changing the radius from 10 to 200.

#### Change the Location

Change the prompt to move the circle to the left or right.

