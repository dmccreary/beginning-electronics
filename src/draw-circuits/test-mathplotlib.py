import matplotlib.pyplot as plt

# Create a figure and axis
fig, ax = plt.subplots()

# Draw a simple circuit manually
ax.plot([0, 1], [0, -1], label='Battery')  # Simplified line to represent battery
ax.plot([1, 1], [-1, -2], label='Ground')  # Simplified line to represent ground

# Set labels
ax.text(0.5, -0.5, 'Battery', ha='center')
ax.text(1, -1.5, 'Ground', ha='center')

# Set limits dynamically based on the data
ax.set_xlim(-1, 2)
ax.set_ylim(-3, 1)

# Show the plot
plt.show()
