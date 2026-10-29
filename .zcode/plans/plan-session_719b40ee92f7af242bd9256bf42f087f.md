# Análisis de video por fases — Pulso (v1: sentadilla, vista lateral)

**Objetivo v1:** cargar un video (no grabar), procesarlo **100% en el navegador** con pose estimation, y obtener: repeticiones contadas, ROM por repetición, tiempo excéntrico/concéntrico, recorrido de la barra con deriva horizontal, TUT y avisos de calidad. El video nunca sale del dispositivo ni se guarda.

**Decisiones ya tomadas:** sentadilla vista lateral (cubre `squat`, `front-squat`, `goblet-squat`, `hack-squat`); MediaPipe Pose Landmarker Apache 2.0 autohospedado; solo métricas persistidas; video como fuente, no cámara en vivo.

---

## Fase 0 — Puerta técnica: prototipo aislado (≈1 sesión)

Carpeta temporal `prototype/` (fuera de `dist/`, no se publica): un HTML suelto con input de video, MediaPipe vendido, canvas con esqueleto superpuesto y curva de ángulo de rodilla en vivo sobre el video.

- Descargar vendor: `@mediapipe/tasks-vision` (JS + wasm) y `pose_landmarker_lite.task` en `dist/vendor/mediapipe/` — así Fase 0 y el resto comparten los mismos archivos.
- **Gate de decisión:** lo pruebas con 2-3 videos reales tuyos (vista lateral, cuerpo completo). Si el esqueleto es estable y el ángulo de rodilla limpio → continuar. Además, el prototipo exporta un fixture JSON de landmarks reales que servirá para los tests de Fase 1.

## Fase 1 — Motor puro `dist/kinematics.js` + tests (≈2-3 sesiones)

Módulo sin DOM y sin imports (plantilla: `cardio.js`), 100% testeable en Node:

- `smoothSeries()`, `kneeAngle(frame)` (cadera-rodilla-tobillo), `scaleFromEstatura(estaturaCm, frames)` → px/cm vía longitud femoral (~24% de la estatura del perfil; sin estatura → unidades relativas).
- `segmentReps(signal, fps)` — cruces de velocidad con histéresis.
- `analyzeSquat(frames, fps, opts)` → `{ reps: [{ startS, endS, romDeg, minDeg, maxDeg, eccentricMs, concentricMs, pauseMs }], summary: { repCount, avgRomDeg, romConsistencyPct, avgEccentricMs, avgConcentricMs, tutMs, meanConcentricVel, barDrift }, barPath: { puntos reducidos ~60 }, quality: { visibilityPct, framesAnalyzed } }`. Barra = punto medio de muñecas; deriva horizontal en cm si hay escala.
- `validVideoAnalysis(r)` para el estado.
- `tests/kinematics.test.mjs`: curvas sintéticas de sentadilla con ruido (conteo exacto, fases con tolerancia, ROM) + fixture real de Fase 0 + validador.
- `package.json`: añadir `kinematics.js` al script `check`.

**Aceptación:** `npm test` y `npm run check` verdes.

## Fase 2 — Pipeline de video en el navegador (≈2-3 sesiones)

- `dist/video-analyzer.js` (solo navegador, importa el vendor dinámicamente): abre el archivo en un `<video>` oculto, bucle de seek a ~15-20 Hz con timestamps crecientes, `detectForVideo` por frame, barra de progreso y cancelación; devuelve frames de landmarks → `analyzeSquat`.
- `server.mjs`: mime `.wasm`/`.task`.
- `core.js` `validState()` (~:487): rama `videoAnalyses` con el patrón exacto de `cardio` (ids únicos, validador por registro, cap 1000). `undefined` sigue siendo válido → copias viejas intactas.
- `app.js`: `videoAnalyses: []` en `defaults()` (:150); conteo en el resumen de importación (:2088).

**Aceptación:** un video real produce un registro válido end-to-end; import/export de copias sigue funcionando.

## Fase 3 — UI de análisis y resultados (≈2-3 sesiones)

- Sección **"Análisis por video"** en Entrenamiento → Sesión, junto al cardio (idiom de `dayCardioSection`, app.js:585/625): lista de análisis del día + botón nuevo.
- `videoModal()`: instrucciones (vista lateral, cuerpo completo visible, una serie por video, ≤90 s, 1080p), `input accept="video/*"`, progreso, cancelar.
- Pantalla de resultados: cards de resumen (reps, ROM media, tempo exc/con, TUT, deriva de barra), tabla por repetición, SVG del recorrido de barra (idioms `weightPlot`/`patternChart`), avisos de calidad con la voz del producto ("no se ve el cuerpo en el 12% del video", sin juicios, sin diagnóstico).
- Historial de análisis con eliminar vía `confirmModal`. `styles.css` según la skill pulso-visual-design.

**Aceptación:** flujo completo en el móvil (Chrome y Safari), tests verdes.

## Fase 4 — Integración con entrenamiento (≈1-2 sesiones)

- Botón **"Registrar serie"**: crea una serie en la sesión del día con las reps detectadas usando `recordSetReps()` (core.js:114) — semántica `done`/`recordedAt`/`restTimer` intacta; si no hay sesión abierta, ofrece crearla y elegir el ejercicio de sentadilla.
- `exerciseProgress` muestra el último análisis del ejercicio (ROM media, tempo).
- README: sección nueva con límites honestos — no detecta la carga, no diagnostica técnica ni lesión, requiere vista lateral, el video no sale del dispositivo. Actualizar también la skill `pulso-product`.

**Aceptación:** la serie registrada aparece en la sesión con las reps detectadas; export/import la incluye.

## Fase 5 — Después de la v1 (fuera de este ciclo)

Press de banca lateral → cámara en vivo (reutiliza el mismo pipeline) → señales de forma adicionales (valgo necesita vista frontal) → exportación opt-in de landmarks reducidos si quieres sembrar dataset para modelos propios.

---

## Riesgos y mitigaciones

- **Oclusión/pose inestable en vista lateral** → Fase 0 es la puerta: se decide con tus videos reales antes de construir.
- **Móviles medios: 30-70 s de procesamiento por video de 30-60 s** → sampling 15-20 Hz, modelo lite, progreso visible, cancelación.
- **localStorage** → solo métricas compactas, cap 1000 registros; el video y los landmarks crudos nunca se persisten.
- **Repo crece ~15-20 MB** con el vendor → aceptable (archivos < 50 MB), carga perezosa solo al usar la función.
- **Quirks de seek en Safari** → bucle con timeout de respaldo.

**Esfuerzo total estimado:** 8-12 sesiones de trabajo asistido hasta v1 completa.