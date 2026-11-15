const assert = require("assert");
const E = require("../assets/js/engine.js");

function near(actual, expected, tol, label) {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    label + ": got " + actual + ", expected " + expected
  );
}

let r = E.calculateLoan({ amount: 100000, rate: 12, term: 12, termUnit: "months", extra: 0 });
near(r.emi, 8884.88, 0.01, "EMI");
near(r.totalInterest, 6618.55, 0.05, "total interest");
near(r.totalPayment, 106618.55, 0.05, "total payment");
assert.strictEqual(r.rows.length, 12);
near(r.rows[11].balance, 0, 0.001, "final balance");

r = E.calculateLoan({ amount: 12000, rate: 0, term: 12, termUnit: "months", extra: 0 });
near(r.emi, 1000, 0.001, "0% EMI");
near(r.totalInterest, 0, 0.001, "0% interest");

r = E.calculateLoan({ amount: 1000000, rate: 8, term: 20, termUnit: "years", extra: 0 });
near(r.emi, 8364.4, 1, "20-year EMI");
assert.strictEqual(r.rows.length, 240);

r = E.calculateLoan({ amount: 100000, rate: 12, term: 12, termUnit: "months", extra: 5000 });
assert.ok(r.months < 12, "extra payment should shorten the loan");
assert.ok(r.totalInterest < 6618.55, "extra payment should cut interest");
assert.ok(r.interestSaved > 0 && r.monthsSaved > 0, "savings should be positive");
const principalSum = r.rows.reduce((s, row) => s + row.principal, 0);
near(principalSum, 100000, 0.01, "principal repaid = loan amount");

console.log("All engine tests passed");