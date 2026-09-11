import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const site = "https://gaspardnz.style";
const forbidden = ["gaspardnz.ipcjagency.com", "ipcjagency.com", "gaspardnz-style.fr"];
const seoRoutes = [
  "/a-propos",
  "/services",
  "/styliste-mariage-homme-paris",
  "/conseil-image-homme-paris",
  "/lookbook",
  "/contact",
  "/galerie",
  "/videos",
  "/partenaires",
  "/style-du-mois",
  "/actualites",
];

const files = [
  "index.html",
  "public/robots.txt",
  "public/sitemap.xml",
  "robots.txt",
  "sitemap.xml",
  "src/App.jsx",
  "src/constants.js",
  "vercel.json",
  "scripts/generate-static-seo-routes.mjs",
];

for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const value of forbidden) {
    assert.equal(content.includes(value), false, `${file} still contains ${value}`);
  }
}

const index = readFileSync("index.html", "utf8");
assert.match(index, /<link rel="canonical" href="https:\/\/gaspardnz\.style\/" \/>/);
assert.match(index, /GaspardNZ \| Styliste Homme, Mariage & Événements à Paris/);
assert.match(index, /<h1[^>]*>Styliste homme à Paris pour mariages, galas et événements<\/h1>/);
assert.match(index, /href="\/styliste-mariage-homme-paris"/);
assert.match(index, /href="\/services"/);
assert.match(index, /application\/ld\+json/);
assert.match(index, /"url": "https:\/\/gaspardnz\.style"/);
assert.match(index, /<link rel="icon"[^>]+\/icon-192\.png/);
assert.equal(index.includes("Gaspard NZ —"), false, "SEO head should not use em dash text");

const robots = readFileSync("public/robots.txt", "utf8");
assert.match(robots, /User-agent: \*/);
assert.match(robots, /Allow: \//);
assert.match(robots, /Sitemap: https:\/\/gaspardnz\.style\/sitemap\.xml/);

const sitemap = readFileSync("public/sitemap.xml", "utf8");
["/", ...seoRoutes].forEach((path) => {
  const url = `${site}${path === "/" ? "/" : path}`;
  assert.equal(sitemap.includes(`<loc>${url}</loc>`), true, `sitemap missing ${url}`);
});

const rootSitemap = readFileSync("sitemap.xml", "utf8");
assert.equal(rootSitemap, sitemap, "root and public sitemaps must stay aligned");

const generator = readFileSync("scripts/generate-static-seo-routes.mjs", "utf8");
const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
for (const route of seoRoutes) {
  assert.equal(generator.includes(`"${route}"`), true, `static SEO generator missing ${route}`);
  const rewrite = (vercel.rewrites || []).find((entry) => entry.source === route);
  assert.ok(rewrite, `Vercel rewrite missing ${route}`);
  assert.equal(rewrite.destination, `${route}/index.html`, `${route} must serve its generated route-specific HTML, not the root index.html`);
}

const adminRewrite = (vercel.rewrites || []).find((entry) => entry.source === "/admin(.*)");
assert.equal(adminRewrite?.destination, "/index.html", "admin SPA fallback must remain on root index.html");
const adminHeaders = (vercel.headers || []).find((entry) => entry.source === "/admin(.*)")?.headers || [];
assert.equal(adminHeaders.some((header) => header.key === "X-Robots-Tag" && /noindex/.test(header.value)), true, "admin routes must be noindex");
assert.equal(vercel.trailingSlash, false, "canonical SEO routes must not fork into trailing-slash duplicates");

["public/favicon.ico", "public/icon.png", "public/icon-192.png", "public/icon-512.png", "public/apple-touch-icon.png"].forEach((file) => {
  assert.equal(existsSync(file), true, `${file} is missing`);
});

console.log("SEO validation passed");
