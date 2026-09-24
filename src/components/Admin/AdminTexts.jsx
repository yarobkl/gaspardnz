import { useEffect, useMemo, useState } from "react";
import { T } from "../../translations.js";
import { deleteTranslationOverride, listTranslationOverrides, saveTranslationOverride } from "../../services/adminData.js";
import "../../styles/admin-v2.css";

const LANGS=["FR","EN","ES","ZH"];
const friendly = (key) => key.replace(/_/g," ").replace(/\b\w/g,(m)=>m.toUpperCase());

export default function AdminTexts(){
  const [locale,setLocale]=useState("FR");
  const [rows,setRows]=useState([]);
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(null);
  const [draft,setDraft]=useState("");
  const [error,setError]=useState("");
  const [saving,setSaving]=useState(false);

  const load=async()=>{
    try { setRows(await listTranslationOverrides(locale)); setError(""); }
    catch (e) { setError(e?.message || "Impossible de charger les textes."); }
  };
  useEffect(()=>{load();setSelected(null);setDraft("");},[locale]);

  const overrides=useMemo(()=>Object.fromEntries(rows.map((row)=>[row.content_key,row])),[rows]);
  const entries=useMemo(()=>Object.entries(T[locale]||T.FR).filter(([,value])=>typeof value==="string").filter(([key,value])=>{const q=search.trim().toLowerCase();return !q||key.toLowerCase().includes(q)||String(value).toLowerCase().includes(q)||String(overrides[key]?.value||"").toLowerCase().includes(q);}),[locale,search,overrides]);

  const choose=(key,original)=>{setSelected({key,original});const value=overrides[key]?.value;setDraft(typeof value==="string"?value:(value?.text||original));};
  const save=async()=>{
    if(!selected)return;setSaving(true);setError("");
    try { await saveTranslationOverride(selected.key,locale,draft); await load(); }
    catch(e){setError(e?.message||"Enregistrement impossible.");}
    setSaving(false);
  };
  const restore=async()=>{
    if(!selected)return;setSaving(true);setError("");
    try { await deleteTranslationOverride(selected.key,locale); await load(); setDraft(selected.original); }
    catch(e){setError(e?.message||"Restauration impossible.");}
    setSaving(false);
  };

  return <div>
    <div className="gnz-page-heading"><div><h1>Textes du site</h1><p>Modifier les titres, sous-titres, boutons et textes publics. Les changements publiés apparaissent automatiquement sur le site.</p></div><div className="gnz-page-actions"><select className="gnz-select" value={locale} onChange={(e)=>setLocale(e.target.value)}>{LANGS.map((lang)=><option key={lang}>{lang}</option>)}</select></div></div>
    {error&&<div className="gnz-alert gnz-alert-error">{error}</div>}
    <div className="gnz-toolbar"><input className="gnz-input" style={{maxWidth:420}} placeholder="Rechercher un texte du site…" value={search} onChange={(e)=>setSearch(e.target.value)}/><span className="gnz-muted">{entries.length} texte{entries.length>1?"s":""}</span></div>
    <div className="gnz-split">
      <article className="gnz-card"><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Zone</th><th>Texte affiché</th><th>État</th><th></th></tr></thead><tbody>{entries.slice(0,160).map(([key,original])=>{const override=overrides[key];const value=typeof override?.value==="string"?override.value:(override?.value?.text||original);return <tr key={key}><td><strong>{friendly(key)}</strong><span className="gnz-table-sub">{key}</span></td><td style={{maxWidth:520}}>{String(value).slice(0,180)}</td><td><span className={`gnz-status ${override?"success":"warning"}`}>{override?"Personnalisé":"Texte d'origine"}</span></td><td><button className="gnz-secondary-button" onClick={()=>choose(key,original)}>Modifier</button></td></tr>;})}</tbody></table></div>{entries.length>160&&<div className="gnz-empty-state">Affinez la recherche pour afficher les autres textes.</div>}</article>
      <aside className="gnz-card gnz-editor"><header className="gnz-card-header"><div className="gnz-card-title"><strong>{selected?friendly(selected.key):"Éditeur"}</strong><span>{selected?`Langue : ${locale}`:"Choisissez un texte à gauche"}</span></div></header><div className="gnz-card-body">{selected?<div className="gnz-editor-grid"><label className="gnz-field">Texte<textarea className="gnz-textarea" style={{minHeight:180}} value={draft} onChange={(e)=>setDraft(e.target.value)}/></label><div><span className="gnz-muted">Texte d'origine</span><p style={{marginTop:6,lineHeight:1.55}}>{selected.original}</p></div><div className="gnz-editor-actions"><button className="gnz-secondary-button" type="button" onClick={restore} disabled={saving}>Rétablir l'original</button><button className="gnz-primary-button" type="button" onClick={save} disabled={saving}>{saving?"Publication…":"Publier"}</button></div></div>:<div className="gnz-empty-state">Cliquez sur « Modifier » pour changer un texte.</div>}</div></aside>
    </div>
  </div>;
}
