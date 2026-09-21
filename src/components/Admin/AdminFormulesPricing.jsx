import { useEffect, useState } from "react";
import {
  createPackageGroup, createPackageItem, deletePackageGroup, deletePackageItem,
  listArticleLabels, listPackagesWithBreakdown, restorePackage, softDeletePackage,
  subscribePackagePricing, sumGroupItems, sumPackageTotal, updatePackageGroup,
  updatePackageItem, upsertRow,
} from "../../services/adminData.js";
import "../../styles/admin-v2.css";

const slugify = (value) => String(value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
const emptyPackage = { slug: "", name: "", subtitle: "", description: "", cta_label: "Réserver", published: true };
const fmt = (n) => `${Number(n || 0).toLocaleString("fr-FR")} €`;

// Le total ne se saisit jamais : sumGroupItems/sumPackageTotal (adminData.js)
// somment toujours les articles réellement enregistrés, donc résumé et
// détail ne peuvent plus jamais se contredire (voir l'incident du 349€/474€).
export default function AdminFormulesPricing() {
  const [packages, setPackages] = useState([]);
  const [labels, setLabels] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [newForm, setNewForm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [pkgs, lbls] = await Promise.all([listPackagesWithBreakdown(), listArticleLabels()]);
      setPackages(pkgs);
      setLabels(lbls);
      setError("");
    } catch (e) { setError(e?.message || "Impossible de charger les formules."); }
  };
  useEffect(() => { load(); return subscribePackagePricing(load); }, []);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };
  const guard = async (fn, okMsg) => {
    setBusy(true); setError("");
    try { await fn(); await load(); if (okMsg) flash(okMsg); }
    catch (e) { setError(e?.message || "Action impossible."); }
    finally { setBusy(false); }
  };

  const createNewPackage = (e) => {
    e.preventDefault();
    guard(async () => {
      const row = { ...newForm, slug: newForm.slug || slugify(newForm.name) };
      await upsertRow("packages", row, "slug");
    }, "Formule créée.").then(() => setNewForm(null));
  };

  const active = packages.filter((p) => !p.deleted_at);
  const trashed = packages.filter((p) => p.deleted_at);

  return <div>
    <datalist id="gnz-article-labels">{labels.map((l) => <option key={l} value={l} />)}</datalist>
    <div className="gnz-page-heading">
      <div><h1>Formules</h1><p>Menus, articles et prix : le sous-total et le total se calculent tout seuls.</p></div>
      <button className="gnz-primary-button" onClick={() => setNewForm({ ...emptyPackage })} disabled={busy}>+ Nouvelle formule</button>
    </div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}

    {newForm && <article className="gnz-card" style={{ marginBottom: 16 }}>
      <header className="gnz-card-header"><div className="gnz-card-title"><strong>Nouvelle formule</strong></div></header>
      <form className="gnz-card-body gnz-editor-grid" onSubmit={createNewPackage}>
        <label className="gnz-field">Nom<input className="gnz-input" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} required /></label>
        <label className="gnz-field">Sous-titre<input className="gnz-input" value={newForm.subtitle} onChange={(e) => setNewForm({ ...newForm, subtitle: e.target.value })} /></label>
        <label className="gnz-field">Description<textarea className="gnz-textarea" value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })} /></label>
        <label className="gnz-field">Texte du bouton<input className="gnz-input" value={newForm.cta_label} onChange={(e) => setNewForm({ ...newForm, cta_label: e.target.value })} /></label>
        <label className="gnz-checkbox"><input type="checkbox" checked={newForm.published} onChange={(e) => setNewForm({ ...newForm, published: e.target.checked })} />Visible sur le site</label>
        <div className="gnz-editor-actions"><button type="button" className="gnz-secondary-button" onClick={() => setNewForm(null)}>Annuler</button><button className="gnz-primary-button" disabled={busy}>Créer</button></div>
      </form>
    </article>}

    <div style={{ display: "grid", gap: 14 }}>
      {active.length === 0 && !newForm && <div className="gnz-card"><div className="gnz-empty-state">Aucune formule. Cliquez sur « + Nouvelle formule ».</div></div>}
      {active.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} labels={labels} busy={busy}
          expanded={expanded === pkg.id} onToggle={() => setExpanded(expanded === pkg.id ? null : pkg.id)}
          onSavePackage={(patch) => guard(() => upsertRow("packages", { id: pkg.id, slug: pkg.slug, ...patch }, "slug"), "Formule mise à jour.")}
          onTrash={() => guard(() => softDeletePackage(pkg.id), "Formule mise à la corbeille, restaurable ci-dessous.")}
          onAddGroup={(label, tag) => guard(() => createPackageGroup(pkg.id, { label, tag, sortOrder: pkg.package_groups?.length || 0 }))}
          onUpdateGroup={(id, patch) => guard(() => updatePackageGroup(id, patch))}
          onDeleteGroup={(id) => guard(() => deletePackageGroup(id))}
          onAddItem={(groupId, item, sortOrder) => guard(() => createPackageItem(groupId, { ...item, sortOrder }))}
          onUpdateItem={(id, patch) => guard(() => updatePackageItem(id, patch))}
          onDeleteItem={(id) => guard(() => deletePackageItem(id))}
        />
      ))}
    </div>

    {trashed.length > 0 && <article className="gnz-card" style={{ marginTop: 20 }}>
      <header className="gnz-card-header"><div className="gnz-card-title"><strong>Corbeille</strong><span>{trashed.length} formule{trashed.length > 1 ? "s" : ""} supprimée{trashed.length > 1 ? "s" : ""}</span></div></header>
      <div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Nom</th><th>Total</th><th>Action</th></tr></thead><tbody>
        {trashed.map((pkg) => <tr key={pkg.id}><td><strong>{pkg.name}</strong></td><td>{fmt(sumPackageTotal(pkg))}</td>
          <td><button className="gnz-secondary-button" disabled={busy} onClick={() => guard(() => restorePackage(pkg.id), "Formule restaurée.")}>Restaurer</button></td></tr>)}
      </tbody></table></div>
    </article>}

    {toast && <div className="gnz-toast">{toast}</div>}
  </div>;
}

function PackageCard({ pkg, busy, expanded, onToggle, onSavePackage, onTrash, onAddGroup, onUpdateGroup, onDeleteGroup, onAddItem, onUpdateItem, onDeleteItem }) {
  const [editingHeader, setEditingHeader] = useState(false);
  const [headerForm, setHeaderForm] = useState(null);
  const [newGroupLabel, setNewGroupLabel] = useState("");
  const [newGroupTag, setNewGroupTag] = useState("");

  const total = sumPackageTotal(pkg);

  const startEdit = () => {
    setHeaderForm({ name: pkg.name, subtitle: pkg.subtitle || "", description: pkg.description || "", cta_label: pkg.cta_label || "", published: pkg.published });
    setEditingHeader(true);
  };
  const saveEdit = (e) => { e.preventDefault(); onSavePackage(headerForm); setEditingHeader(false); };

  const addGroup = (e) => {
    e.preventDefault();
    if (!newGroupLabel.trim()) return;
    onAddGroup(newGroupLabel.trim(), newGroupTag.trim() || null);
    setNewGroupLabel(""); setNewGroupTag("");
  };

  return <article className="gnz-card">
    <header className="gnz-card-header">
      <button type="button" aria-expanded={expanded} onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, flex: 1 }}>
        <div className="gnz-card-title">
          <strong>{pkg.name}</strong>
          <span>{pkg.package_groups?.length ? `${fmt(total)} · ${pkg.published ? "Publié" : "Masqué"}` : `Aucun menu · ${pkg.published ? "Publié" : "Masqué"}`}</span>
        </div>
      </button>
      <div className="gnz-page-actions">
        <button className="gnz-secondary-button" onClick={startEdit} disabled={busy}>Modifier</button>
        <button className="gnz-danger-button" disabled={busy} onClick={() => { if (window.confirm(`Mettre "${pkg.name}" à la corbeille ? Vous pourrez la restaurer ensuite.`)) onTrash(); }}>Corbeille</button>
      </div>
    </header>

    {editingHeader && <form className="gnz-card-body gnz-editor-grid" onSubmit={saveEdit}>
      <label className="gnz-field">Nom<input className="gnz-input" value={headerForm.name} onChange={(e) => setHeaderForm({ ...headerForm, name: e.target.value })} required /></label>
      <label className="gnz-field">Sous-titre<input className="gnz-input" value={headerForm.subtitle} onChange={(e) => setHeaderForm({ ...headerForm, subtitle: e.target.value })} /></label>
      <label className="gnz-field">Description<textarea className="gnz-textarea" value={headerForm.description} onChange={(e) => setHeaderForm({ ...headerForm, description: e.target.value })} /></label>
      <label className="gnz-field">Texte du bouton<input className="gnz-input" value={headerForm.cta_label} onChange={(e) => setHeaderForm({ ...headerForm, cta_label: e.target.value })} /></label>
      <label className="gnz-checkbox"><input type="checkbox" checked={headerForm.published} onChange={(e) => setHeaderForm({ ...headerForm, published: e.target.checked })} />Visible sur le site</label>
      <div className="gnz-editor-actions"><button type="button" className="gnz-secondary-button" onClick={() => setEditingHeader(false)}>Annuler</button><button className="gnz-primary-button">Enregistrer</button></div>
    </form>}

    {expanded && <div className="gnz-card-body">
      {(pkg.package_groups || []).map((group) => (
        <GroupEditor key={group.id} group={group} busy={busy}
          onUpdateGroup={(patch) => onUpdateGroup(group.id, patch)}
          onDeleteGroup={() => { if (window.confirm(`Supprimer le menu "${group.label}" et ses articles ?`)) onDeleteGroup(group.id); }}
          onAddItem={(item) => onAddItem(group.id, item, group.package_items?.length || 0)}
          onUpdateItem={onUpdateItem}
          onDeleteItem={onDeleteItem}
        />
      ))}

      <form className="gnz-pricing-add-group" onSubmit={addGroup}>
        <input className="gnz-input" placeholder="Nom du menu (ex. Look Mairie)" value={newGroupLabel} onChange={(e) => setNewGroupLabel(e.target.value)} />
        <input className="gnz-input" placeholder="Étiquette optionnelle (ex. Smoking)" value={newGroupTag} onChange={(e) => setNewGroupTag(e.target.value)} />
        <button className="gnz-secondary-button" disabled={busy}>+ Ajouter un menu</button>
      </form>

      <div className="gnz-pricing-total"><span>Total de la formule</span><strong>{fmt(total)}</strong></div>
    </div>}
  </article>;
}

function GroupEditor({ group, busy, onUpdateGroup, onDeleteGroup, onAddItem, onUpdateItem, onDeleteItem }) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(group.label);
  const [tagDraft, setTagDraft] = useState(group.tag || "");
  const subtotal = sumGroupItems(group);

  const saveLabel = () => { onUpdateGroup({ label: labelDraft, tag: tagDraft || null }); setEditingLabel(false); };

  return <div className="gnz-pricing-group">
    <div className="gnz-pricing-group-header">
      {editingLabel
        ? <div className="gnz-pricing-group-edit">
            <input className="gnz-input" value={labelDraft} onChange={(e) => setLabelDraft(e.target.value)} placeholder="Nom du menu" />
            <input className="gnz-input" value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} placeholder="Étiquette" />
            <button type="button" className="gnz-secondary-button" onClick={saveLabel}>OK</button>
          </div>
        : <strong onClick={() => setEditingLabel(true)} style={{ cursor: "pointer" }} title="Cliquer pour modifier">{group.label}{group.tag ? ` · ${group.tag}` : ""}</strong>}
      <div className="gnz-page-actions">
        <span className="gnz-status">Sous-total · {fmt(subtotal)}</span>
        <button className="gnz-secondary-button" disabled={busy} onClick={onDeleteGroup}>Supprimer le menu</button>
      </div>
    </div>

    {(group.package_items || []).map((item) => (
      <ItemRow key={item.id} item={item} busy={busy} onUpdate={(patch) => onUpdateItem(item.id, patch)} onDelete={() => onDeleteItem(item.id)} />
    ))}

    <AddItemRow busy={busy} onAdd={onAddItem} />
  </div>;
}

function ItemRow({ item, busy, onUpdate, onDelete }) {
  const [label, setLabel] = useState(item.label);
  const [price, setPrice] = useState(item.price ?? "");
  const priceIsFrom = item.price_is_from;

  return <div className="gnz-pricing-item">
    <input className="gnz-input" list="gnz-article-labels" value={label} onChange={(e) => setLabel(e.target.value)}
      onBlur={() => { if (label.trim() && label !== item.label) onUpdate({ label: label.trim() }); }} disabled={busy} />
    <input className="gnz-input" type="number" min="0" placeholder="Prix" value={price} onChange={(e) => setPrice(e.target.value)}
      onBlur={() => { const num = price === "" ? null : Number(price); if (num !== item.price) onUpdate({ price: num }); }} disabled={busy} />
    <label className="gnz-checkbox"><input type="checkbox" checked={priceIsFrom} onChange={(e) => onUpdate({ price_is_from: e.target.checked })} disabled={busy} />à partir de</label>
    <button type="button" className="gnz-secondary-button" onClick={onDelete} disabled={busy}>Retirer</button>
  </div>;
}

function AddItemRow({ busy, onAdd }) {
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("");
  const [priceIsFrom, setPriceIsFrom] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    onAdd({ label: label.trim(), price: price === "" ? null : Number(price), priceIsFrom });
    setLabel(""); setPrice(""); setPriceIsFrom(false);
  };

  return <form className="gnz-pricing-item gnz-pricing-item-add" onSubmit={submit}>
    <input className="gnz-input" list="gnz-article-labels" placeholder="Nom de l'article" value={label} onChange={(e) => setLabel(e.target.value)} disabled={busy} />
    <input className="gnz-input" type="number" min="0" placeholder="Prix" value={price} onChange={(e) => setPrice(e.target.value)} disabled={busy} />
    <label className="gnz-checkbox"><input type="checkbox" checked={priceIsFrom} onChange={(e) => setPriceIsFrom(e.target.checked)} disabled={busy} />à partir de</label>
    <button className="gnz-secondary-button" disabled={busy}>+ Ajouter un article</button>
  </form>;
}
