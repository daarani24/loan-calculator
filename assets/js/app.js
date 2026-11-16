(function () {
  "use strict";

  var Engine = window.LoanEngine;
  var Settings = window.LoanSettings;
  var Cur = window.LoanCurrency;

  var root = document.querySelector("[data-loan-type]");
  if (!root) return;

  var typeKey = root.getAttribute("data-loan-type");
  var typeInfo = Settings.LOAN_TYPES[typeKey];
  var currency = Cur.getCurrency(typeInfo.defaultCurrency);
  var lastResult = null;
  var state = { amount: 0, rate: 0, term: 0, termUnit: "years", extra: 0 };

  function $(id) { return document.getElementById(id); }

  var FIELDS = ["amount", "rate", "term", "extra"];
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
      return { min: 0, max: cfg.amount.max * 0.05, step: cfg.amount.step / 2 };
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
    displays.extra.textContent = money(state.extra, 0);

    var r = Engine.calculateLoan({
      amount: state.amount,
      rate: state.rate,
      term: state.term,
      termUnit: state.termUnit,
      extra: state.extra
    });

    $("res-payment").textContent = money(r.emi, 2);
    $("res-interest").textContent = money(r.totalInterest, 0);
    $("res-total").textContent = money(r.totalPayment, 0);
    $("res-length").textContent = formatLength(r.months);

    var saving = $("res-saving");
    if (r.monthsSaved > 0 && state.extra > 0) {
      saving.textContent = "Your extra payment clears the loan " + formatLength(r.monthsSaved) +
        " sooner and saves about " + money(r.interestSaved, 0) + " in interest.";
      saving.hidden = false;
    } else {
      saving.hidden = true;
    }
    lastResult = r;
    renderDonut(r);
    renderSchedule(r);
  }

  function renderDonut(r) {
    var p = r.totalPayment > 0 ? Math.min(100, (state.amount / r.totalPayment) * 100) : 100;
    var i = Math.max(0, 100 - p);
    $("donut-principal").setAttribute("stroke-dasharray", p + " " + (100 - p));
    var ic = $("donut-interest");
    ic.setAttribute("stroke-dasharray", i + " " + (100 - i));
    ic.setAttribute("stroke-dashoffset", -p);
    $("leg-principal").textContent = money(state.amount, 0) + " (" + p.toFixed(1) + "%)";
    $("leg-interest").textContent = money(r.totalInterest, 0) + " (" + i.toFixed(1) + "%)";
    $("donut").setAttribute("aria-label",
      "Principal versus interest: principal " + p.toFixed(1) + " percent, interest " + i.toFixed(1) + " percent");
  }

  function tableRow(cells) {
    return "<tr><td>" + cells.join("</td><td>") + "</td></tr>";
  }

  function renderMonthly(r) {
    $("month-rows").innerHTML = r.rows.map(function (m) {
      return tableRow([m.month, money(m.payment, 2), money(m.principal, 2), money(m.interest, 2), money(m.balance, 2)]);
    }).join("");
  }

  function renderSchedule(r) {
    var years = Engine.summarizeByYear(r.rows);
    $("year-rows").innerHTML = years.map(function (y) {
      return tableRow([y.year, money(y.principal, 0), money(y.interest, 0), money(y.balance, 0)]);
    }).join("");

    if ($("monthly-details").open) renderMonthly(r);
  }

  function downloadCsv() {
    if (!lastResult) return;
    var lines = ["Month,Payment,Principal,Interest,Balance"];
    lastResult.rows.forEach(function (m) {
      lines.push([m.month, m.payment.toFixed(2), m.principal.toFixed(2), m.interest.toFixed(2), m.balance.toFixed(2)].join(","));
    });
    var blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "loan-schedule-" + currency + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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