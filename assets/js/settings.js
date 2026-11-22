(function (root) {
  "use strict";

  var CURRENCIES = {
    INR: { code: "INR", symbol: "₹", locale: "en-IN", name: "Indian Rupee" },
    GBP: { code: "GBP", symbol: "£", locale: "en-GB", name: "British Pound" },
    USD: { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" }
  };

  var DEFAULT_CURRENCY = "USD";

  var LOAN_TYPES = {

    "prepayment": {
      title: "Loan Prepayment Calculator",
      defaultCurrency: "INR",
      byCurrency: {
        INR: {
          amount: { start: 2500000, min: 100000, max: 50000000, step: 100000 },
          rate: { start: 9, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 20, min: 1, max: 30, step: 1 }
        },
        GBP: {
          amount: { start: 200000, min: 5000, max: 2000000, step: 5000 },
          rate: { start: 5, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 25, min: 1, max: 30, step: 1 }
        },
        USD: {
          amount: { start: 300000, min: 10000, max: 2000000, step: 5000 },
          rate: { start: 6.5, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 25, min: 1, max: 30, step: 1 }
        }
      }
    },

    "flat-to-reducing": {
      title: "Flat Rate to Reducing Rate Converter",
      defaultCurrency: "INR",
      byCurrency: {
        INR: {
          amount: { start: 500000, min: 10000, max: 10000000, step: 10000 },
          rate: { start: 8, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 5, min: 1, max: 30, step: 1 }
        },
        GBP: {
          amount: { start: 10000, min: 500, max: 500000, step: 500 },
          rate: { start: 8, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 5, min: 1, max: 30, step: 1 }
        },
        USD: {
          amount: { start: 20000, min: 1000, max: 1000000, step: 1000 },
          rate: { start: 8, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 5, min: 1, max: 30, step: 1 }
        }
      }
    },

    "loan-repayment": {
      title: "Loan Repayment Calculator",
      defaultCurrency: "USD",
      byCurrency: {
        INR: {
          amount: { start: 500000, min: 10000, max: 10000000, step: 10000 },
          rate: { start: 10, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 5, min: 1, max: 30, step: 1 }
        },
        GBP: {
          amount: { start: 10000, min: 500, max: 500000, step: 500 },
          rate: { start: 7, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 5, min: 1, max: 30, step: 1 }
        },
        USD: {
          amount: { start: 20000, min: 1000, max: 1000000, step: 1000 },
          rate: { start: 8, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 5, min: 1, max: 30, step: 1 }
        }
      }
    },

    "emi": {
      title: "EMI Calculator",
      defaultCurrency: "INR",
      byCurrency: {
        INR: {
          amount: { start: 500000, min: 10000, max: 10000000, step: 10000 },
          rate: { start: 10, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 5, min: 1, max: 30, step: 1 }
        },
        GBP: {
          amount: { start: 10000, min: 500, max: 500000, step: 500 },
          rate: { start: 7, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 5, min: 1, max: 30, step: 1 }
        },
        USD: {
          amount: { start: 20000, min: 1000, max: 1000000, step: 1000 },
          rate: { start: 8, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 5, min: 1, max: 30, step: 1 }
        }
      }
    }

  };

  function getConfig(typeKey, currencyCode) {
    var type = LOAN_TYPES[typeKey];
    if (!type) throw new Error("Unknown loan type: " + typeKey);
    var cfg = type.byCurrency[currencyCode];
    if (!cfg) throw new Error("No settings for " + typeKey + " in " + currencyCode);
    return cfg;
  }

  var api = {
    CURRENCIES: CURRENCIES,
    DEFAULT_CURRENCY: DEFAULT_CURRENCY,
    LOAN_TYPES: LOAN_TYPES,
    getConfig: getConfig
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LoanSettings = api;
})(typeof window !== "undefined" ? window : this);