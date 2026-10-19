import test from "node:test";
import assert from "node:assert/strict";
import { exercises } from "../dist/exercises.js";
import {
  exerciseMovement,
  exerciseSvg,
  movementGroups,
} from "../dist/exercise-visuals.js";
import { routinePlan, sessionVolume } from "../dist/core.js";

test("el catálogo completo tiene patrón explícito y una ilustración de movimiento", () => {
  const illustrations = new Set();
  for (const ex of exercises) {
    const movement = exerciseMovement(ex),
      svg = exerciseSvg(ex);
    assert.ok(movementGroups.some((g) => g.id === movement.group));
    assert.ok(!movementGroups.some((g) => g.name === movement.label), ex.id);
    assert.match(svg, /^<svg/);
    assert.ok(!svg.includes("undefined"), ex.id);
    assert.ok(!svg.includes("<script"));
    illustrations.add(movement.pattern);
  }
  assert.equal(illustrations.size, 34);
  for (const [id, group] of [
    ["bench", "push"],
    ["pushup", "push"],
    ["row", "pull"],
    ["facepull", "pull"],
    ["squat", "legs"],
    ["deadlift", "legs"],
    ["crunch", "core"],
  ]) {
    assert.equal(exerciseMovement({ exerciseId: id }).group, group);
  }
});

test("los personalizados recuperan su grupo de movimiento y generan un SVG", () => {
  assert.equal(exerciseMovement({ muscle: "Espalda" }).group, "pull");
  assert.equal(exerciseMovement({ muscle: "Cuádriceps" }).group, "legs");
  assert.equal(
    exerciseMovement({ muscle: "Pecho", movement: "core" }).group,
    "core",
  );
  assert.match(exerciseSvg({ muscle: "Core" }), /data-illustration="crunch"/);
});

test("usar una rutina reinicia series completadas sin alterar objetivos ni registros de origen", () => {
  const source = [
    {
      exerciseId: "bench",
      name: "Press",
      muscle: "Pecho",
      primaryMuscles: ["Pecho"],
      sets: [
        { kg: 60, reps: 10, rir: 2, done: true },
        { kg: 65, reps: 8, rir: 0, done: true },
      ],
    },
  ];
  const plan = routinePlan(source);
  assert.deepEqual(plan[0].sets, [
    { kg: 60, reps: 10, rir: 2, done: false },
    { kg: 65, reps: 8, rir: 0, done: false },
  ]);
  assert.equal(sessionVolume({ exercises: plan }), 0);
  plan[0].sets[0].done = true;
  plan[0].sets[0].kg = 100;
  plan[0].primaryMuscles.push("Tríceps");
  assert.equal(source[0].sets[0].kg, 60);
  assert.deepEqual(source[0].primaryMuscles, ["Pecho"]);
  assert.equal(source[0].sets[0].done, true);
  assert.equal(routinePlan([{ ...source[0], sets: [] }])[0].sets.length, 1);
});
