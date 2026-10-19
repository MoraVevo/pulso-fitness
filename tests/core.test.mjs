import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  localDate,
  shiftDate,
  weekDays,
  mealTotals,
  sessionVolume,
  weeklyStats,
  weightStats,
  validState,
} from "../dist/core.js";

test("porciones escalan calorías y macros sin redondear los registros", () => {
  const result = mealTotals([
    { grams: 150, food: { kcal: 130, protein: 2.69, carbs: 28.17, fat: 0.28 } },
    { grams: 50, food: { kcal: 155, protein: 12.58, carbs: 1.12, fat: 10.61 } },
  ]);
  assert.equal(result.kcal, 272.5);
  assert.ok(Math.abs(result.protein - 10.325) < 1e-9);
  assert.equal(mealTotals([]).kcal, 0);
});
test("semana de lunes a domingo atraviesa año y mes", () => {
  assert.deepEqual(weekDays("2027-01-03"), [
    "2026-12-28",
    "2026-12-29",
    "2026-12-30",
    "2026-12-31",
    "2027-01-01",
    "2027-01-02",
    "2027-01-03",
  ]);
  assert.equal(shiftDate("2024-03-01", -1), "2024-02-29");
});
test("volumen, RIR y músculos solo cuentan series completadas", () => {
  const s = {
    date: "2026-10-18",
    finished: true,
    exercises: [
      {
        muscle: "Pecho",
        exerciseId: "bench",
        sets: [
          { kg: 60, reps: 10, rir: 2, done: true },
          { kg: 60, reps: 8, rir: 0, done: true },
          { kg: 100, reps: 10, rir: 1, done: false },
          { kg: 0, reps: 12, rir: "", done: true },
        ],
      },
    ],
  };
  assert.equal(sessionVolume(s), 1080);
  const stats = weeklyStats([s, { ...s, date: "2026-10-11" }], "2026-10-18");
  assert.equal(stats.volume, 1080);
  assert.equal(stats.sets, 3);
  assert.equal(stats.sessions, 1);
  assert.equal(stats.rir, 1);
  assert.equal(stats.muscles.Pecho, 3);
});
test("media de peso compara dos ventanas y no usa datos futuros", () => {
  const result = weightStats(
    [
      { date: "2026-10-05", kg: 80 },
      { date: "2026-10-11", kg: 82 },
      { date: "2026-10-12", kg: 79 },
      { date: "2026-10-18", kg: 80 },
      { date: "2026-10-19", kg: 85 },
    ],
    "2026-10-18",
  );
  assert.equal(result.latest, 80);
  assert.equal(result.average, 79.5);
  assert.equal(result.change, -1.5);
  assert.equal(weightStats([], "2026-10-18").latest, null);
  assert.equal(
    weightStats([{ date: "2026-10-18", kg: 80 }], "2026-10-18").change,
    null,
  );
});
test("los 53 alimentos tienen valores finitos y referencia a la base oficial", () => {
  const foods = JSON.parse(
    fs.readFileSync(new URL("../dist/foods.json", import.meta.url), "utf8"),
  );
  assert.equal(foods.length, 53);
  assert.equal(new Set(foods.map((f) => f.id)).size, 53);
  for (const f of foods) {
    assert.match(f.sourceId, /^\d{5}$/);
    assert.ok(f.originalName);
    for (const k of ["kcal", "protein", "carbs", "fat"])
      assert.ok(Number.isFinite(f[k]) && f[k] >= 0);
  }
  assert.equal(foods.find((f) => f.id === "usda-20045").kcal, 130);
  assert.equal(foods.find((f) => f.id === "usda-20044").kcal, 365);
});
test("importación rechaza valores imposibles, datos incompletos y fechas inválidas", () => {
  const state = {
    version: 1,
    goals: {
      name: "Test",
      kcal: 2200,
      maintenance: 2500,
      protein: 150,
      carbs: 250,
      fat: 65,
      weight: 72,
      sessions: 4,
      mode: "lose",
    },
    entries: [],
    weights: [],
    sessions: [],
    customFoods: [],
    favorites: [],
  };
  assert.equal(validState(state), true);
  assert.equal(
    validState({ ...state, goals: { ...state.goals, kcal: -1 } }),
    false,
  );
  assert.equal(
    validState({ ...state, weights: [{ date: "2026-02-30", kg: 70 }] }),
    false,
  );
  assert.equal(
    validState({ ...state, weights: [{ date: "2026-10-18", kg: NaN }] }),
    false,
  );
  assert.equal(validState({ version: 1 }), false);
  assert.equal(validState({ ...state, sessions: [null] }), false);
  const food = {
    id: "custom-test",
    name: "Comida",
    kcal: 100,
    protein: 5,
    carbs: 5,
    fat: 5,
  };
  assert.equal(validState({ ...state, customFoods: [food] }), true);
  assert.equal(
    validState({ ...state, customFoods: [{ ...food, portion: '"><script>' }] }),
    false,
  );
  assert.equal(
    validState({
      ...state,
      entries: [
        {
          id: '"><script>',
          date: "2026-10-18",
          meal: "Cena",
          grams: 100,
          food,
        },
      ],
    }),
    false,
  );
});
