# Variable Power Supply

![](./variable-power-supply.jpg){ width="400" }
[$7 LM317 Adjustable DC Voltage Regulator DIY Kit](https://www.ebay.com/itm/355199915646)

![](./voltage-regulator.png){ width="400" }
[$17 LM317 Adjustable DC Voltage Regulator DIY Kit With Transformer and Enclosure](https://www.ebay.com/itm/275242338730)

We can build a variable DC Power Supply for under $10 from a kit using the popular [LM317](https://en.wikipedia.org/wiki/LM317) adjustable positive linear voltage regulator.  The LM317 is a simple 3-terminal adjustable regulator circuit
that is low-cost and flexible.  It only needs a few capacitors and a resistor
to work.  The kit we used can use any old transformer (both AC and DC) you have lying around the house.
In this example, I used a very old 20-volt AC transformer from an old appliance that
was no longer working.

We can see from the [LM317 data sheet](https://www.ti.com/lit/ds/symlink/lm317.pdf) that with a single potentiometer, we can change any DC voltage
into any other lower DC voltage.

There are many LM317 kits on eBay:

[eBay Search for LM317 Adjustable Voltage Regulator Kit](https://www.ebay.com/sch/i.html?_nkw=LM317+Adjustable+Voltage+Regulator+Kit)

Here is a [Sample Regulated Power Supply from XYZ Electronics](https://www.ebay.com/itm/355199915646) that sells for under $4 with $3 shipping.  For a classroom, you can order many of these for teaching basic soldering skills.

Many kits have a power cord and a potentiometer you can adjust to get
any output voltage from 1.25V to 30V DC.

The LM317 has overheating and current short-circuit protection.

Many of these kits also have a 3-digit LED display of output voltage.

## Assembly Suggestions

The kit listing on eBay is very minimal.  So here is some additional information.

Here are some [photos of this assembly process](https://photos.app.goo.gl/6AGQD1yKx1BAAuVP9).

Here are a few notes on assembly.

1. Be careful to note the polarity on both the diodes and capacitors.
2. The smallest parts are the screws on the LED offset.  If you put them in first, they are a little bit easier to manage.  You may need needle-nose pliers to position them.
3. Note that the band on the capacitors is usually the negative side.  Some of them indicate this with a small negative side in the band.
4. Note the capacitance rating on the printed circuit boards.  Make sure to match them up correctly.  The larger capacitor is easy, but the two smaller ones have the same diameter, but different heights.
5. You can trim some of the extra wire off the LED display.  In the photos, I kept the original wire length but then I had to wrap the wires around the back of the kit.
6. The board has places for an LED power indicator and the resistor, but since the LED display is used, they are not included.
7. The kit does not include [Thermal Heatsink Paste](https://www.ebay.com/sch/i.html?_from=R40&_nkw=thermal+paste+heatsink&_sacat=0&rt=nc&_odkw=heat+sink+thermal+paste+for+electronics&_osacat=0&LH_BIN=1).  You can purchase this on eBay for a few dollars.  You can spread this on the back of the LM317 before you screw it into the heatsink.  This step is optional since the screw will provide a strong heat coupling.

## Creating an Enclosure or Stand

![](bottom-view.png)

The kit does not come with an enclosure.  I had some old pieces of plexiglass in my shop so I just screwed it to a square with some 10mm long M3 screws.  However, you can build a full enclosure for your own projects.  I also added a few rubber feet to the bottom of my kit.  In retrospect, I should have made the base 1/4 larger so I could put the feet directly in the corners.  The screws got in my way on this kit.


