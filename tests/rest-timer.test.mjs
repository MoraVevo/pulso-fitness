import test from "node:test";
import assert from "node:assert/strict";
import { recordSetReps, currentRestTimer, elapsedTimeLabel, pendingSet, routinePlan, validState } from "../dist/core.js";

const start = Date.parse("2026-10-22T16:00:00Z");
function fixture() {
  return {
    version: 1, goals: { name: "Prueba", kcal: 2200, maintenance: 2500, protein: 150, carbs: 250, fat: 65, weight: 72, sessions: 4, mode: "maintain" },
    entries: [], weights: [], customFoods: [], favorites: [],
    sessions: [{ id: "session-1", date: "2026-10-22", name: "Empuje", finished: false, notes: "", feeling: 3,
      exercises: [{ exerciseId: "bench", name: "Press de banca", muscle: "Pecho",
        sets: Array.from({ length: 3 }, () => ({ kg: 20, reps: "", rir: 2, done: false })) }],
    }],
  };
}

test("la primera confirmación de reps inicia el descanso y la siguiente serie lo reinicia", () => {
  const state = fixture();
  assert.equal(recordSetReps(state, "session-1", 0, 0, 10, start), true);
  assert.equal(state.sessions[0].exercises[0].sets[0].recordedAt, start);
  assert.equal(currentRestTimer(state, start + 20000).elapsedMs, 20000);
  assert.equal(recordSetReps(state, "session-1", 0, 1, 8, start + 140000), true);
  const timer = currentRestTimer(state, start + 145000);
  assert.equal(timer.elapsedMs, 5000);
  assert.equal(timer.setIndex, 1);
});

test("corregir reps, carga o RIR de una serie hecha conserva el inicio", () => {
  const state = fixture();
  recordSetReps(state, "session-1", 0, 0, 10, start);
  assert.equal(recordSetReps(state, "session-1", 0, 0, 12, start + 10000), false);
  const set = state.sessions[0].exercises[0].sets[0];
  set.kg = 30;
  set.rir = 1;
  assert.equal(currentRestTimer(state, start + 20000).startedAt, start);
  // Even clearing and restoring a previously recorded set is a correction.
  recordSetReps(state, "session-1", 0, 0, null, start + 21000);
  assert.equal(currentRestTimer(state), null);
  assert.equal(recordSetReps(state, "session-1", 0, 0, 10, start + 22000), false);
  assert.equal(state.restTimer, null);
  assert.equal(set.recordedAt, start);
});

test("editar una serie antigua o una sesión finalizada no inventa un cronómetro", () => {
  const state = fixture();
  state.sessions[0].exercises[0].sets[0] = { kg: 20, reps: 10, rir: 2, done: true };
  assert.equal(recordSetReps(state, "session-1", 0, 0, 11, start), false);
  assert.equal(state.restTimer, undefined);
  state.sessions[0].finished = true;
  assert.equal(recordSetReps(state, "session-1", 0, 1, 10, start), false);
  assert.equal(state.restTimer, undefined);
});

test("recuperar JSON después de salir calcula el tiempo desde el instante guardado", () => {
  const state = fixture();
  recordSetReps(state, "session-1", 0, 0, 10, start);
  const restored = JSON.parse(JSON.stringify(state));
  assert.equal(validState(restored), true);
  assert.equal(elapsedTimeLabel(currentRestTimer(restored, start + 140000).elapsedMs), "02:20");
  assert.equal(elapsedTimeLabel(currentRestTimer(restored, start + 3661000).elapsedMs), "1:01:01");
  assert.equal(elapsedTimeLabel(currentRestTimer(restored, start - 1000).elapsedMs), "00:00");
});

test("terminar la sesión o eliminar la serie o su ejercicio deja el cronómetro inactivo", () => {
  for (const remove of [
    (state) => { state.sessions[0].finished = true; },
    (state) => { state.sessions[0].exercises[0].sets.splice(0, 1); },
    (state) => { state.sessions[0].exercises.splice(0, 1); },
    (state) => { state.sessions.splice(0, 1); },
  ]) {
    const state = fixture();
    recordSetReps(state, "session-1", 0, 0, 10, start);
    remove(state);
    assert.equal(currentRestTimer(state), null);
  }
});

test("el origen se conserva aunque se borre una serie anterior y cambien los índices", () => {
  const state = fixture();
  recordSetReps(state, "session-1", 0, 1, 10, start);
  state.sessions[0].exercises[0].sets.splice(0, 1);
  assert.equal(currentRestTimer(state, start + 60000).setIndex, 0);
  assert.equal(currentRestTimer(state, start + 60000).elapsedMs, 60000);
});

test("añadir series y reutilizar rutinas no hereda la hora de la sesión de origen", () => {
  const state = fixture();
  recordSetReps(state, "session-1", 0, 0, 10, start);
  const source = state.sessions[0].exercises[0].sets[0];
  const next = pendingSet(source);
  assert.equal(next.recordedAt, undefined);
  assert.equal(next.done, false);
  assert.equal(next.reps, 10);
  const copied = routinePlan(state.sessions[0].exercises);
  assert.ok(copied[0].sets.every((set) => !set.done && set.recordedAt === undefined));
  assert.equal(source.recordedAt, start);
  state.sessions.push({ ...state.sessions[0], id: "session-2", exercises: copied });
  assert.equal(recordSetReps(state, "session-2", 0, 0, 10, start + 60000), true);
  assert.equal(currentRestTimer(state, start + 61000).sessionId, "session-2");
});

test("detener se conserva al recargar y solo una serie nueva vuelve a iniciarlo", () => {
  const state = fixture();
  recordSetReps(state, "session-1", 0, 0, 10, start);
  state.restTimer = null;
  const restored = JSON.parse(JSON.stringify(state));
  recordSetReps(restored, "session-1", 0, 0, 12, start + 60000);
  assert.equal(currentRestTimer(restored), null);
  recordSetReps(restored, "session-1", 0, 1, 10, start + 61000);
  assert.equal(currentRestTimer(restored, start + 62000).elapsedMs, 1000);
});

test("las copias antiguas son válidas y las horas malformadas se rechazan", () => {
  const state = fixture();
  assert.equal(validState(state), true);
  recordSetReps(state, "session-1", 0, 0, 10, start);
  for (const invalid of [-1, 0, NaN, Infinity, "2026-10-22", start + .5, 8640000000000001]) {
    const copy = structuredClone(state);
    copy.restTimer.startedAt = invalid;
    assert.equal(validState(copy), false);
    copy.restTimer.startedAt = start;
    copy.sessions[0].exercises[0].sets[0].recordedAt = invalid;
    assert.equal(validState(copy), false);
  }
  assert.equal(currentRestTimer(undefined), null);
  assert.equal(currentRestTimer({ sessions: [], restTimer: { sessionId: "missing", startedAt: start } }), null);
});

test("reps inválidas y cancelaciones sin valor no inician un descanso", () => {
  for (const value of [null, 0, 201, 1.5, NaN, "10"]) {
    const state = fixture();
    assert.equal(recordSetReps(state, "session-1", 0, 0, value, start), false);
    assert.equal(currentRestTimer(state), null);
  }
});
