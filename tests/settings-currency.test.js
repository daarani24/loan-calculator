const assert = require("assert");
const S = require("../assets/js/settings.js");
const C = require("../assets/js/currency.js");

Object.keys(S.LOAN_TYPES).forEach(function (type) {
  Object.keys(S.CURRENCIES).forEach(function (cur) {
    var cfg = S.getConfig(type, cur);
    ["amount", "rate", "term"].forEach(function (field) {
      var x = cfg[field];
      var label = type + " / " + cur + " / " + field;
      assert.ok(x.min <= x.start && x.start <= x.max, label + ": start is outside min/max");
      assert.ok(x.step > 0, label + ": step must be above 0");
      var n = (x.start - x.min) / x.step;
      assert.ok(Math.abs(n - Math.round(n)) < 1e-9, label + ": start is not on a slider step");
    });
  });
});

assert.strictEqual(C.formatMoney(500000, "INR", 0), "₹5,00,000");
assert.strictEqual(C.formatMoney(10000000, "INR", 0), "₹1,00,00,000");
assert.strictEqual(C.formatMoney(1234567, "USD", 0), "$1,234,567");
assert.strictEqual(C.formatMoney(12500.5, "GBP", 2), "£12,500.50");
assert.strictEqual(C.formatNumber(500000, "INR"), "5,00,000");

assert.strictEqual(C.getCurrency("INR"), "INR");

assert.throws(function () { S.getConfig("nope", "USD"); });

Object.keys(S.CURRENCIES).forEach(function (cur) {
  var cfg = S.getConfig("loan-comparison", cur);
  ["amount", "rate", "term"].forEach(function (field) {
    var x = cfg[field];
    var v = cfg.startB[field];
    var label = "loan-comparison / " + cur + " / startB " + field;
    assert.ok(x.min <= v && v <= x.max, label + ": outside min/max");
    var n = (v - x.min) / x.step;
    assert.ok(Math.abs(n - Math.round(n)) < 1e-9, label + ": not on a slider step");
  });
});

console.log("All settings and currency tests passed");