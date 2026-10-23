// Original vector illustrations for the leg and hip families,
// sharing the figure and equipment language of the pull/push sets.
import {
  C, path, line, rect, ellipse, ground, segment, arm, leg, head, torso,
  dumbbell, tower, seat, arrow, profileTorso, profileHead, endOnWeight, grip,
} from "./exercise-drawing.js";

const lyingHead = (x, y, angle = -90) =>
  `<g transform="rotate(${angle} ${x} ${y})">${head(x, y)}</g>`;
const backrest = (x, y, h = 46) =>
  line(`M${x} ${y}L${x + 6} ${y + h}`, C.pad, 9)
  + line(`M${x + 2} ${y + 3}L${x + 8} ${y + h - 2}`, "#708b95", 1);
const lowBench = (x, y, w = 54) =>
  line(`M${x + 6} ${y + 9}L${x + 1} 158M${x + w - 6} ${y + 9}L${x + w + 5} 158`, C.metal, 5)
  + rect(x, y, w, 9, C.pad, 4) + line(`M${x + 5} ${y + 2}h${w - 10}`, "#708b95", 1);
// Pie en punta: solo el antepié apoya y el talón queda elevado.
const tipToe = (x, y, far = false) => path(
  `M${x - 10} ${y - 8}q3 4 6 6l11 8q4 2 6 -1l0 -5q-1 -4 -5 -6l-11 -7q-6 -2 -7 5Z`,
  far ? C.shade : C.shoe);
const onToeLeg = (hip, knee, ball, far = false) => {
  const skin = far ? C.shade : C.skin;
  return segment(hip, knee, 8, 5.2, skin)
    + segment(hip, [hip[0] + (knee[0] - hip[0]) * .55, hip[1] + (knee[1] - hip[1]) * .55], 9, 7, C.shorts)
    + segment(knee, [ball[0] - 5, ball[1] - 12], 5.5, 3.1, skin)
    + ellipse(ball[0] - 5, ball[1] - 12, 3.1, 3.1, skin)
    + tipToe(ball[0], ball[1], far);
};

// Sentadilla: barra al dorso, barra al frente o mancuerna al pecho.
function squatFamily(kind = "back") {
  const front = kind === "front", goblet = kind === "goblet";
  const shoulder = [116, 76], hip = [96, 120];
  const farArm = goblet ? [[110, 74], [122, 98], [124, 88]]
    : front ? [[110, 74], [128, 92], [132, 78]]
    : [[110, 74], [96, 92], [103, 64]];
  const nearArm = goblet ? [[120, 82], [132, 104], [130, 92]]
    : front ? [[122, 84], [140, 100], [136, 78]]
    : [[122, 84], [108, 102], [114, 62]];
  return leg([90, 118], [124, 126], [110, 157], true)
    + arm(...farArm, true)
    + leg([96, 120], [130, 128], [120, 157])
    + profileTorso(shoulder, hip)
    + profileHead(shoulder, front ? 118 : 126, 60)
    + (goblet ? dumbbell(133, 92, 90) : endOnWeight(front ? 140 : 111, front ? 76 : 64))
    + arm(...nearArm)
    + grip(...nearArm[2])
    + arrow("M164 100V72", [164, 71], 180);
}

// Sentadilla hack: trineo inclinado, discs en el riel y soporte sobre hombros.
function hackSquat() {
  return line("M86 158L206 40", C.metal, 4)
    + line("M76 158L196 40", C.metal, 4)
    + line("M78 160H124", C.metal, 5)
    + line("M120 104L172 56", C.pad, 13)
    + endOnWeight(174, 50)
    + rect(112, 141, 56, 9, C.dark, 3)
    + line("M112 145H168", "#5e767f", 2)
    + leg([94, 108], [136, 118], [116, 135], true)
    + arm([138, 76], [124, 96], [136, 78], true)
    + leg([102, 110], [144, 122], [124, 135])
    + profileTorso([142, 74], [100, 110])
    + profileHead([142, 74], 160, 66)
    + line("M150 62L142 48", C.metal, 4)
    + `<g transform="rotate(-40 138 44)">` + rect(126, 39, 24, 9, C.dark, 3) + `</g>`
    + arm([144, 80], [128, 100], [140, 82])
    + grip(140, 82)
    + arrow("M188 90L208 71", [209, 70], -133);
}

// Prensa 45 grados: cuerpo reclinado empujando el trineo por su plataforma.
function legPress() {
  return line("M104 158L214 46", C.metal, 4)
    + line("M96 158H136", C.metal, 5)
    + line("M60 134L82 118", C.pad, 10)
    + line("M72 138L68 158", C.metal, 4)
    + line("M130 70L142 80", C.pad, 9)
    + leg([80, 120], [110, 102], [136, 80], true)
    + arm([104, 84], [88, 100], [74, 112], true)
    + leg([86, 124], [118, 106], [144, 84])
    + profileTorso([112, 86], [86, 124])
    + profileHead([112, 86], 126, 72)
    + line("M145 61L167 87", C.dark, 12)
    + line("M148 64L164 80", "#5e767f", 2)
    + line("M164 78L178 74", C.metal, 5)
    + ellipse(190, 72, 6, 11, C.plate)
    + ellipse(196, 78, 6, 11, C.shoe)
    + ellipse(196, 78, 2, 3.5, "#b7c9ce")
    + line("M74 108L72 118", C.dark, 4)
    + grip(74, 112)
    + arm([104, 88], [88, 104], [76, 114])
    + arrow("M170 102L184 80", [185, 79], -130);
}

// Extensión de cuádriceps: rodilla que extiende contra un rodillo.
function kneeExtension() {
  return tower(198, 108)
    + backrest(84, 72)
    + seat(78, 120, 46)
    + line("M88 124L88 158", C.metal, 4)
    + leg([86, 112], [116, 110], [148, 108], true)
    + arm([98, 84], [84, 104], [92, 118], true)
    + leg([92, 116], [126, 114], [160, 116])
    + profileTorso([96, 76], [90, 114])
    + profileHead([96, 76], 108, 60)
    + line("M128 120L161 120", C.metal, 4)
    + line("M130 120L130 158", C.metal, 4)
    + line("M213 108L164 118", C.dark, 2.5)
    + ellipse(163, 118, 7, 7, C.pad)
    + ellipse(163, 118, 2.5, 2.5, C.dark)
    + line("M101 117L101 127", C.dark, 3)
    + arm([100, 86], [90, 108], [98, 122])
    + grip(98, 122)
    + arrow("M126 148Q150 148 160 136", [161, 134], -50);
}

// Curl femoral tumbado: torso en el banco y talón que sube.
function legCurl() {
  return line("M56 124L46 160M145 124L160 160M33 162H173", C.metal, 5)
    + rect(42, 117, 112, 9, C.pad, 4) + line("M47 119H148", "#708b95", 1.5)
    + line("M158 112L158 158", C.metal, 4)
    + line("M144 158H176", C.metal, 5)
    + leg([120, 102], [148, 108], [180, 104], true)
    + arm([68, 104], [82, 92], [74, 116], true)
    + leg([126, 104], [154, 110], [142, 82])
    + profileTorso([70, 106], [124, 104])
    + lyingHead(50, 104)
    + line("M78 120L74 112", C.dark, 4)
    + arm([74, 108], [86, 96], [80, 118])
    + grip(80, 118)
    + ellipse(140, 78, 7, 8, C.pad)
    + ellipse(140, 78, 2.5, 2.5, C.dark)
    + arrow("M164 84Q156 74 146 72", [145, 71], 160);
}

// Curl femoral sentado: la rodilla flexiona bajo el asiento.
function seatedLegCurl() {
  return backrest(80, 70)
    + seat(72, 118, 46)
    + line("M82 124L82 158", C.metal, 4)
    + rect(100, 100, 46, 9, C.pad, 3)
    + leg([84, 108], [126, 104], [114, 136], true)
    + arm([92, 82], [80, 104], [88, 118], true)
    + leg([90, 112], [132, 108], [120, 140])
    + profileTorso([94, 76], [88, 112])
    + profileHead([94, 76], 106, 60)
    + line("M134 112L120 156", C.metal, 4)
    + line("M106 156H140", C.metal, 4)
    + ellipse(116, 142, 7, 8, C.pad)
    + ellipse(116, 142, 2.5, 2.5, C.dark)
    + arm([98, 84], [88, 106], [96, 120])
    + grip(96, 120)
    + arrow("M162 112Q158 128 148 138", [147, 139], 50);
}

// Zancada: pierna trasera en punta, mancuernas colgando.
function lunge() {
  return onToeLeg([102, 102], [70, 124], [56, 161], true)
    + arm([104, 68], [100, 94], [104, 116], true)
    + dumbbell(104, 118)
    + leg([110, 104], [126, 132], [122, 157])
    + profileTorso([110, 66], [108, 104])
    + profileHead([110, 66], 122, 50)
    + arm([116, 70], [114, 96], [116, 118])
    + dumbbell(116, 120)
    + grip(116, 118)
    + arrow("M160 92V66", [160, 65], 180);
}

// Sentadilla búlgara: pie trasero elevado sobre el banco.
function bulgarian() {
  return lowBench(24, 112, 58)
    + leg([96, 102], [66, 114], [46, 106], true, -1)
    + arm([106, 66], [102, 90], [106, 110], true)
    + dumbbell(106, 112)
    + leg([104, 104], [130, 132], [124, 157])
    + profileTorso([112, 66], [104, 104])
    + profileHead([112, 66], 124, 50)
    + arm([118, 70], [116, 94], [118, 116])
    + dumbbell(118, 118)
    + grip(118, 116)
    + arrow("M162 92V66", [162, 65], 180);
}

// Step up: un pie sobre el cajón, el otro colgando.
function stepUp() {
  return rect(126, 118, 54, 40, "#b7c8cd", 3)
    + line("M126 132H180", "#a5b8be", 2)
    + rect(122, 112, 62, 8, C.pad, 3)
    + leg([96, 96], [102, 122], [100, 146], true)
    + arm([102, 64], [98, 88], [102, 108], true)
    + dumbbell(102, 110)
    + leg([102, 98], [128, 100], [148, 106])
    + profileTorso([106, 62], [102, 98])
    + profileHead([106, 62], 118, 46)
    + arm([112, 68], [110, 92], [112, 112])
    + dumbbell(112, 114)
    + grip(112, 112)
    + arrow("M194 92V64", [194, 63], 180);
}

// Peso muerto rumano: bisagra de cadera con barra o mancuernas.
function romanianDeadlift(dumbbells = false) {
  return leg([88, 108], [96, 136], [98, 158], true)
    + arm([126, 70], [122, 94], [114, 112], true)
    + leg([94, 110], [102, 137], [104, 158])
    + profileTorso([130, 72], [94, 108])
    + profileHead([130, 72], 146, 62)
    + (dumbbells
      ? endOnWeight(112, 112, true) + endOnWeight(120, 114, true)
      : endOnWeight(116, 114))
    + arm([134, 76], [130, 100], [120, 114])
    + grip(120, 114)
    + arrow("M78 96Q66 82 72 66", [73, 65], 140);
}

// Peso muerto convencional: discos en el piso, espalda plana.
function deadlift() {
  return leg([90, 102], [116, 128], [106, 157], true)
    + arm([126, 68], [122, 94], [118, 142], true)
    + leg([96, 104], [122, 130], [110, 157])
    + profileTorso([128, 70], [96, 104])
    + profileHead([128, 70], 144, 58)
    + endOnWeight(122, 150)
    + arm([132, 74], [128, 100], [124, 146])
    + grip(124, 146)
    + arrow("M78 132V108", [78, 107], 180);
}

// Hip thrust: hombros en el banco, cadera extendida bajo la barra.
function hipThrust() {
  return lowBench(24, 105, 58)
    + leg([88, 92], [108, 124], [106, 157], true)
    + arm([50, 94], [68, 90], [84, 82], true)
    + leg([98, 96], [120, 126], [118, 157])
    + profileTorso([54, 100], [98, 96])
    + lyingHead(34, 92, -100)
    + endOnWeight(100, 88)
    + arm([58, 98], [78, 94], [94, 84])
    + grip(94, 84)
    + arrow("M100 58V34", [100, 33], 180);
}

// Hip thrust en máquina: respaldo, placa de pies y palanca con disco.
function machineHipThrust() {
  return line("M64 72L80 124", C.pad, 10)
    + rect(66, 118, 42, 8, C.pad, 4)
    + line("M74 126V158M100 126V158", C.metal, 4)
    + line("M58 158H186", C.metal, 5)
    + rect(146, 144, 24, 14, C.dark, 3)
    + line("M172 108V158", C.metal, 5)
    + line("M172 108L106 90", C.metal, 5)
    + endOnWeight(176, 108)
    + leg([88, 108], [122, 108], [144, 136], true)
    + arm([72, 82], [88, 102], [82, 118], true)
    + leg([94, 110], [128, 112], [150, 138])
    + profileTorso([76, 78], [94, 112])
    + profileHead([76, 78], 68, 62)
    + line("M106 90L102 99", C.metal, 3)
    + `<g transform="rotate(10 102 104)">` + rect(86, 99, 32, 11, C.pad, 4) + `</g>`
    + arm([80, 82], [96, 102], [90, 118])
    + grip(90, 118)
    + arrow("M98 80V58", [98, 57], 180);
}

// Patada de glúteo en polea: correa en el tobillo, pierna que lleva atrás.
function gluteKickback() {
  return tower(196, 146)
    + line("M56 94V158", C.metal, 4)
    + line("M46 158H66", C.metal, 4)
    + line("M54 98H64", C.dark, 4)
    + leg([96, 110], [90, 136], [88, 157], true, -1)
    + arm([98, 78], [76, 94], [58, 98], true)
    + profileTorso([104, 78], [100, 114])
    + profileHead([104, 78], 92, 62)
    + leg([102, 112], [96, 138], [94, 157], false, -1)
    + leg([108, 110], [140, 122], [168, 128])
    + line("M209 146L170 130", C.dark, 1.5)
    + ellipse(164, 128, 5, 7, C.dark)
    + ellipse(164, 128, 2, 3, C.metal)
    + arm([100, 80], [80, 98], [60, 100])
    + grip(60, 100)
    + arrow("M150 92Q168 98 180 110", [181, 111], -108);
}

// Abducción/aducción de cadera: máquina de asiento con almohadillas.
function hipPadMachine(out = true) {
  const kneeX = out ? [82, 158] : [96, 144];
  const pads = out
    ? rect(66, 112, 10, 24, C.pad, 3) + rect(164, 112, 10, 24, C.pad, 3)
    : rect(104, 116, 9, 22, C.pad, 3) + rect(127, 116, 9, 22, C.pad, 3);
  return rect(104, 84, 32, 38, C.pad, 5)
    + seat(98, 128, 44)
    + leg([106, 120], [kneeX[0], 126], [kneeX[0] - 2, 154], true, -1)
    + leg([134, 120], [kneeX[1], 126], [kneeX[1] + 2, 154], false, 1)
    + torso(120, 80) + head(120, 64)
    + pads
    + arm([105, 88], [96, 108], [98, 124], true)
    + arm([135, 88], [144, 108], [142, 124])
    + (out
      ? arrow("M64 96L46 96", [45, 96], 90) + arrow("M176 96L194 96", [195, 96], -90)
      : arrow("M84 96L102 96", [103, 96], -90) + arrow("M156 96L138 96", [137, 96], 90));
}

// Elevación de talones de pie: marco con soporte sobre los hombros.
function calfRaise() {
  return line("M78 52V158", C.metal, 5)
    + line("M156 52V158", C.metal, 5)
    + line("M78 52H156", C.metal, 5)
    + ellipse(78, 100, 7, 11, C.plate) + ellipse(78, 100, 2.5, 4, C.dark)
    + ellipse(78, 122, 7, 11, C.plate) + ellipse(78, 122, 2.5, 4, C.dark)
    + rect(84, 150, 52, 10, C.dark, 3)
    + onToeLeg([92, 108], [94, 134], [102, 149], true)
    + arm([106, 80], [122, 96], [126, 88], true)
    + onToeLeg([98, 110], [100, 136], [108, 151])
    + profileTorso([104, 74], [98, 110])
    + line("M118 52V60", C.metal, 4)
    + rect(100, 58, 36, 9, C.pad, 3)
    + profileHead([104, 74], 114, 60)
    + line("M126 90L134 94", C.dark, 4)
    + arm([108, 82], [126, 98], [128, 90])
    + grip(128, 90)
    + arrow("M66 122V98", [66, 97], 180);
}

// Elevación de talones sentado: palanca anclada y almohadilla en rodillas.
function seatedCalfRaise() {
  return backrest(90, 72)
    + line("M64 158V72", C.metal, 5)
    + line("M64 72L124 96", C.metal, 5)
    + endOnWeight(56, 66)
    + seat(84, 120, 46)
    + line("M92 124L92 158", C.metal, 4)
    + rect(132, 142, 34, 8, C.dark, 3)
    + onToeLeg([86, 108], [124, 106], [140, 140], true)
    + arm([98, 84], [86, 106], [94, 120], true)
    + onToeLeg([92, 110], [130, 108], [146, 142])
    + profileTorso([100, 76], [90, 112])
    + profileHead([100, 76], 112, 60)
    + rect(116, 94, 28, 9, C.pad, 3)
    + arm([102, 86], [92, 108], [100, 122])
    + grip(100, 122)
    + arrow("M170 118Q162 106 152 102", [151, 101], 160);
}

const illustrations = {
  squat: () => squatFamily(), "front-squat": () => squatFamily("front"),
  "goblet-squat": () => squatFamily("goblet"), "hack-squat": hackSquat,
  legpress: legPress, extension: kneeExtension,
  legcurl: legCurl, "seated-legcurl": seatedLegCurl,
  lunge, bulgarian, "step-up": stepUp,
  rdl: () => romanianDeadlift(), "dumbbell-rdl": () => romanianDeadlift(true),
  deadlift, hipthrust: hipThrust, "machine-hipthrust": machineHipThrust,
  kickback: gluteKickback,
  abduction: () => hipPadMachine(), adduction: () => hipPadMachine(false),
  calf: calfRaise, "seated-calf": seatedCalfRaise,
};

export function legsIllustration(id) {
  // Only catalog IDs select detailed equipment; unknown records use local poses.
  const draw = Object.hasOwn(illustrations, id) && illustrations[id];
  return draw ? ground() + draw() : "";
}
