import { lazy } from "react";

// Table UNIQUE des sections admin : menu (NAV_GROUPS), permission minimale
// (min / alsoFor) et écran à charger (lazy, un seul bundle par section)
// vivent tous ici. Avant, ajouter une section demandait de modifier
// AdminRoot.jsx (routage d'un côté) ET la liste "standalone" d'AdminLayout.jsx
// (rendu de l'autre) : un des deux oublié laissait un écran bloqué sur
// « Module en cours de chargement. » sans erreur visible. Un seul endroit à
// modifier maintenant, et chaque section a désormais son propre bundle
// chargé à la demande (avant, dix écrans sur dix-sept étaient chargés
// d'un coup dès l'arrivée sur l'admin, quelle que soit la section ouverte).
export const NAV_GROUPS = [
  { label: "Pilotage", items: [
    { id: "dashboard", label: "Tableau de bord", icon: "◫", min: "viewer", component: lazy(() => import("./AdminDashboard.jsx")) },
    { id: "analytics", label: "Analytics", icon: "⌁", min: "viewer", component: lazy(() => import("./AdminAnalytics.jsx")) },
    { id: "seo", label: "Acquisition & SEO", icon: "⌕", min: "editor", component: lazy(() => import("./AdminSEO.jsx")) },
  ]},
  { label: "Commercial", items: [
    { id: "crm", label: "CRM", icon: "◎", min: "viewer", component: lazy(() => import("./AdminCRM.jsx")) },
    { id: "bookings", label: "Réservations", icon: "□", min: "viewer", component: lazy(() => import("./AdminBookings.jsx")) },
    { id: "emails", label: "Emails", icon: "✉", min: "viewer", component: lazy(() => import("./AdminEmails.jsx")) },
  ]},
  { label: "Site", items: [
    { id: "content", label: "Contenu du site", icon: "✎", min: "editor", component: lazy(() => import("./AdminContent.jsx")) },
    { id: "texts", label: "Textes du site", icon: "Aa", min: "editor", component: lazy(() => import("./AdminTexts.jsx")) },
    { id: "media", label: "Médias & photos", icon: "▧", min: "editor", component: lazy(() => import("./AdminMedia.jsx")) },
    { id: "albums", label: "Galerie & Showroom", icon: "▦", min: "editor", component: lazy(() => import("./AdminAlbums.jsx")) },
    { id: "promotions", label: "Promotions", icon: "◇", min: "editor", component: lazy(() => import("./AdminPromotions.jsx")) },
    { id: "style", label: "Style du mois", icon: "◈", min: "editor", component: lazy(() => import("./AdminStyleMonth.jsx")) },
    { id: "vip", label: "Clients VIP", icon: "☆", min: "editor", component: lazy(() => import("./AdminVIPClients.jsx")) },
    { id: "wedding", label: "Wedding Inspiration", icon: "♢", min: "editor", component: lazy(() => import("./AdminWeddingInspiration.jsx")) },
  ]},
  // Le couturier est un rôle À PART (rang 0, comme un rôle inconnu) : il ne
  // satisfait jamais un `min` normal. `alsoFor` lui ouvre CETTE seule entrée,
  // sans toucher au reste de la hiérarchie owner > admin > editor > viewer.
  { label: "Atelier", items: [
    { id: "commandes", label: "Commandes sur-mesure", icon: "✂", min: "editor", alsoFor: ["couturier"], component: lazy(() => import("./AdminTailoringOrders.jsx")) },
  ]},
  { label: "Administration", items: [
    { id: "users", label: "Utilisateurs", icon: "♙", min: "owner", component: lazy(() => import("./AdminUsers.jsx")) },
    { id: "settings", label: "Paramètres", icon: "⚙", min: "admin", component: lazy(() => import("./AdminSettings.jsx")) },
  ]},
];

export const ALL_SECTIONS = NAV_GROUPS.flatMap((group) => group.items);
