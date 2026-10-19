import {
  sum,
  localDate,
  shiftDate,
  weekDays,
  mealTotals,
  completedSets,
  sessionVolume,
  trainingStats,
  trainingDays,
  weightStats,
  validState,
} from "./core.js";
import {
  exercises,
  muscleNames,
  exerciseMuscles,
  canonicalMuscle,
} from "./exercises.js";

const $ = (s) => document.querySelector(s);
const fmt = (n, decimals = 0) =>
  Number(n).toLocaleString("es-GT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const uid = () => crypto.randomUUID();
const normalize = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const today = () => localDate();
const meals = ["Desayuno", "Almuerzo", "Cena", "Snacks"];
const mealEmoji = { Desayuno: "🍳", Almuerzo: "🥗", Cena: "🍲", Snacks: "🍎" };
const mealTime = {
  Desayuno: "Tu primera energía del día",
  Almuerzo: "Una pausa para recargar",
  Cena: "Cierra tu día a tu manera",
  Snacks: "Pequeños momentos, también cuentan",
};
const routines = [
  {
    name: "Torso · Empuje",
    note: "Pecho, hombros y tríceps",
    ids: ["bench", "incline", "ohp", "lateral", "triceps"],
  },
  {
    name: "Torso · Tirón",
    note: "Espalda y bíceps",
    ids: ["pulldown", "row", "cable-row", "curl", "hammer"],
  },
  {
    name: "Pierna",
    note: "Cuádriceps, glúteos e isquiotibiales",
    ids: ["squat", "rdl", "legpress", "legcurl", "calf"],
  },
  {
    name: "Cuerpo completo",
    note: "Una sesión para todo el cuerpo",
    ids: ["squat", "bench", "row", "rdl", "lateral"],
  },
];
const paths = {
  home: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  food: '<path d="M5 3v7a3 3 0 0 0 6 0V3M8 3v18M19 21V3c-4 2-5 7-4 10h4"/>',
  dumbbell:
    '<path d="m6.5 6.5 11 11M3 8l5-5M16 21l5-5M2 5l3-3M19 22l3-3M5 10l5-5M14 19l5-5"/>',
  chart: '<path d="M4 3v17h17M8 14l4-4 4 2 5-7"/>',
  book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1v15"/>',
  target:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  leaf: '<path d="M20 3c-1 5 2 11-4 15-5 3-10-1-9-6 1-6 7-6 13-9ZM4 21l10-10"/>',
  fire: '<path d="M14 3c1 5-5 6-3 10 2-1 4-2 5-5 4 4 6 8 2 12-4 4-12 1-13-3-2-5 3-8 5-11 0 3 1 3 2 4 0-3 1-5 2-7Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18M7 15h2m6 0h2"/>',
  scale:
    '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M7 8c3-2 7-2 10 0l-3 4h-4ZM12 7v3"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  search: '<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  x: '<path d="m6 6 12 12M6 18 18 6"/>',
  edit: '<path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14v6Z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-11v1"/>',
  settings:
    '<path d="m9 3-1 3-3 1-2 5 2 5 3 1 1 3h6l1-3 3-1 2-5-2-5-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/>',
  spark:
    '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
  heart:
    '<path d="M12 21S2 15 2 8c0-5 7-7 10-2 3-5 10-3 10 2 0 7-10 13-10 13Z"/>',
};
const icon = (name, extra = "") =>
  `<svg class="icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
const button = (label, action, ico = "plus", cls = "primary", attrs = "") =>
  `<button class="btn ${cls}" data-action="${action}" ${attrs}>${ico ? icon(ico) : ""}<span>${label}</span></button>`;
const iconButton = (ico, action, label, attrs = "", extra = "") =>
  `<button class="icon-btn ${extra}" data-action="${action}" aria-label="${esc(label)}" title="${esc(label)}" ${attrs}>${icon(ico)}</button>`;
let foods = [];
let state;
let view = "home";
let selectedDate = today();
let tab = "volume";
let progressTab = "weight";
let currentSessionId = null;
let foodFilter = "Todos";
let libraryQuery = "";
let toastTimer;
let modalCleanup = () => {};
let storageFailed = false;
const STORAGE = "pulso-fitness-v1";
const defaults = () => ({
  version: 1,
  demo: false,
  goals: {
    name: "",
    kcal: 2200,
    maintenance: 2500,
    protein: 150,
    carbs: 250,
    fat: 65,
    weight: 72,
    sessions: 4,
    mode: "lose",
  },
  entries: [],
  sessions: [],
  weights: [],
  favorites: [],
  customFoods: [],
});
const allFoods = () => [...state.customFoods, ...foods];
const trainingMode = () =>
  state.trainingWindow === "week" ? "week" : "rolling";
const periodLabel = () =>
  trainingMode() === "week" ? "Semana calendario" : "Últimos 7 días";
const currentTrainingStats = () =>
  trainingStats(state.sessions, selectedDate, trainingMode());
const exerciseCatalog = () => [
  ...exercises,
  ...[
    ...new Map(
      state.sessions
        .flatMap((s) => s.exercises)
        .filter((e) => !exercises.some((x) => x.id === e.exerciseId))
        .map((e) => [
          e.exerciseId,
          {
            id: e.exerciseId,
            name: e.name,
            muscle: e.muscle,
            primaryMuscles: exerciseMuscles(e).primary,
            secondaryMuscles: exerciseMuscles(e).secondary,
            equipment: "Personalizado",
          },
        ]),
    ).values(),
  ],
];
const findFood = (id) => allFoods().find((f) => f.id === id);
const datedEntries = (d = selectedDate) =>
  state.entries.filter((e) => e.date === d);
const dateLabel = (d, opts = { day: "numeric", month: "short" }) =>
  new Date(d + "T12:00:00").toLocaleDateString("es-GT", opts);
const pageNames = {
  home: "Resumen",
  nutrition: "Alimentación",
  training: "Entrenamiento",
  progress: "Mi progreso",
  library: "Biblioteca",
  goals: "Mis objetivos",
};
function seedDemo() {
  const s = defaults();
  s.demo = true;
  s.goals.name = "Alex";
  const add = (d, meal, id, grams) =>
    s.entries.push({
      id: uid(),
      date: d,
      meal,
      food: structuredClone(foods.find((f) => f.id === id)),
      grams,
    });
  for (let i = 20; i >= 0; i--) {
    const d = shiftDate(today(), -i);
    s.weights.push({
      date: d,
      kg: +(76.9 - i * -0.055 + Math.sin(i * 1.8) * 0.22).toFixed(1),
    });
    if (i === 0) {
      add(d, "Desayuno", "usda-08120", 60);
      add(d, "Desayuno", "usda-09040", 118);
      add(d, "Desayuno", "usda-01256", 170);
      add(d, "Almuerzo", "usda-05064", 180);
      add(d, "Almuerzo", "usda-20045", 200);
      add(d, "Almuerzo", "usda-11091", 100);
      add(d, "Almuerzo", "usda-04053", 10);
      add(d, "Snacks", "usda-09003", 182);
      add(d, "Snacks", "usda-12061", 28);
    } else {
      add(d, "Desayuno", "usda-08120", 80);
      add(d, "Desayuno", "usda-01077", 244);
      add(d, "Almuerzo", "usda-05064", 200);
      add(d, "Almuerzo", "usda-20045", 300 - (i % 4) * 20);
      add(d, "Cena", "usda-15237", 200);
      add(d, "Cena", "usda-20137", 185);
      add(d, "Snacks", "usda-09040", 118);
      add(d, "Snacks", "usda-12061", 50);
      add(d, "Cena", "usda-04053", 13.5);
    }
  }
  const days = weekDays(today());
  for (let i = 20; i >= 0; i--) {
    const d = shiftDate(today(), -i);
    const dow = new Date(d + "T12:00:00").getDay();
    if ([1, 2, 4, 6].includes(dow)) {
      const r = routines[i % 3];
      const session = {
        id: uid(),
        date: d,
        name: r.name,
        finished: true,
        feeling: 4,
        notes: "Sesión de ejemplo",
        exercises: r.ids.slice(0, 4).map((id, idx) => {
          const ex = exercises.find((e) => e.id === id);
          return {
            exerciseId: id,
            name: ex.name,
            muscle: ex.muscle,
            sets: Array.from({ length: 3 }, (_, n) => ({
              kg:
                idx === 0
                  ? 60 + Math.floor((20 - i) / 7) * 2.5
                  : idx === 1
                    ? 40
                    : 15,
              reps: 10 - n,
              rir: 2,
              done: true,
            })),
          };
        }),
      };
      s.sessions.push(session);
    }
  }
  s.favorites = [
    "usda-05064",
    "usda-08120",
    "usda-01129",
    "usda-20045",
    "usda-09040",
    "usda-01256",
  ];
  return s;
}
function toast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 3500);
}
function persist() {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(state));
    storageFailed = false;
    return true;
  } catch {
    storageFailed = true;
    toast("No se pudo guardar. Exporta una copia de tus datos.");
    return false;
  }
}
function save(message) {
  const ok = persist();
  render();
  if (message && ok) toast(message);
}
function empty(title, body, action = "", label = "", ico = "leaf") {
  return `<div class="empty">${icon(ico)}<h3>${title}</h3><p>${body}</p>${action ? button(label, action, "plus", "small") : ""}</div>`;
}
function heading(
  title,
  subtitle,
  actions = "",
  eyebrow = "TU ESPACIO, TU RITMO",
) {
  return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="subtitle">${subtitle}</p></div><div class="heading-actions">${actions}</div></div>`;
}
function getSession() {
  return (
    state.sessions.find((s) => s.id === currentSessionId) ||
    state.sessions.find((s) => s.date === selectedDate && !s.finished) ||
    state.sessions.filter((s) => s.date === selectedDate).at(-1)
  );
}
function render() {
  const nav = [
    ["home", "home", "Resumen"],
    ["nutrition", "food", "Alimentación"],
    ["training", "dumbbell", "Entrenamiento"],
    ["progress", "chart", "Mi progreso"],
  ];
  const navItem = ([id, ico, label]) =>
    `<button class="nav-btn ${view === id ? "active" : ""}" data-nav="${id}">${icon(ico)}${label}${view === id ? '<i class="dot"></i>' : ""}</button>`;
  $("#app").innerHTML =
    `<aside class="sidebar"><div class="brand"><img src="icon.svg" alt="">pulso<span class="brand-dot">.</span></div><p class="brand-sub">PEQUEÑOS PASOS. GRAN CAMBIO.</p><div class="nav-label">MI DÍA A DÍA</div><nav aria-label="Navegación principal">${nav.map(navItem).join("")}<div class="nav-label second">A MI MEDIDA</div>${[
      ["library", "book", "Biblioteca"],
      ["goals", "target", "Mis objetivos"],
    ]
      .map(navItem)
      .join(
        "",
      )}</nav><div class="sidebar-bottom"><div class="side-note">${icon("leaf")}<strong>El progreso está en lo simple.</strong><p>Un registro a la vez. Construye hábitos que se queden contigo.</p><button class="text-btn" data-action="export">Guardar una copia ${icon("download")}</button></div><div class="profile"><div class="avatar">${esc((state.goals.name || "Tú").slice(0, 2).toUpperCase())}</div><div><strong>${esc(state.goals.name || "Tu espacio")}</strong><small>${state.demo ? "Vista de ejemplo" : "Mi diario personal"}</small></div>${iconButton("settings", "settings", "Configurar objetivos")}</div></div></aside><main class="main"><header class="topbar"><div class="mobile-brand"><img src="icon.svg" alt="">pulso.</div><div class="breadcrumb">Mi espacio <span>/</span> <strong>${pageNames[view]}</strong></div><div class="top-actions"><span class="status-chip"><i></i>${storageFailed ? "Guardado no disponible" : "Guardado en este dispositivo"}</span><div class="date-control">${icon("calendar")}<input id="selected-date" type="date" value="${selectedDate}" max="${today()}" aria-label="Fecha del diario"></div>${iconButton("download", "export", "Exportar copia de seguridad")}</div></header>${state.demo ? `<div class="demo-banner"><span>${icon("spark")} Estás explorando con datos de ejemplo.</span><button class="text-btn" data-action="start">Empezar mis registros ${icon("arrow")}</button></div>` : ""}${storageFailed ? '<div class="info-box">El almacenamiento no está disponible. Exporta una copia antes de cerrar.</div>' : ""}<div id="page">${{ home: homePage, nutrition: nutritionPage, training: trainingPage, progress: progressPage, library: libraryPage, goals: goalsPage }[view]()}</div><footer class="footer"><span>${icon("heart")} Hecho para avanzar a tu ritmo.</span><span>${icon("lock")} Tus registros se guardan en este navegador.</span></footer></main><nav class="mobile-nav" aria-label="Navegación móvil">${[...nav, ["library", "book", "Biblioteca"], ["goals", "target", "Objetivos"]].map(([id, ico, label]) => `<button class="${view === id ? "active" : ""}" data-nav="${id}">${icon(ico)}${label}</button>`).join("")}</nav>`;
  bindPage();
}
function calorieCard() {
  const t = mealTotals(datedEntries()),
    remaining = state.goals.kcal - t.kcal;
  return `<article class="card"><div class="card-title"><h2 class="label-icon">${icon("fire")} Energía del día</h2><span class="tag">kcal</span></div><div class="calorie-body"><div class="ring" style="--value:${Math.min(100, (t.kcal / state.goals.kcal) * 100)}"><div class="ring-inner"><strong>${fmt(t.kcal)}</strong><small>kcal consumidas</small></div></div><div class="calorie-side"><div><div class="micro-label">Tu objetivo</div><strong>${fmt(state.goals.kcal)}<small>kcal</small></strong></div><div><div class="micro-label">${remaining >= 0 ? "Te quedan" : "Sobre el objetivo"}</div><strong>${fmt(Math.abs(remaining))}<small>kcal</small></strong></div></div></div><div class="card-foot"><span>${icon("target")} ${state.goals.mode === "lose" ? "Déficit" : state.goals.mode === "gain" ? "Superávit" : "Mantenimiento"} planificado</span><span>${fmt(Math.abs(state.goals.maintenance - state.goals.kcal))} kcal</span></div></article>`;
}
function macrosCard() {
  const t = mealTotals(datedEntries());
  return `<article class="card"><div class="card-title"><h2 class="label-icon">${icon("leaf")} Tus macronutrientes</h2><span class="tag">Hoy</span></div><div class="macros">${[
    ["protein", "Proteínas", "#6d8b51"],
    ["carbs", "Carbohidratos", "#dea17c"],
    ["fat", "Grasas", "#98adbd"],
  ]
    .map(
      ([key, label, color]) =>
        `<div class="macro"><div class="macro-top"><span><i class="bullet" style="background:${color}"></i>${label}</span><b>${fmt(t[key])} <small>/ ${fmt(state.goals[key])} g</small></b></div><div class="track"><i style="width:${state.goals[key] ? Math.min(100, (t[key] / state.goals[key]) * 100) : 0}%;background:${color}"></i></div></div>`,
    )
    .join("")}</div></article>`;
}
function trainingCard() {
  const stats = currentTrainingStats();
  return `<article class="card"><div class="card-title"><h2 class="label-icon">${icon("dumbbell")} Entrenamiento</h2><span class="tag green">${periodLabel()}</span></div><div class="training-number"><strong class="big-number">${stats.sessions}<span class="muted" style="font-size:19px;font-weight:400"> / ${state.goals.sessions}</span></strong><small>sesiones</small></div><div class="week-dots">${trainingDays(
    selectedDate,
    trainingMode(),
  )
    .map((d, i) => {
      const done = state.sessions.some((s) => s.date === d && s.finished);
      return `<div class="week-day"><span>${dateLabel(d, { weekday: "narrow" })}</span><div class="day-dot ${done ? "done" : ""} ${d === selectedDate ? "today" : ""}" title="${dateLabel(d)}${done ? " · Entrenamiento completado" : ""}">${done ? icon("check") : d.slice(-2).replace(/^0/, "")}</div></div>`;
    })
    .join(
      "",
    )}</div><div class="card-foot"><span>${icon("chart")} ${fmt(stats.sets)} series completadas</span><span>¡Sigue sumando!</span></div></article>`;
}
function weekChart() {
  const days = weekDays(selectedDate),
    values = days.map((d) => mealTotals(datedEntries(d)).kcal),
    max = Math.max(state.goals.kcal, ...values, 1000),
    top = Math.ceil(max / 1000) * 1000;
  return `<div class="chart-container"><div class="chart-lines">${[top, (top / 3) * 2, top / 3, 0].map((n) => `<div class="chart-line"><span>${fmt(n / 1000, n % 1000 ? 1 : 0)}k</span></div>`).join("")}</div><div class="bar-chart">${days.map((d, i) => `<div class="chart-column"><span class="chart-tooltip">${dateLabel(d)} · ${fmt(values[i])} kcal</span><div class="bar ${d === selectedDate ? "active" : ""}" style="height:${(values[i] / top) * 100}%" title="${dateLabel(d)}: ${fmt(values[i])} kcal"></div><span class="bar-label">${["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i]}</span></div>`).join("")}</div></div>`;
}
function homePage() {
  const w = weightStats(state.weights, selectedDate),
    stats = currentTrainingStats();
  const sessionDays = new Set(
    state.sessions
      .filter((s) => s.finished && s.date <= selectedDate)
      .map((s) => s.date),
  );
  const greeting =
    selectedDate === today()
      ? "Cada día cuenta."
      : `Tu día, ${dateLabel(selectedDate)}.`;
  return `${heading(greeting, `Tu alimentación, tu entrenamiento y tú. Todo en un solo lugar.`, button("Registrar peso", "weight", "scale", "") + button("Registrar alimento", "add-food"))}<section class="hero"><div><div class="eyebrow">UN POCO MEJOR, CADA DÍA</div><h2>Lo importante es seguir<br>construyendo tu mejor versión.</h2><p>Come con intención. Entrena a tu ritmo.<br>Nosotros te ayudamos a ver el camino.</p></div><svg class="hero-art" viewBox="0 0 310 200" fill="none" aria-hidden="true"><circle cx="169" cy="108" r="87" stroke="#c8d4b0"/><circle cx="169" cy="108" r="67" stroke="#c8d4b0"/><path d="M104 150c-19-30-11-80 20-99 31-19 69-1 77 24 8 26-16 67-41 83-25 16-43 12-56-8Z" fill="#b4c68e" transform="rotate(25 150 100)"/><path d="M115 148c-16-25-10-66 15-81 25-16 57-2 64 20 7 21-13 55-34 68-20 13-35 10-45-7Z" fill="#e3ecc5" transform="rotate(25 150 100)"/><ellipse cx="153" cy="117" rx="24" ry="29" fill="#b69c6c" transform="rotate(25 153 117)"/><path d="M231 57c12-17 28-18 39-14-4 20-19 26-33 24m-6 17c15-5 29-2 34 12-21 9-30 0-34-6" fill="#9fb780"/><path d="M223 110c7-19 10-43 22-55" stroke="#8ca36e" stroke-width="2"/><circle cx="82" cy="52" r="4" fill="#c2cc9d"/><path d="M74 120v12m-6-6h12M211 153v10m-5-5h10" stroke="#a6b88a" stroke-width="2"/></svg><div class="hero-pill">${icon("leaf")}<div><strong>${sessionDays.size}</strong>días de movimiento</div></div></section><section class="stats-grid">${calorieCard()}${macrosCard()}${trainingCard()}</section><section class="two-col"><article class="card"><div class="section-heading"><div><h2>Tu plato, tu día</h2><p>Pequeñas decisiones que suman.</p></div><button class="text-btn" data-nav="nutrition">Ver diario ${icon("arrow")}</button></div>${meals
    .map((meal) => {
      const entries = datedEntries().filter((e) => e.meal === meal),
        t = mealTotals(entries);
      return `<div class="meal-row"><div class="food-emoji">${mealEmoji[meal]}</div><div class="meal-info"><h3>${meal}</h3><p>${entries.length ? entries.map((e) => esc(e.food.name)).join(" · ") : "Tu próximo registro empieza aquí"}</p></div><div class="meal-right"><div class="meal-kcal">${entries.length ? fmt(t.kcal) : "—"}<small>${entries.length ? "kcal registradas" : "Sin registrar"}</small></div>${iconButton("plus", "add-food", `Añadir a ${meal}`, `data-meal="${meal}"`)}</div></div>`;
    })
    .join(
      "",
    )}</article><article class="card"><div class="section-heading"><div><h2>Una semana de equilibrio</h2><p>Tu consumo de energía, día a día.</p></div><span class="tag">${dateLabel(weekDays(selectedDate)[0])} — ${dateLabel(weekDays(selectedDate)[6])}</span></div>${weekChart()}<div class="chart-note"><div class="small-symbol">${icon("chart")}</div><div><strong>${state.entries.some((e) => weekDays(selectedDate).includes(e.date)) ? "Cada registro te ayuda a conocerte mejor." : "Tu semana empieza con el primer registro."}</strong><p>Los días sin registros no indican consumo cero.</p></div></div></article></section><section class="bottom-grid"><article class="card weight-card"><div><div class="weight-label">Tu peso más reciente</div><div class="weight-content"><div><span class="big-number">${w.latest !== null ? fmt(w.latest, 1) : "—"}</span><span class="unit">kg</span></div>${w.change !== null ? `<span class="delta">${w.change > 0 ? "+" : ""}${fmt(w.change, 1)} kg entre medias</span>` : ""}</div></div>${miniWeightChart()}${iconButton("plus", "weight", "Registrar peso")}</article><article class="card goal-card"><div class="goal-icon">${icon("target")}</div><div><h3>Tu objetivo, a tu medida</h3><p>${state.goals.mode === "lose" ? "Perder peso" : state.goals.mode === "gain" ? "Ganar peso" : "Mantener peso"} · ${fmt(state.goals.weight, 1)} kg de objetivo<br>${fmt(state.goals.kcal)} kcal al día · ${state.goals.sessions} entrenamientos por semana</p></div>${iconButton("arrow", "settings", "Editar objetivos")}</article></section>`;
}
function miniWeightChart() {
  const ws = state.weights
    .filter((w) => w.date <= selectedDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);
  if (ws.length < 2) return "";
  const min = Math.min(...ws.map((w) => w.kg)) - 0.1,
    max = Math.max(...ws.map((w) => w.kg)) + 0.1;
  const points = ws
    .map(
      (w, i) =>
        `${(i / (ws.length - 1)) * 140 + 5},${50 - ((w.kg - min) / (max - min)) * 38}`,
    )
    .join(" ");
  return `<svg class="mini-chart" viewBox="0 0 150 58" aria-label="Tendencia del peso" role="img"><polyline points="${points}" fill="none" stroke="#8ba36c" stroke-width="2" stroke-linejoin="round"/></svg>`;
}
function nutritionPage() {
  return `${heading("Alimenta tu progreso.", "Busca, elige tu porción y sigue con tu día.", button("Repetir día anterior", "copy-day", "copy", "") + button("Registrar alimento", "add-food"), "ALIMENTACIÓN")}<section class="nutrition-summary">${calorieCard()}${macrosCard()}</section>${meals
    .map((meal) => {
      const es = datedEntries().filter((e) => e.meal === meal),
        t = mealTotals(es);
      return `<article class="card meal-card"><div class="meal-card-head"><div><div class="food-emoji">${mealEmoji[meal]}</div><div><h2>${meal}</h2><p class="subtitle" style="margin-top:4px;font-size:10px">${es.length ? `${fmt(t.kcal)} kcal · P ${fmt(t.protein)} g · C ${fmt(t.carbs)} g · G ${fmt(t.fat)} g` : mealTime[meal]}</p></div></div>${button("Añadir", "add-food", "plus", "small", `data-meal="${meal}"`)}</div>${es.length ? es.map((e) => `<div class="meal-entry"><div class="food-emoji">${esc(e.food.emoji || "🍽️")}</div><div><h4>${esc(e.food.name)}</h4><p>${fmt(e.grams)} g · ${esc(e.food.detail || "Personalizado")} · P ${fmt((e.food.protein * e.grams) / 100)} g · C ${fmt((e.food.carbs * e.grams) / 100)} g · G ${fmt((e.food.fat * e.grams) / 100)} g</p></div><div class="entry-actions"><strong>${fmt((e.food.kcal * e.grams) / 100)} kcal</strong>${iconButton("edit", "edit-entry", "Editar porción", `data-id="${e.id}"`)}${iconButton("copy", "duplicate-entry", "Repetir alimento", `data-id="${e.id}"`)}${iconButton("trash", "delete-entry", "Eliminar alimento", `data-id="${e.id}"`)}</div></div>`).join("") : '<p class="empty" style="padding:12px">Todavía no hay alimentos. Añade el primero con un toque.</p>'}</article>`;
    })
    .join(
      "",
    )}<p class="source-note">Los valores de la biblioteca provienen de USDA SR28. Las porciones domésticas son orientativas; usa gramos para mayor precisión. Revisa si el alimento está crudo o cocido. <a href="https://www.ars.usda.gov/ARSUserFiles/80400525/Data/SR/SR28/dnload/sr28abbr.zip" target="_blank" rel="noopener">Consultar base de origen</a>.</p>`;
}
function metrics() {
  const s = currentTrainingStats();
  return `<div class="metrics-4">${[
    [s.sessions, "Sesiones del periodo", "sesiones completadas"],
    [s.sets, "Series realizadas", "series"],
    [fmt(s.volume), "Volumen con carga", "kg × reps"],
    [s.rir === null ? "—" : fmt(s.rir, 1), "RIR medio", "reps en reserva"],
  ]
    .map(
      ([value, label, unit]) =>
        `<article class="card metric"><h3>${label}</h3><strong class="big-number">${value}</strong><p>${unit}</p></article>`,
    )
    .join("")}</div>`;
}
function periodControl() {
  const stats = currentTrainingStats();
  return `<section class="period-control" aria-label="Periodo de entrenamiento"><div><strong>Tu volumen, con perspectiva</strong><p>${dateLabel(stats.start, { day: "numeric", month: "short", year: "numeric" })} — ${dateLabel(stats.end, { day: "numeric", month: "short", year: "numeric" })} · hasta la fecha del diario</p></div><div class="tabs no-margin" role="group" aria-label="Elegir periodo"><button class="tab ${trainingMode() === "rolling" ? "active" : ""}" data-training-window="rolling" aria-pressed="${trainingMode() === "rolling"}">Últimos 7 días</button><button class="tab ${trainingMode() === "week" ? "active" : ""}" data-training-window="week" aria-pressed="${trainingMode() === "week"}">Semana calendario</button></div></section>`;
}
function muscleOverview() {
  return `<div class="grid-2 muscle-overview">${muscleVolumeCard()}<div><article class="card"><div class="section-heading"><div><h2>Distintos ejercicios. El mismo músculo.</h2><p>Un registro que conecta toda tu semana.</p></div>${icon("target")}</div><div class="example-timeline"><div><span>LUN</span><strong>Press de banca</strong><small>3 series de ejemplo</small></div><div><span>MIÉ</span><strong>Press de pecho en máquina</strong><small>3 series de ejemplo</small></div><div><span>DOM</span><strong>Flexiones (push ups)</strong><small>3 series de ejemplo</small></div></div><div class="info-box no-margin">En este ejemplo: <strong>pecho, 9 directas</strong>; <strong>deltoides y tríceps, 9 indirectas cada uno</strong>. El conteo se actualiza al completar tus series.</div><p class="help-text spacer-top">Los últimos 7 días incluyen la fecha elegida y los 6 días anteriores. Al avanzar la fecha, las series más antiguas salen automáticamente del periodo.</p></article><article class="card spacer-top"><h3>${exercises.length} ejercicios, muchas formas de entrenar</h3><p class="help-text spacer-top">Barra, mancuernas, poleas, máquinas y peso corporal. Los ejercicios personalizados también participan en el conteo.</p><p class="help-text spacer-top">Las series directas e indirectas se registran por separado. El total de participación cuenta una serie por cada músculo asignado; no expresa una equivalencia de estímulo entre ejercicios.</p><p class="source-note">Puedes adaptar los músculos de cada ejercicio a su variante con el botón ${icon("target").replace('class="icon', 'style="display:inline;width:12px;height:12px" class="icon')} de la sesión. <a href="https://www.acefitness.org/resources/everyone/exercise-library/" target="_blank" rel="noopener">Biblioteca de referencia de movimientos: ACE</a>.</p>${button("Crear sesión", "new-session", "plus", "full spacer-top")}</article></div></div>`;
}
function trainingPage() {
  const session = getSession();
  return `${heading("Haz que cada serie cuente.", "Tu esfuerzo de hoy, tu progreso de mañana.", button("Nueva sesión", "new-session", "plus"), "ENTRENAMIENTO")}${periodControl()}${metrics()}<div class="tabs" role="tablist" aria-label="Entrenamiento">${[
    ["volume", "Volumen por músculo"],
    ["session", "Mi sesión"],
    ["routines", "Rutinas"],
    ["history", "Historial"],
  ]
    .map(
      ([id, label]) =>
        `<button class="tab ${tab === id ? "active" : ""}" data-training-tab="${id}" role="tab" aria-selected="${tab === id}">${label}</button>`,
    )
    .join("")}</div>${
    tab === "volume"
      ? muscleOverview()
      : tab === "session"
        ? `<div class="grid-2 workout-grid"><article class="card">${session ? sessionEditor(session) : empty("Tu próxima sesión empieza aquí.", "Elige una rutina o crea una sesión con tus ejercicios.", "new-session", "Crear sesión", "dumbbell")}</article><div>${muscleVolumeCard()}<article class="card spacer-top"><h3>Entrena con contexto</h3><p class="help-text" style="margin-top:13px">El RIR registra cuántas repeticiones crees que podrías haber hecho al terminar una serie. 0 = ninguna más.</p><p class="help-text" style="margin-top:10px">Marca ${icon("check").replace('class="icon', 'style="display:inline;width:12px;height:12px" class="icon')} cada serie al completarla. El volumen suma peso × repeticiones de las series realizadas. En ejercicios con peso corporal registra solo la carga añadida.</p><p class="help-text" style="margin-top:10px">Cada ejercicio puede sumar series directas e indirectas a distintos músculos. Puedes editar esa distribución con el botón de músculos de cada ejercicio.</p></article></div></div>`
        : tab === "routines"
          ? `<div class="grid-2">${routines
              .map(
                (r, i) =>
                  `<article class="card"><div class="card-title"><h2>${r.name}</h2><span class="tag">${r.ids.length} ejercicios</span></div><p class="help-text">${r.note}</p><div class="spacer-top">${r.ids
                    .map((id) => {
                      const ex = exercises.find((e) => e.id === id);
                      return `<div class="history-row"><div class="small-symbol">${icon("dumbbell")}</div><div><h4>${ex.name}</h4><p>${ex.muscle} · ${ex.equipment}</p></div></div>`;
                    })
                    .join(
                      "",
                    )}</div>${button("Usar rutina", "use-routine", "plus", "full spacer-top", `data-index="${i}"`)}<p class="source-note">Plantilla editable. Ajusta series, cargas y repeticiones a tu plan.</p></article>`,
              )
              .join("")}</div>`
          : historyPage()
  }`;
}
function sessionEditor(s) {
  return `<div class="workout-header"><div><h2>${esc(s.name)}</h2><p class="subtitle" style="font-size:10px;margin-top:5px">${dateLabel(s.date, { weekday: "long", day: "numeric", month: "long" })} · ${s.finished ? "Sesión completada" : "En curso"} · ${fmt(sessionVolume(s))} kg de volumen</p></div><div>${iconButton("edit", "rename-session", "Cambiar nombre de sesión", `data-id="${s.id}"`)}${iconButton("trash", "delete-session", "Eliminar sesión", `data-id="${s.id}"`)}</div></div>${s.exercises
    .map(
      (ex, ei) =>
        `<div class="exercise-card"><div class="exercise-top"><div class="small-symbol">${icon("dumbbell")}</div><div><h3>${esc(ex.name)}</h3><p>${esc(exerciseMuscles(ex).primary.join(" + "))} · ${lastPerformance(ex.exerciseId, s)}</p></div>${iconButton("target", "edit-exercise-muscles", "Editar músculos de " + ex.name, `data-session="${s.id}" data-ei="${ei}"`)}${iconButton("x", "remove-exercise", "Quitar ejercicio", `data-session="${s.id}" data-ei="${ei}"`)}</div><table class="set-table"><thead><tr><th>Serie</th><th>Peso kg</th><th>Reps</th><th>RIR</th><th>Hecha</th><th></th></tr></thead><tbody>${ex.sets
          .map(
            (set, si) =>
              `<tr class="${set.done ? "completed" : ""}"><td>${si + 1}</td>${[
                ["kg", "0", "1000", ".5"],
                ["reps", "1", "200", "1"],
                ["rir", "0", "10", "1"],
              ]
                .map(
                  ([key, min, max, step]) =>
                    `<td><input type="number" inputmode="decimal" data-set-field="${key}" data-session="${s.id}" data-ei="${ei}" data-si="${si}" aria-label="${key === "kg" ? "Peso en kg" : key === "reps" ? "Repeticiones" : "RIR"} de ${esc(ex.name)}, serie ${si + 1}" value="${set[key]}" min="${min}" max="${max}" step="${step}" ${key !== "rir" ? "required" : ""}></td>`,
                )
                .join(
                  "",
                )}<td><button class="check-set ${set.done ? "done" : ""}" data-action="toggle-set" data-session="${s.id}" data-ei="${ei}" data-si="${si}" aria-label="${set.done ? "Desmarcar" : "Completar"} serie ${si + 1}" aria-pressed="${set.done}">${icon("check")}</button></td><td><button class="remove-set" data-action="remove-set" data-session="${s.id}" data-ei="${ei}" data-si="${si}" aria-label="Eliminar serie ${si + 1}">${icon("x")}</button></td></tr>`,
          )
          .join(
            "",
          )}</tbody></table><button class="set-add" data-action="add-set" data-session="${s.id}" data-ei="${ei}">+ Añadir serie</button></div>`,
    )
    .join(
      "",
    )}${button("Añadir ejercicio", "add-exercise", "plus", "full", `data-id="${s.id}"`)}<div class="field spacer-top"><label for="session-notes">Notas de la sesión</label><textarea id="session-notes" data-session="${s.id}" placeholder="¿Cómo te fue hoy? Sueño, energía, molestias…" maxlength="2000">${esc(s.notes || "")}</textarea></div><div class="workout-bottom"><div><p class="micro-label">¿Cómo te sentiste?</p><div class="feeling">${["😣", "😕", "😐", "🙂", "🤩"].map((emoji, i) => `<button class="${s.feeling === i + 1 ? "selected" : ""}" data-action="feeling" data-id="${s.id}" data-value="${i + 1}" aria-label="Sensación ${i + 1} de 5" aria-pressed="${s.feeling === i + 1}">${emoji}</button>`).join("")}</div></div>${button(s.finished ? "Reabrir sesión" : "Finalizar sesión", "finish-session", s.finished ? "edit" : "check", s.finished ? "" : "primary", `data-id="${s.id}"`)}</div>`;
}
function lastPerformance(id, current) {
  const prior = state.sessions
    .filter(
      (s) =>
        s.id !== current.id &&
        s.date < current.date &&
        s.finished &&
        s.exercises.some((e) => e.exerciseId === id),
    )
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const ex = prior?.exercises.find((e) => e.exerciseId === id);
  const sets = ex?.sets.filter((s) => s.done);
  return sets?.length
    ? `Anterior: ${fmt(sets[0].kg)} kg × ${sets[0].reps}`
    : "Sin sesión anterior";
}
function muscleVolumeCard() {
  const stats = currentTrainingStats();
  const max = Math.max(
    1,
    ...Object.values(stats.muscleBreakdown).map((m) => m.total),
  );
  const names = [
    ...new Set([...muscleNames, ...Object.keys(stats.muscleBreakdown)]),
  ];
  return `<article class="card muscle-volume"><div class="section-heading"><div><h2>Series por músculo</h2><p>${periodLabel()} · ${dateLabel(stats.start)} — ${dateLabel(stats.end)}</p></div>${icon("chart")}</div><div class="chart-legend"><span><i class="bullet"></i> Directas</span><span><i class="bullet" style="background:#bdd19f"></i> Indirectas</span></div><table class="muscle-table"><caption class="sr-only">Series completadas por músculo en ${periodLabel().toLowerCase()}</caption><thead><tr><th>Músculo</th><th>Directas</th><th>Indirectas</th><th>Total</th></tr></thead><tbody>${names
    .map((m) => {
      const row = stats.muscleBreakdown[m] || {
        direct: 0,
        indirect: 0,
        total: 0,
        exercises: [],
      };
      const label = `${esc(m)}<div class="muscle-track" aria-hidden="true"><i style="width:${(row.direct / max) * 100}%"></i><i class="secondary" style="width:${(row.indirect / max) * 100}%"></i></div>`;
      return `<tr class="${row.total ? "has-volume" : ""}" data-muscle="${esc(m)}"><td>${row.total ? `<details><summary>${label}</summary><div class="muscle-contributions">${row.exercises.map((ex) => `<div><strong>${esc(ex.name)}</strong><span>${ex.direct ? `${ex.direct} directas` : ""}${ex.direct && ex.indirect ? " · " : ""}${ex.indirect ? `${ex.indirect} indirectas` : ""}</span></div>`).join("")}</div></details>` : label}</td><td data-count="direct">${row.direct}</td><td data-count="indirect">${row.indirect}</td><td data-count="total"><strong>${row.total}</strong></td></tr>`;
    })
    .join(
      "",
    )}</tbody></table><p class="source-note">${stats.sets} series realizadas. Una misma serie puede participar en varios músculos, pero se cuenta una sola vez en el total de series de la sesión. Toca un músculo para ver qué ejercicios sumaron.</p></article>`;
}
function historyPage() {
  const sessions = state.sessions
    .filter((s) => s.date <= selectedDate)
    .sort((a, b) => b.date.localeCompare(a.date));
  return `<article class="card"><div class="section-heading"><div><h2>Tu historial de entrenamiento</h2><p>Hasta el ${dateLabel(selectedDate)} · ${sessions.length} sesiones</p></div></div>${sessions.length ? sessions.map((s) => `<div class="history-row"><div class="food-emoji">${s.finished ? "🏋️" : "⏳"}</div><div><h4>${esc(s.name)} <span class="tag ${s.finished ? "green" : "orange"}">${s.finished ? "Completada" : "En curso"}</span></h4><p>${dateLabel(s.date)} · ${completedSets(s).length} series · ${fmt(sessionVolume(s))} kg · Sensación ${s.feeling}/5</p></div><div style="margin-left:auto;display:flex;gap:7px">${iconButton("copy", "repeat-session", "Repetir esta sesión hoy", `data-id="${s.id}"`)}${iconButton("arrow", "open-session", "Ver sesión", `data-id="${s.id}"`)}</div></div>`).join("") : empty("Cada sesión tendrá su lugar.", "Tus entrenamientos aparecerán aquí cuando crees el primero.", "new-session", "Crear sesión", "dumbbell")}</article>`;
}
function progressPage() {
  const w = weightStats(state.weights, selectedDate),
    weights = state.weights
      .filter((w) => w.date <= selectedDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  return `${heading("El cambio se ve con perspectiva.", "Mira tus tendencias. Celebra la constancia.", button("Registrar peso", "weight", "plus"), "MI PROGRESO")}<div class="tabs" role="tablist" aria-label="Estadísticas">${[
    ["weight", "Peso corporal"],
    ["strength", "Fuerza y volumen"],
    ["nutrition", "Alimentación"],
  ]
    .map(
      ([id, label]) =>
        `<button class="tab ${progressTab === id ? "active" : ""}" data-progress-tab="${id}" role="tab" aria-selected="${progressTab === id}">${label}</button>`,
    )
    .join("")}</div>${
    progressTab === "weight"
      ? `<div class="metrics-4">${[
          [
            w.latest === null ? "—" : fmt(w.latest, 1),
            "Peso más reciente",
            "kg",
          ],
          [
            w.average === null ? "—" : fmt(w.average, 1),
            "Media últimos 7 días",
            "kg",
          ],
          [
            w.change === null
              ? "—"
              : (w.change > 0 ? "+" : "") + fmt(w.change, 2),
            "Cambio entre medias",
            "kg · frente a 7 días anteriores",
          ],
          [fmt(state.goals.weight, 1), "Tu objetivo", "kg"],
        ]
          .map(
            ([value, label, unit]) =>
              `<article class="card metric"><h3>${label}</h3><strong class="big-number">${value}</strong><p>${unit}</p></article>`,
          )
          .join(
            "",
          )}</div><div class="grid-2"><article class="card progress-card"><div class="section-heading"><div><h2>Tu evolución de peso</h2><p>Últimos 30 registros · el peso cambia de un día a otro.</p></div><span class="tag">kg</span></div>${weightPlot(weights.slice(-30))}</article><article class="card"><div class="section-heading"><div><h2>Registro de peso</h2><p>Un registro por día. Puedes editarlo.</p></div>${button("Añadir", "weight", "plus", "small")}</div><div class="weight-log">${
          weights.length
            ? weights
                .slice()
                .reverse()
                .map(
                  (w) =>
                    `<div class="history-row"><div><h4>${dateLabel(w.date, { day: "numeric", month: "long" })}</h4><p>${dateLabel(w.date, { weekday: "long", year: "numeric" })}</p></div><b>${fmt(w.kg, 1)} kg</b>${iconButton("edit", "weight", "Editar peso", `data-date="${w.date}"`)}${iconButton("trash", "delete-weight", "Eliminar registro de peso", `data-date="${w.date}"`)}</div>`,
                )
                .join("")
            : empty(
                "Empieza por tu punto de partida.",
                "Registra tu peso para ver cómo evoluciona.",
                "weight",
                "Registrar peso",
                "scale",
              )
        }</div></article></div>`
      : progressTab === "strength"
        ? `${periodControl()}${metrics()}<div class="grid-2">${muscleVolumeCard()}<article class="card"><div class="section-heading"><div><h2>Progreso por ejercicio</h2><p>Mejor carga realizada en cada sesión</p></div></div><div class="field"><label for="progress-exercise">Ejercicio</label><select id="progress-exercise">${exerciseCatalog()
            .map((e) => `<option value="${e.id}">${esc(e.name)}</option>`)
            .join(
              "",
            )}</select></div><div id="exercise-progress" class="spacer-top">${exerciseProgress("bench")}</div></article></div>`
        : `${nutritionStats()}`
  }`;
}
function weightPlot(weights) {
  if (weights.length < 2)
    return empty(
      "Tu tendencia necesita dos puntos.",
      "Registra tu peso en al menos dos días distintos.",
      "weight",
      "Registrar peso",
      "scale",
    );
  const min = Math.floor(Math.min(...weights.map((w) => w.kg)) * 2) / 2 - 0.5,
    max = Math.ceil(Math.max(...weights.map((w) => w.kg)) * 2) / 2 + 0.5;
  const first = Date.parse(weights[0].date + "T12:00:00"),
    last = Date.parse(weights.at(-1).date + "T12:00:00");
  const points = weights
    .map(
      (w) =>
        `${45 + ((Date.parse(w.date + "T12:00:00") - first) / (last - first)) * 455},${195 - ((w.kg - min) / (max - min)) * 170}`,
    )
    .join(" ");
  return `<svg class="weight-plot" viewBox="0 0 520 220" role="img" aria-label="Evolución de peso entre ${fmt(min, 1)} y ${fmt(max, 1)} kg">${[0, 1, 2, 3, 4].map((i) => `<line x1="45" y1="${25 + i * 42.5}" x2="505" y2="${25 + i * 42.5}" stroke="#e7ecdf" stroke-dasharray="4 4"/><text x="0" y="${29 + i * 42.5}" fill="#96a18b" font-size="10">${fmt(max - ((max - min) * i) / 4, 1)}</text>`).join("")}<polygon points="45,195 ${points} 500,195" fill="#eff4e7"/><polyline points="${points}" fill="none" stroke="#65894c" stroke-width="2.5" stroke-linejoin="round"/>${weights.map((w) => `<circle cx="${45 + ((Date.parse(w.date + "T12:00:00") - first) / (last - first)) * 455}" cy="${195 - ((w.kg - min) / (max - min)) * 170}" r="3.4" fill="#65894c"><title>${dateLabel(w.date)}: ${fmt(w.kg, 1)} kg</title></circle>`).join("")}</svg><div class="plot-labels"><span>${dateLabel(weights[0].date)}</span><span>${dateLabel(weights.at(-1).date)}</span></div>`;
}
function exerciseProgress(id) {
  const rows = state.sessions
    .filter((s) => s.finished && s.date <= selectedDate)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((s) => ({
      date: s.date,
      sets: s.exercises
        .filter((e) => e.exerciseId === id)
        .flatMap((e) => e.sets.filter((t) => t.done)),
    }))
    .filter((s) => s.sets.length);
  if (!rows.length)
    return empty(
      "Todavía no hay series para comparar.",
      "Completa una sesión con este ejercicio.",
    );
  return `<div class="weight-log">${rows
    .map((r) => {
      const best = r.sets.reduce((a, b) =>
        b.kg > a.kg || (b.kg === a.kg && b.reps > a.reps) ? b : a,
      );
      return `<div class="history-row"><div><h4>${dateLabel(r.date)}</h4><p>${r.sets.length} series · ${fmt(sum(r.sets, (t) => t.kg * t.reps))} kg de volumen</p></div><b style="margin-left:auto">${fmt(best.kg)} kg × ${best.reps}</b></div>`;
    })
    .join("")}</div>`;
}
function nutritionStats() {
  const dates = Array.from({ length: 7 }, (_, i) =>
      shiftDate(selectedDate, i - 6),
    ),
    tracked = dates.filter((d) => datedEntries(d).length),
    totals = tracked.map((d) => mealTotals(datedEntries(d))),
    avg = (key) =>
      totals.length ? sum(totals, (t) => t[key]) / totals.length : null;
  return `<div class="metrics-4">${[
    ["kcal", "Calorías medias", "kcal por día registrado"],
    ["protein", "Proteína media", "g por día registrado"],
    ["carbs", "Carbohidratos medios", "g por día registrado"],
    ["fat", "Grasas medias", "g por día registrado"],
  ]
    .map(
      ([key, label, unit]) =>
        `<article class="card metric"><h3>${label}</h3><strong class="big-number">${avg(key) === null ? "—" : fmt(avg(key))}</strong><p>${unit}</p></article>`,
    )
    .join(
      "",
    )}</div><article class="card chart-big"><div class="section-heading"><div><h2>Tu energía de esta semana</h2><p>Medias calculadas con ${tracked.length} días registrados de los últimos 7. Pueden incluir días incompletos.</p></div></div>${weekChart()}<p class="source-note">Objetivo diario configurado: ${fmt(state.goals.kcal)} kcal. La diferencia entre consumo y mantenimiento es una estimación basada en el mantenimiento que tú configuras; no mide el gasto real.</p></article>`;
}
function libraryPage() {
  return `${heading("Tus favoritos, siempre a mano.", `${foods.length} alimentos de base + los que tú crees. Menos buscar, más vivir.`, button("Crear alimento", "custom-food", "plus"), "BIBLIOTECA")}<div class="label-row"><div class="search">${icon("search")}<input id="library-search" placeholder="Buscar alimento, por ejemplo: arroz, pollo…" value="${esc(libraryQuery)}" aria-label="Buscar en la biblioteca"></div><span class="tag">Valores por 100 g</span></div><div class="filter-row" aria-label="Filtrar alimentos">${["Todos", "Favoritos", "Mis alimentos", "Proteínas", "Cereales", "Frutas", "Vegetales", "Lácteos", "Legumbres", "Grasas y semillas", "Otros"].map((f) => `<button class="filter ${f === foodFilter ? "active" : ""}" data-food-filter="${f}">${f === "Favoritos" ? "☆ " : ""}${f}</button>`).join("")}</div><div class="food-grid" id="food-grid">${foodTiles()}</div><p class="source-note">Base: <a href="https://www.ars.usda.gov/ARSUserFiles/80400525/Data/SR/SR28/dnload/sr28abbr.zip" target="_blank" rel="noopener">USDA National Nutrient Database, Standard Reference, Release 28 (2016)</a>. Los valores se extraen del archivo oficial; los nombres se presentan en español. No incluye búsqueda de marcas ni código de barras. Los alimentos personalizados usan los valores que tú introduzcas.</p>`;
}
function foodTiles() {
  const items = allFoods().filter(
    (f) =>
      (foodFilter === "Todos" ||
        (foodFilter === "Favoritos" && state.favorites.includes(f.id)) ||
        (foodFilter === "Mis alimentos" && f.id.startsWith("custom-")) ||
        f.category === foodFilter) &&
      normalize(f.name + " " + f.detail).includes(normalize(libraryQuery)),
  );
  return items.length
    ? items
        .map(
          (f) =>
            `<article class="card food-tile"><div class="food-tile-top"><div class="food-emoji">${esc(f.emoji || "🍽️")}</div><div><h3>${esc(f.name)}</h3><p>${esc(f.detail || "Personalizado")}</p></div>${iconButton("star", "favorite", state.favorites.includes(f.id) ? "Quitar favorito" : "Guardar favorito", `data-id="${esc(f.id)}" aria-pressed="${state.favorites.includes(f.id)}"`, `favorite ${state.favorites.includes(f.id) ? "active" : ""}`)}</div><div class="food-tile-bottom"><span>${fmt(f.kcal)} <small>kcal · P ${fmt(f.protein)} · C ${fmt(f.carbs)} · G ${fmt(f.fat)}</small></span>${iconButton("plus", "pick-direct", "Registrar alimento", `data-id="${esc(f.id)}"`)}</div>${f.id.startsWith("custom-") ? `<button class="text-btn" data-action="edit-custom" data-id="${esc(f.id)}">Editar valores ${icon("edit")}</button>` : `<small class="muted" style="font-size:8px">USDA SR28 · NDB ${f.sourceId}</small>`}</article>`,
        )
        .join("")
    : empty(
        "No encontramos ese alimento.",
        "Prueba otra búsqueda o crea uno personalizado.",
        "custom-food",
        "Crear alimento",
        "search",
      );
}
function goalsForm(onboarding = false) {
  const g = state.goals;
  return `<form id="goals-form" data-onboarding="${onboarding}"><div class="info-box">${onboarding ? "Empieza con tus propios registros. Al guardar, se borrarán únicamente los datos de ejemplo." : "Los objetivos son valores editables de tu plan personal."} Las cifras iniciales son ejemplos, no una recomendación personalizada.</div><div class="form-grid"><div class="field"><label for="goal-name">¿Cómo te llamas?</label><input id="goal-name" name="name" value="${esc(onboarding ? "" : g.name)}" placeholder="Tu nombre" maxlength="40"></div><div class="field"><label for="goal-mode">Mi objetivo es</label><select id="goal-mode" name="mode">${[
    ["lose", "Perder peso"],
    ["maintain", "Mantener peso"],
    ["gain", "Ganar peso"],
  ]
    .map(
      ([id, label]) =>
        `<option value="${id}" ${g.mode === id ? "selected" : ""}>${label}</option>`,
    )
    .join(
      "",
    )}</select></div><div class="field"><label for="goal-calories">Objetivo diario · kcal</label><input id="goal-calories" name="kcal" type="number" min="1" max="10000" step="1" required value="${g.kcal}"></div><div class="field"><label for="goal-maintenance">Mantenimiento estimado · kcal</label><input id="goal-maintenance" name="maintenance" type="number" min="1" max="10000" step="1" required value="${g.maintenance}"><small>Introduce el gasto diario estimado de tu plan.</small></div><div class="field"><label for="goal-protein">Proteínas · g al día</label><input id="goal-protein" name="protein" type="number" min="0" max="1000" step="1" required value="${g.protein}"></div><div class="field"><label for="goal-carbs">Carbohidratos · g al día</label><input id="goal-carbs" name="carbs" type="number" min="0" max="1000" step="1" required value="${g.carbs}"></div><div class="field"><label for="goal-fat">Grasas · g al día</label><input id="goal-fat" name="fat" type="number" min="0" max="1000" step="1" required value="${g.fat}"></div><div class="field"><label for="goal-weight">Peso objetivo · kg</label><input id="goal-weight" name="weight" type="number" min="1" max="500" step="0.1" required value="${g.weight}"></div><div class="field"><label for="goal-sessions">Entrenamientos por semana</label><input id="goal-sessions" name="sessions" type="number" min="1" max="14" step="1" required value="${g.sessions}"></div><div class="field"><label>Balance planificado</label><div id="goal-balance" class="info-box no-margin">${goalBalance(g)}</div></div><div class="field wide"><small>Las metas de macros equivalen aproximadamente a <span id="macro-kcal">${fmt(g.protein * 4 + g.carbs * 4 + g.fat * 9)}</span> kcal. Puedes ajustarlas de forma independiente al objetivo calórico.</small></div></div><div class="settings-actions"><button type="submit" class="btn primary">${icon("check")}${onboarding ? "Empezar mi diario" : "Guardar objetivos"}</button>${onboarding ? '<button type="button" class="btn" data-action="close">Seguir explorando</button>' : ""}</div><p class="help-text spacer-top">El balance planificado es la diferencia entre tu objetivo de calorías y el mantenimiento estimado que introduces. No se suman calorías del entrenamiento para evitar contarlas dos veces.</p></form>`;
}
function goalBalance(g) {
  const delta = g.kcal - g.maintenance;
  return `<strong>${delta < 0 ? "Déficit" : delta > 0 ? "Superávit" : "Mantenimiento"}: ${fmt(Math.abs(delta))} kcal/día</strong>`;
}
function goalsPage() {
  return `${heading("Un plan que se adapta a ti.", "Define tus metas y ajústalas cuando lo necesites.", "", "MIS OBJETIVOS")}<article class="card settings-panel">${goalsForm()}</article><article class="card settings-panel spacer-top"><div class="section-heading"><div><h2>Tus datos, contigo</h2><p>Se guardan en este navegador. Exporta una copia para moverlos a otro dispositivo.</p></div>${icon("lock")}</div><div class="settings-actions">${button("Exportar copia", "export", "download", "")}${button("Importar copia", "import", "upload", "")}${!state.demo ? button("Explorar demo", "load-demo", "spark", "") : ""}</div><p class="source-note">La copia incluye tus objetivos y todos los registros. Importar sustituye los datos actuales después de mostrarte el resumen.</p><input id="import-file" type="file" accept="application/json,.json" class="hide"></article>`;
}
function bindPage() {
  $("#selected-date")?.addEventListener("change", (e) => {
    if (!e.target.value || e.target.value > today()) return;
    selectedDate = e.target.value;
    currentSessionId = null;
    render();
  });
  $("#library-search")?.addEventListener("input", (e) => {
    libraryQuery = e.target.value;
    $("#food-grid").innerHTML = foodTiles();
  });
  $("#progress-exercise")?.addEventListener(
    "change",
    (e) =>
      ($("#exercise-progress").innerHTML = exerciseProgress(e.target.value)),
  );
  $("#session-notes")?.addEventListener("input", (e) => {
    const s = state.sessions.find((s) => s.id === e.target.dataset.session);
    s.notes = e.target.value;
    persist();
  });
  document.querySelectorAll("[data-set-field]").forEach((input) =>
    input.addEventListener("change", (e) => {
      const t = e.target;
      if (!t.reportValidity()) {
        render();
        return;
      }
      const s = state.sessions.find((s) => s.id === t.dataset.session);
      s.exercises[+t.dataset.ei].sets[+t.dataset.si][t.dataset.setField] =
        t.value === "" && t.dataset.setField === "rir" ? "" : Number(t.value);
      save();
    }),
  );
  bindGoals();
  $("#import-file")?.addEventListener("change", importFile);
}
function bindGoals() {
  const form = $("#goals-form");
  if (!form) return;
  form.addEventListener("input", () => {
    const data = new FormData(form);
    const g = Object.fromEntries(data);
    $("#goal-balance").innerHTML = goalBalance({
      kcal: +g.kcal,
      maintenance: +g.maintenance,
    });
    $("#macro-kcal").textContent = fmt(
      +g.protein * 4 + +g.carbs * 4 + +g.fat * 9,
    );
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    const g = { ...data, name: data.name.trim() };
    for (const k of [
      "kcal",
      "maintenance",
      "protein",
      "carbs",
      "fat",
      "weight",
      "sessions",
    ])
      g[k] = Number(data[k]);
    const delta = g.kcal - g.maintenance;
    if (
      (g.mode === "lose" && delta >= 0) ||
      (g.mode === "gain" && delta <= 0) ||
      (g.mode === "maintain" && delta !== 0)
    ) {
      toast("Ajusta las calorías para que coincidan con el objetivo elegido.");
      return;
    }
    if (form.dataset.onboarding === "true") {
      state = defaults();
      state.demo = false;
      view = "home";
      selectedDate = today();
      currentSessionId = null;
      closeModal();
    }
    state.goals = g;
    save("Objetivos guardados. Tu siguiente paso empieza aquí.");
  });
}
function openModal(title, subtitle, body) {
  modalCleanup();
  modalCleanup = () => {};
  const modal = $("#modal");
  modal.innerHTML = `<div class="modal-header"><div><h2 id="modal-title">${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ""}</div>${iconButton("x", "close", "Cerrar ventana")}</div>${body}`;
  if (!modal.open) modal.showModal();
  return modal;
}
function closeModal() {
  modalCleanup();
  modalCleanup = () => {};
  $("#modal").close();
  $("#modal").innerHTML = "";
}
function showFoodPicker(meal = "Desayuno") {
  openModal(
    "¿Qué comiste?",
    "Busca un alimento y elige cuánto. Así de simple.",
    `<div class="search">${icon("search")}<input id="food-search" placeholder="Buscar arroz, huevo, pollo…" aria-label="Buscar alimento" autofocus></div><div class="filter-row"><button class="filter active" data-picker-filter="all">Todos</button><button class="filter" data-picker-filter="favorites">☆ Favoritos</button><button class="filter" data-picker-filter="recent">Recientes</button></div><div id="picker-list" class="modal-food-list"></div><div class="modal-footer">${button("Crear alimento", "custom-food", "plus", "small", `data-meal="${meal}"`)}</div>`,
  );
  let filter = "all";
  function draw() {
    const query = normalize($("#food-search").value);
    let list = allFoods();
    if (filter === "favorites")
      list = list.filter((f) => state.favorites.includes(f.id));
    if (filter === "recent") {
      const ids = [
        ...new Set(
          state.entries
            .slice()
            .reverse()
            .map((e) => e.food.id),
        ),
      ].slice(0, 15);
      list = ids
        .map(
          (id) =>
            allFoods().find((f) => f.id === id) ||
            state.entries.find((e) => e.food.id === id)?.food,
        )
        .filter(Boolean);
    }
    list = list.filter((f) =>
      normalize(f.name + " " + f.detail).includes(query),
    );
    $("#picker-list").innerHTML = list.length
      ? list
          .map(
            (f) =>
              `<button class="food-pick" data-action="select-food" data-id="${esc(f.id)}" data-meal="${meal}"><span class="food-emoji">${esc(f.emoji || "🍽️")}</span><div><h3>${esc(f.name)}</h3><p>${esc(f.detail || "Personalizado")} · 100 g</p></div><strong>${fmt(f.kcal)} <small>kcal</small></strong>${icon("chevron")}</button>`,
          )
          .join("")
      : empty(
          "Sin resultados.",
          "Prueba otro nombre o crea tu propio alimento.",
        );
  }
  $("#food-search").addEventListener("input", draw);
  document.querySelectorAll("[data-picker-filter]").forEach((b) =>
    b.addEventListener("click", () => {
      filter = b.dataset.pickerFilter;
      document
        .querySelectorAll("[data-picker-filter]")
        .forEach((c) => c.classList.toggle("active", c === b));
      draw();
    }),
  );
  draw();
}
function portionModal(food, meal = "Desayuno", entry = null) {
  openModal(
    esc(food.name),
    `${esc(food.detail || "Personalizado")} · ${esc(food.source || "Valores personalizados")} · por 100 g`,
    `<form id="portion-form"><div class="form-grid"><div class="field"><label for="food-grams">Cantidad en gramos</label><input id="food-grams" name="grams" type="number" min="0.1" max="10000" step="0.1" value="${entry?.grams || food.portion || 100}" required autofocus></div><div class="field"><label for="food-meal">Comida</label><select id="food-meal" name="meal">${meals.map((m) => `<option ${m === meal ? "selected" : ""}>${m}</option>`).join("")}</select></div></div><div class="portion-pills"><button type="button" data-grams="100">100 g</button><button type="button" data-grams="${food.portion || 100}">${esc(food.portionLabel || "Porción")} (${fmt(food.portion || 100)} g)</button><button type="button" data-grams="${(food.portion || 100) * 2}">2 porciones</button></div><div id="portion-preview" class="portion-preview"></div><p class="source-note">${food.sourceId ? `USDA SR28 · NDB ${food.sourceId}. ` : ""}La medida doméstica es orientativa. Ajusta el peso real en gramos.</p><div class="modal-footer"><button type="button" class="btn" data-action="${entry ? "close" : "add-food"}" data-meal="${meal}">${entry ? "Cancelar" : "Volver"}</button><button class="btn primary" type="submit">${icon("check")}${entry ? "Guardar cambios" : "Añadir a mi diario"}</button></div></form>`,
  );
  const preview = () => {
    const grams = +$("#food-grams").value;
    $("#portion-preview").innerHTML = [
      ["kcal", "kcal"],
      ["protein", "Proteínas · g"],
      ["carbs", "Carbos · g"],
      ["fat", "Grasas · g"],
    ]
      .map(
        ([key, label]) =>
          `<div><strong>${fmt((food[key] * grams) / 100, key === "kcal" ? 0 : 1)}</strong><small>${label}</small></div>`,
      )
      .join("");
  };
  $("#food-grams").addEventListener("input", preview);
  document.querySelectorAll("[data-grams]").forEach((b) =>
    b.addEventListener("click", () => {
      $("#food-grams").value = b.dataset.grams;
      preview();
    }),
  );
  preview();
  $("#portion-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(e.target);
    if (entry) {
      entry.grams = +d.get("grams");
      entry.meal = d.get("meal");
    } else
      state.entries.push({
        id: uid(),
        date: selectedDate,
        meal: d.get("meal"),
        grams: +d.get("grams"),
        food: structuredClone(food),
      });
    closeModal();
    save(
      entry
        ? "Porción actualizada."
        : `${food.name} añadido a ${d.get("meal").toLowerCase()}.`,
    );
  });
}
function customFoodModal(food = null, meal = "Desayuno") {
  openModal(
    food ? "Editar alimento" : "Tu alimento, a tu manera.",
    "Copia los valores de la etiqueta nutricional.",
    `<form id="custom-form"><div class="form-grid"><div class="field wide"><label for="custom-name">Nombre del alimento</label><input id="custom-name" name="name" required maxlength="100" value="${esc(food?.name || "")}" placeholder="Ej. Mi yogur de vainilla"></div><div class="field wide"><label for="custom-base">La etiqueta indica valores por…</label><input id="custom-base" name="base" type="number" min="0.1" max="10000" step="0.1" value="100" required><small>Gramos de la porción descrita en la etiqueta. Convertimos los valores a 100 g.</small></div>${[
      ["kcal", "Calorías · kcal"],
      ["protein", "Proteínas · g"],
      ["carbs", "Carbohidratos · g"],
      ["fat", "Grasas · g"],
    ]
      .map(
        ([key, label]) =>
          `<div class="field"><label for="custom-${key}">${label}</label><input id="custom-${key}" name="${key}" type="number" min="0" max="10000" step="0.01" required value="${food?.[key] ?? ""}"></div>`,
      )
      .join(
        "",
      )}</div><div class="modal-footer"><button class="btn" type="button" data-action="close">Cancelar</button><button class="btn primary" type="submit">${food ? "Guardar alimento" : "Crear y registrar"}</button></div></form>`,
  );
  $("#custom-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target)),
      factor = 100 / +d.base;
    const f = {
      id: food?.id || "custom-" + uid(),
      name: d.name.trim(),
      detail: "Personalizado · valores de etiqueta",
      category: "Mis alimentos",
      emoji: "🍽️",
      portion: +d.base,
      portionLabel: "Porción",
      source: "Etiqueta introducida por ti",
      ...Object.fromEntries(
        ["kcal", "protein", "carbs", "fat"].map((k) => [
          k,
          +(+d[k] * factor).toFixed(3),
        ]),
      ),
    };
    if (
      !f.name ||
      f.kcal > 1000 ||
      ["protein", "carbs", "fat"].some((k) => f[k] > 100)
    ) {
      toast("Revisa los gramos de la porción y los valores de la etiqueta.");
      return;
    }
    if (food)
      state.customFoods[state.customFoods.findIndex((x) => x.id === food.id)] =
        f;
    else state.customFoods.push(f);
    save("Alimento guardado en tu biblioteca.");
    if (food) closeModal();
    else portionModal(f, meal);
  });
}
function weightModal(date = selectedDate) {
  const prior = state.weights.find((w) => w.date === date);
  openModal(
    prior ? "Actualizar peso" : "Un nuevo punto en tu camino.",
    "Las tendencias cuentan más que un solo día.",
    `<form id="weight-form"><div class="form-grid"><div class="field"><label for="weight-date">Fecha</label><input id="weight-date" name="date" type="date" max="${today()}" required value="${date}"></div><div class="field"><label for="weight-kg">Peso · kg</label><input id="weight-kg" name="kg" type="number" inputmode="decimal" min="1" max="500" step="0.1" required value="${prior?.kg || ""}" placeholder="Ej. 76.5" autofocus></div></div><p class="source-note">Se guarda un valor por día. Si ya existe un registro en esa fecha, se actualizará.</p><div class="modal-footer"><button type="button" class="btn" data-action="close">Cancelar</button><button type="submit" class="btn primary">${icon("check")}Guardar peso</button></div></form>`,
  );
  $("#weight-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(e.target),
      date = d.get("date");
    const existing = state.weights.find((w) => w.date === date);
    if (existing) existing.kg = +d.get("kg");
    else state.weights.push({ date, kg: +d.get("kg") });
    closeModal();
    save("Peso guardado. Un paso más en tu camino.");
  });
}
function newSessionModal() {
  openModal(
    "Tu próxima sesión.",
    "Elige una base o empieza con tus propios ejercicios.",
    `<div class="field"><label for="session-name">Nombre de la sesión</label><input id="session-name" maxlength="100" value="Mi entrenamiento" placeholder="Ej. Torso A"></div><div class="spacer-top">${routines.map((r, i) => `<div class="routine-card"><h3>${r.name}</h3><p>${r.note} · ${r.ids.length} ejercicios</p>${button("Empezar esta rutina", "use-routine", "arrow", "small", `data-index="${i}"`)}</div>`).join("")}</div><div class="modal-footer">${button("Crear sesión libre", "blank-session", "plus", "primary")}</div>`,
  );
}
function startSession(routine = null) {
  const name =
    $("#session-name")?.value.trim() || routine?.name || "Mi entrenamiento";
  const session = {
    id: uid(),
    date: selectedDate,
    name: routine?.name || name,
    finished: false,
    feeling: 3,
    notes: "",
    exercises: routine
      ? routine.ids.map((id) =>
          makeExercise(exercises.find((e) => e.id === id)),
        )
      : [],
  };
  state.sessions.push(session);
  currentSessionId = session.id;
  view = "training";
  tab = "session";
  closeModal();
  save("Sesión creada. Tú marcas el ritmo.");
  if (!routine) exerciseModal(session.id);
}
function makeExercise(ex) {
  const roles = exerciseMuscles(ex);
  return {
    exerciseId: ex.id,
    name: ex.name,
    muscle: ex.muscle,
    primaryMuscles: roles.primary,
    secondaryMuscles: roles.secondary,
    sets: Array.from({ length: 3 }, () => ({
      kg: 0,
      reps: 10,
      rir: 2,
      done: false,
    })),
  };
}
function exerciseModal(sessionId) {
  openModal(
    "Añade tu próximo ejercicio.",
    "Busca en la biblioteca o crea uno personalizado.",
    `<div class="search">${icon("search")}<input id="exercise-search" placeholder="Buscar sentadilla, pecho, mancuernas…" aria-label="Buscar ejercicio" autofocus></div><div id="exercise-list" class="modal-food-list"></div><div class="modal-footer">${button("Crear ejercicio", "custom-exercise", "plus", "small", `data-id="${sessionId}"`)}</div>`,
  );
  const draw = () => {
    const q = normalize($("#exercise-search").value);
    $("#exercise-list").innerHTML =
      exerciseCatalog()
        .filter((e) => {
          const roles = exerciseMuscles(e);
          const text = normalize(
            [e.name, e.equipment, ...roles.primary, ...roles.secondary].join(
              " ",
            ),
          );
          return q
            .split(/\s+/)
            .every(
              (term) =>
                text.includes(term) || text.replaceAll(" ", "").includes(term),
            );
        })
        .map(
          (e) =>
            `<div class="exercise-picker"><div class="food-emoji">🏋️</div><div><h3>${esc(e.name)}</h3><p>${esc(exerciseMuscles(e).primary.join(" + "))} · ${esc(e.equipment)}</p><p>${exerciseMuscles(e).secondary.length ? "Indirectas: " + esc(exerciseMuscles(e).secondary.join(", ")) : "Sin músculos secundarios asignados"}</p></div>${iconButton("plus", "select-exercise", `Añadir ${e.name}`, `data-id="${e.id}" data-session="${sessionId}"`)}</div>`,
        )
        .join("") ||
      empty(
        "No encontramos ese ejercicio.",
        "Puedes crearlo con el botón de abajo.",
      );
  };
  $("#exercise-search").addEventListener("input", draw);
  draw();
}
function customExerciseModal(sessionId) {
  openModal(
    "Crea tu ejercicio.",
    "Se añadirá a esta sesión y podrás repetirlo copiando la sesión.",
    `<form id="custom-exercise-form"><div class="form-grid"><div class="field wide"><label for="exercise-name">Nombre</label><input id="exercise-name" name="name" maxlength="100" required placeholder="Ej. Remo en máquina" autofocus></div><div class="field wide"><label for="exercise-muscle">Grupo muscular principal</label><select id="exercise-muscle" name="muscle">${muscleNames.map((m) => `<option>${m}</option>`).join("")}</select></div><fieldset class="field wide secondary-muscles"><legend>Músculos secundarios · opcional</legend><div class="muscle-checkboxes">${muscleNames.map((m) => `<label><input type="checkbox" name="secondary" value="${m}"> ${m}</label>`).join("")}</div></fieldset></div><div class="modal-footer"><button type="button" class="btn" data-action="close">Cancelar</button><button class="btn primary" type="submit">Añadir ejercicio</button></div></form>`,
  );
  $("#custom-exercise-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(e.target);
    if (!d.get("name").trim()) return;
    const session = state.sessions.find((s) => s.id === sessionId);
    session.exercises.push(
      makeExercise({
        id: "exercise-" + uid(),
        name: d.get("name").trim(),
        muscle: d.get("muscle"),
        primaryMuscles: [d.get("muscle")],
        secondaryMuscles: d
          .getAll("secondary")
          .filter((m) => m !== d.get("muscle")),
      }),
    );
    closeModal();
    save("Ejercicio añadido.");
  });
}
function editExerciseMuscles(sessionId, index) {
  const exercise = state.sessions.find((s) => s.id === sessionId).exercises[
    index
  ];
  const roles = exerciseMuscles(exercise);
  openModal(
    "Músculos de este ejercicio",
    esc(exercise.name),
    `<form id="exercise-muscles-form"><p class="help-text">Ajusta la participación en esta sesión. Cada músculo puede recibir una serie directa, una indirecta o ninguna por cada serie completada.</p><table class="roles-table"><thead><tr><th>Músculo</th><th>Directo</th><th>Indirecto</th><th>No cuenta</th></tr></thead><tbody>${muscleNames
      .map(
        (m, i) =>
          `<tr><th scope="row">${m}</th>${[
            ["direct", "Directo"],
            ["indirect", "Indirecto"],
            ["none", "No cuenta"],
          ]
            .map(
              ([role, label]) =>
                `<td><input type="radio" name="muscle-${i}" value="${role}" aria-label="${m}: ${label.toLowerCase()}" ${(role === "direct" && roles.primary.includes(m)) || (role === "indirect" && roles.secondary.includes(m)) || (role === "none" && !roles.primary.includes(m) && !roles.secondary.includes(m)) ? "checked" : ""}></td>`,
            )
            .join("")}</tr>`,
      )
      .join(
        "",
      )}</tbody></table><p class="source-note">Selecciona al menos un músculo directo. Los cambios se aplican a todas las series de este ejercicio en esta sesión y actualizan el resumen del periodo.</p><div class="modal-footer"><button class="btn" type="button" data-action="close">Cancelar</button><button class="btn primary" type="submit">Guardar músculos</button></div></form>`,
  );
  $("#exercise-muscles-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const primary = muscleNames.filter(
      (_, i) => form.get("muscle-" + i) === "direct",
    );
    const secondary = muscleNames.filter(
      (_, i) => form.get("muscle-" + i) === "indirect",
    );
    if (!primary.length) {
      toast("Elige al menos un músculo directo.");
      return;
    }
    exercise.primaryMuscles = primary;
    exercise.secondaryMuscles = secondary;
    exercise.muscle = primary[0];
    closeModal();
    save("Distribución de músculos actualizada.");
  });
}
function confirmModal(title, description, onConfirm, label = "Confirmar") {
  openModal(
    title,
    "",
    `<p class="help-text">${description}</p><div class="modal-footer"><button class="btn" data-action="close">Cancelar</button><button class="btn primary" id="confirm-action">${label}</button></div>`,
  );
  $("#confirm-action").addEventListener("click", () => {
    closeModal();
    onConfirm();
  });
}
function exportData() {
  const blob = new Blob(
    [
      JSON.stringify(
        { ...state, exportedAt: new Date().toISOString() },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pulso-copia-${today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Copia de seguridad exportada.");
}
async function importFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > 10 * 1024 * 1024) throw Error("large");
    const data = JSON.parse(await file.text());
    if (!validState(data)) throw Error("invalid");
    confirmModal(
      "Importar tu copia de seguridad",
      `La copia contiene ${data.entries.length} alimentos registrados, ${data.sessions.length} sesiones y ${data.weights.length} registros de peso. Sustituirá tus datos actuales. Exporta una copia antes si quieres conservarlos.`,
      () => {
        state = data;
        currentSessionId = null;
        save("Copia importada correctamente.");
      },
      "Sustituir mis datos",
    );
  } catch {
    toast("No se pudo importar. Usa una copia válida de Pulso de hasta 10 MB.");
  } finally {
    e.target.value = "";
  }
}
document.addEventListener("click", (e) => {
  const period = e.target.closest("[data-training-window]");
  if (period) {
    state.trainingWindow = period.dataset.trainingWindow;
    save();
    return;
  }
  const nav = e.target.closest("[data-nav]");
  if (nav) {
    view = nav.dataset.nav;
    render();
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }
  const tt = e.target.closest("[data-training-tab]");
  if (tt) {
    tab = tt.dataset.trainingTab;
    render();
    return;
  }
  const pt = e.target.closest("[data-progress-tab]");
  if (pt) {
    progressTab = pt.dataset.progressTab;
    render();
    return;
  }
  const filter = e.target.closest("[data-food-filter]");
  if (filter) {
    foodFilter = filter.dataset.foodFilter;
    render();
    return;
  }
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const d = b.dataset;
  switch (d.action) {
    case "close":
      closeModal();
      break;
    case "settings":
      view = "goals";
      render();
      break;
    case "start":
      openModal(
        "Vamos a hacerlo tuyo.",
        "Configura tus objetivos para empezar desde cero.",
        goalsForm(true),
      );
      bindGoals();
      break;
    case "add-food":
      showFoodPicker(d.meal || "Desayuno");
      break;
    case "select-food":
    case "pick-direct": {
      const f =
        findFood(d.id) || state.entries.find((e) => e.food.id === d.id)?.food;
      if (f) portionModal(f, d.meal || "Desayuno");
      break;
    }
    case "edit-entry": {
      const entry = state.entries.find((e) => e.id === d.id);
      portionModal(entry.food, entry.meal, entry);
      break;
    }
    case "delete-entry":
      state.entries = state.entries.filter((e) => e.id !== d.id);
      save("Alimento eliminado del diario.");
      break;
    case "duplicate-entry": {
      const entry = state.entries.find((e) => e.id === d.id);
      state.entries.push({ ...structuredClone(entry), id: uid() });
      save("Alimento repetido con la misma porción.");
      break;
    }
    case "copy-day": {
      const previous = state.entries.filter(
        (e) => e.date === shiftDate(selectedDate, -1),
      );
      if (!previous.length) {
        toast("El día anterior no tiene alimentos registrados.");
        break;
      }
      confirmModal(
        "Repetir el día anterior",
        `Se añadirán ${previous.length} alimentos con sus mismas porciones al ${dateLabel(selectedDate)}. Los alimentos actuales se conservarán.`,
        () => {
          state.entries.push(
            ...previous.map((e) => ({
              ...structuredClone(e),
              id: uid(),
              date: selectedDate,
            })),
          );
          save("Alimentos del día anterior añadidos.");
        },
        "Añadir alimentos",
      );
      break;
    }
    case "custom-food":
      customFoodModal(null, d.meal || "Desayuno");
      break;
    case "edit-custom":
      customFoodModal(state.customFoods.find((f) => f.id === d.id));
      break;
    case "favorite":
      state.favorites = state.favorites.includes(d.id)
        ? state.favorites.filter((id) => id !== d.id)
        : [...state.favorites, d.id];
      save();
      break;
    case "weight":
      weightModal(d.date || selectedDate);
      break;
    case "delete-weight":
      confirmModal(
        "Eliminar registro de peso",
        `Se eliminará el registro del ${dateLabel(d.date)}.`,
        () => {
          state.weights = state.weights.filter((w) => w.date !== d.date);
          save("Registro eliminado.");
        },
        "Eliminar",
      );
      break;
    case "new-session":
      newSessionModal();
      break;
    case "blank-session":
      startSession();
      break;
    case "use-routine":
      startSession(routines[+d.index]);
      break;
    case "add-exercise":
      exerciseModal(d.id);
      break;
    case "select-exercise": {
      const s = state.sessions.find((s) => s.id === d.session);
      s.exercises.push(
        makeExercise(exerciseCatalog().find((e) => e.id === d.id)),
      );
      closeModal();
      save("Ejercicio añadido a tu sesión.");
      break;
    }
    case "custom-exercise":
      customExerciseModal(d.id);
      break;
    case "edit-exercise-muscles":
      editExerciseMuscles(d.session, +d.ei);
      break;
    case "rename-session": {
      const s = state.sessions.find((s) => s.id === d.id);
      openModal(
        "Nombre de la sesión",
        "",
        `<form id="rename-form"><div class="field"><label for="rename-input">Nombre</label><input id="rename-input" maxlength="100" required value="${esc(s.name)}"></div><div class="modal-footer"><button class="btn primary" type="submit">Guardar nombre</button></div></form>`,
      );
      $("#rename-form").addEventListener("submit", (e) => {
        e.preventDefault();
        if (!$("#rename-input").value.trim()) return;
        s.name = $("#rename-input").value.trim();
        closeModal();
        save("Nombre actualizado.");
      });
      break;
    }
    case "delete-session":
      confirmModal(
        "Eliminar sesión",
        "Se eliminará esta sesión y sus series registradas.",
        () => {
          state.sessions = state.sessions.filter((s) => s.id !== d.id);
          currentSessionId = null;
          save("Sesión eliminada.");
        },
        "Eliminar sesión",
      );
      break;
    case "remove-exercise": {
      const s = state.sessions.find((s) => s.id === d.session),
        ex = s.exercises[+d.ei];
      const remove = () => {
        s.exercises.splice(+d.ei, 1);
        save("Ejercicio eliminado.");
      };
      if (ex.sets.some((t) => t.done))
        confirmModal(
          "Quitar ejercicio",
          `Se quitará ${esc(ex.name)} y sus series completadas.`,
          remove,
          "Quitar ejercicio",
        );
      else remove();
      break;
    }
    case "add-set": {
      const s = state.sessions.find((s) => s.id === d.session),
        ex = s.exercises[+d.ei];
      ex.sets.push({
        ...(ex.sets.at(-1) || { kg: 0, reps: 10, rir: 2 }),
        done: false,
      });
      save();
      break;
    }
    case "remove-set": {
      const ex = state.sessions.find((s) => s.id === d.session).exercises[
        +d.ei
      ];
      ex.sets.splice(+d.si, 1);
      save();
      break;
    }
    case "toggle-set": {
      const s = state.sessions.find((s) => s.id === d.session),
        set = s.exercises[+d.ei].sets[+d.si];
      set.done = !set.done;
      save();
      break;
    }
    case "feeling":
      state.sessions.find((s) => s.id === d.id).feeling = +d.value;
      save();
      break;
    case "finish-session": {
      const s = state.sessions.find((s) => s.id === d.id);
      if (!s.finished && !completedSets(s).length) {
        toast("Marca al menos una serie como realizada para finalizar.");
        break;
      }
      s.finished = !s.finished;
      save(
        s.finished
          ? "Sesión completada. Cada serie cuenta."
          : "Sesión reabierta.",
      );
      break;
    }
    case "open-session":
      currentSessionId = d.id;
      selectedDate = state.sessions.find((s) => s.id === d.id).date;
      tab = "session";
      render();
      break;
    case "repeat-session": {
      const source = state.sessions.find((s) => s.id === d.id);
      const copied = {
        ...structuredClone(source),
        id: uid(),
        date: today(),
        finished: false,
        notes: "",
        feeling: 3,
      };
      for (const ex of copied.exercises)
        for (const set of ex.sets) set.done = false;
      state.sessions.push(copied);
      currentSessionId = copied.id;
      selectedDate = today();
      tab = "session";
      save("Sesión repetida para hoy. Las series están pendientes.");
      break;
    }
    case "export":
      exportData();
      break;
    case "import":
      $("#import-file")?.click();
      break;
    case "load-demo":
      confirmModal(
        "Explorar los datos de ejemplo",
        "La demo sustituirá los registros actuales de este navegador. Exporta tu copia antes para conservarlos.",
        () => {
          state = seedDemo();
          currentSessionId = null;
          view = "home";
          save("Vista de ejemplo cargada.");
        },
        "Cargar demo",
      );
      break;
  }
});
$("#modal").addEventListener("click", (e) => {
  if (e.target === $("#modal")) {
    const r = $("#modal").getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      closeModal();
  }
});
$("#modal").addEventListener("cancel", () => {
  modalCleanup();
});
async function init() {
  try {
    const response = await fetch("foods.json");
    if (!response.ok) throw Error();
    foods = await response.json();
    try {
      const stored = localStorage.getItem(STORAGE);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!validState(parsed)) throw Error("invalid-state");
        state = parsed;
      } else {
        state = seedDemo();
        persist();
      }
    } catch {
      state = defaults();
      storageFailed = true;
      toast(
        "No se pudo leer el almacenamiento. Importa una copia o exporta antes de cerrar.",
      );
    }
    render();
  } catch {
    $("#app").innerHTML =
      '<main style="max-width:500px;margin:15vh auto;padding:25px;font-family:sans-serif"><h1>No pudimos abrir la biblioteca.</h1><p style="margin-top:20px">Revisa tu conexión y vuelve a cargar la página.</p><button class="btn primary" onclick="location.reload()" style="margin-top:20px">Volver a intentar</button></main>';
  }
}
init();
