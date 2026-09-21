import { lazy, Suspense } from "react";

const AdminLogin = lazy(() => import("./Admin/AdminLogin.jsx"));
const AdminLayout = lazy(() => import("./Admin/AdminLayout.jsx"));
const AdminDashboard = lazy(() => import("./Admin/AdminDashboard.jsx"));
const AdminAnalytics = lazy(() => import("./Admin/AdminAnalytics.jsx"));
const AdminCRM = lazy(() => import("./Admin/AdminCRM.jsx"));
const AdminVIPClients = lazy(() => import("./Admin/AdminVIPClients.jsx"));
const AdminUsers = lazy(() => import("./Admin/AdminUsers.jsx"));
const AdminWeddingInspiration = lazy(() => import("./Admin/AdminWeddingInspiration.jsx"));
const AdminSettings = lazy(() => import("./Admin/AdminSettings.jsx"));

// Toute la branche "espace admin" : connexion, puis mise en page + section
// active une fois connecté. Isolée de la composition du site public — l'état
// d'authentification vient de useAdminSession(), pas géré ici.
export default function AdminRoot({ adminAuthChecking, isAdminLoggedIn, adminUser, adminSection, onSectionChange, onLoginSuccess }) {
  return (
    <Suspense fallback={null}>
      {adminAuthChecking ? null : isAdminLoggedIn ? (
        <AdminLayout currentSection={adminSection} onSectionChange={onSectionChange} user={adminUser}>
          {adminSection === "dashboard" && <AdminDashboard />}
          {adminSection === "analytics" && <AdminAnalytics />}
          {adminSection === "crm" && <AdminCRM />}
          {adminSection === "vip" && <AdminVIPClients />}
          {adminSection === "users" && <AdminUsers />}
          {adminSection === "wedding" && <AdminWeddingInspiration />}
          {adminSection === "settings" && <AdminSettings />}
        </AdminLayout>
      ) : (
        <AdminLogin onLoginSuccess={onLoginSuccess} />
      )}
    </Suspense>
  );
}
