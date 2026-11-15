(function (root) {
  "use strict";

  var Settings = (typeof module !== "undefined" && module.exports)
    ? require("./settings.js")
    : root.LoanSettings;

  var STORAGE_KEY = "loanCurrency";
  var formatters = {};

  function getFormatter(locale, options) {
    var key = locale + JSON.stringify(options);
    if (!formatters[key]) formatters[key] = new Intl.NumberFormat(locale, options);
    return formatters[key];
  }

  function formatMoney(value, code, decimals) {
    var cur = Settings.CURRENCIES[code];
    var d = decimals === undefined ? 2 : decimals;
    return getFormatter(cur.locale, {
      style: "currency",
      currency: cur.code,
      minimumFractionDigits: d,
      maximumFractionDigits: d
    }).format(value);
  }

  function formatNumber(value, code, decimals) {
    var cur = Settings.CURRENCIES[code];
    var d = decimals === undefined ? 0 : decimals;
    return getFormatter(cur.locale, {
      minimumFractionDigits: d,
      maximumFractionDigits: d
    }).format(value);
  }

  function getCurrency(fallback) {
    if (typeof window === "undefined") return fallback;
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && Settings.CURRENCIES[saved]) return saved;
    } catch (e) { /* storage blocked or not available */ }
    return fallback;
  }

  function setCurrency(code) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* ignore */ }
  }

  var api = {
    formatMoney: formatMoney,
    formatNumber: formatNumber,
    getCurrency: getCurrency,
    setCurrency: setCurrency
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LoanCurrency = api;
})(typeof window !== "undefined" ? window : this);