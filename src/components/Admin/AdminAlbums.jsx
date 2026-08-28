import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient.js";
import "../../styles/admin-v2.css";

const empty = { id:null, section_key:"gallery", slug:"", title:"", description:"", published:true, sort_order:0, items:[] };
const slugify = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,100);

export default function AdminAlbums() {
  const [rows,setRows] = useState([]);
  const [form,setForm] = useState(empty);
  const [error,setError] = useState("");
  const [saving,setSaving] = useState(false);

  const load = async () => {
    const {data,error:loadError}=await supabase.from("content_albums").select("*").order("section_key").order("sort_order");
    if(loadError){setError(loadError.message);return;}
    setRows(data||[]); setError("");
  };
  useEffect(()=>{load();},[]);

  const edit = (row) => setForm({...row,items:Array.isArray(row.items)?row.items:[]});
  const reset = () => setForm(empty);
  const updateItem = (index,key,value) => setForm((current)=>({...current,items:current.items.map((item,i)=>i===index?{...item,[key]:value}:item)}));
  const move = (index,direction) => setForm((current)=>{const next=[...current.items];const target=index+direction;if(target<0||target>=next.length)return current;[next[index],next[target]]=[next[target],next[index]];return {...current,items:next};});
  const removeItem = (index) => setForm((current)=>({...current,items:current.items.filter((_,i)=>i!==index)}));

  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try{
      const payload={...form,slug:form.slug||slugify(form.title),sort_order:Number(form.sort_order||0),items:form.items.map((item)=>({src:String(item.src||"").trim(),label:String(item.label||"").trim(),width:Number(item.width||1200),height:Number(item.height||1500),...(Array.isArray(item.hotspots)?{hotspots:item.hotspots}:{})})).filter((item)=>item.src),updated_at:new Date().toISOString()};
      delete payload.id;
      const query=form.id?supabase.from("content_albums").update(payload).eq("id",form.id):supabase.from("content_albums").insert(payload);
      const {error:saveError}=await query; if(saveError) throw saveError;
      await load(); reset();
    }catch(e){setError(e?.message||"Enregistrement impossible.");}finally{setSaving(false);}
  };

  return <div>
    <div className="gnz-page-heading"><div><h1>Galerie & Showroom</h1><p>Remplacer, ajouter et réordonner les photos visibles sur le site sans toucher au code.</p></div><div className="gnz-page-actions"><button className="gnz-secondary-button" onClick={reset}>Nouvel album</button></div></div>
    {error&&<div className="gnz-alert gnz-alert-error">{error}</div>}
    <div className="gnz-split">
      <article className="gnz-card"><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Album</th><th>Rubrique</th><th>Photos</th><th>Visible</th><th></th></tr></thead><tbody>{rows.length?rows.map((row)=><tr key={row.id}><td><strong>{row.title}</strong><span className="gnz-table-sub">{row.slug}</span></td><td>{row.section_key==="gallery"?"Galerie":"Showroom"}</td><td>{Array.isArray(row.items)?row.items.length:0}</td><td><span className={`gnz-status ${row.published?"success":"warning"}`}>{row.published?"Oui":"Non"}</span></td><td><button className="gnz-secondary-button" onClick={()=>edit(row)}>Modifier</button></td></tr>):<tr><td colSpan="5"><div className="gnz-empty-state">Aucun album.</div></td></tr>}</tbody></table></div></article>
      <aside className="gnz-card gnz-editor"><header className="gnz-card-header"><div className="gnz-card-title"><strong>{form.id?"Modifier l'album":"Créer un album"}</strong><span>Chaque modification publiée est reprise automatiquement par le site.</span></div></header><form className="gnz-card-body gnz-editor-grid" onSubmit={save}>
        <label className="gnz-field">Rubrique<select className="gnz-select" value={form.section_key} onChange={(e)=>setForm({...form,section_key:e.target.value})}><option value="gallery">Galerie</option><option value="showroom">Showroom</option></select></label>
        <label className="gnz-field">Titre<input className="gnz-input" value={form.title||""} onChange={(e)=>setForm({...form,title:e.target.value})} required/></label>
        <label className="gnz-field">Description<textarea className="gnz-textarea" value={form.description||""} onChange={(e)=>setForm({...form,description:e.target.value})}/></label>
        <label className="gnz-field">Ordre<input className="gnz-input" type="number" value={form.sort_order||0} onChange={(e)=>setForm({...form,sort_order:e.target.value})}/></label>
        <label className="gnz-checkbox"><input type="checkbox" checked={Boolean(form.published)} onChange={(e)=>setForm({...form,published:e.target.checked})}/>Afficher cet album sur le site</label>
        <div style={{borderTop:"1px solid rgba(205,169,75,.16)",paddingTop:12}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:10}}><strong>Photos</strong><button type="button" className="gnz-secondary-button" onClick={()=>setForm({...form,items:[...form.items,{src:"",label:"",width:1200,height:1500}]})}>Ajouter une photo</button></div>{form.items.map((item,index)=><div key={index} style={{border:"1px solid rgba(205,169,75,.14)",padding:10,borderRadius:8,marginBottom:8}}><label className="gnz-field">Lien de la photo<input className="gnz-input" placeholder="Choisir depuis Médias & photos ou coller un lien" value={item.src||""} onChange={(e)=>updateItem(index,"src",e.target.value)}/></label><label className="gnz-field">Légende<input className="gnz-input" value={item.label||""} onChange={(e)=>updateItem(index,"label",e.target.value)}/></label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}><button type="button" className="gnz-secondary-button" onClick={()=>move(index,-1)} disabled={index===0}>Monter</button><button type="button" className="gnz-secondary-button" onClick={()=>move(index,1)} disabled={index===form.items.length-1}>Descendre</button><button type="button" className="gnz-secondary-button" onClick={()=>removeItem(index)}>Retirer</button></div></div>)}</div>
        <div className="gnz-editor-actions">{form.id&&<button type="button" className="gnz-secondary-button" onClick={reset}>Annuler</button>}<button className="gnz-primary-button" disabled={saving}>{saving?"Enregistrement…":"Publier"}</button></div>
      </form></aside>
    </div>
  </div>;
}
