import matplotlib.pyplot as plt

# Create a figure and axis
fig, ax = plt.subplots()

# Draw a simple battery and ground connection
ax.plot([0, 1], [0, -1], label='Battery')  # Simplified line to represent battery
ax.plot([1, 1], [-1, -2], label='Ground')  # Simplified line to represent ground

# Add an LED (represented as a diode with an arrow)
ax.plot([1, 2], [0, 0], 'k-', lw=2)  # Line representing the LED
ax.arrow(1.5, 0, 0.1, 0.1, head_width=0.1, head_length=0.1, fc='k', ec='k')  # Arrow for LED

# Add a resistor (represented as a zigzag line)
ax.plot([2, 3], [0, 0], 'k--', lw=2)  # Line representing the resistor
ax.text(2.5, 0.1, '220Ω', ha='center')

# Add a transistor (simplified as a line)
ax.plot([3, 3], [0, -1], 'k-', lw=2)
ax.text(3, -0.5, 'Transistor', ha='left')

# Set limits to ensure everything fits
ax.set_xlim(-1, 4)
ax.set_ylim(-3, 1)

# Add labels and titles
ax.text(0.5, -0.5, 'Battery', ha='center')
ax.text(1, -1.5, 'Ground', ha='center')
ax.text(1.5, 0.1, 'LED', ha='center')
ax.text(2.5, 0.1, 'Resistor', ha='center')

# Show the plot
plt.show()
