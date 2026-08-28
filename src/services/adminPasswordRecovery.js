import { supabase } from "./supabaseClient.js";

const ADMIN_URL = "https://gaspardnz.style/admin";

export async function sendAdminPasswordReset(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return { success: false, error: "Adresse email requise." };

  const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
    redirectTo: ADMIN_URL,
  });

  if (error) return { success: false, error: error.message };
  return {
    success: true,
    message: "Un email de réinitialisation vient de vous être envoyé.",
  };
}

export function isPasswordRecoveryLink() {
  if (typeof window === "undefined") return false;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return hash.get("type") === "recovery";
}

export async function saveNewAdminPassword(password) {
  if (!password || password.length < 10) {
    return { success: false, error: "Utilisez un mot de passe d'au moins 10 caractères." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { success: false, error: error.message };

  return { success: true };
}
