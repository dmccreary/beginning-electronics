# Beginning Electronics Course Description

!!! prompt
    For the course-description.md file in this project, rewrite it in terms of a formal course description using the 2001 Bloom Taxonomy.  Start with foundational terms and definitions and move toward concepts that require students to create their own projects.

I have restructured the course description to align with Bloom's Taxonomy, creating a more comprehensive and pedagogically sound document. The new description:

1.  Clearly outlines learning outcomes at each cognitive level
2.  Maintains the original course's practical, hands-on approach
3.  Organizes content in a progressive manner
4.  Preserves the focus on accessibility and low-cost components
5.  Includes clear scope limitations and pathways to advanced topics

## Course Overview
This introductory electronics course is designed for students with limited mathematical background, emphasizing hands-on learning through low-cost components and interactive simulations (MicroSims). The course structure follows a progressive learning path that builds from fundamental concepts to practical applications.

## Learning Outcomes
By the end of this course, students will be able to:

### Remember and Understand
- Define basic electronic components including resistors, LEDs, buttons, potentiometers, photosensors, motors, transistors, shift registers, and timers
- Explain the function of a solderless breadboard and its role in prototyping
- Describe the basic principles of voltage, current, and power in DC circuits
- Identify the proper use of common testing and measurement tools

### Apply
- Demonstrate proper breadboard wiring techniques
- Implement basic circuit designs using provided components
- Use USB power supplies safely with various electronic components
- Configure basic timing circuits using 555 timers
- Set up shift registers (74565) for basic sequential operations

### Analyze
- Troubleshoot common circuit problems
- Compare different types of sensors and their applications
- Examine the behavior of various electronic components under different conditions
- Investigate the relationship between input and output in basic circuits

### Evaluate
- Test circuit performance using appropriate measurement techniques
- Assess the suitability of different components for specific applications
- Determine the most cost-effective solutions for given project requirements
- Judge the efficiency of different circuit designs

### Create
- Design original circuits using combinations of basic components
- Develop working prototypes using breadboard construction techniques
- Construct functional projects such as night lights, voltage meters, and signal generators
- Build custom sensing and control circuits using various input/output components

## Required Materials
- Solderless breadboard
- 5V USB power supply
- Basic electronic components:
  - Jumper wires
  - LEDs
  - Resistors
  - Push buttons
  - Potentiometers
  - Photosensors
  - DC motors
  - Transistors
  - 74565 shift registers
  - 555 timer ICs

## Course Scope and Limitations
This course focuses on fundamental analog and basic digital electronics. It does not cover:
- Advanced digital logic beyond simple memory cells or flip-flops
- Microcontroller programming and applications
- Complex mathematical analysis of circuits

## Related Courses
Students interested in advancing their knowledge should consider:
- Digital Electronics Course - For advanced digital logic concepts
- Microcontrollers Course - For programming and embedded systems applications

## Teaching Methodology
The course employs a hands-on, practical approach utilizing:
- Interactive simulations (MicroSims)
- Low-cost experimental kits
- Guided project construction
- Progressive skill-building exercises

This approach ensures students develop both theoretical understanding and practical skills in electronics, preparing them for more advanced study or practical applications in their projects.

## Revision (2026): Grade-Banded, No-Soldering, Companion-Course Rewrite

!!! prompt
    I would like to revise this project to be a full high-quality interactive intelligent textbook. The target audience is students from 5th to 12th grade in the US. The course will focus on a no soldering classroom where every student has a solderless breadboard and about $50 worth of electronic parts, but it does not involve any microcontrollers or programming. This course is designed to complement the learning-micropython course. Make the course as fun and engaging as possible. Start by updating the course description to be very detailed and have a slow step-by-step progression of simple to complex topics.

The course description was rewritten (via the `course-description-analyzer` skill) to:

1. Pin the target audience to 5th–12th grade (ages ~10–18) and a $50 solderless-breadboard kit
2. Explicitly exclude microcontrollers and programming of any kind, with a hard boundary pointing to the companion course, [Learning MicroPython and Physical Computing](https://dmccreary.github.io/learning-micropython/)
3. Re-sequence "Main Topics Covered" into a slow, deliberately-ordered, simple-to-complex progression (16 topics: part identification → breadboard basics → power/Ohm's Law → LED circuits → switches → wired AND/OR logic → potentiometers → photoresistors → RGB LEDs → transistors → transistor logic gates → 555 timer → capacitors/RC timing → shift registers → real-world kits → capstone projects)
4. Match the structure and formatting style of the sibling MicroPython course description (Title / Target Audience / Prerequisites / Course Overview / Main Topics Covered / Topics Not Covered / Learning Outcomes by 2001 Bloom's Taxonomy / Why This Course Matters) for consistency across the two companion books
5. Adopt a fun, encouraging tone throughout, written for kids rather than adult professionals

See the resulting quality assessment in [Course Description Assessment](../learning-graph/step-01-course-assessment.md).