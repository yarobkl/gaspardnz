import { supabase } from "./supabaseClient.js";

// Détail des formules (menus + articles), partagé entre l'admin
// (AdminFormulesPricing) et le site public (FormulesSection) : les deux
// affichent les mêmes données, la seule différence est ce que RLS laisse
// passer selon qui appelle (anon ne voit que published/non supprimé).
//
// Le sous-total et le total ne sont JAMAIS stockés : ils se calculent
// toujours en sommant les articles (sumGroupItems/sumPackageTotal), donc le
// résumé et le détail ne peuvent plus jamais se contredire — contrairement à
// l'ancien champ "Prix" saisi à la main à côté d'un total codé en dur.
const PRICING_SELECT = "*, package_groups(*, package_items(*))";

// Le tri imbriqué n'est pas garanti par PostgREST : on trie nous-mêmes après
// réception, plutôt que de complexifier la requête.
function sortPackageBreakdown(rows) {
  return (rows || []).map((pkg) => ({
    ...pkg,
    package_groups: [...(pkg.package_groups || [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((group) => ({
        ...group,
        package_items: [...(group.package_items || [])].sort((a, b) => a.sort_order - b.sort_order),
      })),
  }));
}

export function sumGroupItems(group) {
  return (group?.package_items || []).reduce((total, item) => (item.price_is_from ? total : total + Number(item.price || 0)), 0);
}

export function sumPackageTotal(pkg) {
  return (pkg?.package_groups || []).reduce((total, group) => total + sumGroupItems(group), 0);
}

// La visibilité réelle (toutes les formules pour le personnel, seulement
// publiées et non supprimées pour un visiteur) est décidée par RLS, pas ici.
export async function listPackagesWithBreakdown() {
  const { data, error } = await supabase.from("packages").select(PRICING_SELECT).order("sort_order");
  if (error) throw error;
  return sortPackageBreakdown(data);
}

export async function softDeletePackage(id) {
  const { error } = await supabase.from("packages").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function restorePackage(id) {
  const { error } = await supabase.from("packages").update({ deleted_at: null }).eq("id", id);
  if (error) throw error;
}

export async function createPackageGroup(packageId, { label, tag = null, sortOrder = 0 }) {
  const { data, error } = await supabase.from("package_groups")
    .insert({ package_id: packageId, label, tag, sort_order: sortOrder }).select().single();
  if (error) throw error;
  return data;
}

export async function updatePackageGroup(id, patch) {
  const { error } = await supabase.from("package_groups").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deletePackageGroup(id) {
  const { error } = await supabase.from("package_groups").delete().eq("id", id);
  if (error) throw error;
}

export async function createPackageItem(groupId, { label, price = null, priceIsFrom = false, sortOrder = 0 }) {
  const { data, error } = await supabase.from("package_items")
    .insert({ group_id: groupId, label, price, price_is_from: priceIsFrom, sort_order: sortOrder }).select().single();
  if (error) throw error;
  return data;
}

export async function updatePackageItem(id, patch) {
  const { error } = await supabase.from("package_items").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deletePackageItem(id) {
  const { error } = await supabase.from("package_items").delete().eq("id", id);
  if (error) throw error;
}

// Noms d'articles déjà utilisés ailleurs, pour le menu déroulant de
// l'éditeur — évite de retaper "Chemise" à chaque nouvelle formule tout en
// laissant la possibilité d'en taper un nouveau.
export async function listArticleLabels() {
  const { data, error } = await supabase.from("package_items").select("label");
  if (error) throw error;
  return Array.from(new Set((data || []).map((row) => row.label).filter(Boolean))).sort((a, b) => a.localeCompare(b, "fr"));
}

export function subscribePackagePricing(onChange) {
  const channel = supabase
    .channel(`gnz-package-pricing-${Math.random().toString(36).slice(2)}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "packages" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "package_groups" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "package_items" }, onChange)
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
