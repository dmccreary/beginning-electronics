# Draw LEDs

```js
// 5mm LED top view
function drawLED(x, y, w, h, color, state) {
  // wire
  stroke('black');
  strokeWeight(5);
  line(x, y, x+w, y+h);
  // LED
  if (state)
     fill(color);
  else fill('black');
  strokeWeight(1);
  circle(x+(w/2), y+(h/2),20);
}
```