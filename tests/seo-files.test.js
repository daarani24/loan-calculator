const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

const line = robots.match(/Sitemap:\s*(\S+)/);
assert.ok(line, "robots.txt needs a Sitemap line");
assert.ok(line[1].endsWith("/sitemap.xml"), "Sitemap line must end with /sitemap.xml");
const base = line[1].replace(/sitemap\.xml$/, "");
assert.ok(/^https:\/\//.test(base), "Base address must start with https://");
assert.ok(!base.includes("example.com"), "Replace the placeholder address");
assert.ok(/Allow:\s*\//.test(robots), "robots.txt should allow crawling");

const locs = (sitemap.match(/<loc>[^<]+<\/loc>/g) || []).map(function (x) {
  return x.replace(/<\/?loc>/g, "");
});
assert.ok(locs.length > 0, "sitemap has no addresses");
locs.forEach(function (u) {
  assert.ok(u.startsWith(base), u + ": wrong base address");
  assert.ok(u.endsWith("/"), u + ": should end with /");
});
assert.strictEqual(new Set(locs).size, locs.length, "duplicate addresses in sitemap");

const expected = [base];
fs.readdirSync(root, { withFileTypes: true }).forEach(function (d) {
  if (d.isDirectory() && fs.existsSync(path.join(root, d.name, "index.html"))) {
    expected.push(base + d.name + "/");
  }
});
expected.forEach(function (u) {
  assert.ok(locs.includes(u), "Missing from sitemap: " + u);
});
locs.forEach(function (u) {
  assert.ok(expected.includes(u), "In sitemap but no page: " + u);
});

console.log("All SEO file tests passed (" + locs.length + " pages)");