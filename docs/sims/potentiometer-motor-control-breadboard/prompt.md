# Prompt

I gave the following prompt to OpenAI ChatGPT GPT-6 Astra Lite:


!!! prompt
    Please use the [$microsim-generator](/Users/dan/Documents/ws/ibook-skills/skills/microsim-generator/SKILL.md) and create a new MicroSim that simulates controlling a motor with a potentiometer and 2N2222 transistor.  The simulation should use the breadboard skill /breadboard-sim-genrator in the skills directory.  

    Make sure to add a flyback diode to protect the transistor.  
    Make sure the MicroSim has a simulation on a breadboard.  

    Use the schema drawing skill [$draw-schemdraw-circuit](/Users/dan/Documents/ws/beginning-electronics/skills/draw-schemdraw-circuit/SKILL.md) to put a circuit diagram in the lesson plan in the index.md

The first version did work, but it used about 26% of my 5-hour window tokens on my $20/month GPT Plus plan.  It also had several errors:

1. It inserted a switch that was not needed
2. It had several green wires on the breadboard with no explanation
