import test from "node:test";
import assert from "node:assert/strict";
import { cardioActivities, cardioActivity, estimateCardioKcal, cardioWeightForDate, cardioTotals, dailyEnergy } from "../dist/cardio.js";
import { validState, trainingDays, mealTotals, trainingStats } from "../dist/core.js";

const date = "2026-10-22";
const walk = { id: "walk-1", date, activityId: "walk-moderate", minutes: 30, source: "estimate", weightKg: 70, kcal: 98 };
const manual = { id: "manual-1", date, activityId: "other", minutes: 20, source: "manual", weightKg: null, kcal: 150, notes: "Reloj" };
function fixture() {
  return { version: 1, goals: { name: "Prueba", kcal: 2200, maintenance: 2500, protein: 150, carbs: 250, fat: 65, weight: 60, sessions: 4, mode: "lose" },
    profile: { age: 30, height: 170, weight: 75, sex: "female", activity: "moderate", mode: "lose" },
    entries: [{ id: "food-1", date, meal: "Desayuno", grams: 200, food: { id: "food", name: "Ejemplo", kcal: 100, protein: 10, carbs: 10, fat: 2 } }],
    weights: [{ date: "2026-10-20", kg: 70 }, { date: "2026-10-23", kg: 80 }], sessions: [], customFoods: [], favorites: [] };
}

test("las estimaciones cuentan energía activa sobre reposo y respetan cada MET de referencia", () => {
  assert.equal(estimateCardioKcal("walk-moderate", 30, 70), 98);
  assert.equal(estimateCardioKcal("elliptical-moderate", 30, 70), 140);
  assert.equal(estimateCardioKcal("walk-moderate", 60, 70), 196);
  assert.equal(cardioActivity("run-10").met, 9.3);
  const ids = cardioActivities.flatMap((a) => a.options.map((o) => o.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const args of [["other",30,70],["missing",30,70],["walk-moderate",0,70],["walk-moderate",30,0],["walk-moderate",NaN,70],["walk-moderate",30,Infinity]]) {
    assert.equal(estimateCardioKcal(...args), null);
  }
});

test("el peso sugerido usa la fecha del cardio, nunca el peso objetivo ni pesajes futuros", () => {
  const state = fixture();
  assert.equal(cardioWeightForDate(state, date), 70);
  assert.equal(cardioWeightForDate(state, "2026-10-19"), 75);
  state.profile = null;
  assert.equal(cardioWeightForDate(state, "2026-10-19"), null);
});

test("todo el cardio del día aumenta el objetivo, sin alterar comida, macros, fuerza ni base", () => {
  const state = fixture();
  const goals = structuredClone(state.goals), food = mealTotals(state.entries), strength = trainingStats(state.sessions, date);
  state.cardio = [walk, manual, { ...manual, id: "previous", date: "2026-10-21" }, { ...manual, id: "future", date: "2026-10-23" }];
  assert.deepEqual(dailyEnergy(state, date), { base: 2200, cardio: 248, target: 2448 });
  assert.deepEqual(dailyEnergy(state, "2026-10-24"), { base: 2200, cardio: 0, target: 2200 });
  assert.deepEqual(state.goals, goals);
  assert.deepEqual(mealTotals(state.entries), food);
  assert.deepEqual(trainingStats(state.sessions, date), strength);
});

test("editar, mover o eliminar cardio actualiza únicamente los presupuestos correspondientes", () => {
  const state = fixture();
  state.cardio = [structuredClone(walk), structuredClone(manual)];
  state.cardio[1].kcal = 200;
  assert.equal(dailyEnergy(state, date).target, 2498);
  state.cardio[1].date = "2026-10-21";
  assert.equal(dailyEnergy(state, date).target, 2298);
  assert.equal(dailyEnergy(state, "2026-10-21").target, 2400);
  state.cardio = [];
  assert.equal(dailyEnergy(state, date).target, 2200);
});

test("el periodo móvil incluye siete fechas y la semana calendario excluye días futuros", () => {
  const records = ["2026-10-15", "2026-10-16", "2026-10-19", date, "2026-10-23"].map((d, i) => ({ ...manual, id: "r" + i, date: d }));
  assert.deepEqual(cardioTotals(records, trainingDays(date, "rolling")), { count: 3, minutes: 60, kcal: 450 });
  assert.deepEqual(cardioTotals(records, trainingDays(date, "week").filter((d) => d <= date)), { count: 2, minutes: 40, kcal: 300 });
});

test("las copias antiguas siguen válidas y el gasto histórico conserva su peso y kcal al recargar", () => {
  const state = fixture();
  assert.equal(validState(state), true);
  assert.equal(dailyEnergy(state, date).target, 2200);
  state.cardio = [walk, manual];
  const restored = JSON.parse(JSON.stringify(state));
  assert.equal(validState(restored), true);
  restored.weights.push({ date, kg: 90 });
  restored.profile.weight = 90;
  assert.equal(dailyEnergy(restored, date).cardio, 248);
  assert.equal(restored.cardio[0].weightKg, 70);
});

test("importación rechaza fechas, fuentes, kcal, duraciones y duplicados inválidos de cardio", () => {
  const state = fixture();
  for (const patch of [{ date: "2026-02-30" }, { id: "<html>" }, { activityId: "__proto__" }, { source: "watch" }, { minutes: 0 }, { minutes: Infinity }, { minutes: 1441 }, { weightKg: 0 }, { kcal: 99 }, { kcal: -1 }, { notes: "x".repeat(1001) }]) {
    state.cardio = [{ ...walk, ...patch }];
    assert.equal(validState(state), false, JSON.stringify(patch));
  }
  state.cardio = [{ ...manual, kcal: 2.5 }];
  assert.equal(validState(state), false);
  state.cardio = [{ ...manual, weightKg: 70 }];
  assert.equal(validState(state), false);
  state.cardio = [walk, walk];
  assert.equal(validState(state), false);
  state.cardio = null;
  assert.equal(validState(state), false);
});
