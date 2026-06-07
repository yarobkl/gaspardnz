import { useEffect, useMemo, useState } from "react";
import { addInteraction, createLead, deleteLead, exportLeadsCSV, getAllLeads, updateLead } from "../../services/adminCRM.js";
import { useTr } from "../../context.jsx";
import "../../styles/admin.css";

const statuses = ["nouveau", "contacté", "intéressé", "converti", "en attente"];
const eventTypes = ["Mariage", "Gala", "Événement corporatif", "Cérémonie", "Shooting", "Autre"];
const sources = ["Site web", "WhatsApp", "Instagram", "Recommandation", "Téléphone", "Direct"];

const emptyLead = {
  name: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  eventType: "",
  eventDate: "",
  guestCount: "",
  budget: "",
  source: "Site web",
  notes: "",
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
};

const statusTone = (status) => {
  if (status === "converti") return { background: "rgba(92,175,45,0.16)", color: "#7bdc4d" };
  if (status === "en attente") return { background: "rgba(255,176,32,0.14)", color: "#ffcc6a" };
  if (status === "contacté") return { background: "rgba(75,154,255,0.14)", color: "#86bfff" };
  return { background: "rgba(184,151,62,0.18)", color: "var(--gnz-gold)" };
};

const ITEMS_PER_PAGE = 25;

const AdminCRM = () => {
  const t = useTr();
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [formData, setFormData] = useState(emptyLead);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = () => {
    const nextLeads = getAllLeads().sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    setLeads(nextLeads);
    setSelectedLead((current) => (current ? nextLeads.find((lead) => lead.id === current.id) || null : null));
  };

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery = !normalizedQuery || [lead.name, lead.email, lead.phone, lead.city, lead.country, lead.eventType, lead.source]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesEvent = eventFilter === "all" || lead.eventType === eventFilter;
      return matchesQuery && matchesStatus && matchesEvent;
    });
  }, [eventFilter, leads, query, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLeads = filteredLeads.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, eventFilter]);

  const stats = useMemo(() => ({
    total: leads.length,
    new: leads.filter((lead) => lead.status === "nouveau").length,
    waiting: leads.filter((lead) => lead.status === "en attente").length,
    converted: leads.filter((lead) => lead.status === "converti").length,
  }), [leads]);

  const handleAddLead = (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName || !trimmedEmail) {
      alert(t("admin_error_name_email_required"));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      alert(t("admin_error_invalid_email"));
      return;
    }

    const result = createLead({ ...formData, name: trimmedName, email: trimmedEmail });
    if (result.success) {
      setFormData(emptyLead);
      setShowForm(false);
      loadLeads();
      setSelectedLead(result.lead);
      return;
    }

    alert(result.error || t("admin_error_create_lead"));
  };

  const handleStatusChange = (leadId, newStatus) => {
    updateLead(leadId, { status: newStatus });
    addInteraction(leadId, "statut", t("admin_status_changed", newStatus));
    loadLeads();
  };

  const handleDeleteLead = (leadId) => {
    if (window.confirm(t("admin_confirm_delete_lead"))) {
      deleteLead(leadId);
      loadLeads();
      setSelectedLead(null);
    }
  };

  const handleAddMessage = (e) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    if (!selectedLead) return;

    if (!trimmedMessage) {
      alert(t("admin_error_empty_note"));
      return;
    }

    if (trimmedMessage.length > 5000) {
      alert(t("admin_error_note_too_long"));
      return;
    }

    addInteraction(selectedLead.id, "note", trimmedMessage);
    setNewMessage("");
    loadLeads();
  };

  const handleExport = () => {
    const csv = exportLeadsCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gaspardnz-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const phoneDigits = (selectedLead?.phone || "").replace(/[^\d+]/g, "");
  const statusLabel = (status) => ({
    nouveau: t("admin_status_nouveau"),
    "contacté": t("admin_status_contacte"),
    "intéressé": t("admin_status_interesse"),
    converti: t("admin_status_converti"),
    "en attente": t("admin_status_en_attente"),
  }[status] || status);
  const sourceLabel = (source) => ({
    "Site web": t("admin_source_site"),
    Recommandation: t("admin_source_recommendation"),
    "Téléphone": t("admin_source_phone"),
    Direct: t("admin_direct"),
  }[source] || source);
  const eventTypeLabel = (type) => ({
    Mariage: t("event_wedding"),
    "Événement corporatif": t("admin_event_corporate"),
    "Cérémonie": t("event_ceremony"),
    Shooting: t("event_shooting"),
    Autre: t("admin_other"),
  }[type] || type);

  return (
    <div>
      <div className="admin-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-kpi">
          <div className="admin-kpi-label">{t("admin_leads_total")}</div>
          <div className="admin-kpi-value">{stats.total}</div>
        </div>
        <div className="admin-kpi">
          <div className="admin-kpi-label">{t("admin_new")}</div>
          <div className="admin-kpi-value">{stats.new}</div>
        </div>
        <div className="admin-kpi">
          <div className="admin-kpi-label">{t("admin_waiting")}</div>
          <div className="admin-kpi-value">{stats.waiting}</div>
        </div>
        <div className="admin-kpi">
          <div className="admin-kpi-label">{t("admin_converted")}</div>
          <div className="admin-kpi-value">{stats.converted}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <button onClick={() => setShowForm((value) => !value)} className="admin-btn">
          {t("admin_new_lead")}
        </button>
        <button onClick={handleExport} className="admin-btn-secondary">
          {t("admin_export_csv")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddLead} className="admin-card" style={{ marginBottom: "1.5rem" }}>
          <h3 className="admin-h3" style={{ marginTop: 0 }}>{t("admin_add_request")}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            <input type="text" placeholder={t("admin_full_name")} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="admin-input" />
            <input type="email" placeholder={t("admin_email")} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="admin-input" />
            <input type="tel" placeholder={t("admin_phone")} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="admin-input" />
            <input type="text" placeholder={t("admin_country")} value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="admin-input" />
            <input type="text" placeholder={t("admin_city")} value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="admin-input" />
            <select value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })} className="admin-select">
              <option value="">{t("admin_event_type")}</option>
              {eventTypes.map((type) => <option key={type} value={type}>{eventTypeLabel(type)}</option>)}
            </select>
            <input type="date" value={formData.eventDate} onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })} className="admin-input" />
            <input type="number" min="0" placeholder={t("admin_guests")} value={formData.guestCount} onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })} className="admin-input" />
            <input type="number" min="0" placeholder={t("admin_budget")} value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="admin-input" />
            <select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} className="admin-select">
              {sources.map((source) => <option key={source} value={source}>{sourceLabel(source)}</option>)}
            </select>
          </div>
          <textarea placeholder={t("admin_internal_notes")} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="admin-textarea" style={{ marginBottom: "1rem" }} />
          <button type="submit" className="admin-btn">{t("admin_save")}</button>
        </form>
      )}

      <div style={{ display: "grid", gridTemplateColumns: selectedLead ? "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" : "1fr", gap: "1rem", alignItems: "start" }}>
        <div className="admin-card">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
            <input className="admin-input" placeholder={t("admin_search_placeholder")} value={query} onChange={(e) => setQuery(e.target.value)} />
            <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">{t("admin_all_statuses")}</option>
              {statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
            </select>
            <select className="admin-select" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
              <option value="all">{t("admin_all_events")}</option>
              {eventTypes.map((type) => <option key={type} value={type}>{eventTypeLabel(type)}</option>)}
            </select>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t("admin_contact")}</th>
                  <th>{t("admin_origin")}</th>
                  <th>{t("admin_status")}</th>
                  <th>{t("admin_event")}</th>
                  <th>{t("admin_last_action")}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    style={{ cursor: "pointer", background: selectedLead?.id === lead.id ? "rgba(184,151,62,0.1)" : "transparent" }}>
                    <td data-label={t("admin_contact")}>
                      <strong>{lead.name}</strong>
                      <div className="admin-small">{lead.phone || lead.email}</div>
                    </td>
                    <td data-label={t("admin_origin")}>
                      {sourceLabel(lead.source || "Direct")}
                      <div className="admin-small">{[lead.city, lead.country].filter(Boolean).join(", ") || "-"}</div>
                    </td>
                    <td data-label={t("admin_status")}>
                      <span style={{ ...statusTone(lead.status), padding: "0.3rem 0.6rem", borderRadius: "4px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {statusLabel(lead.status)}
                      </span>
                    </td>
                    <td data-label={t("admin_event")}>{eventTypeLabel(lead.eventType) || "-"}</td>
                    <td data-label={t("admin_last_action")}>{formatDateTime(lead.updatedAt || lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--gnz-text-secondary)" }}>
              {t("admin_no_matching_leads")}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage ? "admin-btn" : "admin-btn-secondary"}
                  style={{ minWidth: "36px", padding: "0.5rem" }}>
                  {page}
                </button>
              ))}
              <span style={{ marginLeft: "1rem", color: "var(--gnz-text-secondary)", fontSize: "0.875rem" }}>
                {t("admin_page")} {currentPage} / {totalPages}
              </span>
            </div>
          )}
        </div>

        {selectedLead && (
          <aside className="admin-card" style={{ height: "fit-content" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "start" }}>
              <div>
                <h3 className="admin-h3" style={{ margin: "0 0 0.2rem" }}>{selectedLead.name}</h3>
                <p className="admin-small" style={{ margin: 0 }}>{[selectedLead.city, selectedLead.country].filter(Boolean).join(", ") || t("admin_location_missing")}</p>
              </div>
              <button className="admin-btn-secondary" onClick={() => setSelectedLead(null)} style={{ padding: "0.6rem 0.8rem" }}>{t("admin_close")}</button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", margin: "1rem 0" }}>
              {selectedLead.email && <a className="admin-btn-secondary" href={`mailto:${selectedLead.email}`} style={{ textDecoration: "none" }}>Email</a>}
              {phoneDigits && <a className="admin-btn-secondary" href={`tel:${phoneDigits}`} style={{ textDecoration: "none" }}>{t("admin_call")}</a>}
              {phoneDigits && <a className="admin-btn-secondary" href={`https://wa.me/${phoneDigits.replace(/^\+/, "")}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>WhatsApp</a>}
            </div>

            <div style={{ fontSize: "0.875rem", lineHeight: "1.8", marginBottom: "1.2rem" }}>
              <p><strong>Email:</strong> {selectedLead.email}</p>
              <p><strong>{t("admin_phone")}:</strong> {selectedLead.phone || "-"}</p>
              <p><strong>{t("admin_event")}:</strong> {eventTypeLabel(selectedLead.eventType) || "-"}</p>
              <p><strong>Date:</strong> {selectedLead.eventDate || "-"}</p>
              <p><strong>{t("admin_guests")}:</strong> {selectedLead.guestCount || "-"}</p>
              <p><strong>{t("admin_budget")}:</strong> {selectedLead.budget || "-"}</p>
              <p><strong>{t("admin_origin")}:</strong> {sourceLabel(selectedLead.source || "Direct")}</p>
              <p><strong>{t("admin_created_at")}:</strong> {formatDateTime(selectedLead.createdAt)}</p>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">{t("admin_status")}</label>
              <select value={selectedLead.status} onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)} className="admin-select">
                {statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
              </select>
            </div>

            <form onSubmit={handleAddMessage} style={{ marginBottom: "1rem" }}>
              <label className="admin-label">{t("admin_history")}</label>
              <textarea placeholder={t("admin_add_followup_note")} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={3} className="admin-textarea" style={{ margin: "0.5rem 0" }} />
              <button type="submit" className="admin-btn-secondary" style={{ width: "100%" }}>{t("admin_add_note")}</button>
            </form>

            <div style={{ marginBottom: "1rem", maxHeight: "220px", overflow: "auto" }}>
              {(selectedLead.interactions || []).slice().reverse().map((item) => (
                <div key={item.id} style={{ fontSize: "0.78rem", marginBottom: "0.7rem", paddingBottom: "0.7rem", borderBottom: "1px solid var(--gnz-border-light)", color: "var(--gnz-text-secondary)" }}>
                  <div style={{ color: "var(--gnz-gold)", marginBottom: "0.25rem" }}>{formatDateTime(item.timestamp)}</div>
                  <div>{item.message}</div>
                </div>
              ))}
              {(selectedLead.interactions || []).length === 0 && <p className="admin-small">{t("admin_no_note_contact")}</p>}
            </div>

            <button onClick={() => handleDeleteLead(selectedLead.id)} className="admin-btn-danger" style={{ width: "100%" }}>
              {t("admin_delete_lead")}
            </button>
          </aside>
        )}
      </div>
    </div>
  );
};

export default AdminCRM;
