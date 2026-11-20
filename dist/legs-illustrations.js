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
  return line("M78 159L196 48M89 159L207 48", C.metal, 4)
    + line("M75 161H135", C.metal, 5)
    + line("M106 120L149 80", C.pad, 13)
    + line("M108 117L147 81", "#708b95", 1.5)
    + line("M149 80L165 65", C.metal, 5)
    + endOnWeight(174, 57)
    + rect(106, 148, 65, 9, C.dark, 3)
    + line("M110 150H167", "#708b95", 1.5)
    + leg([92, 112], [126, 120], [112, 142], true)
    + arm([133, 76], [124, 96], [139, 82], true)
    + leg([98, 115], [137, 124], [121, 142])
    + profileTorso([137, 77], [98, 115])
    + profileHead([137, 77], 153, 66)
    + line("M151 80L144 70", C.metal, 4)
    + `<g transform="rotate(-40 138 70)">` + rect(129, 66, 19, 8, C.pad, 3) + `</g>`
    + line("M139 78L145 87", C.dark, 4)
    + arm([138, 82], [126, 101], [142, 84]) + grip(142, 84)
    + arrow("M182 104L201 86", [202, 85], -133);
}

function detailedProfileHead(x = 0, y = 0) {
  return `<g transform="translate(${x} ${y})">`
    + path("M32 63Q32 52 44 53Q54 53 55 64L58 69Q59 71 55 71L54 77Q53 81 47 81Q38 79 35 73Z", C.skin)
    + path("M33 72Q27 66 30 57Q31 49 40 49Q49 46 55 53Q58 57 53 60Q49 58 45 60L40 62L38 70Z", C.hair)
    + ellipse(38.8, 69, 2.5, 3.3, C.light)
    + line("M50 63L53 62.7", C.hair, 1.2)
    + ellipse(52.4, 65.5, .95, 1.1, C.hair)
    + line("M51.8 74.5L54 74.3", C.shade, 1)
    + "</g>";
}

// Prensa a 45°: el respaldo sostiene el torso y ambas suelas empujan el trineo.
function legPress() {
  const pressLeg = (hip, knee, ankle, far = false) => {
    const skin = far ? C.shade : C.skin;
    const hem = [(hip[0] + knee[0]) / 2, (hip[1] + knee[1]) / 2];
    return segment(hip, knee, 8, 5.2, skin)
      + ellipse(...knee, 5.4, 5.4, skin)
      + segment(knee, ankle, 5.5, 3.1, skin)
      + (far ? "" : line("M117 102Q125 100 132 97", C.light, 1.5))
      + segment(hip, hem, 9, 7, far ? C.dark : C.shorts)
      + `<g transform="translate(${ankle.join(" ")}) rotate(45)">`
      + path("M-12-4.25H6L6 3Q6 6 3 5L-3 2L-11 1Q-16 0-14-3Q-14-4.25-12-4.25Z", far ? C.dark : C.shoe)
      + line("M-7-1L-8 1M-4 0L-5 2", C.metal, 1)
      + line("M-12-3.4H5", "#e1e9e6", 1.7)
      + "</g>";
  };

  // El carril sube a 45°. La cara de apoyo es perpendicular al recorrido.
  const frame = line("M28 161H222M48 101L39 161M104 151L111 161M210 59V161", C.metal, 5)
    + line("M117 159L227 49", "#a5b8be", 4)
    + line("M106 159L223 42", C.plate, 6)
    + line("M166 99L190 75", C.dark, 11)
    + path("M161 65L183 80L174 94L169 89L175 81L157 70Z", C.dark)
    + line("M175 90L212 99", C.dark, 6)
    + [194, 200, 206].map((x, index) => {
      const y = 93 + index * 1.5;
      return ellipse(x, y, 8, 14, C.shoe)
        + ellipse(x + 2, y, 7, 13.5, C.plate)
        + line('M' + (x + 1) + ' ' + (y - 11) + 'q-4 2-5 8', C.metal, 1.3);
    }).join("")
    + line("M208 96L216 98", "#b7c9ce", 3.5);
  const supports = line("M28 86L80 141Q89 153 99 152L118 150", C.pad, 10)
    + line("M30 84L83 141Q91 149 99 149L116 147", "#708b95", 1.5)
    + '<g transform="translate(0 10)">'
    + path("M128 40L139 35L191 87L180 92Z", C.plate)
    + path("M128 40L180 92L177 96L125 44Z", C.dark)
    + line("M136 40L185 89", "#82959c", 1.6) + "</g>";

  return frame + supports
    + pressLeg([94, 137], [103, 96], [144, 72], true)
    + pressLeg([101, 140], [115, 103], [160, 88])
    + path("M43 76L50 74L54 85Q50 89 45 86Z", C.shade)
    + detailedProfileHead()
    + path("M80 121Q89 121 97 128L108 133L108 142Q105 147 97 147Q89 147 84 140L76 131Z", C.shorts)
    + path("M42 86Q48 79 57 84Q68 90 76 106L94 122Q93 130 84 135L48 103Q39 95 42 86Z", C.shirt)
    + path("M42 92Q54 107 69 121L87 132L84 135L48 103Q43 98 42 92Z", C.seam)
    + line("M78 146L82 128H91", C.dark, 4)
    + arm([54, 92], [60, 116], [86, 128])
    + grip(86, 128)
    + arrow("M169 48L191 26", [191, 26], -135);
}

function machineWeightStack() {
  return rect(26, 38, 37, 120, C.plate, 7)
    + rect(30, 44, 28, 106, "#bdcdd0", 4)
    + line("M38 51V143M51 51V143", C.metal, 2)
    + [0, 1, 2, 3, 4, 5, 6].map(i => rect(32, 96 + i * 7, 24, 6, C.dark, 1.5)).join("")
    + ellipse(49, 113, 2, 2, "#dfa579");
}

// Extensión de cuádriceps: rodilla que extiende contra un rodillo.
function kneeExtension() {
  const frame = line("M29 159H161M51 150H82L100 121H132L145 104", C.plate, 7)
    + line("M75 158L74 99L83 96M154 158L143 107", C.metal, 6)
    + machineWeightStack()
    + line("M58 119H77L85 112", C.plate, 5);
  const seatPads = line("M73 65L87 109", C.pad, 12)
    + line("M77 65L91 108", "#708b95", 1.5)
    + path("M85 112Q85 109 90 109L134 105Q139 105 140 110L139 115L91 120Q86 120 85 116Z", C.pad);

  return frame + seatPads
    + leg([96, 104], [136, 96], [170, 124], true)
    + leg([101, 108], [144, 101], [180, 132])
    + profileTorso([87, 65], [100, 106])
    + path("M82 54L90 54L92 65Q87 68 83 65Z", C.shade)
    + detailedProfileHead(43, -23)
    + line("M97 120V105L108 103", C.dark, 4)
    + arm([89, 71], [86, 92], [104, 104]) + grip(104, 104)
    + line("M145 103L149 117L178 134L182 126", C.metal, 6)
    + ellipse(145, 103, 7, 7, C.plate)
    + ellipse(145, 103, 2.5, 2.5, "#bdcdd0")
    + line("M173 119L182 126", C.pad, 15)
    + ellipse(182, 126, 7.5, 7.5, C.dark)
    + ellipse(182, 126, 2.5, 2.5, C.metal)
    + arrow("M188 111Q198 100 198 88", [198, 87], 180);
}

// Curl femoral tumbado: torso en el banco y talón que sube.
function legCurl() {
  const frame = line("M33 159H216M49 158L65 121M145 158L157 113L197 130", C.plate, 6)
    + '<g transform="translate(166 0)">' + machineWeightStack() + '</g>'
    + line("M49 121L112 102L151 113", C.pad, 11)
    + line("M51 118L112 100L149 110", "#708b95", 1.5)
    + line("M65 124L48 132L37 125", C.dark, 5);
  const bentLeg = (dx, dy, far) => {
    const skin = far ? C.shade : C.skin;
    return `<g transform="translate(${dx} ${dy})">`
      + segment([111, 92], [159, 105], 8, 5.4, skin)
      + segment([111, 92], [134, 98], 9, 7.5, C.shorts)
      + ellipse(159, 105, 5.4, 5.4, skin)
      + segment([159, 105], [147, 64], 5.8, 3.4, skin)
      + path("M142 65Q140 61 144 58L153 51Q157 49 159 53L153 62L150 68Z", far ? C.dark : C.shoe)
      + line("M144 59L156 50", "#e1e9e6", 1.5) + "</g>";
  };
  return frame + bentLeg(-6, -4, true) + bentLeg(0, 0, false)
    + profileTorso([61, 106], [111, 92])
    + segment([60, 106], [49, 102], 4, 4, C.skin)
    + '<g transform="translate(40 98) rotate(-65) scale(-.84 .84) translate(-43 -65)">'
    + detailedProfileHead() + '</g>'
    + arm([64, 103], [62, 126], [40, 126]) + grip(40, 126)
    + line("M158 106L165 99L144 71", C.metal, 5)
    + ellipse(158, 106, 6, 6, C.plate) + ellipse(158, 106, 2, 2, C.metal)
    + line("M137 66L144 71", C.pad, 13)
    + ellipse(144, 71, 6.5, 6.5, C.dark) + ellipse(144, 71, 2, 2, C.metal)
    + arrow("M180 91Q179 74 168 63", [168, 63], 135);
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
  const box = path("M122 117L136 108H202L189 117Z", "#a8bbc0")
    + path("M122 117H189V160H122Z", C.plate)
    + path("M189 117L202 108V151L189 160Z", C.dark)
    + line("M123 118H187", "#bdcdd0", 2)
    + rect(147, 128, 18, 4, C.dark, 2);
  const trailingLeg = segment([96, 94], [84, 124], 8, 5.4, C.shade)
    + ellipse(84, 124, 5.4, 5.4, C.shade)
    + segment([84, 124], [61, 146], 5.4, 3.2, C.shade)
    + segment([96, 94], [89, 111], 9, 7, C.dark)
    + path("M59 141Q62 140 66 145L65 149L71 157Q73 161 68 161L55 149Q53 146 59 141Z", C.shoe)
    + line("M55 148L68 160", "#e1e9e6", 1.5);
  return box + trailingLeg
    + arm([105, 64], [104, 83], [106, 99], true)
    + dumbbell(106, 100)
    + leg([102, 97], [140, 80], [146, 108])
    + ellipse(140, 80, 5.2, 5.2, C.skin)
    + profileTorso([114, 60], [101, 96])
    + segment([113, 62], [117, 50], 4, 3.5, C.skin)
    + '<g transform="translate(118 43) rotate(9) scale(.83) translate(-43 -65)">'
    + detailedProfileHead() + '</g>'
    + arm([113, 66], [111, 87], [115, 105])
    + dumbbell(115, 106) + grip(115, 105)
    + arrow("M169 93Q176 82 176 65", [176, 64], 180);
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
  const frame = line("M27 160H215M38 159L53 105M77 159L59 107M197 159L204 113", C.plate, 6)
    + line("M147 157L154 143M190 158L185 143", C.metal, 5)
    + path("M139 141L148 135H194L188 142Z", C.plate)
    + rect(138, 141, 52, 6, C.dark, 2)
    + line("M42 98L68 105", C.pad, 12)
    + line("M44 95L66 101", "#708b95", 1.5);
  const lever = line("M204 113L166 123L127 119Q119 118 116 109L110 94", C.plate, 7)
    + ellipse(204, 113, 7, 7, C.dark) + ellipse(204, 113, 3, 3, C.metal)
    + line("M102 88L114 94", C.pad, 12)
    + ellipse(114, 94, 5.5, 6, C.dark)
    + ellipse(132, 117, 8, 12, C.shoe) + ellipse(135, 118, 8, 12, C.plate)
    + ellipse(141, 120, 8, 12, C.dark) + ellipse(144, 120, 7, 12, C.plate)
    + line("M144 120L150 122", "#bdcdd0", 3);

  return frame
    + leg([104, 96], [149, 90], [150, 130], true)
    + leg([110, 99], [159, 94], [160, 135])
    + profileTorso([59, 94], [109, 99])
    + segment([57, 92], [45, 85], 4, 4, C.skin)
    + '<g transform="translate(36 82) rotate(-56) scale(.88) translate(-43 -65)">'
    + detailedProfileHead() + '</g>'
    + lever
    + arm([62, 92], [81, 104], [104, 89]) + grip(104, 89)
    + arrow("M110 73Q105 61 105 51", [105, 50], 180);
}

// Patada de glúteo en polea: correa en el tobillo, pierna que lleva atrás.
function gluteKickback() {
  const station = machineWeightStack()
    + line("M23 160H77M61 93H72V76", C.plate, 5)
    + line("M72 75V87", C.pad, 6)
    + line("M58 141L68 148", C.metal, 6)
    + ellipse(68, 148, 6, 6, C.dark)
    + ellipse(68, 148, 2, 2, C.metal);
  const standingLeg = segment([134, 105], [121, 131], 8, 5.5, C.shade)
    + ellipse(121, 131, 5.5, 5.5, C.shade)
    + segment([121, 131], [127, 156], 5.3, 3.3, C.shade)
    + segment([134, 105], [127, 120], 9, 7.5, C.dark)
    + path("M123 153L130 154L132 161Q132 163 129 163H112Q108 162 111 159L121 156Z", C.shoe)
    + line("M112 162H130", "#e1e9e6", 1.5);
  const kickingLeg = segment([137, 103], [167, 116], 8.4, 5.5, C.skin)
    + ellipse(167, 116, 5.5, 5.5, C.skin)
    + segment([167, 116], [196, 111], 5.5, 3.4, C.skin)
    + segment([137, 103], [152, 110], 9, 7.5, C.shorts)
    + path("M192 109L198 107Q201 106 202 110L205 123Q205 127 201 126L196 120L192 115Z", C.shoe)
    + line("M200 109L204 123", "#e1e9e6", 1.5);
  return station
    + line("M68 152L189 115", C.dark, 1.6)
    + standingLeg + kickingLeg
    + '<g transform="translate(206 0) scale(-1 1)">'
    + profileTorso([103, 77], [70, 103]) + '</g>'
    + segment([103, 77], [95, 67], 4, 4, C.skin)
    + '<g transform="translate(91 59) rotate(-12) scale(-.82 .82) translate(-43 -65)">'
    + detailedProfileHead() + '</g>'
    + arm([103, 78], [92, 92], [72, 82]) + grip(72, 82)
    + path("M186 109L193 107L195 115L188 118Z", C.pad)
    + ellipse(188, 116, 2.2, 2.2, C.metal)
    + arrow("M169 100Q184 98 194 88", [194, 88], -135);
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
