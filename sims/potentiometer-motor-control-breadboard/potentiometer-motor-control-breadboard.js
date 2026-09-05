// Potentiometer Motor Control Breadboard
// CANVAS_HEIGHT: 700
// Apply: adjust base drive, compare motor speed and demonstrate flyback.
// Analytic analog model replaces the library's digital transistor solver.
// RV1 is a THREE-terminal divider, not the library's two-terminal rheostat.
// Assumed motor: R=30 ohms, L=50 mH, E=3*s V; load I=.020+.040*s A.
// No inertia/startup model: speed is a steady-state estimate; flyback uses
// frozen back EMF during its short electrical transient, slowed 1000x.
let containerWidth, canvasWidth = 800;
let drawHeight = 610, controlHeight = 90;
let canvasHeight = drawHeight + controlHeight, containerHeight = canvasHeight;
let margin = 16, sliderLeftMargin = 170;
let startButton, resetButton, scopeCheckbox, potSlider;
let isRunning = false, spin = 0, previousDriven = true, flyback = null;
let model = {ib: 0, im: 0, vm: 0, vc: 5, speed: 0, power: 0, id: 0, vw: 0};
const SUPPLY = 5, POT = 10000, RB = 1000, BETA = 80, RM = 30, LM = .05;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  pixelDensity(1);
  startButton = createButton('Start');
  startButton.mousePressed(() => { isRunning = !isRunning; startButton.html(isRunning ? 'Pause' : 'Start'); });
  resetButton = createButton('Reset');
  resetButton.mousePressed(resetSimulation);
  scopeCheckbox = createCheckbox(' Show scope', false);
  potSlider = createSlider(0, 100, 45, 1);
  potSlider.attribute('aria-label', 'Potentiometer position, percent');
  for (const control of [startButton, resetButton, scopeCheckbox, potSlider]) control.parent(document.querySelector('main'));
  placeControls();
  bbLayout(margin, 66, 600, 350, 20);
  bbReset();
  // Netlist (each endpoint uses a separate physical hole):
  // RV1 has exactly three external connections:
  // T+2 -> a2 -> RV1 high(d2); RV1 low(e6) -> B-5; RV1 wiper(e4) -> F8.
  // F8 shares the lower-strip net with R1 j8, so the base path is F8 -> R1
  // j8/j11 -> Q1 B(h11). The three pot terminals are +5 V, ground, and wiper.
  // T+14 -> a14 -> M1 c14/c17 -> e17 -> f17 -> f10 -> Q1 C(h10).
  // Q1 E(h12) -> j12 -> B-13. D1 a17(anode) to b14(cathode).
  // B14 shares M1's +5 V node through column 14, so one red motor-power
  // jumper serves both M1 and D1; the diode band remains toward +5 V.
  bbBattery({pos:'T+1', neg:'B-1', volts:SUPPLY, label:'5 V'});
  bbWire({a:'T+2', b:'a2', color:'red', label:'potSupply'});
  addDivider();
  bbWire({a:'e6', b:'B-5', color:'black', label:'potGround'});
  bbWire({a:'e4', b:'f8', color:'green', label:'centerTap'});
  bbResistor({a:'j8', b:'j11', ohms:RB, label:'R1'});
  bbTransistor({collector:'h10', base:'h11', emitter:'h12', label:'Q1'});
  bbWire({a:'j12', b:'B-13', color:'black', label:'emitter'});
  bbWire({a:'T+14', b:'a14', color:'red', label:'motorSupply'});
  addMotor();
  bbWire({a:'e17', b:'f17', color:'orange', label:'collectorBridge'});
  bbWire({a:'g17', b:'f10', color:'orange', label:'collector'});
  bbDiode({anode:'a17', cathode:'b14', label:'D1'});
  bbAddTrace({label:'Motor I', get:()=>model.im*1000, color:'crimson', max:80, unit:'mA'});
  bbAddTrace({label:'Collector V', get:()=>model.vc, color:'royalblue', max:8, unit:'V'});
  const errors = bbCheckLayout();
  if (errors.length) throw new Error(errors.join('\n'));
  describe('A 5 volt breadboard motor driver with a three-terminal potentiometer, 1 kiloohm resistor R1, 2N2222 transistor Q1 and flyback diode D1. Adjust the slider. Lower the potentiometer to zero to inspect flyback protection. Start animates current and the motor; Show scope plots current and collector voltage. Numerical values are model estimates.', LABEL);
}

function addDivider() {
  bbAddPart({type:'divider', label:'RV1', pins:['d2','e4','e6'].map(bbPin),
    render() {
      const p=BB.pitch, [high,wiper,low]=this.pins;
      // The trim-pot body occupies rows A–D: four labelled rows, three hole
      // pitches high. Its W and ground pins leave below the body in row E.
      const x=wiper.x, top=bbRowY('a'), bottom=bbRowY('d');
      const y=(top+bottom)/2, bodyX=high.x-p*.35;
      const bodyW=low.x-high.x+p*.7, bodyH=bottom-top;
      stroke('#667'); strokeWeight(2);
      // Pin leads meet the body at row D. The high pin is already at D2;
      // W and ground rise from E4/E6 to the bottom of the square housing.
      for (const pin of this.pins) line(pin.x,pin.y,pin.x,bottom);
      fill('#2563a6'); rect(bodyX,top,bodyW,bodyH,p*.25);
      fill('#eee'); circle(x,y,p*1.3);
      const angle=(-.75+1.5*potSlider.value()/100)*PI;
      stroke('#172e46'); line(x,y,x+sin(angle)*p*.5,y-cos(angle)*p*.5);
      noStroke(); fill('#172e46'); textAlign(CENTER,BOTTOM); textSize(max(11,p*.55));
      text('RV1 10 kΩ',x,top-p*.25);
      textAlign(CENTER,TOP); textSize(max(10,p*.5));
      ['+','W','−'].forEach((s,i)=>text(s,this.pins[i].x,this.pins[i].y+p*.25));
    }});
}
function addMotor() {
  bbAddPart({type:'motor', label:'M1', pins:['c14','c17'].map(bbPin),
    render() {
      const [a,b]=this.pins,p=BB.pitch,x=(a.x+b.x)/2,y=bbRowY('d');
      stroke('#667'); strokeWeight(2); line(a.x,a.y,a.x,y); line(b.x,b.y,b.x,y); line(a.x,y,b.x,y);
      fill('#798896'); rect(x-p*1.15,y-p*.95,p*2.3,p*1.9,5);
      push(); translate(x,y); rotate(spin); noStroke(); fill('#edf5fa');
      for(let i=0;i<3;i++){rotate(TWO_PI/3); ellipse(0,-p*.35,p*.38,p*.85);} pop();
      noStroke(); fill('#172e46'); textAlign(CENTER,TOP); textSize(max(11,p*.55)); text('M1',x,y+p*1.05);
    }});
}

// Loaded voltage divider: Vth=5*a, Rth=10k*a*(1-a).
// Ib=max(0,(Vth-.7)/(Rth+1k)); max Ib=4.3mA at a=1.
// Ic is load-limited; beta*Ib is not a current forced through the motor.
function steadyState(a) {
  const vth=SUPPLY*a, rth=POT*a*(1-a);
  const ib=Math.max(0,(vth-.7)/(RB+rth));
  const available=BETA*ib;
  const speed=Math.max(0,Math.min(1,(available-.020)/.040));
  const im=Math.min(available,.020+.040*speed);
  const vm=RM*im+3*speed;
  return {ib, im, vm, vc:SUPPLY-vm, speed, id:0,
    power:(SUPPLY-vm)*im+.7*ib, vw:vth-ib*rth};
}
function updateModel(dt) {
  const a=potSlider.value()/100;
  const driven=steadyState(a).ib>1e-9; // Base drive above cutoff.
  if(previousDriven && !driven && model.im>0) flyback={i0:model.im, emf:3*model.speed, speed:model.speed, t:0};
  if(driven) flyback=null;
  model=steadyState(a);
  if(flyback) {
    // L di/dt = -(R*i + E + .7); motor current retains its direction.
    if(isRunning) flyback.t+=dt/1000;
    const offset=(flyback.emf+.7)/RM;
    const i=Math.max(0,(flyback.i0+offset)*Math.exp(-RM*flyback.t/LM)-offset);
    if(i>1e-7) Object.assign(model,{im:i,id:i,vm:-.7,vc:5.7,speed:flyback.speed,power:0});
    else flyback=null;
  }
  previousDriven=driven;
  // Publish the same calculated currents to the board animation and meters.
  // The library's switch-only bbSolve() is intentionally not used.
  bbNets={TP:5,BN:0};
  for(const part of bbParts){part.current=0;part.conducting=false;}
  const set=(names,current)=>names.forEach(name=>{const p=bbPart(name);p.current=current;p.conducting=Math.abs(current)>1e-7;});
  const lower=a===0 ? SUPPLY/POT : model.vw/(POT*a);
  const upper=lower+model.ib;
  set(['potSupply'],upper); set(['potGround'],lower);
  set(['centerTap','R1'],model.ib);
  set(['M1'],model.im); set(['Q1','collectorBridge','collector'],driven?model.im:0);
  set(['emitter'],driven?model.im+model.ib:0);
  // During flyback, current returns through D1 into the motor's positive net.
  set(['D1'],model.id);
  set(['motorSupply'],model.im); set(['5 V'],upper+(driven?model.im:0));
  bbPart('Q1').baseOn=model.ib>0;
  const net=(refs,v)=>refs.forEach(ref=>bbNets[bbPin(ref).net]=v);
  net(['a2','a14','b14'],5); net(['e6','h12'],0);
  net(['e4','f8','j8'],model.vw);
  net(['h11'],model.ib>0?.7:model.vw); net(['a17','f17','f10','h10'],model.vc);
  if(isRunning){bbTime+=dt;spin+=model.speed*dt*12;bbSampleTraces();}
}
function draw() {
  updateCanvasSize();
  background('aliceblue'); stroke('silver'); fill('white'); rect(0,drawHeight,canvasWidth,controlHeight);
  noStroke(); fill('#172e46'); textAlign(CENTER,TOP); textSize(canvasWidth<500?20:25);
  text('Potentiometer Motor Control',canvasWidth/2,10);
  textSize(13); text('5 V • 2N2222 • protected by a flyback diode',canvasWidth/2,41);
  const scope=scopeCheckbox.checked()&&canvasWidth>=900;
  const boardW=scope?(canvasWidth-3*margin)*.64:canvasWidth-2*margin;
  bbLayout(margin,70,boardW,360,20);
  updateModel(Math.min(deltaTime/1000,.05));
  // Keep the solved values visible while paused, but reserve the red markers
  // for active playback so a paused circuit is a clean wiring diagram.
  BB.showCurrentDots=isRunning;
  bbDrawBoard(); bbDrawParts();
  // Electrical terminal labels; lead arrangement is illustrative, not a package pinout.
  noStroke(); fill('#172e46'); textSize(Math.max(10, BB.pitch*.5)); textAlign(CENTER,TOP);
  [['C',10],['B',11],['E',12]].forEach(([label,col])=>text(label,bbColX(col),bbRowY('h')+2));
  if(scope)bbDrawScope(boardW+2*margin,76,canvasWidth-boardW-3*margin,348,'Motor and collector');
  noStroke(); fill('#172e46'); textAlign(LEFT,TOP); textSize(canvasWidth<500?13:15);
  const y=445, col=canvasWidth/2;
  text('Base: '+(model.ib*1000).toFixed(2)+' mA',margin,y);
  text('Motor: '+(model.im*1000).toFixed(1)+' mA',col,y);
  text('Motor voltage: '+model.vm.toFixed(2)+' V',margin,y+25);
  text('Speed estimate: '+Math.round(model.speed*100)+'%',col,y+25);
  text('Q1 power: '+(model.power*1000).toFixed(1)+' mW',margin,y+50);
  text('Collector: '+model.vc.toFixed(2)+' V',col,y+50);
  fill(model.id>0?'#a64408':'#164f3b'); textSize(13);
  const status=model.id>0?'Flyback: D1 carries '+(model.id*1000).toFixed(1)+' mA. 1000× slow motion.'
    :model.ib>0?'D1 blocks during normal drive. Band → +5 V.':'Q1 is off. Flyback current has decayed.';
  text(status,margin,y+78,canvasWidth-2*margin,40);
  fill('#334155'); text('Lower the pot to 0% to inspect flyback protection.',margin,558);
  text('Model estimates; mechanical coast-down is omitted.',margin,580);
  if(scopeCheckbox.checked()&&!scope){textAlign(RIGHT,TOP);textSize(11);text('Scope needs 900 px',canvasWidth-12,drawHeight+69);}
  noStroke();fill('#172e46');textAlign(LEFT,CENTER);textSize(14);
  text('Pot position: '+potSlider.value()+'%',12,drawHeight+53);
  cursor(bbHovering()?HAND:ARROW);
}
function resetSimulation(){isRunning=false;startButton.html('Start');potSlider.value(45);previousDriven=true;flyback=null;spin=0;bbTime=0;bbClearTraces();}
function mousePressed(){bbMousePressed();}
function mouseReleased(){bbReleaseAll();}
function keyPressed(){if(!['INPUT','BUTTON'].includes(document.activeElement.tagName))bbKeyPressed();}
function keyReleased(){bbKeyReleased();}
function placeControls(){startButton.position(12,drawHeight+8);resetButton.position(85,drawHeight+8);scopeCheckbox.position(160,drawHeight+9);potSlider.position(sliderLeftMargin,drawHeight+44);potSlider.size(Math.max(70,canvasWidth-sliderLeftMargin-20));}
function windowResized(){updateCanvasSize();resizeCanvas(containerWidth,containerHeight);placeControls();}
function updateCanvasSize(){containerWidth=Math.floor(document.querySelector('main').getBoundingClientRect().width);canvasWidth=containerWidth;}
