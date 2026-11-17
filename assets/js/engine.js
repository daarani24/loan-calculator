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

  function buildSchedule(principal, annualRate, months, extraMonthly) {
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
    var base = buildSchedule(opts.amount, opts.rate, months, 0);
    var withExtra = opts.extra > 0
      ? buildSchedule(opts.amount, opts.rate, months, opts.extra)
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

  var api = {
    monthlyPayment: monthlyPayment,
    termToMonths: termToMonths,
    buildSchedule: buildSchedule,
    calculateLoan: calculateLoan,
    summarizeByYear: summarizeByYear
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LoanEngine = api;
})(typeof window !== "undefined" ? window : this);