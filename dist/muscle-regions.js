import { exercises, exerciseMuscles } from "./exercises.js";

// Registration categories, not measurements of activation or equivalent stimulus.
// Reference: ACE exercise library; shoulder portions and back muscles are kept separate.
export const muscleRegions = {
  Pecho: [["pec-clavicular", "Pectoral · porción clavicular"], ["pec-sternal", "Pectoral · porción esternocostal"]],
  Espalda: [["lats", "Dorsales"], ["rhomboids", "Romboides"], ["erectors", "Erectores espinales · zona lumbar"]],
  Deltoides: [["delt-front", "Deltoides anterior"], ["delt-side", "Deltoides lateral"], ["delt-rear", "Deltoides posterior"]],
  Tríceps: [["tri-long", "Cabeza larga"], ["tri-lateral", "Cabeza lateral"], ["tri-medial", "Cabeza medial"]],
  Bíceps: [["biceps", "Bíceps braquial"], ["brachialis", "Braquial"]],
  Cuádriceps: [["rectus-femoris", "Recto femoral"], ["vastus-lateral", "Vasto lateral"], ["vastus-medial", "Vasto medial"], ["vastus-intermediate", "Vasto intermedio"]],
  Isquiotibiales: [["biceps-femoris", "Bíceps femoral"], ["semitendinosus", "Semitendinoso"], ["semimembranosus", "Semimembranoso"]],
  Glúteos: [["glute-max", "Glúteo mayor"], ["glute-med", "Glúteo medio"], ["glute-min", "Glúteo menor"]],
  Pantorrillas: [["gastrocnemius", "Gastrocnemio · gemelos"], ["soleus", "Sóleo"]],
  Core: [["abs", "Recto abdominal"], ["obliques", "Oblicuos"], ["transverse", "Transverso abdominal"]],
  Trapecios: [["trap-upper", "Trapecio superior"], ["trap-middle", "Trapecio medio"], ["trap-lower", "Trapecio inferior"]],
  Antebrazos: [["forearm-flexors", "Flexores de muñeca"], ["forearm-extensors", "Extensores de muñeca"], ["brachioradialis", "Braquiorradial"]],
  Aductores: [["adductor-magnus", "Aductor mayor"], ["adductor-longus", "Aductor largo"], ["adductor-brevis", "Aductor corto"]],
};

const ids = (group) => muscleRegions[group].map(([id]) => id);
const definitions = new Map(exercises.map((ex) => [ex.id, ex]));
const assignments = new Map();
function assign(exerciseIds, group, direct, indirect = []) {
  for (const id of exerciseIds.split(" ")) {
    const entry = assignments.get(id) || {};
    entry[group] = { direct, indirect };
    assignments.set(id, entry);
  }
}

assign("bench machine-press dumbbell-press incline incline-barbell incline-machine smith-press decline-press pushup incline-pushup fly cable-fly dips close-grip-press", "Deltoides", ["delt-front"]);
assign("ohp dumbbell-ohp machine-ohp", "Deltoides", ["delt-front"], ["delt-side"]);
assign("lateral cable-lateral", "Deltoides", ["delt-side"]);
assign("rear-delt reverse-pec-deck facepull row cable-row machine-row dumbbell-row chest-supported-row", "Deltoides", ["delt-rear"]);
assign("pulldown neutral-pulldown pullup chinup pullover", "Espalda", ["lats"]);
assign("row", "Espalda", ["lats", "rhomboids"], ["erectors"]);
assign("cable-row machine-row dumbbell-row chest-supported-row", "Espalda", ["lats", "rhomboids"]);
assign("rear-delt reverse-pec-deck facepull", "Espalda", ["rhomboids"]);
assign("deadlift", "Espalda", ["erectors"]);
assign("shrug", "Trapecios", ["trap-upper"]);
assign("abduction", "Glúteos", ["glute-med", "glute-min"]);
assign("seated-calf", "Pantorrillas", ["soleus"]);
assign("hammer", "Antebrazos", ["brachioradialis"]);
assign("wrist-curl", "Antebrazos", ["forearm-flexors"]);
assign("extension", "Cuádriceps", ids("Cuádriceps"));
assign("ab-wheel", "Core", ["abs"], ["obliques", "transverse"]);

const general = {
  Pecho: ids("Pecho"), Tríceps: ids("Tríceps"), Bíceps: ids("Bíceps"),
  Cuádriceps: ids("Cuádriceps").filter((id) => id !== "rectus-femoris"),
  Isquiotibiales: ids("Isquiotibiales"), Glúteos: ["glute-max"],
  Pantorrillas: ids("Pantorrillas"), Core: ["abs"], Aductores: ids("Aductores"),
};

export function exerciseRegions(exercise) {
  const roles = exerciseMuscles(exercise);
  const id = exercise.exerciseId || exercise.id;
  const definition = definitions.get(id);
  const original = definition && exerciseMuscles(definition);
  const result = {};
  for (const group of [...roles.primary, ...roles.secondary]) {
    if (!Object.hasOwn(muscleRegions, group)) continue;
    const allowed = new Set(ids(group));
    const saved = exercise.muscleRegions;
    const override = saved && Object.hasOwn(saved, group);
    const catalogRole = original?.primary.includes(group) ? "direct"
      : original?.secondary.includes(group) ? "indirect" : null;
    const fallback = catalogRole && (assignments.get(id)?.[group]
      || { direct: general[group] || [], indirect: [] });
    const source = override ? saved[group] : fallback;
    let direct = [...new Set((source?.direct || []).filter((r) => allowed.has(r)))];
    let indirect = [...new Set((source?.indirect || []).filter((r) => allowed.has(r)))].filter((r) => !direct.includes(r));
    if (!override) {
      if (roles.secondary.includes(group)) { indirect = [...direct, ...indirect]; direct = []; }
      else if (catalogRole === "indirect") { direct = [...direct, ...indirect]; indirect = []; }
    }
    result[group] = { direct, indirect };
  }
  return result;
}

// Optional field: old backups remain valid. An explicit empty entry means unspecified.
export function validMuscleRegions(value, activeGroups) {
  if (value === undefined) return true;
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.entries(value).every(([group, entry]) => {
    if (!Object.hasOwn(muscleRegions, group) || !activeGroups.includes(group)
      || !entry || typeof entry !== "object" || Array.isArray(entry)) return false;
    const allowed = ids(group);
    return ["direct", "indirect"].every((role) => Array.isArray(entry[role])
      && entry[role].length <= allowed.length
      && entry[role].every((id) => allowed.includes(id))
      && new Set(entry[role]).size === entry[role].length)
      && !entry.direct.some((id) => entry.indirect.includes(id))
      && Object.keys(entry).every((key) => ["direct", "indirect"].includes(key));
  });
}
