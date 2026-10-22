// Original SVG poses, using the same figure and equipment as the pull family.
import {
  C, path, line, rect, ellipse, ground, segment, arm, leg, head, torso,
  dumbbell, barbell, tower, seat, arrow, profileTorso, profileHead,
  endOnWeight, cableHandle, grip,
} from "./exercise-drawing.js";

function flatBench() {
  return line("M56 124L46 160M145 124L160 160M33 162H173", C.metal, 5)
    + rect(42, 117, 112, 9, C.pad, 4)
    + line("M47 119H148", "#708b95", 1.5);
}

function restingHead(x, y, angle = -90) {
  return `<g transform="rotate(${angle} ${x} ${y})">${head(x, y)}</g>`;
}

function benchPress(kind = "barbell") {
  const smith = kind === "smith", db = kind === "dumbbell";
  const farHand = db ? [86, 54] : [93, 60];
  const nearHand = db ? [111, 66] : [103, 64];
  return (smith
    ? line("M33 161V24H127V161M46 27V157M114 27V157M24 163H137", C.metal, 5)
      + line("M46 64H114", C.metal, 3)
      + rect(43, 58, 7, 12, C.dark) + rect(111, 58, 7, 12, C.dark)
    : db ? "" : line("M40 158V66H51M29 160H53", C.metal, 4))
    + flatBench()
    + leg([137, 106], [165, 126], [163, 156], true)
    + arm([79, 103], [96, 87], farHand, true)
    + (db ? endOnWeight(...farHand, true) + grip(...farHand) : "")
    + leg([142, 109], [180, 129], [180, 156])
    + profileTorso([78, 106], [137, 106]) + restingHead(60, 103)
    + arm([82, 107], [110, 94], nearHand)
    + endOnWeight(...nearHand, db) + grip(...nearHand)
    + arrow("M137 85V49", [137, 48], 180);
}

function inclinePress(db = true) {
  const farHand = db ? [104, 39] : [114, 43];
  const nearHand = db ? [130, 51] : [123, 49];
  return line("M78 100L57 159M128 133L151 159M46 162H169", C.metal, 5)
    + path("M65 79Q62 74 68 71L77 69 135 119 126 131Z", C.pad)
    + rect(125, 121, 34, 8, C.pad, 3)
    + leg([129, 115], [165, 125], [166, 156], true)
    + arm([87, 78], [111, 74], farHand, true)
    + (db ? endOnWeight(...farHand, true) + grip(...farHand) : "")
    + leg([133, 118], [178, 131], [179, 156])
    + profileTorso([85, 77], [129, 115]) + restingHead(72, 61, -48)
    + arm([88, 82], [126, 85], nearHand)
    + endOnWeight(...nearHand, db) + grip(...nearHand)
    + arrow("M152 81L143 42", [143, 41], 165);
}

function declinePress() {
  return line("M59 137L48 161M142 111L158 161M35 163H188", C.metal, 5)
    + path("M49 133L148 99 152 108 52 142Z", C.pad)
    + line("M160 94L186 112V142", C.metal, 4)
    + leg([137, 98], [166, 91], [177, 119], true)
    + arm([78, 114], [98, 98], [91, 72], true)
    + leg([141, 100], [174, 96], [185, 124])
    + profileTorso([78, 118], [137, 98]) + restingHead(59, 121, -108)
    + arm([83, 119], [110, 103], [103, 75])
    + endOnWeight(103, 75) + grip(103, 75)
    + line("M176 127L191 123", C.pad, 9)
    + arrow("M136 98V62", [136, 61], 180);
}

function closeGripPress() {
  // A shallow three-quarter view exposes both hands and the narrow grip.
  return line("M72 122L56 159M157 143L170 159M44 162H189", C.metal, 5)
    + path("M58 110L66 103 165 131 158 141Z", C.pad)
    + leg([143, 117], [176, 130], [173, 155], true)
    + arm([96, 102], [110, 94], [98, 68], true)
    + leg([147, 124], [190, 139], [188, 157])
    + profileTorso([93, 108], [144, 120]) + restingHead(75, 103, -77)
    + arm([94, 112], [118, 103], [111, 74])
    + line("M62 52L144 89", C.metal, 3)
    + ellipse(67, 54, 6, 11, C.shoe) + ellipse(72, 56, 6, 12, C.plate)
    + ellipse(135, 85, 6, 12, C.plate) + ellipse(140, 87, 6, 11, C.shoe)
    + grip(98, 68) + grip(111, 74)
    + arrow("M162 99V64", [162, 63], 180);
}

function machinePress(incline = false) {
  const shoulder = incline ? [94, 81] : [96, 77];
  const hip = [106, 122];
  const hand = incline ? [146, 69] : [149, 90];
  return tower(188, 42)
    + line(incline ? "M201 42H168L143 61" : "M201 42H163L150 83", C.metal, 6)
    + line("M85 131V160M68 162H143", C.metal, 5)
    + path(incline ? "M73 75L83 71 115 122 103 127Z" : "M76 65H87L98 124H86Z", C.pad)
    + seat(88, 125, 42)
    + leg([106, 121], [142, 133], [143, 157], true)
    + arm([shoulder[0] - 4, shoulder[1] + 3], [112, 101], [hand[0] - 6, hand[1] - 5], true)
    + leg([109, 124], [151, 138], [151, 157])
    + profileTorso(shoulder, hip) + profileHead(shoulder, shoulder[0] - 3, shoulder[1] - 17)
    + line(`M${hand[0]} ${hand[1] - 10}v20`, C.dark, 4)
    + arm([shoulder[0] + 4, shoulder[1] + 7], [119, 111], hand) + grip(...hand)
    + (incline ? arrow("M155 104L174 74", [175, 73], -145)
      : arrow("M146 118H174", [175, 118], -90));
}

function pushup(incline = false) {
  const s = incline ? [81, 86] : [79, 119];
  const h = incline ? [133, 112] : [137, 131];
  const palm = incline ? [68, 115] : [66, 158];
  return (incline ? line("M37 124L30 160M86 124L98 160", C.metal, 5)
    + rect(28, 115, 71, 10, C.pad, 4) : "")
    + leg([h[0] + 2, h[1] - 3], [165, 134], [192, 155], true)
    + arm([s[0] + 5, s[1] - 3], [98, incline ? 106 : 143], [palm[0] + 10, palm[1] - 3], true)
    + leg(h, [163, 140], [190, 157])
    + profileTorso(s, h) + restingHead(s[0] - 17, s[1] - 7, 25)
    + arm(s, [92, incline ? 110 : 147], palm)
    + line(`M${palm[0] - 7} ${palm[1] + 2}h15`, C.skin, 4)
    + arrow(incline ? "M112 79L106 59" : "M110 113V92", incline ? [106, 58] : [110, 91], 180);
}

function fly() {
  return line("M78 122L62 159M160 143L175 159M49 162H192", C.metal, 5)
    + path("M64 109L72 102 168 131 160 141Z", C.pad)
    + leg([143, 118], [178, 131], [176, 155], true)
    + arm([106, 100], [121, 74], [143, 57], true)
    + dumbbell(143, 57, 25) + grip(143, 57)
    + leg([148, 124], [192, 140], [190, 157])
    + profileTorso([99, 108], [147, 121]) + restingHead(81, 103, -75)
    + arm([100, 114], [80, 132], [53, 117])
    + dumbbell(53, 117, -30) + grip(53, 117)
    + arrow("M44 94Q48 66 75 59", [76, 59], -100)
    + arrow("M160 48Q143 31 117 42", [116, 43], 60);
}

function pecDeck() {
  return tower(179, 33) + line("M192 33H120L66 59M120 33L166 59", C.metal, 5)
    + ellipse(120, 33, 6, 6, C.dark)
    + rect(104, 68, 31, 59, C.pad, 5) + seat(98, 127, 44)
    + leg([112, 123], [91, 140], [86, 157], true, -1)
    + leg([128, 123], [149, 140], [154, 157])
    + torso(120, 79) + head(120, 63)
    + line("M66 59V101M166 59V101", C.metal, 4)
    + rect(62, 85, 11, 22, C.pad, 3) + rect(159, 85, 11, 22, C.pad, 3)
    + arm([105, 86], [78, 99], [78, 70], true)
    + arm([135, 86], [152, 99], [152, 70])
    + line("M74 67H81M149 67H156", C.dark, 4) + grip(78, 70) + grip(152, 70)
    + arrow("M69 45Q87 40 98 52", [99, 53], -45)
    + arrow("M164 45Q146 40 137 52", [136, 53], 45);
}

function cableFly() {
  return tower(18, 45) + tower(195, 45)
    + line("M31 45L95 100M208 45L145 100", C.dark, 1.5)
    + leg([112, 119], [96, 140], [83, 158], true, -1)
    + leg([128, 119], [146, 137], [157, 158])
    + torso(120, 75) + head(120, 59)
    + arm([105, 82], [76, 91], [95, 100], true)
    + arm([135, 82], [164, 91], [145, 100])
    + line("M89 95L96 104L101 98ZM139 98L144 104L151 95Z", C.dark, 2.5)
    + grip(95, 100) + grip(145, 100)
    + arrow("M80 117Q93 127 105 116", [106, 115], -130)
    + arrow("M160 117Q147 127 135 116", [134, 115], 130);
}

function dips() {
  return line("M60 162V88L84 79M157 162V88L181 79M48 164H73M145 164H170", C.metal, 5)
    + leg([120, 114], [131, 139], [102, 149], true, -1)
    + arm([108, 69], [137, 75], [158, 87], true)
    + leg([116, 116], [119, 145], [88, 149], false, -1)
    + profileTorso([102, 68], [119, 112]) + profileHead([102, 68],96, 51)
    + line("M60 88L83 79M157 88L180 79", C.dark, 5)
    + arm([101, 73], [87, 99], [73, 84]) + grip(73, 84) + grip(158, 87)
    + arrow("M197 110V76", [197, 75], 180);
}

function overheadPress(kind = "barbell") {
  const db = kind === "dumbbell", machine = kind === "machine";
  const hands = db ? [[81, 45], [159, 45]] : machine ? [[80, 44], [160, 44]] : [[86, 34], [154, 34]];
  return (machine ? tower(186, 28)
    + line("M199 28H166L160 44M166 28H74L80 44", C.metal, 5)
    + rect(103, 76, 34, 56, C.pad, 5) : "")
    + (db || machine ? seat(96, 128, 48) : "")
    + (db || machine ? leg([112, 125], [93, 143], [88, 158], true, -1)
      + leg([128, 125], [147, 143], [152, 158])
      : leg([112, 116], [103, 138], [98, 158], true, -1)
        + leg([128, 116], [137, 138], [142, 158]))
    + torso(120, db || machine ? 81 : 73) + head(120, db || machine ? 65 : 57)
    + arm([105, db || machine ? 88 : 80], [79, 76], hands[0], true)
    + arm([135, db || machine ? 88 : 80], [161, 76], hands[1])
    + (db ? dumbbell(...hands[0]) + dumbbell(...hands[1])
      : machine ? line("M73 44H87M153 44H167", C.dark, 4) : barbell(120, 34))
    + grip(...hands[0]) + grip(...hands[1])
    + arrow("M57 72V36", [57, 35], 180);
}

function lateral(cable = false) {
  if (cable) return tower(21, 146)
    + line("M34 146L181 83", C.dark, 1.5)
    + leg([116, 120], [107, 140], [102, 158], true, -1)
    + leg([131, 120], [140, 140], [145, 158])
    + torso(124, 77) + head(124, 61)
    + arm([109, 85], [85, 104], [50, 105], true) + grip(50, 105)
    + arm([139, 85], [160, 88], [181, 83])
    + line("M175 79L182 88L187 80Z", C.dark, 2.5) + grip(181, 83)
    + arrow("M185 121Q207 108 199 88", [198, 87], 150);
  return leg([112, 120], [103, 140], [98, 158], true, -1)
    + leg([128, 120], [137, 140], [142, 158])
    + torso(120, 77) + head(120, 61)
    + arm([105, 85], [79, 84], [54, 91], true)
    + arm([135, 85], [161, 84], [186, 91])
    + dumbbell(54, 91, 75) + dumbbell(186, 91, -75)
    + grip(54, 91) + grip(186, 91)
    + arrow("M49 127Q31 110 40 90", [41, 89], -150)
    + arrow("M191 127Q209 110 200 90", [199, 89], 150);
}

function tricepsPushdown() {
  return tower(185, 26) + line("M198 26H149L146 120", C.dark, 1.5)
    + line("M185 20H149", C.metal, 5)
    + leg([106, 119], [95, 139], [88, 158], true)
    + arm([112, 80], [124, 101], [141, 118], true)
    + leg([111, 122], [122, 141], [126, 158])
    + profileTorso([116, 77], [108, 117]) + profileHead([116, 77],123, 61)
    + arm([119, 83], [129, 103], [151, 123])
    + cableHandle(146, 120) + grip(141, 118) + grip(151, 123)
    + arrow("M161 88Q174 106 163 124", [162, 125], 30);
}

function overheadExtension() {
  return leg([112, 118], [103, 139], [98, 158], true, -1)
    + leg([128, 118], [137, 139], [142, 158])
    + arm([105, 81], [101, 36], [118, 49], true)
    + dumbbell(120, 44, 90) + torso(120, 75) + head(120, 60)
    + arm([135, 81], [139, 36], [123, 49]) + grip(123, 49)
    + arrow("M163 53Q173 32 151 21", [150, 21], 110);
}

function lyingExtension() {
  return flatBench()
    + leg([137, 106], [165, 126], [163, 156], true)
    + arm([78, 102], [80, 65], [56, 60], true)
    + leg([142, 109], [180, 129], [180, 156])
    + profileTorso([78, 106], [137, 106]) + restingHead(60, 103)
    + arm([82, 107], [87, 67], [60, 63])
    + endOnWeight(60, 63) + grip(60, 63)
    + arrow("M43 45Q62 24 87 40", [88, 41], -50);
}

const illustrations = {
  bench: () => benchPress(), "dumbbell-press": () => benchPress("dumbbell"),
  "smith-press": () => benchPress("smith"), "decline-press": declinePress,
  "close-grip-press": closeGripPress, "machine-press": () => machinePress(),
  incline: () => inclinePress(), "incline-barbell": () => inclinePress(false),
  "incline-machine": () => machinePress(true),
  pushup: () => pushup(), "incline-pushup": () => pushup(true),
  fly, "pec-deck": pecDeck, "cable-fly": cableFly, dips,
  ohp: () => overheadPress(), "dumbbell-ohp": () => overheadPress("dumbbell"),
  "machine-ohp": () => overheadPress("machine"),
  lateral: () => lateral(), "cable-lateral": () => lateral(true),
  triceps: tricepsPushdown, overhead: overheadExtension, skullcrusher: lyingExtension,
};

export function pushIllustration(id) {
  // Only catalog IDs select detailed equipment; unknown records use local poses.
  const draw = Object.hasOwn(illustrations, id) && illustrations[id];
  return draw ? ground() + draw() : "";
}
