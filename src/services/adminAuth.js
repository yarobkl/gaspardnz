import { supabase } from "./supabaseClient.js";

const PROFILE_KEY = "gnz-admin-profile";
export const PERMISSIONS = { OWNER: "owner", ADMIN_FULL: "admin", EDITOR: "editor", ADMIN_READ: "viewer" };
export const initAdminUsers = () => {};

const cacheProfile = (profile) => {
  try { profile ? localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)) : localStorage.removeItem(PROFILE_KEY); } catch {}
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
  if (!profile) { await supabase.auth.signOut(); cacheProfile(null); return { success: false, error: "Ce compte n'est pas autorisé à accéder à l'administration." }; }
  cacheProfile(profile);
  return { success: true, user: profile };
}

export async function registerAdmin(email, password) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized || !password || password.length < 10) return { success: false, error: "Utilisez un mot de passe d'au moins 10 caractères." };
  const { data, error } = await supabase.auth.signUp({ email: normalized, password, options: { emailRedirectTo: `${window.location.origin}/admin/dashboard` } });
  if (error) return { success: false, error: error.message };
  if (data?.session && data?.user) {
    const profile = await getAccessProfile(data.user);
    if (!profile) { await supabase.auth.signOut(); cacheProfile(null); return { success: false, error: "Cette adresse n'est pas autorisée pour l'administration." }; }
    cacheProfile(profile);
    return { success: true, user: profile, confirmed: true };
  }
  return { success: true, confirmed: false, message: "Un email de confirmation vient de vous être envoyé." };
}

export async function logout() { cacheProfile(null); await supabase.auth.signOut(); }

export function getSession() {
  try { const raw = localStorage.getItem(PROFILE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export async function refreshSession() {
  const { data } = await supabase.auth.getSession();
  if (!data?.session?.user) { cacheProfile(null); return null; }
  const profile = await getAccessProfile(data.session.user);
  cacheProfile(profile);
  return profile;
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
export function onAuthStateChange(callback) { return supabase.auth.onAuthStateChange(async (_event, session) => { const profile = session?.user ? await getAccessProfile(session.user) : null; cacheProfile(profile); callback(profile); }); }
