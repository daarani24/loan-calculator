const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
const base = robots.match(/Sitemap:\s*(\S+)/)[1].replace(/sitemap\.xml$/, "");

const DONE = ["index.html", "emi-calculator/index.html", "flat-to-reducing-rate-converter/index.html"];

function urlFor(file) { return base + file.replace(/index\.html$/, ""); }

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

DONE.forEach(function (file) {
  const html = fs.readFileSync(path.join(root, file), "utf8");

  const canon = html.match(/<link rel="canonical" href="[^"]+">/g) || [];
  assert.strictEqual(canon.length, 1, file + ": needs exactly one canonical tag");
  assert.strictEqual(canon[0].match(/href="([^"]+)"/)[1], urlFor(file), file + ": canonical must be " + urlFor(file));

  const d = html.match(/<meta name="description" content="([^"]+)">/);
  assert.ok(d && d[1].length >= 70 && d[1].length <= 160, file + ": description should be 70 to 160 characters");

  const blocks = html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || [];
  assert.strictEqual(blocks.length, 1, file + ": needs exactly one JSON-LD block");
  const data = JSON.parse(blocks[0].replace(/<\/?script[^>]*>/g, ""));
  assert.strictEqual(data["@type"], "FAQPage", file + ": JSON-LD must be a FAQPage");
  assert.ok(data.mainEntity.length >= 3, file + ": needs at least 3 FAQ items");

  const text = visibleText(html);
  data.mainEntity.forEach(function (q) {
    assert.ok(text.includes(q.name), file + ": question not visible on page: " + q.name);
    assert.ok(text.includes(q.acceptedAnswer.text), file + ": answer not visible on page for: " + q.name);
  });
  const h3count = (html.match(/<h3>/g) || []).length;
  assert.strictEqual(h3count, data.mainEntity.length, file + ": number of h3 questions must match the schema");

  const words = text.split(" ").length;
  assert.ok(words >= 400, file + ": only " + words + " words, aim for 400+");
});

console.log("All page SEO tests passed (" + DONE.length + " page" + (DONE.length === 1 ? "" : "s") + ")");