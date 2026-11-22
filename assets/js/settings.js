(function (root) {
  "use strict";

  var CURRENCIES = {
    INR: { code: "INR", symbol: "₹", locale: "en-IN", name: "Indian Rupee" },
    GBP: { code: "GBP", symbol: "£", locale: "en-GB", name: "British Pound" },
    USD: { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" }
  };

  var DEFAULT_CURRENCY = "USD";

  var LOAN_TYPES = {

    "loan-comparison": {
      title: "Loan Comparison Calculator",
      defaultCurrency: "INR",
      byCurrency: {
        INR: {
          amount: { start: 2500000, min: 10000, max: 100000000, step: 10000 },
          rate: { start: 9, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 20, min: 1, max: 30, step: 1 },
          startB: { amount: 2500000, rate: 8.5, term: 20 }
        },
        GBP: {
          amount: { start: 200000, min: 500, max: 2000000, step: 500 },
          rate: { start: 5, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 25, min: 1, max: 35, step: 1 },
          startB: { amount: 200000, rate: 4.5, term: 25 }
        },
        USD: {
          amount: { start: 300000, min: 1000, max: 3000000, step: 1000 },
          rate: { start: 6.5, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 25, min: 1, max: 35, step: 1 },
          startB: { amount: 300000, rate: 6, term: 25 }
        }
      }
    },

    "car-loan": {
      title: "Car Loan Calculator",
      defaultCurrency: "USD",
      byCurrency: {
        INR: {
          amount: { start: 800000, min: 50000, max: 5000000, step: 25000 },
          rate: { start: 9, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 5, min: 1, max: 7, step: 1 }
        },
        GBP: {
          amount: { start: 15000, min: 1000, max: 100000, step: 500 },
          rate: { start: 7, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 4, min: 1, max: 7, step: 1 }
        },
        USD: {
          amount: { start: 25000, min: 1000, max: 150000, step: 500 },
          rate: { start: 7, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 5, min: 1, max: 7, step: 1 }
        }
      }
    },

    "personal-loan": {
      title: "Personal Loan Calculator",
      defaultCurrency: "INR",
      byCurrency: {
        INR: {
          amount: { start: 300000, min: 10000, max: 5000000, step: 10000 },
          rate: { start: 12, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 3, min: 1, max: 10, step: 1 }
        },
        GBP: {
          amount: { start: 8000, min: 500, max: 50000, step: 500 },
          rate: { start: 9, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 3, min: 1, max: 10, step: 1 }
        },
        USD: {
          amount: { start: 10000, min: 500, max: 100000, step: 500 },
          rate: { start: 11, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 3, min: 1, max: 10, step: 1 }
        }
      }
    },

    "education-loan": {
      title: "Education Loan Calculator",
      defaultCurrency: "INR",
      byCurrency: {
        INR: {
          amount: { start: 1000000, min: 50000, max: 10000000, step: 50000 },
          rate: { start: 9.5, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 7, min: 1, max: 15, step: 1 }
        },
        GBP: {
          amount: { start: 20000, min: 1000, max: 200000, step: 1000 },
          rate: { start: 6, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 10, min: 1, max: 25, step: 1 }
        },
        USD: {
          amount: { start: 30000, min: 1000, max: 300000, step: 1000 },
          rate: { start: 6.5, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 10, min: 1, max: 25, step: 1 }
        }
      }
    },

    "home-loan": {
      title: "Home Loan / Mortgage Calculator",
      defaultCurrency: "INR",
      byCurrency: {
        INR: {
          amount: { start: 5000000, min: 500000, max: 100000000, step: 100000 },
          rate: { start: 8.5, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 20, min: 1, max: 30, step: 1 }
        },
        GBP: {
          amount: { start: 250000, min: 20000, max: 2000000, step: 5000 },
          rate: { start: 5, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 25, min: 1, max: 35, step: 1 }
        },
        USD: {
          amount: { start: 400000, min: 20000, max: 3000000, step: 5000 },
          rate: { start: 6.5, min: 0, max: 30, step: 0.1 },
          term: { unit: "years", start: 30, min: 1, max: 35, step: 1 }
        }
      }
    },

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