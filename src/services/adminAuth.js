import { supabase } from "./supabaseClient.js";

const LEGACY_PROFILE_KEY = "gnz-admin-profile";
const ADMIN_URL = "https://gaspardnz.style/admin";
export const PERMISSIONS = { OWNER: "owner", ADMIN_FULL: "admin", EDITOR: "editor", ADMIN_READ: "viewer" };

/**
 * Le profil admin n'est JAMAIS persisté : un profil stocké côté navigateur est
 * modifiable par l'utilisateur et ne prouve donc rien. L'unique autorité est
 * `refreshSession()` (session Supabase vérifiée + `admin_access.active`).
 * On purge ici l'ancien cache laissé par les versions précédentes.
 */
export const initAdminUsers = () => {
  try { localStorage.removeItem(LEGACY_PROFILE_KEY); } catch {}
};

async function getAccessProfile(user) {
  if (!user?.email) return null;
  const { data, error } = await supabase.from("admin_access").select("id,email,role,display_name,active").eq("email", user.email.toLowerCase()).eq("active", true).maybeSingle();
  if (error || !data) return null;
  return { id: data.id, userId: user.id, email: data.email, permission: data.role, role: data.role, displayName: data.display_name || data.email };
}

export async function login(email, password) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized || !password) return { success: false, error: "Email et mot de passe requis" };
  const { data, error } = await supabase.auth.signInWithPassword({ email: normalized, password });
  if (error || !data?.user) return { success: false, error: "Email ou mot de passe incorrect" };
  const profile = await getAccessProfile(data.user);
  if (!profile) { await supabase.auth.signOut(); return { success: false, error: "Ce compte n'est pas autorisé à accéder à l'administration." }; }
  return { success: true, user: profile };
}

export async function registerAdmin(email, password) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized || !password || password.length < 10) return { success: false, error: "Utilisez un mot de passe d'au moins 10 caractères." };
  const { data, error } = await supabase.auth.signUp({ email: normalized, password, options: { emailRedirectTo: ADMIN_URL } });
  if (error) return { success: false, error: error.message };
  if (data?.session && data?.user) {
    const profile = await getAccessProfile(data.user);
    if (!profile) { await supabase.auth.signOut(); return { success: false, error: "Cette adresse n'est pas autorisée pour l'administration." }; }
    return { success: true, user: profile, confirmed: true };
  }
  return { success: true, confirmed: false, message: "Un email de confirmation vient de vous être envoyé." };
}

export async function logout() { await supabase.auth.signOut(); }

/**
 * Seule source d'autorité pour l'accès admin : la session Supabase est vérifiée,
 * puis l'appartenance à `admin_access` avec `active = true` est relue à chaque appel.
 * Retourne `null` dès que l'une des deux conditions manque.
 */
export async function refreshSession() {
  const { data } = await supabase.auth.getSession();
  if (!data?.session?.user) return null;
  return await getAccessProfile(data.session.user);
}

export async function isAuthenticated() { return Boolean(await refreshSession()); }
export function hasPermission(requiredPermission, currentRole) { const rank = { viewer:1, editor:2, admin:3, owner:4 }; return (rank[currentRole] || 0) >= (rank[requiredPermission] || 0); }

export async function getAllUsers() {
  const { data, error } = await supabase.from("admin_access").select("id,email,role,display_name,active,created_at,updated_at").order("created_at", { ascending:true });
  if (error) throw error;
  return data || [];
}
export async function createUser(email, _password, permission = "viewer", displayName = "") {
  const { data, error } = await supabase.from("admin_access").insert({ email:String(email||"").trim().toLowerCase(), role:permission, display_name:displayName || null, active:true }).select().single();
  return error ? { success:false, error:error.message } : { success:true, user:data };
}
export async function deleteUser(userId) { const { error } = await supabase.from("admin_access").update({ active:false }).eq("id", userId); return error ? { success:false, error:error.message } : { success:true }; }
export async function changePassword(_userId, oldPassword, newPassword) {
  const { data } = await supabase.auth.getUser(); const email = data?.user?.email;
  if (!email) return { success:false, error:"Session invalide" };
  const verify = await supabase.auth.signInWithPassword({ email, password:oldPassword });
  if (verify.error) return { success:false, error:"Ancien mot de passe incorrect" };
  const { error } = await supabase.auth.updateUser({ password:newPassword });
  return error ? { success:false, error:error.message } : { success:true };
}

/**
 * Supabase déconseille d'effectuer un nouvel appel asynchrone Supabase
 * directement dans le callback `onAuthStateChange`, car ce callback s'exécute
 * pendant la notification interne de l'authentification. On rend donc le
 * callback immédiatement et on décale la lecture de `admin_access` au tick
 * suivant. Le compteur empêche une réponse lente d'un ancien événement de
 * réauthentifier l'interface après une déconnexion plus récente.
 */
export function onAuthStateChange(callback) {
  let sequence = 0;
  return supabase.auth.onAuthStateChange((_event, session) => {
    const current = ++sequence;
    const user = session?.user || null;

    setTimeout(() => {
      if (current !== sequence) return;
      if (!user) {
        callback(null);
        return;
      }

      getAccessProfile(user)
        .then((profile) => {
          if (current === sequence) callback(profile);
        })
        .catch(() => {
          if (current === sequence) callback(null);
        });
    }, 0);
  });
}
