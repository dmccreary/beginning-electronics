# Esaki Flasher

**Lesson Plan: Building an LED Flasher Circuit with a 2N2222 Transistor**

## Objective

Students will learn how to build a simple LED flasher circuit using a 2N2222 NPN transistor, a capacitor, and a breadboard. This project will introduce them to basic electronic components, circuit design, and the concept of timing using capacitors.

This lesson is designed for a 7th-grade student with experience using a breadboard.

## Materials Needed

-   1 x 2N2222 NPN transistor
-   1 x LED (any color)
-   1 x Capacitor (10 µF, 25V or similar)
-   1 x Resistor (470Ω or 1kΩ for the LED)
-   1 x Resistor (10kΩ) - transistor bias
-   1 x 1/2 size-breadboard
-   Jumper wires
-   5V power supply (connected to breadboard power rails)
-   Ground connection (connected to breadboard ground rail)

## Lesson Durations

1. **Introduction:** 10 minutes
2. **Step-by-Step Circuit Construction:** 20 minutes
3. **Testing and Troubleshooting:** 10 minutes
4. **Discussion and Conclusion:** 10 minutes

## **Step-by-Step Instructions**
This circuit is known as esaki oscillator.
When capacitor charges and reaches to certain voltage breakdown occurs in Emitter collector juction of transistor and current starts flowing from capacitor to transistor and LED.
components:

* 2N2222 transistor
* 330 ohm resistor
* 4.7 ohm resistor
* 220uF capacitor
* LED
### Step 1: Introduction to the Components

1. **2N2222 Transistor:** Explain that the 2N2222 is an NPN transistor that acts as a switch. It will control the LED by turning it on and off.
2. **Capacitor:** Introduce the concept of a capacitor as a device that stores and releases energy, which will be used to create the blinking effect.
3. **Resistors:** Discuss the role of resistors in limiting current to protect components like the LED and to control the charging rate of the capacitor.
4. **Breadboard:** Briefly explain how the breadboard works, focusing on the connection of rows and power rails.

### Step 2 Circuit Diagram

Here is the ASCII art representation of the circuit:

```
  +5V ----+------------------------------------------------+
          |                                                |
         (R1)                                              |
        10kΩ                                               |
          |                                                |
         (C1)                                              |
        10µF                                               |
          |                                                |
          +---------+                                      |
          |         |                                      |
         (R2)       |                                      |
        470Ω        |                                      |
          |         |                                      |
          |        (B)                                     |
          |        2N2222                                  |
          |       (C)                                       |
          +---|>----|                                      |
              (E)   |                                      |
                |   |                                      |
               GND  |                                      |
                    |                                      |
                   (LED)                                   |
                    |                                      |
                   GND -----------------------------------+
`

```

#### **3\. Building the Circuit on the Breadboard**

##### **Step 1: Insert the 2N2222 Transistor**

-   Place the 2N2222 transistor on the breadboard with its flat side facing you.
-   Identify the three pins: **Collector (C)**, **Base (B)**, and **Emitter (E)**.

##### **Step 2: Connect the Resistors**

-   **Resistor R1 (10kΩ):**
    -   Connect one end of R1 to the **5V power rail** on the breadboard.
    -   Connect the other end of R1 to the **Base (B)** pin of the transistor.
-   **Resistor R2 (470Ω):**
    -   Connect one end of R2 to the **Collector (C)** pin of the transistor.
    -   Connect the other end of R2 to the anode (longer leg) of the LED.

##### **Step 3: Insert the Capacitor**

-   **Capacitor C1 (10 µF):**
    -   Connect the positive leg (longer leg) of the capacitor to the **Base (B)** pin of the transistor.
    -   Connect the negative leg (shorter leg) of the capacitor to the **Ground rail** on the breadboard.

##### **Step 4: Connect the LED**

-   Connect the cathode (shorter leg) of the LED to the **Ground rail** on the breadboard.

##### **Step 5: Complete the Circuit**

-   Connect the **Emitter (E)** pin of the transistor directly to the **Ground rail** on the breadboard.

##### **Step 6: Power Up**

-   Ensure the 5V and Ground from your power supply are connected to the breadboard's power and ground rails, respectively.
-   Once everything is connected, turn on the power supply.

#### **4\. Testing the Circuit**

-   When the circuit is powered, the LED should begin to blink on and off. The speed of the blinking is determined by the value of the capacitor (C1). If the LED doesn't blink:
    -   **Check connections:** Ensure all components are connected as per the diagram.
    -   **Verify component orientation:** Make sure the LED, capacitor, and transistor are oriented correctly.
    -   **Inspect power:** Confirm the power supply is properly connected to the breadboard rails.

#### **5\. Discussion and Conclusion**

-   **How It Works:** Discuss how the capacitor charges and discharges, controlling the transistor's base voltage. When the base voltage reaches a certain level, the transistor switches on, allowing current to flow through the LED, causing it to light up. As the capacitor discharges, the transistor turns off, and the LED goes out.
-   **Adjustments:** Encourage students to try using capacitors of different values to see how it affects the blinking rate.
-   **Real-World Applications:** Explain how similar circuits are used in real-world devices, like blinking indicators in cars or electronics.

* * * *

### **Conclusion:**

This lesson teaches students the basic principles of how a transistor can be used as a switch to control an LED. Through hands-on construction, they learn about circuit design, the function of capacitors in timing, and the importance of properly connecting electronic components on a breadboard.