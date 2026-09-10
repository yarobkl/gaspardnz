import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

const index = read("index.html");
assert.equal(
  index.includes("::-webkit-media-controls"),
  false,
  "index.html must not hide native video controls",
);

const publicVideoFiles = [
  "src/components/sections/ActualitesSection.jsx",
  "src/components/sections/VideoSection.jsx",
];

for (const file of publicVideoFiles) {
  const source = read(file);
  assert.match(source, /<video[\s\S]*?\bcontrols\b[\s\S]*?>/, `${file} must expose native controls`);
  assert.match(source, /<video[\s\S]*?\bplaysInline\b[\s\S]*?>/, `${file} must support inline mobile playback`);
  assert.match(source, /<video[\s\S]*?aria-label=/, `${file} must label the video player`);
  assert.match(source, /<track[^>]+kind="captions"[^>]+default/, `${file} must provide default captions`);
}

const hero = read("src/components/HeroMobile.jsx");
assert.match(hero, /<video[^>]+aria-hidden="true"[^>]+tabIndex=\{-1\}/, "decorative hero video must stay outside the accessibility tree and tab order");

const adminMedia = read("src/components/Admin/AdminMedia.jsx");
assert.match(adminMedia, /<video[^>]+controls[^>]+playsInline[^>]+aria-label=/, "admin video previews must be operable");

for (const caption of [
  "public/captions/gaspardnz-video-fr.vtt",
  "public/captions/jt-sape-fr.vtt",
  "public/captions/hero-fr.vtt",
]) {
  assert.equal(existsSync(caption), true, `${caption} is missing`);
  const content = read(caption);
  assert.match(content, /^WEBVTT/m, `${caption} must be WebVTT`);
  assert.match(content, /\d{2}:\d{2}\.\d{3}\s+-->\s+\d{2}:\d{2}\.\d{3}/, `${caption} must contain a cue`);
}

console.log("Video accessibility validation passed");
