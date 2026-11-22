(function (root) {
  "use strict";

  function monthlyPayment(principal, annualRate, months) {
    if (principal <= 0 || months <= 0) return 0;
    var r = annualRate / 12 / 100;
    if (r === 0) return principal / months;
    var f = Math.pow(1 + r, months);
    return (principal * r * f) / (f - 1);
  }

  function termToMonths(value, unit) {
    return unit === "years" ? Math.round(value * 12) : Math.round(value);
  }

  function buildSchedule(principal, annualRate, months, extraMonthly, lump) {
    var r = annualRate / 12 / 100;
    var emi = monthlyPayment(principal, annualRate, months);
    var extra = extraMonthly > 0 ? extraMonthly : 0;
    var balance = principal;
    var rows = [];
    var totalInterest = 0;
    var totalPaid = 0;

    for (var m = 1; m <= months && balance > 0.005; m++) {
      var interest = balance * r;
      var principalPaid = emi + extra - interest;
      if (lump && lump.amount > 0 && m === lump.month) principalPaid += lump.amount;
      if (principalPaid > balance - 0.005) principalPaid = balance;
      balance -= principalPaid;
      totalInterest += interest;
      totalPaid += principalPaid + interest;
      rows.push({
        month: m,
        payment: principalPaid + interest,
        principal: principalPaid,
        interest: interest,
        balance: balance < 0.005 ? 0 : balance
      });
    }

    return {
      emi: emi,
      rows: rows,
      months: rows.length,
      totalInterest: totalInterest,
      totalPayment: totalPaid
    };
  }

  function calculateLoan(opts) {
    var months = termToMonths(opts.term, opts.termUnit);
    var base = buildSchedule(opts.amount, opts.rate, months, 0, null);
    var withExtra = opts.extra > 0
      ? buildSchedule(opts.amount, opts.rate, months, opts.extra, null)
      : base;

    return {
      emi: base.emi,
      totalInterest: withExtra.totalInterest,
      totalPayment: withExtra.totalPayment,
      months: withExtra.months,
      rows: withExtra.rows,
      monthsSaved: base.months - withExtra.months,
      interestSaved: base.totalInterest - withExtra.totalInterest
    };
  }

  function calculatePrepayment(opts) {
    var months = termToMonths(opts.term, opts.termUnit);
    var lump = null;
    if (opts.lumpAmount > 0) {
      lump = {
        month: Math.min(Math.max(Math.round(opts.lumpMonth), 1), months),
        amount: opts.lumpAmount
      };
    }
    var base = buildSchedule(opts.amount, opts.rate, months, 0, null);
    var plan = buildSchedule(opts.amount, opts.rate, months, opts.extra, lump);

    return {
      emi: base.emi,
      baseMonths: base.months,
      baseInterest: base.totalInterest,
      newMonths: plan.months,
      newInterest: plan.totalInterest,
      newTotal: plan.totalPayment,
      monthsSaved: base.months - plan.months,
      interestSaved: base.totalInterest - plan.totalInterest,
      rows: plan.rows
    };
  }

  function summarizeByYear(rows) {
    var years = [];
    rows.forEach(function (row) {
      var y = Math.ceil(row.month / 12);
      var entry = years[y - 1];
      if (!entry) {
        entry = { year: y, principal: 0, interest: 0, balance: 0 };
        years[y - 1] = entry;
      }
      entry.principal += row.principal;
      entry.interest += row.interest;
      entry.balance = row.balance;
    });
    return years;
  }

  function solveReducingRate(principal, emi, months) {
    if (emi * months <= principal) return 0;
    var lo = 0, hi = 100;
    for (var i = 0; i < 100; i++) {
      var mid = (lo + hi) / 2;
      if (monthlyPayment(principal, mid, months) < emi) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }

  function flatLoan(amount, flatRate, months) {
    if (amount <= 0 || months <= 0) {
      return { emi: 0, totalInterest: 0, totalPayment: 0, reducingRate: 0 };
    }
    var totalInterest = amount * (flatRate / 100) * (months / 12);
    var totalPayment = amount + totalInterest;
    var emi = totalPayment / months;
    return {
      emi: emi,
      totalInterest: totalInterest,
      totalPayment: totalPayment,
      reducingRate: solveReducingRate(amount, emi, months)
    };
  }

  function compareLoans(a, b) {
    var ra = calculateLoan({ amount: a.amount, rate: a.rate, term: a.term, termUnit: a.termUnit, extra: 0 });
    var rb = calculateLoan({ amount: b.amount, rate: b.rate, term: b.term, termUnit: b.termUnit, extra: 0 });
    var interestDiff = rb.totalInterest - ra.totalInterest;
    var cheaper = "same";
    if (interestDiff > 0.005) cheaper = "a";
    else if (interestDiff < -0.005) cheaper = "b";
    return {
      a: { emi: ra.emi, totalInterest: ra.totalInterest, totalPayment: ra.totalPayment, months: ra.months },
      b: { emi: rb.emi, totalInterest: rb.totalInterest, totalPayment: rb.totalPayment, months: rb.months },
      emiDiff: rb.emi - ra.emi,
      interestDiff: interestDiff,
      totalDiff: rb.totalPayment - ra.totalPayment,
      cheaper: cheaper
    };
  }

  var api = {
    monthlyPayment: monthlyPayment,
    termToMonths: termToMonths,
    buildSchedule: buildSchedule,
    calculateLoan: calculateLoan,
    calculatePrepayment: calculatePrepayment,
    summarizeByYear: summarizeByYear,
    flatLoan: flatLoan,
    compareLoans: compareLoans
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LoanEngine = api;
})(typeof window !== "undefined" ? window : this);