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
  return (session?.exercises || []).flatMap((e) =>
    e.sets
      .filter((s) => s.done)
      .map((s) => ({ ...s, exerciseId: e.exerciseId, muscle: e.muscle })),
  );
}
export function sessionVolume(session) {
  return sum(completedSets(session), (s) => s.kg * s.reps);
}
export function weeklyStats(sessions, date) {
  const days = weekDays(date),
    week = sessions.filter((s) => days.includes(s.date));
  const sets = week.flatMap(completedSets),
    muscles = {};
  for (const s of sets) muscles[s.muscle] = (muscles[s.muscle] || 0) + 1;
  const withRir = sets.filter(
    (s) => s.rir !== "" && s.rir !== null && s.rir !== undefined,
  );
  return {
    sessions: week.filter((s) => s.finished).length,
    sets: sets.length,
    volume: sum(sets, (s) => s.kg * s.reps),
    rir: withRir.length
      ? sum(withRir, (s) => Number(s.rir)) / withRir.length
      : null,
    muscles,
  };
}
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
  return Boolean(
    s?.version === 1 &&
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
          array(
            w.exercises,
            (e) =>
              e &&
              id(e.exerciseId) &&
              text(e.name) &&
              text(e.muscle) &&
              array(
                e.sets,
                (t) =>
                  t &&
                  num(t.kg, 0, 1000) &&
                  num(t.reps, 1, 200) &&
                  Number.isInteger(t.reps) &&
                  (t.rir === "" || num(t.rir, 0, 10)) &&
                  typeof t.done === "boolean",
                200,
              ),
            100,
          ),
        10000,
      ) &&
      array(s.customFoods, food, 10000) &&
      array(s.favorites, id, 10000),
  );
}
