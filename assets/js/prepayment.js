(function () {
  "use strict";

  var Engine = window.LoanEngine;
  var Settings = window.LoanSettings;
  var Cur = window.LoanCurrency;

  var root = document.querySelector("[data-prepayment]");
  if (!root) return;

  var typeKey = "prepayment";
  var currency = Cur.getCurrency(Settings.LOAN_TYPES[typeKey].defaultCurrency);
  var state = { amount: 0, rate: 0, term: 0, termUnit: "years", extra: 0, lump: 0, lumpmonth: 12 };

  function $(id) { return document.getElementById(id); }

  var FIELDS = ["amount", "rate", "term", "extra", "lump", "lumpmonth"];
  var inputs = {}, sliders = {}, displays = {};
  FIELDS.forEach(function (f) {
    inputs[f] = $(f + "-input");
    sliders[f] = $(f + "-slider");
    displays[f] = $(f + "-display");
    inputs[f].step = "any";
  });

  var currencySelect = $("currency");
  var termUnitSelect = $("term-unit");

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

  function fieldConfig(name) {
    var cfg = Settings.getConfig(typeKey, currency);
    if (name === "extra") {
      return { min: 0, max: cfg.amount.start * 0.05, step: cfg.amount.step / 10 };
    }
    if (name === "lump") {
      return { min: 0, max: state.amount, step: cfg.amount.step };
    }
    if (name === "lumpmonth") {
      return { min: 1, max: Math.max(1, Engine.termToMonths(state.term, state.termUnit)), step: 1 };
    }
    if (name === "term" && state.termUnit === "months") {
      return { min: 1, max: cfg.term.max * 12, step: 1 };
    }
    return cfg[name];
  }

  function clamp(name, value) {
    var c = fieldConfig(name);
    return Math.min(c.max, Math.max(c.min, value));
  }

  function applyDefaults() {
    var cfg = Settings.getConfig(typeKey, currency);
    state.amount = cfg.amount.start;
    state.rate = cfg.rate.start;
    state.termUnit = "years";
    termUnitSelect.value = "years";
    state.term = cfg.term.start;
    state.extra = 0;
    state.lump = 0;
    state.lumpmonth = 12;
  }

  function setupRanges() {
    FIELDS.forEach(function (f) {
      var c = fieldConfig(f);
      sliders[f].min = c.min;
      sliders[f].max = c.max;
      sliders[f].step = c.step;
      inputs[f].min = c.min;
      inputs[f].max = c.max;
    });
  }

  function writeControls() {
    FIELDS.forEach(function (f) {
      inputs[f].value = state[f];
      sliders[f].value = state[f];
    });
  }

  function syncDependent() {
    ["lump", "lumpmonth"].forEach(function (f) {
      var c = fieldConfig(f);
      sliders[f].max = c.max;
      inputs[f].max = c.max;
      var v = clamp(f, state[f]);
      if (v !== state[f]) {
        state[f] = v;
        sliders[f].value = v;
        inputs[f].value = v;
      }
    });
  }

  function render() {
    syncDependent();

    displays.amount.textContent = money(state.amount, 0);
    displays.rate.textContent = Number(state.rate.toFixed(2)) + "%";
    displays.term.textContent = plural(state.term, state.termUnit === "years" ? "year" : "month");
    displays.extra.textContent = money(state.extra, 0);
    displays.lump.textContent = money(state.lump, 0);
    displays.lumpmonth.textContent = "Month " + state.lumpmonth;

    var r = Engine.calculatePrepayment({
      amount: state.amount,
      rate: state.rate,
      term: state.term,
      termUnit: state.termUnit,
      extra: state.extra,
      lumpAmount: state.lump,
      lumpMonth: state.lumpmonth
    });

    $("res-saved").textContent = money(Math.max(0, r.interestSaved), 0);
    $("res-payment").textContent = money(r.emi, 2);
    $("res-time-saved").textContent = r.monthsSaved > 0 ? formatLength(r.monthsSaved) : "None";
    $("res-orig-length").textContent = formatLength(r.baseMonths);
    $("res-new-length").textContent = formatLength(r.newMonths);
    $("res-orig-interest").textContent = money(r.baseInterest, 0);
    $("res-new-interest").textContent = money(r.newInterest, 0);

    var summary = $("res-summary");
    if (r.monthsSaved > 0) {
      summary.textContent = "With these prepayments you finish " + formatLength(r.monthsSaved) +
        " sooner and save about " + money(r.interestSaved, 0) + " in interest.";
    } else if (r.interestSaved > 0.5) {
      summary.textContent = "With these prepayments you save about " + money(r.interestSaved, 0) + " in interest.";
    } else {
      summary.textContent = "Add an extra monthly payment or a one-time prepayment to see how much you can save.";
    }
  }

  function fullRefresh() {
    setupRanges();
    writeControls();
    render();
  }

  FIELDS.forEach(function (f) {
    sliders[f].addEventListener("input", function () {
      state[f] = Number(sliders[f].value);
      inputs[f].value = state[f];
      render();
    });

    inputs[f].addEventListener("input", function () {
      var v = parseFloat(inputs[f].value);
      if (isNaN(v)) return;
      state[f] = clamp(f, v);
      sliders[f].value = state[f];
      render();
    });

    inputs[f].addEventListener("change", function () {
      inputs[f].value = state[f];
    });
  });

  termUnitSelect.addEventListener("change", function () {
    var newUnit = termUnitSelect.value;
    if (newUnit === state.termUnit) return;
    state.term = newUnit === "months" ? Math.round(state.term * 12) : Math.round(state.term / 12);
    state.termUnit = newUnit;
    state.term = clamp("term", state.term);
    fullRefresh();
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