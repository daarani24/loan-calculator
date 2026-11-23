const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const template = fs.readFileSync(path.join(root, "index.html"), "utf8");

const FROM = {
  title: "<title>Loan Repayment Calculator</title>",
  description: '<meta name="description" content="Work out your monthly loan payment, total interest and total cost.">',
  h1: "<h1>Loan Repayment Calculator</h1>",
  intro: '<p class="intro">Enter your loan details to see your monthly payment, total interest and total cost.</p>',
  type: 'data-loan-type="loan-repayment"'
};

Object.keys(FROM).forEach(function (k) {
  if (!template.includes(FROM[k])) {
    throw new Error("index.html does not contain the expected " + k + " text: " + FROM[k]);
  }
});

const PAGES = [
  {
    folder: "emi-calculator",
    type: "emi",
    title: "EMI Calculator",
    description: "Calculate your monthly EMI, total interest and total payment for any loan.",
    intro: "Enter the loan amount, interest rate and term to see your EMI (equated monthly instalment) and the full repayment schedule."
  },
  {
    folder: "car-loan-calculator",
    type: "car-loan",
    title: "Car Loan Calculator",
    description: "Estimate your monthly car loan payment, total interest and total cost.",
    intro: "Enter the car loan amount, interest rate and term to see your monthly payment and total cost."
  },
  {
    folder: "personal-loan-calculator",
    type: "personal-loan",
    title: "Personal Loan Calculator",
    description: "Estimate your monthly personal loan payment, total interest and total cost.",
    intro: "Enter the personal loan amount, interest rate and term to see your monthly payment and total cost."
  },
  {
    folder: "education-loan-calculator",
    type: "education-loan",
    title: "Education Loan Calculator",
    description: "Estimate your monthly student loan payment, total interest and total cost.",
    intro: "Enter the education loan amount, interest rate and repayment term to see your monthly payment and total cost."
  },
  {
    folder: "home-loan-calculator",
    type: "home-loan",
    title: "Home Loan / Mortgage Calculator",
    description: "Estimate your monthly home loan or mortgage payment, total interest and total cost.",
    intro: "Enter the home loan amount, interest rate and term to see your monthly payment and total cost."
  }
];

PAGES.forEach(function (p) {
  const html = template
    .replace(FROM.title, function () { return "<title>" + p.title + "</title>"; })
    .replace(FROM.description, function () { return '<meta name="description" content="' + p.description + '">'; })
    .replace(FROM.h1, function () { return "<h1>" + p.title + "</h1>"; })
    .replace(FROM.intro, function () { return '<p class="intro">' + p.intro + "</p>"; })
    .replace(FROM.type, function () { return 'data-loan-type="' + p.type + '"'; });

  fs.mkdirSync(path.join(root, p.folder), { recursive: true });
  fs.writeFileSync(path.join(root, p.folder, "index.html"), html);
  console.log("Wrote " + p.folder + "/index.html");
});