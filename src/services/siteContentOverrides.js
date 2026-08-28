import { supabase } from "./supabaseClient.js";

let snapshot = {};
let started = false;
let channel = null;
const listeners = new Set();
const SERVER_SNAPSHOT = {};

const normalizeValue = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof value.text === "string") return value.text;
  return null;
};

async function load() {
  const { data, error } = await supabase
    .from("site_content")
    .select("content_key,locale,value")
    .eq("section_key", "translations")
    .eq("published", true);
  if (error) return;
  const next = {};
  for (const row of data || []) {
    const text = normalizeValue(row.value);
    if (text === null) continue;
    const locale = row.locale || "FR";
    if (!next[locale]) next[locale] = {};
    next[locale][row.content_key] = text;
  }
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  load();
  channel = supabase
    .channel("gnz-public-text-overrides")
    .on("postgres_changes", { event:"*", schema:"public", table:"site_content", filter:"section_key=eq.translations" }, load)
    .subscribe();
}

export function subscribeSiteContent(listener) {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
    if (!listeners.size && channel) {
      supabase.removeChannel(channel);
      channel = null;
      started = false;
    }
  };
}

export const getSiteContentSnapshot = () => snapshot;
export const getSiteContentServerSnapshot = () => SERVER_SNAPSHOT;
