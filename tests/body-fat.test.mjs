import test from "node:test";
import assert from "node:assert/strict";
import { navyBodyFat, kgToLb, lbToKg } from "../dist/core.js";

test("Navy calcula los dos modelos usando centímetros", () => {
  assert.equal(navyBodyFat({sex: "male", height: 177.8, waist: 86.36, neck: 38.1}), 17.5);
  assert.equal(navyBodyFat({sex: "female", height: 165.1, waist: 71.12, hip: 96.52, neck: 33.02}), 25.9);
});
test("rechaza circunferencias incompletas o sin resultado válido", () => {
  assert.equal(navyBodyFat({sex: "male", height: 170, waist: 30, neck: 40}), null);
  assert.equal(navyBodyFat({sex: "female", height: 165, waist: 70, neck: 30}), null);
  assert.equal(navyBodyFat({sex: "other", height: 165, waist: 70, neck: 30}), null);
});
test("la conversión de libras conserva el peso en kg", () => {
  assert.ok(Math.abs(lbToKg(kgToLb(75)) - 75) < 1e-10);
});

