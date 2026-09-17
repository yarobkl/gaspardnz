import { useEffect, useState } from "react";
import {
  createTailoringOrder, listTailoringOrders, listTailors,
  subscribeTailoringOrders, updateTailoringOrderStatus,
} from "../../services/adminData.js";
import {
  MEASUREMENT_FIELDS, MEASUREMENT_GROUPS, ORDER_STATUS_LABELS, ORDER_STATUS_ORDER, measurementUnit,
} from "../../data/tailoringMeasurements.js";
import "../../styles/admin-v2.css";

const emptyForm = { clientName: "", clientPhone: "", clientEmail: "", tailorEmail: "", notes: "", measurements: {} };
const statusClass = { nouvelle: "warning", en_cours: "info", terminee: "success" };

export default function AdminTailoringOrders({ user }) {
  const role = user?.role || user?.permission || "";
  const isCouturier = role === "couturier";

  const [orders, setOrders] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  const load = async () => {
    try { setOrders(await listTailoringOrders()); setError(""); }
    catch (e) { setError(e?.message || "Impossible de charger les commandes."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (isCouturier) return;
    listTailors().then(setTailors).catch(() => {});
  }, [isCouturier]);
  useEffect(() => subscribeTailoringOrders(load), []);

  // Le contenu imprimable reste hors-écran en permanence (voir admin-v2.css) ;
  // on ne fait qu'y charger la commande choisie puis déclencher l'impression.
  useEffect(() => {
    if (!printOrder) return undefined;
    const timer = setTimeout(() => window.print(), 120);
    return () => clearTimeout(timer);
  }, [printOrder]);

  const startCreate = () => { setForm({ ...emptyForm, measurements: {} }); setSelectedId(null); };
  const cancelForm = () => setForm(null);
  const setMeasurement = (key, value) => setForm((f) => ({ ...f, measurements: { ...f.measurements, [key]: value } }));

  const saveForm = async (e) => {
    e.preventDefault();
    if (!form.clientName.trim()) return;
    try {
      await createTailoringOrder(form);
      setForm(null);
      await load();
      flash("Commande créée et transmise au couturier.");
    } catch (err) { setError(err?.message || "Création impossible."); }
  };

  const advanceStatus = async (order, nextStatus) => {
    try {
      await updateTailoringOrderStatus(order.id, nextStatus, order.tailor_notes);
      await load();
      flash(nextStatus === "terminee" ? "Commande marquée terminée — Gaspard est notifié." : "Statut mis à jour.");
    } catch (err) { setError(err?.message || "Mise à jour impossible."); }
  };

  const saveTailorNotes = async (order, notes) => {
    try { await updateTailoringOrderStatus(order.id, order.status, notes); await load(); }
    catch (err) { setError(err?.message || "Enregistrement impossible."); }
  };

  const selected = orders.find((o) => o.id === selectedId) || null;

  return <div>
    <div className="gnz-page-heading">
      <div><h1>Commandes sur-mesure</h1>
        <p>{isCouturier ? "Vos commandes assignées par Gaspard." : "Mesures client transmises au couturier partenaire."}</p>
      </div>
      {!isCouturier && <div className="gnz-page-actions"><button className="gnz-primary-button" onClick={startCreate}>Nouvelle commande</button></div>}
    </div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}

    <div className="gnz-split">
      <article className="gnz-card">
        <header className="gnz-card-header"><div className="gnz-card-title"><strong>Commandes</strong><span>{orders.length} commande{orders.length > 1 ? "s" : ""}</span></div></header>
        <div className="gnz-table-wrap"><table className="gnz-table"><thead><tr>
          <th>Numéro</th><th>Client</th>{!isCouturier && <th>Couturier</th>}<th>Statut</th><th>Créée le</th><th>Action</th>
        </tr></thead><tbody>
          {loading ? <tr><td colSpan={isCouturier ? 5 : 6}><div className="gnz-empty-state">Chargement…</div></td></tr>
          : orders.length ? orders.map((order) => (
            <tr key={order.id}>
              <td><strong>{order.order_number}</strong></td>
              <td>{order.client_name}<span className="gnz-table-sub">{order.client_phone || "—"}</span></td>
              {!isCouturier && <td>{order.tailor_email || "—"}</td>}
              <td><span className={`gnz-status ${statusClass[order.status] || ""}`}>{ORDER_STATUS_LABELS[order.status] || order.status}</span></td>
              <td>{new Date(order.created_at).toLocaleDateString("fr-FR")}</td>
              <td><button className="gnz-secondary-button" onClick={() => { setSelectedId(order.id); setForm(null); }}>Voir</button></td>
            </tr>
          )) : <tr><td colSpan={isCouturier ? 5 : 6}><div className="gnz-empty-state">Aucune commande pour l'instant.</div></td></tr>}
        </tbody></table></div>
      </article>

      <aside className="gnz-card gnz-editor" id="gnz-admin-editor">
        <header className="gnz-card-header"><div className="gnz-card-title"><strong>{form ? "Nouvelle commande" : selected ? selected.order_number : "Détail"}</strong><span>{form ? "Prise de mesures" : selected ? selected.client_name : "Sélectionnez une commande"}</span></div></header>
        <div className="gnz-card-body">
          {form ? (
            <form className="gnz-editor-grid" onSubmit={saveForm}>
              <label className="gnz-field">Nom du client<input className="gnz-input" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required /></label>
              <label className="gnz-field">Téléphone<input className="gnz-input" value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} /></label>
              <label className="gnz-field">Email<input className="gnz-input" type="email" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} /></label>
              <label className="gnz-field">Couturier assigné
                <select className="gnz-select" value={form.tailorEmail} onChange={(e) => setForm({ ...form, tailorEmail: e.target.value })} required>
                  <option value="" disabled>Choisir un couturier</option>
                  {tailors.map((t) => <option key={t.id} value={t.email}>{t.display_name || t.email}</option>)}
                </select>
              </label>
              {MEASUREMENT_GROUPS.map((group) => (
                <div key={group} style={{ gridColumn: "1 / -1", marginTop: 6 }}>
                  <strong style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--gnz-muted-2)" }}>{group}</strong>
                  <div className="gnz-section-grid" style={{ marginTop: 6 }}>
                    {MEASUREMENT_FIELDS.filter((f) => f.group === group).map((f) => (
                      <label key={f.key} className="gnz-field gnz-col-6">{f.label} ({measurementUnit(f)})
                        <input className="gnz-input" type="number" step="0.5" min="0" value={form.measurements[f.key] ?? ""} onChange={(e) => setMeasurement(f.key, e.target.value)} />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <label className="gnz-field">Notes pour le couturier<textarea className="gnz-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
              <div className="gnz-editor-actions"><button type="button" className="gnz-secondary-button" onClick={cancelForm}>Annuler</button><button className="gnz-primary-button">Créer et transmettre</button></div>
            </form>
          ) : selected ? (
            <OrderDetail order={selected} isCouturier={isCouturier} onAdvance={advanceStatus} onSaveNotes={saveTailorNotes} onPrint={() => setPrintOrder(selected)} />
          ) : <div className="gnz-empty-state">Cliquez sur « Voir » pour afficher une commande{!isCouturier ? ", ou « Nouvelle commande » pour en créer une." : "."}</div>}
        </div>
      </aside>
    </div>
    {toast && <div className="gnz-toast">{toast}</div>}

    <PrintSheet order={printOrder} />
  </div>;
}

function OrderDetail({ order, isCouturier, onAdvance, onSaveNotes, onPrint }) {
  const [notes, setNotes] = useState(order.tailor_notes || "");
  useEffect(() => setNotes(order.tailor_notes || ""), [order.id, order.tailor_notes]);
  const currentIndex = ORDER_STATUS_ORDER.indexOf(order.status);

  return <div className="gnz-editor-grid">
    <div><span className="gnz-status success">{order.order_number}</span></div>
    <label className="gnz-field">Client<input className="gnz-input" value={order.client_name} disabled /></label>
    <label className="gnz-field">Téléphone<input className="gnz-input" value={order.client_phone || "—"} disabled /></label>
    {order.notes && <label className="gnz-field">Notes de Gaspard<textarea className="gnz-textarea" value={order.notes} disabled /></label>}

    {MEASUREMENT_GROUPS.map((group) => {
      const fields = MEASUREMENT_FIELDS.filter((f) => f.group === group && order.measurements?.[f.key]);
      if (!fields.length) return null;
      return <div key={group} style={{ gridColumn: "1 / -1" }}>
        <strong style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--gnz-muted-2)" }}>{group}</strong>
        <div className="gnz-table-wrap" style={{ marginTop: 6 }}><table className="gnz-table"><tbody>
          {fields.map((f) => <tr key={f.key}><td>{f.label}</td><td><strong>{order.measurements[f.key]} {measurementUnit(f)}</strong></td></tr>)}
        </tbody></table></div>
      </div>;
    })}

    {isCouturier && <label className="gnz-field">Vos notes de travail<textarea className="gnz-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== (order.tailor_notes || "") && onSaveNotes(order, notes)} /></label>}
    {!isCouturier && order.tailor_notes && <label className="gnz-field">Notes du couturier<textarea className="gnz-textarea" value={order.tailor_notes} disabled /></label>}

    <div className="gnz-editor-actions" style={{ justifyContent: "space-between" }}>
      <button type="button" className="gnz-secondary-button" onClick={onPrint}>Imprimer la fiche</button>
      {isCouturier && currentIndex < ORDER_STATUS_ORDER.length - 1 && (
        <button type="button" className="gnz-primary-button" onClick={() => onAdvance(order, ORDER_STATUS_ORDER[currentIndex + 1])}>
          {order.status === "nouvelle" ? "Commencer" : "Marquer terminée"}
        </button>
      )}
    </div>
  </div>;
}

function PrintSheet({ order }) {
  if (!order) return null;
  const groups = MEASUREMENT_GROUPS
    .map((group) => ({ group, fields: MEASUREMENT_FIELDS.filter((f) => f.group === group && order.measurements?.[f.key]) }))
    .filter((g) => g.fields.length);

  return <div className="gnz-print-sheet">
    <h2>Fiche de mesures — {order.order_number}</h2>
    <p className="gnz-print-meta">Client : {order.client_name}{order.client_phone ? ` · ${order.client_phone}` : ""}<br />Généré le {new Date().toLocaleDateString("fr-FR")}</p>
    {groups.map(({ group, fields }) => (
      <table key={group}><thead><tr><th colSpan={2}>{group}</th></tr></thead><tbody>
        {fields.map((f) => <tr key={f.key}><td>{f.label}</td><td>{order.measurements[f.key]} {measurementUnit(f)}</td></tr>)}
      </tbody></table>
    ))}
    {order.notes && <p><strong>Notes :</strong> {order.notes}</p>}
  </div>;
}
