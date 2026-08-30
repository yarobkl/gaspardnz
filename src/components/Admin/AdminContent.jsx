import { useEffect, useState } from "react";
import { getSiteSettings, listContentTable, saveSiteSetting, upsertRow } from "../../services/adminData.js";
import "../../styles/admin-v2.css";

const slugify = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0,100);
const emptyPackage = { slug:"", name:"", subtitle:"", description:"", price:"", currency:"EUR", cta_label:"Réserver", published:true, featured:false, sort_order:0, features:[] };
const emptyPartner = { slug:"", name:"", category:"", description:"", logo_url:"", website_url:"", email:"", phone:"", address:"", status:"active", commission_percent:"", client_discount_percent:"", published:true, featured:false, sort_order:0 };
const emptyNews = { slug:"", title:"", excerpt:"", body:"", cover_url:"", published:false, published_at:"", locale:"FR", gallery:[] };

export default function AdminContent() {
  const [tab, setTab] = useState("general");
  const [settings, setSettings] = useState({});
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const tableForTab = { packages:"packages", partners:"partners", news:"news_posts" }[tab];
  const load = async () => {
    try {
      if (tab === "general") setSettings(await getSiteSettings());
      else setRows(await listContentTable(tableForTab));
      setError("");
    } catch (e) { setError(e?.message || "Impossible de charger le contenu."); }
  };
  useEffect(() => { setForm(null); load(); }, [tab]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const saveGeneral = async (key, value, description) => {
    setSaving(true); try { await saveSiteSetting(key, value, description); await load(); flash("Contenu mis à jour."); } catch (e) { setError(e?.message || "Enregistrement impossible."); } finally { setSaving(false); }
  };

  const saveEntity = async (e) => {
    e.preventDefault(); if (!form) return; setSaving(true); setError("");
    try {
      const row = { ...form };
      if (!row.slug && (row.name || row.title)) row.slug = slugify(row.name || row.title);
      if (tab === "packages") { row.price = row.price === "" ? null : Number(row.price); row.sort_order = Number(row.sort_order || 0); }
      if (tab === "partners") { row.sort_order = Number(row.sort_order || 0); row.commission_percent = row.commission_percent === "" ? null : Number(row.commission_percent); row.client_discount_percent = row.client_discount_percent === "" ? null : Number(row.client_discount_percent); }
      if (tab === "news" && row.published && !row.published_at) row.published_at = new Date().toISOString();
      await upsertRow(tableForTab, row, "slug"); await load(); setForm(null); flash("Modification publiée dans la base.");
    } catch (e) { setError(e?.message || "Enregistrement impossible."); } finally { setSaving(false); }
  };

  const contact = settings.contact?.value || {};
  const social = settings.social_links?.value || {};
  const payment = settings.payment?.value || {};
  const brand = settings.brand?.value || {};

  return <div>
    <div className="gnz-page-heading"><div><h1>Contenu du site</h1><p>Modifier les informations publiques sans GitHub ni code.</p></div></div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
    <div className="gnz-toolbar">{[["general","Général"],["packages","Formules"],["partners","Partenaires"],["news","Actualités"]].map(([key,label]) => <button key={key} className={tab === key ? "gnz-primary-button" : "gnz-secondary-button"} onClick={() => setTab(key)}>{label}</button>)}</div>

    {tab === "general" && <div className="gnz-section-grid">
      <article className="gnz-card gnz-col-4"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Identité</strong><span>Nom et localisation</span></div></header><GeneralEditor initial={brand} fields={["name","city","theme"]} labels={{name:"Nom du site",city:"Ville",theme:"Thème"}} disabled={saving} onSave={(v) => saveGeneral("brand",v,"Identité de marque")} /></article>
      <article className="gnz-card gnz-col-4"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Contact</strong><span>Coordonnées utilisées par le site</span></div></header><GeneralEditor initial={contact} fields={["email","whatsapp","calendly"]} labels={{email:"Email",whatsapp:"WhatsApp",calendly:"Calendly"}} disabled={saving} onSave={(v) => saveGeneral("contact",v,"Coordonnées publiques")} /></article>
      <article className="gnz-card gnz-col-4"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Réseaux sociaux</strong><span>Liens publics</span></div></header><GeneralEditor initial={social} fields={["instagram","tiktok","facebook","youtube"]} labels={{instagram:"Instagram",tiktok:"TikTok",facebook:"Facebook",youtube:"YouTube"}} disabled={saving} onSave={(v) => saveGeneral("social_links",v,"Réseaux sociaux")} /></article>
      <article className="gnz-card gnz-col-4"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Liens & paiement</strong><span>Stripe et liens d'encaissement publics</span></div></header><GeneralEditor initial={payment} fields={["stripe_payment_url","payment_label"]} labels={{stripe_payment_url:"Lien de paiement Stripe",payment_label:"Texte du bouton de paiement"}} placeholders={{stripe_payment_url:"https://buy.stripe.com/...",payment_label:"Payer le lookbook"}} help="Collez un lien créé dans Stripe. Aucune clé Stripe ni donnée bancaire n'est enregistrée ici." disabled={saving} onSave={(v) => saveGeneral("payment",v,"Liens de paiement publics")} /></article>
    </div>}

    {tab !== "general" && <div className="gnz-split">
      <article className="gnz-card"><header className="gnz-card-header"><div className="gnz-card-title"><strong>{tab === "packages" ? "Formules" : tab === "partners" ? "Partenaires" : "Actualités"}</strong><span>{rows.length} élément{rows.length > 1 ? "s" : ""}</span></div><button className="gnz-primary-button" onClick={() => setForm(tab === "packages" ? emptyPackage : tab === "partners" ? emptyPartner : emptyNews)}>Ajouter</button></header><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Nom</th><th>État</th><th>Détail</th><th>Action</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id || row.slug}><td><strong>{row.name || row.title}</strong><span className="gnz-table-sub">{row.slug}</span></td><td><span className={`gnz-status ${row.published ? "success" : "warning"}`}>{row.published ? "Publié" : "Masqué"}</span></td><td>{tab === "packages" ? `${row.price ?? "—"} ${row.currency || "EUR"}` : tab === "partners" ? row.category || "—" : row.published_at ? new Date(row.published_at).toLocaleDateString("fr-FR") : "Brouillon"}</td><td><button className="gnz-secondary-button" onClick={() => setForm({ ...row, published_at: row.published_at ? new Date(row.published_at).toISOString().slice(0,16) : "" })}>Modifier</button></td></tr>) : <tr><td colSpan="4"><div className="gnz-empty-state">Aucun contenu dans cette rubrique.</div></td></tr>}</tbody></table></div></article>
      <aside className="gnz-card gnz-editor"><header className="gnz-card-header"><div className="gnz-card-title"><strong>{form ? (form.id ? "Modifier" : "Ajouter") : "Éditeur"}</strong><span>Formulaire simplifié pour l'administrateur</span></div></header><div className="gnz-card-body">{form ? <form className="gnz-editor-grid" onSubmit={saveEntity}>{tab === "packages" ? <PackageFields form={form} setForm={setForm}/> : tab === "partners" ? <PartnerFields form={form} setForm={setForm}/> : <NewsFields form={form} setForm={setForm}/>}<div className="gnz-editor-actions"><button type="button" className="gnz-secondary-button" onClick={() => setForm(null)}>Annuler</button><button className="gnz-primary-button" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button></div></form> : <div className="gnz-empty-state">Cliquez sur « Ajouter » ou « Modifier ».</div>}</div></aside>
    </div>}
    {toast && <div className="gnz-toast">{toast}</div>}
  </div>;
}

function GeneralEditor({ initial, fields, labels, placeholders = {}, help, onSave, disabled }) {
  const [value, setValue] = useState(initial || {});
  useEffect(() => setValue(initial || {}), [initial]);
  return <div className="gnz-card-body gnz-editor-grid">{fields.map((field) => <label className="gnz-field" key={field}>{labels[field] || field}<input className="gnz-input" placeholder={placeholders[field] || ""} value={value[field] || ""} onChange={(e) => setValue({ ...value, [field]: e.target.value })} /></label>)}{help && <span className="gnz-muted" style={{ fontSize: 11 }}>{help}</span>}<button className="gnz-primary-button" disabled={disabled} onClick={() => onSave(value)}>Enregistrer</button></div>;
}
function PackageFields({ form, setForm }) { return <><label className="gnz-field">Nom<input className="gnz-input" value={form.name || ""} onChange={(e) => setForm({...form,name:e.target.value})} required/></label><label className="gnz-field">Sous-titre<input className="gnz-input" value={form.subtitle || ""} onChange={(e) => setForm({...form,subtitle:e.target.value})}/></label><label className="gnz-field">Description<textarea className="gnz-textarea" value={form.description || ""} onChange={(e) => setForm({...form,description:e.target.value})}/></label><label className="gnz-field">Prix (€)<input className="gnz-input" type="number" min="0" value={form.price ?? ""} onChange={(e) => setForm({...form,price:e.target.value})}/></label><label className="gnz-field">Texte du bouton<input className="gnz-input" value={form.cta_label || ""} onChange={(e) => setForm({...form,cta_label:e.target.value})}/></label><label className="gnz-checkbox"><input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => setForm({...form,featured:e.target.checked})}/>Mettre en avant</label><label className="gnz-checkbox"><input type="checkbox" checked={Boolean(form.published)} onChange={(e) => setForm({...form,published:e.target.checked})}/>Visible sur le site</label></>; }
function PartnerFields({ form, setForm }) { return <><label className="gnz-field">Nom<input className="gnz-input" value={form.name || ""} onChange={(e) => setForm({...form,name:e.target.value})} required/></label><label className="gnz-field">Catégorie<input className="gnz-input" value={form.category || ""} onChange={(e) => setForm({...form,category:e.target.value})}/></label><label className="gnz-field">Description<textarea className="gnz-textarea" value={form.description || ""} onChange={(e) => setForm({...form,description:e.target.value})}/></label><label className="gnz-field">Logo (URL)<input className="gnz-input" value={form.logo_url || ""} onChange={(e) => setForm({...form,logo_url:e.target.value})}/></label><label className="gnz-field">Site web<input className="gnz-input" value={form.website_url || ""} onChange={(e) => setForm({...form,website_url:e.target.value})}/></label><label className="gnz-field">Email<input className="gnz-input" type="email" value={form.email || ""} onChange={(e) => setForm({...form,email:e.target.value})}/></label><label className="gnz-field">Téléphone<input className="gnz-input" value={form.phone || ""} onChange={(e) => setForm({...form,phone:e.target.value})}/></label><label className="gnz-field">Adresse<input className="gnz-input" value={form.address || ""} onChange={(e) => setForm({...form,address:e.target.value})}/></label><div className="gnz-section-grid" style={{marginTop:0}}><label className="gnz-field gnz-col-6">Commission %<input className="gnz-input" type="number" step="0.1" value={form.commission_percent ?? ""} onChange={(e) => setForm({...form,commission_percent:e.target.value})}/></label><label className="gnz-field gnz-col-6">Remise client %<input className="gnz-input" type="number" step="0.1" value={form.client_discount_percent ?? ""} onChange={(e) => setForm({...form,client_discount_percent:e.target.value})}/></label></div><label className="gnz-field">Statut<select className="gnz-select" value={form.status || "active"} onChange={(e) => setForm({...form,status:e.target.value})}><option value="active">Actif</option><option value="coming_soon">À venir</option><option value="inactive">Inactif</option></select></label><label className="gnz-checkbox"><input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => setForm({...form,featured:e.target.checked})}/>Mettre en avant</label><label className="gnz-checkbox"><input type="checkbox" checked={Boolean(form.published)} onChange={(e) => setForm({...form,published:e.target.checked})}/>Visible sur le site</label></>; }
function NewsFields({ form, setForm }) { return <><label className="gnz-field">Titre<input className="gnz-input" value={form.title || ""} onChange={(e) => setForm({...form,title:e.target.value})} required/></label><label className="gnz-field">Résumé<textarea className="gnz-textarea" value={form.excerpt || ""} onChange={(e) => setForm({...form,excerpt:e.target.value})}/></label><label className="gnz-field">Article<textarea className="gnz-textarea" style={{minHeight:180}} value={form.body || ""} onChange={(e) => setForm({...form,body:e.target.value})}/></label><label className="gnz-field">Image de couverture (URL)<input className="gnz-input" value={form.cover_url || ""} onChange={(e) => setForm({...form,cover_url:e.target.value})}/></label><label className="gnz-field">Langue<select className="gnz-select" value={form.locale || "FR"} onChange={(e) => setForm({...form,locale:e.target.value})}><option>FR</option><option>EN</option><option>ES</option><option>ZH</option></select></label><label className="gnz-checkbox"><input type="checkbox" checked={Boolean(form.published)} onChange={(e) => setForm({...form,published:e.target.checked})}/>Publier l'actualité</label></>; }
