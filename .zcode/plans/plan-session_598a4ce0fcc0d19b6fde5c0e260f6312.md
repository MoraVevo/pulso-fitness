# Explorador de progreso por patrón de movimiento, con métricas de lectura profesional

## Objetivo

Que "Mi progreso → Fuerza y volumen" responda de un vistazo: *¿estoy progresando en Jale? ¿cuánto? ¿qué ejercicios empujan eso?* Todo explorado por patrón (Empuje · Jale · Pierna · Core · Cardio), con métricas tal como las registran los profesionales y la literatura, y lectura interpretativa en lenguaje llano.

## Fundamento (cómo se mide esto "en la ciencia")

1. **Volumen semanal (tonelaje)** = Σ carga × reps de series hechas. Es el "volume load" clásico de la investigación en fuerza.
2. **Series efectivas por semana** = series con RIR ≤ 3. La dosis de entrenamiento en la literatura se cuenta en "hard sets" semanales por grupo/patrón (meta-análisis de Schoenfeld, Ogborn y Krieger, 2017). La app ya registra RIR; su convención documentada es **RIR vacío = 0 (al fallo)**, así que esas series cuentan como efectivas — se mantendrá la convención y se explicará junto a la métrica.
3. **1RM estimado (e1RM)** por la **fórmula de Epley**: `kg × (1 + reps/30)`, fiable hasta ~10 repeticiones efectivas; con RIR conocido se usa `kg × (1 + (reps + RIR)/30)` (RPE ≈ 10 − RIR). Es el estándar que usan entrenadores basados en evidencia para leer progresión cuando cambian cargas y repeticiones (revisión de la relación reps–%1RM: Nuzzo et al., 2023). Se mostrará siempre como **estimación orientativa**, nunca como un 1RM medido.
4. **Comparación por bloques**: últimas 4 semanas vs 4 anteriores, expresada en % con palabra de lectura (subió/estable/bajó/sin datos suficientes). Es el mismo patrón que ya usa `weightStats` (media últimos 7 días vs 8–14 días, `core.js:220`).
5. **Cardio**: minutos semanales con **línea de referencia de 150 min/semana** (OMS 2020: 150–300 min moderados para adultos 19–64, misma población que ya cubre el Compendio). Sin juicios, solo referencia citada.

Límite deliberado del producto: **nada de alertas de fatiga/sobreentrenamiento ni zonas de riesgo** — el skill de producto lo prohíbe con totales de series; el explorador describe lo registrado, no diagnostica.

## Cálculos nuevos — `dist/core.js` (puros, sin DOM, testeables)

```js
// Epley ajustado por RIR; null si reps vacía o (reps+RIR) > 12 (fuera de fiabilidad).
export const e1RM = (kg, reps, rir = 0) => ...;

// Serie efectiva: done && RIR <= 3 (vacío cuenta 0, convención existente).
export const isEffectiveSet = (set) => ...;

// Núcleo del explorador. 8 cubetas de 7 días terminando en endDate
// ([end-6..end], [end-13..end-7], ...). Clasifica por ex.movement
// ("push"|"pull"|"legs"|"core" — makeExercise ya lo guarda, app.js:1529).
export function patternProgress(sessions, cardioRecords, endDate) {
  return {
    weeks: [ { start, end, sessions, sets, effectiveSets, volume, hasData } ×8 ],  // hasData=false si 0 series: no se pinta como cero
    summary: { sets: {last4, prev4, deltaPct|null}, effectiveSets: {...}, volume: {...} },
    exercises: [ { exerciseId, name, sessions, sets, volume,
                   e1RM: { best, bestDate, prevBest, deltaPct|null, isPR } } ],  // solo ejercicios con ≥1 serie en el horizonte
    cardio: { weeks: [{minutes, kcal, hasData}], last4, prev4, deltaPct },
  };
}

// "subió" | "estable" | "bajó" | null — umbral ±5%, null si no hay base comparable.
export const trendWord = (deltaPct) => ...;
```

- Sin **ningún campo nuevo persistido**: todo se deriva de registros existentes → compatibilidad de backups intacta.
- Registros sin `movement` (muy viejos) se omiten del patrón y el UI lo nota.

## UI — `dist/app.js`

**1. Explorador (tarjeta nueva, ancho completo) en `progressPage()`, pestaña "strength"** (entre `metrics()` y el `grid-2` actual, app.js:1018-1023):

- **Chips** Empuje · Jale · Pierna · Core · Cardio (estilo `.tabs` compacto); estado en variable de módulo `progressPattern` (default `"pull"`, tu ejemplo); click → render (`data-action="progress-pattern"` en el switch de acciones).
- **Cabecera de métricas** (rejilla tipo `.metrics-4`): Series efectivas/semana · Volumen semanal · Sesiones del patrón · Mejor e1RM del patrón (con fecha). Cada una con Δ% vs 4 semanas previas y palabra de `trendWord` como badge (▲ verde / ▼ naranja / — gris, reusando tags existentes).
- **Gráfica semanal SVG** siguiendo las convenciones de `weightPlot` (app.js:1027): línea + puntos + área suave, hueco visible en semanas sin registros (nunca cero pintado), etiquetas de rango de fechas debajo, y en Cardio la línea de referencia de 150 min con su cita.
- **Lista de ejercicios del patrón**: nombre · sesiones · series · volumen total · mejor e1RM con ▲/▼ frente al mejor de las 4 semanas previas y badge "PR" cuando la última sesión superó el máximo del horizonte. Estado vacío con CTA a crear sesión.
- **Nota de método** (`.source-note`): qué es una serie efectiva (RIR ≤ 3, vacío = 0), qué es el e1RM (Epley, orientativo, fiable ≤10 reps), y cita de fuentes. Cardio añade la referencia OMS 2020 + Compendio 2024 (ya citado en la app).

**2. "Progreso por ejercicio" (existente) vuelve interpretable**: sobre las filas actuales de `exerciseProgress()` (app.js:1048), se añade por fila un badge Δ de e1RM frente a la sesión anterior (▲/▼ con kg) y badge "PR" cuando esa sesión marcó el mejor e1RM del histórico del ejercicio; y un resumen de cabecera: "Mejor e1RM: X kg · ▲ +Y% en 8 semanas". El select ya re-renderiza solo (app.js:1200).

## CSS — `dist/styles.css`

Mínimo y con tokens existentes: `.pattern-chips` (variación de `.tabs`), `.trend-badge` (▲/▼/—, verde/naranja/gris de la paleta), `.pattern-metrics` (rejilla 2×2 móvil, 4 columnas escritorio), ajuste de la gráfica reutilizando medidas de `.weight-plot`. Nada de gradientes ni sombras nuevas.

## Tests — `tests/core.test.mjs` (estilo `exerciseSession` existente)

- `e1RM`: Epley puro (100×8 → 126,7), con RIR (100×6, RIR 2 → 126,7), reps vacía → null, (reps+RIR) > 12 → null.
- `patternProgress`: cubetas de 7 días correctas; semana sin datos → `hasData:false`; RIR 5 no cuenta efectiva, RIR 2 sí, vacío sí; deltas last4/prev4; mejor e1RM por ejercicio y PR; minutos de cardio por cubeta; no muta los registros de entrada.
- `trendWord`: umbrales ±5% y null sin datos.

## Fases de implementación (cuando apruebes)

1. `core.js`: `e1RM`, `isEffectiveSet`, `patternProgress`, `trendWord` + tests (46 → ~52).
2. `app.js`: explorador con chips/métricas/gráfica/lista + handler del switch.
3. `app.js`: badges Δ/PR en "Progreso por ejercicio".
4. `styles.css`: chips, badges, rejilla y gráfica.
5. Verificación en navegador (390 y 1280, con datos demo poblados), como en las rondas anteriores.

Fuentes del fundamento: [Nuzzo et al. 2023 — reps-%1RM (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10933212), [Fórmula de Epley (Strongineering)](https://strongineering.com/tools/1rm-calculator), [e1RM con RPE/RIR (Neart Strength Systems)](https://www.neartstrengthsystems.com/one-rep-max-calculator), [Guía Epley (MaxCalculator)](https://maxcalculator.com/guides/epley-formula); Schoenfeld, Ogborn y Krieger (2017) sobre dosis en series semanales, y OMS 2020 (150–300 min/semana) se citarán en la nota de método de la app.