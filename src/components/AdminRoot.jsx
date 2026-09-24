import { lazy, Suspense, useEffect } from "react";

const AdminLogin = lazy(() => import("./Admin/AdminLogin.jsx"));
const AdminLayout = lazy(() => import("./Admin/AdminLayout.jsx"));

// Toute la branche "espace admin" : connexion, puis mise en page + section
// active une fois connecté. Isolée de la composition du site public — l'état
// d'authentification vient de useAdminSession(), pas géré ici. Quelle
// section afficher (et avec quel écran) est décidé entièrement par
// AdminLayout via Admin/adminSections.js : ce fichier n'a plus besoin de
// connaître la liste des écrans admin.
export default function AdminRoot({ adminAuthChecking, isAdminLoggedIn, adminUser, adminSection, onSectionChange, onLoginSuccess }) {
  // Le manifeste PWA (start_url ".") fait toujours atterrir un raccourci
  // "Ajouter à l'écran d'accueil" sur le site public, même ajouté depuis
  // /admin : Safari/iOS lit le manifeste au moment d'ajouter le raccourci,
  // pas l'URL affichée. On le retire tant qu'on est sur l'admin pour qu'un
  // raccourci ajouté ici pointe vraiment vers /admin.
  useEffect(() => {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    const parent = manifestLink?.parentNode;
    const nextSibling = manifestLink?.nextSibling;
    manifestLink?.remove();
    return () => {
      if (manifestLink && parent) parent.insertBefore(manifestLink, nextSibling);
    };
  }, []);

  return (
    <Suspense fallback={null}>
      {adminAuthChecking ? null : isAdminLoggedIn ? (
        <AdminLayout currentSection={adminSection} onSectionChange={onSectionChange} user={adminUser} />
      ) : (
        <AdminLogin onLoginSuccess={onLoginSuccess} />
      )}
    </Suspense>
  );
}
