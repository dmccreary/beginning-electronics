// find the nearest resistor to a given resistence

let slider;
let resistorValue;

function setup() {
  const canvas = createCanvas(800, 150);
  var mainElement = document.querySelector('main');
  canvas.parent(mainElement);
  textSize(16);
  
  // Create a slider from 10 ohms to 1M ohms, logarithmic scale
  slider = createSlider(1, 6, 2.38, 0.01); // Logarithmic scale: 10^1 to 10^6
  slider.position(10, 60);
  slider.style('width', '780px');
}

function draw() {
  background(220);

  // Convert the logarithmic slider value to actual resistance
  let actualValue = pow(10, slider.value());

  resistorValue = findClosestStandardResistor(actualValue);

  // Display the selected and closest standard resistor values
  fill(0);

  text("Selected Resistance: " + round(actualValue) + " Ω", 10, 30);
  text("Closest Standard Resistor: " + round(resistorValue) + " Ω", 10, 50);
  
  drawResistor(resistorValue, 10, 100, 200, 40, "h")
}

function findClosestStandardResistor(inputOhms) {
  const e12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];

  let standardValues = [];
  for (let factor = 0.1; factor <= 1000000; factor *= 10) {
    e12.forEach(value => {
      standardValues.push(value * factor);
    });
  }

  let closest = standardValues[0];
  let minDiff = Math.abs(inputOhms - closest);

  for (let i = 1; i < standardValues.length; i++) {
    let diff = Math.abs(inputOhms - standardValues[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = standardValues[i];
    }
  }

  return closest;
}


function drawResistor(resistance, x, y, w, h, orientation) {
  // console.log(resistance);
  resistance = round(resistance);
  // console.log(resistance);
  // Color coding for the resistor bands
  const colors = {
    '0': 'black', // black
    '1': 'brown', // brown
    '2': 'red', // red
    '3': 'orange',
    '4': 'yellow',
    '5': 'green',
    '6': 'blue',
    '7': 'purple',
    '8': 'gray',
    '9': 'white'
  };

  // Calculate the color bands from the resistance value
  let digits = ("" + resistance).split('').map(Number);
  let firstBand = colors[digits[0].toString()];
  let secondBand = colors[digits[1].toString()];
  // Calculate the multiplier based on the number of zeros after the first two digits
  let numberOfZeros = str(digits).length - 2;
  let multiplier = colors[numberOfZeros];

  // Draw the resistor body based on orientation
  fill('tan'); // brown color for the body
  rect(x, y, w, h);
  
  if (orientation === 'h') {
    drawBandsHorizontal(x, y, w, h, firstBand, secondBand, multiplier);
    xt = x+w/3; // x for text
    yt = y - 5;
  } else if (orientation === 'v') {
    drawBandsVertical(x, y, w, h, firstBand, secondBand, multiplier);
    xt = x - 40; // x for text
    yt = y + h/2;
  }
  
  fill(0);
  addPeriod = '';
  thirdSymbol = '';
  if (numberOfZeros == 1) {thirdSymbol = "0"};
  if (numberOfZeros == 2) {addPeriod = "."; thirdSymbol = "K";};
  if (numberOfZeros == 3) {thirdSymbol = "K"};
  if (numberOfZeros == 4) {thirdSymbol = "0K"};
  if (numberOfZeros == 5) {thirdSymbol = "M"};
  text(str(digits[0]) + addPeriod + str(digits[1]) + thirdSymbol + " Ω", xt, yt);
}

// last three must be colors
function drawBandsHorizontal(x, y, w, h, firstBand, secondBand, multiplier) {
  let bandWidth = w / 10;
  fill(firstBand);
  rect(x + 2 * bandWidth, y, bandWidth, h);
  fill(secondBand);
  rect(x + 4 * bandWidth, y, bandWidth, h);
  fill(multiplier);
  rect(x + 6 * bandWidth, y, bandWidth, h);
}

function drawBandsVertical(x, y, w, h, firstBand, secondBand, multiplier) {
  let bandHeight = h / 10;
  fill(firstBand);
  rect(x, y + 2 * bandHeight, w, bandHeight);
  fill(secondBand);
  rect(x, y + 4 * bandHeight, w, bandHeight);
  fill(multiplier);
  rect(x, y + 6 * bandHeight, w, bandHeight);
}