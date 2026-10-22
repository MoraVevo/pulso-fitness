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

// Profile poses share one projection: the bar axis points into the page.
// Shoulder/hip anchors also locate the neck and the contact with bench pads.
function profileTorso(shoulder, hip) {
  const dx = hip[0] - shoulder[0], dy = hip[1] - shoulder[1];
  const angle = Math.atan2(dy, dx) * 180 / Math.PI - 90;
  return `<g transform="translate(${shoulder.join(" ")}) rotate(${angle}) scale(1 ${Math.hypot(dx,dy)/43})">`
    + path("M-5-3Q-11 0-10 11L-8 34-9 43H9L8 33Q13 21 11 9 11 1 5-2L3 5H-2Z",C.shirt)
    + path("M-7 8Q-3 24-4 39L-9 43-8 30-10 11Z",C.seam)
    + path("M-9 39Q0 42 9 39L11 50H-10Z",C.shorts)
    + line("M6 17Q8 27 4 34","#8eb5b8",1.2) + "</g>";
}
function profileHead(shoulder, x, y) {
  return segment(shoulder,[x-3,y+8],4,3,C.skin) + head(x,y);
}
function endOnWeight(x, y, small = false) {
  const r = small ? 6 : 11;
  return ellipse(x-6,y-4,r*.7,r,C.plate)
    + line(`M${x-11} ${y-7}L${x+13} ${y+8}`,"#b5c3c8",3)
    + ellipse(x+8,y+5,r*.78,r,C.shoe)
    + ellipse(x+10,y+5,r*.65,r*.94,C.plate)
    + ellipse(x+10,y+5,2,2,"#b7c9ce")
    + line(`M${x+10} ${y+5}l5 3`,C.metal,2);
}
function cableHandle(x, y) {
  return line(`M${x-8} ${y-5}L${x+8} ${y+5}`,C.dark,4)
    + ellipse(x,y,3,3,C.metal);
}
function grip(x,y) {
  return ellipse(x,y,3.3,3.8,C.skin) + line(`M${x-1} ${y-2}l3 1`,C.light,1.4);
}

export { C, path, line, rect, ellipse, ground, segment, arm, leg, head, torso, dumbbell, barbell, tower, seat, arrow, profileTorso, profileHead, endOnWeight, cableHandle, grip };
