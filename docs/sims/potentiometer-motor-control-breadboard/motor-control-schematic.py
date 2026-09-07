#!/usr/bin/env python3
"""Render the potentiometer-controlled motor circuit for the MicroSim lesson.

Prompt:
    Draw a 5 V DC motor controller with RV1, a three-terminal 10 kΩ
    potentiometer across +5 V and ground. Its wiper feeds
    R1, a 1 kΩ base-current limiting resistor, in series into Q1, a 2N2222
    NPN transistor. Q1 is a low-side driver: emitter to ground, collector
    to the negative terminal of M1, a small DC motor; M1 positive goes
    to +5 V. D1, a 1N4001 flyback diode, is directly across M1 with its
    cathode (band) at +5 V and anode at the collector. Show a vertical
    5 V source at left, potentiometer input to the left of Q1 with its label left of the symbol, motor and
    diode to the right, top supply and bottom ground wires, junction dots,
    and clearly separated labels. Orient Q1 base left, collector up,
    emitter down. Create SVG and PNG from this program and insert the
    verified diagram in the MicroSim index.md lesson plan.

Topology: VCC=V1+,RV1.high,M1+,D1.K; GND=V1-,RV1.low,Q1.E;
RV1.W -> R1 -> Q1.B; COL=Q1.C,M1-,D1.A.
Assumptions: 5 V supply, 10 kΩ pot, 1 kΩ resistor and small illustrative
motor. There is no base switch. Package pinout
must be checked separately; this is an electrical schematic.
"""
from __future__ import annotations
import argparse
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import schemdraw
import schemdraw.elements as elm
schemdraw.use('matplotlib')

def build_drawing():
    d=schemdraw.Drawing(show=False)
    d.config(unit=3,fontsize=12,lw=1.8)
    def wire(a,b):
        d.add(elm.Line().at(a).to(b))
    source=d.add(elm.SourceV().up().at((-3,-3)).to((-3,6)).label('V1\n5 V',loc='left'))
    pot=d.add(elm.Potentiometer().down().at((0,2)).to((0,-2)).label('RV1\n10 kΩ',loc='top'))
    wire((0,6),pot.start); wire(pot.end,(0,-3))
    q=d.add(elm.BjtNpn(circle=True).right().at((7,0)).label('Q1\n2N2222',loc='right'))
    assert q.base[0]<q.center[0] and q.collector[1]>q.center[1] and q.emitter[1]<q.center[1]
    resistor=d.add(elm.Resistor().right().at(pot.tap).tox(q.base).label('R1  1 kΩ',loc='top'))
    assert abs(resistor.end[1]-q.base[1])<1e-8
    wire(q.emitter,(q.emitter[0],-3))
    wire(q.collector,(q.collector[0],2)); wire((q.collector[0],2),(11,2))
    motor=d.add(elm.Motor().down().at((11,6)).to((11,2)).label('M1\nDC motor',loc='top'))
    diode=d.add(elm.Diode().up().at((15,2)).to((15,6)).label('D1  1N4001',loc='bottom'))
    wire((11,2),diode.start)
    wire(source.end,diode.end);wire(source.start,(q.emitter[0],-3))
    d.add(elm.Ground().at((0,-3)))
    for pt in [(0,6),(11,6),(11,2),(0,-3)]:d.add(elm.Dot().at(pt))
    d.add(elm.Label('+5 V').at((6,6.45)))
    d.add(elm.Label('K • band to +5 V',fontsize=10).at((16.2,5.5)))
    d.add(elm.Label('A • collector',fontsize=10).at((16.2,2.4)))
    return d

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output',type=Path)
    args=parser.parse_args()
    if args.output.suffix.lower() not in {'.svg','.png'}:parser.error('output must be .svg or .png')
    args.output.parent.mkdir(parents=True,exist_ok=True)
    build_drawing().save(args.output,transparent=args.output.suffix.lower()=='.svg',dpi=180)
if __name__=='__main__':main()
