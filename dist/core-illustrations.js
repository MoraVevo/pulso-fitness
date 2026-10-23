// Original vector illustrations for the core family,
// sharing the figure and equipment language of the pull/push sets.
import {
  C, path, line, rect, ellipse, ground, segment, arm, leg, head,
  tower, arrow, profileTorso, profileHead, grip,
} from "./exercise-drawing.js";

// Crunch en el piso: tronco enrollado, manos junto a la cabeza.
function crunch() {
  return leg([84, 146], [116, 128], [120, 157], true)
    + arm([56, 114], [44, 96], [40, 102], true)
    + leg([90, 148], [122, 130], [126, 157])
    + profileTorso([58, 118], [90, 150])
    + profileHead([58, 118], 44, 108)
    + arm([60, 116], [48, 98], [46, 106])
    + grip(46, 106)
    + arrow("M28 130Q20 116 26 102", [27, 101], 160);
}

// Crunch en polea: de rodillas, cuerda detrás de la cabeza.
function cableCrunch() {
  return tower(196, 26)
    + line("M209 28L146 96", C.dark, 1.5)
    + leg([98, 124], [110, 152], [88, 156], true, -1)
    + arm([134, 108], [144, 124], [138, 94], true)
    + leg([104, 126], [116, 152], [94, 156], false, -1)
    + profileTorso([140, 112], [102, 126])
    + profileHead([140, 112], 158, 104)
    + line("M146 96L138 90M146 96L152 104", C.dark, 3)
    + grip(138, 90) + grip(152, 104)
    + arm([142, 112], [154, 126], [150, 102])
    + arrow("M178 58Q188 74 180 90", [179, 91], 25);
}

// Elevaciones de piernas colgado de la barra.
function legRaise() {
  return line("M66 30H178", C.dark, 6)
    + line("M92 2V30M152 2V30", C.metal, 5)
    + leg([106, 116], [140, 110], [170, 106], true)
    + arm([108, 76], [106, 50], [104, 29], true)
    + leg([112, 118], [146, 114], [178, 110])
    + profileTorso([114, 78], [112, 118])
    + profileHead([114, 78], 116, 60)
    + arm([118, 78], [116, 52], [122, 29])
    + line("M97 29h8M117 29h9", C.skin, 4.5)
    + arrow("M200 130V106", [200, 105], 180);
}

// Rueda abdominal: rodillas al piso, brazos extendidos sobre la rueda.
function abWheel() {
  return leg([94, 118], [104, 152], [84, 154], true, -1)
    + arm([138, 98], [162, 112], [170, 126], true)
    + leg([100, 120], [110, 152], [90, 154], false, -1)
    + profileTorso([142, 102], [98, 122])
    + profileHead([142, 102], 156, 96)
    + ellipse(184, 146, 14, 14, C.dark)
    + ellipse(184, 146, 7, 11, C.metal)
    + ellipse(184, 146, 2.5, 2.5, "#b7c9ce")
    + arm([146, 104], [168, 116], [176, 130])
    + grip(176, 130)
    + arrow("M196 90Q214 100 218 116", [219, 117], 70);
}

const illustrations = {
  crunch, cablecrunch: cableCrunch, "leg-raise": legRaise, "ab-wheel": abWheel,
};

export function coreIllustration(id) {
  // Only catalog IDs select detailed equipment; unknown records use local poses.
  const draw = Object.hasOwn(illustrations, id) && illustrations[id];
  return draw ? ground() + draw() : "";
}
