import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  jointAngle,
  kneeAngles,
  chooseKneeSide,
  smoothSeries,
  medianFilter,
  interpolateGaps,
  segmentReps,
  analyzeSquat,
  toVideoAnalysis,
  validVideoAnalysis,
  scaleFromEstatura,
  barPoints,
  downsamplePoints,
} from "../dist/kinematics.js";

// Índices de landmarks usados por el motor.
const IDX = { lHip: 23, lKnee: 25, lAnkle: 27, rHip: 24, rKnee: 26, rAnkle: 28, lWrist: 15, rWrist: 16 };

// Genera un fotograma sintético donde la rodilla forma exactamente el ángulo dado,
// con fémur y tibia de longitud 0.3 en unidades normalizadas del video.
function frameWithKneeAngle(degT, t) {
  const thigh = 0.3;
  const rad = (degT * Math.PI) / 180;
  const d = Math.sqrt(2 * thigh ** 2 - 2 * thigh ** 2 * Math.cos(rad));
  const offset = Math.sqrt(Math.max(0, thigh ** 2 - (d / 2) ** 2));
  const lm = Array.from({ length: 33 }, () => null);
  const point = (x, y) => ({ x, y, z: 0, visibility: 1 });
  lm[IDX.lHip] = point(0.5, 0.5 - d / 2);
  lm[IDX.lKnee] = point(0.5 + offset, 0.5);
  lm[IDX.lAnkle] = point(0.5, 0.5 + d / 2);
  lm[IDX.rHip] = point(0.51, 0.5 - d / 2);
  lm[IDX.rKnee] = point(0.51 + offset, 0.5);
  lm[IDX.rAnkle] = point(0.51, 0.5 + d / 2);
  lm[IDX.lWrist] = point(0.62, 0.45 - d / 2);
  lm[IDX.rWrist] = point(0.63, 0.45 - d / 2);
  return { t, lm };
}

// Pseudoaleatorio determinista para que los tests no varíen entre corridas.
function lcg(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

// Serie de ángulos objetivo: 1 s arriba, 1.4 s de bajada (175→65), 0.3 s de fondo,
// 1.1 s de subida. Devuelve fotogramas a la frecuencia dada.
function syntheticFrames({ reps = 4, fps = 18, noise = 0, seed = 7 } = {}) {
  const rand = lcg(seed);
  const phaseAngles = (p) => {
    if (p < 1) return 175;
    if (p < 2.4) return 175 - (110 * (p - 1)) / 1.4;
    if (p < 2.7) return 65;
    if (p < 3.8) return 65 + (110 * (p - 2.7)) / 1.1;
    return 175;
  };
  const repS = 3.8;
  const totalS = reps * repS + 1;
  const n = Math.floor(totalS * fps);
  const frames = [];
  for (let i = 0; i < n; i++) {
    const t = i / fps;
    const target = phaseAngles(t % repS);
    const jitter = noise ? (rand() - 0.5) * 2 * noise : 0;
    frames.push(frameWithKneeAngle(Math.max(20, Math.min(179, target + jitter)), t));
  }
  return frames;
}

test("jointAngle calcula el ángulo en el vértice", () => {
  const a = { x: 0, y: 0 };
  const b = { x: 1, y: 0 };
  const c = { x: 1, y: 1 };
  assert.equal(Math.round(jointAngle(a, b, c)), 90);
  assert.equal(Math.round(jointAngle({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 })), 180);
});

test("el generador sintético produce el ángulo esperado", () => {
  const frames = [frameWithKneeAngle(175, 0), frameWithKneeAngle(90, 1), frameWithKneeAngle(65, 2)];
  const angles = kneeAngles(frames);
  assert.equal(Math.round(angles[0]), 175);
  assert.equal(Math.round(angles[1]), 90);
  assert.equal(Math.round(angles[2]), 65);
});

test("analyzeSquat cuenta 4 repeticiones sintéticas con fases y ROM correctos", () => {
  const frames = syntheticFrames({ reps: 4 });
  const a = analyzeSquat(frames, { estaturaCm: 175 });
  assert.equal(a.summary.repCount, 4);
  assert.equal(a.side, "izquierdo");
  for (const rep of a.reps) {
    assert.ok(Math.abs(rep.romDeg - 110) <= 6, `romDeg ${rep.romDeg}`);
    assert.ok(Math.abs(rep.eccentricMs - 1400) <= 200, `ecc ${rep.eccentricMs}`);
    assert.ok(Math.abs(rep.concentricMs - 1100) <= 200, `con ${rep.eccentricMs}`);
    assert.ok(rep.pauseMs <= 500, `pausa ${rep.pauseMs}`);
  }
  assert.ok(Math.abs(a.summary.avgRomDeg - 110) <= 6);
  assert.ok(a.summary.tutMs >= 4 * 2200 && a.summary.tutMs <= 4 * 2900);
  assert.ok(a.quality.visibilityPct === 100);
  assert.equal(a.quality.framesAnalyzed, frames.length);
  assert.equal(a.quality.framesTracked, frames.length);
});

test("el ruido moderado no cambia el conteo", () => {
  const frames = syntheticFrames({ reps: 4, noise: 3, seed: 11 });
  const a = analyzeSquat(frames);
  assert.equal(a.summary.repCount, 4);
});

test("fotogramas perdidos se interpolan sin crear repeticiones falsas", () => {
  const frames = syntheticFrames({ reps: 4 });
  for (const i of [40, 120, 200]) frames[i] = { t: frames[i].t, lm: null };
  const a = analyzeSquat(frames);
  assert.equal(a.summary.repCount, 4);
  assert.ok(a.quality.framesTracked < a.quality.framesAnalyzed);
  assert.ok(a.quality.visibilityPct > 95);
});

test("un temblor de 4° no cuenta como repetición", () => {
  const rand = lcg(3);
  const frames = [];
  for (let i = 0; i < 18 * 10; i++) {
    const t = i / 18;
    const base = 175 - Math.abs(Math.sin(t * 2)) * 4;
    frames.push(frameWithKneeAngle(base + (rand() - 0.5) * 2, t));
  }
  const a = analyzeSquat(frames);
  assert.equal(a.summary.repCount, 0);
});

test("la escala convierte unidades normalizadas en cm con la estatura", () => {
  const frames = syntheticFrames({ reps: 1 });
  const side = chooseKneeSide(frames);
  const cmPerUnit = scaleFromEstatura(frames, side, 175);
  // fémur observado = 0.3; 0.245 × 175 / 0.3 ≈ 142.9
  assert.ok(cmPerUnit > 140 && cmPerUnit < 146, `cmPerUnit ${cmPerUnit}`);
  assert.equal(scaleFromEstatura(frames, side, null), null);
  assert.equal(scaleFromEstatura(frames, side, 300), null);
});

test("la velocidad concéntrica queda en cm/s con estatura y relativa sin ella", () => {
  const frames = syntheticFrames({ reps: 2 });
  const withScale = analyzeSquat(frames, { estaturaCm: 175 });
  assert.equal(withScale.summary.repCount, 2);
  assert.ok(withScale.summary.meanConcentricVel > 5, JSON.stringify(withScale.summary));
  const rel = analyzeSquat(frames);
  assert.ok(rel.summary.meanConcentricVel > 0 && rel.summary.meanConcentricVel < 1);
});

test("la deriva de barra mide el desvío horizontal del recorrido", () => {
  const frames = syntheticFrames({ reps: 1 });
  const straight = analyzeSquat(frames);
  assert.equal(straight.summary.barDriftPct, 0);
  for (const f of frames) {
    for (const i of [IDX.lWrist, IDX.rWrist]) f.lm[i].x += (f.t % 0.4) * 0.06;
  }
  const wob = analyzeSquat(frames);
  assert.ok(wob.summary.barDriftPct > 0);
});

test("los filtros quitan picos de un fotograma", () => {
  assert.deepEqual(medianFilter([5, 100, 5]), [5, 5, 5]);
  assert.deepEqual(medianFilter([170, 171, 30, 172, 171]), [170, 170, 171, 171, 171]);
  const smoothed = smoothSeries([1, 100, 1]);
  assert.ok(smoothed[1] < 60);
  assert.deepEqual(interpolateGaps([1, null, null, 4], 3), [1, 2, 3, 4]);
  const bigGap = interpolateGaps([1, null, null, null, null, null, null, null, 9], 3);
  assert.equal(bigGap[4], null);
  assert.equal(bigGap[7], null);
});

test("segmentReps descarta señales planas y parciales", () => {
  assert.deepEqual(segmentReps(Array(50).fill(170)), []);
  assert.deepEqual(segmentReps([null, null, null]), []);
  const partial = [];
  for (let i = 0; i < 90; i++) partial.push(175 - Math.min(60, i * 2));
  assert.deepEqual(segmentReps(partial), []);
});

test("el fixture real del prototipo produce 6 repeticiones válidas", () => {
  const raw = JSON.parse(readFileSync(new URL("../prototype/fixture.json", import.meta.url), "utf8"));
  const frames = raw.frames.map((f) => ({
    t: f.t,
    lm: f.lm ? f.lm.map(([x, y, z, v]) => ({ x, y, z, visibility: v })) : null,
  }));
  const a = analyzeSquat(frames, { estaturaCm: 175 });
  assert.equal(a.summary.repCount, 6);
  assert.ok(a.summary.avgRomDeg > 80, `ROM media ${a.summary.avgRomDeg}`);
  assert.ok(a.summary.tutMs > 5000, `TUT ${a.summary.tutMs}`);
  assert.ok(a.summary.barDriftPct > 0 && a.summary.barDriftPct < 200);
  assert.ok(a.summary.romConsistencyPct > 50, `consistencia ${a.summary.romConsistencyPct}`);
  for (const rep of a.reps) {
    assert.ok(rep.romDeg > 50, `ROM rep ${rep.romDeg}`);
  }
  // La última rep puede quedar sin velocidad si la persona se aparta de la cámara.
  assert.ok(
    a.reps.filter((r) => r.concentricVel !== null).length >= 5,
    `reps con velocidad: ${a.reps.filter((r) => r.concentricVel !== null).length}`,
  );
});

test("toVideoAnalysis produce un registro que pasa validVideoAnalysis", () => {
  const a = analyzeSquat(syntheticFrames({ reps: 3 }), { estaturaCm: 180 });
  const record = toVideoAnalysis(a, {
    id: "vid-abc123",
    date: "2026-10-29",
    exerciseId: "squat",
    createdAt: Date.now(),
  });
  assert.equal(validVideoAnalysis(record), true);
  assert.equal(record.source, "video");
  assert.equal(record.summary.repCount, 3);
  assert.ok(record.barPath.points.length <= 60);
  assert.equal(record.velocityUnit, "cm");
});

test("validVideoAnalysis rechaza registros dañados", () => {
  const base = () =>
    toVideoAnalysis(analyzeSquat(syntheticFrames({ reps: 1 }), { estaturaCm: 175 }), {
      id: "vid-1",
      date: "2026-10-29",
      exerciseId: "squat",
      createdAt: 0,
    });
  assert.equal(validVideoAnalysis(base()), true);
  const cases = [
    (r) => (r.date = "29-10-2026", r),
    (r) => (r.reps[0].eccentricMs = -5, r),
    (r) => (r.velocityUnit = "km", r),
    (r) => (r.barPath.points.push([0.1, 0.2, 0.3]), r),
    (r) => (r.summary.repCount = 99, r),
    (r) => (r.source = "camara", r),
    (r) => (r.quality.visibilityPct = 150, r),
  ];
  for (const mutate of cases) {
    assert.equal(validVideoAnalysis(mutate(base())), false, mutate.toString());
  }
  assert.equal(validVideoAnalysis(null), false);
  assert.equal(validVideoAnalysis({}), false);
});

test("downsamplePoints reduce a lo sumo al máximo pedido", () => {
  const pts = Array.from({ length: 200 }, (_, i) => ({ x: i / 200, y: i / 200 }));
  assert.equal(downsamplePoints(pts, 60).length, 60);
  assert.equal(downsamplePoints(pts, 300).length, 200);
  assert.deepEqual(downsamplePoints([null, { x: 1, y: 2 }, null]), [{ x: 1, y: 2 }]);
});

test("validState acepta videoAnalyses válidos, opcionales, y rechaza dañados", async () => {
  const { validState } = await import("../dist/core.js");
  const fixture = () => ({
    version: 1,
    goals: { name: "Prueba", kcal: 2200, maintenance: 2500, protein: 150, carbs: 250, fat: 65, weight: 60, sessions: 4, mode: "lose" },
    profile: { age: 30, height: 170, weight: 75, sex: "female", activity: "moderate", mode: "lose" },
    entries: [],
    weights: [],
    sessions: [],
    customFoods: [],
    favorites: [],
  });
  const a = analyzeSquat(syntheticFrames({ reps: 2 }), { estaturaCm: 175 });
  const record = toVideoAnalysis(a, { id: "vid-x1", date: "2026-10-29", exerciseId: "squat", createdAt: Date.now() });

  const empty = fixture();
  assert.equal(validState(empty), true, "sin videoAnalyses sigue siendo válido");

  const good = fixture();
  good.videoAnalyses = [record];
  assert.equal(validState(good), true, "con un análisis válido");

  const badDate = fixture();
  badDate.videoAnalyses = [{ ...record, date: "ayer" }];
  assert.equal(validState(badDate), false, "fecha inválida");

  const badRep = fixture();
  badRep.videoAnalyses = [{ ...record, reps: [...record.reps, { romDeg: -1 }] }];
  assert.equal(validState(badRep), false, "rep dañada");

  const dup = fixture();
  dup.videoAnalyses = [record, { ...record }];
  assert.equal(validState(dup), false, "ids duplicados");
});
