import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { lbToKg, kgToLb } from "../dist/core.js";

// Exercise the actual picker commit with the wheel's canonical kg selection.
const app = readFileSync(new URL("../dist/app.js", import.meta.url), "utf8");
const commit = app.slice(app.indexOf("function commitSetPicker()"), app.indexOf("function ", app.indexOf("function commitSetPicker()") + 10));
function saveLoad(unit, kg, dirtyValue = true) {
  const set = { kg: 20, unit: "kg" };
  const context = {
    state: { sessions: [{ id: "session", exercises: [{ sets: [set] }] }] },
    activeSetPicker: { sessionId: "session", exerciseIndex: 0, setIndex: 0, field: "kg", unit, kg, originalKg: 20, dirtyValue },
    lbToKg, closeModal() {}, save() {},
  };
  vm.runInNewContext(commit + "\ncommitSetPicker();", context);
  return set;
}
test("guardar 50 lb conserva 50 lb y su carga equivalente en kg al recargar", () => {
  for (const pounds of [1, 25, 50, 100, 225]) {
    const set = JSON.parse(JSON.stringify(saveLoad("lb", lbToKg(pounds))));
    assert.equal(set.unit, "lb");
    assert.equal(set.kg, lbToKg(pounds));
    assert.equal(Math.round(kgToLb(set.kg)), pounds);
  }
});
test("guardar kg y cambiar solo la unidad conservan la carga", () => {
  assert.equal(saveLoad("kg", 50).kg, 50);
  assert.equal(saveLoad("lb", 20, false).kg, 20);
});
