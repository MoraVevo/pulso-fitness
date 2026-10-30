// Pipeline de análisis por video en el navegador. Carga MediaPipe Pose bajo
// demanda, recorre el video por seeks y devuelve el análisis puro de kinematics.js.
// El archivo elegido nunca sale del dispositivo: se procesa con un elemento de
// video local y no se guarda ni se envía a ningún servidor.
import { analyzeLift } from "./kinematics.js";

// Rutas relativas para funcionar también desde la subruta del repositorio.
const VENDOR = "./vendor/mediapipe";
const SAMPLE_HZ = 15;
const MAX_SECONDS = 120;
const VIS_THRESHOLD = 0.4;

// Conexiones del esqueleto dibujadas sobre el video (subconjunto suficiente
// para lectura de postura; índices del modelo de 33 puntos de MediaPipe).
const POSE_PAIRS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
  [24, 26], [26, 28], [27, 31], [28, 32], [0, 11], [0, 12],
];

const visible = (p) => p && (p.visibility === undefined || p.visibility >= VIS_THRESHOLD);

// Dibuja esqueleto, articulaciones y rastro de barra sobre el canvas.
export function drawPoseFrame(ctx, lm, trail = []) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  if (trail.length > 1) {
    ctx.strokeStyle = "rgba(223,155,108,0.9)";
    ctx.lineWidth = Math.max(1.5, w / 300);
    ctx.lineJoin = "round";
    ctx.beginPath();
    trail.forEach((p, i) => (i ? ctx.lineTo(p.x * w, p.y * h) : ctx.moveTo(p.x * w, p.y * h)));
    ctx.stroke();
  }
  if (!lm) return;
  const X = (p) => p.x * w;
  const Y = (p) => p.y * h;
  ctx.strokeStyle = "rgba(49,91,70,0.92)";
  ctx.lineWidth = Math.max(2, w / 180);
  ctx.lineCap = "round";
  for (const [a, b] of POSE_PAIRS) {
    if (!visible(lm[a]) || !visible(lm[b])) continue;
    ctx.beginPath();
    ctx.moveTo(X(lm[a]), Y(lm[a]));
    ctx.lineTo(X(lm[b]), Y(lm[b]));
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(246,247,243,0.95)";
  for (const p of lm) {
    if (!visible(p)) continue;
    ctx.beginPath();
    ctx.arc(X(p), Y(p), Math.max(2.2, w / 220), 0, Math.PI * 2);
    ctx.fill();
  }
  // Punto de la barra: punto medio de las muñecas visibles.
  const lw = lm[15];
  const rw = lm[16];
  const grip = visible(lw) && visible(rw)
    ? { x: (lw.x + rw.x) / 2, y: (lw.y + rw.y) / 2 }
    : visible(lw)
      ? lw
      : visible(rw)
        ? rw
        : null;
  if (grip) {
    ctx.fillStyle = "#df9b6c";
    ctx.beginPath();
    ctx.arc(X(grip), Y(grip), Math.max(3.5, w / 150), 0, Math.PI * 2);
    ctx.fill();
  }
}

let landmarkerPromise = null;

async function ensureLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await import(`${VENDOR}/vision_bundle.mjs`);
      const files = await vision.FilesetResolver.forVisionTasks(`${VENDOR}/wasm`);
      const make = (delegate) =>
        vision.PoseLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath: `${VENDOR}/models/pose_landmarker_lite.task`, delegate },
          runningMode: "VIDEO",
          numPoses: 1,
        });
      try {
        return await make("GPU");
      } catch {
        return await make("CPU");
      }
    })();
    landmarkerPromise.catch(() => {
      landmarkerPromise = null;
    });
  }
  return landmarkerPromise;
}

export async function loadVideoAnalyzer() {
  return ensureLandmarker();
}

// Buscar un instante esperando datos decodificados: "seeked" puede dispararse antes
// de que el fotograma exista si el video aún no tiene búfer.
function seekTo(video, t) {
  const target = Math.min(t, video.duration - 0.001);
  return (async () => {
    if (video.readyState < 2) {
      await new Promise((resolve) => {
        const ok = () =>
          video.readyState >= 2 ? resolve() : video.addEventListener("canplay", ok, { once: true });
        ok();
        setTimeout(resolve, 4000);
      });
    }
    await new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        video.removeEventListener("seeked", done);
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(done, 1500);
      video.addEventListener("seeked", done);
      video.currentTime = target;
    });
  })();
}

// Analiza el archivo y devuelve { analysis, replay }. replay permite volver a ver
// el video con el mapeo dibujado mientras la pestaña viva; release() libera el
// blob y el elemento. Si mount se entrega, el video se muestra en ese contenedor
// en lugar de procesarse oculto.
export async function analyzeVideoFile(
  file,
  {
    onProgress = () => {},
    onFrame = null,
    shouldCancel = () => false,
    estaturaCm = null,
    kind = "squat",
    mount = null,
  } = {},
) {
  const landmarker = await ensureLandmarker();
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.preload = "auto";
  video.setAttribute("playsinline", "");
  const overlay = document.createElement("canvas");

  if (mount) {
    // Visible dentro del contenedor: los navegadores pueden congelar la
    // decodificación de un video sin componer y los seeks repetirían fotograma.
    video.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000";
    overlay.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
    mount(video, overlay);
  } else {
    video.style.cssText =
      "position:fixed;left:0;bottom:0;width:2px;height:2px;opacity:0.01;pointer-events:none;z-index:-1";
    document.body.appendChild(video);
  }

  const frames = [];
  const trail = [];

  const release = () => {
    video.removeAttribute("src");
    video.load();
    video.remove();
    overlay.remove();
    URL.revokeObjectURL(url);
  };

  try {
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = () => reject(new Error("video"));
      video.src = url;
    });
    if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error("duration");
    if (video.duration > MAX_SECONDS) throw new Error("long");
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    if (video.readyState < 2) {
      await new Promise((resolve) => {
        video.addEventListener("canplay", resolve, { once: true });
        setTimeout(resolve, 8000);
      });
    }

    const step = 1 / SAMPLE_HZ;
    let lastTs = 0;
    for (let t = 0; t < video.duration; t += step) {
      if (shouldCancel()) throw new Error("cancel");
      await seekTo(video, t);
      const ts = Math.max(lastTs + 1, Math.round(t * 1000));
      lastTs = ts;
      let lm = null;
      try {
        const res = landmarker.detectForVideo(video, ts);
        lm = res.landmarks && res.landmarks[0] ? res.landmarks[0] : null;
      } catch {
        lm = null;
      }
      // Rastro de barra acumulado con la misma regla que el motor.
      if (lm) {
        const lw = lm[15];
        const rw = lm[16];
        if (visible(lw) && visible(rw)) trail.push({ x: (lw.x + rw.x) / 2, y: (lw.y + rw.y) / 2 });
        else if (visible(lw)) trail.push({ x: lw.x, y: lw.y });
        else if (visible(rw)) trail.push({ x: rw.x, y: rw.y });
      }
      frames.push({ t, lm });
      if (onFrame) onFrame(lm, trail.slice());
      frames[frames.length - 1].barCount = trail.length;
      onProgress(Math.min(1, t / video.duration));
    }
    const analysis = analyzeLift(frames, { estaturaCm, kind });
    return {
      analysis,
      replay: { video, overlay, frames, trail, release },
    };
  } catch (err) {
    release();
    throw err;
  }
}
