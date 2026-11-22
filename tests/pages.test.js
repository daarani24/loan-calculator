const assert = require("assert");
const fs = require("fs");
const path = require("path");
const S = require("../assets/js/settings.js");

const root = path.join(__dirname, "..");
const pages = {
  "index.html": "loan-repayment",
  "emi-calculator/index.html": "emi",
  "car-loan-calculator/index.html": "car-loan",
  "personal-loan-calculator/index.html": "personal-loan",
  "education-loan-calculator/index.html": "education-loan",
  "home-loan-calculator/index.html": "home-loan"
};

const titles = [];
Object.keys(pages).forEach(function (file) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  assert.ok(S.LOAN_TYPES[pages[file]], file + ": no settings block for " + pages[file]);
  assert.ok(html.includes('data-loan-type="' + pages[file] + '"'), file + ": wrong data-loan-type");
  assert.strictEqual((html.match(/<h1>/g) || []).length, 1, file + ": needs exactly one h1");
  const t = html.match(/<title>([^<]+)<\/title>/);
  assert.ok(t, file + ": missing title");
  titles.push(t[1]);
  assert.ok(/<meta name="description" content="[^"]+">/.test(html), file + ": missing description");
});
assert.strictEqual(new Set(titles).size, titles.length, "page titles must be unique");

console.log("All page tests passed");