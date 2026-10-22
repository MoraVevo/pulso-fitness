import { exerciseMuscles, muscleNames } from "./exercises.js";
import { exerciseRegions, validMuscleRegions } from "./muscle-regions.js";

export const sum = (items, fn) => items.reduce((n, item) => n + fn(item), 0);
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function shiftDate(date, days) {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + days);
  return localDate(d);
}
export function weekDays(date) {
  const d = new Date(date + "T12:00:00");
  const monday = shiftDate(date, -((d.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => shiftDate(monday, i));
}
export function mealTotals(entries) {
  return Object.fromEntries(
    ["kcal", "protein", "carbs", "fat"].map((key) => [
      key,
      sum(entries, (e) => (Number(e.food[key]) * Number(e.grams)) / 100),
    ]),
  );
}
export function completedSets(session) {
  return (session?.exercises || []).flatMap((e) => {
    const { primary, secondary } = exerciseMuscles(e);
    const regions = exerciseRegions(e);
    return e.sets
      .filter((s) => s.done)
      .map((s) => ({
        ...s,
        exerciseId: e.exerciseId,
        name: e.name || e.exerciseId,
        muscle: primary[0],
        primaryMuscles: primary,
        secondaryMuscles: secondary,
        muscleRegions: regions,
      }));
  });
}
export function sessionVolume(session) {
  return sum(completedSets(session), (s) => s.kg * s.reps);
}
const LB_PER_KG = 2.2046226218487757;
export const kgToLb = (kg) => kg * LB_PER_KG;
export const lbToKg = (lb) => lb / LB_PER_KG;

const starterLoadsKg = {
  bench: 20, "machine-press": 10, "dumbbell-press": 8,
  incline: 6, "incline-barbell": 20, "incline-machine": 10,
  "smith-press": 20, "decline-press": 20, pushup: 0, "incline-pushup": 0,
  fly: 5, "pec-deck": 10, "cable-fly": 7, dips: 0,
  pulldown: 15, "neutral-pulldown": 15, row: 20, "cable-row": 12,
  "machine-row": 12, "dumbbell-row": 10, "chest-supported-row": 8,
  pullup: 0, chinup: 0, pullover: 10,
  squat: 20, "front-squat": 20, "goblet-squat": 8, "hack-squat": 15,
  legpress: 20, extension: 10, lunge: 8, bulgarian: 8, "step-up": 8,
  rdl: 20, "dumbbell-rdl": 10, legcurl: 10, "seated-legcurl": 10,
  deadlift: 20, hipthrust: 20, "machine-hipthrust": 15, kickback: 5,
  abduction: 10, adduction: 10,
  ohp: 15, "dumbbell-ohp": 6, "machine-ohp": 10, lateral: 4,
  "cable-lateral": 3, "rear-delt": 4, "reverse-pec-deck": 8,
  facepull: 7, shrug: 10, curl: 5, "barbell-curl": 10, hammer: 5,
  "preacher-curl": 8, "cable-curl": 7, triceps: 7, overhead: 5,
  skullcrusher: 8, "close-grip-press": 15, crunch: 0, cablecrunch: 10,
  "leg-raise": 0, "ab-wheel": 0, calf: 10, "seated-calf": 10,
  "wrist-curl": 3,
};

export function exerciseLoadSuggestion(sessions, exerciseId, date, equipment = "") {
  const firstDay = shiftDate(date, -13);
  const recentLoads = sessions
    .filter((session) => session.date >= firstDay && session.date <= date)
    .flatMap((session) => session.exercises || [])
    .filter((exercise) => exercise.exerciseId === exerciseId)
    .flatMap((exercise) => exercise.sets || [])
    .filter((set) => set.done && Number.isFinite(set.kg));
  if (recentLoads.length) {
    const mean = sum(recentLoads, (set) => set.kg) / recentLoads.length;
    return { kg: Math.round(mean * 2) / 2, source: "history" };
  }
  if (Object.hasOwn(starterLoadsKg, exerciseId))
    return { kg: starterLoadsKg[exerciseId], source: "starter" };
  if (/peso corporal|sin equipo|rueda/i.test(equipment))
    return { kg: 0, source: "starter" };
  if (/barra ez|barra z/i.test(equipment))
    return { kg: 8, source: "starter" };
  if (/barra/i.test(equipment)) return { kg: 15, source: "starter" };
  if (/mancuerna/i.test(equipment)) return { kg: 5, source: "starter" };
  if (/polea/i.test(equipment)) return { kg: 7, source: "starter" };
  if (/máquina|maquina/i.test(equipment)) return { kg: 10, source: "starter" };
  return { kg: 0, source: "starter" };
}

export function routinePlan(exercises) {
  return structuredClone(exercises).map((ex) => ({
    ...ex,
    sets: (ex.sets.length ? ex.sets : [{ kg: 0, reps: "", rir: "" }]).map(
      (set) => ({ ...set, done: false }),
    ),
  }));
}
export function trainingDays(date, mode = "rolling") {
  return mode === "week"
    ? weekDays(date)
    : Array.from({ length: 7 }, (_, i) => shiftDate(date, i - 6));
}
const contribution = () => ({ direct: 0, indirect: 0, total: 0, exercises: [] });
function addContribution(row, set, role) {
  row[role]++;
  row.total++;
  let ex = row.exercises.find((e) => e.exerciseId === set.exerciseId && e.name === set.name);
  if (!ex) {
    ex = { exerciseId: set.exerciseId, name: set.name, direct: 0, indirect: 0, total: 0 };
    row.exercises.push(ex);
  }
  ex[role]++;
  ex.total++;
}
export function trainingStats(sessions, date, mode = "rolling") {
  const days = trainingDays(date, mode);
  const period = sessions.filter(
    (s) => days.includes(s.date) && s.date <= date,
  );
  const sets = period.flatMap(completedSets),
    muscles = Object.create(null),
    muscleBreakdown = Object.create(null);
  for (const set of sets) {
    for (const [role, names] of [
      ["direct", set.primaryMuscles],
      ["indirect", set.secondaryMuscles],
    ]) {
      for (const muscle of names) {
        const row = (muscleBreakdown[muscle] ||= {
          ...contribution(), regions: Object.create(null), unspecified: contribution(),
        });
        addContribution(row, set, role);
        const details = Object.hasOwn(set.muscleRegions, muscle) ? set.muscleRegions[muscle] : null;
        if (!details || (!details.direct.length && !details.indirect.length)) {
          addContribution(row.unspecified, set, role);
        } else {
          for (const detailRole of ["direct", "indirect"]) {
            for (const region of details[detailRole]) {
              addContribution(row.regions[region] ||= contribution(), set, detailRole);
            }
          }
        }
        if (role === "direct") muscles[muscle] = (muscles[muscle] || 0) + 1;
      }
    }
  }
  return {
    sessions: period.filter((s) => s.finished).length,
    sets: sets.length,
    volume: sum(sets, (s) => s.kg * s.reps),
    rir: sets.length
      ? sum(sets, (s) => Number(s.rir === "" || s.rir == null ? 0 : s.rir)) /
        sets.length
      : null,
    muscles,
    muscleBreakdown,
    start: days[0],
    end: date,
    mode,
  };
}
export const weeklyStats = (sessions, date) =>
  trainingStats(sessions, date, "week");
export function weightStats(weights, date) {
  const entries = weights
    .filter((w) => w.date <= date)
    .sort((a, b) => a.date.localeCompare(b.date));
  const recent = entries.filter((w) => w.date >= shiftDate(date, -6));
  const previous = entries.filter(
    (w) => w.date >= shiftDate(date, -13) && w.date < shiftDate(date, -6),
  );
  const avg = (a) => (a.length ? sum(a, (w) => w.kg) / a.length : null);
  return {
    latest: entries.at(-1)?.kg ?? null,
    average: avg(recent),
    change:
      recent.length && previous.length ? avg(recent) - avg(previous) : null,
  };
}
export function validState(s) {
  const num = (v, min, max) =>
    typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
  const date = (v) =>
    typeof v === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    localDate(new Date(v + "T12:00:00")) === v;
  const text = (v, max = 150) => typeof v === "string" && v.length <= max;
  const id = (v) => typeof v === "string" && /^[a-zA-Z0-9_-]{1,150}$/.test(v);
  const food = (f) =>
    f &&
    id(f.id) &&
    text(f.name) &&
    ["kcal", "protein", "carbs", "fat"].every((k) =>
      num(f[k], 0, k === "kcal" ? 1000 : 100),
    ) &&
    (f.portion === undefined || num(f.portion, 0.1, 10000)) &&
    ["detail", "emoji", "source", "sourceId", "portionLabel"].every(
      (k) => f[k] === undefined || text(f[k]),
    );
  const array = (a, check, max = 100000) =>
    Array.isArray(a) && a.length <= max && a.every(check);
  const goals = s?.goals;
  const profile = s?.profile;
  const roles = (list, primary = false) =>
    list === undefined ||
    (array(
      list,
      (m) => muscleNames.includes(m) || m === "Hombros",
      muscleNames.length,
    ) &&
      (!primary || list.length > 0));
  const exerciseRecord = (e) =>
    e &&
    id(e.exerciseId) &&
    text(e.name) &&
    text(e.muscle) &&
    (e.equipment === undefined || text(e.equipment)) &&
    (e.movement === undefined ||
      ["push", "pull", "legs", "core"].includes(e.movement)) &&
    roles(e.primaryMuscles, true) &&
    roles(e.secondaryMuscles) &&
    validMuscleRegions(e.muscleRegions, [...exerciseMuscles(e).primary, ...exerciseMuscles(e).secondary]) &&
    array(
      e.sets,
      (t) =>
        t &&
        num(t.kg, 0, 1000) &&
        (t.reps === "" ||
          (num(t.reps, 1, 200) && Number.isInteger(t.reps))) &&
        (t.rir === "" || t.rir == null || num(t.rir, 0, 10)) &&
        (t.unit === undefined || ["kg", "lb"].includes(t.unit)) &&
        typeof t.done === "boolean",
      200,
    );
  return Boolean(
    s?.version === 1 &&
      (s.onboardingComplete === undefined ||
        typeof s.onboardingComplete === "boolean") &&
      (profile === undefined ||
        profile === null ||
        (profile &&
          num(profile.age, 18, 100) &&
          Number.isInteger(profile.age) &&
          num(profile.height, 120, 230) &&
          num(profile.weight, 30, 300) &&
          (profile.goalWeight === undefined ||
            num(profile.goalWeight, 1, 500)) &&
          ["female", "male"].includes(profile.sex) &&
          ["sedentary", "light", "moderate", "high"].includes(
            profile.activity,
          ) &&
          ["lose", "maintain", "gain"].includes(profile.mode))) &&
      (s.trainingWindow === undefined ||
        ["rolling", "week"].includes(s.trainingWindow)) &&
      goals &&
      text(goals.name, 40) &&
      num(goals.kcal, 1, 10000) &&
      num(goals.maintenance, 1, 10000) &&
      ["protein", "carbs", "fat"].every((k) => num(goals[k], 0, 1000)) &&
      num(goals.weight, 1, 500) &&
      num(goals.sessions, 1, 14) &&
      Number.isInteger(goals.sessions) &&
      ["lose", "maintain", "gain"].includes(goals.mode) &&
      array(
        s.entries,
        (e) =>
          e &&
          id(e.id) &&
          date(e.date) &&
          ["Desayuno", "Almuerzo", "Cena", "Snacks"].includes(e.meal) &&
          num(e.grams, 0.1, 10000) &&
          food(e.food),
      ) &&
      array(s.weights, (w) => w && date(w.date) && num(w.kg, 1, 500)) &&
      array(
        s.sessions,
        (w) =>
          w &&
          id(w.id) &&
          date(w.date) &&
          text(w.name) &&
          typeof w.finished === "boolean" &&
          text(w.notes || "", 2000) &&
          num(w.feeling, 1, 5) &&
          array(w.exercises, exerciseRecord, 100),
        10000,
      ) &&
      (s.routines === undefined ||
        array(
          s.routines,
          (r) =>
            r &&
            id(r.id) &&
            text(r.name, 100) &&
            text(r.note || "", 2000) &&
            array(r.exercises, exerciseRecord, 100) &&
            r.exercises.length > 0 &&
            r.exercises.every((ex) => ex.sets.length > 0),
          500,
        )) &&
      array(s.customFoods, food, 10000) &&
      array(s.favorites, id, 10000),
  );
}
