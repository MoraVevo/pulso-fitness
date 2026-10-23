// 2024 Adult Compendium (19–59 years). Preserve each published MET/code pair.
// https://pacompendium.com/ — 1 MET = 1 kcal/kg/hour.
export const cardioActivities = [
  { id: "walk", name: "Caminata", options: [
    { id: "walk-easy", label: "Suave · 3,2–3,9 km/h · terreno llano", met: 2.8, code: "17152" },
    { id: "walk-moderate", label: "Moderada · 4,5–5,5 km/h · terreno llano", met: 3.8, code: "17190" },
    { id: "walk-brisk", label: "Rápida · 5,6–6,3 km/h · terreno llano", met: 4.8, code: "17200" },
  ] },
  { id: "treadmill", name: "Caminadora", options: [
    { id: "treadmill-moderate", label: "4,8–5,5 km/h · sin inclinación", met: 3.8, code: "17355" },
    { id: "treadmill-brisk", label: "5,6–6,3 km/h · sin inclinación", met: 4.8, code: "17358" },
  ] },
  { id: "run", name: "Trote / carrera", options: [
    { id: "jog", label: "Trote · ritmo libre", met: 7.5, code: "12020" },
    { id: "run-8", label: "Carrera · 8–8,4 km/h", met: 8.5, code: "12030" },
    { id: "run-10", label: "Carrera · 9,7–10,1 km/h", met: 9.3, code: "12050" },
  ] },
  { id: "bike", name: "Bicicleta", options: [
    { id: "bike-easy", label: "Esfuerzo suave · ritmo libre", met: 4.3, code: "01015" },
    { id: "bike-moderate", label: "Esfuerzo moderado · ritmo libre", met: 7, code: "01016" },
    { id: "bike-vigorous", label: "Esfuerzo intenso · ritmo libre", met: 9, code: "01017" },
  ] },
  { id: "stationary", name: "Bicicleta estática", options: [
    { id: "stationary-50", label: "Suave · 50 W", met: 4, code: "01214" },
    { id: "stationary-100", label: "Moderado a intenso · 90–100 W", met: 6, code: "01220" },
    { id: "spinning", label: "Clase de spinning", met: 9, code: "01270" },
  ] },
  { id: "elliptical", name: "Elíptica", options: [
    { id: "elliptical-moderate", label: "Esfuerzo moderado", met: 5, code: "02048" },
    { id: "elliptical-vigorous", label: "Esfuerzo intenso", met: 9, code: "02049" },
  ] },
  { id: "row", name: "Remo en máquina", options: [
    { id: "row-moderate", label: "Moderado · menos de 100 W", met: 5, code: "02071" },
    { id: "row-vigorous", label: "Intenso · 100–149 W", met: 7.5, code: "02072" },
  ] },
  { id: "stairs", name: "Escaladora", options: [
    { id: "stairs-machine", label: "Escaladora de peldaños · general", met: 9.3, code: "02065" },
  ] },
  { id: "rope", name: "Saltar cuerda", options: [
    { id: "rope-general", label: "Saltar cuerda · general", met: 11, code: "02068" },
  ] },
  { id: "other", name: "Otro cardio", options: [
    { id: "other", label: "Kcal activas de tu reloj o máquina", met: null, code: null },
  ] },
];

export function cardioActivity(id) {
  for (const activity of cardioActivities) {
    const option = activity.options.find((o) => o.id === id);
    if (option) return { ...option, name: activity.name, groupId: activity.id };
  }
  return null;
}
const number = (n, min, max) => typeof n === "number" && Number.isFinite(n) && n >= min && n <= max;

export function estimateCardioKcal(activityId, minutes, weightKg) {
  const activity = cardioActivity(activityId);
  if (!activity?.met || !number(minutes, 0.1, 1440) || !number(weightKg, 30, 300)) return null;
  // Active energy above rest, rather than gross energy including that rest.
  return Math.round((activity.met - 1) * weightKg * minutes / 60);
}

export function cardioWeightForDate(state, date) {
  return [...state.weights].filter((w) => w.date <= date)
    .sort((a, b) => a.date.localeCompare(b.date)).at(-1)?.kg ?? state.profile?.weight ?? null;
}

export function cardioTotals(records = [], dates) {
  const selected = records.filter((r) => typeof dates === "string" ? r.date === dates : dates.includes(r.date));
  return selected.reduce((t, r) => ({ count: t.count + 1, minutes: t.minutes + r.minutes, kcal: t.kcal + r.kcal }), { count: 0, minutes: 0, kcal: 0 });
}

export function dailyEnergy(state, date) {
  const cardio = cardioTotals(state.cardio, date).kcal;
  return { base: state.goals.kcal, cardio, target: state.goals.kcal + cardio };
}

export function validCardioRecord(r) {
  return Boolean(r && cardioActivity(r.activityId) && number(r.minutes, 0.1, 1440) &&
    number(r.kcal, 0, 20000) && Number.isInteger(r.kcal) &&
    (r.notes === undefined || (typeof r.notes === "string" && r.notes.length <= 1000)) &&
    ((r.source === "manual" && r.weightKg === null) ||
      (r.source === "estimate" && number(r.weightKg, 30, 300) &&
        r.kcal === estimateCardioKcal(r.activityId, r.minutes, r.weightKg))));
}
