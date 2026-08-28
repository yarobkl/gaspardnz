import { useEffect, useMemo, useState } from "react";
import { addLeadNote, listLeads, updateLead } from "../../services/adminData.js";
import "../../styles/admin-v2.css";

const STATUS = [
  ["new", "Nouveau"], ["contacted", "Contacté"], ["qualified", "Qualifié"], ["appointment", "RDV"], ["client", "Client"], ["lost", "Perdu"], ["archived", "Archivé"],
];
const fmtDate = (value) => value ? new Date(value).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

const AdminCRM = () => {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = async () => {
    setLoading(true);
    try { setLeads(await listLeads({ status, search, limit: 200 })); setError(""); }
    catch (e) { setError(e?.message || "Impossible de charger le CRM."); }
    finally { setLoading(false); }
  };
  useEffect(() => { const t = setTimeout(load, 180); return () => clearTimeout(t); }, [status, search]);

  const stats = useMemo(() => Object.fromEntries(STATUS.map(([key]) => [key, leads.filter((l) => l.status === key).length])), [leads]);

  const patch = async (id, values) => {
    try {
      const updated = await updateLead(id, values);
      setLeads((rows) => rows.map((row) => row.id === id ? { ...row, ...updated } : row));
      if (selected?.id === id) setSelected((current) => ({ ...current, ...updated }));
      setToast("Modification enregistrée en temps réel.");
      setTimeout(() => setToast(""), 2200);
    } catch (e) { setError(e?.message || "Modification impossible."); }
  };

  const addNote = async () => {
    if (!selected || !note.trim()) return;
    try { await addLeadNote(selected.id, note.trim()); setNote(""); setToast("Note ajoutée au dossier."); setTimeout(() => setToast(""), 2200); }
    catch (e) { setError(e?.message || "Impossible d'ajouter la note."); }
  };

  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const rows = [["Nom","Email","Téléphone","Besoin","Source","Canal","Statut","Valeur estimée","Créé le"], ...leads.map((l) => [l.full_name,l.email,l.phone,l.request_type,l.source,l.channel,l.status,l.estimated_value,l.created_at])];
    const blob = new Blob(["\uFEFF" + rows.map((r) => r.map(esc).join(";")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `gaspardnz-crm-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="gnz-page-heading"><div><h1>CRM</h1><p>Chaque demande réelle du site devient un prospect exploitable ici.</p></div><div className="gnz-page-actions"><button className="gnz-secondary-button" onClick={exportCsv}>Exporter CSV</button><button className="gnz-secondary-button" onClick={load}>Actualiser</button></div></div>
      {error && <div className="gnz-alert gnz-alert-error">{error}</div>}

      <div className="gnz-kpi-grid" style={{ marginBottom: 12 }}>
        <article className="gnz-kpi-card"><span className="gnz-kpi-label">Prospects affichés</span><div className="gnz-kpi-value">{leads.length}</div><div className="gnz-kpi-sub">Filtre actuel</div></article>
        <article className="gnz-kpi-card"><span className="gnz-kpi-label">Nouveaux</span><div className="gnz-kpi-value">{stats.new || 0}</div><div className="gnz-kpi-sub">À traiter</div></article>
        <article className="gnz-kpi-card"><span className="gnz-kpi-label">RDV</span><div className="gnz-kpi-value">{stats.appointment || 0}</div><div className="gnz-kpi-sub">Prospects au stade rendez-vous</div></article>
        <article className="gnz-kpi-card"><span className="gnz-kpi-label">Clients</span><div className="gnz-kpi-value">{stats.client || 0}</div><div className="gnz-kpi-sub">Prospects transformés</div></article>
      </div>

      <div className="gnz-toolbar"><input className="gnz-input" placeholder="Rechercher nom, email, téléphone…" value={search} onChange={(e) => setSearch(e.target.value)} /><select className="gnz-select" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Tous les statuts</option>{STATUS.map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></div>

      <div className="gnz-split">
        <article className="gnz-card">
          <div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Prospect</th><th>Besoin</th><th>Source</th><th>Statut</th><th>Valeur</th><th>Créé</th></tr></thead><tbody>
            {loading ? <tr><td colSpan="6"><div className="gnz-empty-state">Chargement…</div></td></tr> : leads.length ? leads.map((lead) => <tr key={lead.id} onClick={() => setSelected(lead)} style={{ cursor: "pointer" }}><td><strong>{lead.full_name || "Sans nom"}</strong><span className="gnz-table-sub">{lead.email || lead.phone || "—"}</span></td><td>{lead.request_type || "Demande"}</td><td>{lead.source || lead.channel || "Site"}</td><td><span className={`gnz-status ${lead.status}`}>{STATUS.find(([k]) => k === lead.status)?.[1] || lead.status}</span></td><td>{lead.estimated_value ? `${Number(lead.estimated_value).toLocaleString("fr-FR")} €` : "—"}</td><td>{fmtDate(lead.created_at)}</td></tr>) : <tr><td colSpan="6"><div className="gnz-empty-state">Aucun prospect ne correspond à ce filtre.</div></td></tr>}
          </tbody></table></div>
        </article>

        <aside className="gnz-card gnz-editor">
          <header className="gnz-card-header"><div className="gnz-card-title"><strong>{selected ? selected.full_name || "Prospect" : "Fiche prospect"}</strong><span>{selected ? `Créé ${fmtDate(selected.created_at)}` : "Sélectionnez une ligne du CRM"}</span></div></header>
          <div className="gnz-card-body">{selected ? <div className="gnz-editor-grid">
            <label className="gnz-field">Statut<select className="gnz-select" value={selected.status} onChange={(e) => patch(selected.id, { status: e.target.value })}>{STATUS.map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
            <label className="gnz-field">Nom<input className="gnz-input" value={selected.full_name || ""} onChange={(e) => setSelected({ ...selected, full_name: e.target.value })} onBlur={() => patch(selected.id, { full_name: selected.full_name || null })} /></label>
            <label className="gnz-field">Email<input className="gnz-input" type="email" value={selected.email || ""} onChange={(e) => setSelected({ ...selected, email: e.target.value })} onBlur={() => patch(selected.id, { email: selected.email || null })} /></label>
            <label className="gnz-field">Téléphone<input className="gnz-input" value={selected.phone || ""} onChange={(e) => setSelected({ ...selected, phone: e.target.value })} onBlur={() => patch(selected.id, { phone: selected.phone || null })} /></label>
            <label className="gnz-field">Valeur estimée (€)<input className="gnz-input" type="number" min="0" value={selected.estimated_value ?? ""} onChange={(e) => setSelected({ ...selected, estimated_value: e.target.value })} onBlur={() => patch(selected.id, { estimated_value: selected.estimated_value === "" ? null : Number(selected.estimated_value) })} /></label>
            <label className="gnz-field">Message<textarea className="gnz-textarea" value={selected.message || ""} onChange={(e) => setSelected({ ...selected, message: e.target.value })} onBlur={() => patch(selected.id, { message: selected.message || null })} /></label>
            <label className="gnz-field">Ajouter une note<textarea className="gnz-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Compte rendu d'appel, demande particulière…" /></label>
            <button className="gnz-primary-button" onClick={addNote} disabled={!note.trim()}>Ajouter la note</button>
          </div> : <div className="gnz-empty-state">Cliquez sur un prospect pour modifier son dossier.</div>}</div>
        </aside>
      </div>
      {toast && <div className="gnz-toast">{toast}</div>}
    </div>
  );
};

export default AdminCRM;
