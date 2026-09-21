import { useEffect, useState } from "react";
import { getSiteSettings, listContentTable, saveSiteSetting, setPublished, uploadMedia, upsertRow } from "../../services/adminData.js";
import { scrollToAdminEditor } from "./scrollToEditor.js";
import MediaUploadField from "./MediaUploadField.jsx";
import AdminFormulesPricing from "./AdminFormulesPricing.jsx";
import PartnerPhotosManager from "./PartnerPhotosManager.jsx";
import "../../styles/admin-v2.css";

const slugify = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0,100);
const emptyPartner = { slug:"", name:"", category:"", description:"", logo_url:"", website_url:"", email:"", phone:"", address:"", status:"active", commission_percent:"", client_discount_percent:"", published:true, featured:false, sort_order:0 };
// Liste de départ : les catégories déjà utilisées sur le site. Elle s'enrichit
// ensuite toute seule avec celles que Gaspard tape via « + Ajouter une nouvelle
// catégorie » — dès qu'un partenaire l'utilise, elle réapparaît dans la liste.
const DEFAULT_PARTNER_CATEGORIES = ["Lieu Événement","Wedding Planner","Location Voiture Marié","Service Traiteur","DJ / Musique","Photographe","Fleuriste / Décoration","Décorateur","Coiffure & Maquillage","Animation / Divertissement","Pâtissier / Gâteau"];
const NEW_CATEGORY_OPTION = "__nouvelle_categorie__";
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
      // "Formules" a son propre écran (AdminFormulesPricing) avec son propre
      // chargement imbriqué (menus + articles) : pas besoin de la table plate ici.
      else if (tab !== "packages") setRows(await listContentTable(tableForTab));
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
      if (tab === "partners") { row.sort_order = Number(row.sort_order || 0); row.commission_percent = row.commission_percent === "" ? null : Number(row.commission_percent); row.client_discount_percent = row.client_discount_percent === "" ? null : Number(row.client_discount_percent); }
      if (tab === "news" && row.published && !row.published_at) row.published_at = new Date().toISOString();
      await upsertRow(tableForTab, row, "slug"); await load(); setForm(null); flash("Modification publiée dans la base.");
    } catch (e) { setError(e?.message || "Enregistrement impossible."); } finally { setSaving(false); }
  };

  const toggle = async (row) => {
    try { await setPublished(tableForTab, row.id, !row.published); await load(); flash(row.published ? "Masqué du site." : "Remis en ligne."); }
    catch (e) { setError(e?.message || "Impossible de changer la visibilité."); }
  };
  const openForm = (row) => { setForm(row); scrollToAdminEditor(); };

  const partnerCategories = tab === "partners"
    ? Array.from(new Set([...DEFAULT_PARTNER_CATEGORIES, ...rows.map((r) => r.category).filter(Boolean)])).sort((a, b) => a.localeCompare(b, "fr"))
    : [];

  const contact = settings.contact?.value || {};
  const social = settings.social_links?.value || {};
  const payment = settings.payment?.value || {};
  const brand = settings.brand?.value || {};
  const lookbook = settings.lookbook?.value || {};

  return <div>
    <div className="gnz-page-heading"><div><h1>Contenu du site</h1><p>Modifier les informations publiques sans GitHub ni code.</p></div></div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
    <div className="gnz-toolbar">{[["general","Général"],["packages","Formules"],["partners","Partenaires"],["news","Actualités"]].map(([key,label]) => <button key={key} className={tab === key ? "gnz-primary-button" : "gnz-secondary-button"} onClick={() => setTab(key)}>{label}</button>)}</div>

    {tab === "general" && <div className="gnz-section-grid">
      <article className="gnz-card gnz-col-4"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Identité</strong><span>Nom et localisation</span></div></header><GeneralEditor initial={brand} fields={["name","city","theme"]} labels={{name:"Nom du site",city:"Ville",theme:"Thème"}} disabled={saving} onSave={(v) => saveGeneral("brand",v,"Identité de marque")} /></article>
      <article className="gnz-card gnz-col-4"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Contact</strong><span>Coordonnées utilisées par le site</span></div></header><GeneralEditor initial={contact} fields={["email","whatsapp","calendly"]} labels={{email:"Email",whatsapp:"WhatsApp",calendly:"Calendly"}} disabled={saving} onSave={(v) => saveGeneral("contact",v,"Coordonnées publiques")} /></article>
      <article className="gnz-card gnz-col-4"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Réseaux sociaux</strong><span>Liens publics</span></div></header><GeneralEditor initial={social} fields={["instagram","tiktok","facebook","youtube","whatsapp_community"]} labels={{instagram:"Instagram",tiktok:"TikTok",facebook:"Facebook",youtube:"YouTube",whatsapp_community:"Groupe WhatsApp (communauté)"}} placeholders={{whatsapp_community:"https://chat.whatsapp.com/..."}} help="Le lien d'invitation de votre groupe WhatsApp, pas votre numéro de contact (déjà utilisé ailleurs sur le site). Laissez vide pour garder le lien de groupe déjà utilisé par la rubrique Communauté." disabled={saving} onSave={(v) => saveGeneral("social_links",v,"Réseaux sociaux")} /></article>
      <article className="gnz-card gnz-col-4"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Liens & paiement</strong><span>Stripe et liens d'encaissement publics</span></div></header><GeneralEditor initial={payment} fields={["stripe_payment_url","payment_label","lookbook_hidden_message"]} checkboxFields={["lookbook_hidden"]} labels={{stripe_payment_url:"Lien de paiement Stripe",payment_label:"Texte du bouton de paiement",lookbook_hidden_message:"Message affiché si masqué",lookbook_hidden:"Masquer le bouton du lookbook (le lien Stripe reste enregistré, rien n'est perdu)"}} placeholders={{stripe_payment_url:"https://buy.stripe.com/...",payment_label:"Payer le lookbook",lookbook_hidden_message:"Bientôt disponible"}} help="Collez un lien créé dans Stripe. Aucune clé Stripe ni donnée bancaire n'est enregistrée ici. Cochez la case pour retirer temporairement le bouton d'achat sans effacer le lien." disabled={saving} onSave={(v) => saveGeneral("payment",v,"Liens de paiement publics")} /></article>
      <article className="gnz-card gnz-col-4"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Fichier du lookbook</strong><span>Le PDF envoyé au client après achat</span></div></header><LookbookFileEditor lookbook={lookbook} onSaved={load} /></article>
    </div>}

    {tab === "packages" && <AdminFormulesPricing />}

    {tab !== "general" && tab !== "packages" && <div className="gnz-split">
      <article className="gnz-card"><header className="gnz-card-header"><div className="gnz-card-title"><strong>{tab === "partners" ? "Partenaires" : "Actualités"}</strong><span>{rows.length} élément{rows.length > 1 ? "s" : ""}</span></div><button className="gnz-primary-button" onClick={() => openForm(tab === "partners" ? emptyPartner : emptyNews)}>Ajouter</button></header><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Nom</th><th>État</th><th>Détail</th><th>Action</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id || row.slug}><td><strong>{row.name || row.title}</strong><span className="gnz-table-sub">{row.slug}</span></td><td><span className={`gnz-status ${row.published ? "success" : "warning"}`}>{row.published ? "Publié" : "Masqué"}</span></td><td>{tab === "partners" ? row.category || "—" : row.published_at ? new Date(row.published_at).toLocaleDateString("fr-FR") : "Brouillon"}</td><td><div className="gnz-page-actions"><button className="gnz-secondary-button" onClick={() => openForm({ ...row, published_at: row.published_at ? new Date(row.published_at).toISOString().slice(0,16) : "" })}>Modifier</button><button className={`gnz-secondary-button gnz-toggle-button${row.published ? "" : " is-hidden"}`} onClick={() => toggle(row)}>{row.published ? "Masquer" : "Afficher"}</button></div></td></tr>) : <tr><td colSpan="4"><div className="gnz-empty-state">Aucun contenu dans cette rubrique.</div></td></tr>}</tbody></table></div></article>
      <aside className="gnz-card gnz-editor" id="gnz-admin-editor"><header className="gnz-card-header"><div className="gnz-card-title"><strong>{form ? (form.id ? "Modifier" : "Ajouter") : "Éditeur"}</strong><span>Formulaire simplifié pour l'administrateur</span></div></header><div className="gnz-card-body">{form ? <form className="gnz-editor-grid" onSubmit={saveEntity}>{tab === "partners" ? <PartnerFields key={form.id || "new"} form={form} setForm={setForm} categories={partnerCategories}/> : <NewsFields form={form} setForm={setForm}/>}<div className="gnz-editor-actions"><button type="button" className="gnz-secondary-button" onClick={() => setForm(null)}>Annuler</button><button className="gnz-primary-button" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button></div></form> : <div className="gnz-empty-state">Cliquez sur « Ajouter » ou « Modifier ».</div>}</div></aside>
    </div>}
    {toast && <div className="gnz-toast">{toast}</div>}
  </div>;
}

// Le PDF vendu depuis le site : stocké comme un média (Supabase Storage),
// pointé par site_settings.lookbook. Remplacer dépose un NOUVEAU fichier et ne
// touche pas à l'ancien : rien n'est supprimé, l'historique reste consultable
// dans « Médias & photos ». C'est ce pointeur que lira l'envoi automatique par
// email après paiement Stripe, une fois cette pièce branchée.
function LookbookFileEditor({ lookbook, onSaved }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Le fichier doit être un PDF."); return; }
    setBusy(true); setError("");
    try {
      const asset = await uploadMedia(file, "lookbook", { title: file.name, published: true });
      await saveSiteSetting("lookbook", {
        pdf_url: asset.public_url,
        pdf_filename: file.name,
        updated_at: new Date().toISOString(),
      }, "Fichier du lookbook envoyé au client après achat");
      await onSaved();
    } catch (e) { setError(e?.message || "Import impossible."); }
    finally { setBusy(false); }
  };

  return <div className="gnz-card-body gnz-editor-grid">
    {lookbook.pdf_url
      ? <div className="gnz-field">
          <span>Fichier actuel</span>
          <span className="gnz-table-sub">{lookbook.pdf_filename || "lookbook.pdf"}{lookbook.updated_at ? ` · déposé le ${new Date(lookbook.updated_at).toLocaleDateString("fr-FR")}` : ""}</span>
          <a className="gnz-text-button" href={lookbook.pdf_url} target="_blank" rel="noreferrer" style={{ margin: "6px 0 0", display: "inline-block" }}>Voir le fichier actuel →</a>
        </div>
      : <span className="gnz-muted" style={{ fontSize: 11 }}>Aucun fichier déposé pour l'instant. Le client ne recevra rien tant qu'un PDF n'est pas importé ici.</span>}
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
    <label className="gnz-primary-button" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: busy ? "wait" : "pointer" }}>
      {busy ? "Import en cours…" : lookbook.pdf_url ? "Remplacer le fichier" : "Déposer le PDF du lookbook"}
      <input type="file" accept="application/pdf" hidden disabled={busy} onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
    </label>
    <span className="gnz-muted" style={{ fontSize: 10 }}>PDF uniquement, 15 Mo maximum. L'ancien fichier reste dans « Médias & photos » : rien n'est supprimé.</span>
  </div>;
}

function GeneralEditor({ initial, fields, labels, placeholders = {}, help, onSave, disabled, checkboxFields = [] }) {
  const [value, setValue] = useState(initial || {});
  useEffect(() => setValue(initial || {}), [initial]);
  return <div className="gnz-card-body gnz-editor-grid">
    {fields.map((field) => <label className="gnz-field" key={field}>{labels[field] || field}<input className="gnz-input" placeholder={placeholders[field] || ""} value={value[field] || ""} onChange={(e) => setValue({ ...value, [field]: e.target.value })} /></label>)}
    {checkboxFields.map((field) => <label className="gnz-checkbox" key={field}><input type="checkbox" checked={Boolean(value[field])} onChange={(e) => setValue({ ...value, [field]: e.target.checked })} />{labels[field] || field}</label>)}
    {help && <span className="gnz-muted" style={{ fontSize: 11 }}>{help}</span>}
    <button className="gnz-primary-button" disabled={disabled} onClick={() => onSave(value)}>Enregistrer</button>
  </div>;
}
export function PartnerFields({ form, setForm, categories = [] }) {
  // Une catégorie déjà enregistrée mais absente de la liste (tapée à la main
  // avant l'existence de ce menu) ne doit jamais être effacée au premier
  // affichage : on démarre en saisie libre dans ce cas précis.
  const [customCategory, setCustomCategory] = useState(Boolean(form.category) && !categories.includes(form.category));
  return <><label className="gnz-field">Nom<input className="gnz-input" value={form.name || ""} onChange={(e) => setForm({...form,name:e.target.value})} required/></label>
        <label className="gnz-field">Catégorie
          {customCategory ? <>
            <input className="gnz-input" placeholder="Nouvelle catégorie" value={form.category || ""} onChange={(e) => setForm({...form,category:e.target.value})} autoFocus/>
            {categories.length > 0 && <button type="button" className="gnz-text-button" style={{margin:"6px 0 0"}} onClick={() => setCustomCategory(false)}>Choisir dans la liste existante</button>}
          </> : <select className="gnz-select" value={form.category || ""} onChange={(e) => { if (e.target.value === NEW_CATEGORY_OPTION) { setCustomCategory(true); setForm({...form,category:""}); } else setForm({...form,category:e.target.value}); }}>
            <option value="" disabled>Choisir une catégorie</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            <option value={NEW_CATEGORY_OPTION}>+ Ajouter une nouvelle catégorie…</option>
          </select>}
        </label>
        <label className="gnz-field">Description<textarea className="gnz-textarea" value={form.description || ""} onChange={(e) => setForm({...form,description:e.target.value})}/></label><MediaUploadField label="Logo" value={form.logo_url} onChange={(url) => setForm({...form,logo_url:url})} uploadSection="partners" />{form.id && <PartnerPhotosManager partnerId={form.id} partnerName={form.name} />}<label className="gnz-field">Site web<input className="gnz-input" value={form.website_url || ""} onChange={(e) => setForm({...form,website_url:e.target.value})}/></label><label className="gnz-field">Email<input className="gnz-input" type="email" value={form.email || ""} onChange={(e) => setForm({...form,email:e.target.value})}/></label><label className="gnz-field">Téléphone<input className="gnz-input" value={form.phone || ""} onChange={(e) => setForm({...form,phone:e.target.value})}/></label><label className="gnz-field">Adresse<input className="gnz-input" value={form.address || ""} onChange={(e) => setForm({...form,address:e.target.value})}/></label><div className="gnz-section-grid" style={{marginTop:0}}><label className="gnz-field gnz-col-6">Commission %<input className="gnz-input" type="number" step="0.1" value={form.commission_percent ?? ""} onChange={(e) => setForm({...form,commission_percent:e.target.value})}/></label><label className="gnz-field gnz-col-6">Remise client %<input className="gnz-input" type="number" step="0.1" value={form.client_discount_percent ?? ""} onChange={(e) => setForm({...form,client_discount_percent:e.target.value})}/></label></div><label className="gnz-field">Statut<select className="gnz-select" value={form.status || "active"} onChange={(e) => setForm({...form,status:e.target.value})}><option value="active">Actif</option><option value="coming_soon">À venir</option><option value="inactive">Inactif</option></select></label><label className="gnz-checkbox"><input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => setForm({...form,featured:e.target.checked})}/>Mettre en avant</label><label className="gnz-checkbox"><input type="checkbox" checked={Boolean(form.published)} onChange={(e) => setForm({...form,published:e.target.checked})}/>Visible sur le site</label></>; }
function NewsFields({ form, setForm }) { return <><label className="gnz-field">Titre<input className="gnz-input" value={form.title || ""} onChange={(e) => setForm({...form,title:e.target.value})} required/></label><label className="gnz-field">Résumé<textarea className="gnz-textarea" value={form.excerpt || ""} onChange={(e) => setForm({...form,excerpt:e.target.value})}/></label><label className="gnz-field">Article<textarea className="gnz-textarea" style={{minHeight:180}} value={form.body || ""} onChange={(e) => setForm({...form,body:e.target.value})}/></label><label className="gnz-field">Image de couverture (URL)<input className="gnz-input" value={form.cover_url || ""} onChange={(e) => setForm({...form,cover_url:e.target.value})}/></label><label className="gnz-field">Langue<select className="gnz-select" value={form.locale || "FR"} onChange={(e) => setForm({...form,locale:e.target.value})}><option>FR</option><option>EN</option><option>ES</option><option>ZH</option></select></label><label className="gnz-checkbox"><input type="checkbox" checked={Boolean(form.published)} onChange={(e) => setForm({...form,published:e.target.checked})}/>Publier l'actualité</label></>; }
