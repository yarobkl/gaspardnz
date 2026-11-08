import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient.js";
import "../../styles/admin-v2.css";

const DEFAULT_SLOTS = "10:00,12:00,14:00,16:00,18:00";
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());

export default function AdminAvailability() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ service_date: today(), max_clients: 1, slots: DEFAULT_SLOTS, is_open: true, notes: "" });
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = async () => {
    const { data } = await supabase.auth.getSession();
    const response = await fetch(`/api/booking?route=availability&from=${today()}`, { headers: { Authorization: `Bearer ${data?.session?.access_token || ""}` } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Impossible de charger les disponibilités");
    setRows(payload.availability || []);
  };
  useEffect(() => { load().catch((e) => setError(e.message)); }, []);

  const save = async (event) => {
    event.preventDefault(); setError("");
    try {
      const { data } = await supabase.auth.getSession();
      const response = await fetch("/api/booking?route=availability", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data?.session?.access_token || ""}` }, body: JSON.stringify({ ...form, max_clients: Number(form.max_clients), slots: form.slots.split(",").map((slot) => slot.trim()).filter(Boolean) }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Enregistrement impossible");
      setToast("Disponibilité enregistrée."); setTimeout(() => setToast(""), 2200); await load();
    } catch (e) { setError(e.message); }
  };

  return <div>
    <div className="gnz-page-heading"><div><h1>Disponibilités showroom</h1><p>Définissez chaque mois les jours ouverts, les horaires et le nombre maximum de clients par jour.</p></div></div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
    <div className="gnz-section-grid">
      <article className="gnz-card gnz-col-6"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Ajouter ou modifier un jour</strong><span>Une journée complète se ferme automatiquement.</span></div></header><form className="gnz-card-body gnz-editor-grid" onSubmit={save}>
        <label className="gnz-field">Date<input className="gnz-input" type="date" value={form.service_date} onChange={(e) => setForm({ ...form, service_date: e.target.value })} required /></label>
        <label className="gnz-field">Nombre maximum de clients<input className="gnz-input" type="number" min="1" max="100" value={form.max_clients} onChange={(e) => setForm({ ...form, max_clients: e.target.value })} required /></label>
        <label className="gnz-field" style={{ gridColumn: "1 / -1" }}>Créneaux horaires<span className="gnz-table-sub">Séparez les horaires par des virgules.</span><input className="gnz-input" value={form.slots} onChange={(e) => setForm({ ...form, slots: e.target.value })} placeholder={DEFAULT_SLOTS} required /></label>
        <label className="gnz-field" style={{ gridColumn: "1 / -1" }}>Note interne<textarea className="gnz-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Ex. journée réservée aux essayages mariage" /></label>
        <label className="gnz-field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><input type="checkbox" checked={form.is_open} onChange={(e) => setForm({ ...form, is_open: e.target.checked })} /> Journée ouverte à la réservation</label>
        <button className="gnz-primary-button" type="submit">Enregistrer la disponibilité</button>
      </form></article>
      <article className="gnz-card gnz-col-6"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Calendrier configuré</strong><span>{rows.length} jour(s) enregistré(s)</span></div></header><div className="gnz-card-body"><div className="gnz-activity-list">{rows.length ? rows.map((row) => <button key={row.id} type="button" className="gnz-activity-item" onClick={() => setForm({ service_date: row.service_date, max_clients: row.max_clients, slots: (row.slots || []).join(","), is_open: row.is_open, notes: row.notes || "" })}><span className="gnz-activity-bullet"/><div className="gnz-activity-copy"><strong>{new Date(`${row.service_date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</strong><span>{row.is_open ? `${row.max_clients} client(s) · ${(row.slots || []).join(" · ")}` : "Fermé"}</span></div><span className={`gnz-status ${row.is_open ? "success" : "warning"}`}>{row.is_open ? "Ouvert" : "Fermé"}</span></button>) : <div className="gnz-empty-state">Aucune disponibilité configurée.</div>}</div></div></article>
    </div>
    {toast && <div className="gnz-toast">{toast}</div>}
  </div>;
}
