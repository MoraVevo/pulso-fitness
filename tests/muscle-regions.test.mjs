import test from "node:test";
import assert from "node:assert/strict";
import { exercises, exerciseMuscles, muscleNames } from "../dist/exercises.js";
import { exerciseRegions, muscleRegions, validMuscleRegions } from "../dist/muscle-regions.js";
import { trainingStats, routinePlan, validState } from "../dist/core.js";

const session = (id, count, extra = {}, date = "2026-10-22") => ({
  id: `test-${id}`, date, name: "Prueba", finished: true, notes: "", feeling: 3,
  exercises: [{ exerciseId: id, name: exercises.find((ex) => ex.id === id)?.name || id,
    muscle: "Deltoides", sets: Array.from({ length: count }, () => ({ kg: 10, reps: 10, rir: 2, done: true })), ...extra }],
});

test("20 participaciones de hombro distinguen las seis series directas y cada porción", () => {
  const stats = trainingStats([session("bench", 10), session("row", 4), session("lateral", 3), session("reverse-pec-deck", 3)], "2026-10-22");
  const row = stats.muscleBreakdown.Deltoides;
  assert.equal(stats.sets, 20);
  assert.equal(row.total, 20);
  assert.equal(row.direct, 6);
  assert.equal(row.indirect, 14);
  assert.equal(row.regions["delt-front"].indirect, 10);
  assert.equal(row.regions["delt-side"].direct, 3);
  assert.equal(row.regions["delt-rear"].direct, 3);
  assert.equal(row.regions["delt-rear"].indirect, 4);
  assert.equal(row.unspecified.total, 0);
});

test("varios músculos y roles dentro de un grupo no duplican el grupo ni la sesión", () => {
  const stats = trainingStats([session("row", 4), session("ohp", 2)], "2026-10-22");
  const back = stats.muscleBreakdown.Espalda;
  assert.equal(stats.sets, 6);
  assert.equal(back.direct, 4);
  assert.equal(back.total, 4);
  assert.equal(back.regions.lats.direct, 4);
  assert.equal(back.regions.rhomboids.direct, 4);
  assert.equal(back.regions.erectors.indirect, 4);
  assert.equal(stats.muscleBreakdown.Deltoides.regions["delt-side"].indirect, 2);
  assert.equal(stats.muscleBreakdown.Deltoides.regions["delt-front"].direct, 2);
});

test("el detalle respeta ambos periodos, las series pendientes y el límite de fecha", () => {
  const pending = session("lateral", 2);
  pending.exercises[0].sets[1].done = false;
  const records = [pending, session("lateral", 3, {}, "2026-10-15"), session("lateral", 4, {}, "2026-10-16"), session("lateral", 9, {}, "2026-10-23")];
  assert.equal(trainingStats(records, "2026-10-22").muscleBreakdown.Deltoides.regions["delt-side"].direct, 5);
  assert.equal(trainingStats(records, "2026-10-22", "week").muscleBreakdown.Deltoides.regions["delt-side"].direct, 1);
});

test("los ajustes guardados prevalecen y los grupos eliminados no reaparecen", () => {
  const custom = { Deltoides: { direct: ["delt-rear"], indirect: ["delt-side"] } };
  const record = session("bench", 3, { primaryMuscles: ["Deltoides"], secondaryMuscles: [], muscleRegions: custom });
  const stats = trainingStats([record], "2026-10-22");
  assert.equal(stats.muscleBreakdown.Pecho, undefined);
  assert.equal(stats.muscleBreakdown.Deltoides.regions["delt-rear"].direct, 3);
  assert.equal(stats.muscleBreakdown.Deltoides.regions["delt-front"], undefined);
  const plan = routinePlan(record.exercises);
  assert.deepEqual(plan[0].muscleRegions, custom);
  assert.ok(plan[0].sets.every((set) => !set.done));
  plan[0].muscleRegions.Deltoides.direct.push("delt-front");
  assert.deepEqual(record.exercises[0].muscleRegions, custom);
});

test("los personalizados y asignaciones vacías conservan el volumen sin inventar detalle", () => {
  for (const record of [session("custom-lateral", 3), session("bench", 3, {
    primaryMuscles: ["Deltoides"], secondaryMuscles: [], muscleRegions: { Deltoides: { direct: [], indirect: [] } },
  })]) {
    const row = trainingStats([record], "2026-10-22").muscleBreakdown.Deltoides;
    assert.equal(row.total, 3);
    assert.equal(row.unspecified.direct, 3);
    assert.deepEqual(Object.keys(row.regions), []);
  }
  assert.deepEqual(exerciseRegions({ exerciseId: "constructor", muscle: "Deltoides" }), { Deltoides: { direct: [], indirect: [] } });
});

test("los roles históricos editados prevalecen sobre el catálogo al recuperar detalle", () => {
  const details = exerciseRegions({ exerciseId: "bench", primaryMuscles: ["Tríceps"], secondaryMuscles: ["Hombros"] });
  assert.deepEqual(details.Deltoides, { direct: [], indirect: ["delt-front"] });
  assert.equal(details.Pecho, undefined);
  assert.ok(details.Tríceps.direct.length > 0);
});

test("los nombres libres de registros antiguos se mantienen sin resolver propiedades heredadas", () => {
  for (const muscle of ["Zona personalizada", "constructor", "__proto__"]) {
    const result = trainingStats([session("custom", 2, { muscle })], "2026-10-22");
    assert.equal(result.muscleBreakdown[muscle].total, 2);
    assert.equal(result.muscleBreakdown[muscle].unspecified.total, 2);
  }
});

test("todos los grupos y ejercicios del catálogo tienen asignaciones válidas", () => {
  assert.deepEqual(Object.keys(muscleRegions), muscleNames);
  for (const exercise of exercises) {
    const roles = exerciseMuscles(exercise);
    const groups = [...roles.primary, ...roles.secondary];
    const details = exerciseRegions(exercise);
    assert.ok(validMuscleRegions(details, groups), exercise.id);
    for (const group of groups) assert.ok(details[group].direct.length + details[group].indirect.length, `${exercise.id}: ${group}`);
  }
});

test("copias antiguas y nuevas se importan, y se rechazan regiones inválidas o ajenas al grupo", () => {
  const state = { version: 1, goals: { name: "Prueba", kcal: 2200, maintenance: 2500, protein: 150, carbs: 250, fat: 65, weight: 72, sessions: 4, mode: "maintain" }, entries: [], weights: [], sessions: [session("lateral", 3)], customFoods: [], favorites: [] };
  assert.equal(validState(state), true);
  const exercise = state.sessions[0].exercises[0];
  exercise.muscleRegions = exerciseRegions(exercise);
  assert.equal(validState(JSON.parse(JSON.stringify(state))), true);
  for (const invalid of [null, [], { Inexistente: { direct: [], indirect: [] } }, { Deltoides: { direct: ["lats"], indirect: [] } }, { Deltoides: { direct: ["delt-side"], indirect: ["delt-side"] } }, { Deltoides: { direct: ["delt-side", "delt-side"], indirect: [] } }, JSON.parse('{"__proto__":{"direct":[],"indirect":[]}}')]) {
    exercise.muscleRegions = invalid;
    assert.equal(validState(state), false, JSON.stringify(invalid));
  }
});
