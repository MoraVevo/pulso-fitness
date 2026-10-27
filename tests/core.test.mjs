import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  localDate,
  shiftDate,
  weekDays,
  mealTotals,
  sessionVolume,
  e1RM,
  patternProgress,
  trendWord,
  routinePlan,
  kgToLb,
  lbToKg,
  exerciseLoadSuggestion,
  weeklyStats,
  trainingStats,
  trainingDays,
  weightStats,
  validState,
} from "../dist/core.js";
import { exercises, exerciseMuscles } from "../dist/exercises.js";

const exerciseSession = (date, id, count, options = {}) => ({
  id: `session-${date}-${id}`,
  date,
  name: "Prueba",
  finished: true,
  feeling: 3,
  notes: "",
  exercises: [
    {
      exerciseId: id,
      name: exercises.find((e) => e.id === id)?.name || id,
      muscle: "Pecho",
      sets: Array.from({ length: count }, () => ({
        kg: id === "pushup" ? 0 : 60,
        reps: 10,
        rir: 2,
        done: true,
      })),
      ...options,
    },
  ],
});

test("banca lunes, máquina miércoles y push ups domingo suman por músculo", () => {
  const sessions = [
    exerciseSession("2026-10-12", "bench", 3),
    exerciseSession("2026-10-14", "machine-press", 4),
    exerciseSession("2026-10-18", "pushup", 2),
  ];
  for (const mode of ["rolling", "week"]) {
    const stats = trainingStats(sessions, "2026-10-18", mode);
    assert.equal(stats.sets, 9);
    assert.equal(stats.sessions, 3);
    assert.equal(stats.volume, 4200);
    assert.equal(stats.muscleBreakdown.Pecho.direct, 9);
    assert.equal(stats.muscleBreakdown.Pecho.indirect, 0);
    assert.equal(stats.muscleBreakdown.Deltoides.indirect, 9);
    assert.equal(stats.muscleBreakdown.Tríceps.indirect, 9);
    assert.equal(stats.muscleBreakdown.Deltoides.direct, 0);
    assert.equal(stats.muscleBreakdown.Pecho.exercises.length, 3);
    assert.equal(
      stats.muscleBreakdown.Pecho.exercises.find(
        (e) => e.exerciseId === "machine-press",
      ).direct,
      4,
    );
  }
});

test("al avanzar al lunes, 7 días móviles conserva miércoles y domingo, no el lunes anterior", () => {
  const sessions = [
    exerciseSession("2026-10-12", "bench", 3),
    exerciseSession("2026-10-14", "machine-press", 4),
    exerciseSession("2026-10-18", "pushup", 2),
    exerciseSession("2026-10-20", "bench", 10),
  ];
  const rolling = trainingStats(sessions, "2026-10-19");
  assert.equal(rolling.start, "2026-10-13");
  assert.equal(rolling.end, "2026-10-19");
  assert.equal(rolling.sets, 6);
  assert.equal(rolling.muscleBreakdown.Pecho.direct, 6);
  assert.equal(rolling.muscleBreakdown.Tríceps.indirect, 6);
  const calendar = trainingStats(sessions, "2026-10-19", "week");
  assert.equal(calendar.sets, 0);
  assert.equal(calendar.start, "2026-10-19");
  assert.deepEqual(trainingDays("2027-01-03"), [
    "2026-12-28",
    "2026-12-29",
    "2026-12-30",
    "2026-12-31",
    "2027-01-01",
    "2027-01-02",
    "2027-01-03",
  ]);
});

test("los límites móviles incluyen ambos extremos y excluyen registros posteriores", () => {
  const sessions = ["2026-10-11", "2026-10-12", "2026-10-18", "2026-10-19"].map(
    (d) => exerciseSession(d, "bench", 1),
  );
  assert.equal(trainingStats(sessions, "2026-10-18").sets, 2);
  assert.equal(trainingStats(sessions, "2026-10-14", "week").sets, 1);
});

test("los roles editados prevalecen, sin duplicar un músculo dentro de una serie", () => {
  const session = exerciseSession("2026-10-18", "bench", 3, {
    primaryMuscles: ["Pecho", "Pecho"],
    secondaryMuscles: ["Pecho", "Hombros", "Deltoides", "Tríceps", "Tríceps"],
  });
  const stats = trainingStats([session], "2026-10-18");
  assert.equal(stats.sets, 3);
  assert.equal(stats.muscleBreakdown.Pecho.total, 3);
  assert.equal(stats.muscleBreakdown.Deltoides.indirect, 3);
  assert.equal(stats.muscleBreakdown.Tríceps.total, 3);
  const edited = exerciseSession("2026-10-18", "bench", 2, {
    primaryMuscles: ["Tríceps"],
    secondaryMuscles: ["Pecho"],
  });
  const result = trainingStats([edited], "2026-10-18");
  assert.equal(result.muscleBreakdown.Tríceps.direct, 2);
  assert.equal(result.muscleBreakdown.Pecho.indirect, 2);
  assert.equal(result.muscleBreakdown.Deltoides, undefined);
});

test("series pendientes y peso corporal: el conteo muscular no depende de la carga", () => {
  const session = exerciseSession("2026-10-18", "pushup", 3);
  session.finished = false;
  session.exercises[0].sets[2].done = false;
  const stats = trainingStats([session], "2026-10-18");
  assert.equal(stats.sets, 2);
  assert.equal(stats.sessions, 0);
  assert.equal(stats.volume, 0);
  assert.equal(stats.muscleBreakdown.Pecho.direct, 2);
  assert.equal(stats.muscleBreakdown.Tríceps.indirect, 2);
});

test("el catálogo conserva IDs anteriores y permite varias variantes por músculo", () => {
  assert.equal(exercises.length, 68);
  assert.equal(new Set(exercises.map((e) => e.id)).size, 68);
  const legacy = [
    "bench",
    "incline",
    "fly",
    "pushup",
    "pulldown",
    "row",
    "cable-row",
    "pullup",
    "squat",
    "legpress",
    "extension",
    "lunge",
    "rdl",
    "legcurl",
    "deadlift",
    "hipthrust",
    "kickback",
    "ohp",
    "lateral",
    "facepull",
    "curl",
    "hammer",
    "triceps",
    "overhead",
    "crunch",
    "cablecrunch",
    "calf",
  ];
  for (const id of legacy) assert.ok(exercises.some((e) => e.id === id));
  assert.deepEqual(exerciseMuscles({ exerciseId: "bench", muscle: "Pecho" }), {
    primary: ["Pecho"],
    secondary: ["Deltoides", "Tríceps"],
  });
  assert.deepEqual(
    exerciseMuscles({ exerciseId: "personal", muscle: "Hombros" }),
    { primary: ["Deltoides"], secondary: [] },
  );
});

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
test("volumen y músculos cuentan series completadas y RIR vacío equivale a 0", () => {
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
  assert.equal(stats.rir, 2 / 3);
  assert.equal(stats.muscles.Pecho, 3);
});
test("sugiere la media de carga de los últimos 14 días y excluye otros registros", () => {
  const sessions = [
    {
      date: "2026-10-04",
      exercises: [{ exerciseId: "bench", sets: [{ kg: 100, done: true }] }],
    },
    {
      date: "2026-10-05",
      exercises: [{ exerciseId: "bench", sets: [{ kg: 20, done: true }, { kg: 80, done: false }] }],
    },
    {
      date: "2026-10-18",
      exercises: [{ exerciseId: "bench", sets: [{ kg: 40, done: true }] }],
    },
    {
      date: "2026-10-19",
      exercises: [{ exerciseId: "bench", sets: [{ kg: 200, done: true }] }],
    },
  ];
  assert.deepEqual(
    exerciseLoadSuggestion(sessions, "bench", "2026-10-18"),
    { kg: 30, source: "history" },
  );
  assert.deepEqual(exerciseLoadSuggestion([], "fly", "2026-10-18"), {
    kg: 5,
    source: "starter",
  });
});
test("las cargas se convierten entre kg y lb", () => {
  assert.equal(kgToLb(1), 2.2046226218487757);
  assert.equal(lbToKg(kgToLb(42.5)), 42.5);
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
  const routine = {
    id: "routine-test",
    name: "Mi rutina",
    note: "Personal",
    exercises: exerciseSession("2026-10-18", "bench", 3).exercises,
  };
  assert.equal(validState({ ...state, routines: [routine] }), true);
  assert.equal(
    validState({ ...state, routines: [{ ...routine, exercises: [] }] }),
    false,
  );
  assert.equal(
    validState({
      ...state,
      routines: [
        {
          ...routine,
          exercises: [{ ...routine.exercises[0], movement: "inventado" }],
        },
      ],
    }),
    false,
  );
  assert.equal(
    validState({
      ...state,
      routines: [
        { ...routine, exercises: [{ ...routine.exercises[0], sets: [] }] },
      ],
    }),
    false,
  );
  assert.equal(
    validState({ ...state, routines: [{ ...routine, id: '"><svg>' }] }),
    false,
  );
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
  const modern = exerciseSession("2026-10-18", "bench", 3, {
    primaryMuscles: ["Pecho"],
    secondaryMuscles: ["Deltoides", "Tríceps"],
  });
  assert.equal(
    validState({ ...state, sessions: [modern], trainingWindow: "rolling" }),
    true,
  );
  const blankSet = structuredClone(modern);
  blankSet.exercises[0].sets = [
    { kg: 5, unit: "lb", reps: "", rir: "", done: false },
  ];
  assert.equal(validState({ ...state, sessions: [blankSet] }), true);
  blankSet.exercises[0].sets[0].unit = "oz";
  assert.equal(validState({ ...state, sessions: [blankSet] }), false);
  assert.equal(
    validState({
      ...state,
      sessions: [
        exerciseSession("2026-10-18", "bench", 3, { primaryMuscles: [] }),
      ],
    }),
    false,
  );
  assert.equal(
    validState({
      ...state,
      sessions: [
        exerciseSession("2026-10-18", "bench", 3, {
          secondaryMuscles: ["Inexistente"],
        }),
      ],
    }),
    false,
  );
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

test("routinePlan deja las copias sin notas ni sensación del día", () => {
  const planned = routinePlan([
    {
      exerciseId: "bench-bar",
      name: "Press de banca",
      note: "Buen agarre hoy",
      feeling: 4,
      sets: [{ kg: 40, reps: 8, rir: 2, done: true, recordedAt: 1700000000000 }],
    },
  ]);
  assert.equal(planned[0].note, undefined);
  assert.equal(planned[0].feeling, undefined);
  assert.equal(planned[0].sets[0].done, false);
  assert.equal(planned[0].sets[0].recordedAt, undefined);
});

test('e1RM: Epley puro y ajustado por RIR, con límite de fiabilidad', () => {
  assert.ok(Math.abs(e1RM(100, 8) - 100 * (1 + 8 / 30)) < 1e-9);
  assert.ok(Math.abs(e1RM(100, 6, 2) - e1RM(100, 8)) < 1e-9);
  assert.equal(e1RM(0, 5), null);
  assert.equal(e1RM(60, ''), null);
  assert.equal(e1RM(100, 10, 5), null);
  assert.equal(e1RM(100, 12, 0) != null, true);
});

test('trendWord: umbrales al ±5% y sin datos', () => {
  assert.equal(trendWord(10), 'subió');
  assert.equal(trendWord(5), 'estable');
  assert.equal(trendWord(-5.1), 'bajó');
  assert.equal(trendWord(null), null);
});

test('patternProgress: ocho cubetas, series efectivas por RIR y semanas sin registros', () => {
  const end = '2026-10-27';
  const mk = (date, kg, reps, rir) => ({
    id: 's-' + date + '-' + kg,
    date,
    finished: true,
    feeling: 3,
    notes: '',
    exercises: [
      {
        exerciseId: 'pullup',
        movement: 'pull',
        name: 'Dominadas',
        sets: [{ kg, reps, rir, done: true }],
      },
    ],
  });
  const sessions = [
    mk('2026-10-27', 30, 8, ''),
    mk('2026-10-20', 10, 8, 5),
    mk('2026-09-29', 20, 6, 2),
  ];
  const data = patternProgress(sessions, [], end, 'pull');
  assert.equal(data.weeks.length, 8);
  assert.equal(data.weeks[7].start, '2026-10-21');
  assert.equal(data.weeks[7].end, '2026-10-27');
  assert.equal(data.weeks[7].sets, 1);
  assert.equal(data.weeks[7].sessions, 1);
  assert.equal(data.weeks[7].effectiveSets, 1);
  assert.equal(data.weeks[6].sets, 1);
  assert.equal(data.weeks[6].effectiveSets, 0);
  assert.equal(data.weeks[6].hasData, true);
  assert.equal(data.weeks[5].hasData, false);
  assert.equal(data.weeks[3].effectiveSets, 1);
  assert.equal(data.weeks[3].volume, 20 * 6);
  const ex = data.exercises.find((e) => e.exerciseId === 'pullup');
  assert.equal(ex.sets, 3);
  assert.ok(Math.abs(ex.e1RM.best - e1RM(30, 8)) < 1e-9);
  assert.ok(Math.abs(ex.e1RM.prevBest - e1RM(20, 6, 2)) < 1e-9);
  assert.equal(ex.e1RM.isPR, true);
  assert.ok(data.summary.sets.deltaPct !== null);
});

test('patternProgress: cardio suma minutos por cubeta sin tocar la fuerza', () => {
  const end = '2026-10-27';
  const cardio = [
    { date: '2026-10-26', minutes: 30, kcal: 97 },
    { date: '2026-10-13', minutes: 45, kcal: 150 },
  ];
  const cardioRun = patternProgress([], cardio, end, 'cardio');
  assert.equal(cardioRun.weeks[7].minutes, 30);
  assert.equal(cardioRun.weeks[7].kcal, 97);
  assert.equal(cardioRun.weeks[5].minutes, 45);
  assert.equal(cardioRun.exercises.length, 0);
  const pullRun = patternProgress([], cardio, end, 'pull');
  assert.equal(pullRun.weeks[7].minutes, 0);
});

test('patternProgress no muta los registros de entrada', () => {
  const session = {
    id: 'x',
    date: '2026-10-27',
    finished: true,
    feeling: 3,
    notes: '',
    exercises: [
      {
        exerciseId: 'pullup',
        movement: 'pull',
        name: 'Dominadas',
        sets: [{ kg: 10, reps: 8, rir: '', done: true }],
      },
    ],
  };
  const before = JSON.stringify(session);
  patternProgress([session], [], '2026-10-27', 'pull');
  assert.equal(JSON.stringify(session), before);
});
