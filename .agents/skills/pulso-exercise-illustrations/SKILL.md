---
name: pulso-exercise-illustrations
description: Use when creating, repairing, or reviewing Pulso’s exercise SVGs or exercise movement families. Keep each illustration readable, anatomically legible, and consistent across the exercise picker and training views.
---

# Pulso exercise illustrations

The SVGs explain the movement at small card size. A viewer should be able to recognize the body position, equipment, contact points, and direction of effort without reading implementation details.

## Files and flow

- Exercise IDs, names, equipment, and muscle roles are in `dist/exercises.js`.
- Movement family assignment and `exerciseSvg()` are in `dist/exercise-visuals.js`.
- Detailed Pulso exercise figures and reusable drawing helpers are in `dist/pull-illustrations.js`. Other movement families still use the local poses in `exercise-visuals.js`.
- The same `exerciseSvg()` appears in the exercise picker, routines, and training sessions. Review at the compact card size as well as a large preview.

## Drawing criteria

- Draw original SVG with the existing viewBox, palette, and reusable helpers. Keep rendering self contained: no image files, external fonts, scripts, filters, or hidden dependencies.
- Build the person from filled, tapered limb shapes and a shaped torso. Preserve distinct shoulders, torso, hips, bent joints, head, clothing, hands, and feet. Thin stick lines alone do not meet the Pulso visual direction.
- Choose the view that best explains the exercise. Use a side view when it clarifies hinge depth, a supported chest, a preacher pad, the angle of a pull, or a handle facing the viewer. Use a front or three quarter view when it makes bilateral movement or the machine layout easier to recognize.
- Keep equipment and hands in one coherent perspective. Draw weights and bars as a side view or an end on disk where appropriate; do not mix a frontal full width bar with a profile body unless its orientation is clear.
- Make support and grip explicit: chest against the pad, hand on the dumbbell or handle, forearm on the thigh or pad, cable terminating at the held object. A cable, bar, or handle must visibly meet the hand that pulls it.
- Distinguish exercise variants through their real equipment, grip, support, or body position. Don’t reuse an image where that hides an important difference.
- Show the working posture and a restrained movement arrow. Keep arrows outside the silhouette where possible; avoid labels or extra motion marks that crowd a small thumbnail.
- Match the actual catalog movement. Don’t depict a custom exercise name or machine unless the catalog actually defines that movement; unknown custom records should continue using the existing safe family fallback.

## Review

Render the affected catalog exercises together. Check that body, support, machine, and grip do not overlap confusingly, then inspect the result at the size used in a picker or routine. Keep the generated string free of `undefined`, `NaN`, and dynamic user controlled SVG markup. Preserve the `exerciseSvg()` contract so routines and saved sessions continue to render their exercise by ID.
