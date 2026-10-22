import { C, path, line, rect, ellipse, ground, segment, arm, leg, head, torso, dumbbell, barbell, tower, seat, arrow, profileTorso, profileHead, endOnWeight, cableHandle, grip } from "./exercise-drawing.js";

function pulldown(neutral = false) {
  const hands = neutral ? [[96,65],[130,65]] : [[74,52],[150,52]];
  return tower(185) + line("M198 24H113V54",C.dark,2) + line("M185 20H113",C.metal,6)
    + seat(89,124,49) + leg([106,123],[138,132],[145,158],true)
    + leg([114,125],[91,137],[89,158]) + head(112,67) + torso(112,81,0,true)
    + arm([98,88],[78,86],hands[0],true) + arm([126,88],[146,86],hands[1])
    + (neutral ? line("M96 65V56H130V65",C.dark,4) : line("M74 52L91 57H134L150 52",C.dark,4))
    + rect(85,117,55,7,C.pad,3) + arrow("M163 45V73",[163,74]);
}
function pullup(supine = false) {
  const hx = supine ? [97,135] : [75,157];
  return line("M40 160V18H196V160M29 161H53M183 161H209",C.metal,6)
    + line("M64 22H168",C.dark,5) + leg([110,110],[98,135],[119,148],true)
    + leg([122,110],[136,134],[119,151],false,-1) + torso(116,69,0,true) + head(116,54)
    + arm([101,76],[83,59],[hx[0],23],true) + arm([131,76],[151,59],[hx[1],23])
    + line(`M${hx[0]-3} 23h6m${hx[1]-hx[0]-6} 0h6`,supine ? C.light : C.skin,5)
    + arrow("M174 108V80",[174,79],180);
}
function bentRow(single = false) {
  if (single) return seat(61,107,115)
    + leg([100,85],[115,100],[79,100],true)
    + arm([150,71],[157,88],[163,105],true)
    + leg([97,86],[79,121],[68,158])
    + profileTorso([148,68],[97,82]) + profileHead([148,68],163,54)
    + arm([143,75],[112,81],[119,105])
    + dumbbell(119,106) + grip(119,105) + grip(163,105)
    + arrow("M99 137Q94 119 102 103",[103,102],-155);
  return leg([94,108],[90,135],[75,158],true)
    + arm([131,79],[102,89],[121,107],true)
    + leg([100,110],[106,136],[94,158])
    + profileTorso([135,75],[97,105]) + profileHead([135,75],149,61)
    + arm([136,82],[106,89],[125,111])
    + endOnWeight(125,111) + grip(125,111)
    + arrow("M158 141Q155 123 145 111",[144,110],140);
}
function seatedRow(machine = false) {
  return (machine ? tower(190,73) + line("M158 57L178 62V105L149 112",C.metal,6)
    + rect(109,91,9,29,C.pad,3) : tower(190,143))
    + seat(63,122,52) + line("M156 143L163 156M154 144L167 136",C.dark,5)
    + leg([99,120],[136,131],[158,146],true) + leg([92,122],[129,136],[152,151])
    + torso(87,77,-5) + head(83,62)
    + (machine ? line("M175 83L132 101",C.dark,4) : line("M203 143L128 103",C.dark,1.5))
    + arm([78,85],[104,108],[129,102],true) + arm([99,83],[113,111],[132,104])
    + line("M129 98L136 103L131 108",C.dark,3) + arrow("M157 113L137 109",[136,109],90);
}
function supportedRow() {
  return line("M91 124L73 160M130 88L159 160M61 162H171",C.metal,5)
    + path("M80 127L139 72Q143 69 147 74L150 79 89 136Z",C.pad)
    + line("M88 126L143 76","#738f98",1.5)
    + leg([84,120],[70,139],[64,158],true)
    + arm([127,76],[102,95],[115,116],true) + dumbbell(115,116)
    + leg([91,121],[86,141],[80,158])
    + profileTorso([129,71],[86,116]) + profileHead([129,71],143,55)
    + arm([133,80],[107,94],[121,117])
    + dumbbell(121,118) + grip(121,117)
    + arrow("M160 129Q157 109 146 100",[145,99],140);
}
function pullover() {
  return tower(189,25) + line("M202 25L148 125",C.dark,1.5)
    + leg([93,119],[88,139],[79,158],true)
    + arm([111,79],[129,101],[145,123],true)
    + leg([101,120],[111,140],[109,158])
    + profileTorso([114,76],[97,115]) + profileHead([114,76],124,61)
    + arm([117,81],[134,104],[151,127])
    + cableHandle(148,125) + grip(145,123) + grip(151,127)
    + arrow("M160 79Q173 98 163 117",[162,118],25);
}
function rearDelt(machine = false) {
  if (machine) return reversePecDeck();
  return leg([111,124],[97,141],[91,159],true,-1) + leg([129,124],[143,140],[149,159])
    + path("M105 91Q120 85 135 91L139 102 130 125Q120 130 110 125L101 102Z",C.shirt)
    + path("M107 101Q120 109 133 101L128 123H112Z",C.seam) + head(120,94)
    + arm([105,94],[76,98],[48,83],true) + arm([135,94],[164,98],[192,83])
    + dumbbell(47,81,65)+dumbbell(193,81,-65)
    + arrow("M161 64Q177 62 185 71",[186,72],-40)
    + arrow("M79 64Q63 62 55 71",[54,72],40);
}
function reversePecDeck() {
  return tower(183,42) + line("M196 42H140V36M140 36L72 79M140 36L88 77",C.metal,5)
    + ellipse(140,36,7,7,C.dark) + ellipse(140,36,3,3,C.metal)
    + line("M134 116V160M105 161H156",C.metal,5) + seat(96,126,43)
    + leg([113,125],[145,131],[144,158],true)
    + arm([116,82],[102,91],[88,86],true)
    + leg([109,127],[137,135],[135,158])
    + profileTorso([119,79],[109,121]) + profileHead([119,79],121,63)
    + rect(130,80,9,35,C.pad,4)
    + line("M72 79V94M88 77V91",C.dark,4)
    + arm([118,85],[94,94],[72,88]) + grip(72,88)
    + arrow("M104 60Q82 56 67 68",[66,69],45);
}
function facepull() {
  const farHand = [114,58], nearHand = [119,68], junction = [147,63];
  return tower(186,63) + line(`M199 63L${junction.join(" ")}`,C.dark,1.5)
    + line(`M${farHand.join(" ")}L${junction.join(" ")}L${nearHand.join(" ")}`,C.dark,3)
    + leg([91,121],[83,140],[72,158],true)
    + arm([99,81],[76,64],farHand,true)
    + leg([98,122],[110,141],[119,158])
    + profileTorso([100,79],[94,117]) + profileHead([100,79],105,62)
    + arm([102,84],[81,71],nearHand)
    + ellipse(...farHand,4.5,4.5,C.dark) + grip(...farHand)
    + ellipse(...nearHand,4.5,4.5,C.dark) + grip(...nearHand)
    + arrow("M171 49H143",[142,49],90);
}
function standingCurl(kind = "dumbbell") {
  const bar = kind === "barbell", hammer = kind === "hammer", shrug = kind === "shrug";
  const x = 120;
  const hands = shrug ? [[x-26,116],[x+26,116]] : [[x-29,91],[x+29,91]];
  return leg([x-8,119],[x-16,139],[x-19,159],true,-1) + leg([x+8,119],[x+16,139],[x+19,159])
    + torso(x,76) + head(x,60)
    + arm([x-15,84],[x-25,108],hands[0],true) + arm([x+15,84],[x+25,108],hands[1])
    + (bar ? barbell(x,91) : dumbbell(...hands[0],hammer ? 90 : 0) + dumbbell(...hands[1],hammer ? 90 : 0))
    + (shrug ? arrow(`M${x+40} 82V65`,[x+40,64],180)+arrow(`M${x-40} 82V65`,[x-40,64],180)
      : arrow(`M${x+48} 122Q${x+64} 104 ${x+46} 87`,[x+45,86],140));
}
function preacher() {
  return seat(65,126,43) + line("M130 112V160M113 161H158",C.metal,5)
    + path("M104 91L145 116Q148 118 145 123L142 126 98 100Z",C.pad)
    + line("M105 95L143 119","#738f98",1.5)
    + leg([84,125],[119,135],[126,158],true)
    + arm([98,86],[131,109],[151,85],true)
    + leg([81,126],[108,139],[111,158])
    + profileTorso([99,80],[83,120]) + profileHead([99,80],108,65)
    + arm([104,87],[134,113],[156,89])
    + endOnWeight(156,89) + grip(156,89)
    + arrow("M184 126Q193 103 180 89",[179,88],140);
}
function wrist() {
  return seat(64,128,53)
    + leg([86,124],[128,129],[132,158],true)
    + segment([101,84],[112,118],6,4,C.shade)
    + segment([112,118],[140,122],4.5,2.8,C.shade)
    + segment([140,122],[146,113],2.8,2.8,C.shade)
    + endOnWeight(146,113,true) + grip(146,113)
    + leg([86,126],[133,132],[136,158])
    + profileTorso([102,80],[84,121]) + profileHead([102,80],115,65)
    + segment([105,87],[116,121],6,4,C.skin)
    + segment([116,121],[144,126],4.5,2.8,C.skin)
    + segment([144,126],[150,117],2.8,2.8,C.skin)
    + endOnWeight(150,117,true) + grip(150,117)
    + arrow("M177 131Q187 116 175 105",[174,104],140);
}
function cableCurl() {
  const handle = [138,89];
  return tower(185,146) + line(`M198 146L${handle.join(" ")}`,C.dark,1.5)
    + leg([96,121],[91,140],[86,158],true)
    + arm([99,84],[101,108],[135,87],true)
    + leg([103,122],[108,141],[113,158])
    + profileTorso([101,79],[99,117]) + profileHead([101,79],104,63)
    + arm([104,85],[107,111],[141,91])
    + cableHandle(...handle) + grip(135,87) + grip(141,91)
    + arrow("M156 119Q167 104 156 88",[155,87],140);
}

const illustrations = {
  pulldown: () => pulldown(), "neutral-pulldown": () => pulldown(true),
  pullup: () => pullup(), chinup: () => pullup(true),
  row: () => bentRow(), "dumbbell-row": () => bentRow(true),
  "cable-row": () => seatedRow(), "machine-row": () => seatedRow(true),
  "chest-supported-row": supportedRow, pullover,
  "rear-delt": () => rearDelt(), "reverse-pec-deck": () => rearDelt(true),
  facepull, shrug: () => standingCurl("shrug"), curl: () => standingCurl(),
  "barbell-curl": () => standingCurl("barbell"), hammer: () => standingCurl("hammer"),
  "cable-curl": cableCurl, "preacher-curl": preacher, "wrist-curl": wrist,
};
const fallback = {
  pulldown: "pulldown", pullup: "pullup", row: "row", "seated-row": "cable-row",
  pullover: "pullover", "rear-delt": "rear-delt", facepull: "facepull",
  shrug: "shrug", curl: "curl", wrist: "wrist-curl",
};
export function pullIllustration(id, pattern) {
  const draw = illustrations[id] || illustrations[fallback[pattern]];
  return draw ? ground() + draw() : "";
}
