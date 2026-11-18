import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { PushNotifications } from "@capacitor/push-notifications";
import { LangCtx } from "../../src/context.jsx";
import NativeExperience from "../../src/components/NativeExperience.jsx";
import { CAL_BOOKING_URL } from "../../src/components/NativeCalBooking.jsx";

const mockSettings = vi.hoisted(() => ({ availability: undefined }));
const mockNews = vi.hoisted(() => ({ rows: [] }));
const pushListeners = vi.hoisted(() => new Map());

// Test navigation without making live CRM calls or opening external apps.
vi.mock("../../src/hooks/useSettings.js", () => ({
  useSettings: () => ({ whatsappNumber: "+33600000000", lookbookHidden: true, bookingAvailability: mockSettings.availability }),
}));
vi.mock("../../src/hooks/usePublicCollection.js", () => ({
  usePublicCollection: (table) => ({ rows: table === "news_posts" ? mockNews.rows : [], source: table === "news_posts" ? "supabase" : "fallback", loading: false, error: null }),
}));
vi.mock("@capacitor/core", async (importOriginal) => ({
  ...await importOriginal(),
  CapacitorHttp: {
    post: vi.fn(async () => ({ status: 200, data: { active: true } })),
    request: vi.fn(async () => ({ status: 200, data: { active: false } })),
  },
}));
vi.mock("@capacitor/browser", () => ({ Browser: { open: vi.fn(async () => {}) } }));
vi.mock("@capacitor/push-notifications", () => ({
  PushNotifications: {
    addListener: vi.fn(async (name, listener) => { pushListeners.set(name, listener); return { remove: vi.fn(async () => { pushListeners.delete(name); }) }; }),
    checkPermissions: vi.fn(async () => ({ receive: "denied" })),
    requestPermissions: vi.fn(async () => ({ receive: "denied" })),
    register: vi.fn(async () => {}),
  },
}));
vi.mock("../../src/components/NativeServices.jsx", () => ({
  default: ({ onContact }) => <button onClick={() => onContact("image_consulting")}>Parler de ce projet</button>,
}));
vi.mock("../../src/components/GalleryMobile.jsx", () => ({
  default: ({ onViewerVisibilityChange }) => <div data-testid="gallery">Galerie chargée
    <button onClick={() => onViewerVisibilityChange?.(true)}>Afficher une photo</button>
    <button onClick={() => onViewerVisibilityChange?.(false)}>Fermer la photo</button>
  </div>,
}));
vi.mock("../../src/components/WhatsappContactModal.jsx", () => ({
  default: ({ isOpen, onClose, initialProjectType, initialProjectDetails }) => isOpen
    ? <div role="dialog" aria-label="Contact CRM" data-project={initialProjectType} data-details={initialProjectDetails}><button onClick={onClose}>Fermer le contact</button></div>
    : null,
}));

function Harness() {
  const [lang, setLang] = useState("FR");
  return (
    <LangCtx.Provider value={{ lang, setLang }}>
      <NativeExperience />
    </LangCtx.Provider>
  );
}
const navigation = () => screen.getByRole("navigation");
const openTab = (label) => fireEvent.click(within(navigation()).getByRole("button", { name: label }));

beforeEach(() => {
  mockSettings.availability = undefined;
  mockNews.rows = [];
  vi.stubGlobal("scrollTo", vi.fn());
  pushListeners.clear();
  PushNotifications.checkPermissions.mockReset().mockResolvedValue({ receive: "denied" });
  PushNotifications.requestPermissions.mockReset().mockResolvedValue({ receive: "denied" });
  PushNotifications.register.mockReset();
  Browser.open.mockClear();
  window.localStorage.removeItem("gnz-ios-push-device-token");
  window.localStorage.removeItem("gnz-ios-push-subscribed-token");
  window.localStorage.removeItem("gnz-notification-state-v1");
});

describe("GaspardNZ native iOS experience", () => {
  it("remplace seulement la barre React par UIKit et conserve les vrais écrans iOS", async () => {
    const postMessage = vi.fn();
    vi.spyOn(Capacitor, "getPlatform").mockReturnValue("ios");
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(true);
    window.webkit = { messageHandlers: { gnzNativeTabs: { postMessage } } };
    try {
      render(<Harness />);
      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
      expect(screen.getByRole("img", { name: "Portrait de GaspardNZ" })).toBeInTheDocument();
      expect(document.documentElement).toHaveClass("gnz-system-tabs", "gnz-system-tabs--home");
      expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({
        type: "state", selected: "home", visible: true,
      }));

      act(() => window.dispatchEvent(new CustomEvent("gnz:native-tab", { detail: { tab: "gallery" } })));
      expect(await screen.findByTestId("gallery")).toBeInTheDocument();
      expect(document.documentElement).not.toHaveClass("gnz-system-tabs--home");
      expect(document.querySelectorAll("#gnz-native-main > .gnz-native-page")).toHaveLength(1);
      expect(postMessage).toHaveBeenLastCalledWith(expect.objectContaining({
        type: "state", selected: "gallery", visible: true,
      }));
    } finally {
      delete window.webkit;
      vi.restoreAllMocks();
    }
  });

  it("masque UIKit pendant la photo plein écran et le restaure à la fermeture", async () => {
    const postMessage = vi.fn();
    vi.spyOn(Capacitor, "getPlatform").mockReturnValue("ios");
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(true);
    window.webkit = { messageHandlers: { gnzNativeTabs: { postMessage } } };
    try {
      render(<Harness />);
      act(() => window.dispatchEvent(new CustomEvent("gnz:native-tab", { detail: { tab: "gallery" } })));
      fireEvent.click(await screen.findByRole("button", { name: "Afficher une photo" }));
      expect(postMessage).toHaveBeenLastCalledWith(expect.objectContaining({ selected: "gallery", visible: false }));
      fireEvent.click(screen.getByRole("button", { name: "Fermer la photo" }));
      expect(postMessage).toHaveBeenLastCalledWith(expect.objectContaining({ selected: "gallery", visible: true }));
    } finally {
      delete window.webkit;
      vi.restoreAllMocks();
    }
  });

  it("ouvre les vraies pages demandées par Siri, sans prétendre consulter les rendez-vous personnels", async () => {
    const postMessage = vi.fn();
    vi.spyOn(Capacitor, "getPlatform").mockReturnValue("ios");
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(true);
    window.webkit = { messageHandlers: { gnzNativeTabs: { postMessage } } };
    try {
      render(<Harness />);
      act(() => window.dispatchEvent(new CustomEvent("gnz:shortcut-route", { detail: { route: "services" } })));
      expect(await screen.findByText("Parler de ce projet")).toBeInTheDocument();
      expect(postMessage).toHaveBeenLastCalledWith(expect.objectContaining({ selected: "services" }));

      act(() => window.dispatchEvent(new CustomEvent("gnz:shortcut-route", { detail: { route: "gallery" } })));
      expect(await screen.findByTestId("gallery")).toBeInTheDocument();

      act(() => window.dispatchEvent(new CustomEvent("gnz:shortcut-route", { detail: { route: "booking" } })));
      expect(await screen.findByTestId("native-cal-booking")).toBeInTheDocument();
      expect(postMessage).toHaveBeenLastCalledWith(expect.objectContaining({ selected: "more" }));

      act(() => window.dispatchEvent(new CustomEvent("gnz:shortcut-route", { detail: { route: "admin" } })));
      expect(await screen.findByTestId("native-cal-booking")).toBeInTheDocument();
    } finally {
      delete window.webkit;
      vi.restoreAllMocks();
    }
  });

  it("shows the authentic uploaded portrait and the five navigation tabs", async () => {
    render(<Harness />);
    expect(screen.getByRole("img", { name: "Portrait de GaspardNZ" }))
      .toHaveAttribute("src", "/images/Photo%20application%20.JPG");
    const tabs = within(navigation()).getAllByRole("button");
    expect(tabs).toHaveLength(5);
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Accueil", "Services", "Galerie", "Actualités", "Plus"]);
    expect(screen.queryByTestId("native-chatbot")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    expect(tabs.every((tab) => tab.querySelector("svg"))).toBe(true);
  });

  it("places one full-size capsule behind the selected tab and keeps five accessible buttons", async () => {
    render(<Harness />);
    const nav = navigation();
    const pill = () => nav.querySelectorAll(":scope > .gnz-native-tab-pill");
    const activeButton = () => within(nav).getAllByRole("button")
      .find(button => button.getAttribute("aria-current") === "page");

    expect(pill()).toHaveLength(1);
    expect(pill()[0]).toHaveAttribute("aria-hidden", "true");
    expect(activeButton()).toHaveTextContent("Accueil");

    openTab("Galerie");
    expect(pill()).toHaveLength(1);
    expect(activeButton()).toHaveTextContent("Galerie");
    expect(within(nav).getAllByRole("button")).toHaveLength(5);

    openTab("Plus");
    fireEvent.click(await screen.findByRole("button", { name: /Réserver/ }));
    expect(pill()).toHaveLength(1);
    expect(activeButton()).toHaveTextContent("Plus");
  });

  it("opens and closes the notifications panel", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("Aucune notification pour le moment")).toBeInTheDocument();
    expect(screen.queryByText("Alertes sur cet iPhone")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^(Activer|Désactiver)$/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
    await waitFor(() => expect(screen.queryByText("Aucune notification pour le moment")).not.toBeInTheDocument());
  });

  it("demande l'autorisation officielle au premier lancement puis ne redemande pas après un refus", async () => {
    vi.spyOn(Capacitor, "getPlatform").mockReturnValue("ios");
    vi.useFakeTimers();
    try {
      PushNotifications.checkPermissions.mockResolvedValueOnce({ receive: "prompt" }).mockResolvedValue({ receive: "denied" });
      const first = render(<Harness />);
      await act(async () => { await vi.advanceTimersByTimeAsync(1400); });
      expect(PushNotifications.requestPermissions).toHaveBeenCalledTimes(1);
      expect(PushNotifications.register).not.toHaveBeenCalled();
      first.unmount();
      render(<Harness />);
      await act(async () => { await vi.advanceTimersByTimeAsync(1400); });
      expect(PushNotifications.requestPermissions).toHaveBeenCalledTimes(1);
      expect(PushNotifications.register).not.toHaveBeenCalled();
    } finally { vi.useRealTimers(); vi.restoreAllMocks(); }
  });

  it("ne réaffiche pas la demande Apple si les notifications sont déjà autorisées", async () => {
    vi.spyOn(Capacitor, "getPlatform").mockReturnValue("ios");
    PushNotifications.checkPermissions.mockResolvedValue({ receive: "granted" });
    vi.useFakeTimers();
    try {
      render(<Harness />);
      await act(async () => { await vi.advanceTimersByTimeAsync(1400); });
      expect(PushNotifications.requestPermissions).not.toHaveBeenCalled();
      expect(PushNotifications.register).toHaveBeenCalledTimes(1);
    } finally { vi.useRealTimers(); vi.restoreAllMocks(); }
  });

  it("enregistre l'appareil uniquement après l'accord iOS et respecte un retrait dans Réglages", async () => {
    vi.spyOn(Capacitor, "getPlatform").mockReturnValue("ios");
    const token = "a".repeat(64);
    CapacitorHttp.post.mockClear();
    CapacitorHttp.request.mockClear();
    PushNotifications.checkPermissions.mockResolvedValueOnce({ receive: "prompt" }).mockResolvedValue({ receive: "denied" });
    PushNotifications.requestPermissions.mockResolvedValue({ receive: "granted" });
    PushNotifications.register.mockImplementation(async () => { pushListeners.get("registration")?.({ value: token }); });
    vi.useFakeTimers();
    try {
      render(<Harness />);
      await act(async () => { await vi.advanceTimersByTimeAsync(1400); });
      expect(PushNotifications.register).toHaveBeenCalledTimes(1);
      expect(CapacitorHttp.post).toHaveBeenCalledWith(expect.objectContaining({
        url: "https://gaspardnz.style/api/notifications/push-subscription",
        data: { deviceToken: token, consent: true },
      }));
      await act(async () => { document.dispatchEvent(new Event("visibilitychange")); });
      expect(CapacitorHttp.request).toHaveBeenCalledWith(expect.objectContaining({
        method: "DELETE", data: { deviceToken: token },
      }));
    } finally { vi.useRealTimers(); vi.restoreAllMocks(); }
  });

  it("sends the services lead to the CRM form, not directly to WhatsApp", async () => {
    render(<Harness />);
    openTab("Services");
    fireEvent.click(await screen.findByRole("button", { name: "Parler de ce projet" }));
    expect(await screen.findByRole("dialog", { name: "Contact CRM" })).toHaveAttribute("data-project", "image_consulting");
  });

  it("utilise le calendrier Cal.com du site plutôt que d'anciennes disponibilités indépendantes", async () => {
    render(<Harness />);
    openTab("Plus");
    fireEvent.click(await screen.findByRole("button", { name: /Réserver/ }));
    expect(await screen.findByTestId("native-cal-booking")).toBeInTheDocument();
    expect(CAL_BOOKING_URL).toBe("https://cal.com/gaspardnz-s-habiller-autrement-ghzqy2/rendez-vous");
    const calls = window.Cal.ns["gaspardnz-ios"].q;
    expect(calls.some(call => call[0] === "inline" && call[1].calLink === "gaspardnz-s-habiller-autrement-ghzqy2/rendez-vous")).toBe(true);
    expect(screen.queryByText("Aucun créneau publié pour le moment")).not.toBeInTheDocument();
  });

  it("permet d'ouvrir le calendrier directement si l'intégration iOS ne charge pas", async () => {
    Browser.open.mockClear();
    render(<Harness />);
    openTab("Plus");
    fireEvent.click(await screen.findByRole("button", { name: /Réserver/ }));
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir le calendrier des rendez-vous ↗" }));
    expect(Browser.open).toHaveBeenCalledWith({ url: CAL_BOOKING_URL });
  });

  it("n'expose pas les outils Push internes dans une version publique", async () => {
    render(<Harness />);
    openTab("Plus");
    expect(await screen.findByText("L'univers GaspardNZ")).toBeInTheDocument();
    expect(screen.queryByText("Outils de diagnostic TestFlight")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Code d’appairage Apple")).not.toBeInTheDocument();
  });

  it("translates all five tabs when switching to English", async () => {
    render(<Harness />);
    openTab("Plus");
    fireEvent.change(await screen.findByLabelText("Langue"), { target: { value: "EN" } });
    const tabs = within(navigation()).getAllByRole("button");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Home", "Services", "Gallery", "News", "More"]);
    fireEvent.click(await screen.findByRole("button", { name: "Book" }));
    expect(await screen.findByRole("button", { name: "Open the booking calendar ↗" })).toBeInTheDocument();
  });

  it("exposes privacy, legal terms and support from the native More tab", async () => {
    render(<Harness />);
    openTab("Plus");

    const legal = within(await screen.findByRole("region", { name: "Informations légales et assistance" }));
    const links = [
      ["Politique de confidentialité", "https://gaspardnz.style/confidentialite.html"],
      ["Mentions légales", "https://gaspardnz.style/mentions-legales.html"],
      ["Conditions générales de vente", "https://gaspardnz.style/cgv.html"],
      ["Assistance", "mailto:gaspardnz.contact@gmail.com"],
    ];
    for (const [label, href] of links) {
      const link = legal.getByRole("link", { name: label });
      expect(link).toHaveAttribute("href", href);
      if (href.startsWith("https://")) {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      }
    }
  });

  it("lets native users reopen privacy consent preferences from More", async () => {
    render(<Harness />);
    openTab("Plus");
    const onOpen = vi.fn();
    window.addEventListener("gnz:open-cookie-settings", onOpen);
    try {
      const legal = within(await screen.findByRole("region", { name: "Informations légales et assistance" }));
      fireEvent.click(legal.getByRole("button", { name: "Gérer mes cookies" }));
      expect(onOpen).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener("gnz:open-cookie-settings", onOpen);
    }
  });

  it("localizes native legal links when the visitor changes language", async () => {
    render(<Harness />);
    openTab("Plus");
    fireEvent.change(await screen.findByLabelText("Langue"), { target: { value: "EN" } });
    const legal = within(await screen.findByRole("region", { name: "Legal information and support" }));
    expect(legal.getByRole("link", { name: "Privacy policy" })).toHaveAttribute(
      "href", "https://gaspardnz.style/confidentialite.html"
    );
    expect(legal.getByRole("link", { name: "Support" })).toHaveAttribute(
      "href", "mailto:gaspardnz.contact@gmail.com"
    );
    expect(legal.getByRole("button", { name: "Manage cookie preferences" })).toBeInTheDocument();
  });

  it("opens the image gallery from the bottom bar", async () => {
    render(<Harness />);
    openTab("Galerie");
    expect(await screen.findByTestId("gallery")).toBeInTheDocument();
  });

  it("finishes on the most recently selected screen after rapid tab changes", async () => {
    render(<Harness />);
    openTab("Services");
    openTab("Galerie");
    openTab("Plus");
    expect(document.querySelectorAll("#gnz-native-main > .gnz-native-page")).toHaveLength(1);
    expect(document.querySelector("#gnz-native-main > .gnz-native-page")).not.toHaveAttribute("aria-hidden", "true");
    fireEvent.click(await screen.findByRole("button", { name: /Réserver/ }));
    expect(await screen.findByTestId("native-cal-booking")).toBeInTheDocument();
    expect(within(navigation()).getByRole("button", { name: "Plus" })).toHaveAttribute("aria-current", "page");
  });

  it("does not carry an outgoing screen into the next iOS tab", async () => {
    render(<Harness />);
    openTab("Galerie");
    expect(await screen.findByTestId("gallery")).toBeInTheDocument();

    openTab("Services");
    expect(document.querySelectorAll("#gnz-native-main > .gnz-native-page")).toHaveLength(1);
    expect(screen.queryByTestId("gallery")).not.toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Parler de ce projet" })).toBeInTheDocument();
  });

  it("keeps admin announcements in the bell and opens their TikTok links directly", async () => {
    const destination = "https://www.tiktok.com/@gaspardnz/video/123";
    mockNews.rows = [{ id: "article-video", title: "Nouvelle vidéo de style", body: "Un look inédit",
      published_at: "2026-11-18T12:00:00Z", metadata: { link_url: destination } }];
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
    const inbox = screen.getByLabelText("Filtrer les notifications").closest("section");
    expect(within(inbox).getByText("Nouvelle vidéo de style")).toBeInTheDocument();
    fireEvent.click(within(inbox).getByRole("button", { name: /Nouvelle vidéo de style/ }));
    await waitFor(() => expect(Browser.open).toHaveBeenCalledWith({ url: destination }));
    expect(screen.getByRole("button", { name: "Notifications" })).toHaveAttribute("aria-expanded", "false");
  });

  it("signale les nouvelles Actualités avec une pastille dorée puis l'efface à la lecture", async () => {
    mockNews.rows = [{ id: "article-discovery", slug: "collection-automne", locale: "FR",
      title: "La collection automne", body: "Nouvelle publication depuis l'administration.",
      published_at: "2026-11-18T12:00:00Z", metadata: {} }];
    render(<Harness />);
    const newsTab = within(navigation()).getByRole("button", { name: "Actualités" });
    expect(newsTab.querySelector(".gnz-native-news-tab-dot")).toBeInTheDocument();

    fireEvent.click(newsTab);
    expect(await screen.findByText("À découvrir")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: "La collection automne" }));
    expect(await screen.findByRole("dialog", { name: "La collection automne" })).toBeInTheDocument();
    await waitFor(() => {
      expect(newsTab.querySelector(".gnz-native-news-tab-dot")).not.toBeInTheDocument();
      expect(screen.queryByText("À découvrir")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Notifications" }).querySelector(".gnz-native-notification-count")).not.toBeInTheDocument();
    });
    expect(JSON.parse(window.localStorage.getItem("gnz-notification-state-v1"))["article-discovery"].read).toBe(true);
  });

  it("transmet l'indicateur À découvrir à la barre UIKit et le retire après consultation", async () => {
    mockNews.rows = [{ id: "article-ios-dot", title: "Article iPhone", locale: "FR", body: "À lire dans l'application.", metadata: {} }];
    const postMessage = vi.fn();
    vi.spyOn(Capacitor, "getPlatform").mockReturnValue("ios");
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(true);
    window.webkit = { messageHandlers: { gnzNativeTabs: { postMessage } } };
    try {
      render(<Harness />);
      expect(postMessage).toHaveBeenLastCalledWith(expect.objectContaining({ newsUnread: true }));
      act(() => window.dispatchEvent(new CustomEvent("gnz:native-tab", { detail: { tab: "news" } })));
      fireEvent.click(await screen.findByRole("button", { name: "Article iPhone" }));
      await waitFor(() => expect(postMessage).toHaveBeenLastCalledWith(expect.objectContaining({
        selected: "news", newsUnread: false,
      })));
    } finally { delete window.webkit; vi.restoreAllMocks(); }
  });

  it("routes a tapped Apple push directly to TikTok and refreshes durable news", async () => {
    vi.spyOn(Capacitor, "getPlatform").mockReturnValue("ios");
    const changed = vi.fn();
    window.addEventListener("gnz:news-updated", changed);
    try {
      render(<Harness />);
      await waitFor(() => expect(pushListeners.has("pushNotificationActionPerformed")).toBe(true));
      act(() => pushListeners.get("pushNotificationReceived")({ data: {} }));
      expect(changed).toHaveBeenCalledTimes(1);
      act(() => pushListeners.get("pushNotificationActionPerformed")({ notification: { data: {
        url: "https://www.tiktok.com/@gaspardnz/video/456", news_slug: "notification-article",
      } } }));
      await waitFor(() => expect(Browser.open).toHaveBeenCalledWith({ url: "https://www.tiktok.com/@gaspardnz/video/456" }));
      expect(changed).toHaveBeenCalledTimes(2);
    } finally {
      window.removeEventListener("gnz:news-updated", changed);
      vi.restoreAllMocks();
    }
  });

  it("ouvre une notification d'article dans Actualités iOS sans charger la page du site", async () => {
    vi.spyOn(Capacitor, "getPlatform").mockReturnValue("ios");
    mockNews.rows = [{
      id: "article-native", slug: "nouvelle-collection", locale: "FR",
      title: "Une nouvelle collection", body: "La collection est disponible dans l'application.",
      published_at: "2026-11-18T12:00:00Z", metadata: {},
    }];
    try {
      render(<Harness />);
      await waitFor(() => expect(pushListeners.has("pushNotificationActionPerformed")).toBe(true));
      act(() => pushListeners.get("pushNotificationActionPerformed")({ notification: { data: {
        url: "https://gaspardnz.style/actualites?article=nouvelle-collection",
        news_slug: "nouvelle-collection",
      } } }));
      const reader = await screen.findByRole("dialog", { name: "Une nouvelle collection" });
      expect(within(reader).getByRole("heading", { name: "Une nouvelle collection" })).toBeInTheDocument();
      expect(within(reader).getByText("La collection est disponible dans l'application.")).toBeInTheDocument();
      expect(Browser.open).not.toHaveBeenCalled();
    } finally { vi.restoreAllMocks(); }
  });
});
