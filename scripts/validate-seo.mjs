import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const site = "https://gaspardnz.style";
const forbidden = ["gaspardnz.ipcjagency.com", "ipcjagency.com", "gaspardnz-style.fr"];

const files = [
  "index.html",
  "public/robots.txt",
  "public/sitemap.xml",
  "robots.txt",
  "sitemap.xml",
  "src/App.jsx",
  "src/constants.js",
  "vercel.json",
];

for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const value of forbidden) {
    assert.equal(content.includes(value), false, `${file} still contains ${value}`);
  }
}

const index = readFileSync("index.html", "utf8");
assert.match(index, /<link rel="canonical" href="https:\/\/gaspardnz\.style\/" \/>/);
assert.match(index, /GaspardNZ \| Styliste Parisien/);
assert.match(index, /application\/ld\+json/);
assert.match(index, /"url": "https:\/\/gaspardnz\.style"/);
assert.match(index, /<link rel="icon"[^>]+\/icon-192\.png/);
assert.equal(index.includes("Gaspard NZ —"), false, "SEO head should not use em dash text");

const robots = readFileSync("public/robots.txt", "utf8");
assert.match(robots, /User-agent: \*/);
assert.match(robots, /Allow: \//);
assert.match(robots, /Sitemap: https:\/\/gaspardnz\.style\/sitemap\.xml/);

const sitemap = readFileSync("public/sitemap.xml", "utf8");
[
  "/",
  "/a-propos",
  "/services",
  "/lookbook",
  "/contact",
  "/galerie",
  "/videos",
  "/partenaires",
  "/style-du-mois",
  "/actualites",
].forEach((path) => {
  const url = `${site}${path === "/" ? "/" : path}`;
  assert.equal(sitemap.includes(`<loc>${url}</loc>`), true, `sitemap missing ${url}`);
});

["public/favicon.ico", "public/icon.png", "public/icon-192.png", "public/icon-512.png", "public/apple-touch-icon.png"].forEach((file) => {
  assert.equal(existsSync(file), true, `${file} is missing`);
});

console.log("SEO validation passed");
