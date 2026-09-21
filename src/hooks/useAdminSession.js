import { useEffect, useRef, useState } from "react";
import { initAdminUsers, onAuthStateChange, refreshSession } from "../services/adminAuth.js";
import { isPasswordRecoveryLink } from "../services/adminPasswordRecovery.js";

const ADMIN_SECTIONS = ["dashboard", "analytics", "crm", "vip", "users", "wedding", "settings"];
const getAdminSectionFromPath = () => {
  if (typeof window === "undefined") return "dashboard";
  const section = window.location.pathname.split("/").filter(Boolean)[1];
  return ADMIN_SECTIONS.includes(section) ? section : "dashboard";
};

// Regroupe le routage et l'authentification admin (auparavant mélangés au
// reste de App() — splash, consentement, sections mobiles publiques...).
// Comportement strictement inchangé : autorité unique = session Supabase
// vérifiée + admin_access.active, jamais le cache localStorage.
export default function useAdminSession() {
  const [isAdminPath, setIsAdminPath] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  // Tant que la session Supabase n'est pas vérifiée, on n'affiche ni l'admin ni le login.
  const [adminAuthChecking, setAdminAuthChecking] = useState(true);
  const [adminSection, setAdminSection] = useState(getAdminSectionFromPath);
  const recoveryFlowRef = useRef(null);
  const currentlyOnAdminPath = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

  useEffect(() => {
    initAdminUsers();
  }, []);

  useEffect(() => {
    const checkAdminPath = () => {
      const path = window.location.pathname;
      setIsAdminPath(path.startsWith("/admin"));
      if (path.startsWith("/admin")) {
        setAdminSection(getAdminSectionFromPath());
      }
    };
    checkAdminPath();
    window.addEventListener("popstate", checkAdminPath);
    return () => window.removeEventListener("popstate", checkAdminPath);
  }, []);

  useEffect(() => {
    if (!(currentlyOnAdminPath || isAdminPath)) return undefined;

    // Un lien de récupération ouvre une vraie session Supabase (detectSessionInUrl).
    // On force alors l'écran dédié pendant toute la durée de ce chargement de page,
    // sinon le formulaire de réinitialisation serait remplacé par l'interface admin.
    if (recoveryFlowRef.current === null) recoveryFlowRef.current = isPasswordRecoveryLink();
    if (recoveryFlowRef.current) {
      setIsAdminLoggedIn(false);
      setAdminUser(null);
      setAdminAuthChecking(false);
      return undefined;
    }

    let cancelled = false;
    const applyProfile = (profile) => {
      if (cancelled) return;
      setAdminUser(profile);
      setIsAdminLoggedIn(Boolean(profile));
      setAdminAuthChecking(false);
    };

    // Autorité unique : session Supabase vérifiée + admin_access.active.
    // Le cache localStorage ne donne aucun accès.
    refreshSession().then(applyProfile).catch(() => applyProfile(null));

    // Réagit à l'expiration, au refresh de token et à une déconnexion faite ailleurs.
    const { data } = onAuthStateChange(applyProfile);

    return () => {
      cancelled = true;
      data?.subscription?.unsubscribe?.();
    };
  }, [currentlyOnAdminPath, isAdminPath]);

  const onSectionChange = (section) => {
    setAdminSection(section);
    window.history.pushState({}, "", `/admin/${section}`);
  };

  const onLoginSuccess = (user) => {
    setAdminUser(user);
    setIsAdminLoggedIn(true);
    setAdminAuthChecking(false);
    setAdminSection("dashboard");
    window.history.replaceState({}, "", "/admin/dashboard");
  };

  return {
    currentlyOnAdminPath, isAdminPath, isAdminLoggedIn, adminUser,
    adminAuthChecking, adminSection, onSectionChange, onLoginSuccess,
  };
}
