import { exercises, exerciseMuscles } from "./exercises.js";

export const movementGroups = [
  { id: "push", name: "Empuje", detail: "Pecho, hombros y tríceps" },
  { id: "pull", name: "Jale", detail: "Espalda y bíceps" },
  { id: "legs", name: "Pierna", detail: "Rodilla, cadera y pantorrillas" },
  { id: "core", name: "Core", detail: "Abdomen y estabilidad" },
];
const patterns = [
  [
    "press",
    "push",
    "Empuje horizontal",
    "bench machine-press dumbbell-press smith-press decline-press close-grip-press",
  ],
  [
    "incline",
    "push",
    "Empuje inclinado",
    "incline incline-barbell incline-machine",
  ],
  ["pushup", "push", "Flexión de brazos", "pushup incline-pushup"],
  ["fly", "push", "Apertura de pecho", "fly pec-deck cable-fly"],
  ["dip", "push", "Fondos", "dips"],
  ["overhead-press", "push", "Empuje vertical", "ohp dumbbell-ohp machine-ohp"],
  ["lateral", "push", "Elevación lateral", "lateral cable-lateral"],
  ["triceps", "push", "Extensión de codo", "triceps"],
  ["overhead-extension", "push", "Extensión sobre la cabeza", "overhead"],
  ["lying-extension", "push", "Extensión tumbado", "skullcrusher"],
  ["pulldown", "pull", "Jale vertical", "pulldown neutral-pulldown"],
  ["pullup", "pull", "Dominada", "pullup chinup"],
  ["row", "pull", "Jale horizontal", "row dumbbell-row"],
  [
    "seated-row",
    "pull",
    "Remo sentado / apoyado",
    "cable-row machine-row chest-supported-row",
  ],
  ["pullover", "pull", "Extensión de hombro", "pullover"],
  ["rear-delt", "pull", "Apertura posterior", "rear-delt reverse-pec-deck"],
  ["facepull", "pull", "Jale hacia la cara", "facepull"],
  ["shrug", "pull", "Elevación escapular", "shrug"],
  [
    "curl",
    "pull",
    "Flexión de codo",
    "curl barbell-curl hammer preacher-curl cable-curl",
  ],
  ["wrist", "pull", "Flexión de muñeca", "wrist-curl"],
  ["squat", "legs", "Sentadilla", "squat front-squat goblet-squat hack-squat"],
  ["legpress", "legs", "Prensa", "legpress"],
  ["extension", "legs", "Extensión de rodilla", "extension"],
  ["legcurl", "legs", "Flexión de rodilla", "legcurl seated-legcurl"],
  ["lunge", "legs", "Zancada / unilateral", "lunge bulgarian step-up"],
  ["hinge", "legs", "Bisagra de cadera", "rdl dumbbell-rdl deadlift"],
  ["bridge", "legs", "Extensión de cadera", "hipthrust machine-hipthrust"],
  ["kickback", "legs", "Patada de glúteo", "kickback"],
  ["abduction", "legs", "Abducción de cadera", "abduction"],
  ["adduction", "legs", "Aducción de cadera", "adduction"],
  ["calf", "legs", "Elevación de talón", "calf seated-calf"],
  ["crunch", "core", "Flexión del tronco", "crunch cablecrunch"],
  ["leg-raise", "core", "Elevación de piernas", "leg-raise"],
  ["rollout", "core", "Antiextensión", "ab-wheel"],
];
const definitions = new Map(
  patterns.flatMap(([pattern, group, label, ids]) =>
    ids.split(" ").map((id) => [id, { pattern, group, label }]),
  ),
);
export function exerciseMovement(ex) {
  const defined = definitions.get(ex.exerciseId || ex.id);
  if (defined) return defined;
  const muscle = exerciseMuscles(ex).primary[0];
  const inferred =
    muscle === "Core"
      ? "core"
      : [
            "Cuádriceps",
            "Isquiotibiales",
            "Glúteos",
            "Pantorrillas",
            "Aductores",
          ].includes(muscle)
        ? "legs"
        : ["Espalda", "Bíceps", "Trapecios", "Antebrazos"].includes(muscle)
          ? "pull"
          : "push";
  const group = movementGroups.some((g) => g.id === ex.movement)
    ? ex.movement
    : inferred;
  const pattern = { push: "press", pull: "row", legs: "squat", core: "crunch" }[
    group
  ];
  return {
    group,
    pattern,
    label: movementGroups.find((g) => g.id === group).name,
  };
}

// Dibujos originales: la postura y el equipo identifican la familia del movimiento.
const head = (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="#e2ebd4"/>`;
const body = (d) => `<path class="figure-body" d="${d}"/>`;
const equipment = (d) => `<path class="figure-equipment" d="${d}"/>`;
const bench = equipment("M25 56H83M31 56V75M76 56V75");
const floor = equipment("M12 78H108");
function load(ex, x, y) {
  const kind = ex.equipment || "";
  if (/barra|smith/i.test(kind))
    return equipment(`M${x - 19} ${y}h38m-32 -5v10m26 -10v10`);
  if (/polea|máquina/i.test(kind))
    return equipment(
      `M${x} ${y}V9H103V76M${x - 7} ${y}h14M96 51h12m-12 6h12m-12 6h12`,
    );
  return equipment(`M${x - 8} ${y}h16m-16 -4v8m16 -8v8`);
}
const poses = {
  press: (e) =>
    bench +
    head(31, 44) +
    body("M42 47H70L86 70H100M46 47L52 29V20") +
    load(e, 52, 19),
  incline: (e) =>
    equipment("M25 34L73 59H90M32 39V75M79 59V75") +
    head(32, 25) +
    body("M39 35L66 50L85 70H99M44 38L56 28V13") +
    load(e, 56, 13),
  pushup: () =>
    floor + head(26, 39) + body("M36 43L74 51L104 72M44 45L40 61L49 73"),
  fly: (e) =>
    equipment("M52 26V73H69V26Z") +
    head(60, 19) +
    body(
      "M60 31V55M60 36L37 31L25 18M60 36L83 31L95 18M60 55L47 73M60 55L73 73",
    ) +
    load(e, 23, 16) +
    equipment("M89 12v8m12 -8v8M89 16h12"),
  dip: () =>
    equipment("M20 38H40V77M80 38H100M86 38V77") +
    head(59, 21) +
    body("M59 33L65 55L52 69L34 67M59 36L42 49L34 38M61 36L78 49L86 38"),
  "overhead-press": (e) =>
    head(60, 31) +
    body("M60 43V60M60 60L44 76M60 60L76 76M60 43L39 34V16M60 43L80 34V16") +
    load(e, 60, 12),
  lateral: (e) =>
    head(60, 19) +
    body(
      "M60 31V56M60 56L47 77M60 56L73 77M60 35L37 32L20 29M60 35L83 32L100 29",
    ) +
    load(e, 18, 30) +
    equipment("M94 26v8m12 -8v8M94 30h12"),
  triceps: (e) =>
    head(50, 22) +
    body("M50 34V58L39 77M50 58L65 77M50 38L65 44L72 62") +
    load(e, 74, 62),
  "overhead-extension": (e) =>
    head(60, 30) +
    body(
      "M60 42V59M60 59L45 77M60 59L75 77M60 43L43 19L61 10M60 43L77 19L61 10",
    ) +
    load(e, 61, 9),
  "lying-extension": (e) =>
    bench +
    head(31, 44) +
    body("M42 47H70L86 70H100M46 47L49 22L30 25") +
    load(e, 29, 24),
  pulldown: (e) =>
    equipment("M16 13H103V77M28 69H80M35 69V78M26 9h54") +
    head(53, 35) +
    body("M53 47V63L76 66L82 77M53 48L31 36L28 23M53 48L75 36L78 23") +
    load(e, 53, 22),
  pullup: () =>
    equipment("M14 11H106M22 11V78M98 11V78") +
    head(60, 30) +
    body(
      "M60 42V61L74 73L84 68M60 61L46 73L36 68M60 44L39 25L33 12M60 44L81 25L87 12",
    ),
  row: (e) =>
    floor +
    head(35, 23) +
    body("M43 32L68 47L61 60L70 76M68 47L86 61L95 76M44 35L37 54L52 60") +
    load(e, 53, 61),
  "seated-row": (e) =>
    equipment("M19 63H61M26 63V78M99 14V77M91 73h15") +
    head(38, 23) +
    body("M38 35L42 57L70 61L88 74M39 39L56 47L68 41") +
    load(e, 71, 41),
  pullover: (e) =>
    floor +
    head(47, 21) +
    body("M49 33L63 52L58 64L48 77M63 52L78 65L85 77M51 37L71 54L83 60") +
    load(e, 83, 60),
  "rear-delt": () =>
    floor +
    head(58, 28) +
    body(
      "M58 40V58M58 58L46 76M58 58L70 76M58 42L31 43L17 33M58 42L85 43L101 33",
    ) +
    equipment("M12 29v9m10 -9v9M12 34h10M97 29v9m10 -9v9M97 34h10"),
  facepull: (e) =>
    head(42, 24) +
    body("M42 36V57M42 57L31 77M42 57L57 77M42 39L66 45L57 28") +
    load(e, 63, 28),
  shrug: (e) =>
    head(60, 17) +
    body(
      "M60 29V57M60 57L47 77M60 57L73 77M60 31L41 36L38 55M60 31L79 36L82 55",
    ) +
    load(e, 38, 57) +
    equipment("M76 53v8m12 -8v8M76 57h12"),
  curl: (e) =>
    head(52, 19) +
    body("M52 31V57M52 57L39 77M52 57L67 77M52 36L65 52L78 34") +
    load(e, 79, 33),
  wrist: (e) =>
    equipment("M28 59H79M33 59V78M72 59V78") +
    head(39, 22) +
    body("M40 34L49 50L66 57L64 77M43 38L57 48H79L86 56") +
    load(e, 88, 58),
  squat: (e) =>
    floor +
    head(51, 20) +
    body("M51 32L60 49L35 57L45 76H59M60 49L82 58L76 76H91M51 34L39 42L34 31") +
    load(e, 50, 30),
  legpress: () =>
    equipment(
      "M17 49L41 69H58M20 52L13 72M75 20L103 46M80 24L48 77M98 41L65 78",
    ) +
    head(24, 34) +
    body("M29 45L45 58L62 39L82 37M30 47L42 52"),
  extension: () =>
    equipment("M21 20V61H64M25 61V78M60 61V78M86 56v13") +
    head(38, 22) +
    body("M38 34V53L63 54L89 59M38 39L51 48"),
  legcurl: () =>
    equipment("M15 54H88M20 54V77M80 54V77M90 22v13") +
    head(20, 42) +
    body("M31 46H64L79 48L89 26M37 46L28 61L18 61"),
  lunge: (e) =>
    floor +
    head(51, 17) +
    body("M51 29V48L79 51L84 76H100M51 48L33 66L21 76H36M51 33L40 44L33 52") +
    load(e, 32, 54),
  hinge: (e) =>
    floor +
    head(36, 25) +
    body("M44 33L71 48L68 62L77 76H94M71 48L51 62L48 76H64M44 37L43 63") +
    load(e, 43, 65),
  bridge: (e) =>
    equipment("M15 51H41M21 51V78") +
    head(23, 40) +
    body("M33 46L58 43L80 51L88 76H102M40 44L49 53") +
    load(e, 59, 41),
  kickback: (e) =>
    equipment("M21 15V77H33") +
    head(42, 20) +
    body("M43 32L59 48L54 77M59 48L85 52L104 42M44 36L25 31") +
    load(e, 103, 43),
  abduction: () =>
    equipment("M41 40H79V70M43 70V78M77 70V78") +
    head(60, 18) +
    body("M60 30V52L31 58L22 76M60 52L89 58L98 76M60 35L41 45M60 35L79 45") +
    equipment("M23 55l-9 3m82 -3l9 3"),
  adduction: () =>
    equipment("M41 40H79V70M43 70V78M77 70V78") +
    head(60, 18) +
    body("M60 30V52L47 59L53 77M60 52L73 59L67 77M60 35L41 45M60 35L79 45") +
    equipment("M30 56l9 2m51 -2l-9 2"),
  calf: (e) =>
    equipment("M38 80V71H83V80") +
    head(59, 15) +
    body("M59 27V51L52 66L54 73H68M59 51L70 65L72 73H84M59 32L42 40V51") +
    load(e, 40, 53),
  crunch: () =>
    floor +
    head(39, 47) +
    body("M47 53L62 69L83 47L102 75M48 54L62 43M62 69H40"),
  "leg-raise": () =>
    equipment("M18 67H101M23 67V78M93 67V78") +
    head(23, 54) +
    body("M34 59H65L83 23M65 59L95 27M39 60L30 69"),
  rollout: () =>
    floor +
    head(66, 37) +
    body("M59 45L40 59L32 74H16M60 45L83 62L94 66") +
    equipment("M98 58v17m-5 -16v17M89 67h18"),
};
export function exerciseSvg(ex) {
  const { pattern, group } = exerciseMovement(ex);
  const original = exercises.find(
    (item) => item.id === (ex.exerciseId || ex.id),
  );
  const drawing = {
    ...ex,
    equipment: ex.equipment || original?.equipment || "Personalizado",
  };
  return `<svg class="exercise-art group-${group}" data-illustration="${pattern}" viewBox="0 0 120 88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${poses[pattern](drawing)}</svg>`;
}
