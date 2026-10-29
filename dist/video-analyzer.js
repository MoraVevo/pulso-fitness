// Pipeline de análisis por video en el navegador. Carga MediaPipe Pose bajo
// demanda, recorre el video por seeks y devuelve el análisis puro de kinematics.js.
// El archivo elegido nunca sale del dispositivo: se procesa con un elemento de
// video local y no se guarda ni se envía a ningún servidor.
import { analyzeSquat } from "./kinematics.js";

// Rutas relativas para funcionar también desde la subruta del repositorio.
const VENDOR = "./vendor/mediapipe";
const SAMPLE_HZ = 15;
const MAX_SECONDS = 120;

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

export async function loadVideoAnalyzer() {
  return ensureLandmarker();
}

export async function analyzeVideoFile(
  file,
  { onProgress = () => {}, shouldCancel = () => false, estaturaCm = null } = {},
) {
  const landmarker = await ensureLandmarker();
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.preload = "auto";
  video.setAttribute("playsinline", "");
  // Visible pero imperceptible: si el elemento no se compone, algunos navegadores
  // congelan la decodificación y los seeks devuelven siempre el mismo fotograma.
  video.style.cssText =
    "position:fixed;left:0;bottom:0;width:2px;height:2px;opacity:0.01;pointer-events:none;z-index:-1";
  document.body.appendChild(video);
  try {
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = () => reject(new Error("video"));
      video.src = url;
    });
    if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error("duration");
    if (video.duration > MAX_SECONDS) throw new Error("long");
    if (video.readyState < 2) {
      await new Promise((resolve) => {
        video.addEventListener("canplay", resolve, { once: true });
        setTimeout(resolve, 8000);
      });
    }

    const step = 1 / SAMPLE_HZ;
    const frames = [];
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
      frames.push({ t, lm });
      onProgress(Math.min(1, t / video.duration));
    }
    return analyzeSquat(frames, { estaturaCm });
  } finally {
    video.removeAttribute("src");
    video.load();
    video.remove();
    URL.revokeObjectURL(url);
  }
}
