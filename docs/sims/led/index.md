# Draw LEDs

<figure markdown>
   ![Image Name](./led-top-view-test.png){ width="400" }
   <figcaption>Draw LED top view test.</figcaption>
</figure>

[Run LED Top View Test MicroSim](./led.html) { .md-button .md-button--primary }
[Edit the MicroSim](https://editor.p5js.org/dmccreary/sketches/McnocOgc3)

We will simulate the top view of an LED by drawing
a circle with a flat edge on the negative (cathode) side.

The flat edge on a 5mm LED typically indicates the cathode side. In general, LEDs are polarized components with an anode (+) and a cathode (-). The cathode is usually marked with a flat edge on the side of the LED housing. Additionally, the cathode leg is often shorter than the anode leg. This design helps in identifying the polarity for the correct connection in a circuit.

Our first version will simulate the LED with just two states - on and off.  Later
we will simulate the brightness of each LED with a current.

```js
// draw the top view of an LED using a circle with the
// cathode as a flat edge on the bottom

// test grid dimensions
let number_leds = 7;
let diameter = 50;
let row_height = 60;
let col_width = diameter + 10;
let canvasWidth = col_width * (number_leds + 1);
let canvasHeight = row_height * 3;

function setup() {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  var mainElement = document.querySelector('main');
  canvas.parent(mainElement);
  textSize(16);
  background(220);
  
  // Example usage of drawLED function
  // drawLED(200, 200, 435, 'red', 1);

  drawLED(col_width, row_height, 50, 'red', 1);
  drawLED(col_width*2, row_height, 50, 'orange', 1);
  drawLED(col_width*3, row_height, 50, 'yellow', 1);
  drawLED(col_width*4, row_height, 50, 'green', 1);
  drawLED(col_width*5, row_height, 50, 'blue', 1);
  drawLED(col_width*6, row_height, 50, 'indigo', 1);
  drawLED(col_width*7, row_height, 50, 'violet', 1);
  drawLED(col_width, row_height*2, 50, 'red', 0);
  
  text("on", 5, row_height)
  text("off", 5, row_height*2)
}

// Draw the top view of a round LED with a flat edge for the cathode on the bottom
function drawLED(x, y, diameter, color, state) {
  push();
  translate(x, y);
  // calculated by eye to make the flat edge on the bottom
  rotate(2.045);
  
  // Determine brightness based on the state
  let fill_color = state === 1 ? color : 0;
  
  // Draw the LED circle with a flat edge
  stroke(0);
  strokeWeight(2);
  fill(fill_color);
  beginShape();
  // Drawing the circle with 18 vertices
  for (let i = 0; i < 18; i++) {
    let angle = map(i, 0, 20, 0, TWO_PI);
    let x = cos(angle) * diameter / 2;
    let y = sin(angle) * diameter / 2;
    vertex(x, y);
  }
  endShape(CLOSE);
  
  pop();
}
```