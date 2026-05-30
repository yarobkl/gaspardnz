import { useEffect, useState } from "react";
import { createLead, getAllLeads, updateLead, deleteLead, addInteraction, exportLeadsCSV } from "../../services/adminCRM.js";

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
    const result = createLead(formData);
    if (result.success) {
      setFormData({ name: "", email: "", phone: "", eventType: "", eventDate: "", guestCount: "", budget: "", notes: "" });
      setShowForm(false);
      loadLeads();
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
    if (selectedLead && newMessage.trim()) {
      addInteraction(selectedLead.id, "note", newMessage);
      setNewMessage("");
      const updatedLeads = getAllLeads();
      const updated = updatedLeads.find((l) => l.id === selectedLead.id);
      setSelectedLead(updated);
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
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "0.8rem 1.4rem",
              background: "#b8973e",
              border: "none",
              borderRadius: "4px",
              color: "#0a0602",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
              cursor: "pointer",
            }}>
            + Nouveau Lead
          </button>
          <button
            onClick={handleExport}
            style={{
              padding: "0.8rem 1.4rem",
              background: "rgba(184,151,62,0.1)",
              border: "1px solid rgba(184,151,62,0.3)",
              borderRadius: "4px",
              color: "#b8973e",
              fontSize: "12px",
              cursor: "pointer",
            }}>
            Exporter CSV
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleAddLead}
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(184,151,62,0.2)",
              borderRadius: "8px",
              padding: "1.6rem",
              marginBottom: "2rem",
            }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Nom"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{
                  padding: "0.6rem",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(184,151,62,0.2)",
                  borderRadius: "4px",
                  color: "#faf7f2",
                  fontSize: "12px",
                }}
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{
                  padding: "0.6rem",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(184,151,62,0.2)",
                  borderRadius: "4px",
                  color: "#faf7f2",
                  fontSize: "12px",
                }}
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  padding: "0.6rem",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(184,151,62,0.2)",
                  borderRadius: "4px",
                  color: "#faf7f2",
                  fontSize: "12px",
                }}
              />
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                style={{
                  padding: "0.6rem",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(184,151,62,0.2)",
                  borderRadius: "4px",
                  color: "#faf7f2",
                  fontSize: "12px",
                }}>
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
                style={{
                  padding: "0.6rem",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(184,151,62,0.2)",
                  borderRadius: "4px",
                  color: "#faf7f2",
                  fontSize: "12px",
                }}
              />
              <input
                type="number"
                placeholder="Budget"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                style={{
                  padding: "0.6rem",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(184,151,62,0.2)",
                  borderRadius: "4px",
                  color: "#faf7f2",
                  fontSize: "12px",
                }}
              />
            </div>
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              style={{
                width: "100%",
                padding: "0.6rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(184,151,62,0.2)",
                borderRadius: "4px",
                color: "#faf7f2",
                fontSize: "12px",
                marginBottom: "1rem",
                boxSizing: "border-box",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.6rem 1.2rem",
                background: "#b8973e",
                border: "none",
                borderRadius: "4px",
                color: "#0a0602",
                fontSize: "12px",
                cursor: "pointer",
              }}>
              Ajouter Lead
            </button>
          </form>
        )}

        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(184,151,62,0.2)",
            borderRadius: "8px",
            overflow: "hidden",
          }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(184,151,62,0.1)", background: "rgba(0,0,0,0.5)" }}>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "12px", color: "#b8973e" }}>Nom</th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "12px", color: "#b8973e" }}>Email</th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "12px", color: "#b8973e" }}>Statut</th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "12px", color: "#b8973e" }}>Événement</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  style={{
                    borderBottom: "1px solid rgba(184,151,62,0.1)",
                    cursor: "pointer",
                    background: selectedLead?.id === lead.id ? "rgba(184,151,62,0.1)" : "transparent",
                  }}>
                  <td style={{ padding: "1rem", fontSize: "13px" }}>{lead.name}</td>
                  <td style={{ padding: "1rem", fontSize: "13px", color: "rgba(250,247,242,0.7)" }}>{lead.email}</td>
                  <td style={{ padding: "1rem", fontSize: "12px" }}>
                    <span
                      style={{
                        padding: "0.3rem 0.6rem",
                        background: lead.status === "converti" ? "rgba(92,175,45,0.2)" : "rgba(184,151,62,0.2)",
                        color: lead.status === "converti" ? "#5caf2d" : "#b8973e",
                        borderRadius: "3px",
                      }}>
                      {lead.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", fontSize: "13px" }}>{lead.eventType}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && (
            <div style={{ padding: "2rem", textAlign: "center", color: "rgba(250,247,242,0.4)" }}>
              Aucun lead pour le moment
            </div>
          )}
        </div>
      </div>

      {selectedLead && (
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(184,151,62,0.2)",
            borderRadius: "8px",
            padding: "1.4rem",
            height: "fit-content",
          }}>
          <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 0 }}>
            {selectedLead.name}
          </h3>
          <div style={{ fontSize: "12px", lineHeight: "1.8", marginBottom: "1.4rem" }}>
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

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "11px", color: "#b8973e", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
              Statut
            </label>
            <select
              value={selectedLead.status}
              onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(184,151,62,0.2)",
                borderRadius: "4px",
                color: "#faf7f2",
                fontSize: "12px",
                boxSizing: "border-box",
              }}>
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
              style={{
                width: "100%",
                padding: "0.6rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(184,151,62,0.2)",
                borderRadius: "4px",
                color: "#faf7f2",
                fontSize: "12px",
                marginBottom: "0.5rem",
                boxSizing: "border-box",
              }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.5rem",
                background: "rgba(184,151,62,0.2)",
                border: "1px solid rgba(184,151,62,0.3)",
                borderRadius: "4px",
                color: "#b8973e",
                fontSize: "11px",
                cursor: "pointer",
              }}>
              Ajouter Note
            </button>
          </form>

          <div style={{ marginBottom: "1rem", maxHeight: "200px", overflow: "auto" }}>
            {(selectedLead.interactions || []).map((int) => (
              <div key={int.id} style={{ fontSize: "11px", marginBottom: "0.5rem", color: "rgba(250,247,242,0.7)" }}>
                <div style={{ color: "#b8973e" }}>{new Date(int.timestamp).toLocaleString("fr-FR")}</div>
                <div>{int.message}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => handleDeleteLead(selectedLead.id)}
            style={{
              width: "100%",
              padding: "0.6rem",
              background: "rgba(200,50,50,0.1)",
              border: "1px solid rgba(200,50,50,0.3)",
              borderRadius: "4px",
              color: "#ff6b6b",
              fontSize: "12px",
              cursor: "pointer",
            }}>
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCRM;
