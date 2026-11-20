import test from "node:test";
import assert from "node:assert/strict";
import { llmDigest } from "../dist/core.js";

const now = "2026-11-20";
const hoy = now;
const hace60 = "2026-09-21"; // fuera de la ventana de 30 días

function fixture() {
  return {
    profile: { age: 30, height: 175, weight: 75, sex: "male", activity: "moderate", mode: "lose" },
    goals: { name: "Prueba", kcal: 2200, maintenance: 2500, protein: 150, carbs: 250, fat: 70, weight: 4, sessions: 4, mode: "lose" },
    entries: [
      {
        id: "e1",
        date: hoy,
        meal: "Desayuno",
        grams: 200,
        food: { id: "f1", name: "Avena", kcal: 380, protein: 13, carbs: 68, fat: 7 },
      },
      { id: "e2", date: hace60, meal: "Cena", grams: 100, food: { id: "f2", name: "Pollo", kcal: 165, protein: 31, carbs: 0, fat: 4 } },
    ],
    sessions: [
      {
        id: "s1",
        date: hoy,
        name: "Pierna",
        finished: true,
        exercises: [
          {
            exerciseId: "squat",
            name: "Sentadilla con barra",
            sets: [
              { kg: 80, reps: 6, rir: 2, done: true },
              { kg: 80, reps: 6, rir: 1, done: true },
              { kg: "", reps: "", rir: "", done: false },
            ],
          },
          { exerciseId: "legpress", name: "Prensa", sets: [{ kg: "", reps: "", rir: "", done: false }] },
        ],
      },
      { id: "s2", date: hace60, name: "Vieja", finished: true, exercises: [{ exerciseId: "bench", name: "Press", sets: [{ kg: 60, reps: 8, rir: 1, done: true }] }] },
    ],
    cardio: [
      { id: "c1", date: hoy, activityId: "run-9.7", minutes: 30, kcal: 300 },
    ],
    videoAnalyses: [
      {
        id: "v1",
        date: hoy,
        exerciseId: "squat",
        kind: "squat",
        velocityUnit: "cm",
        summary: { repCount: 6, avgRomDeg: 140, avgEccentricMs: 1400, avgConcentricMs: 1100, meanConcentricVel: 72.3 },
      },
    ],
    weights: [
      { date: hace60, kg: 76 },
      { date: hoy, kg: 75 },
    ],
  };
}

test("llmDigest incluye solo el periodo pedido y calcula totales correctos", () => {
  const d = llmDigest(fixture(), { days: 30, now });
  assert.equal(d.periodo, `últimos 30 días hasta ${now}`);
  assert.equal(d.alimentacion.length, 1);
  assert.equal(d.alimentacion[0].fecha, hoy);
  // 200 g de avena a 380 kcal/100 g
  assert.equal(d.alimentacion[0].totales.kcal, 760);
  assert.equal(d.alimentacion[0].totales.proteina_g, 26);
  assert.equal(d.alimentacion[0].comidas[0].nombre, "Avena");
  assert.equal(d.entrenamiento.length, 1);
  assert.equal(d.entrenamiento[0].ejercicios.length, 1); // la prensa sin series hechas se omite
  assert.deepEqual(
    d.entrenamiento[0].ejercicios[0].series.map((s) => s.rir),
    [2, 1],
  );
  assert.equal(d.resumen.series_completadas, 2);
  assert.equal(d.resumen.volumen_total_kg, 80 * 6 * 2);
  assert.equal(d.peso.length, 1);
  assert.equal(d.peso[0].kg, 75);
  assert.equal(d.cardio[0].kcal_activas, 300);
  assert.equal(d.analisisVideo[0].repeticiones, 6);
  assert.deepEqual(d.analisisVideo[0].velocidad_subida, { valor: 72.3, unidad: "cm/s" });
});

test("llmDigest con todo el historial incluye registros antiguos", () => {
  const d = llmDigest(fixture(), { days: 0, now });
  assert.equal(d.periodo, `todo el historial hasta ${now}`);
  assert.equal(d.alimentacion.length, 2);
  assert.equal(d.entrenamiento.length, 2);
  assert.equal(d.peso.length, 2);
});

test("llmDigest deja claro el objetivo y el perfil", () => {
  const d = llmDigest(fixture(), { days: 30, now });
  assert.deepEqual(d.perfil, { edad: 30, sexo: "male", estatura_cm: 175, peso_kg: 75 });
  assert.equal(d.objetivos.kcal_diarias, 2200);
  assert.equal(d.objetivos.mantenimiento_kcal, 2500);
  assert.equal(d.objetivos.modo, "perder peso");
  assert.equal(d.objetivos.objetivo_peso_kg, 4);
});

test("llmDigest sin registros produce un resumen vacío pero válido", () => {
  const vacio = fixture();
  vacio.entries = [];
  vacio.sessions = [];
  vacio.cardio = [];
  vacio.videoAnalyses = [];
  vacio.weights = [];
  const d = llmDigest(vacio, { days: 30, now });
  assert.equal(d.resumen.dias_con_alimentacion, 0);
  assert.equal(d.resumen.kcal_media_dias_registrados, null);
  assert.deepEqual(d.peso, []);
});
