import { useEffect, useMemo, useState } from "react";
import { addInteraction, createLead, deleteLead, exportLeadsCSV, getAllLeads, updateLead } from "../../services/adminCRM.js";
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

const AdminCRM = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [formData, setFormData] = useState(emptyLead);

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
      alert("Nom et email sont obligatoires");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      alert("Email invalide");
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

    alert(result.error || "Erreur lors de la création du lead");
  };

  const handleStatusChange = (leadId, newStatus) => {
    updateLead(leadId, { status: newStatus });
    addInteraction(leadId, "statut", `Statut changé en ${newStatus}`);
    loadLeads();
  };

  const handleDeleteLead = (leadId) => {
    if (window.confirm("Supprimer définitivement ce lead ?")) {
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
      alert("La note ne peut pas être vide");
      return;
    }

    if (trimmedMessage.length > 5000) {
      alert("La note est trop longue (max 5000 caractères)");
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

  return (
    <div>
      <div className="admin-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-kpi">
          <div className="admin-kpi-label">Leads total</div>
          <div className="admin-kpi-value">{stats.total}</div>
        </div>
        <div className="admin-kpi">
          <div className="admin-kpi-label">Nouveaux</div>
          <div className="admin-kpi-value">{stats.new}</div>
        </div>
        <div className="admin-kpi">
          <div className="admin-kpi-label">En attente</div>
          <div className="admin-kpi-value">{stats.waiting}</div>
        </div>
        <div className="admin-kpi">
          <div className="admin-kpi-label">Convertis</div>
          <div className="admin-kpi-value">{stats.converted}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <button onClick={() => setShowForm((value) => !value)} className="admin-btn">
          Nouveau lead
        </button>
        <button onClick={handleExport} className="admin-btn-secondary">
          Export CSV
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddLead} className="admin-card" style={{ marginBottom: "1.5rem" }}>
          <h3 className="admin-h3" style={{ marginTop: 0 }}>Ajouter une demande</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            <input type="text" placeholder="Nom complet" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="admin-input" />
            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="admin-input" />
            <input type="tel" placeholder="Téléphone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="admin-input" />
            <input type="text" placeholder="Pays" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="admin-input" />
            <input type="text" placeholder="Ville" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="admin-input" />
            <select value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })} className="admin-select">
              <option value="">Type d'événement</option>
              {eventTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <input type="date" value={formData.eventDate} onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })} className="admin-input" />
            <input type="number" min="0" placeholder="Invités" value={formData.guestCount} onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })} className="admin-input" />
            <input type="number" min="0" placeholder="Budget estimé" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="admin-input" />
            <select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} className="admin-select">
              {sources.map((source) => <option key={source} value={source}>{source}</option>)}
            </select>
          </div>
          <textarea placeholder="Notes internes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="admin-textarea" style={{ marginBottom: "1rem" }} />
          <button type="submit" className="admin-btn">Enregistrer</button>
        </form>
      )}

      <div style={{ display: "grid", gridTemplateColumns: selectedLead ? "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" : "1fr", gap: "1rem", alignItems: "start" }}>
        <div className="admin-card">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
            <input className="admin-input" placeholder="Rechercher nom, téléphone, pays, source..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tous statuts</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <select className="admin-select" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
              <option value="all">Tous événements</option>
              {eventTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Origine</th>
                  <th>Statut</th>
                  <th>Événement</th>
                  <th>Dernière action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    style={{ cursor: "pointer", background: selectedLead?.id === lead.id ? "rgba(184,151,62,0.1)" : "transparent" }}>
                    <td data-label="Contact">
                      <strong>{lead.name}</strong>
                      <div className="admin-small">{lead.phone || lead.email}</div>
                    </td>
                    <td data-label="Origine">
                      {lead.source || "Direct"}
                      <div className="admin-small">{[lead.city, lead.country].filter(Boolean).join(", ") || "-"}</div>
                    </td>
                    <td data-label="Statut">
                      <span style={{ ...statusTone(lead.status), padding: "0.3rem 0.6rem", borderRadius: "4px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {lead.status}
                      </span>
                    </td>
                    <td data-label="Événement">{lead.eventType || "-"}</td>
                    <td data-label="Dernière action">{formatDateTime(lead.updatedAt || lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--gnz-text-secondary)" }}>
              Aucun lead ne correspond aux filtres.
            </div>
          )}
        </div>

        {selectedLead && (
          <aside className="admin-card" style={{ height: "fit-content" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "start" }}>
              <div>
                <h3 className="admin-h3" style={{ margin: "0 0 0.2rem" }}>{selectedLead.name}</h3>
                <p className="admin-small" style={{ margin: 0 }}>{[selectedLead.city, selectedLead.country].filter(Boolean).join(", ") || "Localisation non renseignée"}</p>
              </div>
              <button className="admin-btn-secondary" onClick={() => setSelectedLead(null)} style={{ padding: "0.6rem 0.8rem" }}>Fermer</button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", margin: "1rem 0" }}>
              {selectedLead.email && <a className="admin-btn-secondary" href={`mailto:${selectedLead.email}`} style={{ textDecoration: "none" }}>Email</a>}
              {phoneDigits && <a className="admin-btn-secondary" href={`tel:${phoneDigits}`} style={{ textDecoration: "none" }}>Appeler</a>}
              {phoneDigits && <a className="admin-btn-secondary" href={`https://wa.me/${phoneDigits.replace(/^\+/, "")}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>WhatsApp</a>}
            </div>

            <div style={{ fontSize: "0.875rem", lineHeight: "1.8", marginBottom: "1.2rem" }}>
              <p><strong>Email:</strong> {selectedLead.email}</p>
              <p><strong>Téléphone:</strong> {selectedLead.phone || "-"}</p>
              <p><strong>Événement:</strong> {selectedLead.eventType || "-"}</p>
              <p><strong>Date:</strong> {selectedLead.eventDate || "-"}</p>
              <p><strong>Invités:</strong> {selectedLead.guestCount || "-"}</p>
              <p><strong>Budget:</strong> {selectedLead.budget || "-"}</p>
              <p><strong>Source:</strong> {selectedLead.source || "Direct"}</p>
              <p><strong>Créé:</strong> {formatDateTime(selectedLead.createdAt)}</p>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Statut</label>
              <select value={selectedLead.status} onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)} className="admin-select">
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>

            <form onSubmit={handleAddMessage} style={{ marginBottom: "1rem" }}>
              <label className="admin-label">Historique</label>
              <textarea placeholder="Ajouter une note de suivi..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={3} className="admin-textarea" style={{ margin: "0.5rem 0" }} />
              <button type="submit" className="admin-btn-secondary" style={{ width: "100%" }}>Ajouter la note</button>
            </form>

            <div style={{ marginBottom: "1rem", maxHeight: "220px", overflow: "auto" }}>
              {(selectedLead.interactions || []).slice().reverse().map((item) => (
                <div key={item.id} style={{ fontSize: "0.78rem", marginBottom: "0.7rem", paddingBottom: "0.7rem", borderBottom: "1px solid var(--gnz-border-light)", color: "var(--gnz-text-secondary)" }}>
                  <div style={{ color: "var(--gnz-gold)", marginBottom: "0.25rem" }}>{formatDateTime(item.timestamp)}</div>
                  <div>{item.message}</div>
                </div>
              ))}
              {(selectedLead.interactions || []).length === 0 && <p className="admin-small">Aucune note pour ce contact.</p>}
            </div>

            <button onClick={() => handleDeleteLead(selectedLead.id)} className="admin-btn-danger" style={{ width: "100%" }}>
              Supprimer le lead
            </button>
          </aside>
        )}
      </div>
    </div>
  );
};

export default AdminCRM;
