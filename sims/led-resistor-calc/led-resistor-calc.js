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