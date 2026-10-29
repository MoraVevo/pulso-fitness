---
name: pulso-product
description: Use when changing Pulso’s purpose, food or training workflows, calculations, stored data, or product copy. Captures the app’s intended experience and its real data boundaries.
---

# Pulso product direction

Pulso is a Spanish language daily journal for food, exercise, and weight. Help people build a steady picture of their habits through small, approachable entries. The product should feel supportive and practical: describe what was recorded and what the numbers mean, without moralizing food, promising body outcomes, or presenting estimates as diagnoses.

## Product shape

- Pulso is a dependency free, responsive browser app. Its interface and business logic live in `dist/`; GitHub Pages publishes that folder. Keep links relative so the app still works from the repository subpath.
- Personal profiles, food entries, workouts, and weigh ins are stored in the browser’s `localStorage`. There are no accounts, cross device sync, or application server. Backup import and export use validated JSON. Never describe browser storage as cloud storage.
- The day starts empty. Profile setup estimates an editable starting calorie and macro target. Demo content is an explicit way to explore the app; don’t confuse it with a user’s record.
- Food logging uses grams and editable portions. The included food data comes from the USDA SR28 selection. Preserve its provenance and the distinction between reference nutrition data and user entered food.
- Exercise entries include working sets, load, reps, RIR, completion, and editable primary and secondary muscle roles. Count completed sets in each assigned role separately. A set may participate in more than one muscle’s total; don’t describe indirect sets as equivalent stimulus.
- Muscle groups expand into anatomical detail defined in `dist/muscle-regions.js`. Optional `muscleRegions` stores per-exercise overrides. A set counts once per group even when several of its muscles participate; never sum the regional rows to reconstruct a group total. Old catalog records recover defaults by ID within their assigned groups, while unknown details stay unspecified. Keep these classifications editable and avoid fatigue or overtraining claims from set totals alone.
- Each set can show its load in kg or lb; keep the stored load in kg so volume and older records remain comparable. New exercises get a conservative exercise-specific starting load, then use the mean completed load for that exercise from the 14 days ending on the selected journal date. Present a starting load as a suggestion, not a prescription.
- New exercise sets leave reps and RIR blank. Choosing reps records the set, so do not add a separate completion check. An empty RIR stays visibly unrecorded but contributes 0 RIR (failure) to the training average.
- Confirming reps on a new set in an unfinished session starts the rest clock. Optional set `recordedAt` and state `restTimer` preserve the start instant across reloads; derive elapsed time from the device clock, not interval ticks. Corrections must not reset it. Clear recorded instants when copying sets/routines/sessions, and stop the active clock on session completion or source removal. The mobile dock sits above bottom navigation and links back to its source set. No background alarm is promised.
- Exercise volume is load multiplied by reps for completed sets. For bodyweight movements, the value reflects added load, so a bodyweight set can count even at 0 kg added.
- Training views offer a rolling seven day window ending on the selected journal date and a calendar week. Exclude future records. Missing entries mean “not recorded,” not zero consumption or zero activity.
- Cardio has its own duration/activity records in optional state `cardio`; it never creates strength sets. All saved active kcal add to that date's food target, as explicitly chosen by the user: base + cardio. Keep intake, configured macros, and the base plan balance separate. Explain that a maintenance activity factor may already include cardio; do not silently adjust the base. Editing, moving, or deleting cardio must update the affected daily targets.
- Cardio estimates use published 2024 Adult Compendium MET/code pairs and `(MET - 1) * kg * minutes / 60`, rounded once, for active energy above rest. Offer estimates only with a profile aged 19–59; manual active kcal remain available. Preserve stable variant IDs/MET values, the confirmed weight and saved kcal; later weigh-ins must not recalculate history. Suggest the latest weigh-in on or before the activity date, falling back to profile weight, never goal weight. Preserve old backups with no cardio field and validate new records. Cite the Compendium and retain pregnancy/lactation limits.
- Weight trends use recorded weigh ins and a seven day moving average. Explain gaps as missing records; do not infer them.
- Video analysis (squat, lateral view) processes an uploaded video entirely in the browser with the vendored MediaPipe pose model in `dist/vendor/`; the file is never uploaded or stored, and only compact metrics persist in optional state `videoAnalyses` (validated like `cardio`, old backups without the field stay valid). Rep counts, ROM, phase times, bar path and speed are registration estimates derived from detected body position, not technique grades, load detection, or diagnosis. Velocity in cm/s borrows the profile height as scale and falls back to relative units; suggest lateral camera placement and honest visibility reporting instead of promising accuracy. Registering a detected set must reuse normal set semantics (`recordSetReps`: done, recordedAt, rest timer).

## Estimates and claims

The initial energy estimate uses Mifflin–St Jeor and an activity factor; the initial macros are a configurable split. These are editable starting estimates, not measured expenditure or clinical advice. Keep the existing age and pregnancy/lactation caveats in relevant goal setup or explanatory copy. Do not extend an estimate to populations the current product says it does not cover.

Before changing a calculation or persisted shape, inspect its current implementation in `dist/core.js`, `dist/app.js`, and `dist/exercises.js`, plus the relevant tests. Preserve existing record IDs and import compatibility when the feature depends on old records. Document a changed product limitation in `README.md` when it affects users.

## Language

Use plain, warm Spanish that makes the next action clear. Keep labels short, explain technical measures at the point of use, and let the user adjust goals and muscle assignments. Favor neutral language such as “registrado”, “objetivo” and “tendencia”. Avoid shame, diagnosis, guaranteed results, and treating an incomplete day as failure.
