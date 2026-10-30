// Cinemática de sentadilla a partir de landmarks de MediaPipe Pose (33 puntos).
// Funciones puras: sin DOM ni dependencias. El análisis ocurre sobre fotogramas
// ya extraídos, con la forma { t: segundos, lm: landmark[] | null }.
// Los índices de landmarks usados: cadera 23/24, rodilla 25/26, tobillo 27/28,
// muñeca 15/16.

const VIS_THRESHOLD = 0.5;
// Cadenas articulares por tipo de levantamiento, con índices del modelo de 33
// puntos de MediaPipe. La repetición se segmenta sobre el ángulo de la cadena:
// sentadilla mide la rodilla; press mide el codo.
const LIFT_JOINTS = {
  squat: {
    sides: [
      { chain: [23, 25, 27], name: "izquierdo" },
      { chain: [24, 26, 28], name: "derecho" },
    ],
    scaleRatio: 0.245, // fémur ≈ 24.5% de la estatura
  },
  bench: {
    sides: [
      { chain: [11, 13, 15], name: "izquierdo" },
      { chain: [12, 14, 16], name: "derecho" },
    ],
    scaleRatio: 0.186, // húmero ≈ 18.6% de la estatura
  },
};
const WRISTS = [15, 16];
const THIGH_HEIGHT_RATIO = 0.245;

export const sum = (items, fn) => items.reduce((n, item) => n + fn(item), 0);
const mean = (xs) => (xs.length ? sum(xs, (x) => x) / xs.length : 0);
const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)));
  return sorted[idx];
}

const stdev = (xs) => {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(sum(xs, (x) => (x - m) ** 2) / (xs.length - 1));
};

export const deg = (rad) => (rad * 180) / Math.PI;

// Ángulo en el vértice b entre los puntos a y c, en grados 0-180.
export function jointAngle(a, b, c) {
  const v1 = [a.x - b.x, a.y - b.y];
  const v2 = [c.x - b.x, c.y - b.y];
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const m = Math.hypot(v1[0], v1[1]) * Math.hypot(v2[0], v2[1]);
  return m === 0 ? 180 : deg(Math.acos(Math.min(1, Math.max(-1, dot / m))));
}

const visible = (p) => p && (p.visibility === undefined || p.visibility >= VIS_THRESHOLD);

function sideScore(frames, side) {
  return sum(frames, (f) => {
    if (!f.lm) return 0;
    return side.chain.reduce((n, i) => n + (f.lm[i] ? f.lm[i].visibility ?? 1 : 0), 0);
  });
}

// Elige el lado con mejor visibilidad agregada y lo devuelve con su nombre.
export function chooseKneeSide(frames) {
  const sides = LIFT_JOINTS.squat.sides;
  const left = sideScore(frames, sides[0]);
  const right = sideScore(frames, sides[1]);
  const side = left >= right ? sides[0] : sides[1];
  return { ...side, chain: [...side.chain] };
}

// Serie de ángulos de la cadena articular por fotograma; null cuando no se ve.
export function kneeAngles(frames, side = null) {
  const s = side || chooseKneeSide(frames);
  return frames.map((f) => {
    if (!f.lm) return null;
    const [a, b, c] = s.chain;
    const p1 = f.lm[a];
    const p2 = f.lm[b];
    const p3 = f.lm[c];
    if (!visible(p1) || !visible(p2) || !visible(p3)) return null;
    return jointAngle(p1, p2, p3);
  });
}

// Filtro de mediana de ventana 3: elimina picos de un fotograma sin suavizar el ritmo.
// En los bordes, con ventana par, toma el valor bajo para no amplificar el pico.
export function medianFilter(xs) {
  return xs.map((_, i) => {
    const window = [xs[i - 1], xs[i], xs[i + 1]].filter((v) => v !== null && v !== undefined);
    if (!window.length) return null;
    const sorted = [...window].sort((a, b) => a - b);
    return sorted[Math.floor((sorted.length - 1) / 2)];
  });
}

// Media móvil centrada; los null se omiten del promedio.
export function smoothSeries(values, halfWindow = 2) {
  return values.map((_, i) => {
    let total = 0;
    let n = 0;
    for (let j = i - halfWindow; j <= i + halfWindow; j++) {
      const v = values[j];
      if (v === null || v === undefined) continue;
      total += v;
      n++;
    }
    return n ? total / n : null;
  });
}

// Rellena huecos cortos (≤ maxGap) por interpolación lineal entre vecinos válidos.
export function interpolateGaps(xs, maxGap = 6) {
  const out = [...xs];
  let i = 0;
  while (i < out.length) {
    if (out[i] !== null) {
      i++;
      continue;
    }
    let end = i;
    while (end < out.length && out[end] === null) end++;
    const prev = out[i - 1];
    const next = out[end];
    const gap = end - i;
    if (prev !== undefined && prev !== null && next !== undefined && next !== null && gap <= maxGap) {
      for (let k = i; k < end; k++) {
        const w = (k - i + 1) / (gap + 1);
        out[k] = prev + (next - prev) * w;
      }
    }
    i = end;
  }
  return out;
}

// Punto de agarre aproximado: punto medio de las muñecas visibles. Si una sola
// muñeca supera el umbral (agarre a una mano u oclusión), se usa esa.
export function barPoints(frames) {
  return frames.map((f) => {
    if (!f.lm) return null;
    const lw = visible(f.lm[WRISTS[0]]) ? f.lm[WRISTS[0]] : null;
    const rw = visible(f.lm[WRISTS[1]]) ? f.lm[WRISTS[1]] : null;
    if (!lw && !rw) return null;
    if (lw && rw) return { x: (lw.x + rw.x) / 2, y: (lw.y + rw.y) / 2 };
    const w = lw || rw;
    return { x: w.x, y: w.y };
  });
}

// Rellena huecos del recorrido: en el fondo de la sentadilla la pesa suele ocluir
// las muñecas y su visibilidad cae unos instantes, pero la barra apenas se mueve.
export function interpolateBarPath(points, maxGap = 12) {
  const xs = interpolateGaps(points.map((p) => (p === null ? null : p.x)), maxGap);
  const ys = interpolateGaps(points.map((p) => (p === null ? null : p.y)), maxGap);
  return points.map((_, i) => (xs[i] === null || ys[i] === null ? null : { x: xs[i], y: ys[i] }));
}

// Convierte unidades normalizadas del video en centímetros usando el segmento
// proximal observado (fémur o húmero) y la estatura del perfil. Devuelve null si
// el rastreo es malo o no hay estatura; en ese caso las velocidades quedan en
// unidades relativas.
export function scaleFromEstatura(frames, side, estaturaCm, scaleRatio = THIGH_HEIGHT_RATIO) {
  if (!estaturaCm || estaturaCm < 100 || estaturaCm > 250) return null;
  const lengths = [];
  const [a, b] = side.chain;
  for (const f of frames) {
    if (!f.lm) continue;
    const p1 = f.lm[a];
    const p2 = f.lm[b];
    if (!visible(p1) || !visible(p2)) continue;
    const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    if (d > 0.02 && d < 1) lengths.push(d);
  }
  if (lengths.length < Math.max(5, frames.length * 0.1)) return null;
  const cmPerUnit = (scaleRatio * estaturaCm) / mean(lengths);
  if (!isFinite(cmPerUnit) || cmPerUnit <= 0) return null;
  return round(cmPerUnit, 2);
}

// Segmenta repeticiones sobre la señal de ángulos con histéresis:
// baja desde la zona alta, confirma fondo y cuenta la subida hasta casi extender.
// Devuelve índices { start, bottom, end } sobre la serie provista.
export function segmentReps(angles, { minRomDeg = 25, } = {}) {
  const valid = angles.filter((a) => a !== null).sort((a, b) => a - b);
  if (valid.length < 8) return [];
  const lo = percentile(valid, 0.05);
  const hi = percentile(valid, 0.95);
  const range = hi - lo;
  if (range < minRomDeg) return [];
  // Frontera única de la zona alta: se considera que la persona volvió a extenderse
  // por encima de ella, y que empezó a bajar cuando la cruza hacia abajo.
  const topReturn = lo + range * 0.88;

  const reps = [];
  let start = -1;
  let bottom = -1;
  let armed = true; // evita armar una bajada mientras todavía sube de la rep anterior
  let i = 0;
  while (i < angles.length) {
    const a = angles[i];
    if (a === null) {
      i++;
      continue;
    }
    if (start < 0) {
      if (!armed) {
        if (a >= topReturn) armed = true;
      } else if (a < topReturn) {
        start = i;
        bottom = i;
      }
      i++;
      continue;
    }
    if (a < angles[bottom]) bottom = i;
    // Falsa alarma: bajó de la zona alta pero volvió a extenderse sin llegar al fondo.
    if (a >= topReturn) {
      start = -1;
      bottom = -1;
      i++;
      continue;
    }
    // El fondo se confirma cuando el ángulo vuelve a subir de la zona baja.
    if (a > angles[bottom] + range * 0.08 && angles[bottom] < lo + range * 0.35) {
      let end = -1;
      for (let j = i; j < angles.length; j++) {
        if (angles[j] === null) continue;
        if (angles[j] >= topReturn) {
          end = j;
          break;
        }
        if (angles[j] < angles[bottom]) {
          // Volvió a bajar antes de subir: el fondo era prematuro, seguir buscando.
          bottom = j;
        }
      }
      if (end > bottom) {
        const rom = Math.max(...angles.slice(Math.max(0, start - 2), bottom + 1)) - angles[bottom];
        if (rom >= range * 0.45) reps.push({ start, bottom, end });
        i = end; // reanudar desde la vuelta arriba, no desde el fondo
        start = -1;
        bottom = -1;
        armed = false;
        continue;
      }
      start = -1;
      bottom = -1;
    }
    i++;
  }
  return reps;
}

// Reduce la trayectoria a un máximo de puntos para persistirla compacta.
export function downsamplePoints(points, max = 60) {
  const tracked = points.filter((p) => p !== null);
  if (tracked.length <= max) return tracked;
  const step = tracked.length / max;
  const out = [];
  for (let i = 0; i < max; i++) out.push(tracked[Math.floor(i * step)]);
  return out;
}

export function analyzeLift(frames, { estaturaCm = null, kind = "squat" } = {}) {
  const joints = LIFT_JOINTS[kind] || LIFT_JOINTS.squat;
  const left = sideScore(frames, joints.sides[0]);
  const right = sideScore(frames, joints.sides[1]);
  const chosen = left >= right ? joints.sides[0] : joints.sides[1];
  const side = { ...chosen, chain: [...chosen.chain] };
  const raw = kneeAngles(frames, side);
  const angles = interpolateGaps(smoothSeries(medianFilter(raw), 2), 6);
  const times = frames.map((f) => f.t);
  const fps =
    times.length > 1
      ? round(1 / Math.max(0.001, median(times.slice(1).map((t, i) => t - times[i]))), 2)
      : 0;
  const durationS = times.length ? round(times[times.length - 1], 2) : 0;

  const segments = segmentReps(angles);
  const bars = interpolateBarPath(barPoints(frames), 12);
  const cmPerUnit = estaturaCm ? scaleFromEstatura(frames, side, estaturaCm, joints.scaleRatio) : null;

  // Barra en el fotograma pedido; si esa muñeca no se ve, busca el punto válido más próximo.
  const barAt = (idx, maxOff = 10) => {
    for (let off = 0; off <= maxOff; off++) {
      const a = bars[idx - off];
      const b = bars[idx + off];
      if (a) return a;
      if (b) return b;
      if (idx - off < 0 && idx + off >= bars.length) break;
    }
    return null;
  };

  const reps = segments.map((seg, k) => {
    // El máximo se busca desde la vuelta arriba de la rep anterior: ahí está la
    // extensión completa, no solo el instante en que cruzó la zona alta.
    const searchFrom = k === 0 ? 0 : segments[k - 1].end;
    const approach = angles.slice(searchFrom, seg.bottom + 1);
    const maxDeg = Math.max(...approach.filter((v) => v !== null));
    const minDeg = angles[seg.bottom];
    // Pausa: tiempo en el fondo antes de que el ángulo suba de forma sostenida.
    let riseIdx = seg.bottom + 1;
    while (
      riseIdx < seg.end &&
      angles[riseIdx] !== null &&
      angles[riseIdx] < minDeg + (maxDeg - minDeg) * 0.08
    ) {
      riseIdx++;
    }
    const pauseMs = Math.max(0, Math.round((times[riseIdx - 1] - times[seg.bottom]) * 1000));
    const eccMs = Math.max(0, Math.round((times[seg.bottom] - times[seg.start]) * 1000));
    const conMs = Math.max(0, Math.round((times[seg.end] - times[seg.bottom]) * 1000));
    const barBottom = barAt(seg.bottom);
    const barEnd = barAt(seg.end);
    let conVel = null;
    if (barBottom && barEnd) {
      const rise = barBottom.y - barEnd.y; // y crece hacia abajo: subir la barra la reduce
      if (rise > 0) {
        const seconds = (times[seg.end] - times[seg.bottom]) || 1e-6;
        conVel = cmPerUnit ? round((rise * cmPerUnit) / seconds, 2) : round(rise / seconds, 3);
      }
    }
    return {
      romDeg: round(maxDeg - minDeg),
      minDeg: round(minDeg),
      maxDeg: round(maxDeg),
      eccentricMs: eccMs,
      concentricMs: conMs,
      pauseMs,
      concentricVel: conVel,
    };
  });

  const roms = reps.map((r) => r.romDeg);
  const avgRom = mean(roms);
  const consistency = roms.length > 1 ? Math.max(0, round(100 * (1 - stdev(roms) / avgRom))) : null;

  const tracked = bars.filter((p) => p !== null);
  let barDriftPct = null;
  if (tracked.length > 4) {
    const xs = tracked.map((p) => p.x);
    const ys = tracked.map((p) => p.y);
    const xRange = Math.max(...xs) - Math.min(...xs);
    const yRange = Math.max(...ys) - Math.min(...ys);
    barDriftPct = yRange > 0 ? round((xRange / yRange) * 100) : null;
  }

  const visByFrame = frames.map((f) => {
    if (!f.lm) return 0;
    const idx = [...side.chain, ...WRISTS];
    return mean(idx.map((i) => (f.lm[i] ? f.lm[i].visibility ?? 1 : 0)));
  });
  const framesTracked = visByFrame.filter((v) => v > 0).length;

  return {
    kind,
    side: side.name,
    fps,
    durationS,
    reps,
    summary: {
      repCount: reps.length,
      avgRomDeg: reps.length ? round(avgRom) : 0,
      romConsistencyPct: consistency,
      avgEccentricMs: reps.length ? Math.round(mean(reps.map((r) => r.eccentricMs))) : 0,
      avgConcentricMs: reps.length ? Math.round(mean(reps.map((r) => r.concentricMs))) : 0,
      tutMs: reps.length ? Math.round(sum(reps, (r) => r.eccentricMs + r.concentricMs)) : 0,
      meanConcentricVel:
        reps.length && reps.some((r) => r.concentricVel !== null)
          ? round(mean(reps.filter((r) => r.concentricVel !== null).map((r) => r.concentricVel)), 2)
          : null,
      barDriftPct,
    },
    barPath: { points: downsamplePoints(bars).map((p) => [round(p.x, 4), round(p.y, 4)]) },
    quality: {
      visibilityPct: round(mean(visByFrame) * 100),
      framesAnalyzed: frames.length,
      framesTracked,
    },
    scaleCmPerUnit: cmPerUnit,
  };
}

// La sentadilla es el caso particular de medir la rodilla.
export function analyzeSquat(frames, opts = {}) {
  return analyzeLift(frames, { ...opts, kind: "squat" });
}

function median(xs) {
  const sorted = [...xs].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

// Convierte un análisis en el registro compacto que vive en el estado.
export function toVideoAnalysis(analysis, { id, date, exerciseId, createdAt }) {
  return {
    id,
    date,
    exerciseId,
    source: "video",
    kind: analysis.kind === "bench" ? "bench" : "squat",
    fps: analysis.fps,
    durationS: analysis.durationS,
    reps: analysis.reps.map((r) => ({
      romDeg: r.romDeg,
      minDeg: r.minDeg,
      maxDeg: r.maxDeg,
      eccentricMs: r.eccentricMs,
      concentricMs: r.concentricMs,
      pauseMs: r.pauseMs,
    })),
    summary: {
      repCount: analysis.summary.repCount,
      avgRomDeg: analysis.summary.avgRomDeg,
      romConsistencyPct: analysis.summary.romConsistencyPct,
      avgEccentricMs: analysis.summary.avgEccentricMs,
      avgConcentricMs: analysis.summary.avgConcentricMs,
      tutMs: analysis.summary.tutMs,
      meanConcentricVel: analysis.summary.meanConcentricVel,
      barDriftPct: analysis.summary.barDriftPct,
    },
    velocityUnit: analysis.scaleCmPerUnit ? "cm" : "rel",
    barPath: { points: analysis.barPath.points },
    quality: analysis.quality,
    createdAt,
  };
}

const num = (v, min, max) =>
  typeof v === "number" && isFinite(v) && v >= min && v <= max;

const repCheck = (r) =>
  r &&
  typeof r === "object" &&
  num(r.romDeg, 0, 360) &&
  num(r.minDeg, 0, 360) &&
  num(r.maxDeg, 0, 360) &&
  num(r.eccentricMs, 0, 60000) &&
  num(r.concentricMs, 0, 60000) &&
  num(r.pauseMs, 0, 60000);

// Validador del registro persistido, al estilo de validCardioRecord.
export function validVideoAnalysis(r) {
  return (
    Boolean(r) &&
    typeof r === "object" &&
    typeof r.id === "string" &&
    r.id.length > 0 &&
    r.id.length <= 40 &&
    typeof r.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(r.date) &&
    typeof r.exerciseId === "string" &&
    r.exerciseId.length > 0 &&
    r.exerciseId.length <= 60 &&
    r.source === "video" &&
    (r.kind === undefined || r.kind === "squat" || r.kind === "bench") &&
    num(r.fps, 0.5, 120) &&
    num(r.durationS, 0, 600) &&
    Array.isArray(r.reps) &&
    r.reps.length <= 200 &&
    r.reps.every(repCheck) &&
    r.summary &&
    typeof r.summary === "object" &&
    r.summary.repCount === r.reps.length &&
    num(r.summary.repCount, 0, 200) &&
    num(r.summary.avgRomDeg, 0, 360) &&
    (r.summary.romConsistencyPct === null || num(r.summary.romConsistencyPct, 0, 100)) &&
    num(r.summary.avgEccentricMs, 0, 60000) &&
    num(r.summary.avgConcentricMs, 0, 60000) &&
    num(r.summary.tutMs, 0, 3.6e6) &&
    (r.summary.meanConcentricVel === null || num(r.summary.meanConcentricVel, 0, 10000)) &&
    (r.summary.barDriftPct === null || num(r.summary.barDriftPct, 0, 1000)) &&
    (r.velocityUnit === "cm" || r.velocityUnit === "rel") &&
    r.barPath &&
    Array.isArray(r.barPath.points) &&
    r.barPath.points.length <= 120 &&
    r.barPath.points.every(
      (p) =>
        Array.isArray(p) &&
        p.length === 2 &&
        num(p[0], -1, 2) &&
        num(p[1], -1, 2),
    ) &&
    r.quality &&
    num(r.quality.visibilityPct, 0, 100) &&
    num(r.quality.framesAnalyzed, 0, 1e6) &&
    num(r.quality.framesTracked, 0, 1e6) &&
    num(r.createdAt, 0, Infinity)
  );
}
