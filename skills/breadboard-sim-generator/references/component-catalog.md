# Component Catalog

Every component `breadboard-lib.js` can place on the board: its parameters, how
it behaves electrically, how it is drawn, and the mistakes each one invites.

All components take a single options object and return the part, so you can hold
a reference and drive it from a control:

```javascript
const rv = bbPotentiometer({a: 'a5', b: 'a9', maxOhms: 10000, label: 'RV1'});
// in draw():  rv.setting = potSlider.value();
```

Every component also accepts `label` - a short designator like `'R1'`, `'D2'`,
`'SW1'`. Labels are how `bbCurrent()` and `bbPart()` find a part, so **give a
label to anything you want to measure or control**.

---

## Contents

| Component | Function | Section |
|-----------|----------|---------|
| Battery / supply | `bbBattery` | [Battery](#battery) |
| Jumper wire | `bbWire` | [Wire](#wire) |
| Resistor | `bbResistor` | [Resistor](#resistor) |
| LED | `bbLED` | [LED](#led) |
| Push button | `bbButton` | [Push button](#push-button) |
| Slide switch | `bbSwitch` | [Slide switch](#slide-switch) |
| Capacitor | `bbCapacitor` | [Capacitor](#capacitor) |
| Diode | `bbDiode` | [Diode](#diode) |
| Potentiometer | `bbPotentiometer` | [Potentiometer](#potentiometer) |
| Buzzer | `bbBuzzer` | [Buzzer](#buzzer) |
| NPN transistor | `bbTransistor` | [NPN transistor](#npn-transistor) |

---

## Battery

```javascript
bbBattery({pos: 'T+1', neg: 'T-1', volts: 5, label: 'BAT'});
```

| Option | Default | Meaning |
|--------|---------|---------|
| `pos` | required | address of the positive terminal, normally a `+` rail |
| `neg` | required | address of the negative terminal - this net becomes 0 V |
| `volts` | `9` | supply voltage |
| `on` | `true` | set `false` to de-energize; everything falls to 0 V |

**Electrically** the battery is not a branch. It pins two nets to fixed voltages,
which is what makes the rest of the solve possible. Without one, every net sits
at 0 V and nothing conducts.

**Drawn** as a labelled pack in the strip `bbLayout()` reserves to the left of
the board, with a red lead into `pos` and a black lead into `neg`.

**Gotcha:** the top and bottom rails are separate nets. A supply on the top rails
does not energize the bottom rails - add `bbWire({a: 'T-2', b: 'B-2'})`. Making
the student see that jumper is a feature, not overhead.

**Driving it from a slider:** `bbPart('BAT').volts = voltsSlider.value();` in
`draw()`, before `bbSolve()`.

---

## Wire

```javascript
bbWire({a: 'T+3', b: 'a3', color: 'red'});
bbWire({a: 'j8', b: 'B-8', color: 'black', arc: 0.6});
```

| Option | Default | Meaning |
|--------|---------|---------|
| `a`, `b` | required | the two holes it connects |
| `color` | `'green'` | insulation color |
| `arc` | `0` | how far the wire bows away from the straight path, in pitch units |

**Electrically** a near-zero resistance always-conducting branch.

**Drawn** with animated dots whose speed follows the current through it. Wires
are drawn before component bodies, so a wire crossing a part passes behind it.

**Color convention worth keeping:** red for connections to `+`, black for
connections to ground, other colors for signals. Students carry this habit to
real benches, and it makes a screenshot readable at a glance.

**Use `arc`** only when a straight run would hide something. A small bow (0.4 to
0.8) reads as a wire lifted over other parts.

---

## Resistor

```javascript
bbResistor({a: 'j3', b: 'j6', ohms: 220, label: 'R1'});
```

| Option | Default | Meaning |
|--------|---------|---------|
| `a`, `b` | required | the two holes |
| `ohms` | `220` | resistance |
| `label` | `''` | designator |
| `showValue` | `true` | print `R1 220Ω` above the body |

**Electrically** a plain resistance, always conducting.

**Drawn** as a tan body with three color bands computed from the value, plus
bent leads. The bands are real: 220 Ω renders red-red-brown, which students can
decode against a resistor color chart.

**Gotcha:** both pins in the same net short it out and it silently does nothing.
`a5`→`c5` is a short; `a5`→`a9` is a resistor.

---

## LED

```javascript
bbLED({anode: 'g6', cathode: 'g8', color: 'red', label: 'D1'});
```

| Option | Default | Meaning |
|--------|---------|---------|
| `anode` | required | the **positive** leg (long leg on a real LED) |
| `cathode` | required | the negative leg, flat side |
| `color` | `'red'` | `red`, `yellow`, `orange`, `green`, `blue`, `white` |
| `vf` | by color | forward voltage; override for an unusual part |
| `label` | `''` | designator |

Default forward voltages: red 1.9 V, orange 2.0 V, yellow 2.1 V, green 2.2 V,
blue 3.1 V, white 3.2 V. These differ on purpose - a blue LED needs a higher
supply than a red one, and a sim that uses the real numbers lets a student
discover that instead of being told.

**Electrically** a one-way branch with a forward drop and a small series
resistance. Reverse biased, it does not conduct, and the sim goes dark - which
is the correct answer to "what if I put it in backwards?"

**Drawn** as a round body with a flat on the cathode side. Brightness tracks
current and saturates around 20 mA, so a half-current LED is visibly dimmer, not
just on or off.

**Gotcha:** always put a current-limiting resistor in series. Without one the
solver will report an enormous current, which is physically what happens.

---

## Push button

```javascript
bbButton({a: 'e3', b: 'f3', color: 'red', label: 'SW1', key: '1'});
```

| Option | Default | Meaning |
|--------|---------|---------|
| `a`, `b` | required | the two holes; **straddle the channel** (`e`_n_ → `f`_n_) |
| `color` | `'red'` | cap color |
| `key` | `null` | keyboard key that also presses it |
| `label` | `''` | designator |

**Electrically** open until pressed, then a near-zero resistance. `part.pressed`
is the state.

**Drawn** as a square body with a round cap, sized like a real 6 mm tactile
switch, straddling the center channel. Pressed, the cap darkens, shrinks, and
gains a highlight ring - still identifiable by color.

**Interaction** needs all four handlers wired up (`mousePressed`,
`mouseReleased`, `keyPressed`, `keyReleased`), or the button will latch on and
never release.

**Why straddle the channel:** rows `e`_n_ and `f`_n_ are different nets, so the
button makes a real connection between two halves. Both pins in the same half
would be a short across one net and the button would appear to do nothing.

---

## Slide switch

```javascript
bbSwitch({a: 'a5', b: 'a9', label: 'S1', key: 's', closed: false});
```

| Option | Default | Meaning |
|--------|---------|---------|
| `a`, `b` | required | the two holes |
| `closed` | `false` | initial state |
| `key` | `null` | keyboard key that toggles it |

**Electrically** identical to a button, but latching: a click toggles
`part.closed` and it stays there.

Use a switch when the lesson is about a *state* the learner sets and then
observes ("with the branch enabled, what happens to total current?"), and a
button when the lesson is about a momentary *action*.

---

## Capacitor

```javascript
bbCapacitor({a: 'a5', b: 'a9', uf: 10, label: 'C1'});
```

**Electrically an open circuit.** This is deliberate: the solver works in DC
steady state, and at DC a capacitor blocks current. Placing one in series with an
LED and watching the LED stay dark is the clearest demonstration of that fact a
beginner will get.

**Do not** use this component to teach charge/discharge timing - the library has
no transient model. For an RC curve, plot a computed exponential on the scope and
say plainly that the capacitor's dynamics are being modelled by the sim, not by
the solver.

---

## Diode

```javascript
bbDiode({anode: 'a5', cathode: 'a9', label: 'D1'});
```

| Option | Default | Meaning |
|--------|---------|---------|
| `anode`, `cathode` | required | polarity |
| `vf` | `0.7` | forward voltage |

**Electrically** one-way, like an LED but with no light. Use it for polarity
protection lessons and "why does current only go one way" demonstrations.

**Drawn** as a black body with a silver band at the cathode - the marking on a
real 1N4148 or 1N4001.

---

## Potentiometer

```javascript
const rv = bbPotentiometer({a: 'a5', b: 'a9', maxOhms: 10000, setting: 0.5, label: 'RV1'});
```

| Option | Default | Meaning |
|--------|---------|---------|
| `maxOhms` | `10000` | resistance at `setting` = 1 |
| `setting` | `0.5` | 0 … 1, drive this from a slider |

**Electrically** a resistor whose value is `maxOhms × setting`, wired as a
two-terminal variable resistor (a rheostat) rather than a three-terminal divider.

**Drawn** as a square body with a pointer showing the wiper angle, and its
current resistance printed above it. Pairing the pointer with the live number is
what connects "I turned the knob" to "the resistance changed to 4.7 kΩ."

Wire `rv.setting = slider.value()` in `draw()` before `bbSolve()`.

---

## Buzzer

```javascript
bbBuzzer({a: 'g6', b: 'g8', label: 'BZ1'});
```

**Electrically** a 300 Ω resistance, always conducting.

**Drawn** as a black cylinder with a vent hole; when current flows it emits
animated arcs. It makes an audible-output circuit legible in a still screenshot,
which matters because the sim has no sound.

---

## NPN transistor

```javascript
bbTransistor({collector: 'a5', base: 'a7', emitter: 'a9', label: 'Q1'});
```

| Option | Meaning |
|--------|---------|
| `collector`, `base`, `emitter` | three holes; **each pin needs its own net**, so use three different columns |

**Electrically** two branches: a base-emitter junction that behaves like a diode,
and a collector-emitter path that closes once the base sits more than 0.65 V
above the emitter. The multi-pass solver discovers the on/off state on its own,
so a base resistor and a load resistor behave the way a student expects.

This is the classic "a small current controls a large one" demonstration. Put a
button in the base leg and an LED in the collector leg, then show that the base
current is a fraction of the collector current using two scope traces.

**Gotcha:** a transistor is not a general-purpose amplifier here - it is modelled
as a switch with a saturation drop, not with a beta curve. Say so in the sim's
`limitations` metadata if the lesson gets near amplification.

---

## Choosing components for a lesson

| Concept | Minimum parts |
|---------|---------------|
| Complete circuit / open circuit | battery, wire, button, resistor, LED |
| Ohm's law | battery (slider), resistor (slider), LED, scope |
| Series vs parallel | battery, two LEDs, two resistors, switch |
| Polarity | battery, resistor, LED, diode |
| Voltage divider | battery, two resistors, voltage readout at the midpoint |
| Switching a load | battery, button, transistor, two resistors, LED or buzzer |
| Why caps block DC | battery, capacitor, resistor, LED |

Keep to one concept per sim. A board with fourteen parts on it teaches nothing;
a board with five parts and one slider teaches one thing well.
