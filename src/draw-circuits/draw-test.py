import matplotlib.pyplot as plt
import schemdraw
import schemdraw.elements as elm

with schemdraw.Drawing() as d:
    d.config(units='mm', figsize=(100, 100))  # Set figsize for larger drawing area
    
    # Simple test: Draw just the battery and ground
    d += elm.Battery(label='Battery')
    d += elm.Line().down().length(2)
    d += elm.Ground()

    plt.show()