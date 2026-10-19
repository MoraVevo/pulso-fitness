export const muscleNames = [
  "Pecho",
  "Espalda",
  "Deltoides",
  "Tríceps",
  "Bíceps",
  "Cuádriceps",
  "Isquiotibiales",
  "Glúteos",
  "Pantorrillas",
  "Core",
  "Trapecios",
  "Antebrazos",
  "Aductores",
];

export const canonicalMuscle = (name) =>
  name === "Hombros" ? "Deltoides" : name;

// Roles de registro editables: se cuentan series de trabajo, no equivalencias de estímulo.
const rows = [
  ["bench", "Press de banca", "Barra", ["Pecho"], ["Deltoides", "Tríceps"]],
  [
    "machine-press",
    "Press de pecho en máquina",
    "Máquina",
    ["Pecho"],
    ["Deltoides", "Tríceps"],
  ],
  [
    "dumbbell-press",
    "Press de banca con mancuernas",
    "Mancuernas",
    ["Pecho"],
    ["Deltoides", "Tríceps"],
  ],
  [
    "incline",
    "Press inclinado con mancuernas",
    "Mancuernas",
    ["Pecho"],
    ["Deltoides", "Tríceps"],
  ],
  [
    "incline-barbell",
    "Press inclinado con barra",
    "Barra",
    ["Pecho"],
    ["Deltoides", "Tríceps"],
  ],
  [
    "incline-machine",
    "Press inclinado en máquina",
    "Máquina",
    ["Pecho"],
    ["Deltoides", "Tríceps"],
  ],
  [
    "smith-press",
    "Press de banca en Smith",
    "Máquina Smith",
    ["Pecho"],
    ["Deltoides", "Tríceps"],
  ],
  [
    "decline-press",
    "Press declinado",
    "Barra",
    ["Pecho"],
    ["Deltoides", "Tríceps"],
  ],
  [
    "pushup",
    "Flexiones (push ups)",
    "Peso corporal",
    ["Pecho"],
    ["Deltoides", "Tríceps"],
  ],
  [
    "incline-pushup",
    "Flexiones inclinadas",
    "Peso corporal",
    ["Pecho"],
    ["Deltoides", "Tríceps"],
  ],
  ["fly", "Aperturas con mancuernas", "Mancuernas", ["Pecho"], ["Deltoides"]],
  ["pec-deck", "Aperturas en máquina (pec deck)", "Máquina", ["Pecho"], []],
  ["cable-fly", "Aperturas en polea", "Polea", ["Pecho"], ["Deltoides"]],
  [
    "dips",
    "Fondos en paralelas",
    "Peso corporal",
    ["Pecho"],
    ["Tríceps", "Deltoides"],
  ],
  ["pulldown", "Jalón al pecho", "Polea", ["Espalda"], ["Bíceps"]],
  [
    "neutral-pulldown",
    "Jalón con agarre neutro",
    "Polea",
    ["Espalda"],
    ["Bíceps"],
  ],
  ["row", "Remo con barra", "Barra", ["Espalda"], ["Bíceps", "Deltoides"]],
  ["cable-row", "Remo sentado", "Polea", ["Espalda"], ["Bíceps", "Deltoides"]],
  [
    "machine-row",
    "Remo en máquina",
    "Máquina",
    ["Espalda"],
    ["Bíceps", "Deltoides"],
  ],
  [
    "dumbbell-row",
    "Remo con mancuerna",
    "Mancuerna",
    ["Espalda"],
    ["Bíceps", "Deltoides"],
  ],
  [
    "chest-supported-row",
    "Remo con pecho apoyado",
    "Mancuernas",
    ["Espalda"],
    ["Bíceps", "Deltoides"],
  ],
  ["pullup", "Dominadas", "Peso corporal", ["Espalda"], ["Bíceps"]],
  ["chinup", "Dominadas supinas", "Peso corporal", ["Espalda"], ["Bíceps"]],
  ["pullover", "Pullover en polea", "Polea", ["Espalda"], []],
  ["squat", "Sentadilla con barra", "Barra", ["Cuádriceps", "Glúteos"], []],
  ["front-squat", "Sentadilla frontal", "Barra", ["Cuádriceps"], ["Glúteos"]],
  [
    "goblet-squat",
    "Sentadilla goblet",
    "Mancuerna",
    ["Cuádriceps"],
    ["Glúteos"],
  ],
  ["hack-squat", "Sentadilla hack", "Máquina", ["Cuádriceps"], ["Glúteos"]],
  ["legpress", "Prensa de piernas", "Máquina", ["Cuádriceps"], ["Glúteos"]],
  ["extension", "Extensión de cuádriceps", "Máquina", ["Cuádriceps"], []],
  ["lunge", "Zancadas", "Mancuernas", ["Cuádriceps", "Glúteos"], []],
  [
    "bulgarian",
    "Sentadilla búlgara",
    "Mancuernas",
    ["Cuádriceps", "Glúteos"],
    [],
  ],
  [
    "step-up",
    "Subida al banco (step up)",
    "Mancuernas",
    ["Cuádriceps", "Glúteos"],
    [],
  ],
  ["rdl", "Peso muerto rumano", "Barra", ["Isquiotibiales", "Glúteos"], []],
  [
    "dumbbell-rdl",
    "Peso muerto rumano con mancuernas",
    "Mancuernas",
    ["Isquiotibiales", "Glúteos"],
    [],
  ],
  ["legcurl", "Curl femoral tumbado", "Máquina", ["Isquiotibiales"], []],
  ["seated-legcurl", "Curl femoral sentado", "Máquina", ["Isquiotibiales"], []],
  [
    "deadlift",
    "Peso muerto convencional",
    "Barra",
    ["Glúteos", "Espalda"],
    ["Isquiotibiales", "Cuádriceps"],
  ],
  [
    "hipthrust",
    "Hip thrust con barra",
    "Barra",
    ["Glúteos"],
    ["Isquiotibiales"],
  ],
  [
    "machine-hipthrust",
    "Hip thrust en máquina",
    "Máquina",
    ["Glúteos"],
    ["Isquiotibiales"],
  ],
  ["kickback", "Patada de glúteo", "Polea", ["Glúteos"], []],
  ["abduction", "Abducción de cadera", "Máquina", ["Glúteos"], []],
  ["adduction", "Aducción de cadera", "Máquina", ["Aductores"], []],
  ["ohp", "Press militar", "Barra", ["Deltoides"], ["Tríceps"]],
  [
    "dumbbell-ohp",
    "Press de hombros con mancuernas",
    "Mancuernas",
    ["Deltoides"],
    ["Tríceps"],
  ],
  [
    "machine-ohp",
    "Press de hombros en máquina",
    "Máquina",
    ["Deltoides"],
    ["Tríceps"],
  ],
  ["lateral", "Elevaciones laterales", "Mancuernas", ["Deltoides"], []],
  [
    "cable-lateral",
    "Elevaciones laterales en polea",
    "Polea",
    ["Deltoides"],
    [],
  ],
  [
    "rear-delt",
    "Pájaros para deltoides posterior",
    "Mancuernas",
    ["Deltoides"],
    ["Espalda"],
  ],
  [
    "reverse-pec-deck",
    "Aperturas inversas en máquina",
    "Máquina",
    ["Deltoides"],
    ["Espalda"],
  ],
  ["facepull", "Face pull", "Polea", ["Deltoides"], ["Espalda"]],
  ["shrug", "Encogimientos de trapecio", "Mancuernas", ["Trapecios"], []],
  ["curl", "Curl de bíceps con mancuernas", "Mancuernas", ["Bíceps"], []],
  ["barbell-curl", "Curl de bíceps con barra", "Barra", ["Bíceps"], []],
  ["hammer", "Curl martillo", "Mancuernas", ["Bíceps"], ["Antebrazos"]],
  ["preacher-curl", "Curl en banco predicador", "Barra EZ", ["Bíceps"], []],
  ["cable-curl", "Curl de bíceps en polea", "Polea", ["Bíceps"], []],
  ["triceps", "Extensión de tríceps en polea", "Polea", ["Tríceps"], []],
  [
    "overhead",
    "Extensión de tríceps sobre la cabeza",
    "Mancuerna",
    ["Tríceps"],
    [],
  ],
  ["skullcrusher", "Press francés", "Barra EZ", ["Tríceps"], []],
  [
    "close-grip-press",
    "Press de banca con agarre cerrado",
    "Barra",
    ["Tríceps"],
    ["Pecho", "Deltoides"],
  ],
  ["crunch", "Crunch abdominal", "Peso corporal", ["Core"], []],
  ["cablecrunch", "Crunch en polea", "Polea", ["Core"], []],
  ["leg-raise", "Elevaciones de piernas", "Peso corporal", ["Core"], []],
  ["ab-wheel", "Rueda abdominal", "Rueda", ["Core"], []],
  ["calf", "Elevación de talones de pie", "Máquina", ["Pantorrillas"], []],
  [
    "seated-calf",
    "Elevación de talones sentado",
    "Máquina",
    ["Pantorrillas"],
    [],
  ],
  ["wrist-curl", "Curl de muñeca", "Mancuernas", ["Antebrazos"], []],
];

export const exercises = rows.map(
  ([id, name, equipment, primaryMuscles, secondaryMuscles]) => ({
    id,
    name,
    equipment,
    muscle: primaryMuscles[0],
    primaryMuscles,
    secondaryMuscles,
  }),
);
const byId = new Map(exercises.map((ex) => [ex.id, ex]));

export function exerciseMuscles(exercise) {
  const definition = byId.get(exercise.exerciseId || exercise.id);
  const primary = [
    ...new Set(
      (
        exercise.primaryMuscles ??
        definition?.primaryMuscles ?? [exercise.muscle]
      )
        .filter(Boolean)
        .map(canonicalMuscle),
    ),
  ];
  const secondary = [
    ...new Set(
      (exercise.secondaryMuscles ?? definition?.secondaryMuscles ?? [])
        .filter(Boolean)
        .map(canonicalMuscle),
    ),
  ].filter((m) => !primary.includes(m));
  return { primary, secondary };
}
