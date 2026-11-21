(function () {
  "use strict";

  var Engine = window.LoanEngine;
  var Settings = window.LoanSettings;
  var Cur = window.LoanCurrency;

  var root = document.querySelector("[data-converter]");
  if (!root) return;

  var typeKey = "flat-to-reducing";
  var currency = Cur.getCurrency(Settings.LOAN_TYPES[typeKey].defaultCurrency);
  var state = { amount: 0, rate: 0, term: 0, termUnit: "years" };

  function $(id) { return document.getElementById(id); }

  var FIELDS = ["amount", "rate", "term"];
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

  function render() {
    displays.amount.textContent = money(state.amount, 0);
    displays.rate.textContent = Number(state.rate.toFixed(2)) + "%";
    displays.term.textContent = plural(state.term, state.termUnit === "years" ? "year" : "month");

    var months = Engine.termToMonths(state.term, state.termUnit);
    var r = Engine.flatLoan(state.amount, state.rate, months);

    $("res-reducing").textContent = r.reducingRate.toFixed(2) + "%";
    $("res-payment").textContent = money(r.emi, 2);
    $("res-interest").textContent = money(r.totalInterest, 0);
    $("res-total").textContent = money(r.totalPayment, 0);
    $("res-summary").textContent =
      "A flat rate of " + Number(state.rate.toFixed(2)) + "% over " + formatLength(months) +
      " is the same as about " + r.reducingRate.toFixed(2) + "% per year on a reducing balance.";
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