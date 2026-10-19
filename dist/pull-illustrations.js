// Original vector illustrations. Each exercise has its own equipment and pose.
// Shapes use local colours so they also render correctly outside the app CSS.
const C = {
  skin: "#d8a27e", shade: "#b97e5d", light: "#edbd97", hair: "#293c43",
  shirt: "#467c85", seam: "#315e68", shorts: "#304854", shoe: "#20343f",
  metal: "#82959c", dark: "#425b67", pad: "#344e5a", plate: "#526d78",
};
const path = (d, fill, extra = "") => `<path d="${d}" fill="${fill}" stroke="none" ${extra}/>`;
const line = (d, color = C.metal, width = 3, extra = "") =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const rect = (x, y, w, h, fill, r = 2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="none"/>`;
const ellipse = (x, y, rx, ry, fill) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="none"/>`;
const ground = () => ellipse(120, 165, 91, 5, "#dce6e9") + line("M23 166H217", "#c9d7dc", 1);

// Tapered closed contours, with rounded muscle bellies rather than stroked limbs.
function segment(a, b, wa, wb, fill) {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const p = (t, w) => `${a[0] + dx * t + nx * w},${a[1] + dy * t + ny * w}`;
  return path(`M${p(0, wa)} Q${p(.42, wa * 1.2)} ${p(1, wb)} Q${p(1.09, 0)} ${p(1, -wb)} Q${p(.42, -wa * 1.2)} ${p(0, -wa)} Q${p(-.12, 0)} ${p(0, wa)}Z`, fill);
}
function arm(shoulder, elbow, hand, far = false) {
  const skin = far ? C.shade : C.skin;
  return segment(shoulder, elbow, 6.1, 4.2, skin) + ellipse(...elbow, 4.3, 4.3, skin)
    + segment(elbow, hand, 4.5, 2.8, skin) + ellipse(...hand, 3.4, 3.8, skin)
    + (far ? "" : segment(shoulder, elbow, 1.1, .7, C.light));
}
function leg(hip, knee, ankle, far = false, facing = 1) {
  return segment(hip, knee, 8, 5.2, far ? C.shade : C.skin)
    + segment(knee, ankle, 5.5, 3.1, far ? C.shade : C.skin)
    + segment(hip, [hip[0] + (knee[0] - hip[0]) * .55, hip[1] + (knee[1] - hip[1]) * .55], 9, 7, C.shorts)
    + path(`M${ankle[0]-4} ${ankle[1]-3}q4 2 8 0l${facing*7} 5q2 4-2 4h-13q-4-1-3-4Z`, C.shoe)
    + line(`M${ankle[0]-5} ${ankle[1]+6}h16`, "#e1e9e6", 1.6);
}
function head(x, y, facing = 1) {
  return rect(x - 3, y + 5, 7, 10, C.shade, 2)
    + ellipse(x, y, 8, 10, C.skin)
    + path(`M${x+facing*6} ${y-2}l${facing*4} 5-4 1Z`, C.skin)
    + path(`M${x-8} ${y}q-3-13 7-12 11-1 9 10l-5-4-7 2-2 6Z`, C.hair)
    + ellipse(x - facing * 5, y + 1, 2, 3, C.light)
    + ellipse(x + facing * 5, y, .8, .8, C.hair);
}
function torso(x, y, angle = 0, back = false) {
  return `<g transform="translate(${x} ${y}) rotate(${angle})">`
    + path("M-9 0Q-17 1-17 12L-11 37Q0 42 11 37L17 12Q17 1 9 0L5 7H-5Z", C.shirt)
    + path("M-15 7Q-10 17-8 36L-11 37-17 12Z", C.seam)
    + path("M-11 37Q0 41 11 37L13 47H-13Z", C.shorts)
    + line(back ? "M0 11V31M-10 13L-3 20M10 13L3 20" : "M-5 12Q0 15 5 12M8 20L6 32", "#8eb5b8", 1.2)
    + "</g>";
}
function dumbbell(x, y, angle = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${angle})">` + rect(-12, -2, 24, 4, C.metal)
    + rect(-13, -7, 5, 14, C.shoe) + rect(8, -7, 5, 14, C.shoe)
    + rect(-9, -9, 4, 18, C.plate) + rect(5, -9, 4, 18, C.plate) + "</g>";
}
function barbell(x, y, ez = false) {
  return line(ez ? `M${x-37} ${y}h19l6-3 12 6 6-3h31` : `M${x-38} ${y}h76`, C.metal, 3)
    + rect(x-32,y-10,6,20,C.shoe) + rect(x-26,y-13,5,26,C.plate)
    + rect(x+21,y-13,5,26,C.plate) + rect(x+26,y-10,6,20,C.shoe);
}
function tower(x, pulleyY = 24) {
  return rect(x, 18, 27, 144, "#d4dfe2", 4) + rect(x+3,21,3,137,C.metal)
    + rect(x+22,21,3,137,C.metal) + rect(x+7,74,13,69,"#b6c6cc")
    + [0,1,2,3,4,5,6,7].map(i => rect(x+7,91+i*6,13,4,C.plate,1)).join("")
    + line(`M${x+13} 29V143`, "#eaf0f1", 1)
    + ellipse(x+13,pulleyY,6,6,C.dark) + ellipse(x+13,pulleyY,2,2,"#c5d4da")
    + rect(x-8,159,43,5,C.dark);
}
function seat(x, y, w = 42) {
  return line(`M${x+8} ${y+5}v${160-y-5}m${w-16} 0V${y+5}`,C.metal,4)
    + rect(x,y,w,8,C.pad,4) + line(`M${x+4} ${y+2}h${w-8}`,"#708b95",1);
}
function arrow(d, tip, angle = 0) {
  return line(d,"#a76c44",2,"stroke-dasharray=\"3 3\"")
    + path("M-4-3 0 3 4-3Z","#a76c44",`transform="translate(${tip[0]} ${tip[1]}) rotate(${angle})"`);
}

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
  if (single) return seat(61,114,108) + line("M78 122L66 160M153 122L168 160",C.metal,4)
    + leg([142,99],[152,130],[173,157],true) + leg([135,104],[108,111],[91,113])
    + torso(101,88,-67) + head(87,80,-1)
    + arm([103,91],[89,108],[74,111],true) + arm([110,91],[119,115],[103,125])
    + dumbbell(103,128) + arrow("M77 147Q68 129 82 120",[83,120],-80);
  return leg([134,108],[120,137],[127,158],true) + leg([143,110],[154,135],[163,158])
    + torso(109,80,-54) + head(96,66,-1)
    + arm([108,86],[101,111],[90,123],true) + arm([116,87],[134,108],[118,124])
    + barbell(105,126) + arrow("M73 135L82 112",[82,111],200);
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
  return line("M89 112L60 159M129 98L162 159M54 161H174",C.metal,5)
    + path("M78 120L137 77Q142 73 146 79L151 86 87 132Z",C.pad)
    + leg([140,110],[156,131],[165,158],true) + leg([132,115],[120,141],[112,158],false,-1)
    + torso(113,84,-43) + head(97,67,-1)
    + arm([105,91],[88,113],[91,128],true) + dumbbell(91,131)
    + arm([122,90],[131,117],[118,132]) + dumbbell(118,135)
    + arrow("M156 120L150 102",[149,101],160);
}
function pullover() {
  return tower(188,25) + line("M201 25L118 118",C.dark,1.5)
    + leg([89,116],[79,139],[68,158],true,-1) + leg([97,117],[117,136],[129,158])
    + torso(76,78,-29) + head(68,63)
    + arm([66,88],[86,106],[113,119],true) + arm([87,84],[103,102],[121,116])
    + line("M109 122L127 113",C.dark,4) + arrow("M148 68Q155 97 139 116",[139,117],25);
}
function rearDelt(machine = false) {
  return (machine ? line("M68 160V39H174V160M91 44L46 79M151 44L195 79",C.metal,5)
      + seat(101,128,40) + rect(112,87,17,39,C.pad,5) : "")
    + leg([111,124],[97,141],[91,159],true,-1) + leg([129,124],[143,140],[149,159])
    + (machine ? torso(120,84,0,true) + head(120,69)
      : path("M105 91Q120 85 135 91L139 102 130 125Q120 130 110 125L101 102Z",C.shirt)
        + path("M107 101Q120 109 133 101L128 123H112Z",C.seam) + head(120,94))
    + arm([105,94],[76,98],[48,83],true) + arm([135,94],[164,98],[192,83])
    + (machine ? line("M47 77V87M193 77V87",C.dark,5) : dumbbell(47,81,65)+dumbbell(193,81,-65))
    + arrow("M161 64Q177 62 185 71",[186,72],-40)
    + arrow("M79 64Q63 62 55 71",[54,72],40);
}
function facepull() {
  return tower(186,62) + line("M199 62L127 66",C.dark,1.5)
    + leg([91,119],[79,140],[68,159],true,-1) + leg([99,120],[115,139],[125,159])
    + torso(89,77,-8) + head(83,61)
    + line("M128 66L109 58M128 66L111 78",C.dark,3)
    + arm([79,84],[113,95],[108,60],true) + arm([103,82],[130,86],[111,77])
    + ellipse(108,59,4,4,C.dark) + ellipse(110,77,4,4,C.dark)
    + arrow("M163 49H136",[135,49],90);
}
function standingCurl(kind = "dumbbell") {
  const cable = kind === "cable", bar = kind === "barbell", hammer = kind === "hammer", shrug = kind === "shrug";
  const x = cable ? 88 : 120;
  const hands = shrug ? [[x-26,116],[x+26,116]] : [[x-29,91],[x+29,91]];
  return (cable ? tower(185,146) + line(`M198 146L${x+29} 91`,C.dark,1.5) : "")
    + leg([x-8,119],[x-16,139],[x-19,159],true,-1) + leg([x+8,119],[x+16,139],[x+19,159])
    + torso(x,76) + head(x,60)
    + arm([x-15,84],[x-25,108],hands[0],true) + arm([x+15,84],[x+25,108],hands[1])
    + (bar ? barbell(x,91) : cable ? line(`M${x-32} 91h64`,C.dark,4)
      : dumbbell(...hands[0],hammer ? 90 : 0) + dumbbell(...hands[1],hammer ? 90 : 0))
    + (shrug ? arrow(`M${x+40} 82V65`,[x+40,64],180)+arrow(`M${x-40} 82V65`,[x-40,64],180)
      : arrow(`M${x+48} 122Q${x+64} 104 ${x+46} 87`,[x+45,86],140));
}
function preacher() {
  return seat(57,124,45) + line("M132 105V160M109 160H154",C.metal,5)
    + leg([87,122],[113,136],[119,159],true) + leg([78,123],[74,140],[68,159],false,-1)
    + torso(80,78,-13) + head(73,63)
    + path("M100 91L153 111Q157 113 154 119L151 124 96 103Z",C.pad)
    + arm([72,87],[106,105],[130,92],true) + arm([96,85],[121,111],[141,95])
    + barbell(136,93,true) + arrow("M173 130Q184 113 168 99",[167,98],140);
}
function wrist() {
  return seat(60,123,62) + line("M125 139H167M135 140V161M158 140V161",C.metal,4)
    + rect(121,133,49,7,C.pad,3) + leg([97,123],[124,137],[130,159],true)
    + leg([89,124],[102,140],[99,159]) + torso(83,82,-23) + head(75,67)
    + arm([77,93],[115,127],[157,130],true) + arm([96,90],[128,131],[169,126])
    + dumbbell(173,123,10) + arrow("M188 142Q201 132 190 117",[189,116],140);
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
  "cable-curl": () => standingCurl("cable"), "preacher-curl": preacher, "wrist-curl": wrist,
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
