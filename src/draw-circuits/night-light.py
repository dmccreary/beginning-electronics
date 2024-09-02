import matplotlib.pyplot as plt
import schemdraw
import schemdraw.elements as elm

with schemdraw.Drawing() as d:
    d.config(units='mm', figsize=(100, 100))  # Set figsize for larger drawing area

    # Battery
    d += elm.Battery(label='Battery')  # Battery
    
    # Resistor and LED
    d += elm.Resistor().right().label('220Ω')
    d += elm.LED().right().label('LED')
    
    # NPN Transistor
    d += elm.Line().down().at((2, 0)).length(1)
    d += elm.TransistorNpn().anchor('collector').down()
    
    # Ground
    d += elm.Line().down().at((0, 0)).length(3)
    d += elm.Ground()
    
    # LDR and 1 kΩ Resistor
    d += elm.Line().right().at((1.5, -2.5)).length(2)
    d += elm.ResistorVar().label('LDR')
    d += elm.Resistor().down().label('1kΩ')
    
    # Base resistor
    d += elm.Resistor().down().at((0, -3)).label('1kΩ')
    
    # Wire connections
    d += elm.Line().right().at((0, -3)).length(1)
    d += elm.Line().up().at((0, -4)).length(2)
        # Manually set limits if needed
    d.ax.set_xlim(-100, 100)
    d.ax.set_ylim(-100, 100)

    plt.show()
