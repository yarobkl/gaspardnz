/**
 * Vercel Function: création / réinitialisation d'un compte admin AVEC mot de
 * passe généré côté serveur.
 *
 * Pourquoi une fonction serveur et pas un appel direct depuis l'admin :
 * créer un compte Supabase Auth déjà actif, avec un mot de passe choisi
 * plutôt qu'auto-inscrit, exige l'API d'administration Supabase — qui exige
 * elle-même la clé service_role. Cette clé ne doit JAMAIS atteindre le
 * navigateur (règle de ce projet depuis le début du durcissement) : elle ne
 * vit donc que côté serveur, ici.
 *
 * Réservé au propriétaire (owner) : c'est déjà la seule personne à voir
 * l'écran « Utilisateurs » côté interface (AdminLayout, min:"owner") — cette
 * fonction fait respecter la même règle côté serveur, où c'est la seule
 * chose qui compte réellement.
 */
import { randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://imvjudhhtcdmtyhfhksm.supabase.co";
// Rôles attribuables depuis ce formulaire : jamais "owner" — un propriétaire
// supplémentaire ne se crée pas en un clic depuis Utilisateurs, ici comme
// dans le menu déroulant existant (src/components/Admin/AdminUsers.jsx).
const ASSIGNABLE_ROLES = new Set(["admin", "editor", "viewer", "couturier"]);
// Sans caractères ambigus à l'oral ou à l'écrit (0/O, 1/l/I) : ce mot de
// passe est fait pour être recopié à la main par quelqu'un qui n'est pas du
// métier, pas seulement collé depuis un gestionnaire de mots de passe.
const PASSWORD_CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));

function generatePassword(length = 14) {
  let out = "";
  for (let i = 0; i < length; i += 1) out += PASSWORD_CHARSET[randomInt(PASSWORD_CHARSET.length)];
  return out;
}

function adminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    const error = new Error("SUPABASE_SERVICE_ROLE_KEY manquant");
    error.code = "CONFIG_MISSING";
    throw error;
  }
  return createClient(SUPABASE_URL, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function requireOwner(req, supabase) {
  const header = String(req.headers.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return { ok: false, status: 401, error: "Session administrateur requise" };

  const { data: userResult, error: authError } = await supabase.auth.getUser(token);
  const caller = userResult?.user;
  if (authError || !caller?.email) return { ok: false, status: 401, error: "Session invalide" };

  const { data: access, error: accessError } = await supabase
    .from("admin_access").select("role,active").eq("email", caller.email.toLowerCase()).maybeSingle();
  if (accessError || !access?.active || access.role !== "owner") {
    return { ok: false, status: 403, error: "Réservé au propriétaire du compte" };
  }
  return { ok: true, caller };
}

// L'API d'administration Supabase n'a pas de "getUserByEmail" direct : on
// parcourt la liste (comptes admin peu nombreux, une seule page suffit très
// largement) et on compare l'email nous-mêmes.
async function findAuthUserByEmail(supabase, email) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  return (data?.users || []).find((u) => u.email?.toLowerCase() === email) || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let supabase;
  try { supabase = adminClient(); }
  catch { return res.status(503).json({ error: "Service non configuré" }); }

  const auth = await requireOwner(req, supabase);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const email = String(req.body?.email || "").trim().toLowerCase();
  const displayName = String(req.body?.displayName || "").trim();
  const role = String(req.body?.role || "").trim().toLowerCase();

  if (!isValidEmail(email)) return res.status(400).json({ error: "Adresse email invalide" });
  if (!ASSIGNABLE_ROLES.has(role)) return res.status(400).json({ error: "Rôle invalide" });

  const password = generatePassword();

  try {
    const existing = await findAuthUserByEmail(supabase, email);
    let created;

    if (existing) {
      // Compte déjà existant (auto-inscrit avant, ou mot de passe oublié) :
      // on ne le recrée pas, on lui attribue simplement un nouveau mot de
      // passe généré.
      const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, { password });
      if (updateError) throw updateError;
      created = false;
    } else {
      const { error: createError } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true,
      });
      if (createError) throw createError;
      created = true;
    }

    // admin_access est la source d'autorité pour le rôle (voir
    // private.current_admin_role()) : upsert plutôt qu'insert, pour couvrir
    // le cas d'une adresse déjà autorisée mais dont on régénère l'accès.
    const { error: upsertError } = await supabase.from("admin_access").upsert({
      email, role, display_name: displayName || null, active: true,
    }, { onConflict: "email" });
    if (upsertError) throw upsertError;

    return res.status(200).json({ success: true, created, password });
  } catch (error) {
    console.error("admin-create-user error", error?.message || error);
    return res.status(500).json({ error: "Impossible de générer le compte. Réessayez." });
  }
}
