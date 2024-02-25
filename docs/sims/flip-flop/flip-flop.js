/*  SR Flip Flop MicroSim
 A Set/Reset flip flop simulator, also called a latch
 uses two NAND gates to create a primitive 1-bit memory
 cell.  It has two buttons, one for setting the output (Q)
 to be positive and a Reset button to change the output
 to be low.
*/
let canvasWidth = 350;
let canvasHeight = 300;
let setButton, resetButton;
let isSet = false;
let leftMargin = 20;
let topMargin = 50;
let wc1 = 110; // wire column 1
let wc2 = 250; // wire column 1
let wr1 = 100; // wire row 1
let wr2 =200; // wire row 2

function setup() {
  const canvas = createCanvas(canvasWidth, 300);
  var mainElement = document.querySelector('main');
  canvas.parent(mainElement);
  textSize(16);
  
  setButton = createButton('Set');
  setButton.position(leftMargin, topMargin+10);
  setButton.mousePressed(() => isSet = true);
  
  resetButton = createButton('Reset');
  resetButton.position(leftMargin, wr2+30);
  resetButton.mousePressed(() => isSet = false);
}

function draw() {
  background(200);
  
  // Draw flip-flop
  fill('black');
  noStroke();
  text('Q', wc2+50, wr1-30);
  text('Q̅', wc2+50, wr2+20);
  
  
  // Cross wires
  stroke('black');
  // little verticles on left
  line(wc1, 90, wc1, 100);
  line(wc1, wr2, wc1, wr2+20);
  
  // little verticles on right
  line(wc2, 80, wc2, 100);
  line(wc2, wr2, wc2, wr2+30); 
  
  // cross
  // down to right
  line(wc1, wr1, wc2, wr2);
  line(wc1, wr2, wc2, wr1);
  
  // Draw NOT gates and connectors
  drawNOTGate(wc1+30, topMargin, 50, 60);
  drawNOTGate(wc1+30, wr2, 50, 60);
  
  strokeWeight(2);
  // set wire
  drawWire(leftMargin+40, topMargin+20, wc1+30, topMargin+20, isSet ? color(0, 255, 0) : color(255, 0, 0));
  drawWire(wc2-20, topMargin+30, wc2+60, topMargin+30, isSet ? color(0, 255, 0) : color(255, 0, 0));
  
  // reset wire
  drawWire(leftMargin+50, wr2+40, wc1+30, wr2+40, isSet ? color(255, 0, 0) : color(0, 255, 0));
  drawWire(wc2-20, wr2+30, wc2+60, wr2+30, isSet ? color(255, 0, 0) : color(0, 255, 0));
  
  drawWire(400, 100, 400, 300, color(255));


}

function drawWire(x1, y1, x2, y2, col) {
  stroke(col);
  strokeWeight(4);
  line(x1, y1, x2, y2);
}

function drawNOTGate(x, y, w, h) {
  lineVertSpacing = h/3;
  fill(0);
  noStroke();
  // big circle
  circle(x+w-5, y+h/2, h);
  // inverse circle
  circle(x+w+30, y+h/2, h/4);
  // 
  rect(x, y, w-10, h);
  stroke(100)
  // input lines
  line(x-28, y+lineVertSpacing, x, y+lineVertSpacing);
  line(x-28, y+lineVertSpacing*2, x, y+lineVertSpacing*2);
  // out line
  line(x+w+30, y+h/2, x+w+60, y+h/2);

} 

// Add this function to change wire colors when buttons are pressed
function mousePressed() {
  if (mouseX > 50 && mouseX < 100 && mouseY > 50 && mouseY < 70) {
    isSet = true;
  } else if (mouseX > 50 && mouseX < 100 && mouseY > 350 && mouseY < 370) {
    isSet = false;
  }
}

