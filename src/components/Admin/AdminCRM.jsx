import { useEffect, useState } from "react";
import { createLead, getAllLeads, updateLead, deleteLead, addInteraction, exportLeadsCSV } from "../../services/adminCRM.js";
import "../../styles/admin.css";

const AdminCRM = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    guestCount: "",
    budget: "",
    notes: "",
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = () => {
    setLeads(getAllLeads());
  };

  const handleAddLead = (e) => {
    e.preventDefault();

    const trimmedName = formData.name?.trim();
    const trimmedEmail = formData.email?.trim();

    if (!trimmedName || !trimmedEmail) {
      alert("Nom et email sont obligatoires");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      alert("Email invalide");
      return;
    }

    const result = createLead(formData);
    if (result.success) {
      setFormData({ name: "", email: "", phone: "", eventType: "", eventDate: "", guestCount: "", budget: "", notes: "" });
      setShowForm(false);
      loadLeads();
    } else {
      alert(result.error || "Erreur lors de la création du lead");
    }
  };

  const handleStatusChange = (leadId, newStatus) => {
    updateLead(leadId, { status: newStatus });
    loadLeads();
    setSelectedLead(null);
  };

  const handleDeleteLead = (leadId) => {
    if (window.confirm("Supprimer ce lead ?")) {
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
      alert("Le message ne peut pas être vide");
      return;
    }

    if (trimmedMessage.length > 5000) {
      alert("Le message est trop long (max 5000 caractères)");
      return;
    }

    addInteraction(selectedLead.id, "note", trimmedMessage);
    setNewMessage("");
    const updatedLeads = getAllLeads();
    const updated = updatedLeads.find((l) => l.id === selectedLead.id);
    if (updated) {
      setSelectedLead(updated);
    } else {
      setSelectedLead(null);
    }
  };

  const handleExport = () => {
    const csv = exportLeadsCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads-export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statuses = ["nouveau", "contacté", "intéressé", "converti", "en attente"];
  const eventTypes = ["Mariage", "Gala", "Événement Corporatif", "Cérémonie", "Autre"];

  return (
    <div style={{ display: "grid", gridTemplateColumns: selectedLead ? "1fr 350px" : "1fr", gap: "2rem" }}>
      <div>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <button onClick={() => setShowForm(!showForm)} className="admin-btn">
            + Nouveau Lead
          </button>
          <button onClick={handleExport} className="admin-btn-secondary">
            Exporter CSV
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddLead} className="admin-card" style={{ marginBottom: "2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Nom"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="admin-input"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="admin-input"
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="admin-input"
              />
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="admin-select">
                <option value="">Type d'événement</option>
                {eventTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="admin-input"
              />
              <input
                type="number"
                placeholder="Budget"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="admin-input"
              />
            </div>
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="admin-textarea"
              style={{ marginBottom: "1rem" }}
            />
            <button type="submit" className="admin-btn">
              Ajouter Lead
            </button>
          </form>
        )}

        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Statut</th>
                <th>Événement</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  style={{
                    cursor: "pointer",
                    background: selectedLead?.id === lead.id ? "rgba(184,151,62,0.1)" : "transparent",
                  }}>
                  <td>{lead.name}</td>
                  <td style={{ color: "var(--gnz-text-secondary)" }}>{lead.email}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.3rem 0.6rem",
                        background: lead.status === "converti" ? "rgba(92,175,45,0.2)" : "rgba(184,151,62,0.2)",
                        color: lead.status === "converti" ? "#5caf2d" : "var(--gnz-gold)",
                        borderRadius: "3px",
                        fontSize: "0.75rem",
                      }}>
                      {lead.status}
                    </span>
                  </td>
                  <td>{lead.eventType}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--gnz-text-secondary)" }}>
              Aucun lead pour le moment
            </div>
          )}
        </div>
      </div>

      {selectedLead && (
        <div className="admin-card" style={{ height: "fit-content" }}>
          <h3 className="admin-h3" style={{ marginTop: 0 }}>
            {selectedLead.name}
          </h3>
          <div style={{ fontSize: "0.875rem", lineHeight: "1.8", marginBottom: "1.4rem" }}>
            <p style={{ margin: "0.4rem 0" }}>
              <strong>Email:</strong> {selectedLead.email}
            </p>
            <p style={{ margin: "0.4rem 0" }}>
              <strong>Tel:</strong> {selectedLead.phone || "-"}
            </p>
            <p style={{ margin: "0.4rem 0" }}>
              <strong>Événement:</strong> {selectedLead.eventType || "-"}
            </p>
            <p style={{ margin: "0.4rem 0" }}>
              <strong>Date:</strong> {selectedLead.eventDate || "-"}
            </p>
            <p style={{ margin: "0.4rem 0" }}>
              <strong>Budget:</strong> {selectedLead.budget || "-"}
            </p>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Statut</label>
            <select
              value={selectedLead.status}
              onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
              className="admin-select">
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleAddMessage} style={{ marginBottom: "1rem" }}>
            <textarea
              placeholder="Ajouter une note..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={2}
              className="admin-textarea"
              style={{ marginBottom: "0.5rem" }}
            />
            <button type="submit" className="admin-btn-secondary" style={{ width: "100%" }}>
              Ajouter Note
            </button>
          </form>

          <div style={{ marginBottom: "1rem", maxHeight: "200px", overflow: "auto" }}>
            {(selectedLead.interactions || []).map((int) => (
              <div key={int.id} style={{ fontSize: "0.75rem", marginBottom: "0.5rem", color: "var(--gnz-text-secondary)" }}>
                <div style={{ color: "var(--gnz-gold)" }}>{new Date(int.timestamp).toLocaleString("fr-FR")}</div>
                <div>{int.message}</div>
              </div>
            ))}
          </div>

          <button onClick={() => handleDeleteLead(selectedLead.id)} className="admin-btn-danger" style={{ width: "100%" }}>
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCRM;
