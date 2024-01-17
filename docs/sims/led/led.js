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

function drawLED(x, y, diameter, color, state) {
  push();
  translate(x, y);
  // calculated by eye
  rotate(2.045);
  
  // Determine brightness based on the state
  let fill_color = state === 1 ? color : 0;
  
  // Draw the LED circle with a flat edge
  stroke(0);
  strokeWeight(2);
  fill(fill_color);
  beginShape();
  // Drawing the circle with vertices
  for (let i = 0; i < 18; i++) {
    let angle = map(i, 0, 20, 0, TWO_PI);
    console.log(angle);
    let x = cos(angle) * diameter / 2;
    let y = sin(angle) * diameter / 2;
    vertex(x, y);
  }
  endShape(CLOSE);
  
  pop();
}
