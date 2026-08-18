// Constants for orientation strings
// CANVAS_HEIGHT: 400
const HORIZONTAL = "horizontal";
const VERTICAL = "vertical";

function setup() {
    // Cap the backing store at one device pixel per CSS pixel. At the Retina
    // default a full-width canvas asks the compositor for 4x the pixels every
    // frame, which can stall the compositor on a loaded machine.
    pixelDensity(1);

    const canvas = createCanvas(660, 400);
    var mainElement = document.querySelector('main');
    canvas.parent(mainElement);
    describe('Resistor Symbol Drawing', LABEL)
}

function draw() {
    background('aliceblue');
    // Draw horizontal and vertical resistors with labels and the Ω symbol

    // Horizontal resistor with label on top
    drawResistor(50, 50, 150, 50, 2, 'horizontal', '220 Ω', TOP);

    // Horizontal resistor with label on bottom
    drawResistor(400, 50, 150, 50, 2, 'horizontal', '220 Ω', BOTTOM);

    // Vertical resistor with label on the right
    drawResistor(50, 150, 100, 200, 2, 'vertical', '10K Ω', RIGHT);

    // Vertical resistor with label on the left
    drawResistor(450, 150, 100, 200, 2, 'vertical', '10K Ω', LEFT);
  }

// Label position constants
const TOP = "top";
const BOTTOM = "bottom";
const LEFT = "left";
const RIGHT = "right";

function drawResistor(x, y, rwidth, rheight, lineWidth, orientation, label, labelPosition) {
  // light gray background
  // fill(230)
  // rect(x,y,rwidth,rheight)
  strokeWeight(lineWidth);
  // the percent of the length of the resistor that is taken by each end wire
  endWirePercent = .15
  endWireLength = rwidth * endWirePercent
  // draw end wires
  halfHeight = y+rheight/2
  
  // number of zig-zag peaks
  // The international symbol is 6
  let peaks = 6;
  let peakWidth = (rwidth-2*endWireLength) / peaks;
  let peakHeight = rheight / 3;

  if (orientation === HORIZONTAL) {
    beginShape();
    // left end wire
    line(x, halfHeight,x + endWireLength,halfHeight);
    // right end wire 
    line(x + rwidth-endWireLength, halfHeight,
       x+rwidth,halfHeight);
    vertex(x+endWireLength, halfHeight);
    for(let i = 0; i <= peaks -1; i++) {
      let xPos = x+endWireLength + i * peakWidth + peakWidth/2;
      let yPos = (i % 2 === 0) ? 
          halfHeight - peakHeight : 
          halfHeight + peakHeight;
      vertex(xPos, yPos);
    }
    vertex(x + rwidth-endWireLength , halfHeight);
    endShape();
  } 
  else if (orientation === VERTICAL) {
    halfwidth = x+rwidth/2
    endWireLength = rheight * endWirePercent
    let peakHeight = rwidth / 3;
    let peakWidth = (rheight-2*endWireLength) / peaks;
    beginShape();
      // end wire
      vertex(halfwidth, y);
      vertex(halfwidth, y+endWireLength);
      for(let i = 0; i <= peaks - 1; i++) {
        let yPos = y+endWireLength + i * peakWidth + peakWidth/2;
        let xPos = (i % 2 === 0) ?
          halfwidth - peakHeight : 
          halfwidth + peakHeight;
        vertex(xPos, yPos);
      }
      // end wire
      vertex(halfwidth, y + rheight - endWireLength);
      vertex(halfwidth, y + rheight);
    endShape();
  }

  // Draw label if provided
  if (label) {
    push();
    noStroke();
    fill(0);

    // Scale font size based on resistor dimensions
    let resistorSize = orientation === HORIZONTAL ? rwidth : rheight;
    let fontSize = Math.max(8, Math.min(24, resistorSize * 0.12));
    textSize(fontSize);
    textAlign(CENTER, CENTER);

    let labelX, labelY;
    let centerX = x + rwidth / 2;
    let centerY = y + rheight / 2;
    let padding = fontSize * 1.2;

    if (orientation === HORIZONTAL) {
      if (labelPosition === TOP) {
        labelX = centerX;
        labelY = centerY - peakHeight - padding;
      } else if (labelPosition === BOTTOM) {
        labelX = centerX;
        labelY = centerY + peakHeight + padding;
      } else if (labelPosition === LEFT) {
        labelX = x - padding;
        labelY = centerY;
        textAlign(RIGHT, CENTER);
      } else if (labelPosition === RIGHT) {
        labelX = x + rwidth + padding;
        labelY = centerY;
        textAlign(LEFT, CENTER);
      } else {
        // Default to TOP for horizontal
        labelX = centerX;
        labelY = centerY - peakHeight - padding;
      }
    } else if (orientation === VERTICAL) {
      let vertPeakHeight = rwidth / 3;
      if (labelPosition === TOP) {
        labelX = centerX;
        labelY = y - padding;
        textAlign(CENTER, BOTTOM);
      } else if (labelPosition === BOTTOM) {
        labelX = centerX;
        labelY = y + rheight + padding;
        textAlign(CENTER, TOP);
      } else if (labelPosition === LEFT) {
        labelX = centerX - vertPeakHeight - padding;
        labelY = centerY;
        textAlign(RIGHT, CENTER);
      } else if (labelPosition === RIGHT) {
        labelX = centerX + vertPeakHeight + padding;
        labelY = centerY;
        textAlign(LEFT, CENTER);
      } else {
        // Default to RIGHT for vertical
        labelX = centerX + vertPeakHeight + padding;
        labelY = centerY;
        textAlign(LEFT, CENTER);
      }
    }

    text(label, labelX, labelY);
    pop();
  }
}

