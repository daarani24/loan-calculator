(function () {
  "use strict";

  var Engine = window.LoanEngine;
  var Settings = window.LoanSettings;
  var Cur = window.LoanCurrency;

  var root = document.querySelector("[data-compare]");
  if (!root) return;

  var typeKey = "loan-comparison";
  var currency = Cur.getCurrency(Settings.LOAN_TYPES[typeKey].defaultCurrency);
  var LOANS = ["a", "b"];
  var FIELDS = ["amount", "rate", "term"];
  var state = {
    a: { amount: 0, rate: 0, term: 0, termUnit: "years" },
    b: { amount: 0, rate: 0, term: 0, termUnit: "years" }
  };

  function $(id) { return document.getElementById(id); }

  var inputs = {}, sliders = {}, displays = {}, unitSelects = {};
  LOANS.forEach(function (L) {
    inputs[L] = {};
    sliders[L] = {};
    displays[L] = {};
    FIELDS.forEach(function (f) {
      inputs[L][f] = $(L + "-" + f + "-input");
      sliders[L][f] = $(L + "-" + f + "-slider");
      displays[L][f] = $(L + "-" + f + "-display");
      inputs[L][f].step = "any";
    });
    unitSelects[L] = $(L + "-term-unit");
  });

  var currencySelect = $("currency");

  function plural(n, word) { return n + " " + word + (n === 1 ? "" : "s"); }

  function formatLength(months) {
    var y = Math.floor(months / 12);
    var m = months % 12;
    var parts = [];
    if (y) parts.push(plural(y, "year"));
    if (m) parts.push(plural(m, "month"));
    return parts.join(" ") || "0 months";
  }

  function money(value, decimals) { return Cur.formatMoney(value, currency, decimals); }

  function signedMoney(value, decimals) {
    var scale = Math.pow(10, decimals);
    if (Math.round(Math.abs(value) * scale) === 0) return "No difference";
    return (value > 0 ? "+" : "-") + money(Math.abs(value), decimals);
  }

  function signedLength(months) {
    if (months === 0) return "No difference";
    return (months > 0 ? "+" : "-") + formatLength(Math.abs(months));
  }

  function fieldConfig(L, name) {
    var cfg = Settings.getConfig(typeKey, currency);
    if (name === "term" && state[L].termUnit === "months") {
      return { min: 1, max: cfg.term.max * 12, step: 1 };
    }
    return cfg[name];
  }

  function clamp(L, name, value) {
    var c = fieldConfig(L, name);
    return Math.min(c.max, Math.max(c.min, value));
  }

  function applyDefaults() {
    var cfg = Settings.getConfig(typeKey, currency);
    var starts = {
      a: { amount: cfg.amount.start, rate: cfg.rate.start, term: cfg.term.start },
      b: { amount: cfg.startB.amount, rate: cfg.startB.rate, term: cfg.startB.term }
    };
    LOANS.forEach(function (L) {
      state[L].amount = starts[L].amount;
      state[L].rate = starts[L].rate;
      state[L].term = starts[L].term;
      state[L].termUnit = "years";
      unitSelects[L].value = "years";
    });
  }

  function setupRanges() {
    LOANS.forEach(function (L) {
      FIELDS.forEach(function (f) {
        var c = fieldConfig(L, f);
        sliders[L][f].min = c.min;
        sliders[L][f].max = c.max;
        sliders[L][f].step = c.step;
        inputs[L][f].min = c.min;
        inputs[L][f].max = c.max;
      });
    });
  }

  function writeControls() {
    LOANS.forEach(function (L) {
      FIELDS.forEach(function (f) {
        inputs[L][f].value = state[L][f];
        sliders[L][f].value = state[L][f];
      });
    });
  }

  function render() {
    LOANS.forEach(function (L) {
      var s = state[L];
      displays[L].amount.textContent = money(s.amount, 0);
      displays[L].rate.textContent = Number(s.rate.toFixed(2)) + "%";
      displays[L].term.textContent = plural(s.term, s.termUnit === "years" ? "year" : "month");
    });

    var c = Engine.compareLoans(state.a, state.b);

    $("cmp-a-emi").textContent = money(c.a.emi, 2);
    $("cmp-b-emi").textContent = money(c.b.emi, 2);
    $("cmp-diff-emi").textContent = signedMoney(c.emiDiff, 2);

    $("cmp-a-interest").textContent = money(c.a.totalInterest, 0);
    $("cmp-b-interest").textContent = money(c.b.totalInterest, 0);
    $("cmp-diff-interest").textContent = signedMoney(c.interestDiff, 0);

    $("cmp-a-total").textContent = money(c.a.totalPayment, 0);
    $("cmp-b-total").textContent = money(c.b.totalPayment, 0);
    $("cmp-diff-total").textContent = signedMoney(c.totalDiff, 0);

    $("cmp-a-length").textContent = formatLength(c.a.months);
    $("cmp-b-length").textContent = formatLength(c.b.months);
    $("cmp-diff-length").textContent = signedLength(c.b.months - c.a.months);

    var text;
    if (c.cheaper === "a") {
      text = "Loan A costs about " + money(Math.abs(c.interestDiff), 0) + " less in total interest than Loan B.";
    } else if (c.cheaper === "b") {
      text = "Loan B costs about " + money(Math.abs(c.interestDiff), 0) + " less in total interest than Loan A.";
    } else {
      text = "Both loans have the same total interest.";
    }
    if (c.emiDiff > 0.005) text += " Loan A has the lower monthly payment.";
    else if (c.emiDiff < -0.005) text += " Loan B has the lower monthly payment.";
    $("cmp-summary").textContent = text;
  }

  function fullRefresh() {
    setupRanges();
    writeControls();
    render();
  }

  LOANS.forEach(function (L) {
    FIELDS.forEach(function (f) {
      sliders[L][f].addEventListener("input", function () {
        state[L][f] = Number(sliders[L][f].value);
        inputs[L][f].value = state[L][f];
        render();
      });

      inputs[L][f].addEventListener("input", function () {
        var v = parseFloat(inputs[L][f].value);
        if (isNaN(v)) return;
        state[L][f] = clamp(L, f, v);
        sliders[L][f].value = state[L][f];
        render();
      });

      inputs[L][f].addEventListener("change", function () {
        inputs[L][f].value = state[L][f];
      });
    });

    unitSelects[L].addEventListener("change", function () {
      var newUnit = unitSelects[L].value;
      if (newUnit === state[L].termUnit) return;
      state[L].term = newUnit === "months" ? Math.round(state[L].term * 12) : Math.round(state[L].term / 12);
      state[L].termUnit = newUnit;
      state[L].term = clamp(L, "term", state[L].term);
      fullRefresh();
    });
  });

  currencySelect.addEventListener("change", function () {
    currency = currencySelect.value;
    Cur.setCurrency(currency);
    applyDefaults();
    fullRefresh();
  });

  Object.keys(Settings.CURRENCIES).forEach(function (code) {
    var opt = document.createElement("option");
    opt.value = code;
    opt.textContent = Settings.CURRENCIES[code].symbol + " " + code;
    currencySelect.appendChild(opt);
  });
  currencySelect.value = currency;

  applyDefaults();
  fullRefresh();
})();