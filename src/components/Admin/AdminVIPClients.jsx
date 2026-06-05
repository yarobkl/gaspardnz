import { useMemo, useState } from "react";
import { getSettings, saveSettings } from "../../services/settingsService.js";
import { useTr } from "../../context.jsx";
import "../../styles/admin.css";

const defaultClients = [
  {
    initials: "R.B",
    name: "Rodrin Bakala Mouengue",
    city: "Paris",
    event: "Mariage",
    gradient: "linear-gradient(135deg,#1e3a5f,#2d6a9f)",
    photo: "/images/rodrin-bakala.jpg.JPG",
    album: [
      "/images/rodrin-bakala.jpg.JPG",
      "/images/rodrin-w1.jpg",
      "/images/rodrin-w2.jpg",
      "/images/rodrin-w3.jpg",
      "/images/rodrin-w4.jpg",
      "/images/rodrin-w5.jpg",
    ],
  },
  {
    initials: "B",
    name: "Boris",
    city: "Paris",
    event: "Mariage",
    gradient: "linear-gradient(135deg,#4a1942,#8b2fc9)",
    photo: "/images/boris-01.jpg",
    album: Array.from({ length: 16 }, (_, index) => `/images/boris-${String(index + 1).padStart(2, "0")}.jpg`),
  },
  { initials: "Y.B", name: "Yannick B.", city: "Lyon", event: "Soirée VIP", gradient: "linear-gradient(135deg,#1a3a1a,#2d6b2d)", photo: "", album: [] },
  { initials: "A.N", name: "Alexis N.", city: "Dubaï", event: "Business", gradient: "linear-gradient(135deg,#3d1a00,#8b3d00)", photo: "", album: [] },
  { initials: "D.K", name: "Diarietou K.", city: "Abidjan", event: "Cérémonie", gradient: "linear-gradient(135deg,#1a1a3d,#3d3d8b)", photo: "", album: [] },
  { initials: "T.R", name: "Théo R.", city: "Paris", event: "Shooting", gradient: "linear-gradient(135deg,#3d001a,#8b0030)", photo: "", album: [] },
];

const emptyClient = {
  initials: "",
  name: "",
  city: "",
  event: "",
  gradient: "linear-gradient(135deg,#1e3a5f,#2d6a9f)",
  photo: "",
  album: [],
};

const toAlbumText = (album = []) => album.join("\n");
const fromAlbumText = (value) => value.split("\n").map((line) => line.trim()).filter(Boolean);

const AdminVIPClients = () => {
  const t = useTr();
  const [clients, setClients] = useState(() => {
    const settings = getSettings();
    return settings.vipClients?.length ? settings.vipClients : defaultClients;
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedClient = clients[selectedIndex] || emptyClient;

  const previewAlbum = useMemo(() => selectedClient.album || [], [selectedClient.album]);

  const persist = (nextClients) => {
    setClients(nextClients);
    saveSettings({ vipClients: nextClients });
  };

  const updateClient = (updates) => {
    const nextClients = clients.map((client, index) => (
      index === selectedIndex ? { ...client, ...updates } : client
    ));
    persist(nextClients);
  };

  const addClient = () => {
    const nextClients = [...clients, { ...emptyClient, name: "Nouveau client", initials: "NC" }];
    persist(nextClients);
    setSelectedIndex(nextClients.length - 1);
  };

  const removeClient = () => {
    if (clients.length <= 1) {
      alert(t("admin_keep_one_client"));
      return;
    }
    if (!window.confirm(t("admin_confirm_delete_client"))) return;
    const nextClients = clients.filter((_, index) => index !== selectedIndex);
    persist(nextClients);
    setSelectedIndex(Math.max(0, selectedIndex - 1));
  };

  const resetDefaults = () => {
    if (!window.confirm(t("admin_confirm_reset_gallery"))) return;
    persist(defaultClients);
    setSelectedIndex(0);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "1rem", alignItems: "start" }}>
      <div className="admin-card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <div>
            <h3 className="admin-h3" style={{ margin: 0 }}>{t("admin_client_albums")}</h3>
            <p className="admin-small" style={{ margin: "0.35rem 0 0" }}>{t("admin_client_albums_help")}</p>
          </div>
          <button className="admin-btn" onClick={addClient}>{t("admin_add")}</button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin_client")}</th>
                <th>{t("admin_city")}</th>
                <th>{t("admin_photos")}</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => (
                <tr
                  key={`${client.name}-${index}`}
                  onClick={() => setSelectedIndex(index)}
                  style={{ cursor: "pointer", background: selectedIndex === index ? "rgba(184,151,62,0.1)" : "transparent" }}>
                  <td data-label={t("admin_client")}>
                    <strong>{client.name || t("admin_untitled")}</strong>
                    <div className="admin-small">{client.event || t("admin_event_to_define")}</div>
                  </td>
                  <td data-label={t("admin_city")}>{client.city || "-"}</td>
                  <td data-label={t("admin_photos")}>{(client.album || []).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="admin-btn-secondary" onClick={resetDefaults} style={{ width: "100%", marginTop: "1rem" }}>
          {t("admin_reload_base")}
        </button>
      </div>

      <div className="admin-card">
        <h3 className="admin-h3" style={{ marginTop: 0 }}>{t("admin_edit_card")}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: "1rem" }}>
          <input className="admin-input" placeholder={t("admin_initials")} value={selectedClient.initials || ""} onChange={(e) => updateClient({ initials: e.target.value })} />
          <input className="admin-input" placeholder={t("admin_name")} value={selectedClient.name || ""} onChange={(e) => updateClient({ name: e.target.value })} />
          <input className="admin-input" placeholder={t("admin_city")} value={selectedClient.city || ""} onChange={(e) => updateClient({ city: e.target.value })} />
          <input className="admin-input" placeholder={t("admin_event")} value={selectedClient.event || ""} onChange={(e) => updateClient({ event: e.target.value })} />
        </div>

        <div className="admin-form-group" style={{ marginTop: "1rem" }}>
          <label className="admin-label">{t("admin_main_photo")}</label>
          <input className="admin-input" placeholder="/images/boris-01.jpg" value={selectedClient.photo || ""} onChange={(e) => updateClient({ photo: e.target.value })} />
        </div>

        <div className="admin-form-group">
          <label className="admin-label">{t("admin_background_no_photo")}</label>
          <input className="admin-input" value={selectedClient.gradient || ""} onChange={(e) => updateClient({ gradient: e.target.value })} />
        </div>

        <div className="admin-form-group">
          <label className="admin-label">{t("admin_album_photo_urls")}</label>
          <textarea
            className="admin-textarea"
            rows={8}
            value={toAlbumText(selectedClient.album)}
            onChange={(e) => updateClient({ album: fromAlbumText(e.target.value) })}
            placeholder="/images/photo-01.jpg&#10;/images/photo-02.jpg"
          />
        </div>

        {selectedClient.photo && (
          <div style={{ marginBottom: "1rem" }}>
            <p className="admin-label">{t("admin_preview")}</p>
            <img src={selectedClient.photo} alt={selectedClient.name} style={{ width: "100%", maxHeight: "320px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--gnz-border)" }} />
          </div>
        )}

        <p className="admin-small">{t("admin_album_count", previewAlbum.length)}</p>
        <button className="admin-btn-danger" onClick={removeClient} style={{ width: "100%" }}>
          {t("admin_delete_card")}
        </button>
      </div>
    </div>
  );
};

export default AdminVIPClients;
