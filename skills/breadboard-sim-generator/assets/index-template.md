---
title: $MICROSIM_TITLE
description: $ONE_SENTENCE_DESCRIPTION
image: /sims/$MICROSIM_NAME/$MICROSIM_NAME.png
og:image: /sims/$MICROSIM_NAME/$MICROSIM_NAME.png
twitter:image: /sims/$MICROSIM_NAME/$MICROSIM_NAME.png
social:
   cards: false
---
# $MICROSIM_TITLE

<iframe src="main.html" height="$IFRAME_HEIGHTpx" scrolling="no"></iframe>

[Run the $MICROSIM_TITLE MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your own website with this `iframe`:

```html
<iframe src="https://$GITHUB_USER.github.io/$REPO_NAME/sims/$MICROSIM_NAME/main.html" height="$IFRAME_HEIGHTpx" scrolling="no"></iframe>
```

## About this MicroSim

$DESCRIPTION_PARAGRAPH

## The Circuit

Trace the current path from the positive rail back to ground:

```linenums="0"
$CURRENT_PATH
```

| Component | Value | Purpose |
|-----------|-------|---------|
| $PART | $VALUE | $PURPOSE |

$WHY_THESE_VALUES

## How to Use It

1. $STEP_ONE
2. $STEP_TWO
3. $STEP_THREE

## What the Animation Shows

The moving dots are current. They travel from the positive rail toward ground
(conventional current), and their **speed is proportional to the actual
current** - so a dimmer LED visibly moves fewer dots. The numbers under the
board and on the scope come from the same circuit solution, so the picture and
the arithmetic always agree.

## Lesson Plan

### Grade Level, Subject and Topic

$GRADE_LEVEL. $SUBJECT. $TOPIC.

### Learning Objective

Students will be able to $BLOOM_VERB $CONCEPT by $INTERACTION.

### Activities

#### Predict, then test

$PREDICT_ACTIVITY

#### Check the arithmetic

Have students compute the expected current with `I = (V − Vf) / R` and compare it
to the readout. Then change the supply voltage and predict the new current before
moving the slider.

#### Break it on purpose

$BREAK_IT_ACTIVITY

### Assessment

$ASSESSMENT_QUESTIONS

## Model Limitations

This simulation solves the circuit in DC steady state. It does not model
transient behavior (charging and discharging), capacitance, inductance, AC,
diode I-V curves, or transistor gain. Component values are ideal - no tolerance,
no temperature effects, no wire resistance.

## References

$REFERENCES
